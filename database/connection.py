from sqlalchemy import create_engine
from dotenv import load_dotenv
import os
from urllib.parse import quote_plus
load_dotenv()
DB_USER = os.getenv("DATABASE_USER")
DB_PASSWORD = quote_plus(os.getenv("DATABASE_PASSWORD"))
DB_HOST = os.getenv("DATABASE_HOST")
DB_PORT = os.getenv("DATABASE_PORT")
DB_NAME = os.getenv("DATABASE_NAME")
DATABASE_URL = (f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
engine = create_engine(DATABASE_URL)
