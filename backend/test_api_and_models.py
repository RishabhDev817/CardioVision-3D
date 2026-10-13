"""
CardioVision AI - Automated Regression Test Suite
Covers:
1. Risk-tier boundaries & color mappings (CV-02)
2. Input validation & error handling
3. Prediction response schema & target names
4. Target leakage isolation assertions
5. Feature provenance metadata registry & endpoints (CV-01)
6. TreeSHAP output space & additivity
7. Pending / unassessed state handling
8. Core API endpoints health & documentation
"""

import math
import unittest
from fastapi.testclient import TestClient
from backend.main import (
    app,
    load_artifacts,
    get_risk_tier,
    get_risk_color,
    FEATURE_PROVENANCE_REGISTRY,
    DOCUMENTATION_ONLY_FIELDS,
    TARGET_LEAKAGE_EXCLUSIONS
)


class TestRiskTierBoundaries(unittest.TestCase):
    """CV-02: Test boundary conditions for project-wide risk tiers."""

    def test_low_risk_boundaries(self):
        # Boundaries strictly below 0.35 must be Low
        self.assertEqual(get_risk_tier(0.0), "Low")
        self.assertEqual(get_risk_tier(0.15), "Low")
        self.assertEqual(get_risk_tier(0.3499), "Low")
        self.assertEqual(get_risk_color(0.3499), "#059669")

    def test_moderate_risk_boundaries(self):
        # Exactly 0.35 through strictly below 0.65 must be Moderate
        self.assertEqual(get_risk_tier(0.35), "Moderate")
        self.assertEqual(get_risk_color(0.35), "#d97706")
        self.assertEqual(get_risk_tier(0.50), "Moderate")
        self.assertEqual(get_risk_color(0.50), "#d97706")
        self.assertEqual(get_risk_tier(0.6499), "Moderate")
        self.assertEqual(get_risk_color(0.6499), "#d97706")

    def test_high_risk_boundaries(self):
        # 0.65 and higher must be High
        self.assertEqual(get_risk_tier(0.65), "High")
        self.assertEqual(get_risk_color(0.65), "#dc2626")
        self.assertEqual(get_risk_tier(0.7001), "High")
        self.assertEqual(get_risk_color(0.7001), "#dc2626")
        self.assertEqual(get_risk_tier(1.0), "High")

    def test_pending_unassessed_state(self):
        # None, NaN, and undefined must return Pending with slate color (#94a3b8)
        self.assertEqual(get_risk_tier(None), "Pending")
        self.assertEqual(get_risk_color(None), "#94a3b8")
        self.assertEqual(get_risk_tier(float('nan')), "Pending")
        self.assertEqual(get_risk_color(float('nan')), "#94a3b8")


class TestFeatureProvenance(unittest.TestCase):
    """CV-01: Test centralized feature provenance metadata registry."""

    @classmethod
    def setUpClass(cls):
        load_artifacts()
        cls.client = TestClient(app)

    def test_provenance_registry_structure(self):
        # Total candidate features in registry is 62 (55 raw + 7 one-hot expansions)
        self.assertEqual(len(FEATURE_PROVENANCE_REGISTRY), 62)

        # Count provenance categories
        counts = {"user_entered": 0, "derived": 0, "heuristic": 0, "fixed_constant": 0}
        for feat, meta in FEATURE_PROVENANCE_REGISTRY.items():
            ptype = meta["type"]
            self.assertIn(ptype, counts)
            counts[ptype] += 1
            self.assertIn("label", meta)
            self.assertIn("description", meta)

        self.assertEqual(counts["user_entered"], 18)
        self.assertEqual(counts["derived"], 3)
        self.assertEqual(counts["heuristic"], 5)
        # 29 raw fixed constants + 7 one-hot indicator columns = 36 total fixed constant entries
        self.assertEqual(counts["fixed_constant"], 36)

    def test_documentation_only_fields(self):
        # Audited documentation-only fields must be explicitly registered
        expected_doc_only = {"troponin_i", "ck_mb", "diastolic_bp"}
        self.assertEqual(set(DOCUMENTATION_ONLY_FIELDS.keys()), expected_doc_only)

    def test_provenance_api_endpoint(self):
        resp = self.client.get("/features/provenance")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        counts = data["counts"]
        self.assertEqual(counts["total_raw_candidate_features"], 55)
        self.assertEqual(counts["total_transformed_features"], 60)
        self.assertEqual(counts["user_entered"], 18)
        self.assertEqual(counts["derived"], 3)
        self.assertEqual(counts["heuristic"], 5)
        self.assertEqual(counts["documentation_only"], 3)
        self.assertIn("sensitivity_analysis_summary", data)


class TestTargetLeakageIsolation(unittest.TestCase):
    """Verify target columns are never present in model inputs."""

    def test_leakage_exclusions(self):
        forbidden = {"Cath", "CAD", "LAD", "LCX", "RCA"}
        self.assertEqual(set(TARGET_LEAKAGE_EXCLUSIONS), forbidden)
        for col in forbidden:
            self.assertNotIn(col, FEATURE_PROVENANCE_REGISTRY)


class TestPredictionAndExplainability(unittest.TestCase):
    """Test prediction schema, input validation, and SHAP output space."""

    @classmethod
    def setUpClass(cls):
        load_artifacts()
        cls.client = TestClient(app)

    def setUp(self):
        self.valid_payload = {
            "age": 63,
            "sex": 1,
            "bmi": 27.1,
            "smoking": 1,
            "diabetes": 1,
            "hypertension": 1,
            "family_history": 1,
            "systolic_bp": 154,
            "diastolic_bp": 94,
            "heart_rate": 86,
            "total_cholesterol": 245,
            "ldl": 165,
            "hdl": 34,
            "triglycerides": 230,
            "fasting_blood_sugar": 152,
            "troponin_i": 0.18,
            "ck_mb": 14.5,
            "st_elevation": 1,
            "t_inversion": 1,
            "lvh": 1,
            "ejection_fraction": 40.0,
            "region_rwma": "Anterior"
        }

    def test_valid_prediction_schema(self):
        resp = self.client.post("/predict", json=self.valid_payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # Check required top-level keys
        self.assertIn("overall_cad", data)
        self.assertIn("vessels", data)
        self.assertIn("feature_provenance_summary", data)
        self.assertIn("summary", data)

        # Check vessel keys
        vessels = data["vessels"]
        for v in ["LAD", "LCX", "RCA"]:
            self.assertIn(v, vessels)
            v_data = vessels[v]
            self.assertTrue(0.0 <= v_data["probability"] <= 1.0)
            self.assertIn(v_data["risk_tier"], ["Low", "Moderate", "High"])
            self.assertIn("color", v_data)
            self.assertIn("top_shap_features", v_data)
            self.assertIn("all_shap_features", v_data)

    def test_shap_provenance_attachment(self):
        resp = self.client.post("/predict", json=self.valid_payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        cad = data["overall_cad"]
        top_shap = cad["top_shap_features"]
        self.assertTrue(len(top_shap) > 0)

        # Each SHAP record must have provenance metadata
        for feat in top_shap:
            self.assertIn("feature", feat)
            self.assertIn("shap_value", feat)
            self.assertIn("provenance_type", feat)
            self.assertIn("provenance_label", feat)
            self.assertIn("is_imputed", feat)
            self.assertIn("patient_value", feat)

    def test_shap_output_space_additivity(self):
        resp = self.client.post("/predict", json=self.valid_payload)
        data = resp.json()

        # RF target (CAD): output space is probability
        cad = data["overall_cad"]
        self.assertEqual(cad["shap_output_space"], "probability")
        # Additivity: base_value + sum_shap ≈ probability
        approx_prob = cad["shap_base_value"] + cad["shap_sum"]
        self.assertAlmostEqual(approx_prob, cad["probability"], delta=0.08)

        # XGBoost target (LCX): output space is raw_log_odds (margin)
        lcx = data["vessels"]["LCX"]
        self.assertEqual(lcx["shap_output_space"], "raw_log_odds")
        # Sigmoid of margin ≈ probability
        margin_z = lcx["shap_base_value"] + lcx["shap_sum"]
        sigmoid_prob = 1.0 / (1.0 + math.exp(-margin_z))
        self.assertAlmostEqual(sigmoid_prob, lcx["probability"], delta=0.08)

    def test_invalid_input_validation(self):
        # Empty body must return 422
        resp = self.client.post("/predict", json={})
        self.assertEqual(resp.status_code, 422)

        # Age below valid range (min is 18)
        invalid_age = dict(self.valid_payload)
        invalid_age["age"] = 10
        resp = self.client.post("/predict", json=invalid_age)
        self.assertEqual(resp.status_code, 422)

        # Ejection fraction above valid range (max is 85)
        invalid_ef = dict(self.valid_payload)
        invalid_ef["ejection_fraction"] = 120.0
        resp = self.client.post("/predict", json=invalid_ef)
        self.assertEqual(resp.status_code, 422)


class TestCoreEndpoints(unittest.TestCase):
    """Test health, metrics, methodology, and model card endpoints."""

    @classmethod
    def setUpClass(cls):
        load_artifacts()
        cls.client = TestClient(app)

    def test_root_health(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")

    def test_metrics_endpoint(self):
        resp = self.client.get("/metrics")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "available")
        self.assertIn("models", data)
        for tgt in ["CAD", "LAD", "LCX", "RCA"]:
            self.assertIn(tgt, data["models"])

    def test_methodology_endpoint(self):
        resp = self.client.get("/methodology")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # Verify 3D model asset provenance accurately states procedural Three.js
        doc = data.get("anatomical_model_documentation", {})
        self.assertIn("procedural", doc.get("source", "").lower())
        self.assertIn("generate_heart_model.mjs", doc.get("attribution", ""))
        self.assertNotIn("CC-BY", doc.get("license", ""))

    def test_features_catalog(self):
        resp = self.client.get("/features")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["total_transformed_features"], 60)


class TestOneHotGroupingAndAdditivity(unittest.TestCase):
    """CV-08: Test parent-level grouping for one-hot features with exact signed additivity."""

    @classmethod
    def setUpClass(cls):
        load_artifacts()
        cls.client = TestClient(app)

    def test_grouped_features_count_and_additivity(self):
        from backend.main import PatientInput
        payload = PatientInput.Config.json_schema_extra["example"]
        resp = self.client.post("/predict", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        for tgt_key in ["overall_cad", "LAD", "LCX", "RCA"]:
            target_obj = data["overall_cad"] if tgt_key == "overall_cad" else data["vessels"][tgt_key]
            grouped = target_obj.get("grouped_shap_features", [])
            all_feats = target_obj.get("all_shap_features", [])

            # Grouped features must collapse 60 transformed columns to exactly 55 candidate features
            self.assertEqual(len(grouped), 55)
            self.assertEqual(len(all_feats), 60)

            # Mathematical linear additivity: sum of signed grouped SHAP == target shap_sum
            sum_grouped = sum(f["shap_value"] for f in grouped)
            self.assertAlmostEqual(sum_grouped, target_obj["shap_sum"], delta=0.005)

            # Verify presence of grouped categorical parents
            grouped_names = {f["feature"] for f in grouped}
            self.assertIn("Bundle Branch Block (BBB)", grouped_names)
            self.assertIn("Valvular Heart Disease (VHD)", grouped_names)

            # Verify sub_components structure inside grouped items
            bbb_rec = next(f for f in grouped if f["feature"] == "Bundle Branch Block (BBB)")
            self.assertTrue(bbb_rec.get("is_grouped_categorical"))
            self.assertEqual(len(bbb_rec.get("sub_components", [])), 3)

            vhd_rec = next(f for f in grouped if f["feature"] == "Valvular Heart Disease (VHD)")
            self.assertTrue(vhd_rec.get("is_grouped_categorical"))
            self.assertEqual(len(vhd_rec.get("sub_components", [])), 4)


class TestDocumentationOnlyIsolation(unittest.TestCase):
    """CV-01: Verify that documentation-only fields do not alter model predictions."""

    @classmethod
    def setUpClass(cls):
        load_artifacts()
        cls.client = TestClient(app)

    def test_doc_only_fields_mutation_has_zero_effect(self):
        from backend.main import PatientInput
        base_payload = dict(PatientInput.Config.json_schema_extra["example"])
        mutated_payload = dict(base_payload)

        # Alter all 3 documentation-only fields drastically
        mutated_payload["troponin_i"] = 0.95  # Acute elevation (normal < 0.04)
        mutated_payload["ck_mb"] = 48.0       # Acute elevation (normal < 5.0)
        mutated_payload["diastolic_bp"] = 115.0 # Hypertensive crisis

        resp_base = self.client.post("/predict", json=base_payload).json()
        resp_mut = self.client.post("/predict", json=mutated_payload).json()

        # Probabilities must be strictly identical
        self.assertEqual(resp_base["overall_cad"]["probability"], resp_mut["overall_cad"]["probability"])
        for v in ["LAD", "LCX", "RCA"]:
            self.assertEqual(
                resp_base["vessels"][v]["probability"],
                resp_mut["vessels"][v]["probability"],
                f"Documentation-only field alteration modified {v} probability!"
            )


class TestReproducibleSensitivityAnalysis(unittest.TestCase):
    """CV-01: Reproduce empirical model sensitivity experiments on fixed schema fixture."""

    @classmethod
    def setUpClass(cls):
        load_artifacts()

    def test_typical_chest_pain_sensitivity(self):
        from backend.main import PatientInput, build_raw_feature_vector, ARTIFACTS
        fixture = PatientInput.Config.json_schema_extra["example"]
        p = PatientInput(**fixture)
        df1 = build_raw_feature_vector(p)
        df0 = df1.copy()
        df0["Typical Chest Pain"] = 0

        cad_m = ARTIFACTS["cad_model"]
        lcx_m = ARTIFACTS["lcx_model"]

        p1_cad = round(float(cad_m.predict_proba(df1)[0, 1]), 4)
        p0_cad = round(float(cad_m.predict_proba(df0)[0, 1]), 4)
        p1_lcx = round(float(lcx_m.predict_proba(df1)[0, 1]), 4)
        p0_lcx = round(float(lcx_m.predict_proba(df0)[0, 1]), 4)

        # Verified reproducible figures
        self.assertEqual(p1_cad, 0.9375)
        self.assertEqual(p0_cad, 0.8149)
        self.assertEqual(p1_lcx, 0.6171)
        self.assertEqual(p0_lcx, 0.3043)

    def test_plt_and_cr_sensitivity(self):
        from backend.main import PatientInput, build_raw_feature_vector, ARTIFACTS
        fixture = PatientInput.Config.json_schema_extra["example"]
        p = PatientInput(**fixture)
        df = build_raw_feature_vector(p)
        lcx_m = ARTIFACTS["lcx_model"]

        # Platelet sensitivity
        df_plt150 = df.copy(); df_plt150["PLT"] = 150.0
        df_plt350 = df.copy(); df_plt350["PLT"] = 350.0
        p_plt150 = round(float(lcx_m.predict_proba(df_plt150)[0, 1]), 4)
        p_plt350 = round(float(lcx_m.predict_proba(df_plt350)[0, 1]), 4)
        self.assertEqual(p_plt150, 0.8374)
        self.assertEqual(p_plt350, 0.6703)

        # Creatinine sensitivity
        df_cr10 = df.copy(); df_cr10["CR"] = 1.0
        df_cr18 = df.copy(); df_cr18["CR"] = 1.8
        p_cr10 = round(float(lcx_m.predict_proba(df_cr10)[0, 1]), 4)
        p_cr18 = round(float(lcx_m.predict_proba(df_cr18)[0, 1]), 4)
        self.assertEqual(p_cr10, 0.6171)
        self.assertEqual(p_cr18, 0.8478)


class TestProbabilityCalibrationDisclosures(unittest.TestCase):
    """CV-07: Test probability calibration disclosures across metadata endpoints."""

    @classmethod
    def setUpClass(cls):
        load_artifacts()
        cls.client = TestClient(app)

    def test_model_card_and_methodology_disclosures(self):
        resp = self.client.get("/methodology")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("target_leakage_audit", data)

        resp_metrics = self.client.get("/metrics")
        self.assertEqual(resp_metrics.status_code, 200)
        metrics_data = resp_metrics.json()
        self.assertEqual(metrics_data["status"], "available")


class TestLegacyFileArchival(unittest.TestCase):
    """CV-06: Confirm legacy and unused files are safely archived."""

    def test_archive_directories_exist(self):
        from pathlib import Path
        root = Path(__file__).resolve().parent.parent

        # Verify active directory has only production CSV
        data_dir = root / "backend" / "data"
        self.assertTrue((data_dir / "z_alizadeh_sani_extension.csv").exists())
        self.assertFalse((data_dir / "cad_clinical_data.csv").exists())

        # Verify archived files exist in archive subdirectories with documentation
        data_archive = data_dir / "archive"
        self.assertTrue((data_archive / "cad_clinical_data.csv").exists())
        self.assertTrue((data_archive / "README.md").exists())

        models_dir = root / "frontend" / "public" / "models"
        self.assertTrue((models_dir / "heart.glb").exists())
        self.assertFalse((models_dir / "test.glb").exists())
        self.assertTrue((models_dir / "archive" / "test.glb").exists())
        self.assertTrue((models_dir / "archive" / "README.md").exists())


if __name__ == "__main__":
    unittest.main()
