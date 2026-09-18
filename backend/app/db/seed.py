import datetime
from sqlalchemy.orm import Session
from backend.app.db.session import engine, SessionLocal
from backend.app.models.base import Base
from backend.app.models.user import User, UserRole, CitizenProfile
from backend.app.models.institution import Institution, InstitutionCategory, InstitutionUser
from backend.app.models.domain import DataDomain, DomainType, Record, Document
from backend.app.models.consent import AccessRequest, Consent, ActiveAccess, RequestStatus, AccessStatus
from backend.app.models.audit import AuditLog, Notification
from backend.app.core.security import get_password_hash


def seed_db(db: Session):
    # Check if already seeded
    if db.query(User).filter(User.email == "raghavendra@civicone.gov.in").first():
        print("Database already seeded.")
        return

    print("Seeding database...")
    hashed_pwd = get_password_hash("password123")

    # 1. Create Demo Citizen (Raghavendra)
    citizen_user = User(
        email="raghavendra@civicone.gov.in",
        hashed_password=hashed_pwd,
        full_name="Raghavendra",
        role=UserRole.CITIZEN,
        is_active=True
    )
    db.add(citizen_user)
    db.flush()

    citizen_profile = CitizenProfile(
        user_id=citizen_user.id,
        civic_id="CIV-2026-004281",
        full_name="Raghavendra",
        dob="1998-05-14",
        gender="Male",
        phone="+91 98765 43210",
        address="123 Harmony Villa, Green Park Road, Bengaluru, Karnataka - 560001",
        blood_group="O+",
        aadhaar_last4="4281",
        pan_number="ABCDE1234F",
        father_name="Ramachandra",
        emergency_contact="+91 98765 43211",
        photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    )
    db.add(citizen_profile)

    # 2. Create Second Demo Citizen (for cross-citizen boundary testing)
    other_citizen_user = User(
        email="priya@civicone.gov.in",
        hashed_password=hashed_pwd,
        full_name="Priya Sharma",
        role=UserRole.CITIZEN,
        is_active=True
    )
    db.add(other_citizen_user)
    db.flush()

    other_citizen_profile = CitizenProfile(
        user_id=other_citizen_user.id,
        civic_id="CIV-2026-009876",
        full_name="Priya Sharma",
        dob="2000-08-22",
        gender="Female",
        phone="+91 91234 56789",
        address="45 Sunflower Apartments, HSR Layout, Bengaluru, Karnataka - 560102",
        blood_group="B+",
        aadhaar_last4="9876",
        pan_number="XYZPS9876G",
        father_name="Suresh Sharma",
        emergency_contact="+91 91234 56790"
    )
    db.add(other_citizen_profile)

    # 3. Create Demo Data Domains
    domains_data = [
        (DomainType.IDENTITY, "Identity & Demographics", "Official personal details, Aadhaar, PAN, contact"),
        (DomainType.EDUCATION, "Education & Academics", "Degrees, marks, certificates, and academic records"),
        (DomainType.FINANCE, "Financial & Tax Records", "Income certificates, bank statements, tax records"),
        (DomainType.HEALTHCARE, "Medical & Health Records", "Vaccinations, medical history, blood group"),
        (DomainType.GOVERNMENT, "Government & Licenses", "Driving license, voter ID, vehicle registration")
    ]
    domain_map = {}
    for dtype, name, desc in domains_data:
        dom = DataDomain(domain_type=dtype, name=name, description=desc)
        db.add(dom)
        db.flush()
        domain_map[dtype] = dom

    # 4. Create Demo Documents for Raghavendra
    docs = [
        Document(
            user_id=citizen_user.id,
            domain_id=domain_map[DomainType.IDENTITY].id,
            title="Aadhaar Card",
            document_type="Aadhaar",
            issuer="UIDAI",
            file_url="https://example.com/docs/aadhaar.pdf",
            verified=True,
            metadata_json={"aadhaar_no": "XXXX-XXXX-4281", "issue_date": "2018-01-15"}
        ),
        Document(
            user_id=citizen_user.id,
            domain_id=domain_map[DomainType.EDUCATION].id,
            title="B.Tech Degree Certificate",
            document_type="Degree",
            issuer="Kuppam Engineering College",
            file_url="https://example.com/docs/degree.pdf",
            verified=True,
            metadata_json={"degree": "B.Tech Computer Science", "cgpa": "8.9", "year": "2022"}
        ),
        Document(
            user_id=citizen_user.id,
            domain_id=domain_map[DomainType.FINANCE].id,
            title="Income Certificate 2025-26",
            document_type="Income Certificate",
            issuer="Revenue Department, Govt of Karnataka",
            file_url="https://example.com/docs/income.pdf",
            verified=True,
            metadata_json={"annual_income": "₹8,50,000", "valid_till": "2026-03-31"}
        ),
        Document(
            user_id=citizen_user.id,
            domain_id=domain_map[DomainType.HEALTHCARE].id,
            title="COVID Vaccination Certificate",
            document_type="Vaccination",
            issuer="Ministry of Health & Family Welfare",
            file_url="https://example.com/docs/covid_cert.pdf",
            verified=True,
            metadata_json={"doses": "2", "vaccine": "Covishield"}
        ),
        Document(
            user_id=citizen_user.id,
            domain_id=domain_map[DomainType.GOVERNMENT].id,
            title="Driving License",
            document_type="License",
            issuer="Regional Transport Office, Bengaluru",
            file_url="https://example.com/docs/dl.pdf",
            verified=True,
            metadata_json={"dl_number": "KA01-2020-0012345", "valid_till": "2040-05-13"}
        )
    ]
    for d in docs:
        db.add(d)

    # 5. Create Demo Institutions
    institutions_data = [
        ("Kuppam Engineering College", InstitutionCategory.EDUCATION, "KEC-EDU-001", "Kuppam, Andhra Pradesh", "contact@kec.edu.in", True),
        ("ABC Bank", InstitutionCategory.FINANCE, "ABC-FIN-999", "MG Road, Bengaluru", "verify@abcbank.com", True),
        ("CityCare Hospital", InstitutionCategory.HEALTHCARE, "CCH-HLT-404", "Indiranagar, Bengaluru", "records@citycare.org", True),
        ("Regional Transport Office", InstitutionCategory.GOVERNMENT, "RTO-GOV-101", "Koramangala, Bengaluru", "support@rto.gov.in", True)
    ]

    inst_map = {}
    for name, cat, reg_no, addr, email, is_ver in institutions_data:
        inst = Institution(
            name=name,
            category=cat,
            registration_number=reg_no,
            address=addr,
            email=email,
            is_verified=is_ver
        )
        db.add(inst)
        db.flush()
        inst_map[cat] = inst

    # 6. Create Institution Users
    # College Academic Coordinator
    inst_user_kec = User(
        email="coordinator@kec.edu.in",
        hashed_password=hashed_pwd,
        full_name="Academic Coordinator",
        role=UserRole.INSTITUTION,
        is_active=True
    )
    db.add(inst_user_kec)
    db.flush()

    db.add(InstitutionUser(
        user_id=inst_user_kec.id,
        institution_id=inst_map[InstitutionCategory.EDUCATION].id,
        department="Academic Verification Cell",
        designation="Senior Verification Officer"
    ))

    # Bank Loan Officer
    inst_user_bank = User(
        email="loan_officer@abcbank.com",
        hashed_password=hashed_pwd,
        full_name="Bank Loan Officer",
        role=UserRole.INSTITUTION,
        is_active=True
    )
    db.add(inst_user_bank)
    db.flush()

    db.add(InstitutionUser(
        user_id=inst_user_bank.id,
        institution_id=inst_map[InstitutionCategory.FINANCE].id,
        department="Retail Credit Division",
        designation="Credit Analyst"
    ))

    # 7. Create Demo Access Requests & Active Grants for Raghavendra
    # Request 1: Kuppam Engineering College (Approved & Active)
    req1 = AccessRequest(
        citizen_id=citizen_user.id,
        institution_id=inst_map[InstitutionCategory.EDUCATION].id,
        requested_by_user_id=inst_user_kec.id,
        domain_id=domain_map[DomainType.EDUCATION].id,
        purpose="B.Tech Convocation Certificate Verification & Alumni Archiving",
        duration_days=30,
        status=RequestStatus.APPROVED,
        requested_fields=["degree", "cgpa", "year", "college_name", "full_name"]
    )
    db.add(req1)
    db.flush()

    # Active Access Grant for Request 1
    now = datetime.datetime.now(datetime.timezone.utc)
    expires_at = now + datetime.timedelta(days=30)
    active1 = ActiveAccess(
        request_id=req1.id,
        citizen_id=citizen_user.id,
        institution_id=inst_map[InstitutionCategory.EDUCATION].id,
        domain_id=domain_map[DomainType.EDUCATION].id,
        granted_fields=["degree", "cgpa", "year", "college_name", "full_name"],
        expires_at=expires_at,
        status=AccessStatus.ACTIVE
    )
    db.add(active1)

    # Request 2: ABC Bank (Pending Request for Finance Domain for Raghavendra)
    req2 = AccessRequest(
        citizen_id=citizen_user.id,
        institution_id=inst_map[InstitutionCategory.FINANCE].id,
        requested_by_user_id=inst_user_bank.id,
        domain_id=domain_map[DomainType.FINANCE].id,
        purpose="Personal Loan Application #LN-2026-8841 Verification",
        duration_days=15,
        status=RequestStatus.PENDING,
        requested_fields=["annual_income", "pan_number", "full_name"]
    )
    db.add(req2)

    # Request 3: Access Request for Priya (other citizen ID = 2)
    req3 = AccessRequest(
        citizen_id=other_citizen_user.id,
        institution_id=inst_map[InstitutionCategory.FINANCE].id,
        requested_by_user_id=inst_user_bank.id,
        domain_id=domain_map[DomainType.FINANCE].id,
        purpose="Vehicle Loan Application #VL-2026-9900 Verification",
        duration_days=7,
        status=RequestStatus.PENDING,
        requested_fields=["annual_income", "pan_number"]
    )
    db.add(req3)

    # 8. Add Audit Log & Notification entries
    db.add(Notification(
        user_id=citizen_user.id,
        title="Access Approved",
        message="You approved Kuppam Engineering College to access your Education records for 30 days.",
        type="CONSENT_APPROVED",
        is_read=False
    ))
    db.add(Notification(
        user_id=citizen_user.id,
        title="New Access Request",
        message="ABC Bank requested access to your Financial & Tax Records for Personal Loan Verification.",
        type="ACCESS_REQUEST",
        is_read=False
    ))

    db.add(AuditLog(
        citizen_id=citizen_user.id,
        institution_id=inst_map[InstitutionCategory.EDUCATION].id,
        user_id=inst_user_kec.id,
        domain_id=domain_map[DomainType.EDUCATION].id,
        action="GRANT_CONSENT",
        purpose="B.Tech Convocation Certificate Verification",
        accessed_fields=["degree", "cgpa", "year", "college_name", "full_name"],
        outcome="SUCCESS"
    ))

    db.commit()
    print("Database seeding completed successfully.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        # Create all tables if not exist
        Base.metadata.create_all(bind=engine)
        seed_db(db)
    finally:
        db.close()
