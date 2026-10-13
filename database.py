import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Generator
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    JSON,
    Text,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:Rishit%402802@127.0.0.1:5432/fraud_detection_db"
)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# Connect to database with resilient fallback
try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    # Test connection
    with engine.connect() as conn:
        print(f" Connected to PostgreSQL database: {DATABASE_URL.split('@')[-1]}")
except Exception as e:
    print(f" Warning: Could not connect to PostgreSQL ({e}). Falling back to local SQLite.")
    FALLBACK_SQLITE_URL = "sqlite:///./fraud_detection.db"
    engine = create_engine(
        FALLBACK_SQLITE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(String(64), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    merchant = Column(String(120), default="Retail Merchant", nullable=False)
    card_last_four = Column(String(8), default="4242", nullable=False)
    location = Column(String(120), default="Online / Domestic", nullable=False)
    category = Column(String(80), default="Retail", nullable=False)
    
    # ML Prediction outputs
    prediction = Column(String(32), nullable=False)  # "Fraudulent" or "Legitimate"
    is_fraud = Column(Boolean, default=False, index=True, nullable=False)
    fraud_probability = Column(Float, nullable=False)  # 0.00 to 100.00
    risk_level = Column(String(20), default="LOW", nullable=False)  # "LOW", "MEDIUM", "HIGH"
    
    # Raw feature vector or extra metadata
    features = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "transaction_id": self.transaction_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "amount": self.amount,
            "merchant": self.merchant,
            "card_last_four": self.card_last_four,
            "location": self.location,
            "category": self.category,
            "prediction": self.prediction,
            "is_fraud": self.is_fraud,
            "fraud_probability": round(self.fraud_probability, 2),
            "risk_level": self.risk_level,
            "notes": self.notes,
        }


def get_db() -> Generator[Session, None, None]:
    """FastAPI database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_sample_transactions(db: Session):
    """Seed initial demo transactions so the dashboard has rich data out of the box"""
    if db.query(Transaction).count() > 0:
        return

    now = datetime.now(timezone.utc)
    sample_records = [
        {
            "transaction_id": f"TXN-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": now - timedelta(minutes=15),
            "amount": 49.99,
            "merchant": "Amazon India",
            "card_last_four": "4242",
            "location": "Mumbai, IN",
            "category": "E-Commerce",
            "prediction": "Legitimate",
            "is_fraud": False,
            "fraud_probability": 2.4,
            "risk_level": "LOW",
            "notes": "Verified chip & PIN online session",
        },
        {
            "transaction_id": f"TXN-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": now - timedelta(hours=1, minutes=20),
            "amount": 2840.00,
            "merchant": "CryptoExchange Global",
            "card_last_four": "8819",
            "location": "Lagos, NG",
            "category": "Cryptocurrency",
            "prediction": "Fraudulent",
            "is_fraud": True,
            "fraud_probability": 94.8,
            "risk_level": "HIGH",
            "notes": "Unusual high-velocity international transfer",
        },
        {
            "transaction_id": f"TXN-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": now - timedelta(hours=3),
            "amount": 12.50,
            "merchant": "Starbucks Coffee",
            "card_last_four": "1042",
            "location": "Bengaluru, IN",
            "category": "Dining",
            "prediction": "Legitimate",
            "is_fraud": False,
            "fraud_probability": 0.8,
            "risk_level": "LOW",
            "notes": "Regular contactless POS terminal",
        },
        {
            "transaction_id": f"TXN-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": now - timedelta(hours=5, minutes=45),
            "amount": 1499.00,
            "merchant": "Luxury Watch Co.",
            "card_last_four": "3391",
            "location": "Dubai, AE",
            "category": "Luxury Goods",
            "prediction": "Fraudulent",
            "is_fraud": True,
            "fraud_probability": 86.2,
            "risk_level": "HIGH",
            "notes": "New merchant outside regular spending profile",
        },
        {
            "transaction_id": f"TXN-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": now - timedelta(hours=8),
            "amount": 89.00,
            "merchant": "Netflix Subscription",
            "card_last_four": "4242",
            "location": "Online / Domestic",
            "category": "Streaming / Entertainment",
            "prediction": "Legitimate",
            "is_fraud": False,
            "fraud_probability": 1.1,
            "risk_level": "LOW",
            "notes": "Recurring monthly billing",
        },
        {
            "transaction_id": f"TXN-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": now - timedelta(hours=12),
            "amount": 540.00,
            "merchant": "Electronics Depot",
            "card_last_four": "9921",
            "location": "Delhi, IN",
            "category": "Electronics",
            "prediction": "Legitimate",
            "is_fraud": False,
            "fraud_probability": 14.5,
            "risk_level": "LOW",
            "notes": "3D Secure OTP confirmed",
        },
        {
            "transaction_id": f"TXN-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": now - timedelta(days=1),
            "amount": 3500.00,
            "merchant": "Unknown Merchant Terminal",
            "card_last_four": "7712",
            "location": "Kyiv, UA",
            "category": "Wire Transfer",
            "prediction": "Fraudulent",
            "is_fraud": True,
            "fraud_probability": 98.2,
            "risk_level": "HIGH",
            "notes": "Rapid multi-attempt card testing activity",
        },
    ]

    for item in sample_records:
        rec = Transaction(**item)
        db.add(rec)
    db.commit()
    print(" Seeded 7 sample transactions into PostgreSQL database.")


def init_db():
    """Create tables and initialize database"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_sample_transactions(db)
    finally:
        db.close()
