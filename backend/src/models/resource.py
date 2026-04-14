import uuid

from typing import Optional
from sqlmodel import SQLModel, Field


class ResourceBase(SQLModel):
    name: str = Field(index=True)
    description: str | None = None
    is_active: bool = Field(default=True)


class Resource(ResourceBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class ResourceCreate(ResourceBase):
    pass


class ResourceRead(ResourceBase):
    id: uuid.UUID
