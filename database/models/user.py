from sqlalchemy import (Integer,String,DateTime)
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, UTC
from .base import Base
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer,primary_key=True,autoincrement=True)
    username: Mapped[str] = mapped_column(String(50),nullable=False)
    email: Mapped[str] = mapped_column(String(100),unique=True,nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255),nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime,default=lambda: datetime.now(UTC))




