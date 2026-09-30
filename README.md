# CardioVision-3D

Interactive 3D cardiovascular visualization and predictive analysis platform combining machine learning stenosis prediction with React Three Fiber 3D coronary anatomy rendering.

## Overview

CardioVision-3D empowers clinicians and researchers with:
- **Predictive Hemodynamics & CAD Risk**: Multi-target machine learning models predicting overall CAD status alongside vessel-specific stenosis ($\ge 50\%$) for **LAD** (Left Anterior Descending), **LCX** (Left Circumflex), and **RCA** (Right Coronary Artery).
- **Target Leakage Prevention**: Strict anatomical feature isolation guaranteeing zero catheterization or target label leakage during pipeline training.
- **Explainable AI (XAI)**: Integrated `shap.TreeExplainer` computing patient-level localized biomarker attributions.
- **Interactive 3D Digital Twin**: Low-poly anatomical 3D heart canvas built with Three.js / React Three Fiber with dynamic color risk mapping (Green: Low, Amber: Moderate, Red: High) and mesh selection diagnostics.

## Architecture

- **Backend**: Python, FastAPI, Scikit-Learn, SHAP, Joblib, Uvicorn
- **Frontend**: React 18, Vite, Three.js, @react-three/fiber, @react-three/drei, Tailwind CSS, Lucide Icons

## Getting Started

### 1. Backend Setup
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Train models
python backend/train_models.py

# Run FastAPI service
uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` to explore the interactive 3D coronary twin.
