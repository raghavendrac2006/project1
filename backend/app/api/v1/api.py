from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    auth,
    citizen,
    documents,
    requests,
    active,
    history,
    notify,
    institution,
    aws
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(citizen.router, prefix="/citizen", tags=["Citizen Profile & Identity"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document Vault"])
api_router.include_router(requests.router, prefix="/access-requests", tags=["Access Requests"])
api_router.include_router(active.router, prefix="/active-access", tags=["Active Access Grants"])
api_router.include_router(history.router, prefix="/access-history", tags=["Audit Log & History"])
api_router.include_router(notify.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(institution.router, prefix="/institution", tags=["Institution Operations"])
api_router.include_router(aws.router, prefix="/aws", tags=["AWS Cloud Technology"])
