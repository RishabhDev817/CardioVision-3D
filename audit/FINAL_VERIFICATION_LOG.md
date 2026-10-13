# CardioVision AI — Final Verification Log & Empirical Audit Trail

**Date of Execution:** October 13, 2026  
**Auditing Entity:** Multidisciplinary Hackathon Judging Panel  
**Repository:** `/Users/rishabh/CardioVision-3D`  
**Execution Context:** Final Pre-Submission Audit, Scientific Validation & System Integrity Review  

---

## 1. Environment & Runtime Baseline Inventory

### 1.1 Source Control Baseline
* **Git Branch:** `main` (synchronized with `origin/main`)
* **Working Tree State:** Tracked core files modified for audit fixes; zero unauthorized destructive deletes.
* **Untracked Additions:** `audit/` (comprehensive audit deliverables), `backend/test_api_and_models.py`, `backend/data/archive/`, `frontend/public/models/archive/`.

### 1.2 Runtime Environments & Package Versions
* **Python Runtime:** Python `3.14.2`
  - `scikit-learn`: `1.9.0`
  - `xgboost`: `3.4.1`
  - `shap`: `0.52.0`
  - `fastapi`: `0.142.1`
  - `pydantic`: `2.13.4`
  - `joblib`: `1.6.0`
  - `pandas`: `3.0.5`
  - `numpy`: `2.5.1`
* **Node.js Runtime:** `v24.6.0` | **npm:** `11.5.1`
  - `vite`: `^5.2.11` (v5.4.21 active)
  - `react`: `^18.3.1` | `react-dom`: `^18.3.1`
  - `three`: `^0.164.1`
  - `@react-three/fiber`: `^8.16.8`
  - `@react-three/drei`: `^9.106.0`
  - `@react-three/postprocessing`: `^2.16.2`
  - `tailwindcss`: `^3.4.3`

### 1.3 Cryptographic Artifact Hashes (SHA-256)
| Artifact / File Path | SHA-256 Checksum | Verification Notes |
| :--- | :--- | :--- |
| `backend/models/cad_model.joblib` | `56ca2a780fbbbe8b09aa40403f64a7a2df5a0fae16fff4304f3aa9347506c3c4` | Random Forest (180 trees, depth 6) |
| `backend/models/cad_rf.joblib` | `56ca2a780fbbbe8b09aa40403f64a7a2df5a0fae16fff4304f3aa9347506c3c4` | Identical pipeline binary copy |
| `backend/models/cad_xgb.joblib` | `03e4953e53bdb2568cb95a3c2d18cb27dfd8514ba35bd1eb91e1c220402d878d` | Comparison XGBoost baseline |
| `backend/models/lad_model.joblib` | `04f90496dda4fde8a3cc8e2bba47684ab161bd15d497e9bc7c78482eb7f3e372` | Random Forest (180 trees, depth 6) |
| `backend/models/lad_rf.joblib` | `04f90496dda4fde8a3cc8e2bba47684ab161bd15d497e9bc7c78482eb7f3e372` | Identical pipeline binary copy |
| `backend/models/lad_xgb.joblib` | `6edcdd14c5bbc04d440557434669f2205610661609f13f903c795a8750a8db1b` | Comparison XGBoost baseline |
| `backend/models/lcx_model.joblib` | `368bb584c6ef76d4fb625b39533c5cb1ed4ba61e2539e3bd2d62e6828ea8b22b` | XGBoost (120 trees, depth 4, lr 0.04) |
| `backend/models/lcx_xgb.joblib` | `368bb584c6ef76d4fb625b39533c5cb1ed4ba61e2539e3bd2d62e6828ea8b22b` | Identical pipeline binary copy |
| `backend/models/rca_model.joblib` | `7ecbc6016d0e806191515c8ace86686b29f3d63549c4327e0c4090f9a6513fc0` | XGBoost (120 trees, depth 4, lr 0.04) |
| `backend/models/rca_xgb.joblib` | `7ecbc6016d0e806191515c8ace86686b29f3d63549c4327e0c4090f9a6513fc0` | Identical pipeline binary copy |
| `backend/models/scaler.joblib` | `b83f933dbb79f7c6d2b4c01e1bbab9e84c412ea24dadf5eb691236183fe92d8a` | Fitted training ColumnTransformer |
| `backend/models/metadata.joblib` | `4d3e309b44b5c05f39ff6c30b546f420a9dda493146680b101b37dc767ef72d6` | Metadata dictionary & schemas |
| `backend/data/z_alizadeh_sani_extension.csv` | `b60472ecebdd4ea11d09b8a793711b8da2051fdf79eeae5b88f33269e4a02d37` | Canonical UCI cohort ($N=303$, 59 cols) |
| `backend/data/archive/cad_clinical_data.csv` | `77f87f83c5a4f02de2baa4c12d65d2d42483e8d4db3e3ca71c34927f19676396` | Archived prototype mock (1500 rows) |
| `frontend/public/models/heart.glb` | `e48160c3dc931afe698080fd5f25fdcb431245e82c3156d9c5e5e5cd1890c946` | Procedural 3D anatomical model (2.24 MB) |
| `frontend/public/models/archive/test.glb` | `54c716118c942b3cb0a9fd2c22d9f79849a1856b3b11e6866071f0ccecaeae0e` | Archived initial exporter test (1.9 KB) |

---

## 2. Empirical Verification Test Execution Log

### Test Run 1: Automated Regression Suite (22 Unit Tests)
* **Command:** `python3 -m unittest backend.test_api_and_models -v`
* **Exit Code:** `0`
* **Execution Duration:** `1.518s`
* **Total Tests Executed:** `22`
* **Passed:** `22` | **Failed:** `0` | **Errors:** `0` | **Skipped:** `0`
* **Individual Test Method Results:**
  1. `test_features_catalog` (TestCoreEndpoints): **OK**
  2. `test_methodology_endpoint` (TestCoreEndpoints): **OK**
  3. `test_metrics_endpoint` (TestCoreEndpoints): **OK**
  4. `test_root_health` (TestCoreEndpoints): **OK**
  5. `test_doc_only_fields_mutation_has_zero_effect` (TestDocumentationOnlyIsolation): **OK**
  6. `test_documentation_only_fields` (TestFeatureProvenance): **OK**
  7. `test_provenance_api_endpoint` (TestFeatureProvenance): **OK**
  8. `test_provenance_registry_structure` (TestFeatureProvenance): **OK**
  9. `test_archive_directories_exist` (TestLegacyFileArchival): **OK**
  10. `test_grouped_features_count_and_additivity` (TestOneHotGroupingAndAdditivity): **OK**
  11. `test_invalid_input_validation` (TestPredictionAndExplainability): **OK**
  12. `test_shap_output_space_additivity` (TestPredictionAndExplainability): **OK**
  13. `test_shap_provenance_attachment` (TestPredictionAndExplainability): **OK**
  14. `test_valid_prediction_schema` (TestPredictionAndExplainability): **OK**
  15. `test_model_card_and_methodology_disclosures` (TestProbabilityCalibrationDisclosures): **OK**
  16. `test_plt_and_cr_sensitivity` (TestReproducibleSensitivityAnalysis): **OK**
  17. `test_typical_chest_pain_sensitivity` (TestReproducibleSensitivityAnalysis): **OK**
  18. `test_high_risk_boundaries` (TestRiskTierBoundaries): **OK**
  19. `test_low_risk_boundaries` (TestRiskTierBoundaries): **OK**
  20. `test_moderate_risk_boundaries` (TestRiskTierBoundaries): **OK**
  21. `test_pending_unassessed_state` (TestRiskTierBoundaries): **OK**
  22. `test_leakage_exclusions` (TestTargetLeakageIsolation): **OK**

---

### Test Run 2: Frontend Production Bundle Build
* **Command:** `npm run build` in `/Users/rishabh/CardioVision-3D/frontend`
* **Exit Code:** `0`
* **Execution Duration:** `4.48s`
* **Modules Transformed:** `2,223`
* **Build Artifacts Output:**
  - `dist/index.html`: `1.46 kB` (gzip: `0.80 kB`)
  - `dist/assets/heart-medical-illustration-CM-mH06o.png`: `441.35 kB`
  - `dist/assets/index-C5rG0aec.css`: `45.97 kB` (gzip: `8.58 kB`)
  - `dist/assets/index-DHfB8riH.js`: `1,450.95 kB` (gzip: `390.59 kB`)
* **Status:** **PASS** (Zero syntax, JSX, CSS, or Rollup build errors).

---

### Test Run 3: Independent Holdout Metric & Confusion Matrix Reproduction
* **Command Executed:** Python holdout evaluation script loading `.joblib` models on test index ($N=61$, stratified by CAD).
* **Observed Confusion Matrices ($p \ge 0.50$):**
  - **CAD:** $\text{TN}=13, \text{FP}=5, \text{FN}=5, \text{TP}=38$ (Accuracy: 83.61%, Precision: 88.37%, Recall: 88.37%, F1: 88.37%, ROC-AUC: 86.56%)
  - **LAD:** $\text{TN}=13, \text{FP}=14, \text{FN}=8, \text{TP}=26$ (Accuracy: 63.93%, Precision: 65.00%, Recall: 76.47%, F1: 70.27%, ROC-AUC: 76.69%)
  - **LCX:** $\text{TN}=27, \text{FP}=8, \text{FN}=13, \text{TP}=13$ (Accuracy: 65.57%, Precision: 61.90%, Recall: 50.00%, F1: 55.32%, ROC-AUC: 68.57%)
  - **RCA:** $\text{TN}=29, \text{FP}=12, \text{FN}=8, \text{TP}=12$ (Accuracy: 67.21%, Precision: 50.00%, Recall: 60.00%, F1: 54.55%, ROC-AUC: 70.24%)
* **Status:** **PASS** (100% agreement down to 4 decimal places with published metrics).

---

### Test Run 4: TreeSHAP Dual-Space Output Additivity Check
* **Random Forest (CAD, LAD) — Continuous Probability Space:**
  - CAD: $\text{Base } 0.5006 + \sum \phi_i (0.4369) = 0.9375 = \text{Model Output } 0.9375$ (Error: $0.0000$).
  - LAD: $\text{Base } 0.5022 + \sum \phi_i (0.3394) = 0.8416 \approx \text{Model Output } 0.8417$ (Error: $<0.0001$).
* **XGBoost (LCX, RCA) — Raw Margin (Log-Odds) Space:**
  - LCX: $\text{Margin } 0.0396 + \sum \phi_i (0.4377) = 0.4773 \Longrightarrow \sigma(0.4773) = 0.6171 = \text{Model Output } 0.6171$ (Error: $0.0000$).
  - RCA: $\text{Margin } 0.0639 + \sum \phi_i (0.8885) = 0.9524 \Longrightarrow \sigma(0.9524) = 0.7216 = \text{Model Output } 0.7216$ (Error: $0.0000$).
* **Status:** **PASS** (Zero additivity violation across both mathematical output spaces).

---

### Test Run 5: One-Hot Categorical Grouped Additivity Verification (CV-08)
* **Mathematical Equation Verified:** $\phi_{\text{parent}} = \sum_{j \in \text{parent}} \phi_j$
* **Observed Discrepancy:**
  - CAD: $|\sum \phi_{\text{grouped}} - \sum \phi_{\text{transformed}}| = 0.000000000000$
  - LAD: $|\sum \phi_{\text{grouped}} - \sum \phi_{\text{transformed}}| = 0.000000000000$
  - LCX: $|\sum \phi_{\text{grouped}} - \sum \phi_{\text{transformed}}| = 0.000000000000$
  - RCA: $|\sum \phi_{\text{grouped}} - \sum \phi_{\text{transformed}}| = 0.000000000000$
* **Status:** **PASS** (Zero additivity loss when grouping 60 transformed features into 55 clinical features).

---

### Test Run 6: Documentation-Only Field Isolation Verification
* **Test Case:** Patient baseline mutated by setting `troponin_i` from $0.01 \rightarrow 25.0$, `ck_mb` from $2.0 \rightarrow 150.0$, and `diastolic_bp` from $80.0 \rightarrow 130.0$.
* **Observed Output Shift:**
  - $\Delta P_{\text{CAD}} = 0.00000000$
  - $\Delta P_{\text{LAD}} = 0.00000000$
  - $\Delta P_{\text{LCX}} = 0.00000000$
  - $\Delta P_{\text{RCA}} = 0.00000000$
  - $\Delta \phi = 0.00000000$ across all 60 SHAP attributes.
* **Status:** **PASS** (Documentation-only fields are completely isolated from inference).
