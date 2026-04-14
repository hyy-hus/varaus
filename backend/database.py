from sqlmodel import create_engine, Session, SQLModel
from config import settings  # Import your new settings!

engine = create_engine(settings.database_url, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
