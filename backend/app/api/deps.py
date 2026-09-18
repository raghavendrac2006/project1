from typing import Generator, Optional, Tuple
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import ValidationError

from backend.app.core.config import settings
from backend.app.core.security import ALGORITHM
from backend.app.db.session import SessionLocal
from backend.app.models.user import User, UserRole, CitizenProfile
from backend.app.models.institution import Institution, InstitutionUser
from backend.app.models.role import RoleEnum

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
    user: Optional[User] = None

    if token:
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[ALGORITHM]
            )
            sub: str = payload.get("sub")
            if not sub:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token claims: missing subject",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            user = db.query(User).filter(
                (User.external_auth_id == sub) | (User.email == sub)
            ).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User associated with token not found",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except (JWTError, ValidationError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    elif x_dev_user_email:
        user = db.query(User).filter(User.email == x_dev_user_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive or suspended user account"
        )
    return current_user


def get_current_citizen(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Tuple[User, CitizenProfile]:
    if current_user.role != UserRole.CITIZEN and not current_user.citizen_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Citizen role required"
        )
    profile = current_user.citizen_profile
    if not profile:
        profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Citizen profile not found"
        )
    return current_user, profile


def get_current_institution_user(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Tuple[User, InstitutionUser, Institution]:
    if current_user.role != UserRole.INSTITUTION and not current_user.institution_membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Institution role required"
        )
    inst_user = current_user.institution_membership
    if not inst_user:
        inst_user = db.query(InstitutionUser).filter(InstitutionUser.user_id == current_user.id).first()
    if not inst_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not associated with any registered institution"
        )
    institution = db.query(Institution).filter(Institution.id == inst_user.institution_id).first()
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found"
        )
    return current_user, inst_user, institution


def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    is_admin = (current_user.role == UserRole.ADMIN)
    if not is_admin and current_user.institution_membership:
        is_admin = (current_user.institution_membership.role_id == RoleEnum.ADMIN)

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privilege required"
        )
    return current_user
