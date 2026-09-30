"""
CardioVision-3D: FastAPI Backend Service
Provides coronary artery disease risk assessment and 3D vessel stenosis predictions with SHAP explainability.
"""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, Any, List
import numpy as np
import pandas as pd
import joblib
import shap

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# Paths
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

# Global artifacts and explainers storage
ARTIFACTS: Dict[str, Any] = {}
EXPLAINERS: Dict[str, Any] = {}


def load_artifacts():
    """Load model pipelines, scaler, and metadata from backend/models/."""
    try:
        metadata_path = MODELS_DIR / "metadata.joblib"
        scaler_path = MODELS_DIR / "scaler.joblib"
        cad_path = MODELS_DIR / "cad_model.joblib"
        lad_path = MODELS_DIR / "lad_model.joblib"
        lcx_path = MODELS_DIR / "lcx_model.joblib"
        rca_path = MODELS_DIR / "rca_model.joblib"

        if not all(p.exists() for p in [metadata_path, scaler_path, cad_path, lad_path, lcx_path, rca_path]):
            raise FileNotFoundError(
                f"Missing model files in {MODELS_DIR}. Run backend/train_models.py first."
            )

        ARTIFACTS["metadata"] = joblib.load(metadata_path)
        ARTIFACTS["scaler"] = joblib.load(scaler_path)
        ARTIFACTS["cad_model"] = joblib.load(cad_path)
        ARTIFACTS["lad_model"] = joblib.load(lad_path)
        ARTIFACTS["lcx_model"] = joblib.load(lcx_path)
        ARTIFACTS["rca_model"] = joblib.load(rca_path)

        # Pre-initialize SHAP TreeExplainers for fast inference
        EXPLAINERS["CAD"] = shap.TreeExplainer(ARTIFACTS["cad_model"])
        EXPLAINERS["LAD"] = shap.TreeExplainer(ARTIFACTS["lad_model"])
        EXPLAINERS["LCX"] = shap.TreeExplainer(ARTIFACTS["lcx_model"])
        EXPLAINERS["RCA"] = shap.TreeExplainer(ARTIFACTS["rca_model"])

        print("[CardioVision-3D] All ML models, scaler, and SHAP explainers loaded successfully.")
    except Exception as e:
        print(f"[CardioVision-3D] Warning during artifact load: {e}")
        raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_artifacts()
    yield


app = FastAPI(
    title="CardioVision 3D API",
    description="Machine Learning & SHAP Explainability Service for 3D Cardiovascular Risk Analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS Middleware
# Seamless communication with frontend on http://localhost:5173
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientInput(BaseModel):
    # Demographics & Lifestyle
    age: float = Field(..., ge=18, le=110, description="Patient age (years)")
    sex: int = Field(..., ge=0, le=1, description="Biological sex (0: Female, 1: Male)")
    bmi: float = Field(..., ge=12.0, le=65.0, description="Body Mass Index (kg/m^2)")
    smoking: int = Field(0, ge=0, le=1, description="Current smoker (0: No, 1: Yes)")
    diabetes: int = Field(0, ge=0, le=1, description="History of diabetes (0: No, 1: Yes)")
    hypertension: int = Field(0, ge=0, le=1, description="History of hypertension (0: No, 1: Yes)")
    family_history: int = Field(0, ge=0, le=1, description="Family history of premature CAD (0: No, 1: Yes)")

    # Clinical Examination
    systolic_bp: float = Field(..., ge=70.0, le=260.0, description="Systolic blood pressure (mmHg)")
    diastolic_bp: float = Field(..., ge=40.0, le=160.0, description="Diastolic blood pressure (mmHg)")
    heart_rate: float = Field(..., ge=35.0, le=220.0, description="Resting heart rate (bpm)")

    # Laboratory
    total_cholesterol: float = Field(..., ge=80.0, le=550.0, description="Total serum cholesterol (mg/dL)")
    ldl: float = Field(..., ge=30.0, le=350.0, description="Low-density lipoprotein (mg/dL)")
    hdl: float = Field(..., ge=10.0, le=150.0, description="High-density lipoprotein (mg/dL)")
    triglycerides: float = Field(..., ge=30.0, le=900.0, description="Triglycerides (mg/dL)")
    fasting_blood_sugar: float = Field(..., ge=50.0, le=500.0, description="Fasting blood glucose (mg/dL)")
    troponin_i: float = Field(0.015, ge=0.0, le=25.0, description="Cardiac Troponin I (ng/mL)")
    ck_mb: float = Field(2.5, ge=0.0, le=300.0, description="Creatine Kinase-MB (ng/mL)")

    # ECG & Echocardiographic
    st_elevation: int = Field(0, ge=0, le=1, description="ECG ST Elevation (0: No, 1: Yes)")
    t_inversion: int = Field(0, ge=0, le=1, description="ECG T-Wave Inversion (0: No, 1: Yes)")
    lvh: int = Field(0, ge=0, le=1, description="Left Ventricular Hypertrophy (0: No, 1: Yes)")
    ejection_fraction: float = Field(..., ge=15.0, le=85.0, description="Left ventricular ejection fraction (%)")
    region_rwma: str = Field(
        "None",
        description="Regional Wall Motion Abnormality (None, Anterior, Inferior, Lateral, Septal, Apical)"
    )

    @field_validator("region_rwma")
    @classmethod
    def validate_region_rwma(cls, v: str) -> str:
        valid_regions = {"None", "Anterior", "Inferior", "Lateral", "Septal", "Apical"}
        normalized = v.strip().capitalize()
        if normalized not in valid_regions:
            raise ValueError(f"region_rwma must be one of {valid_regions}")
        return normalized

    class Config:
        json_schema_extra = {
            "example": {
                "age": 62,
                "sex": 1,
                "bmi": 28.4,
                "smoking": 1,
                "diabetes": 1,
                "hypertension": 1,
                "family_history": 1,
                "systolic_bp": 146,
                "diastolic_bp": 92,
                "heart_rate": 78,
                "total_cholesterol": 235,
                "ldl": 155,
                "hdl": 38,
                "triglycerides": 210,
                "fasting_blood_sugar": 138,
                "troponin_i": 0.08,
                "ck_mb": 6.8,
                "st_elevation": 1,
                "t_inversion": 1,
                "lvh": 1,
                "ejection_fraction": 48.0,
                "region_rwma": "Anterior"
            }
        }


def get_risk_tier(probability: float) -> str:
    """Classify probability into standard clinical risk tiers."""
    if probability < 0.35:
        return "Low"
    elif probability < 0.65:
        return "Moderate"
    else:
        return "High"


def compute_shap_importance(explainer, X_scaled_row, feature_names: List[str], top_k: int = 6) -> List[Dict[str, Any]]:
    """Compute local SHAP feature attribution values for a single patient."""
    try:
        raw_shap = explainer.shap_values(X_scaled_row)
        if isinstance(raw_shap, list):
            # Binary classification: index 1 represents positive class
            values = raw_shap[1][0] if len(raw_shap) > 1 else raw_shap[0][0]
        elif hasattr(raw_shap, "ndim") and raw_shap.ndim == 3:
            values = raw_shap[0, :, 1] if raw_shap.shape[2] > 1 else raw_shap[0, :, 0]
        elif hasattr(raw_shap, "ndim") and raw_shap.ndim == 2:
            values = raw_shap[0, :]
        else:
            values = np.array(raw_shap).flatten()

        contributions = []
        for name, val in zip(feature_names, values):
            contributions.append({
                "feature": name,
                "shap_value": round(float(val), 4),
                "impact": "Increases Risk" if val > 0 else "Decreases Risk",
                "magnitude": round(float(abs(val)), 4)
            })

        # Sort descending by magnitude of attribution
        contributions.sort(key=lambda x: x["magnitude"], reverse=True)
        return contributions[:top_k]
    except Exception as e:
        print(f"[SHAP Error]: {e}")
        return []


def build_feature_vector(patient: PatientInput, expected_features: List[str]) -> pd.DataFrame:
    """Map validated PatientInput fields to the exact feature matrix order."""
    row_dict = {
        "Age": patient.age,
        "Sex": patient.sex,
        "BMI": patient.bmi,
        "Smoking": patient.smoking,
        "Diabetes": patient.diabetes,
        "Hypertension": patient.hypertension,
        "Family_History": patient.family_history,
        "Systolic_BP": patient.systolic_bp,
        "Diastolic_BP": patient.diastolic_bp,
        "Heart_Rate": patient.heart_rate,
        "Total_Cholesterol": patient.total_cholesterol,
        "LDL": patient.ldl,
        "HDL": patient.hdl,
        "Triglycerides": patient.triglycerides,
        "Fasting_Blood_Sugar": patient.fasting_blood_sugar,
        "Troponin_I": patient.troponin_i,
        "CK_MB": patient.ck_mb,
        "ST_Elevation": patient.st_elevation,
        "T_Inversion": patient.t_inversion,
        "LVH": patient.lvh,
        "Ejection_Fraction": patient.ejection_fraction,
        # RWMA one-hot indicators
        "RWMA_Anterior": 1 if patient.region_rwma == "Anterior" else 0,
        "RWMA_Apical": 1 if patient.region_rwma == "Apical" else 0,
        "RWMA_Inferior": 1 if patient.region_rwma == "Inferior" else 0,
        "RWMA_Lateral": 1 if patient.region_rwma == "Lateral" else 0,
        "RWMA_Septal": 1 if patient.region_rwma == "Septal" else 0,
        "RWMA_None": 1 if patient.region_rwma == "None" else 0,
    }

    # Ensure vector matches the exact model feature columns
    ordered_row = {col: row_dict.get(col, 0) for col in expected_features}
    return pd.DataFrame([ordered_row])


@app.get("/")
def health_check():
    """Health check endpoint confirming API status and model readiness."""
    models_ready = bool(
        ARTIFACTS.get("cad_model") and
        ARTIFACTS.get("lad_model") and
        ARTIFACTS.get("lcx_model") and
        ARTIFACTS.get("rca_model") and
        ARTIFACTS.get("scaler")
    )
    return {
        "status": "healthy",
        "service": "CardioVision 3D API",
        "version": "1.0.0",
        "models_loaded": models_ready,
        "vessels_tracked": ["LAD", "LCX", "RCA"]
    }


@app.post("/predict")
def predict_cardiovascular_risk(patient: PatientInput):
    """
    Run patient feature vector through trained models, calculate overall CAD risk,
    predict >=50% stenosis probabilities across LAD, LCX, and RCA coronary vessels,
    and return SHAP local feature attributions.
    """
    if "scaler" not in ARTIFACTS:
        raise HTTPException(
            status_code=503,
            detail="Models not ready. Ensure models are trained and server has completed startup."
        )

    scaler = ARTIFACTS["scaler"]
    feature_names = ARTIFACTS["metadata"]["feature_names"]

    # 1. Build and scale feature vector
    df_patient = build_feature_vector(patient, feature_names)
    X_scaled = scaler.transform(df_patient)

    # 2. Run model predictions and probabilities
    cad_prob = float(ARTIFACTS["cad_model"].predict_proba(X_scaled)[0, 1])
    lad_prob = float(ARTIFACTS["lad_model"].predict_proba(X_scaled)[0, 1])
    lcx_prob = float(ARTIFACTS["lcx_model"].predict_proba(X_scaled)[0, 1])
    rca_prob = float(ARTIFACTS["rca_model"].predict_proba(X_scaled)[0, 1])

    # 3. Compute SHAP local explanations for CAD and vessel branches
    shap_cad = compute_shap_importance(EXPLAINERS["CAD"], X_scaled, feature_names, top_k=6)
    shap_lad = compute_shap_importance(EXPLAINERS["LAD"], X_scaled, feature_names, top_k=5)
    shap_lcx = compute_shap_importance(EXPLAINERS["LCX"], X_scaled, feature_names, top_k=5)
    shap_rca = compute_shap_importance(EXPLAINERS["RCA"], X_scaled, feature_names, top_k=5)

    # 4. Synthesize clinical response payload
    return {
        "overall_cad": {
            "probability": round(cad_prob, 4),
            "percentage": round(cad_prob * 100, 1),
            "risk_tier": get_risk_tier(cad_prob),
            "stenosis_predicted": bool(cad_prob >= 0.50),
            "top_shap_features": shap_cad
        },
        "vessels": {
            "LAD": {
                "name": "Left Anterior Descending Artery",
                "probability": round(lad_prob, 4),
                "percentage": round(lad_prob * 100, 1),
                "stenosis_50_plus": bool(lad_prob >= 0.50),
                "risk_tier": get_risk_tier(lad_prob),
                "top_shap_features": shap_lad
            },
            "LCX": {
                "name": "Left Circumflex Artery",
                "probability": round(lcx_prob, 4),
                "percentage": round(lcx_prob * 100, 1),
                "stenosis_50_plus": bool(lcx_prob >= 0.50),
                "risk_tier": get_risk_tier(lcx_prob),
                "top_shap_features": shap_lcx
            },
            "RCA": {
                "name": "Right Coronary Artery",
                "probability": round(rca_prob, 4),
                "percentage": round(rca_prob * 100, 1),
                "stenosis_50_plus": bool(rca_prob >= 0.50),
                "risk_tier": get_risk_tier(rca_prob),
                "top_shap_features": shap_rca
            }
        },
        "summary": {
            "high_risk_vessels": [
                vessel for vessel, prob in [("LAD", lad_prob), ("LCX", lcx_prob), ("RCA", rca_prob)]
                if prob >= 0.50
            ],
            "max_vessel_risk": round(float(max(lad_prob, lcx_prob, rca_prob)), 4),
            "clinical_recommendation": (
                "Immediate cardiology consult and coronary angiography recommended."
                if cad_prob >= 0.65 or max(lad_prob, lcx_prob, rca_prob) >= 0.65
                else "Cardiology follow-up and non-invasive stress imaging recommended."
                if cad_prob >= 0.35 or max(lad_prob, lcx_prob, rca_prob) >= 0.35
                else "Routine cardiovascular prevention and lifestyle maintenance."
            )
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
