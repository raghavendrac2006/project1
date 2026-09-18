import datetime
from sqlalchemy.orm import Session
from backend.app.db.session import engine, SessionLocal
from backend.app.models.base import Base
from backend.app.models.role import RoleEnum
from backend.app.models.user import User, UserRole, CitizenProfile
from backend.app.models.institution import Institution, InstitutionCategory, InstitutionUser
from backend.app.models.domain import DataDomain, DomainType, Record, Document
from backend.app.models.consent import AccessRequest, Consent, ActiveAccess, RequestStatus, AccessStatus
from backend.app.models.audit import AuditLog, Notification
from backend.app.core.security import get_password_hash


def seed_db(db: Session):
    print("Executing deterministic database seeding...")
    hashed_pwd = get_password_hash("password123")

    # 1. Seed Roles & Data Domains
    domains_def = [
        (DomainType.IDENTITY, "Identity & Demographics", "Official personal details, Aadhaar, PAN, contact"),
        (DomainType.EDUCATION, "Education & Academics", "Degrees, marks, certificates, and academic records"),
        (DomainType.FINANCE, "Financial & Tax Records", "Income certificates, bank statements, tax records"),
        (DomainType.HEALTH, "Medical & Health Records", "Vaccinations, medical history, blood group"),
        (DomainType.TRANSPORT, "Government & Licenses", "Driving license, voter ID, vehicle registration")
    ]
    domain_map = {}
    for dtype, name, desc in domains_def:
        dom = db.query(DataDomain).filter(DataDomain.domain_type == dtype).first()
        if not dom:
            dom = DataDomain(domain_type=dtype, name=name, description=desc)
            db.add(dom)
            db.flush()
        domain_map[dtype] = dom

    # 2. Seed Demo Citizen (Raghavendra)
    c_user = db.query(User).filter(User.email == "raghavendra@civicone.gov.in").first()
    if not c_user:
        c_user = User(
            email="raghavendra@civicone.gov.in",
            phone="+91 98765 43210",
            hashed_password=hashed_pwd,
            full_name="Raghavendra",
            role=UserRole.CITIZEN,
            is_active=True
        )
        db.add(c_user)
        db.flush()

    c_profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == c_user.id).first()
    if not c_profile:
        c_profile = CitizenProfile(
            user_id=c_user.id,
            civic_one_id="CIV-2026-004281",
            full_name="Raghavendra",
            date_of_birth="1998-05-14",
            gender="Male",
            phone="+91 98765 43210",
            email="raghavendra@civicone.gov.in",
            address="123 Harmony Villa, Green Park Road, Bengaluru, Karnataka - 560001",
            blood_group="O+",
            aadhaar_last4="4281",
            pan_number="ABCDE1234F",
            father_name="Ramachandra",
            emergency_contact="+91 98765 43211",
            photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        )
        db.add(c_profile)

    # 3. Seed Second Demo Citizen (Priya Sharma)
    p_user = db.query(User).filter(User.email == "priya@civicone.gov.in").first()
    if not p_user:
        p_user = User(
            email="priya@civicone.gov.in",
            phone="+91 91234 56789",
            hashed_password=hashed_pwd,
            full_name="Priya Sharma",
            role=UserRole.CITIZEN,
            is_active=True
        )
        db.add(p_user)
        db.flush()

    p_profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == p_user.id).first()
    if not p_profile:
        p_profile = CitizenProfile(
            user_id=p_user.id,
            civic_one_id="CIV-2026-009876",
            full_name="Priya Sharma",
            date_of_birth="2000-08-22",
            gender="Female",
            phone="+91 91234 56789",
            email="priya@civicone.gov.in",
            address="45 Sunflower Apartments, HSR Layout, Bengaluru, Karnataka - 560102",
            blood_group="B+",
            aadhaar_last4="9876",
            pan_number="XYZPS9876G",
            father_name="Suresh Sharma",
            emergency_contact="+91 91234 56790"
        )
        db.add(p_profile)

    # 4. Seed 4 Demo Institutions
    inst_defs = [
        ("Kuppam Engineering College", InstitutionCategory.EDUCATION, "KEC-EDU-001", "Kuppam, Andhra Pradesh", "contact@kec.edu.in"),
        ("ABC Bank", InstitutionCategory.FINANCE, "ABC-FIN-999", "MG Road, Bengaluru", "verify@abcbank.com"),
        ("CityCare Hospital", InstitutionCategory.HEALTHCARE, "CCH-HLT-404", "Indiranagar, Bengaluru", "records@citycare.org"),
        ("Regional Transport Office", InstitutionCategory.GOVERNMENT, "RTO-GOV-101", "Koramangala, Bengaluru", "support@rto.gov.in")
    ]
    inst_map = {}
    for name, cat, reg_id, addr, email in inst_defs:
        inst = db.query(Institution).filter(Institution.registration_id == reg_id).first()
        if not inst:
            inst = Institution(
                name=name,
                category=cat,
                registration_id=reg_id,
                address=addr,
                email=email,
                is_verified=True
            )
            db.add(inst)
            db.flush()
        inst_map[cat] = inst

    # 5. Seed Institution Users
    # College Academic Coordinator
    kec_user = db.query(User).filter(User.email == "coordinator@kec.edu.in").first()
    if not kec_user:
        kec_user = User(
            email="coordinator@kec.edu.in",
            hashed_password=hashed_pwd,
            full_name="Academic Coordinator",
            role=UserRole.INSTITUTION,
            is_active=True
        )
        db.add(kec_user)
        db.flush()

        db.add(InstitutionUser(
            user_id=kec_user.id,
            institution_id=inst_map[InstitutionCategory.EDUCATION].id,
            role_id=RoleEnum.ACADEMIC_VERIFIER,
            department="Academic Verification Cell",
            designation="Senior Verification Officer"
        ))

    # Bank Loan Officer
    bank_user = db.query(User).filter(User.email == "loan_officer@abcbank.com").first()
    if not bank_user:
        bank_user = User(
            email="loan_officer@abcbank.com",
            hashed_password=hashed_pwd,
            full_name="Bank Loan Officer",
            role=UserRole.INSTITUTION,
            is_active=True
        )
        db.add(bank_user)
        db.flush()

        db.add(InstitutionUser(
            user_id=bank_user.id,
            institution_id=inst_map[InstitutionCategory.FINANCE].id,
            role_id=RoleEnum.BANK_KYC_OFFICER,
            department="Retail Credit Division",
            designation="Credit Analyst"
        ))

    # 6. Seed Demo Records for Raghavendra
    record_defs = [
        (DomainType.IDENTITY, "CIVIC_IDENTITY", {"full_name": "Raghavendra", "dob": "1998-05-14", "gender": "Male", "aadhaar_last4": "4281", "pan_number": "ABCDE1234F"}),
        (DomainType.EDUCATION, "DEGREE_RECORD", {"full_name": "Raghavendra", "degree": "B.Tech Computer Science", "cgpa": "8.9", "year": "2022", "college_name": "Kuppam Engineering College"}),
        (DomainType.FINANCE, "INCOME_RECORD", {"full_name": "Raghavendra", "annual_income": "₹8,50,000", "pan_number": "ABCDE1234F"}),
        (DomainType.HEALTH, "VACCINATION_RECORD", {"full_name": "Raghavendra", "blood_group": "O+", "vaccination_status": "Fully Vaccinated", "doses": 2}),
        (DomainType.TRANSPORT, "LICENSE_RECORD", {"full_name": "Raghavendra", "driving_license": "KA01-2020-0012345", "vehicle_registration": "KA01EV9999"})
    ]
    for dtype, rtype, payload in record_defs:
        dom = domain_map[dtype]
        existing_rec = db.query(Record).filter(Record.citizen_id == c_user.id, Record.domain_id == dom.id).first()
        if not existing_rec:
            db.add(Record(
                citizen_id=c_user.id,
                domain_id=dom.id,
                record_type=rtype,
                data=payload,
                verification_status="VERIFIED"
            ))

    # 7. Seed Demo Vault Documents for Raghavendra
    docs_defs = [
        (DomainType.IDENTITY, "Aadhaar Card", "Aadhaar", "UIDAI", "DOC-AADHAAR-4281", "vault/aadhaar.pdf", {"aadhaar_no": "XXXX-XXXX-4281"}),
        (DomainType.EDUCATION, "B.Tech Degree Certificate", "Degree", "Kuppam Engineering College", "DOC-DEGREE-2022", "vault/degree.pdf", {"degree": "B.Tech CS", "cgpa": "8.9"}),
        (DomainType.FINANCE, "Income Certificate 2025-26", "Income Certificate", "Govt of Karnataka", "DOC-INC-2025", "vault/income.pdf", {"annual_income": "₹8,50,000"}),
        (DomainType.HEALTH, "COVID Vaccination Certificate", "Vaccination", "MoHFW", "DOC-COV-101", "vault/covid.pdf", {"vaccine": "Covishield"}),
        (DomainType.TRANSPORT, "Driving License", "License", "RTO Bengaluru", "DOC-DL-001", "vault/dl.pdf", {"dl_no": "KA01-2020-0012345"})
    ]
    for dtype, title, dtype_str, issuer, doc_no, skey, meta in docs_defs:
        dom = domain_map[dtype]
        existing_doc = db.query(Document).filter(Document.citizen_id == c_user.id, Document.title == title).first()
        if not existing_doc:
            db.add(Document(
                citizen_id=c_user.id,
                domain_id=dom.id,
                title=title,
                document_type=dtype_str,
                issuer=issuer,
                document_number=doc_no,
                storage_key=skey,
                file_url=f"https://example.com/{skey}",
                verified=True,
                metadata_json=meta
            ))

    # 8. Seed Demo Access Requests & Active Grants
    # Request 1: Kuppam Engineering College (Approved & Active for Education)
    edu_dom = domain_map[DomainType.EDUCATION]
    edu_inst = inst_map[InstitutionCategory.EDUCATION]
    req1 = db.query(AccessRequest).filter(AccessRequest.citizen_id == c_user.id, AccessRequest.institution_id == edu_inst.id).first()
    if not req1:
        req1 = AccessRequest(
            citizen_id=c_user.id,
            institution_id=edu_inst.id,
            requester_user_id=kec_user.id,
            domain_id=edu_dom.id,
            purpose="B.Tech Convocation Certificate Verification & Alumni Archiving",
            requested_duration="30_DAYS",
            duration_days="30",
            status=RequestStatus.APPROVED,
            requested_fields=["degree", "cgpa", "year", "college_name", "full_name"]
        )
        db.add(req1)
        db.flush()

        now = datetime.datetime.now(datetime.timezone.utc)
        expires_at = now + datetime.timedelta(days=30)
        db.add(ActiveAccess(
            access_request_id=req1.id,
            citizen_id=c_user.id,
            institution_id=edu_inst.id,
            domain_id=edu_dom.id,
            approved_fields=["degree", "cgpa", "year", "college_name", "full_name"],
            purpose="B.Tech Convocation Certificate Verification",
            granted_at=now,
            expires_at=expires_at,
            status=AccessStatus.ACTIVE
        ))

    # Request 2: ABC Bank (Pending Request for Finance for Raghavendra)
    fin_dom = domain_map[DomainType.FINANCE]
    fin_inst = inst_map[InstitutionCategory.FINANCE]
    req2 = db.query(AccessRequest).filter(AccessRequest.citizen_id == c_user.id, AccessRequest.institution_id == fin_inst.id).first()
    if not req2:
        req2 = AccessRequest(
            citizen_id=c_user.id,
            institution_id=fin_inst.id,
            requester_user_id=bank_user.id,
            domain_id=fin_dom.id,
            purpose="Personal Loan Application #LN-2026-8841 Verification",
            requested_duration="15_DAYS",
            duration_days="15",
            status=RequestStatus.PENDING,
            requested_fields=["annual_income", "pan_number", "full_name"]
        )
        db.add(req2)

    # Request 3: ABC Bank (Pending Request for Priya)
    req3 = db.query(AccessRequest).filter(AccessRequest.citizen_id == p_user.id, AccessRequest.institution_id == fin_inst.id).first()
    if not req3:
        req3 = AccessRequest(
            citizen_id=p_user.id,
            institution_id=fin_inst.id,
            requester_user_id=bank_user.id,
            domain_id=fin_dom.id,
            purpose="Vehicle Loan Application #VL-2026-9900 Verification",
            requested_duration="7_DAYS",
            duration_days="7",
            status=RequestStatus.PENDING,
            requested_fields=["annual_income", "pan_number"]
        )
        db.add(req3)

    # 9. Seed Audit Logs & Notifications
    existing_notif = db.query(Notification).filter(Notification.user_id == c_user.id).first()
    if not existing_notif:
        db.add(Notification(
            user_id=c_user.id,
            title="Access Approved",
            message="You approved Kuppam Engineering College to access your Education records for 30 days.",
            type="CONSENT_APPROVED",
            is_read=False
        ))
        db.add(Notification(
            user_id=c_user.id,
            title="New Access Request",
            message="ABC Bank requested access to your Financial & Tax Records for Personal Loan Verification.",
            type="ACCESS_REQUEST",
            is_read=False
        ))

    existing_log = db.query(AuditLog).filter(AuditLog.citizen_id == c_user.id).first()
    if not existing_log:
        db.add(AuditLog(
            citizen_id=c_user.id,
            institution_id=edu_inst.id,
            user_id=kec_user.id,
            domain_id=edu_dom.id,
            action="GRANT_CONSENT",
            purpose="B.Tech Convocation Certificate Verification",
            accessed_fields=["degree", "cgpa", "year", "college_name", "full_name"],
            result="SUCCESS"
        ))

    db.commit()
    print("Deterministic database seeding completed cleanly.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        seed_db(db)
    finally:
        db.close()
