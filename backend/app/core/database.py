import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

def get_engine():
    # If DATABASE_URL is set, use it directly
    if settings.DATABASE_URL:
        db_url = settings.DATABASE_URL
    else:
        # Check if MySQL host/user is specified and enabled
        use_mysql = os.getenv("USE_MYSQL", "false").lower() in ("true", "1", "yes")
        if use_mysql:
            pw_part = f":{settings.MYSQL_PASSWORD}" if settings.MYSQL_PASSWORD else ""
            db_url = f"mysql+pymysql://{settings.MYSQL_USER}{pw_part}@{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DB}?charset=utf8mb4"
        else:
            sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "solar_field_desk.db"))
            db_url = f"sqlite:///{sqlite_path}"

    if "sqlite" in db_url:
        return create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        try:
            return create_engine(db_url, pool_pre_ping=True)
        except Exception as e:
            logger.warning(f"Could not connect to MySQL ({e}). Using local database.")
            sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "solar_field_desk.db"))
            return create_engine(f"sqlite:///{sqlite_path}", connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
