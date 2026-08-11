"""
Credit Card Fraud Detection - Flask Backend
============================================
This file connects your HTML frontend to your trained ML model.

SETUP INSTRUCTIONS:
1. pip install flask flask-cors pandas numpy scikit-learn joblib
2. Place this file in your project folder (same level as fraud_detection.html)
3. Run: python app.py
4. Open: http://localhost:5000
"""

from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import os
import traceback

# ─────────────────────────────────────────────
# APP SETUP
# ─────────────────────────────────────────────
app = Flask(__name__, template_folder=".")  # looks for HTML in same folder
CORS(app)  # allows your frontend to call this backend without CORS errors

# ─────────────────────────────────────────────
# MODEL LOADING
# ─────────────────────────────────────────────
# This runs ONCE when the server starts — not on every request (efficient!)
MODEL = None
SCALER = None  # only needed if you scaled features during training

def load_model():
    """
    Load your trained model from disk.
    
    ── HOW TO SAVE YOUR MODEL from your Jupyter notebook ──
    Add this at the end of your training cell:

        import joblib
        joblib.dump(model, 'fraud_model.pkl')          # save model
        joblib.dump(scaler, 'scaler.pkl')              # save scaler (if used)

    ── Supported model types ──
    Works with any sklearn model:
        LogisticRegression, RandomForestClassifier,
        XGBClassifier, IsolationForest, etc.
    """
    global MODEL, SCALER

    model_path  = 'fraud_model.pkl'   # ← change filename if yours is different
    scaler_path = 'scaler.pkl'        # ← delete/comment out if you didn't use a scaler

    if not os.path.exists(model_path):
        print(f"⚠️  WARNING: '{model_path}' not found.")
        print("   Export your model from the Jupyter notebook first (see instructions above).")
        return

    MODEL = joblib.load(model_path)
    print(f"✅ Model loaded: {model_path}")

    if os.path.exists(scaler_path):
        SCALER = joblib.load(scaler_path)
        print(f"✅ Scaler loaded: {scaler_path}")
    else:
        print("ℹ️  No scaler found — skipping (that's fine if you didn't use one).")

load_model()


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

@app.route('/')
def home():
    """Serve your HTML frontend."""
    return send_from_directory('.', 'fraud_detection.html')


@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint.
    
    ── What your HTML form must send (JSON) ──
    {
        "features": [v1, v2, v3, ..., v28, amount]
    }
    
    ── What this returns ──
    {
        "prediction": "Fraudulent" | "Legitimate",
        "fraud_probability": 0.87,   ← confidence %
        "is_fraud": true | false
    }
    """
    if MODEL is None:
        return jsonify({
            "error": "Model not loaded. Please export fraud_model.pkl from your notebook first."
        }), 503

    try:
        data = request.get_json()

        if not data or 'features' not in data:
            return jsonify({"error": "Missing 'features' key in request body."}), 400

        features = data['features']

        # ── Convert to numpy array ──
        input_array = np.array(features, dtype=float).reshape(1, -1)

        # ── Apply scaler (if you used one during training) ──
        if SCALER is not None:
            input_array = SCALER.transform(input_array)

        # ── Predict ──
        prediction = MODEL.predict(input_array)[0]          # 0 = legit, 1 = fraud
        is_fraud   = bool(prediction == 1)

        # ── Fraud probability (works for most sklearn classifiers) ──
        fraud_probability = 0.0
        if hasattr(MODEL, 'predict_proba'):
            proba = MODEL.predict_proba(input_array)[0]
            # proba[1] = probability of class "1" (fraud)
            fraud_probability = round(float(proba[1]) * 100, 2)
        elif hasattr(MODEL, 'decision_function'):
            # For models like SVM or IsolationForest
            score = MODEL.decision_function(input_array)[0]
            fraud_probability = round(float(abs(score)) * 100, 2)

        return jsonify({
            "prediction":        "Fraudulent" if is_fraud else "Legitimate",
            "fraud_probability": fraud_probability,
            "is_fraud":          is_fraud
        })

    except ValueError as ve:
        return jsonify({"error": f"Invalid input data: {str(ve)}"}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route('/health', methods=['GET'])
def health():
    """Simple health check — visit http://localhost:5000/health to verify server is running."""
    return jsonify({
        "status":       "running",
        "model_loaded": MODEL is not None
    })


@app.route('/model-info', methods=['GET'])
def model_info():
    """Returns basic info about the loaded model (useful for debugging)."""
    if MODEL is None:
        return jsonify({"error": "No model loaded"}), 503
    return jsonify({
        "model_type":    type(MODEL).__name__,
        "scaler_loaded": SCALER is not None
    })


# ─────────────────────────────────────────────
# RUN SERVER
# ─────────────────────────────────────────────
if __name__ == '__main__':
    print("\n" + "="*50)
    print("  Credit Card Fraud Detection - Flask Server")
    print("="*50)
    print("  Frontend → http://localhost:5000")
    print("  Health   → http://localhost:5000/health")
    print("  Predict  → POST http://localhost:5000/predict")
    print("="*50 + "\n")

    app.run(
        host='0.0.0.0',   # accessible on your local network too
        port=5000,
        debug=True        # set to False in production
    )
