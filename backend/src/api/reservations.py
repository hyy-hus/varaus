import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, status, Depends, HTTPException
from sqlmodel import Session, select
from psycopg.types.range import Range

from core.database import get_session
from models.reservation import (
    Reservation,
    ReservationRead,
    ReservationCreate,
    ReservationUpdate,
    Occurrence,
    OccurrenceRead,
    OccurrenceCreate,
)

router = APIRouter()


def map_occurrence_to_read(occ: Occurrence) -> OccurrenceRead:
    return OccurrenceRead(
        id=occ.id,
        reservation_id=occ.reservation_id,
        resource_id=occ.resource_id,
        start_time=occ.time_range.lower,
        end_time=occ.time_range.upper,
    )


# ==========================================
# RESERVATION ROUTES
# ==========================================


@router.post(
    "/reservations/",
    response_model=ReservationRead,
    status_code=status.HTTP_201_CREATED,
)
def create_reservation(
    *, session: Session = Depends(get_session), reservation_in: ReservationCreate
):
    db_reservation = Reservation.model_validate(reservation_in)
    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation)
    return db_reservation


@router.get("/reservations/", response_model=list[ReservationRead])
def read_reservations(
    *, session: Session = Depends(get_session), offset: int = 0, limit: int = 100
):
    statement = (
        select(Reservation)
        .where(Reservation.deleted_at is None)
        .offset(offset)
        .limit(limit)
    )
    return session.exec(statement).all()


@router.get("/reservations/{reservation_id}", response_model=ReservationRead)
def read_reservation(
    *, session: Session = Depends(get_session), reservation_id: uuid.UUID
):
    reservation = session.get(Reservation, reservation_id)
    if not reservation or reservation.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found"
        )
    return reservation


@router.patch("/reservations/{reservation_id}", response_model=ReservationRead)
def update_reservation(
    *,
    session: Session = Depends(get_session),
    reservation_id: uuid.UUID,
    reservation_in: ReservationUpdate,
):
    db_reservation = session.get(Reservation, reservation_id)
    if not db_reservation or db_reservation.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found"
        )

    update_data = reservation_in.model_dump(exclude_unset=True)
    db_reservation.sqlmodel_update(update_data)

    session.add(db_reservation)
    session.commit()
    session.refresh(db_reservation)
    return db_reservation


@router.delete("/reservations/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reservation(
    *, session: Session = Depends(get_session), reservation_id: uuid.UUID
):
    reservation = session.get(Reservation, reservation_id)
    if not reservation or reservation.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found"
        )

    # SOFT DELETE: Set the timestamp instead of session.delete()
    reservation.deleted_at = datetime.now(timezone.utc)
    session.add(reservation)
    session.commit()


# ==========================================
# OCCURRENCE ROUTES
# ==========================================


@router.post(
    "/occurrences/", response_model=OccurrenceRead, status_code=status.HTTP_201_CREATED
)
def create_occurrence(
    *, session: Session = Depends(get_session), occ_in: OccurrenceCreate
):
    # 1. Verify the parent reservation exists and isn't deleted
    reservation = session.get(Reservation, occ_in.reservation_id)
    if not reservation or reservation.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Parent reservation not found"
        )

    # 2. Build the Postgres Range
    db_range = Range(occ_in.start_time, occ_in.end_time, bounds="[)")

    db_occ = Occurrence(
        reservation_id=occ_in.reservation_id,
        resource_id=occ_in.resource_id,
        time_range=db_range,
    )

    session.add(db_occ)
    session.commit()
    session.refresh(db_occ)

    return map_occurrence_to_read(db_occ)


@router.get("/occurrences/", response_model=list[OccurrenceRead])
def read_occurrences(
    *, session: Session = Depends(get_session), offset: int = 0, limit: int = 100
):
    statement = (
        select(Occurrence)
        .where(Occurrence.deleted_at is None)
        .offset(offset)
        .limit(limit)
    )
    occurrences = session.exec(statement).all()

    return [map_occurrence_to_read(occ) for occ in occurrences]


@router.delete("/occurrences/{occurrence_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_occurrence(
    *, session: Session = Depends(get_session), occurrence_id: uuid.UUID
):
    occ = session.get(Occurrence, occurrence_id)
    if not occ or occ.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Occurrence not found"
        )

    # SOFT DELETE
    occ.deleted_at = datetime.now(timezone.utc)
    session.add(occ)
    session.commit()
