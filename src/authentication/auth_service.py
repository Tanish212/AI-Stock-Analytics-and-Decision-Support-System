from sqlalchemy.orm import Session
from database.connection import engine
from database.models.user import User
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")
session = Session(bind=engine)
def hash_password(password: str) -> str:
    return pwd_context.hash(password)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
def email_exists(email: str) -> bool:
    user = session.query(User).filter(User.email == email).first()
    return user is not None
def create_user(username: str, email: str, password: str) -> bool:
    if email_exists(email):
        return False
    hashed_password = hash_password(password)
    new_user = User(username=username,email=email,password_hash=hashed_password)
    session.add(new_user)
    session.commit()
    return True
def authenticate_user(identifier: str, password: str):
    user = session.query(User).filter((User.email == identifier) |(User.username == identifier)).first()
    if user is None:
        return None
    if verify_password(password, user.password_hash):
        return user
    return None


