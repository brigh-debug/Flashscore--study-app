import numpy as np
import logging
import pickle
import os
from typing import Dict, List, Any, Optional
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_FILE = "magajico_model.pkl"


class MagajiCoMLPredictor:
    def __init__(self, model_path: Optional[str] = MODEL_FILE):
        """
        Initialize MagajiCo ML Predictor.
        Supports either loading a pre-trained model or using fallback strategic rules.
        """
        self.model_version = "MagajiCo-v2.1"
        self.features_required = 7
        self.prediction_types = ["home", "draw", "away"]
        self.model = None
        self.scaler = None
        self.accuracy = 0.0

        if model_path and os.path.exists(model_path):
            try:
                with open(model_path, "rb") as f:
                    saved = pickle.load(f)
                    self.model = saved["model"]
                    self.scaler = saved["scaler"]
                    self.accuracy = saved.get("accuracy", 0.0)
                logger.info(f"✅ Loaded trained model from {model_path}")
            except Exception as e:
                logger.error(f"⚠️ Failed to load model: {e}, using rule-based fallback")
        else:
            logger.info("⚠️ No trained model found, using MagajiCo strategic v2.0 rules")

    # =====================================
    # TRAINING
    # =====================================
    def train(self, data: List[List[float]], labels: List[int]) -> Dict[str, Any]:
        """
        Train model using numeric features and labels.
        """
        if len(data) == 0 or len(data[0]) != self.features_required:
            raise ValueError(f"Training data must have {self.features_required} features per sample.")

        X = np.array(data)
        y = np.array(labels)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        self.model = LogisticRegression(max_iter=500)
        self.model.fit(X_train_scaled, y_train)

        y_pred = self.model.predict(X_test_scaled)
        self.accuracy = float(accuracy_score(y_test, y_pred))

        # Save model
        with open(MODEL_FILE, "wb") as f:
            pickle.dump({"model": self.model, "scaler": self.scaler, "accuracy": self.accuracy}, f)

        logger.info(f"✅ Model trained with accuracy: {self.accuracy:.2f}")

        return {
            "message": "Training complete",
            "accuracy": self.accuracy,
            "model_version": self.model_version,
        }

    # =====================================
    # PREDICTION
    # =====================================
    def predict(self, features: List[float]) -> Dict[str, Any]:
        """
        Predict match outcome using trained model or fallback logic.
        Features: [home_strength, away_strength, home_advantage,
                   recent_form_home, recent_form_away, head_to_head, injuries]
        """
        if len(features) < self.features_required:
            raise ValueError(f"At least {self.features_required} features required")

        try:
            if self.model:
                features_array = np.array([features])
                features_scaled = self.scaler.transform(features_array)
                probabilities = self.model.predict_proba(features_scaled)[0]
                prediction_index = int(np.argmax(probabilities))

                return {
                    "prediction": self.prediction_types[prediction_index],
                    "confidence": float(np.max(probabilities)),
                    "probabilities": {
                        "home": float(probabilities[0]),
                        "draw": float(probabilities[1]),
                        "away": float(probabilities[2]),
                    },
                    "model_version": self.model_version,
                    "using_model": True,
                }

            else:
                return self._fallback_predict(features)

        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise

    # =====================================
    # FALLBACK (Rule-based)
    # =====================================
    def _fallback_predict(self, features: List[float]) -> Dict[str, Any]:
        home_strength, away_strength, home_advantage, recent_form_home, recent_form_away, head_to_head, injuries = features

        home_score = (
            home_strength * 0.3
            + home_advantage * 0.2
            + recent_form_home * 0.25
            + head_to_head * 0.15
            + injuries * 0.1
        )

        away_score = (
            away_strength * 0.3
            + (1 - home_advantage) * 0.1
            + recent_form_away * 0.25
            + (1 - head_to_head) * 0.15
            + injuries * 0.2
        )

        total_score = home_score + away_score + 0.5
        home_prob, away_prob, draw_prob = (
            home_score / total_score,
            away_score / total_score,
            0.5 / total_score,
        )

        total_prob = home_prob + draw_prob + away_prob
        home_prob /= total_prob
        draw_prob /= total_prob
        away_prob /= total_prob

        if home_prob > max(away_prob, draw_prob):
            prediction, confidence = "home", home_prob
        elif away_prob > max(home_prob, draw_prob):
            prediction, confidence = "away", away_prob
        else:
            prediction, confidence = "draw", draw_prob

        return {
            "prediction": prediction,
            "confidence": float(confidence),
            "probabilities": {
                "home": float(home_prob),
                "draw": float(draw_prob),
                "away": float(away_prob),
            },
            "model_version": self.model_version,
            "using_model": False,
        }

    # =====================================
    # MODEL INFO
    # =====================================
    def get_model_info(self) -> Dict[str, Any]:
        return {
            "version": self.model_version,
            "accuracy": self.accuracy,
            "features_required": self.features_required,
            "prediction_types": self.prediction_types,
            "using_model": bool(self.model),
        }