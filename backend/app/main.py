from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.api.v1.api import api_router
from backend.app.db.session import engine, SessionLocal
from backend.app.models.base import Base
from backend.app.db.seed import seed_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables & seed demo data
    print("Initializing CIVICONE database and seeding initial state...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
    yield
    # Shutdown
    print("Shutting down CIVICONE backend server.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "running",
        "docs": "/docs",
        "api_v1": f"{settings.API_V1_STR}"
    }
