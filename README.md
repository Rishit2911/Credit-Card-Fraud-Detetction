# 🛡️ FraudShield — Real-Time Credit Card Fraud Detection System
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-1.5%2B-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
An enterprise-grade, end-to-end financial transaction monitoring and fraud detection platform. **FraudShield** combines machine learning inference pipelines with an ultra-responsive FastAPI REST API and a sleek, modern fintech dashboard built in React 19 and TypeScript.
---
## 📌 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Machine Learning Pipeline](#-machine-learning-pipeline)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (FastAPI & ML)](#1-backend-setup-fastapi--ml)
  - [Frontend Setup (React + Vite)](#2-frontend-setup-react--vite)
- [Environment Configuration](#-environment-configuration)
- [Sample Test Scenarios](#-sample-test-scenarios)
- [Contributing](#-contributing)
- [License](#-license)
---
## 🌟 Overview
Financial institutions process billions of card transactions daily, facing sophisticated fraud vectors with sub-second decision requirements. **FraudShield** provides real-time transaction screening using an optimized Machine Learning classification engine trained on PCA-transformed dimensional datasets.
The system evaluates raw and contextual transaction indicators, generates calibrated fraud probability scores (0–100%), classifies transactions into discrete risk tiers (`LOW`, `MEDIUM`, `HIGH`), and records every audit log to an enterprise database with automatic fallback redundancy.
---
## ✨ Key Features
### 🧠 Intelligent Machine Learning Engine
- **Pre-trained Classifier & Scaler**: Leverages serialized `fraud_model.pkl` and `scaler.pkl` trained with Scikit-Learn.
- **PCA Dimensional Alignment**: Maps transactions to the standardized 30-feature vector `[Time, V1...V28, Amount]` from the benchmark credit card dataset.
- **Calibrated Risk Scoring**: Computes probabilistic threat confidence scores and categorizes decisions into actionable banking tiers:
  - 🟢 **LOW RISK (< 35%)**: Automated frictionless clearing.
  - 🟡 **MEDIUM RISK (35% – 69%)**: 3D-Secure / Step-up authentication challenge.
  - 🔴 **HIGH RISK (≥ 70%)**: Immediate transaction block & cardholder security alert.
### 💻 Modern Fintech Dashboard (React 19 + TypeScript)
- **Interactive Virtual Card HUD**: Live EMV chip payment card that updates in real time as merchant, category, and amounts are entered.
- **Dynamic Risk Gauge Meter**: Visual SVG-driven probability breakdown with immediate banking verdict recommendations.
- **One-Click Behavioral Presets**: Instant simulation of standard transactions, international luxury spending, or suspicious crypto OTC transfers.
- **Audit Ledger & History Table**: Live searching, status filtering (Fraud / Legitimate), column sorting, pagination, and record deletion.
- **CSV Ledger Export**: Single-click export of complete transaction history for compliance auditing.
- **Transaction Inspector Modal**: Deep-dive inspector displaying complete PCA feature vectors and metadata.
### ⚡ Resilient & High-Throughput REST API (FastAPI)
- **Sub-50ms Inference**: Asynchronous endpoint execution powered by Uvicorn.
- **Dual-Database Architecture**: Built for PostgreSQL with graceful zero-downtime fallback to SQLite if PostgreSQL is unavailable.
- **Automated Sample Seeding**: Automatically populates sample transactions on initial boot so the dashboard is immediately populated.
- **Swagger & OpenAPI Documentation**: Interactive API documentation generated automatically at `/docs` and `/redoc`.
---
## 🏗️ System Architecture
```mermaid
graph TD
    User([Cardholder / Merchant Terminal]) -->|Submit Transaction| ReactApp[React 19 + Vite Dashboard]
    ReactApp -->|HTTP POST /api/predict| FastAPI[FastAPI Gateway :8000]
    
    subgraph Backend Services
        FastAPI --> PydanticValidator[Pydantic Schema Validation]
        PydanticValidator --> MLService[ML Model Service]
        MLService --> Scaler[StandardScaler (scaler.pkl)]
        Scaler --> Model[Logistic Regression (fraud_model.pkl)]
        Model --> RiskEngine[Risk & Decision Engine]
    end
    
    RiskEngine -->|Verdict & Probabilities| DBRouter{Database Manager}
    DBRouter -->|Primary| Postgres[(PostgreSQL)]
    DBRouter -->|Fallback| SQLite[(SQLite Fallback DB)]
    
    FastAPI -->|JSON Response| ReactApp
    ReactApp -->|Render| AuditTable[Real-time Ledger & Gauge]
🛠️ Tech Stack
Layer	Technologies
Frontend	React 19, TypeScript, Vite 8, Lucide React, Modern Vanilla CSS Design System
Backend API	FastAPI 0.115+, Uvicorn (ASGI), Pydantic v2
Machine Learning	Scikit-Learn, Joblib, NumPy, Pandas
Database & ORM	PostgreSQL 16, SQLite (Resilient fallback), SQLAlchemy 2.0
Development & Quality	Oxlint, Vite HMR, Python Virtual Environments (venv)
📂 Repository Structure
text
Credit-Card-Fraud-Detetction/
├── 📓 Credit Card Fraud Detection Model.ipynb  # ML training & exploratory analysis
├── 🧠 fraud_model.pkl                         # Trained Scikit-Learn model artifact
├── 📏 scaler.pkl                              # Feature StandardScaler artifact
├── 🚀 main.py                                 # FastAPI application & REST routing
├── ⚙️ ml_service.py                            # Inference engine & feature engineering
├── 🗄️ database.py                              # SQLAlchemy models & resilient DB connection
├── 📝 schemas.py                               # Pydantic request & response schemas
├── 📋 requirements.txt                         # Python dependencies
├── 🔐 .env.example                             # Environment variable template
├── 🌐 frontend/                                # React 19 + TypeScript SPA
│   ├── 📁 src/
│   │   ├── App.tsx                            # Root application & API coordinator
│   │   ├── TransactionForm.tsx                # Input form & Virtual Card HUD
│   │   ├── PredictionResult.tsx               # Risk gauge & verdict indicator
│   │   ├── SummaryCards.tsx                   # KPI summary statistics
│   │   ├── TransactionHistoryTable.tsx        # Audit table & CSV exporter
│   │   ├── TransactionModal.tsx               # Transaction drill-down inspector
│   │   ├── index.css                          # Fintech glassmorphism styling
│   │   └── types.ts                           # TypeScript interface definitions
│   ├── package.json                           # Node.js dependencies
│   └── vite.config.ts                         # Vite config with backend proxy
└── 📄 README.md                               # Project documentation
🔬 Machine Learning Pipeline
The detection pipeline is modeled on the landmark Credit Card Fraud Detection dataset (284,807 transactions with 492 frauds):

Dimensionality Reduction: 28 principal components (V1 through V28) obtained via PCA to preserve confidentiality, alongside Time and Amount.
Handling Class Imbalance: Addresses extreme label asymmetry (~0.172% fraud incidence) through class weighting and strategic decision boundary calibration.
Inference Pipeline:
Accepts merchant, amount, category, geolocation, and direct or simulated PCA indicators.
Standardizes the 30-dimensional tensor using StandardScaler.
Computes probability scores via predict_proba().
Normalizes probabilities to a human-readable scale (0.00% to 100.00%).
🔌 API Reference
The backend exposes an interactive Swagger UI at http://127.0.0.1:8000/docs.

Core Endpoints
Method	Endpoint	Description
GET	/api/health	Verifies server status, DB connection, and model readiness
POST	/api/predict	Evaluates transaction, computes fraud probability, and records to DB
GET	/api/stats	Aggregates volume, fraud count, clear count, and overall fraud rate
GET	/api/transactions	Lists transactions with pagination, search, sorting, and status filter
GET	/api/transactions/{id}	Fetches individual transaction inspection record
DELETE	/api/transactions/{id}	Deletes a transaction log from the audit ledger
Example Request (POST /api/predict)
bash
curl -X POST "http://127.0.0.1:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1450.00,
    "merchant": "Swiss Watchmaker Geneva",
    "card_last_four": "9128",
    "location": "Zurich, CH",
    "category": "Luxury Goods",
    "is_foreign": true,
    "distance_km": 6800.0,
    "pin_used": false
  }'
Example Response
json
{
  "id": 12,
  "transaction_id": "TXN-A3B91E04",
  "timestamp": "2026-10-13T09:30:00Z",
  "amount": 1450.0,
  "merchant": "Swiss Watchmaker Geneva",
  "card_last_four": "9128",
  "location": "Zurich, CH",
  "category": "Luxury Goods",
  "prediction": "Fraudulent",
  "is_fraud": true,
  "fraud_probability": 84.5,
  "risk_level": "HIGH",
  "notes": "Flagged by ML Classifier with 84.5% fraud risk probability."
}
🚀 Getting Started
Prerequisites
Ensure you have the following installed:

Python 3.10+
Node.js 18+ and npm
PostgreSQL (Optional — SQLite fallback will activate automatically if PostgreSQL is omitted)
1. Backend Setup (FastAPI & ML)
Navigate to the project root:

bash
cd Credit-Card-Fraud-Detetction
Create and activate a virtual environment:

bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
Install dependencies:

bash
pip install -r requirements.txt
Configure environment variables:

bash
cp .env.example .env
(Update DATABASE_URL in .env if using a local PostgreSQL instance, or leave as default to test the automatic SQLite fallback).

Start the API server:

bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
The API will be live at http://127.0.0.1:8000 with Swagger docs at http://127.0.0.1:8000/docs.

2. Frontend Setup (React + Vite)
Open a new terminal and navigate to the frontend directory:

bash
cd Credit-Card-Fraud-Detetction/frontend
Install frontend dependencies:

bash
npm install
Launch the development server:

bash
npm run dev
Access the application: Open your browser and navigate to:

http://localhost:5173
⚙️ Environment Configuration
Create a .env file in the project root:

env
# Database Connection (PostgreSQL)
# Format: postgresql+psycopg2://<user>:<password>@<host>:<port>/<database>
DATABASE_URL=postgresql+psycopg2://postgres:postgres@127.0.0.1:5432/fraud_detection_db
# Server Configuration
HOST=127.0.0.1
PORT=8000
DEBUG=True
Note on Resiliency: If the backend cannot establish a connection to PostgreSQL on startup, it will log a warning and automatically initialize a local SQLite instance at fraud_detection.db. Zero manual setup required!

🧪 Sample Test Scenarios
Use the built-in quick test buttons in the dashboard to test different fraud vectors:

Scenario	Input Profile	Expected Risk	Recommendation
Coffee Shop (Safe)	$15.20, Domestic, POS Terminal, PIN Verified	🟢 Low Risk (~3-8%)	Auto-Approve
Luxury Goods (Suspicious)	$1,450.00, International (Zurich), Online, No PIN	🟡 Medium/High (~65-85%)	Step-up OTP or Hold
Crypto OTC (Critical)	$3,890.00, P2P Exchange, Remote IP, No PIN	🔴 High Risk (~88-99%)	Immediate Decline & Freeze
🤝 Contributing
Contributions, feedback, and suggestions are welcome!

Fork the Project (https://github.com/Rishit2911/Credit-Card-Fraud-Detetction/fork)
Create your Feature Branch (git checkout -b feature/FeatureName)
Commit your Changes (git commit -m 'Add awesome Feature')
Push to the Branch (git push origin feature/FeatureName)
Open a Pull Request
📄 License
Distributed under the MIT License. See 

LICENSE
 for details.
