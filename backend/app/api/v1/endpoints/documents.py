from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.crud import crud_domain
from backend.app.schemas import DocumentSchema

router = APIRouter()


@router.get("", response_model=List[DocumentSchema])
def list_citizen_documents(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    docs = crud_domain.get_user_documents(db, current_user.id)
    return docs


@router.get("/{document_id}", response_model=DocumentSchema)
def get_document_by_id(
    document_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    doc = crud_domain.get_document_by_id(db, document_id, current_user.id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
