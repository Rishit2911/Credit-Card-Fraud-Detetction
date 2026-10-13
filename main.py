import os
import uuid
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, asc

from database import init_db, get_db, Transaction
from schemas import (
    TransactionCreate,
    TransactionResponse,
    DashboardStatsResponse,
    PaginatedTransactionsResponse,
)
from ml_service import ml_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and seed sample data
    print("[INFO] Initializing database and ML services...")
    init_db()
    yield
    print("[INFO] Shutting down FraudShield API...")


app = FastAPI(
    title="FraudShield REST API",
    description="Credit Card Fraud Detection REST API powered by Machine Learning and PostgreSQL",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS configuration to allow local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify backend, DB and ML model readiness"""
    try:
        db_count = db.query(Transaction).count()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "model_loaded": ml_service.model is not None,
        "scaler_loaded": ml_service.scaler is not None,
        "database_status": db_status,
        "total_records_stored": db_count if db_status == "connected" else 0,
    }


@app.post("/api/predict", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def predict_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    """
    POST /api/predict:
    1. Validates input transaction details.
    2. Runs inference through the trained Machine Learning model.
    3. Persists the transaction, result, and timestamp to PostgreSQL.
    4. Returns the verdict, risk probability, and unique transaction ID.
    """
    try:
        # Run ML model prediction
        is_fraud, prediction_label, fraud_prob, risk_level, vector = ml_service.predict(
            amount=payload.amount,
            time_offset=payload.time_offset or 0.0,
            v_features=payload.v_features,
            direct_features=payload.features,
            is_foreign=payload.is_foreign or False,
            distance_km=payload.distance_km or 0.0,
            pin_used=payload.pin_used if payload.pin_used is not None else True,
        )

        # Generate unique transaction ID
        txn_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"

        # Create database record
        notes = payload.notes
        if not notes:
            if is_fraud:
                notes = f"Flagged by ML Classifier with {fraud_prob}% fraud risk probability."
            else:
                notes = f"Verified standard transaction pattern ({fraud_prob}% risk)."

        new_transaction = Transaction(
            transaction_id=txn_id,
            amount=round(payload.amount, 2),
            merchant=payload.merchant or "Online Retailer",
            card_last_four=payload.card_last_four or "4242",
            location=payload.location or "Domestic",
            category=payload.category or "Shopping",
            prediction=prediction_label,
            is_fraud=is_fraud,
            fraud_probability=fraud_prob,
            risk_level=risk_level,
            features=vector,
            notes=notes,
        )

        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)

        return new_transaction.to_dict()

    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Invalid transaction input: {str(ve)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Prediction or database error: {str(e)}")


@app.get("/api/transactions", response_model=PaginatedTransactionsResponse)
def get_transactions(
    search: Optional[str] = Query(None, description="Search by merchant, location, transaction ID, or category"),
    status: Optional[str] = Query("all", description="'all', 'fraud', or 'legit'"),
    risk_level: Optional[str] = Query(None, description="'LOW', 'MEDIUM', or 'HIGH'"),
    sort_by: str = Query("timestamp", description="'timestamp', 'amount', or 'fraud_probability'"),
    order: str = Query("desc", description="'asc' or 'desc'"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Records per page"),
    db: Session = Depends(get_db),
):
    """
    GET /api/transactions:
    Retrieves saved transaction history from PostgreSQL with SQL filtering, searching, and sorting.
    """
    query = db.query(Transaction)

    # Search filter
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Transaction.transaction_id.ilike(search_filter),
                Transaction.merchant.ilike(search_filter),
                Transaction.location.ilike(search_filter),
                Transaction.category.ilike(search_filter),
                Transaction.card_last_four.ilike(search_filter),
            )
        )

    # Status filter
    if status == "fraud":
        query = query.filter(Transaction.is_fraud == True)
    elif status == "legit":
        query = query.filter(Transaction.is_fraud == False)

    # Risk level filter
    if risk_level and risk_level.upper() in ("LOW", "MEDIUM", "HIGH"):
        query = query.filter(Transaction.risk_level == risk_level.upper())

    # Sorting
    sort_column = Transaction.timestamp
    if sort_by == "amount":
        sort_column = Transaction.amount
    elif sort_by == "fraud_probability":
        sort_column = Transaction.fraud_probability

    if order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    total = query.count()
    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": [item.to_dict() for item in items],
    }


@app.get("/api/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    GET /api/stats:
    Computes key summary cards metrics:
    Total Transactions, Flagged Transactions, Legitimate Transactions, Fraud Rate %.
    """
    total = db.query(Transaction).count()
    if total == 0:
        return {
            "total_transactions": 0,
            "flagged_transactions": 0,
            "legitimate_transactions": 0,
            "fraud_rate": 0.0,
            "total_amount": 0.0,
            "flagged_amount": 0.0,
            "avg_fraud_probability": 0.0,
        }

    flagged = db.query(Transaction).filter(Transaction.is_fraud == True).count()
    legit = total - flagged
    fraud_rate = round((flagged / total) * 100.0, 2)

    total_amount = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).scalar()
    flagged_amount = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(Transaction.is_fraud == True).scalar()
    avg_prob = db.query(func.coalesce(func.avg(Transaction.fraud_probability), 0.0)).scalar()

    return {
        "total_transactions": total,
        "flagged_transactions": flagged,
        "legitimate_transactions": legit,
        "fraud_rate": fraud_rate,
        "total_amount": round(float(total_amount), 2),
        "flagged_amount": round(float(flagged_amount), 2),
        "avg_fraud_probability": round(float(avg_prob), 2),
    }


@app.get("/api/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction_by_id(transaction_id: str, db: Session = Depends(get_db)):
    """Retrieve a single transaction by ID or database ID"""
    if transaction_id.isdigit():
        txn = db.query(Transaction).filter(Transaction.id == int(transaction_id)).first()
    else:
        txn = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn.to_dict()


@app.delete("/api/transactions/{transaction_id}", status_code=status.HTTP_200_OK)
def delete_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """Delete a transaction by ID (CRUD demonstration)"""
    if transaction_id.isdigit():
        txn = db.query(Transaction).filter(Transaction.id == int(transaction_id)).first()
    else:
        txn = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(txn)
    db.commit()
    return {"message": f"Transaction {transaction_id} deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
