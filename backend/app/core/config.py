from pydantic_settings import BaseSettings
from pydantic import field_validator, ConfigDict
from typing import List, Union
import json
import os

class Settings(BaseSettings):
    model_config = ConfigDict(case_sensitive=True, extra="ignore")

    PROJECT_NAME: str = "CIVICONE / SAMAGRA Sovereign Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "civiqone_dev_secret_key_99182_sovereign_identity")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return [str(i) for i in v]
        return ["*"]
    
    # SQLite fallback if local/cloud PostgreSQL is not configured
    SQLALCHEMY_DATABASE_URI: str = os.getenv(
        "DATABASE_URL", "sqlite:///./civicone_local.db"
    )

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

settings = Settings()

