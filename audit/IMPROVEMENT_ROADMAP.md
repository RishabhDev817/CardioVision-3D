# CardioVision AI — Prioritized Improvement Roadmap

**Purpose:** Actionable, staged engineering plan addressing all confirmed audit findings, ranked strictly by judging impact, technical risk, and submission readiness.  

---

## 1. Prioritization Matrix & Overview

```
P0 (Immediate Submission Readiness) ──► P1 (High-Impact Judge Fixes) ──► P2 (System Polish) ──► P3 (Optional Refinements)
```

| Priority | Issue ID & Description | Category | Estimated Effort | Impact on Judging | Implementation Status |
| :---: | :--- | :--- | :---: | :--- | :---: |
| **P0** | **Req-11: Record Official 3–5 min Demo Video** | Submission | Medium (2–3 hrs) | Critical: Mandatory deliverable to avoid submission disqualification. | **COMPLETED & VERIFIED** (`https://youtu.be/4uc5qfqN-vw`) |
| **P1** | **CV-02: Align Risk Tier Cutoffs (<0.35, 0.35–0.65, ≥0.65)** | Integration | Small (20 mins) | High: Eliminates conflicting color/text risk states between 3D canvas and cards. | **COMPLETED & VERIFIED** |
| **P1** | **CV-01: Disclose Imputed Features in TreeSHAP Dashboard** | Explainability / ML | Medium (1 hr) | High: Protects against clinician judge skepticism regarding unentered variables. | **COMPLETED & VERIFIED** |
| **P1** | **CV-03: Reconcile 3D Heart Asset Provenance Documentation** | Documentation | Small (15 mins) | High: Eliminates contradiction between procedural script and CC-BY claims. | **COMPLETED & VERIFIED** |
| **P1** | **CV-05: Create Automated Test Suite (`backend/test_api_and_models.py`)** | QA / Testing | Medium (1.5 hrs) | High: Replaces 0% test coverage with 22 automated regression tests. | **COMPLETED & VERIFIED** |
| **P2** | **CV-04: Remove "Bayesian Parameter Tuning" Claim in Home Copy** | Documentation | Small (10 mins) | Medium: Eliminates unsubstantiated ML claim. | **COMPLETED & VERIFIED** |
| **P2** | **CV-06: Purge Orphaned Files (`cad_clinical_data.csv`, `test.glb`)** | Hygiene | Small (10 mins) | Medium: Archived with provenance READMEs; eliminates sample size confusion. | **COMPLETED & VERIFIED** |
| **P2** | **CV-07: Unify "Model Score" Terminology & Calibration Note** | Safety / Terms | Small (20 mins) | Medium: Added uncalibrated empirical decision score notices across UI and model card. | **COMPLETED & VERIFIED** |
| **P3** | **CV-08: Add Formatted Clinical Labels & Grouping for One-Hot SHAP** | UX / Math | Small (30 mins) | Low: Implemented signed net parent grouping with component drawers & additivity test. | **COMPLETED & VERIFIED** |

---

## 2. Staged Implementation Plan

### Stage 1: P0 & P1 Critical Fixes (Pre-Submission Essentials)
*Estimated Total Time: ~3.5 hours*

#### Step 1.1: Synchronize Risk Tier Cutoffs (Issue CV-02)
* **Target File:** `frontend/src/components/HeartCanvas.jsx`
* **Changes:**
  - Update `getRiskColor` and `getRiskTier`:
    ```javascript
    export const getRiskColor = (prob) => {
      if (prob === undefined || prob === null || isNaN(prob)) return '#94a3b8';
      if (prob < 0.35) return '#059669'; // Low Risk (Emerald)
      if (prob < 0.65) return '#d97706'; // Moderate Risk (Amber)
      return '#dc2626'; // High Risk (Crimson)
    };
    ```
* **Acceptance Criteria:** A probability of 0.67 displays as Crimson (#dc2626) in 3D viewport, matching the "High Risk" badge in the analysis card.

#### Step 1.2: Add Imputed Feature Disclosure in TreeSHAP (Issue CV-01)
* **Target Files:** `backend/main.py` & `frontend/src/components/ExplainabilitySection.jsx`
* **Changes:**
  - In `backend/main.py`, annotate features in `compute_shap_importance` with `is_imputed: bool` (true for features not collected in `PatientInput`).
  - In `ExplainabilitySection.jsx`, display a subtle gray chip: `[Standard Baseline]` next to features like `PLT`, `WBC`, and `CR`.
* **Acceptance Criteria:** Clinicians immediately see which features were directly measured vs defaulted to normal baseline constants.

#### Step 1.3: Reconcile 3D Asset Documentation (Issue CV-03)
* **Target Files:** `backend/main.py` (`get_methodology`), `docs/MODEL_CARD.md`, and `README.md`
* **Changes:**
  - Replace the CC-BY 4.0 download claim with:  
    `"source": "Custom Procedural 3D Anatomical Heart (Three.js)", "license": "Proprietary Project Asset (MIT)", "attribution": "Generated via frontend/scripts/generate_heart_model.mjs using Three.js mathematical geometries calibrated to human coronary anatomy."`
* **Acceptance Criteria:** API endpoint `GET /methodology` and Model Card accurately describe the true origin of `heart.glb`.

#### Step 1.4: Implement Automated Smoke & Regression Tests (Issue CV-05)
* **Target File:** `backend/test_api_and_models.py`
* **Changes:**
  - Create a Python `unittest.TestCase` suite testing:
    1. Dataset loading and target leakage assertion check.
    2. Model pipeline loading and prediction outputs.
    3. TreeSHAP additivity verification on CAD, LAD, LCX, RCA.
    4. FastAPI endpoints (`/`, `/metrics`, `/model-card`, `/predict`).
    5. Input validation error codes (HTTP 422 on invalid age).
* **Acceptance Criteria:** `python3 -m unittest backend/test_api_and_models.py` exits with code 0 and passes 100% of tests.

---

### Stage 2: P2 Hygiene & Documentation Alignment
*Estimated Total Time: ~1 hour*

#### Step 2.1: Clean Up Copy Discrepancies (Issue CV-04)
* **Target File:** `frontend/src/components/HomeSection.jsx`
* **Changes:** Replace "with Bayesian parameter tuning" on line 65 with "with cross-validated tree depth and estimator tuning."

#### Step 2.2: Purge Orphaned Files (Issue CV-06)
* **Target Files:** Delete `backend/data/cad_clinical_data.csv` and `frontend/public/models/test.glb`.
* **Changes:** Remove dead files and remove line 58 reference in `backend/train_models.py`.

#### Step 2.3: Unify Model Score Phrasing (Issue CV-07)
* **Target Files:** `frontend/src/components/AnalysisSection.jsx` and `docs/MODEL_CARD.md`
* **Changes:** Ensure text badges refer to "Model-Estimated Probability Tier" rather than absolute clinical diagnostic risk.

---

### Stage 3: P3 UX Polish & Final Demonstration Preparation
*Estimated Total Time: ~1 hour*

#### Step 3.1: Formatted One-Hot Labels in Explainability (Issue CV-08)
* **Target File:** `frontend/src/components/ExplainabilitySection.jsx`
* **Changes:** Add mapping dictionary to format `BBB_LBBB` as "Left Bundle Branch Block" and `VHD_Moderate` as "Moderate Valvular Disease".

#### Step 3.2: Record Video Demonstration (Requirement REQ-11)
* **Action:** Follow the verified 5-minute walkthrough script in `JUDGE_QA_AND_DEMO_PLAN.md` to record the screen capture and voiceover.

---

## 3. Post-Fix Verification Checklist

- [x] All 8 backend endpoints return HTTP 200 with matching schemas.
- [x] `python3 -m unittest backend.test_api_and_models -v` passes all 22 tests.
- [x] `npm run build` in `frontend/` succeeds with 0 warnings/errors (4.51s).
- [x] 3D canvas vessel colors match analysis card risk tiers for boundary probabilities (<0.35, 0.35–0.65, ≥0.65).
- [x] Imputed variables display `[Standard Baseline]` tags and category filters in TreeSHAP.
- [x] Orphaned files archived to `archive/` subdirectories with full provenance documentation.
- [x] Uncalibrated empirical decision score clinical notice displayed in UI and model card.
- [x] One-hot categorical features grouped with exact signed net additivity and technical component inspection drawers.
- [x] Demo video recorded, uploaded, and linked in `README.md` (`https://youtu.be/4uc5qfqN-vw`).
