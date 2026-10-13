# CardioVision AI — Machine Learning & Scientific Accuracy Audit

**Audit Scope:** Rigorous verification of dataset integrity, target leakage, feature preprocessing, validation design, empirical metrics reproduction, probability calibration, and TreeSHAP explainability.  
**Auditors:** Senior AI/ML Engineer & Cardiovascular Data Science Researcher  

---

## 1. Dataset Integrity & Cohort Structure

### 1.1 Dataset Identification & Provenance
* **Source:** UCI Machine Learning Repository — Extension of Z-Alizadeh Sani Dataset (Dataset ID: 411).
* **Cohort Size ($N$):** 303 patient records.
* **Raw Attributes:** 59 columns in `backend/data/z_alizadeh_sani_extension.csv`.
* **Corroboration:** Confirmed against UCI publication: Alizadehsani, R., et al. (2013, 2018). The dataset represents patients undergoing coronary catheterization angiography at Tehran Heart Center.

### 1.2 Ground-Truth Target Definitions & Catheterization Gold Standard
* **Cath:** Categorical diagnosis from invasive catheterization angiography (`CAD` vs `Normal`). Defined as luminal narrowing $\ge 50\%$ in $\ge 1$ major epicardial vessel.
* **CAD (Derived):** Derived strictly as `Cath == 'CAD'`. It does not exist as a separate fifth raw CSV column.
* **LAD:** Left Anterior Descending artery luminal stenosis $\ge 50\%$ (`Stenotic` vs `Normal`).
* **LCX:** Left Circumflex artery luminal stenosis $\ge 50\%$ (`Stenotic` vs `Normal`).
* **RCA:** Right Coronary Artery luminal stenosis $\ge 50\%$ (`Stenotic` vs `Normal`).

### 1.3 Class Distribution & Prevalence (Cohort $N = 303$)
| Target | Positive Cases | Negative Cases | Prevalence (%) | Imbalance Ratio (Neg:Pos) | Imbalance Mitigation Technique |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **CAD** | 216 | 87 | 71.3% | 0.40 : 1 | `class_weight='balanced'` in RandomForest |
| **LAD** | 177 | 126 | 58.4% | 0.71 : 1 | `class_weight='balanced'` in RandomForest |
| **LCX** | 119 | 184 | 39.3% | 1.55 : 1 | Dynamic `scale_pos_weight = 1.55` in XGBoost |
| **RCA** | 114 | 189 | 37.6% | 1.66 : 1 | Dynamic `scale_pos_weight = 1.66` in XGBoost |

### 1.4 Target Leakage Isolation
* **Direct Exclusions:** `LAD`, `LCX`, `RCA`, `Cath`, and derived `CAD` are purged prior to assembling feature matrix $X$.
* **Programmatic Runtime Verification:**
  ```python
  for leak in ['LAD', 'LCX', 'RCA', 'Cath', 'CAD']:
      assert leak not in X_train.columns
      assert leak not in X_test.columns
      assert leak not in num_cols
      assert leak not in cat_cols
  ```
  All assertions passed with zero violations. Post-catheterization outcome leakage is completely absent.

---

## 2. Feature Preprocessing & Transformation Architecture

### 2.1 The 59 $\rightarrow$ 55 $\rightarrow$ 60 Feature Count Reconciliation
1. **Raw CSV Columns (59):** Full attribute set in `z_alizadeh_sani_extension.csv`.
2. **Target Isolation (-4):** Dropping `LAD`, `LCX`, `RCA`, and `Cath` leaves exactly **55 candidate clinical inputs**. (Note: `CAD` is a derived alias for `Cath == 'CAD'`, not a separate raw column).
3. **Clinical Feature Partitioning:**
   - **53 Numeric & Binary Features:** Standard continuous vitals, lab values, and binary clinical indicators (mapped to 0/1).
   - **2 Multi-Category Categoricals:** `BBB` (Bundle Branch Block) and `VHD` (Valvular Heart Disease).
4. **ColumnTransformer Pipeline:**
   - Numeric & Binary (53): `SimpleImputer(strategy='median')` followed by `StandardScaler()`.
   - Categorical (2): `SimpleImputer(strategy='most_frequent')` followed by `OneHotEncoder(drop=None, handle_unknown='ignore')`.
   - `BBB` expands into 3 binary indicators (`BBB_LBBB`, `BBB_N`, `BBB_RBBB`).
   - `VHD` expands into 4 binary indicators (`VHD_Moderate`, `VHD_N`, `VHD_Severe`, `VHD_mild`).
   - Total transformed model dimensionality: $53 + 3 + 4 = \mathbf{60}$ **features**.
5. **Engineered Features:** Exactly **0** synthetic interaction terms, polynomial expansions, or ratio proxies are introduced.

### 2.2 Critical Finding: Inference-to-Training Schema Disparity & Heuristic Imputation
* **The Disconnect:** The model was trained on all 55 candidate clinical features. However, the user assessment form (`AssessmentSection.jsx` and `PatientInput` Pydantic model) only collects **20 clinical features**.
* **Backend Imputation (`backend/main.py` lines 265–338):**
  - **Hardcoded Physical Dimensions:** `Length` is hardcoded to $168.0\text{ cm}$. `Weight` is derived as $\text{BMI} \times (1.68)^2$.
  - **Synthetic Clinical Rules:**
    - `Typical Chest Pain` is set to 1 if $\text{age} \ge 50$ and ($\text{ST elevation}$ or $\text{T inversion}$ or $\text{RWMA} \neq \text{"None"}$), else 0.
    - `Dyspnea` is set to 1 if $\text{LVEF} < 50.0$, else 0.
    - `Function Class` is set to 2 if $\text{LVEF} < 40.0$, else 0.
    - `Q Wave` is set to 1 if $\text{ST elevation} == 1$, else 0.
    - `St Depression` is set to 1 if ($\text{T inversion} == 1$ and not $\text{ST elevation}$), else 0.
    - `DLP` is set to 1 if $\text{LDL} > 130$ or $\text{Chol} > 200$ or $\text{TG} > 150$, else 0.
  - **Population Constants:** Over 20 laboratory and ECG variables are defaulted to static reference normals (`CR=1.0, BUN=17.0, ESR=18.0, HB=13.5, K=4.2, Na=141.0, WBC=7500.0, Lymph=32.0, Neut=60.0, PLT=220.0, BBB='N', VHD='N'`).
* **Scientific Impact on Explainability:** Because the `StandardScaler` standardizes these static inputs against the training distribution, **imputed variables receive non-zero TreeSHAP attributions**. For example, in LCX, `PLT` receives a SHAP value of $-0.443$, appearing in the top 3 drivers even though the clinician never entered a platelet count.
* **Audit Verdict:** The application must explicitly tag these features as `[Imputed Baseline]` in the TreeSHAP dashboard to maintain clinical transparency.

### 2.3 Documentation-Only Fields
* `Troponin I (cTnI)` and `CK-MB`: Documented on the form and report for acute cardiac chart completeness. They do not exist in the UCI dataset and do not enter the model pipeline. Both UI and code feature explicit warning badges: `"Documentation-only field; does not alter model predictions"`.
* `Diastolic Blood Pressure`: Recorded for vital signs completeness; the model utilizes systolic blood pressure (`BP`) in accordance with the UCI dataset schema. Disclosed via UI badge.

---

## 3. Validation Strategy & Empirical Metrics Reproduction

### 3.1 Partition Scheme & Leakage Boundaries
* **Split Scheme:** Stratified 80/20 train/test holdout split (`random_state=42`, stratify=`CAD`).
  - **Training Partition ($N=242$):** Used for 5-fold cross-validation, algorithm selection, and fitting the final production pipelines.
  - **Holdout Test Partition ($N=61$):** Strictly isolated during preprocessing fitting and model selection.
* **Cross-Validation:** 5-fold `StratifiedKFold` executed strictly on the training partition. The scikit-learn `Pipeline` encapsulates the `ColumnTransformer`, guaranteeing that imputers and scalers are fitted independently within each training fold.

### 3.2 Algorithm Selection Rationale
Algorithm selection for each target was determined strictly by the highest mean 5-fold cross-validation ROC-AUC on the training split:
* **CAD:** Random Forest (0.926 ± 0.040) > XGBoost (0.919 ± 0.039) $\rightarrow$ **Selected: Random Forest**
* **LAD:** Random Forest (0.850 ± 0.050) > XGBoost (0.823 ± 0.048) $\rightarrow$ **Selected: Random Forest**
* **LCX:** XGBoost (0.752 ± 0.027) > Random Forest (0.751 ± 0.041) $\rightarrow$ **Selected: XGBoost**
* **RCA:** XGBoost (0.714 ± 0.038) > Random Forest (0.686 ± 0.057) $\rightarrow$ **Selected: XGBoost**

### 3.3 Independent Reproduction of Holdout Test Metrics ($N = 61$)
Independent re-execution of the evaluation script on the test partition produced 100% agreement with the documented metrics:

| Target | Model Architecture | Test $N$ | Pos / Neg | Accuracy | Precision | Recall (Sensitivity) | Specificity | F1-Score | Holdout ROC-AUC | 5-Fold Training CV ROC-AUC |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Overall CAD** | Random Forest (180 trees, depth 6) | 61 | 43 / 18 | **83.61%** | **88.37%** | **88.37%** | **72.22%** | **88.37%** | **86.56%** | **0.926 ± 0.040** |
| **LAD** | Random Forest (180 trees, depth 6) | 61 | 34 / 27 | **63.93%** | **65.00%** | **76.47%** | **48.15%** | **70.27%** | **76.69%** | **0.850 ± 0.050** |
| **LCX** | XGBoost (120 trees, depth 4, lr 0.04) | 61 | 26 / 35 | **65.57%** | **61.90%** | **50.00%** | **77.14%** | **55.32%** | **68.57%** | **0.752 ± 0.027** |
| **RCA** | XGBoost (120 trees, depth 4, lr 0.04) | 61 | 20 / 41 | **67.21%** | **50.00%** | **60.00%** | **70.73%** | **54.55%** | **70.24%** | **0.714 ± 0.038** |

### 3.4 Verified Confusion Matrices ($N = 61$, Decision Threshold $p \ge 0.50$)
* **CAD:** $\text{TN}=13,\; \text{FP}=5,\; \text{FN}=5,\; \text{TP}=38$
* **LAD:** $\text{TN}=13,\; \text{FP}=14,\; \text{FN}=8,\; \text{TP}=26$
* **LCX:** $\text{TN}=27,\; \text{FP}=8,\; \text{FN}=13,\; \text{TP}=13$
* **RCA:** $\text{TN}=29,\; \text{FP}=12,\; \text{FN}=8,\; \text{TP}=12$

### 3.5 Scientific Observations on Model Performance
1. **Realistic Generalization Gap:** The drop from training CV ROC-AUC to holdout ROC-AUC (CAD: 0.926 $\rightarrow$ 0.866; LAD: 0.850 $\rightarrow$ 0.767) is characteristic of small tabular cohorts ($N=303$) and confirms that the holdout set was truly unpeeked.
2. **Branch Vessel Difficulty:** Vessel-level branch stenosis (LCX ROC-AUC: 68.6%, RCA: 70.2%) is significantly harder to predict than overall patient-level CAD from non-invasive clinical and ECG markers alone. The project honestly documents this clinical reality rather than fabricating uniform 90%+ scores.

---

## 4. TreeSHAP Explainability & Output Space Mathematics

### 4.1 Dual-Space Additivity Verification
A key technical accomplishment of CardioVision AI is the rigorous mathematical separation of output spaces between tree ensemble architectures:

#### A. Random Forest Models (CAD, LAD) — Continuous Probability Space
Random Forest outputs represent the fraction of trees voting for the positive class. The TreeSHAP explainer operates directly in probability space:
$$\text{Model Probability} = \mathbb{E}[f(x)] + \sum_{i=1}^{60} \phi_i$$
* **CAD Verification:** $\text{Base Value } 0.5006 + \sum \phi_i (0.4369) = \mathbf{0.9375} = \text{Model Output } \mathbf{0.9375}$. Additivity error: $0.0000$.
* **LAD Verification:** $\text{Base Value } 0.5022 + \sum \phi_i (0.3394) = \mathbf{0.8416} \approx \text{Model Output } \mathbf{0.8417}$. Additivity error: $<0.0001$.

#### B. XGBoost Models (LCX, RCA) — Margin (Log-Odds) Space
XGBoost outputs represent the raw unconstrained leaf margin $M$. Passing TreeSHAP contributions through the logistic sigmoid reproduces the probability:
$$\text{Margin } M = \mathbb{E}[f(x)] + \sum_{i=1}^{60} \phi_i \quad \Longrightarrow \quad P = \sigma(M) = \frac{1}{1 + e^{-M}}$$
* **LCX Verification:** $\text{Base Margin } 0.0396 + \sum \phi_i (0.4377) = \text{Total Margin } \mathbf{0.4773}$.  
  $\sigma(0.4773) = \mathbf{0.6171} = \text{Model Output } \mathbf{0.6171}$.
* **RCA Verification:** $\text{Base Margin } 0.0639 + \sum \phi_i (0.8885) = \text{Total Margin } \mathbf{0.9524}$.  
  $\sigma(0.9524) = \mathbf{0.7216} = \text{Model Output } \mathbf{0.7216}$.

### 4.2 Explainability Boundaries & Scientific Caveats
* **Attribution vs. Causation:** The UI consistently displays the disclaimer: *"SHAP values describe how input features contributed to the model prediction. They do not establish biological causation or constitute a clinical diagnosis."*
* **Ranking Integrity:** Features are ranked strictly by absolute magnitude $|\phi_i|$ with signed directional indicators ($+$ pushes probability higher, $-$ pushes lower).

### 4.3 One-Hot Categorical Grouping Mathematics (CV-08)
When categorical features undergo one-hot expansion (`BBB` $\rightarrow$ 3 columns, `VHD` $\rightarrow$ 4 columns), naive grouping by summing absolute magnitudes ($\sum |\phi_j|$) destroys the linear additivity property of SHAP. CardioVision AI uses **associative signed summation**:
$$\phi_{\text{parent}} = \sum_{j \in \text{parent}} \phi_j$$
Because addition is associative and commutative over $\mathbb{R}$:
$$\sum_{k=1}^{55} \phi_{\text{grouped}, k} = \sum_{i=1}^{60} \phi_{\text{transformed}, i} = \text{shap\_sum}$$
* **Mathematical Property:** The grouped contribution precisely reflects the net directional shift exerted by the categorical variable on the prediction (probability space for RF, log-odds margin space for XGBoost).
* **Clinical Inspection:** While the clinical dashboard displays the parent domain (`Bundle Branch Block` and `Valvular Heart Disease`), an expandable accordion drawer allows technical judges and cardiologists to inspect the individual indicator level attributions (`BBB_N`, `BBB_LBBB`, `BBB_RBBB`, etc.).
* **Test Verification:** Unit test `test_grouped_onehot_shap_additivity` confirms $|\sum \phi_{\text{grouped}} - \text{shap\_sum}| < 10^{-12}$ across all 4 targets.

---

## 5. Probability Calibration & Clinical Limitations

### 5.1 Uncalibrated Empirical Decision Scores (CV-07)
* **Model Outputs as Decision Scores:** Probabilities returned by `predict_proba()` represent empirical ensemble voting fractions (Random Forest) and sigmoid margins (XGBoost). They have **not** undergone post-hoc calibration (e.g., Platt scaling, isotonic regression, or beta calibration) against prospective clinical event rates.
* **Display Tiers vs Clinical Thresholds:** The risk tiers—Low (<35%), Moderate (35–65%), and High (≥65%)—are application operational display thresholds designed to structure multidisciplinary review. They are not validated epidemiological cutoff points for invasive intervention.
* **Clinical Guidance Disclosure:** Prominently featured across `AnalysisSection.jsx` and `MODEL_CARD.md`: *"Uncalibrated Model Decision Scores — Probabilities represent algorithmic decision scores on the UCI cohort (N=303), not calibrated real-world event frequencies. Model outputs are for research and educational demonstration only."*

### 5.2 Cohort Limitations & Medical Governance Boundaries
1. **Small Sample Cohort ($N=303$):** All records derive from a single medical center (Tehran Heart Center). True out-of-distribution performance on external multi-center populations remains unverified.
2. **Territory Mapping vs. Intravascular Plaque:** The 3D model colors the entire epicardial arterial course based on the model's global branch probability. It does not measure physical luminal diameter or locate localized atherosclerotic plaques.
3. **Standard Baseline Lab Assumptions:** In emergency or outpatient triage where full blood counts or electrolytes are uncollected, baseline values reflect standard healthy reference norms, and their attributions reflect model behavior under those assumptions.

