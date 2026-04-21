import enum
import uuid
from datetime import datetime
from typing import Any
from sqlalchemy.dialects.postgresql import TSTZRANGE
from sqlalchemy import Column
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, DateTime


class ReservationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    INFORMATIVE = "informative"


class ReservationBase(SQLModel):
    name: str = Field(index=True)
    description: str | None = None
    rrule: str | None = None
    status: ReservationStatus = Field(default=ReservationStatus.PENDING)


class Reservation(ReservationBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True))
    )

    occurrences: list["Occurrence"] = Relationship(back_populates="reservation")


class ReservationCreate(ReservationBase):
    pass


class ReservationRead(ReservationBase):
    id: uuid.UUID


class ReservationUpdate(SQLModel):
    name: str | None = None
    description: str | None = None
    status: ReservationStatus | None = None


class Occurrence(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    reservation_id: uuid.UUID = Field(foreign_key="reservation.id")
    resource_id: uuid.UUID = Field(foreign_key="resource.id")

    time_range: Any = Field(sa_column=Column(TSTZRANGE, nullable=False))

    is_modified: bool = Field(default=False)

    deleted_at: datetime | None = Field(
        default=None, sa_column=Column(DateTime(timezone=True))
    )

    reservation: "Reservation" = Relationship(back_populates="occurrences")


class OccurrenceCreate(SQLModel):
    reservation_id: uuid.UUID
    resource_id: uuid.UUID
    start_time: datetime
    end_time: datetime


class OccurrenceRead(SQLModel):
    id: uuid.UUID
    reservation_id: uuid.UUID
    resource_id: uuid.UUID
    start_time: datetime
    end_time: datetime
