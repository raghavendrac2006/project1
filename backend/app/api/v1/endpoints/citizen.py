from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User, CitizenProfile
from backend.app.schemas import CitizenProfileSchema, CitizenProfileUpdate

router = APIRouter()


@router.get("/me", response_model=CitizenProfileSchema)
def get_citizen_profile(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get citizen profile for current user.
    """
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Citizen profile not found")
    return profile


@router.get("/identity")
def get_citizen_identity(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get digital civic identity card payload.
    """
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Citizen profile not found")

    return {
        "civic_id": profile.civic_id,
        "full_name": profile.full_name,
        "dob": profile.dob,
        "gender": profile.gender,
        "phone": profile.phone,
        "address": profile.address,
        "blood_group": profile.blood_group,
        "aadhaar_last4": profile.aadhaar_last4,
        "pan_number": profile.pan_number,
        "photo_url": profile.photo_url,
        "verification_status": "VERIFIED_GOVT_ID",
        "issued_by": "Republic of India / CivicOne Central Data Exchange"
    }


@router.patch("/profile", response_model=CitizenProfileSchema)
def update_citizen_profile(
    update_data: CitizenProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Update editable citizen profile fields.
    """
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
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
