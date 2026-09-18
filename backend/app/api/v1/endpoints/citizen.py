from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.crud import crud_user
from backend.app.schemas import CitizenProfileSchema, CitizenProfileUpdate

router = APIRouter()


@router.get("/me", response_model=CitizenProfileSchema)
def get_citizen_profile(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    profile = crud_user.get_citizen_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Citizen profile not found")
    return profile


@router.get("/identity")
def get_citizen_identity(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    profile = crud_user.get_citizen_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Citizen profile not found")

    return {
        "civic_one_id": profile.civic_one_id,
        "civic_id": profile.civic_one_id,
        "full_name": profile.full_name,
        "date_of_birth": profile.date_of_birth,
        "dob": profile.date_of_birth,
        "gender": profile.gender,
        "phone": profile.phone,
        "email": profile.email,
        "address": profile.address,
        "blood_group": profile.blood_group,
        "aadhaar_last4": profile.aadhaar_last4,
        "pan_number": profile.pan_number,
        "photo_url": profile.photo_url,
        "verification_status": profile.verification_status,
        "issued_by": "Republic of India / CivicOne Central Data Exchange"
    }


@router.patch("/profile", response_model=CitizenProfileSchema)
def update_citizen_profile(
    update_data: CitizenProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    profile = crud_user.get_citizen_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Citizen profile not found")

    if update_data.phone is not None:
        profile.phone = update_data.phone
    if update_data.address is not None:
        profile.address = update_data.address
    if update_data.emergency_contact is not None:
        profile.emergency_contact = update_data.emergency_contact

    db.commit()
    db.refresh(profile)
    return profile
