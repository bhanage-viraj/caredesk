from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentPriority, AppointmentStatus
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentRead,
    AppointmentStats,
    AppointmentUpdate,
)

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.get("", response_model=list[AppointmentRead])
def list_appointments(
    status_filter: AppointmentStatus | None = Query(default=None, alias="status"),
    priority: AppointmentPriority | None = None,
    db: Session = Depends(get_db),
) -> list[Appointment]:
    stmt = select(Appointment).order_by(Appointment.scheduled_at.desc())
    if status_filter is not None:
        stmt = stmt.where(Appointment.status == status_filter.value)
    if priority is not None:
        stmt = stmt.where(Appointment.priority == priority.value)
    return list(db.scalars(stmt).all())


@router.get("/stats", response_model=AppointmentStats)
def appointment_stats(db: Session = Depends(get_db)) -> AppointmentStats:
    row = db.execute(
        select(
            func.count(Appointment.id),
            func.coalesce(
                func.sum(case((Appointment.status == AppointmentStatus.SCHEDULED.value, 1), else_=0)),
                0,
            ),
            func.coalesce(
                func.sum(case((Appointment.status == AppointmentStatus.CHECKED_IN.value, 1), else_=0)),
                0,
            ),
            func.coalesce(
                func.sum(case((Appointment.status == AppointmentStatus.IN_PROGRESS.value, 1), else_=0)),
                0,
            ),
            func.coalesce(
                func.sum(case((Appointment.status == AppointmentStatus.COMPLETED.value, 1), else_=0)),
                0,
            ),
            func.coalesce(
                func.sum(case((Appointment.status == AppointmentStatus.CANCELLED.value, 1), else_=0)),
                0,
            ),
            func.coalesce(
                func.sum(
                    case(
                        (
                            Appointment.priority.in_(
                                [
                                    AppointmentPriority.URGENT.value,
                                    AppointmentPriority.EMERGENCY.value,
                                ]
                            ),
                            1,
                        ),
                        else_=0,
                    )
                ),
                0,
            ),
        )
    ).one()

    return AppointmentStats(
        total=int(row[0] or 0),
        scheduled=int(row[1] or 0),
        checked_in=int(row[2] or 0),
        in_progress=int(row[3] or 0),
        completed=int(row[4] or 0),
        cancelled=int(row[5] or 0),
        urgent_or_emergency=int(row[6] or 0),
    )


@router.get("/{appointment_id}", response_model=AppointmentRead)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)) -> Appointment:
    appointment = db.get(Appointment, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appointment


@router.post("", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate, db: Session = Depends(get_db)
) -> Appointment:
    appointment = Appointment(
        patient_name=payload.patient_name,
        doctor_name=payload.doctor_name,
        reason=payload.reason,
        status=payload.status.value,
        priority=payload.priority.value,
        scheduled_at=payload.scheduled_at,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentRead)
def update_appointment(
    appointment_id: int, payload: AppointmentUpdate, db: Session = Depends(get_db)
) -> Appointment:
    appointment = db.get(Appointment, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] is not None:
        data["status"] = data["status"].value
    if "priority" in data and data["priority"] is not None:
        data["priority"] = data["priority"].value

    for field, value in data.items():
        setattr(appointment, field, value)

    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)) -> None:
    appointment = db.get(Appointment, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    db.delete(appointment)
    db.commit()
