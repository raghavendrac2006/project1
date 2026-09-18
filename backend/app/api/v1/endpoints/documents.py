from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.models.domain import Document
from backend.app.schemas import DocumentSchema

router = APIRouter()


@router.get("", response_model=List[DocumentSchema])
def list_citizen_documents(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    List all documents in citizen's digital vault.
    """
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    return docs


@router.get("/{document_id}", response_model=DocumentSchema)
def get_document_by_id(
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get document by ID from vault.
    """
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
