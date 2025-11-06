"""
Customer routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID

from database import get_db
from models.device import Customer
from schemas import CustomerCreate, CustomerUpdate, CustomerResponse
from utils.security import get_current_user
from models.user import User
from utils.websocket import manager

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=List[CustomerResponse])
async def list_customers(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all customers"""
    query = select(Customer)

    if is_active is not None:
        query = query.where(Customer.is_active == is_active)

    query = query.offset(skip).limit(limit).order_by(Customer.created_at.desc())
    result = await db.execute(query)
    customers = result.scalars().all()

    return [customer.to_dict() for customer in customers]


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get customer by ID"""
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer.to_dict()


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new customer"""
    # Check if email already exists
    if customer_data.email:
        result = await db.execute(
            select(Customer).where(Customer.email == customer_data.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=400, detail="Customer with this email already exists"
            )

    customer = Customer(**customer_data.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)

    # Broadcast customer creation to WebSocket clients
    await manager.broadcast_customer_update({
        "id": str(customer.id),
        "name": customer.name,
        "company": customer.company,
        "email": customer.email,
        "is_active": customer.is_active,
        "subscription_tier": customer.subscription_tier,
        "action": "created"
    })

    return customer.to_dict()


@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: UUID,
    customer_data: CustomerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a customer"""
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Check email uniqueness if email is being updated
    if customer_data.email and customer_data.email != customer.email:
        result = await db.execute(
            select(Customer).where(Customer.email == customer_data.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=400, detail="Customer with this email already exists"
            )

    # Update fields
    for field, value in customer_data.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)

    await db.commit()
    await db.refresh(customer)

    # Broadcast customer update to WebSocket clients
    await manager.broadcast_customer_update({
        "id": str(customer.id),
        "name": customer.name,
        "company": customer.company,
        "email": customer.email,
        "is_active": customer.is_active,
        "subscription_tier": customer.subscription_tier,
        "action": "updated"
    })

    return customer.to_dict()


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a customer"""
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Broadcast customer deletion before removing from database
    await manager.broadcast_customer_update({
        "id": str(customer.id),
        "name": customer.name,
        "action": "deleted"
    })

    await db.delete(customer)
    await db.commit()

    return None


@router.get("/stats/summary")
async def get_customer_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get customer statistics"""
    # Total customers
    total_result = await db.execute(select(func.count(Customer.id)))
    total_customers = total_result.scalar()

    # Active customers
    active_result = await db.execute(
        select(func.count(Customer.id)).where(Customer.is_active == True)
    )
    active_customers = active_result.scalar()

    # Inactive customers
    inactive_customers = total_customers - active_customers

    return {
        "total_customers": total_customers,
        "active_customers": active_customers,
        "inactive_customers": inactive_customers,
    }
