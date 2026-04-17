from sqlmodel import Session, select
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute

from core.database import get_session

from api import resources


def custom_generate_unique_id(route: APIRoute):
    return f"{route.name}"


app = FastAPI(
    title="Varaus API",
    description="API for reserving things",
    version="0.0.0",
    generate_unique_id_function=custom_generate_unique_id,
)

origins = [
    "http://localhost:5173",
    "varaus.localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "ok"}


@app.get("/api/db-test")
def test_db_connection(session: Session = Depends(get_session)):
    result = session.exec(select(1)).first()
    return {"db_connected": result == 1}


app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
