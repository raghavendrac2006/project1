from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.domain import DataDomain, DomainType, Record, Document


def get_domain_by_type(db: Session, domain_type: DomainType) -> Optional[DataDomain]:
    return db.query(DataDomain).filter(DataDomain.domain_type == domain_type).first()


def create_data_domain(
    db: Session,
    domain_type: DomainType,
    name: str,
    description: Optional[str] = None
) -> DataDomain:
    domain = DataDomain(
        domain_type=domain_type,
        name=name,
        description=description
    )
    db.add(domain)
    db.flush()
    return domain


def get_user_documents(db: Session, citizen_id: str) -> List[Document]:
    return db.query(Document).filter(Document.citizen_id == citizen_id).all()


def get_document_by_id(db: Session, document_id: str, citizen_id: str) -> Optional[Document]:
    return db.query(Document).filter(
        Document.id == document_id,
        Document.citizen_id == citizen_id
    ).first()


def create_document(
    db: Session,
    citizen_id: str,
    domain_id: str,
    title: str,
    document_type: str,
    issuer: str,
    document_number: Optional[str] = None,
    storage_key: Optional[str] = None,
    file_url: Optional[str] = None,
    verified: bool = True,
    metadata_json: Optional[Dict[str, Any]] = None
) -> Document:
    doc = Document(
        citizen_id=citizen_id,
        domain_id=domain_id,
        title=title,
        document_type=document_type,
        issuer=issuer,
        document_number=document_number,
        storage_key=storage_key,
        file_url=file_url,
        verified=verified,
        metadata_json=metadata_json
    )
    db.add(doc)
    db.flush()
    return doc


def create_record(
    db: Session,
    citizen_id: str,
    domain_id: str,
    record_type: str,
    data: Dict[str, Any],
    verification_status: str = "VERIFIED"
) -> Record:
    rec = Record(
        citizen_id=citizen_id,
        domain_id=domain_id,
        record_type=record_type,
        data=data,
        verification_status=verification_status
    )
    db.add(rec)
    db.flush()
    return rec
