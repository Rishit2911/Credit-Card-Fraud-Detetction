from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount in currency units, must be greater than 0")
    merchant: Optional[str] = Field("Online Retailer", max_length=120)
    card_last_four: Optional[str] = Field("4242", min_length=4, max_length=4, description="Last 4 digits of card")
    location: Optional[str] = Field("Domestic", max_length=120)
    category: Optional[str] = Field("Shopping", max_length=80)
    time_offset: Optional[float] = Field(0.0, description="Time feature (seconds elapsed)")
    
    # Optional PCA features V1 through V28
    v_features: Optional[Dict[str, float]] = Field(
        default=None,
        description="Dictionary of PCA features V1 to V28"
    )
    # Or raw list of 30 features: [Time, V1..V28, Amount]
    features: Optional[List[float]] = Field(
        default=None,
        description="Direct 30-feature vector if provided"
    )
    
    # Additional context indicators (for simulated risk features)
    is_foreign: Optional[bool] = Field(False, description="Whether transaction occurred in foreign country")
    distance_km: Optional[float] = Field(0.0, ge=0, description="Distance from usual residence in km")
    pin_used: Optional[bool] = Field(True, description="Whether PIN or 3DS OTP was provided")
    notes: Optional[str] = Field(None, max_length=500)


class TransactionResponse(BaseModel):
    id: int
    transaction_id: str
    timestamp: Optional[str]
    amount: float
    merchant: str
    card_last_four: str
    location: str
    category: str
    prediction: str
    is_fraud: bool
    fraud_probability: float
    risk_level: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class DashboardStatsResponse(BaseModel):
    total_transactions: int
    flagged_transactions: int
    legitimate_transactions: int
    fraud_rate: float
    total_amount: float
    flagged_amount: float
    avg_fraud_probability: float


class PaginatedTransactionsResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[TransactionResponse]
