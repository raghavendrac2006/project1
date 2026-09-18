from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import ValidationError

from backend.app.core.config import settings
from backend.app.core.security import ALGORITHM
from backend.app.db.session import SessionLocal
from backend.app.models.user import User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(reusable_oauth2),
    x_dev_user_email: Optional[str] = Header(None, alias="X-Dev-User-Email")
) -> User:
    # Dev mock header support for seamless testing if token is missing
    user: Optional[User] = None

    if token:
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[ALGORITHM]
            )
            email: str = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email).first()
        except (JWTError, ValidationError):
            pass

    if not user and x_dev_user_email:
        user = db.query(User).filter(User.email == x_dev_user_email).first()

    # Default fallback for local testing if no auth is provided at all
    if not user:
        user = db.query(User).filter(User.email == "raghavendra@civicone.gov.in").first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
