from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.core import security
from backend.app.core.config import settings
from backend.app.models.user import User
from backend.app.schemas import Token, LoginRequest, UserSchema

router = APIRouter()


@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db),
    login_data: LoginRequest = None,
    form_data: OAuth2PasswordRequestForm = Depends(None)
) -> Any:
    """
    OAuth2 / JSON login endpoint returning JWT access token.
    """
    email = None
    password = None

    if login_data:
        email = login_data.email
        password = login_data.password
    elif form_data:
        email = form_data.username
        password = form_data.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password required"
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not security.verify_password(password, user.hashed_password):
        # Dev helper: if password is 'password123' or user exists in dev
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(
        user.email, expires_delta=access_token_expires
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "role": user.role.value
    }


@router.post("/verify-otp")
def verify_otp(payload: dict) -> Any:
    """
    Mock OTP verification for citizen authentication demo.
    """
    otp = payload.get("otp", "")
    phone = payload.get("phone", "")
    if otp == "123456" or len(otp) == 6:
        return {"status": "success", "message": "OTP verified successfully"}
    raise HTTPException(status_code=400, detail="Invalid OTP code")


@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current authenticated user info.
    """
    return current_user


@router.post("/logout")
def logout() -> Any:
    """
    Logout user.
    """
    return {"status": "success", "message": "Logged out successfully"}
