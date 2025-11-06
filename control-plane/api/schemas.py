"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: uuid.UUID
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


# Device schemas
class DeviceBase(BaseModel):
    name: str
    device_id: str
    customer_id: uuid.UUID


class DeviceCreate(DeviceBase):
    hardware_id: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None


class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    ip_address: Optional[str] = None
    firmware_version: Optional[str] = None
    metadata: Optional[dict] = None


class DeviceResponse(DeviceBase):
    id: uuid.UUID
    hardware_id: Optional[str] = None
    status: str
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    firmware_version: Optional[str] = None
    last_seen: Optional[datetime] = None
    metadata: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Task schemas
class TaskBase(BaseModel):
    name: str
    task_type: str
    device_id: uuid.UUID


class TaskCreate(TaskBase):
    payload: Optional[dict] = {}
    scheduled_at: Optional[datetime] = None


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    result: Optional[dict] = None
    error_message: Optional[str] = None


class TaskResponse(TaskBase):
    id: uuid.UUID
    status: str
    payload: dict
    result: Optional[dict] = None
    scheduled_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    retry_count: int
    max_retries: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Customer schemas
class CustomerBase(BaseModel):
    name: str
    company: Optional[str] = None
    email: Optional[EmailStr] = None


class CustomerCreate(CustomerBase):
    phone: Optional[str] = None
    address: Optional[str] = None
    haguenau_customer_id: Optional[str] = None


class CustomerResponse(CustomerBase):
    id: uuid.UUID
    phone: Optional[str] = None
    address: Optional[str] = None
    haguenau_customer_id: Optional[str] = None
    subscription_tier: str
    is_active: bool
    metadata: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
