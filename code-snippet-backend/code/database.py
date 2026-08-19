from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = str(os.getenv("DATABASE_URL"))
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "ssl": {
            "check_hostname": False,
        }
    },
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()