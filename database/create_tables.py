from connection import engine
from models.base import Base
from models.user import User
Base.metadata.create_all(bind=engine)
print("Tables created successfully")