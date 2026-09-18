from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.crud import crud_audit
from backend.app.schemas import NotificationSchema

router = APIRouter()


@router.get("", response_model=List[NotificationSchema])
def list_notifications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    notifs = crud_audit.list_user_notifications(db, current_user.id)
    return notifs


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    success = crud_audit.mark_notification_read(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.commit()
    return {"status": "success", "message": "Notification marked as read"}


@router.post("/mark-all-read")
def mark_all_notifications_read(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    count = crud_audit.mark_all_notifications_read(db, current_user.id)
    db.commit()
    return {"status": "success", "marked_count": count, "message": f"{count} notifications marked as read"}


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    count = crud_audit.get_unread_notification_count(db, current_user.id)
    return {"unread_count": count}

