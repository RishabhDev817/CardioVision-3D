import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Heart,
  TrendingUp,
  Scale,
  Activity,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function ModelCard({ modelCardData }) {
  const [activeTab, setActiveTab] = useState('all');

  // Verified defaults strictly matching trained artifacts if modelCardData is pending
  const summary = modelCardData?.compact_summary || {
    n_records: 303,
    raw_clinical_inputs: 55,
    transformed_features: 60,
    prediction_targets: 4,
    cv_strategy: '5-fold stratified CV',
    holdout_evaluation: 'Untouched 20% holdout',
    external_validation: 'No external validation'
  };

  const performanceTargets = modelCardData?.performance?.targets || {
    CAD: {
      target_name: 'CAD',
      selected_algorithm: 'Random Forest',
      cv_roc_auc: '0.926 ± 0.040',
      holdout_metrics: { accuracy: 0.8361, precision: 0.8837, recall: 0.8837, f1: 0.8837, roc_auc: 0.8656 }
    },
    LAD: {
      target_name: 'LAD',
      selected_algorithm: 'Random Forest',
      cv_roc_auc: '0.850 ± 0.050',
      holdout_metrics: { accuracy: 0.6393, precision: 0.6500, recall: 0.7647, f1: 0.7027, roc_auc: 0.7669 }
    },
    LCX: {
      target_name: 'LCX',
      selected_algorithm: 'XGBoost',
      cv_roc_auc: '0.752 ± 0.027',
      holdout_metrics: { accuracy: 0.6557, precision: 0.6190, recall: 0.5000, f1: 0.5532, roc_auc: 0.6857 }
    },
    RCA: {
      target_name: 'RCA',
      selected_algorithm: 'XGBoost',
      cv_roc_auc: '0.714 ± 0.038',
      holdout_metrics: { accuracy: 0.6721, precision: 0.5000, recall: 0.6000, f1: 0.5455, roc_auc: 0.7024 }
    }
  };

  const prevalenceData = modelCardData?.class_distribution?.prevalence || {
    CAD: { positive: 216, total: 303, pct: '71.3%', formatted: '216/303 = 71.3%' },
    LAD: { positive: 177, total: 303, pct: '58.4%', formatted: '177/303 = 58.4%' },
    LCX: { positive: 119, total: 303, pct: '39.3%', formatted: '119/303 = 39.3%' },
    RCA: { positive: 114, total: 303, pct: '37.6%', formatted: '114/303 = 37.6%' }
  };

  const sectionsNav = [
    { id: 'all', label: 'Complete Card' },
    { id: 'purpose', label: '1. Purpose' },
    { id: 'dataset', label: '2. Dataset & Targets' },
    { id: 'leakage', label: '3. Leakage Control' },
    { id: 'models', label: '4. Models & CV' },
    { id: 'performance', label: '5. Performance' },
    { id: 'explainability', label: '6. TreeSHAP & 3D' },
    { id: 'limitations', label: '7. Limitations & Status' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="hospital-card p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                OFFICIAL SYSTEM SPECIFICATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              CardioVision AI — Model Card
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
              Research &amp; Educational AI-Assisted Cardiovascular Decision-Support Prototype
            </p>
          </div>

          <div className="shrink-0 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left md:text-right">
            <span className="block text-[10px] font-mono text-slate-600 uppercase font-medium">Ground Truth Standard</span>
            <span className="text-xs font-bold font-mono text-[#0F766E]">Catheterization Angiography</span>
            <span className="block text-[10px] text-slate-700 mt-0.5">≥50% Luminal Stenosis</span>
          </div>
        </div>

        {/* Compact Summary Strip */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold">
              Executive Technical Summary
            </span>
            <span className="text-[11px] text-slate-600 font-medium">
              Zero synthetic features • Zero target contamination
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="block text-[10px] font-mono text-slate-600 font-medium">Cohort Size</span>
              <span className="text-base font-extrabold font-mono text-slate-900">N = {summary.n_records}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-center">
              <span className="block text-[10px] font-mono text-sky-700 font-medium">Raw Inputs</span>
              <span className="text-base font-extrabold font-mono text-sky-900">{summary.raw_clinical_inputs} clinical</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
              <span className="block text-[10px] font-mono text-indigo-700 font-medium">Model Features</span>
              <span className="text-base font-extrabold font-mono text-indigo-900">{summary.transformed_features} (0 eng)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-center">
              <span className="block text-[10px] font-mono text-[#BE123C] font-medium">Targets</span>
              <span className="text-base font-extrabold font-mono text-[#BE123C]">{summary.prediction_targets} targets</span>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-center">
              <span className="block text-[10px] font-mono text-[#0F766E] font-medium">CV Strategy</span>
              <span className="text-base font-extrabold font-mono text-[#0F766E]">5-Fold Strat</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-center">
              <span className="block text-[10px] font-mono text-[#B45309] font-medium">Test Partition</span>
              <span className="text-base font-extrabold font-mono text-[#B45309]">20% Holdout</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] text-center col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-mono text-[#BE123C] font-medium">Ext. Validation</span>
              <span className="text-base font-extrabold font-mono text-[#BE123C]">None (Internal)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {sectionsNav.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === s.id
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: MODEL PURPOSE */}
      {(activeTab === 'all' || activeTab === 'purpose') && (
        <div className="hospital-card p-6 border-l-4 border-l-sky-500 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                1. Model Purpose
              </h2>
              <p className="text-xs text-slate-700">
                Official classification, system objectives, and anatomical scope boundaries.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
            <span className="text-[11px] font-mono uppercase text-sky-800 font-bold block mb-1">
              Official Designation
            </span>
            <p className="text-sm font-semibold text-sky-950">
              "Research &amp; Educational AI-Assisted Cardiovascular Decision-Support Prototype"
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
              System Objectives:
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
              <li className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Estimate overall CAD probability from clinical inputs.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Estimate LAD stenosis probability.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Estimate LCX stenosis probability.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Estimate RCA stenosis probability.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Provide model-level explanations using TreeSHAP.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Map vessel-level prediction probabilities to corresponding coronary anatomy in the 3D visualization.</span>
              </li>
            </ul>
          </div>

          {/* Explicit Anatomical Boundary Alert */}
          <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] text-[#92400E] text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#B45309]">
              <AlertTriangle className="w-4 h-4" />
              <span>Explicit Scope &amp; Anatomical Boundaries</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[#92400E]">
              <li>The system does NOT directly observe plaque.</li>
              <li>The system does NOT determine exact plaque coordinates.</li>
              <li>The 3D visualization represents vessel-level model predictions mapped to anatomical vessels.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 2 & 3: DATASET & TARGET DEFINITIONS */}
      {(activeTab === 'all' || activeTab === 'dataset') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 2. DATASET */}
          <div className="hospital-card p-6 border-l-4 border-l-indigo-500 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2. Dataset
                </h2>
                <p className="text-xs text-slate-700">
                  Verified dataset specifications and mathematical feature count reconciliation.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Dataset Identifier</span>
                <span className="font-mono font-bold text-slate-900">UCI Extension of Z-Alizadeh Sani Dataset</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Cohort Sample Size</span>
                <span className="font-mono font-bold text-slate-900">N = 303 patient records</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Raw CSV Columns</span>
                <span className="font-mono font-bold text-slate-900">59 raw columns</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Angiographic Target Columns</span>
                <span className="font-mono font-bold text-[#BE123C]">4 columns: LAD, LCX, RCA, Cath</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Candidate Clinical Inputs</span>
                <span className="font-mono font-bold text-[#1D4ED8]">55 input columns</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Transformed Model Features</span>
                <span className="font-mono font-bold text-indigo-700">60 transformed features</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Engineered Features</span>
                <span className="font-mono font-bold text-[#0F766E]">0 engineered features</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-mono block mb-1">
                Mathematical Reconciliation (59 → 55 → 60):
              </strong>
              The raw CSV contains 59 columns. Catheterization targets LAD, LCX, RCA, and Cath account for 4 columns, leaving exactly 55 candidate clinical input features (CAD is a clinical target synonym for Cath == 'CAD', not a 5th CSV column). After ColumnTransformer, the 53 numeric/binary features remain 53 standardized columns, while the 2 categorical features (BBB with 3 levels, VHD with 4 levels) expand via one-hot encoding into 7 binary indicator columns (53 + 7 = 60 transformed features). Zero features are engineered or derived from post-catheterization outcomes.
            </div>
          </div>

          {/* 3. TARGET DEFINITIONS */}
          <div className="hospital-card p-6 border-l-4 border-l-purple-500 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  3. Target Definitions
                </h2>
                <p className="text-xs text-slate-700">
                  Four angiographic prediction targets strictly distinguished from model inputs.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-[#BE123C]">CAD Target</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FFF1F2] text-[#BE123C] border border-[#FFE4E6] font-bold">
                    Primary Disease Target
                  </span>
                </div>
                <p className="text-slate-700">
                  <strong>Derived from Cath == "CAD"</strong>: Diameter stenosis ≥ 50% in at least one major coronary artery by invasive catheterization.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-purple-700">LAD Target</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                    Vessel Target
                  </span>
                </div>
                <p className="text-slate-700">
                  <strong>Angiographically confirmed ≥50% luminal narrowing</strong> in the Left Anterior Descending coronary artery.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-[#0F766E]">LCX Target</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1] font-bold">
                    Vessel Target
                  </span>
                </div>
                <p className="text-slate-700">
                  <strong>Angiographically confirmed ≥50% luminal narrowing</strong> in the Left Circumflex coronary artery.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-[#B45309]">RCA Target</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7] font-bold">
                    Vessel Target
                  </span>
                </div>
                <p className="text-slate-700">
                  <strong>Angiographically confirmed ≥50% luminal narrowing</strong> in the Right Coronary artery.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950">
              <strong>Input vs Target Isolation: </strong>
              All four prediction targets represent post-procedure invasive catheterization findings. They are strictly segregated and excluded from candidate model inputs.
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4 & 5: TARGET LEAKAGE CONTROL & FEATURE PROCESSING */}
      {(activeTab === 'all' || activeTab === 'leakage') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 4. TARGET LEAKAGE CONTROL */}
          <div className="hospital-card p-6 border-l-4 border-l-emerald-500 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  4. Target Leakage Control
                </h2>
                <p className="text-xs text-slate-700">
                  Audited exclusion and programmatic runtime boundary enforcement.
                </p>
              </div>
            </div>

            {/* Exact Required Leakage Audit Statement */}
            <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1]">
              <span className="text-[10px] font-mono uppercase text-[#0F766E] font-bold block mb-1">
                Mandatory Leakage Statement
              </span>
              <p className="text-xs font-bold text-[#0F766E] leading-snug">
                "Target leakage audit: LAD, LCX, RCA, Cath, and CAD are excluded from model inputs. Feature construction was audited for direct and indirect target leakage."
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-700">
                LAD, LCX, RCA, and Cath are removed before model input construction. CAD is derived from Cath and is also excluded from X.
              </p>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1.5">
                  Runtime Assertion Checks:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  Runtime assertions verify target columns do not enter:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2 font-mono text-[11px]">
                  <span className="px-2 py-1 rounded bg-slate-200 text-slate-800 text-center font-semibold">X</span>
                  <span className="px-2 py-1 rounded bg-slate-200 text-slate-800 text-center font-semibold">X_train</span>
                  <span className="px-2 py-1 rounded bg-slate-200 text-slate-800 text-center font-semibold">X_test</span>
                  <span className="px-2 py-1 rounded bg-slate-200 text-slate-800 text-center font-semibold">numeric cols</span>
                  <span className="px-2 py-1 rounded bg-slate-200 text-slate-800 text-center font-semibold">categorical cols</span>
                  <span className="px-2 py-1 rounded bg-slate-200 text-slate-800 text-center font-semibold">transformed names</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. FEATURE PROCESSING */}
          <div className="hospital-card p-6 border-l-4 border-l-blue-500 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  5. Feature Processing
                </h2>
                <p className="text-xs text-slate-700">
                  Strict scikit-learn ColumnTransformer specifications.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="text-slate-900">Numeric/Binary Features (53 features)</span>
                  <span className="text-[#1D4ED8]">Standardized</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  <li><strong>Imputation:</strong> median imputation (<code className="font-mono text-[10px]">SimpleImputer(strategy='median')</code>)</li>
                  <li><strong>Scaling:</strong> StandardScaler (<code className="font-mono text-[10px]">StandardScaler()</code>)</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="text-slate-900">Categorical Features (2 features: BBB, VHD)</span>
                  <span className="text-indigo-700">One-Hot Encoded</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  <li><strong>Input Variables:</strong> BBB (Bundle Branch Block), VHD (Valvular Heart Disease)</li>
                  <li><strong>Imputation:</strong> most-frequent imputation (<code className="font-mono text-[10px]">SimpleImputer(strategy='most_frequent')</code>)</li>
                  <li><strong>Encoding:</strong> OneHotEncoder(handle_unknown='ignore') (expands to 7 binary columns)</li>
                </ul>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 font-mono">
                <span className="text-blue-900 font-bold">Final Transformed Dimensionality:</span>
                <span className="text-blue-900 font-extrabold text-sm">60 features</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F766E] font-bold text-center">
                There are 0 engineered features.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6 & 7: MODEL ARCHITECTURE & VALIDATION METHODOLOGY */}
      {(activeTab === 'all' || activeTab === 'models') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 6. MODEL ARCHITECTURE */}
          <div className="hospital-card p-6 border-l-4 border-l-cyan-500 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  6. Model Architecture
                </h2>
                <p className="text-xs text-slate-700">
                  Ensemble algorithms and objective selection criterion.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 font-mono">RandomForestClassifier</span>
                <p className="text-slate-700">
                  180 estimators, max_depth=6, min_samples_split=4, class_weight='balanced', random_state=42.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 font-mono">XGBClassifier</span>
                <p className="text-slate-700">
                  120 estimators, max_depth=4, learning_rate=0.04, subsample=0.85, dynamic scale_pos_weight based on training class distribution.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 space-y-2">
                <span className="text-[11px] font-mono uppercase text-cyan-900 font-bold block">
                  Final Selected Algorithm Per Target (Training CV):
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-600 block text-[10px]">CAD Target</span>
                    <span className="font-bold text-slate-900">Random Forest</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-600 block text-[10px]">LAD Target</span>
                    <span className="font-bold text-slate-900">Random Forest</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-600 block text-[10px]">LCX Target</span>
                    <span className="font-bold text-slate-900">XGBoost</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-600 block text-[10px]">RCA Target</span>
                    <span className="font-bold text-slate-900">XGBoost</span>
                  </div>
                </div>
                <p className="text-[11px] text-cyan-950 pt-1 font-medium">
                  <strong>Selection criterion:</strong> Highest mean 5-fold training ROC-AUC. The holdout test set was not used for algorithm selection.
                </p>
              </div>
            </div>
          </div>

          {/* 7. VALIDATION METHODOLOGY */}
          <div className="hospital-card p-6 border-l-4 border-l-teal-500 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  7. Validation Methodology
                </h2>
                <p className="text-xs text-slate-700">
                  Fold encapsulation and strict holdout partition isolation.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 block text-[10px] font-mono font-medium">Split Scheme</span>
                  <span className="font-bold text-slate-900">Stratified 80/20 Holdout</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 block text-[10px] font-mono font-medium">Random State</span>
                  <span className="font-bold font-mono text-slate-900">Seed = 42</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 block text-[10px] font-mono font-medium">Training Partition</span>
                  <span className="font-bold font-mono text-slate-900">Train = 242 (80%)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 block text-[10px] font-mono font-medium">Test Partition</span>
                  <span className="font-bold font-mono text-slate-900">Test = 61 (20%)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 font-mono">
                  5-Fold Cross-Validation:
                </span>
                <p className="text-slate-700">
                  5-fold StratifiedKFold (shuffle=True, random_state=42) executed strictly on the training partition.
                </p>
                <p className="text-slate-700 text-[11px] pt-1">
                  Preprocessing is encapsulated inside the Pipeline and therefore fitted independently within each CV training fold.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1]">
                <span className="text-[10px] font-mono uppercase text-[#0F766E] font-bold block mb-1">
                  Strict Isolation Guarantee
                </span>
                <p className="text-xs font-bold text-[#0F766E] leading-snug">
                  "The held-out test set was not used for preprocessing fitting, model training, feature selection, threshold selection, or algorithm selection."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8 & 9: PERFORMANCE & CLASS DISTRIBUTION */}
      {(activeTab === 'all' || activeTab === 'performance') && (
        <div className="space-y-6">
          {/* 8. PERFORMANCE */}
          <div className="hospital-card p-6 border-l-4 border-l-rose-500 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    8. Performance Benchmarks
                  </h2>
                  <p className="text-xs text-slate-700">
                    Dual display clearly distinguishing 5-fold training CV from untouched holdout test-set performance.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Target</th>
                    <th className="py-3 px-3">Selected Model</th>
                    <th className="py-3 px-3 text-purple-700 bg-purple-50">
                      5-fold training cross-validation ROC-AUC
                    </th>
                    <th className="py-3 px-3 text-[#1D4ED8] bg-sky-50">
                      Untouched holdout test-set Accuracy
                    </th>
                    <th className="py-3 px-3 text-[#1D4ED8] bg-sky-50">
                      Untouched holdout test-set Precision
                    </th>
                    <th className="py-3 px-3 text-[#1D4ED8] bg-sky-50">
                      Untouched holdout test-set Recall
                    </th>
                    <th className="py-3 px-3 text-[#1D4ED8] bg-sky-50">
                      Untouched holdout test-set F1
                    </th>
                    <th className="py-3 px-3 text-[#1D4ED8] bg-sky-50 font-bold">
                      Untouched holdout test-set ROC-AUC
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {Object.entries(performanceTargets).map(([key, data]) => {
                    const m = data.holdout_metrics || {};
                    return (
                      <tr key={key} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {data.target_name || key}
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-800 font-medium">
                            {data.selected_algorithm}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-purple-700 bg-purple-50/40">
                          {data.cv_roc_auc}
                        </td>
                        <td className="py-3 px-3 bg-sky-50/40 font-bold text-slate-900">
                          {(m.accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 bg-sky-50/40 text-slate-900">
                          {(m.precision * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 bg-sky-50/40 text-slate-900">
                          {(m.recall * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 bg-sky-50/40 text-slate-900">
                          {(m.f1 * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 bg-sky-50/40 font-extrabold text-[#1D4ED8]">
                          {m.roc_auc.toFixed(3)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-950">
                <strong className="block mb-0.5 font-bold">Label: 5-fold training cross-validation ROC-AUC</strong>
                Calculated strictly across training folds (N = 242) during algorithm selection.
              </div>
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-950">
                <strong className="block mb-0.5 font-bold">Label: Untouched holdout test-set performance</strong>
                Evaluated once on unseen test partition (N = 61) at decision threshold p ≥ 0.50.
              </div>
            </div>
          </div>

          {/* 9. CLASS DISTRIBUTION */}
          <div className="hospital-card p-6 border-l-4 border-l-amber-500 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  9. Class Distribution &amp; Imbalance Mitigation
                </h2>
                <p className="text-xs text-slate-700">
                  Verified dataset prevalence and algorithmic compensation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-mono text-slate-600 block font-medium">CAD Prevalence</span>
                <span className="text-base font-bold font-mono text-[#BE123C] mt-1 block">
                  {prevalenceData.CAD?.formatted || '216/303 = 71.3%'}
                </span>
                <span className="text-[10px] text-slate-600 font-medium">216 Pos / 87 Neg</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-mono text-slate-600 block font-medium">LAD Prevalence</span>
                <span className="text-base font-bold font-mono text-purple-700 mt-1 block">
                  {prevalenceData.LAD?.formatted || '177/303 = 58.4%'}
                </span>
                <span className="text-[10px] text-slate-600 font-medium">177 Pos / 126 Neg</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-mono text-slate-600 block font-medium">LCX Prevalence</span>
                <span className="text-base font-bold font-mono text-[#0F766E] mt-1 block">
                  {prevalenceData.LCX?.formatted || '119/303 = 39.3%'}
                </span>
                <span className="text-[10px] text-slate-600 font-medium">119 Pos / 184 Neg</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-mono text-slate-600 block font-medium">RCA Prevalence</span>
                <span className="text-base font-bold font-mono text-[#B45309] mt-1 block">
                  {prevalenceData.RCA?.formatted || '114/303 = 37.6%'}
                </span>
                <span className="text-[10px] text-slate-600 font-medium">114 Pos / 189 Neg</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-900 block">
                Class Imbalance Resolution:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                <li><strong>Random Forest:</strong> Addressed using <code className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-bold">class_weight='balanced'</code> to adjust weights inversely proportional to class frequencies.</li>
                <li><strong>XGBoost:</strong> Addressed using dynamic <code className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 font-bold">scale_pos_weight</code> calculated from the training class distribution (<code className="font-mono text-[10px]">neg_count / pos_count</code>).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 10 & 11: EXPLAINABILITY & 3D MAPPING */}
      {(activeTab === 'all' || activeTab === 'explainability') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 10. EXPLAINABILITY */}
          <div className="hospital-card p-6 border-l-4 border-l-violet-500 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  10. Explainability (TreeSHAP)
                </h2>
                <p className="text-xs text-slate-700">
                  Game-theoretic feature attributions and causal governance boundaries.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 space-y-2 text-xs">
              <span className="text-[10px] font-mono uppercase text-violet-800 font-bold block">
                Official TreeSHAP Definition
              </span>
              <p className="font-bold text-violet-950 text-sm">
                "SHAP values describe the contribution of input features to the model's prediction for a given patient."
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] text-xs space-y-1.5 text-[#92400E]">
              <div className="flex items-center gap-2 font-bold text-[#B45309]">
                <AlertTriangle className="w-4 h-4" />
                <span>Explicit Causality Boundary</span>
              </div>
              <p className="font-bold text-sm">
                "SHAP contribution is not clinical causation."
              </p>
              <p className="text-[11px] text-[#92400E]">
                Prohibited language rules strictly enforced: SHAP values describe internal model feature weightings. They do NOT establish that a feature caused, proves, is biologically responsible for, or determines disease.
              </p>
            </div>
          </div>

          {/* 11. 3D MAPPING */}
          <div className="hospital-card p-6 border-l-4 border-l-rose-500 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-[#BE123C] shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  11. 3D Anatomical Mapping
                </h2>
                <p className="text-xs text-slate-700">
                  Vessel-level territory visualization methodology and imaging limits.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-mono font-bold text-slate-900 block text-[11px] uppercase">
                Mapping Flow:
              </span>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center font-mono font-semibold text-slate-900">
                Patient inputs → model probability → target vessel → anatomical 3D visualization
              </div>
              <ul className="space-y-1 text-slate-700 pl-1 font-mono text-[11px]">
                <li>• LAD probability → LAD anatomical vessel</li>
                <li>• LCX probability → LCX anatomical vessel</li>
                <li>• RCA probability → RCA anatomical vessel</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] text-[#BE123C] text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#BE123C] font-bold block">
                Visual Boundary Statement
              </span>
              <p className="font-bold leading-snug">
                "This mapping does not represent measured plaque location, lesion coordinates, or direct anatomical imaging."
              </p>
              <p className="text-[11px] text-[#BE123C]">
                Coronary mesh territories visually communicate probability tiers, not intravascular imaging coordinates or direct plaque measurements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 12 & 13: LIMITATIONS & CLINICAL STATUS */}
      {(activeTab === 'all' || activeTab === 'limitations') && (
        <div className="space-y-6">
          {/* 12. LIMITATIONS */}
          <div className="hospital-card p-6 border-l-4 border-l-amber-500 bg-amber-50/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-[#B45309] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  12. System Limitations &amp; Governance
                </h2>
                <p className="text-xs text-slate-700">
                  Critical operational boundaries required for scientific integrity and ethical safety.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: 'Cohort Constraints', items: ['Dataset size is 303 patients.', 'Evaluation is internal to the supplied dataset.', 'No external validation has been performed.'] },
                { title: 'Generalization & Accuracy', items: ['Generalization to other populations, institutions, devices, or clinical workflows is not established.', 'Vessel-level performance is lower than overall CAD performance for some targets.', 'Model probabilities are estimates, not direct anatomical measurements.'] },
                { title: 'Scope & Clinical Limits', items: ['3D mapping is vessel-level visualization, not plaque localization.', 'SHAP explains model behavior, not biological causation.', 'The system has not been validated for diagnosis or treatment decisions.'] }
              ].map((grp, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#B45309] block">
                    {grp.title}
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {grp.items.map((it, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 13. CLINICAL STATUS */}
          <div className="hospital-card p-6 border-l-4 border-l-slate-600 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  13. Clinical Status &amp; Persistent Disclaimer
                </h2>
                <p className="text-xs text-slate-700">
                  Regulatory clearance standing and operational use classification.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600 block text-[10px] font-mono uppercase mb-0.5 font-medium">Classification</span>
              <span className="text-sm font-bold text-slate-900">
                "Research &amp; Educational Decision-Support Prototype"
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] text-xs space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#B45309] font-bold block">
                Persistent Mandatory Clinical Disclaimer
              </span>
              <p className="text-[#92400E] font-medium leading-relaxed">
                "Model outputs are estimates for demonstration purposes only and are not medical diagnoses or substitutes for professional evaluation or formal diagnostic imaging."
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
