import sys
import os

# Ensure workspace root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.db.session import engine, SessionLocal
from backend.app.models import Base
from backend.app.db.seed import seed_db


def reset_database():
    print("WARNING: Dropping all database tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating database tables from schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_db(db)
        print("Database successfully reset, migrated, and seeded!")
    finally:
        db.close()


if __name__ == "__main__":
    reset_database()
