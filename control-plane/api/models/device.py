"""
Device model
"""
from sqlalchemy import Column, String, DateTime, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID, INET, MACADDR, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from database import Base


class Device(Base):
    """Device model for edge nodes (Raspberry Pi)"""

    __tablename__ = "devices"
    __table_args__ = {'schema': 'hecs'}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    device_id = Column(String(100), unique=True, nullable=False, index=True)
    hardware_id = Column(String(255), unique=True)
    customer_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    status = Column(String(50), default='offline', index=True)
    ip_address = Column(INET)
    mac_address = Column(MACADDR)
    firmware_version = Column(String(50))

    last_seen = Column(DateTime(timezone=True))
    metadata = Column(JSONB, default={})

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Device {self.device_id} ({self.status})>"

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "name": self.name,
            "device_id": self.device_id,
            "hardware_id": self.hardware_id,
            "customer_id": str(self.customer_id),
            "status": self.status,
            "ip_address": str(self.ip_address) if self.ip_address else None,
            "mac_address": str(self.mac_address) if self.mac_address else None,
            "firmware_version": self.firmware_version,
            "last_seen": self.last_seen.isoformat() if self.last_seen else None,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Customer(Base):
    """Customer model"""

    __tablename__ = "customers"
    __table_args__ = {'schema': 'hecs'}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    company = Column(String(255))
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(50))
    address = Column(String)

    haguenau_customer_id = Column(String(100))
    subscription_tier = Column(String(50), default='basic')
    is_active = Column(Boolean, default=True)

    metadata = Column(JSONB, default={})

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Customer {self.name}>"

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "name": self.name,
            "company": self.company,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "haguenau_customer_id": self.haguenau_customer_id,
            "subscription_tier": self.subscription_tier,
            "is_active": self.is_active,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
