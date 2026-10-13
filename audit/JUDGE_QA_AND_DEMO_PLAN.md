# CardioVision AI — Hackathon Demonstration Plan & Tough Judge Q&A

**Purpose:** Practical 3–5 minute live demonstration walkthrough and comprehensive preparation for high-difficulty technical, clinical, and architectural judge cross-examination.  

---

## Part 1: Official 3–5 Minute High-Impact Live Demonstration Plan (9-Point Sequence)

| Time | Demonstration Phase | On-Screen Action & Route | Core Speaking Script & Key Technical Message |
| :---: | :--- | :--- | :--- |
| **0:00 – 0:30** | **1. Purpose & Clinical Safety Boundary** | Home Page (`/`) | *"Cardiovascular disease remains the leading global cause of mortality. Clinicians face significant uncertainty anticipating vessel-specific stenosis prior to invasive coronary catheterization. CardioVision AI is a research decision-support prototype that estimates CAD and branch stenosis probabilities, explains them with dual-space TreeSHAP, and maps them onto an interactive 3D coronary workspace. Crucially, our safety boundary is clear: this is an educational prototype that estimates territory risk, not an autonomous diagnostic tool."* |
| **0:30 – 1:05** | **2. Assessment Inputs & Provenance Disclosures** | Assessment (`/assessment`) | *Click 'Anterior Risk Profile' preset $\rightarrow$ Point to Demographics, Vitals, ECG leads $\rightarrow$ Highlight 'Provenance Disclosure Banner' and 'Documentation-Only' badge on Troponin I / CK-MB.*<br>*"Notice our clinical honesty: our UCI training cohort contains 55 features, but rapid clinical triage captures 18 core vitals. Uncollected lab values are explicitly disclosed as standard population baselines rather than fabricated patient measurements."* |
| **1:05 – 1:35** | **3. Live Model Inference Execution** | Assessment (`/assessment`) $\rightarrow$ Analysis (`/analysis`) | *Click 'Run Full AI Assessment' button $\rightarrow$ Observe instant transition (<150ms roundtrip).*<br>*"Zero mock data. The patient payload is validated by Pydantic v2 schemas and processed through our scikit-learn ColumnTransformer pipeline and 4 persisted tree models in real time."* |
| **1:35 – 2:10** | **4. Multi-Target Predictions & Decision Scores** | Analysis (`/analysis`) | *Point out Overall CAD (93.8%) and branch breakdown: LAD (84.2%), LCX (61.7%), RCA (72.2%). Highlight the prominent 'Uncalibrated Model Decision Scores' notice.*<br>*"We run four dedicated classifiers trained against angiographic stenosis (≥50% luminal narrowing). Notice our clinical notice: outputs are uncalibrated empirical decision scores on our N=303 cohort, not calibrated epidemiologic event rates."* |
| **2:10 – 2:55** | **5. Interactive 3D Anatomy Workspace** | 3D Anatomy (`/3d-anatomy`) | *Select LAD (Anterior view) $\rightarrow$ Toggle X-ray mode to show hollow lumens $\rightarrow$ Select LCX (Lateral view) $\rightarrow$ Select RCA (Right AV view).*<br>*"Our Three.js viewport provides interactive territory mapping with synchronized risk tiers. Crucially, we do not claim to pinpoint individual physical plaques; highlights represent model-estimated territory-level associations."* |
| **2:55 – 3:45** | **6. TreeSHAP Explainability & Grouped Views** | Explainability (`/explainability`) | *Show base value + feature contributions $\rightarrow$ Switch to LCX $\rightarrow$ Toggle 'Clinical Grouped View (55)' vs 'Technical Transformed View (60)' $\rightarrow$ Open 'Bundle Branch Block' component drawer.*<br>*"We maintain exact mathematical rigor: Random Forest explains in probability space, XGBoost explains in log-odds margin space. Categorical one-hot features are grouped using signed net summation, preserving exact linear additivity while letting doctors inspect individual levels."* |
| **3:45 – 4:20** | **7. Empirical Performance & Split Methodology** | Performance (`/performance`) | *Open Performance table $\rightarrow$ Compare 5-Fold Training CV against Holdout Test metrics $\rightarrow$ Show confusion matrices.*<br>*"We evaluated on an isolated 80/20 stratified split (N=61 test). We honestly publish the branch difficulty: LCX achieves 68.6% ROC-AUC and RCA achieves 70.2%, reflecting the real-world challenge of branch prediction."* |
| **4:20 – 4:45** | **8. Target Leakage Prevention Architecture** | Methodology (`/methodology`) | *Open Methodology flowchart and target-leakage documentation.*<br>*"Post-catheterization outcomes (Cath, LAD, LCX, RCA, and CAD) are strictly dropped before constructing the feature matrix and guarded by runtime programmatic assertions. Zero leakage reaches the model."* |
| **4:45 – 5:00** | **9. Closing & Clinical Validation Summary** | Safety (`/safety`) & Report (`/report`) | *Display standardized printable clinical report and closing safety summary.*<br>*"CardioVision AI proves how transparent AI engineering can deliver mathematically rigorous decision support. While not yet clinically validated in prospective multi-center trials, it provides an architectural blueprint for responsible medical AI."* |

---

## Part 2: 15 Tough Judge Questions & Evidence-Based Answers

### Q1. "Your dataset only has 303 patients. How can you claim statistical validity or clinical generalizability?"
**Evidence-Based Answer:**  
*"We explicitly do not claim external clinical generalizability. That is one of our primary documented limitations. In our Model Card and Methodology sections, we state that this prototype is evaluated internally on the UCI Extension of the Z-Alizadeh Sani cohort ($N=303$). To prevent overfitting on this small sample, we used shallow tree depths (`max_depth=6` for RF, `max_depth=4` for XGBoost), strong regularization (`subsample=0.85`), and stratified 5-fold cross-validation nested strictly inside the training partition. For true clinical deployment, prospective multi-center validation across diverse demographics would be mandatory."*

---

### Q2. "How did you ensure there was zero data leakage between your training and test sets?"
**Evidence-Based Answer:**  
*"We implemented a three-tier leakage defense:  
First, an 80/20 stratified split ($N=242$ train, $N=61$ test) was locked with a fixed random seed before any preprocessing.  
Second, all preprocessing—including median imputation and standard scaling—was encapsulated inside an `sklearn.pipeline.Pipeline` and fitted independently within each cross-validation fold, completely isolating the test split.  
Third, all post-catheterization outcome fields (`LAD`, `LCX`, `RCA`, `Cath`, and derived `CAD`) were strictly dropped before constructing the feature matrix $X$, and enforced via programmatic runtime assertions in both `train_models.py` and `main.py`."*

---

### Q3. "Why are your vessel-level holdout metrics (LCX ROC-AUC: 68.6%, RCA: 70.2%) so much lower than overall CAD (86.6%)?"
**Evidence-Based Answer:**  
*"Because localized vessel stenosis is a much harder clinical problem than overall disease presence. Systemic CAD manifests clearly through global risk factors like age, dyslipidemia, diabetes, and smoking. However, whether stenosis specifically affects the circumflex versus the right coronary artery depends on localized hemodynamic shear stress and micro-vascular anatomy that cannot be fully captured by non-invasive tabular biomarkers. We deliberately chose to report these honest, empirical metrics rather than over-tuning on the test set or manufacturing synthetic baseline numbers."*

---

### Q4. "How do you handle class imbalance across the different arterial targets?"
**Evidence-Based Answer:**  
*"In our cohort, CAD prevalence is 71.3%, LAD is 58.4%, LCX is 39.3%, and RCA is 37.6%. For the Random Forest models (CAD and LAD), we employed `class_weight='balanced'`, which inversely weights samples proportional to class frequencies. For the minority vessel branches (LCX and RCA) trained on XGBoost, we dynamically calculated `scale_pos_weight = neg_count / pos_count` directly from the training split (1.55 for LCX and 1.66 for RCA) to penalize false negatives on stenotic cases."*

---

### Q5. "Are your output probabilities calibrated? Can a clinician interpret 72% as a real-world 72% risk of disease?"
**Evidence-Based Answer:**  
*"No, they are uncalibrated empirical decision scores from `predict_proba()`. We document this explicitly in our Model Card and README. Tree ensembles, especially XGBoost, produce margin outputs that can be pushed toward the extremes. While these scores provide valid monotonic ranking for risk stratification, they do not represent true Bayesian posterior probabilities. In our clinical disclaimers, we advise that outputs represent model-estimated probability tiers (Low, Moderate, High) rather than absolute epidemiological risk."*

---

### Q6. "In your TreeSHAP dashboard, features like 'Platelet count' and 'Typical Chest Pain' appear in the top drivers, but they aren't on your input form. Where did they come from?"
**Evidence-Based Answer:**  
*"Our models were trained on the full 55 clinical features of the UCI dataset. To keep the patient assessment form practical for rapid emergency or clinic triage, the UI captures the 20 most critical biomarkers. In the backend, uncollected lab tests are imputed to reference normal population baselines (e.g. `PLT=220,000`, `CR=1.0`), and chest pain type is inferred from age and ECG findings. Because standard scaling normalizes these against the training distribution, TreeSHAP correctly identifies how those baseline assumptions influence the prediction. In our improvement register (Issue CV-01), we are adding explicit 'Imputed Baseline' tags so clinicians immediately see which features were entered versus defaulted."*

---

### Q7. "Why did you use Random Forest for CAD and LAD, but XGBoost for LCX and RCA?"
**Evidence-Based Answer:**  
*"Our algorithm selection was determined objectively by the highest mean 5-fold cross-validation ROC-AUC on the training split, without peeking at the holdout test set:  
- For CAD: Random Forest achieved 0.926 vs XGBoost's 0.919.  
- For LAD: Random Forest achieved 0.850 vs XGBoost's 0.823.  
- For LCX: XGBoost achieved 0.752 vs Random Forest's 0.751.  
- For RCA: XGBoost achieved 0.714 vs Random Forest's 0.686.  
We selected the highest-performing architecture independently for each target rather than forcing a one-size-fits-all model."*

---

### Q8. "What is the difference between TreeSHAP in probability space versus margin space, and why does it matter?"
**Evidence-Based Answer:**  
*"Random Forest models output probability directly as the mean prediction of ensemble trees. Therefore, TreeSHAP decomposes the output additively in probability space: $\text{Prob} = \text{Base} + \sum \phi_i$.  
In contrast, XGBoost builds trees in raw log-odds (margin) space. Explaining XGBoost directly in probability space violates additivity unless expensive non-linear transformations are used. Instead, we compute TreeSHAP in log-odds space where additivity holds strictly: $\text{Margin} = \text{Base} + \sum \phi_i$, and then map the sum through the logistic sigmoid $\sigma(M)$ to obtain probability. We clearly label this distinction in our UI so clinicians and technical reviewers understand the scale."*

---

### Q9. "Does your 3D visualization locate actual plaques in the patient's arteries?"
**Evidence-Based Answer:**  
*"Absolutely not, and we state this prominently across our entire platform. Tabular machine learning cannot predict physical 3D spatial coordinates without intravascular imaging (such as IVUS, OCT, or CT coronary angiography). Our 3D visualization is a territory mapping tool: it colors the anatomical course of the LAD, LCX, or RCA according to the statistical probability estimated by the model for that arterial branch. It helps clinicians visualize coronary perfusion territories, but it never manufactures fake plaque geometries."*

---

### Q10. "Where did your 3D heart asset come from? Is it properly licensed?"
**Evidence-Based Answer:**  
*"Our 3D heart asset (`heart.glb`) was generated programmatically using a custom Node.js script (`frontend/scripts/generate_heart_model.mjs`) leveraging Three.js procedural geometries (`TubeGeometry`, `CatmullRomCurve3D`, and `LatheGeometry`). Because we synthesized the asset mathematically within our own codebase, there are zero third-party copyright restrictions, external licensing fees, or proprietary dependencies."*

---

### Q11. "Why do you have Acute Cardiac Biomarkers (Troponin I and CK-MB) on the form if they aren't used by the model?"
**Evidence-Based Answer:**  
*"In an acute cardiovascular setting, cardiac troponins and CK-MB are the first biomarkers ordered to rule out acute myocardial infarction. Clinicians expect to document these markers in any coronary evaluation. However, the UCI Z-Alizadeh Sani dataset reflects non-invasive outpatient and diagnostic catheterization features and does not include troponin assays. We included them for clinical chart documentation and printed report export, but we added explicit amber warning badges in both the form and report stating: 'Documentation-only field; does not alter model predictions'."*

---

### Q12. "What AI tools were used to build this project, and how do you disclose them?"
**Evidence-Based Answer:**  
*"In accordance with hackathon rules and scientific integrity, we explicitly disclose in our README (Section: AI-Assisted Engineering Workflow) that CardioVision AI was developed using Antigravity IDE and AI-assisted workflows for code generation, iterative debugging, and component scaffolding. All machine learning pipelines, preprocessing assertions, and TreeSHAP calculations run autonomously on our Python backend and do not rely on external cloud AI APIs."*

---

### Q13. "What happens if a clinician enters an extreme or invalid value, like a heart rate of 300 or a negative age?"
**Evidence-Based Answer:**  
*"Our FastAPI service uses strict Pydantic v2 schemas with clinical bounds. For example, Age is bounded between 18 and 110, Systolic BP between 70 and 260, and BMI between 12 and 65. If an out-of-range value is submitted, the API immediately rejects the request with HTTP 422 Unprocessable Entity, returning structured error messages detailing the exact field and acceptable boundaries rather than failing silently or producing corrupted predictions."*

---

### Q14. "What prevents this application from being misused as an autonomous diagnostic tool?"
**Evidence-Based Answer:**  
*"Multiple layers of governance:  
1. A persistent, non-dismissible clinical disclaimer banner pinned to the top of every screen.  
2. Model outputs are explicitly classified as 'Research & Educational Decision-Support Estimates'.  
3. Every recommendation text advises that formal evaluation requires clinical correlation and diagnostic imaging.  
4. The application does not provide prescription suggestions, dose calculators, or autonomous intervention directives."*

---

### Q15. "Why is CardioVision AI useful if it is only an educational and research prototype?"
**Evidence-Based Answer:**  
*"Because it bridges the gap between complex multi-target tabular machine learning and intuitive clinical communication. Most ML projects output a single probability in a terminal or static table. CardioVision AI demonstrates how multi-vessel branch estimation, local TreeSHAP mathematical explainability, and interactive 3D coronary anatomy can be unified into an interactive multidisciplinary workspace. It serves as an architectural blueprint for next-generation clinical decision-support systems."*

---

## Part 3: Official Hackathon Video Recording Protocols & Submission Checklist

### 3.1 Recommended Recording Resolution & Display Framing
* **Display Resolution:** Exactly `1920 × 1080` (Full HD, 16:9 aspect ratio) or `2560 × 1440` (QHD downscaled).
* **Frame Rate:** 60 FPS (mandatory for smooth Three.js orbit controls, camera lerp transitions, and pulse animations).
* **Browser Zoom Level:** Set to exactly `100%` in Google Chrome or Safari to preserve standard UI padding and responsive typography.
* **Audio Capture:** High-fidelity dedicated microphone (cardioid pattern), 48 kHz / 24-bit PCM audio, noise gate/suppression enabled to eliminate background fan or typing noise.
* **Duration Enforcement:** Exactly 3:30 to 4:45 minutes (comfortably below the 5:00 maximum hackathon cut-off).

### 3.2 Secrets, Privacy & Desktop Hygiene Checklist (Pre-Recording)
- [ ] **Silence Notifications:** Enable macOS "Do Not Disturb" / Focus mode (`System Settings > Focus > Do Not Disturb: ON`).
- [ ] **Close Background Tabs:** Ensure only one browser window is open displaying `http://localhost:5175`. Close all email, Slack, Discord, WhatsApp, and personal browsing tabs.
- [ ] **Hide Terminal Credentials:** When showing the backend service or test execution, ensure terminals do not display `.env` files, API keys, AWS credentials, or personal path names.
- [ ] **Synthetic EHR Protection:** Verify that all patient names used in the live demo are clearly synthetic demonstration profiles (e.g., "Patient Case: Anterior STEMI Profile") rather than any real-world identifiable patient information.
- [ ] **Clean Desktop:** Hide desktop icons, dock autohide enabled if recording full display.

### 3.3 Physical Recording Step-by-Step Action Sequence
1. **Start Screen:** Open `http://localhost:5175/` in Chrome fullscreen.
2. **Phase 1 (0:00–0:30):** Deliver Problem & Governance opening statement. Hover over Executive Metric cards.
3. **Phase 2 (0:30–1:05):** Navigate to Assessment (`/assessment`). Click 'Anterior Risk Profile'. Point out 'Provenance Disclosure Banner' and 'Documentation-Only' badges.
4. **Phase 3 (1:05–1:35):** Click 'Run Full AI Assessment'. Transition to Analysis (`/analysis`).
5. **Phase 4 (1:35–2:10):** Walk through CAD, LAD, LCX, RCA scores. Point out the 'Uncalibrated Model Decision Scores' clinical guidance notice.
6. **Phase 5 (2:10–2:55):** Switch to 3D Anatomy (`/3d-anatomy`). Click LAD (Anterior preset), LCX (Lateral preset), RCA (Right AV preset). Toggle X-ray mode.
7. **Phase 6 (2:55–3:45):** Switch to Explainability (`/explainability`). Show waterfall. Toggle between 'Clinical Grouped View (55)' and 'Technical Transformed View (60)'. Expand 'Bundle Branch Block' component drawer.
8. **Phase 7 (3:45–4:20):** Switch to Performance (`/performance`). Show 5-fold CV vs Holdout comparison table. Show confusion matrices.
9. **Phase 8 (4:20–4:45):** Switch to Methodology (`/methodology`). Show target-leakage isolation pipeline diagram.
10. **Phase 9 (4:45–5:00):** Switch to Report (`/report`). Show standardized clinical summary with educational disclaimers. Conclude.

### 3.4 Final Upload & Submission Checklist
- [ ] Video exported as MP4 (H.264 / AAC, 1080p60, bitrate 8–12 Mbps).
- [ ] Upload to YouTube as "Unlisted" or public Vimeo, with comments disabled.
- [ ] Verify audio sync and clear voiceover clarity.
- [ ] Paste YouTube/Vimeo URL into `README.md` demo link section.
- [ ] Push all committed audit files and verified code to GitHub main branch.
- [ ] Submit official hackathon portal form with repository link, demo video link, and architecture summary.

