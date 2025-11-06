"""
Task management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime
import uuid

from database import get_db
from models.user import User
from models.task import Task
from schemas import TaskCreate, TaskUpdate, TaskResponse
from routes.auth import get_current_active_user
from utils.websocket import manager

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: str = Query(None),
    device_id: uuid.UUID = Query(None),
    task_type: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all tasks with optional filtering"""
    query = select(Task)

    # Apply filters
    if status:
        query = query.where(Task.status == status)
    if device_id:
        query = query.where(Task.device_id == device_id)
    if task_type:
        query = query.where(Task.task_type == task_type)

    # Order by created_at descending
    query = query.order_by(Task.created_at.desc())

    # Apply pagination
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    tasks = result.scalars().all()

    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific task by ID"""
    result = await db.execute(
        select(Task).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )

    return task


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new task"""
    # Create new task
    new_task = Task(
        name=task_data.name,
        task_type=task_data.task_type,
        device_id=task_data.device_id,
        payload=task_data.payload,
        scheduled_at=task_data.scheduled_at or datetime.utcnow(),
        status='pending',
    )

    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)

    # Broadcast task creation to WebSocket clients
    await manager.broadcast_task_update({
        "id": str(new_task.id),
        "name": new_task.name,
        "task_type": new_task.task_type,
        "status": new_task.status,
        "device_id": str(new_task.device_id),
        "action": "created"
    })

    return new_task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    task_data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a task"""
    result = await db.execute(
        select(Task).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )

    # Update fields
    if task_data.status is not None:
        task.status = task_data.status

        # Update timestamps based on status
        if task_data.status == 'running' and not task.started_at:
            task.started_at = datetime.utcnow()
        elif task_data.status in ['completed', 'failed']:
            task.completed_at = datetime.utcnow()

    if task_data.result is not None:
        task.result = task_data.result

    if task_data.error_message is not None:
        task.error_message = task_data.error_message

    task.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(task)

    # Broadcast task update to WebSocket clients
    await manager.broadcast_task_update({
        "id": str(task.id),
        "name": task.name,
        "task_type": task.task_type,
        "status": task.status,
        "device_id": str(task.device_id),
        "started_at": task.started_at.isoformat() if task.started_at else None,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "action": "updated"
    })

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a task"""
    result = await db.execute(
        select(Task).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )

    # Broadcast task deletion before removing from database
    await manager.broadcast_task_update({
        "id": str(task.id),
        "name": task.name,
        "task_type": task.task_type,
        "device_id": str(task.device_id),
        "action": "deleted"
    })

    await db.delete(task)
    await db.commit()

    return None


@router.post("/{task_id}/retry", response_model=TaskResponse)
async def retry_task(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retry a failed task"""
    result = await db.execute(
        select(Task).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )

    if task.retry_count >= task.max_retries:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Task has reached maximum retry limit ({task.max_retries})"
        )

    # Reset task for retry
    task.status = 'pending'
    task.retry_count += 1
    task.started_at = None
    task.completed_at = None
    task.error_message = None
    task.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(task)

    # Broadcast task retry to WebSocket clients
    await manager.broadcast_task_update({
        "id": str(task.id),
        "name": task.name,
        "task_type": task.task_type,
        "status": task.status,
        "device_id": str(task.device_id),
        "retry_count": task.retry_count,
        "action": "retried"
    })

    return task


@router.get("/stats/summary")
async def get_tasks_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get task statistics summary"""
    # Total tasks
    total_result = await db.execute(select(func.count(Task.id)))
    total_tasks = total_result.scalar()

    # Pending tasks
    pending_result = await db.execute(
        select(func.count(Task.id)).where(Task.status == 'pending')
    )
    pending_tasks = pending_result.scalar()

    # Running tasks
    running_result = await db.execute(
        select(func.count(Task.id)).where(Task.status == 'running')
    )
    running_tasks = running_result.scalar()

    # Completed tasks
    completed_result = await db.execute(
        select(func.count(Task.id)).where(Task.status == 'completed')
    )
    completed_tasks = completed_result.scalar()

    # Failed tasks
    failed_result = await db.execute(
        select(func.count(Task.id)).where(Task.status == 'failed')
    )
    failed_tasks = failed_result.scalar()

    return {
        "total_tasks": total_tasks,
        "pending_tasks": pending_tasks,
        "running_tasks": running_tasks,
        "completed_tasks": completed_tasks,
        "failed_tasks": failed_tasks,
        "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    }
