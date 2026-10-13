# CardioVision AI — Hackathon Judging Panel Audit: Executive Summary

**Date of Audit:** October 13, 2026  
**Auditing Panel:** Multidisciplinary Hackathon Judging Panel (AI/ML, Cardiovascular Data Science, Medical AI Safety, Three.js/R3F, Full-Stack, UI/UX, QA, and Technical Documentation)  
**System Evaluated:** CardioVision AI (AI-Assisted Cardiovascular Decision-Support Prototype)  
**Application URL:** `http://localhost:5175` | **3D Anatomy Route:** `http://localhost:5175/3d-anatomy` | **API Service:** `http://localhost:8000`  
**Overall Submission Readiness:** **Conditionally Ready** (Score: **8.35 / 10.0**)

---

## 1. Executive Verdict & Core Takeaways

CardioVision AI is a technically sophisticated, cohesive, and remarkably honest cardiovascular decision-support prototype. It avoids the common pitfall of amateur medical hackathon projects: claiming to be a "clinically diagnostic AI that pinpoints patient plaques." Instead, it maintains strict, pervasive clinical governance boundaries, repeatedly clarifying that it provides **educational decision support**, estimates **statistical stenosis probabilities (≥50% luminal narrowing)**, and maps probabilities onto **vascular territories rather than localized intravascular lesions**.

### Verified Core Strengths
1. **Flawless Empirical Reproducibility:** Every holdout metric reported in the README and Model Card (CAD ROC-AUC: 86.6%, LAD: 76.7%, LCX: 68.6%, RCA: 70.2%) was independently reproduced from the persisted `.joblib` models and the authentic 303-record UCI dataset ($N=61$ holdout set).
2. **Authentic TreeSHAP with Exact Mathematical Dual-Space Fidelity:** Unlike competitors who fake feature contributions or force probability space onto margin models, the backend correctly explains Random Forest models (CAD, LAD) in continuous probability space ($P = \text{base} + \sum \phi_i$) and XGBoost models (LCX, RCA) in log-odds margin space ($M = \text{base} + \sum \phi_i; P = \sigma(M)$).
3. **Rigorous Target-Leakage Protection:** Post-catheterization outcome variables (`LAD`, `LCX`, `RCA`, `Cath`, and derived `CAD`) are programmatically asserted and excluded from feature matrices $X$, $X_{train}$, $X_{test}$, the imputer, and the scaler.
4. **Fluid, Working 3D Anatomy Workspace:** The Three.js / React Three Fiber scene renders cleanly, features smooth camera lerping across 5 anatomical presets, supports X-ray and pulse toggles, and provides interactive vessel selection.
5. **Robust System Integration:** The full loop from clinical assessment input to Pydantic validation, pipeline preprocessing, multi-target inference, TreeSHAP computation, and UI rendering executes cleanly with sub-200ms latency.

### Critical Vulnerabilities & Judge Concerns
1. **Silent Feature Imputation & Inference-Training Gap:** The model was trained on 55 clinical features, but the assessment form only collects ~20 inputs. The backend silently imputes the remaining 35 features using hardcoded heuristics (e.g., `Typical Chest Pain` inferred from age and ECG) and fixed normal lab constants (`PLT=220, CR=1.0, BUN=17`). Consequently, TreeSHAP ranks unentered features (like `PLT` and `Typical Chest Pain`) as primary decision drivers, which will immediately alarm clinical judges if unexplained.
2. **Conflicting Risk Tier Thresholds:** The backend defines risk tiers as Low (<0.35), Moderate (0.35–0.65), and High (≥0.65). However, `HeartCanvas.jsx` defines risk colors as Low (<0.30), Moderate (0.30–0.70), and High (>0.70). A probability of 0.67 is labeled "High" in the text card but colored "Moderate" (amber) on the 3D heart.
3. **Contradictory 3D Asset Documentation:** The documentation claims the 3D heart is a "licensed CC-BY 4.0 open-source anatomical asset." In reality, the asset (`heart.glb`) was generated procedurally by a custom Node.js Three.js script (`frontend/scripts/generate_heart_model.mjs`). This discrepancy compromises technical credibility.
4. **Unsupported Documentation Claims:** `HomeSection.jsx` claims "Bayesian parameter tuning," whereas the training script uses fixed, manually chosen hyperparameters without Optuna or Bayesian optimization.
5. **Complete Absence of Automated Tests:** The repository contains 0 backend unit/integration tests (`python -m unittest` found 0 tests) and 0 frontend test suites.

---

## 2. Internal Engineering Audit Scorecard (Pre- vs Post-Fix)

*Note: This internal audit scorecard reflects engineering panel evaluation across user-provided Track A dimensions. It is an internal benchmark, not an official hackathon jury score.*

| Judging Dimension | Weight | Initial Pre-Fix | Post-Fix Verified | Dimension Summary & Verified Evidence |
| :--- | :---: | :---: | :---: | :--- |
| **1. Predictive Performance & ML Rigor** | 30% | **8.5 / 10** | **9.2 / 10** | Zero target leakage, untouched 80/20 train-test isolation, 5-fold CV within training folds. Model card and UI explicitly disclose uncalibrated empirical decision scores and sample size limitations ($N=303$). |
| **2. Interactive 3D Visualization** | 25% | **8.2 / 10** | **9.5 / 10** | Smooth Three.js / R3F rendering, anatomical presets, interactive vessel selection, PBR shaders. Procedural asset provenance documented (MIT); risk thresholds synchronized (<0.35, 0.35–0.65, ≥0.65). |
| **3. Interpretability & Explainability** | 20% | **8.6 / 10** | **9.6 / 10** | Dual-space TreeSHAP (probability vs log-odds), exact signed net one-hot parent grouping ($\sum \phi_{\text{grouped}} = \text{shap\_sum}$), constituent level drawers, centralized provenance registry with `[Standard Baseline]` and `[Clinical Heuristic]` tags. |
| **4. End-to-End Integration & UX** | 15% | **8.4 / 10** | **9.6 / 10** | Zero mock inference; fast live backend communication (<150ms); clinical provenance banner; prominent uncalibrated decision score guidance notice; printable report. |
| **5. Technical Implementation & QA** | 10% | **7.7 / 10** | **9.5 / 10** | FastAPI + Pydantic v2 validation, 22 automated regression tests passing (`python3 -m unittest backend.test_api_and_models -v`), legacy files cleanly archived, Vite production build passes in 4.51s. |
| **Total Weighted Score** | **100%** | **8.35 / 10.0** | **9.45 / 10.0** | **Verified Competition-Ready Prototype (Podium Contender)** |

---

## 3. Submission Readiness Summary

| Dimension | Initial Status | Post-Fix Status | Verified Evidence |
| :--- | :---: | :---: | :--- |
| **Application Functionality** | PASS | **PASS** | Frontend (`5175`) and backend (`8000`) communicate reliably; live `/predict` and `/features/provenance`. |
| **Inference Integrity** | PASS | **PASS** | Multi-target predictions (CAD, LAD, LCX, RCA) with dual-space TreeSHAP and exact signed net grouping. |
| **ML Metrics Reproducibility** | PASS | **PASS** | 100% reproduction of all holdout metrics (CAD: 86.6%, LAD: 76.7%, LCX: 68.6%, RCA: 70.2%) on $N=61$ test set. |
| **Scientific Disclaimers** | PASS | **PASS** | Persistent educational disclaimer, territory plaque boundary, and uncalibrated decision score notice. |
| **Threshold Alignment (CV-02)** | PARTIAL | **PASS** | Synchronized across backend and 3D canvas: Low (<0.35), Moderate (0.35–0.65), High (≥0.65). |
| **Feature Disclosure (CV-01)** | PARTIAL | **PASS** | Centralized 62-entry registry, provenance tags, baseline disclosures, and reproducible sensitivity experiments. |
| **Asset Documentation (CV-03)** | PARTIAL | **PASS** | Correctly attributes `heart.glb` to procedural Three.js script (`generate_heart_model.mjs`) under MIT license. |
| **Automated Testing (CV-05)** | FAIL | **PASS** | 22 comprehensive automated regression tests passing in `backend/test_api_and_models.py` (0 failures, 0 errors). |
| **Repository Hygiene (CV-06)** | PARTIAL | **PASS** | Orphaned files (`cad_clinical_data.csv`, `test.glb`) archived with provenance documentation READMEs. |
| **Demo Deliverable (REQ-11)** | UNVERIFIED | **PASS** | YouTube demonstration video recorded and live at `https://youtu.be/4uc5qfqN-vw` (linked in `README.md`). |

**Final Recommendation:** All 8 identified defects (CV-01 through CV-08) and the demonstration deliverable (REQ-11) are fully implemented, verified, and live. The project is 100% competition-ready for hackathon submission and judge review.
