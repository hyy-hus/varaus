from sqlmodel import Session, select
from fastapi.concurrency import asynccontextmanager
from database import create_db_and_tables, get_session
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="Varaus API", description="API for reserving things", version="0.0.0"
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
