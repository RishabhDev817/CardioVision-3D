# CardioVision AI
## AI-Assisted Cardiovascular Decision-Support Prototype

An advanced multimodal AI prototype designed for research and educational decision support. CardioVision AI predicts overall coronary artery disease (CAD) and vessel-specific stenosis probabilities ($\ge 50\%$) for **LAD** (Left Anterior Descending), **LCX** (Left Circumflex), and **RCA** (Right Coronary Artery), mapping them onto an interactive 3D coronary anatomy with transparent TreeSHAP explainability.

> [!IMPORTANT]
> **Research & Educational Decision-Support Prototype:**
> Model outputs are estimates for demonstration purposes only and are not medical diagnoses or substitutes for professional evaluation or formal diagnostic imaging. Prediction mapped to anatomical vessel; this does not represent measured plaque location.

---

## Key Capabilities & Hackathon Compliance

### 1. Clinical Safety & Medical Governance
- Redesigned with non-prescriptive, decision-support terminology ("Model-estimated probability", "Predicted probability of stenosis", "AI assessment").
- Removed definitive claims ("diagnosis confirmed", "PCI indicated", "Bypass indicated").
- Persistent visible disclaimer across all application views and printable reports.

### 2. Strict Target-Leakage Protection & Feature Count Reconciliation
- The challenge explicitly requires excluding `LAD`, `LCX`, `RCA`, and `Cath` from model training features.
- **Methodology Compliance Statement:** *"Target leakage audit: LAD, LCX, RCA, Cath, and CAD are excluded from model inputs. Feature construction was audited for direct and indirect target leakage."*
- **Feature Count Reconciliation (59 → 55 → 60):**
  - **Raw CSV Columns:** 59 total columns in `z_alizadeh_sani_extension.csv`.
  - **Target Columns Excluded:** 4 invasive catheterization outcome columns (`LAD`, `LCX`, `RCA`, `Cath`). The overall diagnosis target `CAD` is derived from `Cath == 'CAD'`, rather than being a separate 5th CSV column.
  - **Candidate Clinical Inputs:** 55 non-invasive clinical attributes (53 numeric/binary + 2 categorical: `BBB`, `VHD`).
  - **Final Transformed Features:** 60 encoded features after ColumnTransformer (53 standardized continuous/binary + 7 one-hot indicator columns: 3 for `BBB` + 4 for `VHD`).
  - **Engineered Features:** Exactly 0 (no synthetic interaction terms, ratios, or post-catheterization proxies).
  - Programmatic assertions in `backend/train_models.py` and `backend/main.py` enforce zero target leakage at runtime.

### 3. Dedicated Model Performance (No Invented Numbers)
- Genuine evaluation metrics computed from holdout test partitions and 5-fold stratified cross-validation on the UCI Extension of Z-Alizadeh Sani Dataset (ID: 411, 303 records):
  - **Overall CAD**: Accuracy: 83.6%, Precision: 88.4%, Recall: 88.4%, F1-Score: 88.4%, ROC-AUC: 86.6% (5-fold CV ROC-AUC: 0.926 ± 0.040)
  - **LAD**: Accuracy: 63.9%, Precision: 65.0%, Recall: 76.5%, F1-Score: 70.3%, ROC-AUC: 76.7% (5-fold CV ROC-AUC: 0.850 ± 0.050)
  - **LCX**: Accuracy: 65.6%, Precision: 61.9%, Recall: 50.0%, F1-Score: 55.3%, ROC-AUC: 68.6% (5-fold CV ROC-AUC: 0.752 ± 0.027)
  - **RCA**: Accuracy: 67.2%, Precision: 50.0%, Recall: 60.0%, F1-Score: 54.5%, ROC-AUC: 70.2% (5-fold CV ROC-AUC: 0.714 ± 0.038)
- Interactive Confusion Matrices (`[[TN, FP], [FN, TP]]`) and ROC Curves with real subsampled coordinate arrays.

### 4. Explainable AI (TreeSHAP)
- Dedicated *"Why this prediction?"* panel.
- Computes additive feature attributions with direction ($+$ increases model probability, $-$ decreases model probability) and magnitude.
- Critical scientific callout clearly distinguishing **Model Contribution (Statistical Attribution)** from **Clinical Causation (Biological Etiology)**.

### 5. Centerpiece 3D Coronary Anatomy & Multi-View Camera
- Built with Three.js / React Three Fiber.
- Orbit rotation, zoom in/out, pan, reset, static lock, pulse simulation, and layer visibility / X-ray modes.
- Multi-view camera presets:
  - **Anterior View** (LAD focus)
  - **Lateral View** (LCX focus)
  - **Inferior / Posterior View** (RCA / PDA focus)
  - **Right AV View** (RCA trunk focus)
- Controlled semantic color system:
  - LAD: Red/Coral (`#f43f5e`)
  - LCX: Teal/Green (`#0d9488`)
  - RCA: Orange (`#f97316`)
  - CAD: Magenta/Coral (`#e11d48`)
- Anatomical model attribution documented (Open-source human cardiac mesh under CC-BY 4.0).

### 6. 9 Integrated Application Sections
1. **Home**: Judge-First 30s overview (WHAT, HOW, OUTPUT, WHY, WHERE) and compact pipeline flowchart.
2. **Patient Assessment**: 7 clinical biomarker categories (Demographics, Vitals, Medical History, Symptoms, ECG, Laboratory, Echocardiography) with input validation, acceptable ranges, and verified Demo Scenarios.
3. **AI Analysis**: CAD and vessel probabilities with educational decision-support context.
4. **3D Coronary Anatomy**: Centerpiece interactive 3D heart with vessel inspector and plaque disclaimer.
5. **Explainability**: Waterfall and horizontal bar visualizers showing real TreeSHAP feature drivers.
6. **Model Performance**: Actual empirical metrics, confusion matrices, ROC curves, and 5-fold CV.
7. **Methodology / Dataset**: 8-stage pipeline flowchart, UCI dataset specifications, and target-leakage audit.
8. **Report**: Standardized decision-support report with print, copy, and export capabilities.
9. **Safety / About**: Clinical governance, SaMD research prototype scope, and scientific citations.

---

## Tech Stack

- **Backend**: Python 3, FastAPI, Scikit-Learn, XGBoost, TreeSHAP, Joblib, Uvicorn
- **Frontend**: React 18, Vite, Three.js, @react-three/fiber, @react-three/drei, Tailwind CSS, Lucide Icons

---

## Quickstart

### Backend Service
```bash
# Optional: re-train models and generate metrics
python3 backend/train_models.py

# Start FastAPI server
python3 -m uvicorn backend.main:app --port 8000 --host 0.0.0.0 --reload
```
API endpoints:
- `GET /metrics` — Live model metrics, confusion matrices, ROC curves, 5-fold CV
- `GET /methodology` — Pipeline architecture and target leakage audit
- `GET /features` — Clinical feature catalog with units and normal ranges
- `POST /predict` — Continuous probabilities and TreeSHAP attributions

### Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.
