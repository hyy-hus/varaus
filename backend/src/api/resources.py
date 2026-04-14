import uuid
from models import Resource
from sqlmodel import Session, Sequence, select
from core.database import get_session
from models.resource import ResourceRead, ResourceCreate, ResourceUpdate
from fastapi import APIRouter, status, Depends, HTTPException

router = APIRouter()


@router.post("/", response_model=ResourceRead, status_code=status.HTTP_201_CREATED)
def create_resource(
    *, session: Session = Depends(get_session), resource_in: ResourceCreate
):
    db_resource = Resource.model_validate(resource_in)

    session.add(db_resource)
    session.commit()
    session.refresh(db_resource)

    return db_resource


@router.get("/", response_model=list[ResourceRead])
def read_resources(
    *, session: Session = Depends(get_session), offset: int = 0, limit: int = 100
) -> Sequence[Resource]:
    resources = session.exec(select(Resource).offset(offset).limit(limit)).all()
    return resources


@router.get("/{resource_id}", response_model=ResourceRead)
def read_resource(*, session: Session = Depends(get_session), resource_id: uuid.UUID):
    resource = session.get(Resource, resource_id)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found"
        )
    return resource


@router.patch("/{resource_id}", response_model=ResourceRead)
def update_resource(
    *,
    session: Session = Depends(get_session),
    resource_id: uuid.UUID,
    resource_in: ResourceUpdate,
):
    db_resource = session.get(Resource, resource_id)
    if not db_resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found"
        )

    update_data = resource_in.model_dump(exclude_unset=True)

    db_resource.sqlmodel_update(update_data)

    session.add(db_resource)
    session.commit()
    session.refresh(db_resource)

    return db_resource


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(*, session: Session = Depends(get_session), resource_id: uuid.UUID):
    resource = session.get(Resource, resource_id)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found"
        )

    session.delete(resource)
    session.commit()
