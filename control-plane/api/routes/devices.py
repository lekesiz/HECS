"""
Device management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime
import uuid

from database import get_db
from models.user import User
from models.device import Device
from schemas import DeviceCreate, DeviceUpdate, DeviceResponse
from routes.auth import get_current_active_user

router = APIRouter(prefix="/devices", tags=["Devices"])


@router.get("", response_model=List[DeviceResponse])
async def list_devices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: str = Query(None),
    customer_id: uuid.UUID = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all devices with optional filtering"""
    query = select(Device)

    # Apply filters
    if status:
        query = query.where(Device.status == status)
    if customer_id:
        query = query.where(Device.customer_id == customer_id)

    # Apply pagination
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    devices = result.scalars().all()

    return devices


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific device by ID"""
    result = await db.execute(
        select(Device).where(Device.id == device_id)
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID {device_id} not found"
        )

    return device


@router.post("", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def create_device(
    device_data: DeviceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new device"""
    # Check if device_id already exists
    result = await db.execute(
        select(Device).where(Device.device_id == device_data.device_id)
    )
    existing_device = result.scalar_one_or_none()

    if existing_device:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Device with device_id '{device_data.device_id}' already exists"
        )

    # Create new device
    new_device = Device(
        name=device_data.name,
        device_id=device_data.device_id,
        customer_id=device_data.customer_id,
        hardware_id=device_data.hardware_id,
        ip_address=device_data.ip_address,
        mac_address=device_data.mac_address,
        status='offline',
    )

    db.add(new_device)
    await db.commit()
    await db.refresh(new_device)

    return new_device


@router.put("/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: uuid.UUID,
    device_data: DeviceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a device"""
    result = await db.execute(
        select(Device).where(Device.id == device_id)
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID {device_id} not found"
        )

    # Update fields
    if device_data.name is not None:
        device.name = device_data.name
    if device_data.status is not None:
        device.status = device_data.status
    if device_data.ip_address is not None:
        device.ip_address = device_data.ip_address
    if device_data.firmware_version is not None:
        device.firmware_version = device_data.firmware_version
    if device_data.metadata is not None:
        device.metadata = device_data.metadata

    device.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(device)

    return device


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    device_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a device"""
    result = await db.execute(
        select(Device).where(Device.id == device_id)
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID {device_id} not found"
        )

    await db.delete(device)
    await db.commit()

    return None


@router.post("/{device_id}/heartbeat", response_model=DeviceResponse)
async def device_heartbeat(
    device_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Update device last_seen timestamp (heartbeat)"""
    result = await db.execute(
        select(Device).where(Device.id == device_id)
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID {device_id} not found"
        )

    device.last_seen = datetime.utcnow()
    device.status = 'online'

    await db.commit()
    await db.refresh(device)

    return device


@router.get("/stats/summary")
async def get_devices_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get device statistics summary"""
    # Total devices
    total_result = await db.execute(select(func.count(Device.id)))
    total_devices = total_result.scalar()

    # Online devices
    online_result = await db.execute(
        select(func.count(Device.id)).where(Device.status == 'online')
    )
    online_devices = online_result.scalar()

    # Offline devices
    offline_result = await db.execute(
        select(func.count(Device.id)).where(Device.status == 'offline')
    )
    offline_devices = offline_result.scalar()

    return {
        "total_devices": total_devices,
        "online_devices": online_devices,
        "offline_devices": offline_devices,
        "online_percentage": (online_devices / total_devices * 100) if total_devices > 0 else 0
    }
