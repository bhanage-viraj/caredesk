from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.appointment import AppointmentPriority, AppointmentStatus


class AppointmentBase(BaseModel):
    patient_name: str = Field(min_length=1, max_length=120)
    doctor_name: str = Field(min_length=1, max_length=120)
    reason: str = Field(min_length=1, max_length=2000)
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
    priority: AppointmentPriority = AppointmentPriority.ROUTINE
    scheduled_at: datetime


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    patient_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    doctor_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    reason: Optional[str] = Field(default=None, min_length=1, max_length=2000)
    status: Optional[AppointmentStatus] = None
    priority: Optional[AppointmentPriority] = None
    scheduled_at: Optional[datetime] = None


class AppointmentRead(AppointmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AppointmentStats(BaseModel):
    total: int
    scheduled: int
    checked_in: int
    in_progress: int
    completed: int
    cancelled: int
    urgent_or_emergency: int
