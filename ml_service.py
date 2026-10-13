import os
import joblib
import numpy as np
from typing import List, Dict, Optional, Tuple

class MLModelService:
    def __init__(self, model_path: str = "fraud_model.pkl", scaler_path: str = "scaler.pkl"):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.model = None
        self.scaler = None
        self.load_model_and_scaler()

    def load_model_and_scaler(self):
        """Loads trained sklearn model and scaler"""
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                print(f" Loaded model: {self.model_path} ({type(self.model).__name__})")
            except Exception as e:
                print(f" Error loading model from {self.model_path}: {e}")
        else:
            print(f" Model file not found at {self.model_path}")

        if os.path.exists(self.scaler_path):
            try:
                self.scaler = joblib.load(self.scaler_path)
                print(f" Loaded scaler: {self.scaler_path}")
            except Exception as e:
                print(f" Error loading scaler from {self.scaler_path}: {e}")
        else:
            print(f" Scaler file not found at {self.scaler_path} (continuing unscaled)")

    def build_feature_vector(
        self,
        amount: float,
        time_offset: float = 0.0,
        v_features: Optional[Dict[str, float]] = None,
        direct_features: Optional[List[float]] = None,
        is_foreign: bool = False,
        distance_km: float = 0.0,
        pin_used: bool = True
    ) -> List[float]:
        """
        Constructs a 30-feature vector [Time, V1..V28, Amount]
        matching the dataset schema used during training.
        """
        if direct_features is not None and len(direct_features) == 30:
            return [float(x) for x in direct_features]

        # Start with 0.0 for Time
        vec = [float(time_offset)]

        # V1 to V28: default 0.0 or user-provided
        v_dict = v_features or {}
        for i in range(1, 29):
            key = f"V{i}"
            if key in v_dict:
                vec.append(float(v_dict[key]))
            else:
                # Context-aware synthetic heuristic for demo completeness if raw V features aren't entered:
                # In the Kaggle dataset, high negative V14, V12, V10 correlate strongly with fraud
                val = 0.0
                if is_foreign and not pin_used:
                    if i in (14, 12, 10):
                        val = -3.5
                    elif i in (4, 11):
                        val = 2.8
                elif amount > 3000 and distance_km > 500:
                    if i in (14, 10):
                        val = -2.2
                vec.append(val)

        # Feature 29: Amount
        vec.append(float(amount))
        return vec

    def predict(
        self,
        amount: float,
        time_offset: float = 0.0,
        v_features: Optional[Dict[str, float]] = None,
        direct_features: Optional[List[float]] = None,
        is_foreign: bool = False,
        distance_km: float = 0.0,
        pin_used: bool = True
    ) -> Tuple[bool, str, float, str, List[float]]:
        """
        Returns:
            (is_fraud, prediction_label, fraud_probability, risk_level, feature_vector)
        """
        vector = self.build_feature_vector(
            amount=amount,
            time_offset=time_offset,
            v_features=v_features,
            direct_features=direct_features,
            is_foreign=is_foreign,
            distance_km=distance_km,
            pin_used=pin_used
        )

        input_arr = np.array(vector, dtype=float).reshape(1, -1)

        # Apply scaler if present
        if self.scaler is not None:
            try:
                input_arr = self.scaler.transform(input_arr)
            except Exception as e:
                print(f"[WARN] Scaler transform warning: {e}")

        # Execute prediction
        if self.model is None:
            # Fallback heuristic if model is not exported yet
            prob = 85.0 if (amount > 2000 and is_foreign) else 3.5
            is_fraud = prob >= 50.0
        else:
            raw_pred = self.model.predict(input_arr)[0]
            is_fraud = bool(raw_pred == 1)

            if hasattr(self.model, "predict_proba"):
                proba = self.model.predict_proba(input_arr)[0]
                # proba[1] is probability of fraud class
                prob = round(float(proba[1]) * 100.0, 2)
            elif hasattr(self.model, "decision_function"):
                score = self.model.decision_function(input_arr)[0]
                prob = round(min(max(float(score) * 20.0 + 50.0, 0.0), 100.0), 2)
            else:
                prob = 92.0 if is_fraud else 4.0

        # Refine probability alignment
        if is_fraud and prob < 50.0:
            prob = round(50.0 + prob / 2.0, 2)
        elif not is_fraud and prob > 50.0:
            prob = round(prob / 2.0, 2)

        # Determine risk level
        if prob >= 70.0:
            risk_level = "HIGH"
        elif prob >= 35.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        prediction_label = "Fraudulent" if is_fraud else "Legitimate"

        return is_fraud, prediction_label, prob, risk_level, vector

# Singleton instance
ml_service = MLModelService()
