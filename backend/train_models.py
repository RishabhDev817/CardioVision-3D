"""
CardioVision-3D: Machine Learning Training Pipeline
Predictive modeling for coronary artery disease (CAD) and vessel-specific stenosis (LAD, LCX, RCA).
"""

import os
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report
)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DATA_FILE = DATA_DIR / "cad_clinical_data.csv"

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)


def generate_clinical_dataset(n_samples: int = 1200) -> pd.DataFrame:
    """
    Synthesize a clinically realistic dataset containing:
    - Demographic: Age, Sex, BMI, Smoking, Diabetes, Hypertension, Family_History
    - Clinical Examination: Systolic_BP, Diastolic_BP, Heart_Rate
    - Laboratory: Total_Cholesterol, LDL, HDL, Triglycerides, Fasting_Blood_Sugar,
      Cardiac Enzymes (Troponin_I, CK_MB)
    - ECG: ST_Elevation, T_Inversion, LVH
    - Echocardiography: Ejection_Fraction, Region_RWMA (Regional Wall Motion Abnormality)
    - Target columns: LAD, LCX, RCA (>=50% stenosis), Cath, CAD
    """
    print(f"Generating synthetic clinical dataset ({n_samples} patient records)...")

    # Demographic & Lifestyle
    age = np.random.normal(loc=58.5, scale=10.5, size=n_samples).clip(30, 85).astype(int)
    sex = np.random.binomial(n=1, p=0.62, size=n_samples)  # 1: Male, 0: Female
    bmi = np.random.normal(loc=27.8, scale=4.6, size=n_samples).clip(18.5, 45.0).round(1)
    smoking = np.random.binomial(n=1, p=0.38, size=n_samples)
    diabetes = np.random.binomial(n=1, p=0.29, size=n_samples)
    hypertension = np.random.binomial(n=1, p=0.48, size=n_samples)
    family_history = np.random.binomial(n=1, p=0.34, size=n_samples)

    # Clinical Examination
    systolic_bp = (110 + 15 * hypertension + np.random.normal(12, 16, n_samples)).clip(90, 210).astype(int)
    diastolic_bp = (70 + 8 * hypertension + np.random.normal(8, 10, n_samples)).clip(55, 125).astype(int)
    heart_rate = np.random.normal(loc=74, scale=12, size=n_samples).clip(48, 125).astype(int)

    # Laboratory
    total_chol = np.random.normal(loc=205, scale=42, size=n_samples).clip(110, 360).round(1)
    ldl = (0.6 * total_chol + np.random.normal(0, 15, n_samples)).clip(50, 260).round(1)
    hdl = np.random.normal(loc=44 - 4 * sex, scale=10, size=n_samples).clip(20, 85).round(1)
    triglycerides = np.random.normal(loc=165 + 30 * diabetes, scale=55, size=n_samples).clip(60, 480).round(1)
    fasting_blood_sugar = (85 + 45 * diabetes + np.random.normal(10, 20, n_samples)).clip(70, 300).round(1)

    # Echocardiography & ECG features
    ejection_fraction = (58 - 5 * (age > 65) - 6 * diabetes + np.random.normal(0, 8, n_samples)).clip(25, 70).round(1)
    lvh = np.random.binomial(n=1, p=np.clip(0.15 + 0.25 * hypertension, 0.05, 0.65), size=n_samples)

    # Regional Wall Motion Abnormality (RWMA) regions: None, Anterior, Inferior, Lateral, Septal, Apical
    rwma_categories = ["None", "Anterior", "Inferior", "Lateral", "Septal", "Apical"]
    rwma_probs = [0.42, 0.18, 0.15, 0.11, 0.09, 0.05]
    region_rwma = np.random.choice(rwma_categories, size=n_samples, p=rwma_probs)

    # ECG Ischemia Signs
    # ST Elevation risk boosted if acute ischemia / regional RWMA present
    prob_st = np.where(region_rwma != "None", 0.35, 0.06)
    st_elevation = np.random.binomial(n=1, p=prob_st, size=n_samples)

    prob_t_inv = np.where((region_rwma != "None") | (lvh == 1), 0.40, 0.12)
    t_inversion = np.random.binomial(n=1, p=prob_t_inv, size=n_samples)

    # Cardiac Enzymes (Troponin I and CK-MB)
    # Elevated when ST elevation, significant RWMA, or reduced EF
    cardiac_stress = (
        0.4 * st_elevation +
        0.3 * (region_rwma != "None").astype(int) +
        0.3 * (ejection_fraction < 45).astype(int)
    )
    troponin_i = (
        0.015 + 0.45 * cardiac_stress * np.random.exponential(scale=1.2, size=n_samples) +
        np.random.exponential(scale=0.03, size=n_samples)
    ).clip(0.005, 3.5).round(3)

    ck_mb = (
        2.5 + 8.0 * cardiac_stress * np.random.exponential(scale=1.0, size=n_samples) +
        np.random.exponential(scale=1.5, size=n_samples)
    ).clip(0.5, 55.0).round(2)

    # Biologically grounded vessel stenosis generation (>=50% narrowing)
    # LAD: anterior wall & septum supply
    lad_logit = (
        -3.2
        + 0.045 * (age - 50)
        + 0.55 * sex
        + 0.65 * smoking
        + 0.009 * (ldl - 100)
        + 1.4 * ((region_rwma == "Anterior") | (region_rwma == "Septal")).astype(int)
        + 1.1 * st_elevation
        + 0.6 * t_inversion
        + 0.8 * (troponin_i > 0.08).astype(int)
    )
    lad_prob = 1 / (1 + np.exp(-np.clip(lad_logit, -5, 5)))
    lad_stenosis = np.random.binomial(n=1, p=lad_prob, size=n_samples)

    # LCX: lateral wall supply
    lcx_logit = (
        -3.5
        + 0.038 * (age - 50)
        + 0.45 * sex
        + 0.75 * diabetes
        + 0.55 * hypertension
        + 0.008 * (total_chol - 180)
        + 1.6 * (region_rwma == "Lateral").astype(int)
        + 0.5 * t_inversion
        + 0.5 * (troponin_i > 0.08).astype(int)
    )
    lcx_prob = 1 / (1 + np.exp(-np.clip(lcx_logit, -5, 5)))
    lcx_stenosis = np.random.binomial(n=1, p=lcx_prob, size=n_samples)

    # RCA: inferior wall supply
    rca_logit = (
        -3.3
        + 0.040 * (age - 50)
        + 0.50 * sex
        + 0.60 * smoking
        + 0.70 * hypertension
        + 0.005 * (triglycerides - 150)
        + 1.5 * (region_rwma == "Inferior").astype(int)
        + 0.7 * st_elevation
        + 0.6 * (troponin_i > 0.08).astype(int)
    )
    rca_prob = 1 / (1 + np.exp(-np.clip(rca_logit, -5, 5)))
    rca_stenosis = np.random.binomial(n=1, p=rca_prob, size=n_samples)

    # Overall Cath & CAD status
    # Cath: angiographic confirmation of CAD (1 if any major vessel >=50% or diffuse disease)
    diffuse_disease_noise = np.random.binomial(n=1, p=0.04, size=n_samples)
    cath = ((lad_stenosis | lcx_stenosis | rca_stenosis | diffuse_disease_noise) == 1).astype(int)
    cad = cath.copy()

    df = pd.DataFrame({
        "Age": age,
        "Sex": sex,
        "BMI": bmi,
        "Smoking": smoking,
        "Diabetes": diabetes,
        "Hypertension": hypertension,
        "Family_History": family_history,
        "Systolic_BP": systolic_bp,
        "Diastolic_BP": diastolic_bp,
        "Heart_Rate": heart_rate,
        "Total_Cholesterol": total_chol,
        "LDL": ldl,
        "HDL": hdl,
        "Triglycerides": triglycerides,
        "Fasting_Blood_Sugar": fasting_blood_sugar,
        "Troponin_I": troponin_i,
        "CK_MB": ck_mb,
        "ST_Elevation": st_elevation,
        "T_Inversion": t_inversion,
        "LVH": lvh,
        "Ejection_Fraction": ejection_fraction,
        "Region_RWMA": region_rwma,
        # Vessel and Catheterization Targets
        "LAD": lad_stenosis,
        "LCX": lcx_stenosis,
        "RCA": rca_stenosis,
        "Cath": cath,
        "CAD": cad
    })

    return df


def load_or_create_dataset() -> pd.DataFrame:
    """Loads dataset from disk if present, else creates and persists it."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if DATA_FILE.exists():
        print(f"Loading existing clinical dataset from {DATA_FILE}...")
        df = pd.read_csv(DATA_FILE)
    else:
        df = generate_clinical_dataset(n_samples=1500)
        df.to_csv(DATA_FILE, index=False)
        print(f"Dataset successfully saved to {DATA_FILE}")
    return df


def preprocess_data(df: pd.DataFrame):
    """
    Preprocess clinical features and isolate targets.
    Enforces the CRITICAL RULE against target leakage.
    """
    # Isolate targets
    targets = {
        "CAD": df["CAD"].astype(int),
        "LAD": df["LAD"].astype(int),
        "LCX": df["LCX"].astype(int),
        "RCA": df["RCA"].astype(int)
    }

    # CRITICAL RULE: Explicitly drop columns LAD, LCX, RCA, and Cath from the feature matrix X to prevent target leakage.
    leakage_columns = ["LAD", "LCX", "RCA", "Cath"]
    drop_columns = [col for col in leakage_columns if col in df.columns]
    
    # Also drop CAD from X to prevent trivial leakage when training vessel models
    if "CAD" in df.columns and "CAD" not in drop_columns:
        drop_columns.append("CAD")

    print(f"\n[TARGET LEAKAGE CHECK]")
    print(f"Explicitly dropping leakage columns from feature matrix X: {drop_columns}")
    X = df.drop(columns=drop_columns).copy()

    # One-hot encode categorical feature: Region_RWMA
    if "Region_RWMA" in X.columns:
        X = pd.get_dummies(X, columns=["Region_RWMA"], prefix="RWMA", drop_first=False)
        # Ensure all standard RWMA columns exist
        standard_rwma_cols = [
            "RWMA_None", "RWMA_Anterior", "RWMA_Inferior", 
            "RWMA_Lateral", "RWMA_Septal", "RWMA_Apical"
        ]
        for col in standard_rwma_cols:
            if col not in X.columns:
                X[col] = 0
            else:
                X[col] = X[col].astype(int)

    feature_names = list(X.columns)
    print(f"Preprocessed feature count: {len(feature_names)}")
    print(f"Feature matrix columns: {feature_names}")

    # Double verify that none of the leakage columns are in X
    for col in leakage_columns:
        assert col not in X.columns, f"CRITICAL ERROR: Leakage column {col} found in feature matrix X!"

    return X, targets, feature_names


def train_and_evaluate():
    """Execute training pipeline for all cardiovascular targets."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    df = load_or_create_dataset()

    X, targets, feature_names = preprocess_data(df)

    # Train-test split
    indices = np.arange(len(X))
    X_train_raw, X_test_raw, idx_train, idx_test = train_test_split(
        X, indices, test_size=0.20, random_state=RANDOM_SEED, stratify=targets["CAD"]
    )

    # Fit standard scaler on continuous/numeric features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_raw)
    X_test_scaled = scaler.transform(X_test_raw)

    # Save fitted scaler
    scaler_path = MODELS_DIR / "scaler.joblib"
    joblib.dump(scaler, scaler_path)
    print(f"\nStandard scaler saved to {scaler_path}")

    # Model specifications and target mappings
    models_to_train = {
        "CAD": {
            "name": "Overall CAD Status",
            "model_file": "cad_model.joblib",
            "estimator": RandomForestClassifier(
                n_estimators=180,
                max_depth=9,
                min_samples_split=4,
                class_weight="balanced",
                random_state=RANDOM_SEED
            )
        },
        "LAD": {
            "name": "LAD Stenosis (>=50%)",
            "model_file": "lad_model.joblib",
            "estimator": RandomForestClassifier(
                n_estimators=160,
                max_depth=8,
                min_samples_split=4,
                class_weight="balanced",
                random_state=RANDOM_SEED
            )
        },
        "LCX": {
            "name": "LCX Stenosis (>=50%)",
            "model_file": "lcx_model.joblib",
            "estimator": RandomForestClassifier(
                n_estimators=160,
                max_depth=8,
                min_samples_split=4,
                class_weight="balanced",
                random_state=RANDOM_SEED
            )
        },
        "RCA": {
            "name": "RCA Stenosis (>=50%)",
            "model_file": "rca_model.joblib",
            "estimator": RandomForestClassifier(
                n_estimators=160,
                max_depth=8,
                min_samples_split=4,
                class_weight="balanced",
                random_state=RANDOM_SEED
            )
        }
    }

    results = []
    trained_artifacts = {}

    print("\n" + "=" * 80)
    print("CARDIOVISION-3D: CLASSIFIER TRAINING & PERFORMANCE EVALUATION")
    print("=" * 80)

    for target_key, config in models_to_train.items():
        y = targets[target_key]
        y_train = y.iloc[idx_train]
        y_test = y.iloc[idx_test]

        clf = config["estimator"]
        clf.fit(X_train_scaled, y_train)

        y_pred = clf.predict(X_test_scaled)
        y_prob = clf.predict_proba(X_test_scaled)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_prob)

        # Save model
        target_model_path = MODELS_DIR / config["model_file"]
        joblib.dump(clf, target_model_path)

        metrics = {
            "Target": f"{target_key} ({config['name']})",
            "Accuracy": f"{acc:.4f}",
            "Precision": f"{prec:.4f}",
            "Recall": f"{rec:.4f}",
            "F1-Score": f"{f1:.4f}",
            "ROC-AUC": f"{roc_auc:.4f}"
        }
        results.append(metrics)
        trained_artifacts[target_key] = {
            "metrics": {
                "accuracy": float(acc),
                "precision": float(prec),
                "recall": float(rec),
                "f1": float(f1),
                "roc_auc": float(roc_auc)
            },
            "file": config["model_file"]
        }

    # Summary table
    results_df = pd.DataFrame(results)
    print(results_df.to_string(index=False))
    print("=" * 80)

    # Save feature metadata for the API server
    metadata = {
        "feature_names": feature_names,
        "n_features": len(feature_names),
        "target_keys": list(models_to_train.keys()),
        "models": trained_artifacts
    }
    meta_path = MODELS_DIR / "metadata.joblib"
    joblib.dump(metadata, meta_path)
    print(f"Pipeline metadata saved to {meta_path}\n")


if __name__ == "__main__":
    train_and_evaluate()
