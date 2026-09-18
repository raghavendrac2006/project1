import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.audit import AuditLog, Notification


def create_audit_log(
    db: Session,
    citizen_id: str,
    action: str,
    purpose: str,
    user_id: Optional[str] = None,
    institution_id: Optional[str] = None,
    access_request_id: Optional[str] = None,
    domain_id: Optional[str] = None,
    accessed_fields: Optional[List[str]] = None,
    result: str = "SUCCESS",
    metadata_json: Optional[Dict[str, Any]] = None
) -> AuditLog:
    log = AuditLog(
        citizen_id=citizen_id,
        user_id=user_id,
        institution_id=institution_id,
        access_request_id=access_request_id,
        domain_id=domain_id,
        action=action,
        purpose=purpose,
        accessed_fields=accessed_fields or [],
        result=result,
        metadata_json=metadata_json,
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(log)
    db.flush()
    return log


def list_citizen_history(db: Session, citizen_id: str) -> List[AuditLog]:
    return db.query(AuditLog).filter(
        AuditLog.citizen_id == citizen_id
    ).order_by(AuditLog.timestamp.desc()).all()


def create_notification(
    db: Session,
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "INFO",
    related_entity_id: Optional[str] = None
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        is_read=False,
        related_entity_id=related_entity_id
    )
    db.add(notif)
    db.flush()
    return notif


def list_user_notifications(db: Session, user_id: str) -> List[Notification]:
    return db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).all()


def mark_notification_read(db: Session, notification_id: str, user_id: str) -> bool:
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if not notif:
        return False
    notif.is_read = True
    db.flush()
    return True


def mark_all_notifications_read(db: Session, user_id: str) -> int:
    unread_notifs = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).all()
    count = len(unread_notifs)
    for n in unread_notifs:
        n.is_read = True
    db.flush()
    return count


def get_unread_notification_count(db: Session, user_id: str) -> int:
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

