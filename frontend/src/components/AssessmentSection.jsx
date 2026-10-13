import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers
} from 'lucide-react';

export const DEMO_SCENARIOS = {
  scenario1: {
    id: 'scenario1',
    label: 'Anterior Risk Profile',
    fullTitle: 'Anterior Ischemic Risk (Elevated LAD Association)',
    badge: 'Anterior Risk Profile',
    badgeClass: 'bg-[#FFF1F2] text-[#BE123C] border-[#FFE4E6]',
    description: 'Patient presentation featuring ST elevation in anterior leads, wall motion abnormality in anterior/septal wall, and elevated biomarkers.',
    data: {
      age: 63, sex: 1, bmi: 27.1,
      smoking: 1, diabetes: 1, hypertension: 1, family_history: 1,
      systolic_bp: 154, diastolic_bp: 94, heart_rate: 86,
      total_cholesterol: 245, ldl: 165, hdl: 34, triglycerides: 230, fasting_blood_sugar: 152,
      troponin_i: 0.18, ck_mb: 14.5,
      st_elevation: 1, t_inversion: 1, lvh: 1,
      ejection_fraction: 40.0, region_rwma: 'Anterior'
    }
  },
  scenario2: {
    id: 'scenario2',
    label: 'Multi-Vessel Risk Profile',
    fullTitle: 'Multi-Vessel Metabolic CAD Profile',
    badge: 'Multi-Vessel Risk Profile',
    badgeClass: 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]',
    description: 'Elderly patient with longstanding diabetes, dyslipidemia, peripheral vascular disease indicators, and lateral wall hypokinesis.',
    data: {
      age: 71, sex: 0, bmi: 29.6,
      smoking: 0, diabetes: 1, hypertension: 1, family_history: 1,
      systolic_bp: 168, diastolic_bp: 92, heart_rate: 78,
      total_cholesterol: 255, ldl: 172, hdl: 36, triglycerides: 295, fasting_blood_sugar: 188,
      troponin_i: 0.05, ck_mb: 4.8,
      st_elevation: 0, t_inversion: 1, lvh: 1,
      ejection_fraction: 36.0, region_rwma: 'Lateral'
    }
  },
  scenario3: {
    id: 'scenario3',
    label: 'Inferior Risk Profile',
    fullTitle: 'Inferior Territory Ischemia (Elevated RCA Association)',
    badge: 'Inferior Risk Profile',
    badgeClass: 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]',
    description: 'Patient presenting with substernal chest discomfort, inferior lead ST changes, sinus bradycardia, and inferior wall motion abnormality.',
    data: {
      age: 56, sex: 1, bmi: 28.4,
      smoking: 1, diabetes: 0, hypertension: 1, family_history: 1,
      systolic_bp: 138, diastolic_bp: 86, heart_rate: 58,
      total_cholesterol: 232, ldl: 148, hdl: 41, triglycerides: 260, fasting_blood_sugar: 104,
      troponin_i: 0.09, ck_mb: 6.2,
      st_elevation: 1, t_inversion: 1, lvh: 0,
      ejection_fraction: 52.0, region_rwma: 'Inferior'
    }
  },
  scenario4: {
    id: 'scenario4',
    label: 'Low-Risk Baseline',
    fullTitle: 'Low-Risk Screening Baseline',
    badge: 'Low-Risk Baseline',
    badgeClass: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    description: 'Asymptomatic individual with normal blood pressure, optimal lipid fractions, normal resting ECG, and preserved ejection fraction.',
    data: {
      age: 41, sex: 0, bmi: 22.4,
      smoking: 0, diabetes: 0, hypertension: 0, family_history: 0,
      systolic_bp: 116, diastolic_bp: 74, heart_rate: 66,
      total_cholesterol: 170, ldl: 88, hdl: 58, triglycerides: 110, fasting_blood_sugar: 88,
      troponin_i: 0.01, ck_mb: 1.2,
      st_elevation: 0, t_inversion: 0, lvh: 0,
      ejection_fraction: 64.0, region_rwma: 'None'
    }
  }
};

const DEFAULT_BLANK_PATIENT = {
  age: 55, sex: 1, bmi: 25.0,
  smoking: 0, diabetes: 0, hypertension: 0, family_history: 0,
  systolic_bp: 120, diastolic_bp: 80, heart_rate: 72,
  total_cholesterol: 190, ldl: 110, hdl: 45, triglycerides: 140, fasting_blood_sugar: 95,
  troponin_i: 0.02, ck_mb: 2.0,
  st_elevation: 0, t_inversion: 0, lvh: 0,
  ejection_fraction: 55.0, region_rwma: 'None'
};

export default function AssessmentSection({
  patientData,
  onChange,
  onReset,
  onRunAssessment,
  isAnalyzing
}) {
  const [activeTab, setActiveTab] = useState('demographics');
  const [activeScenario, setActiveScenario] = useState('scenario1');

  const handleSelectScenario = (key) => {
    setActiveScenario(key);
    const scenario = DEMO_SCENARIOS[key];
    if (scenario) {
      Object.entries(scenario.data).forEach(([field, val]) => {
        onChange(field, val);
      });
      if (onRunAssessment) {
        onRunAssessment(scenario.data, 'analysis');
      }
    }
  };

  const handleResetToDefault = () => {
    setActiveScenario('custom');
    onReset(DEFAULT_BLANK_PATIENT);
  };

  const tabs = [
    { id: 'demographics', label: '1. Demographics' },
    { id: 'vitals', label: '2. Vitals' },
    { id: 'history', label: '3. Medical History' },
    { id: 'symptoms', label: '4. Symptoms & Exam' },
    { id: 'ecg', label: '5. ECG' },
    { id: 'laboratory', label: '6. Laboratory' },
    { id: 'echo', label: '7. Echocardiography' }
  ];

  const inputClass = "w-full h-10 px-3.5 rounded-lg border border-slate-300 bg-white focus:bg-white text-sm text-slate-800 placeholder-slate-400 focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 outline-none transition-all";

  // Reusable Documentation-Only badge component with mandatory tooltip
  const DocOnlyBadge = () => (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7] cursor-help"
      title="Documentation-only field; does not alter model predictions."
    >
      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
      <span>Documentation-only field; does not alter model predictions.</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Card with Demonstration Profiles */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                PATIENT ASSESSMENT
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Clinical Biomarkers &amp; Examination
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Features correspond to the UCI Z-Alizadeh Sani extension cohort. Select an educational archetype or customize inputs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleResetToDefault}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Values</span>
            </button>
            <button
              onClick={() => onRunAssessment && onRunAssessment(patientData, 'analysis')}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAnalyzing ? 'Evaluating...' : 'Run AI Assessment'}</span>
            </button>
          </div>
        </div>

        {/* 4 Demonstration Profiles: Clean Selectable Segmented Cards */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Demonstration Profiles
            </span>
            <span className="text-[11px] text-slate-600">
              Click an archetype to auto-populate validated clinical parameters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(DEMO_SCENARIOS).map(([key, sc]) => {
              const isSelected = activeScenario === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectScenario(key)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFF1F2]/60 border-[#E11D48] shadow-sm ring-1 ring-[#E11D48]/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${sc.badgeClass}`}>
                      {sc.badge}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#E11D48]" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {sc.label}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-snug">
                    {sc.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Form Tabs & Field Inputs */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        {/* Transparent Feature Provenance Disclosure Callout */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Feature Provenance Architecture</span>
            </span>
            <span className="text-[10px] font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              18 Measured • 3 Derived • 5 Heuristics • 29 Reference Baselines
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            The underlying model evaluates 55 clinical variables from the UCI Z-Alizadeh Sani extension cohort. Fields collected across the tabs below supply 18 direct inputs and derive 3 physiological metrics. Uncollected laboratory parameters (e.g. Platelets, Creatinine, ESR) default to population reference baselines in the inference pipeline. Fields marked <span className="font-semibold text-amber-700">Documentation-only</span> provide clinical context but are not model predictors.
          </p>
        </div>

        {/* Category Tabs: Streamlined row */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 pb-2 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FFF1F2] text-[#BE123C] font-semibold border border-[#FFE4E6] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents: Clean 2-column or 3-column grids, no excessive box wrappers */}
        <div>
          {/* TAB 1: DEMOGRAPHICS */}
          {activeTab === 'demographics' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-900">
                  Age (years)
                </label>
                <div className="text-[11px] text-slate-600">Valid range: 18 - 95 • Ref: 20-80</div>
                <input
                  type="number"
                  min="18"
                  max="95"
                  value={patientData.age}
                  onChange={(e) => onChange('age', Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-900">
                  Biological Sex
                </label>
                <div className="text-[11px] text-slate-600">Feature: Sex (0: Female, 1: Male)</div>
                <select
                  value={patientData.sex}
                  onChange={(e) => onChange('sex', Number(e.target.value))}
                  className={inputClass}
                >
                  <option value={1}>Male (1)</option>
                  <option value={0}>Female (0)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-900">
                  Body Mass Index (BMI kg/m²)
                </label>
                <div className="text-[11px] text-slate-600">Range: 15.0 - 55.0 • Ref: 18.5-24.9</div>
                <input
                  type="number"
                  step="0.1"
                  min="15"
                  max="55"
                  value={patientData.bmi}
                  onChange={(e) => onChange('bmi', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* TAB 2: VITALS */}
          {activeTab === 'vitals' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-900">
                    Systolic Blood Pressure (mmHg)
                  </label>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                    Primary Model Input
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">Range: 80 - 220 • Main hemodynamic predictor</div>
                <input
                  type="number"
                  min="80"
                  max="220"
                  value={patientData.systolic_bp}
                  onChange={(e) => onChange('systolic_bp', Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-900">
                    Diastolic Blood Pressure (mmHg)
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <DocOnlyBadge />
                  <div className="text-[11px] text-slate-600">Range: 40 - 130 • Documented for clinical completeness</div>
                </div>
                <input
                  type="number"
                  min="40"
                  max="130"
                  value={patientData.diastolic_bp}
                  onChange={(e) => onChange('diastolic_bp', Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-900">
                  Resting Heart Rate (PR / bpm)
                </label>
                <div className="text-[11px] text-slate-600">Range: 40 - 160 • Normal: 60 - 100 bpm</div>
                <input
                  type="number"
                  min="40"
                  max="160"
                  value={patientData.heart_rate}
                  onChange={(e) => onChange('heart_rate', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* TAB 3: MEDICAL HISTORY */}
          {activeTab === 'history' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { field: 'hypertension', label: 'Hypertension (HTN)', desc: 'Documented arterial hypertension requiring medication' },
                { field: 'diabetes', label: 'Diabetes Mellitus (DM)', desc: 'Documented Type 1 or Type 2 diabetes diagnosis' },
                { field: 'smoking', label: 'Current Smoker', desc: 'Active tobacco use or within the past 12 months' },
                { field: 'family_history', label: 'Family History (FH)', desc: 'Premature coronary disease in first-degree relative' },
              ].map(({ field, label, desc }) => (
                <div
                  key={field}
                  onClick={() => onChange(field, patientData[field] ? 0 : 1)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none space-y-2 ${
                    patientData[field]
                      ? 'bg-[#FFF1F2]/60 border-[#E11D48]/40 ring-1 ring-[#E11D48]/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(patientData[field])}
                      onChange={(e) => onChange(field, e.target.checked ? 1 : 0)}
                      className="w-4 h-4 accent-[#E11D48] rounded cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SYMPTOMS & CLINICAL EXAM */}
          {activeTab === 'symptoms' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-900">Chest Discomfort Character</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Classification per Diamond-Forrester anginal criteria</p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 cursor-pointer hover:bg-slate-100/70">
                    <input
                      type="radio"
                      name="cp_type"
                      checked={patientData.age >= 50 && patientData.st_elevation === 1}
                      onChange={() => {}}
                      className="accent-[#E11D48]"
                    />
                    <span>Typical Angina (Substernal, exertional, relieved by rest/nitroglycerin)</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 cursor-pointer hover:bg-slate-100/70">
                    <input
                      type="radio"
                      name="cp_type"
                      checked={!(patientData.age >= 50 && patientData.st_elevation === 1)}
                      onChange={() => {}}
                      className="accent-[#E11D48]"
                    />
                    <span>Atypical or Non-Anginal Presentation</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-900">Physical Exam Correlates</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Signs of systemic vascular burden or peripheral perfusion deficit</p>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Peripheral Pulses:</span>
                    <span className="font-semibold text-slate-900">{patientData.diabetes ? 'Diminished' : 'Normal / Intact'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-600">Pulmonary Auscultation:</span>
                    <span className="font-semibold text-slate-900">{patientData.ejection_fraction < 40 ? 'Basilar Rales' : 'Clear'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ECG */}
          {activeTab === 'ecg' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { field: 'st_elevation', label: 'ST Elevation', desc: '≥ 1mm elevation in contiguous leads (V1-V4 for LAD; II, III, aVF for RCA)' },
                { field: 't_inversion', label: 'T-Wave Inversion', desc: 'Symmetric T-wave inversion ≥ 1mm in anatomical coronary lead group' },
                { field: 'lvh', label: 'Left Ventricular Hypertrophy', desc: 'Sokolow-Lyon or Cornell voltage criteria on 12-lead ECG' },
              ].map(({ field, label, desc }) => (
                <div
                  key={field}
                  onClick={() => onChange(field, patientData[field] ? 0 : 1)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none space-y-2 ${
                    patientData[field]
                      ? 'bg-[#FFF1F2]/60 border-[#E11D48]/40 ring-1 ring-[#E11D48]/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(patientData[field])}
                      onChange={(e) => onChange(field, e.target.checked ? 1 : 0)}
                      className="w-4 h-4 accent-[#E11D48] rounded cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: LABORATORY */}
          {activeTab === 'laboratory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-900">
                    Total Cholesterol (mg/dL)
                  </label>
                  <div className="text-[11px] text-slate-600">Range: 90 - 450 • Ref: &lt; 200</div>
                  <input
                    type="number"
                    value={patientData.total_cholesterol}
                    onChange={(e) => onChange('total_cholesterol', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-900">
                    LDL Cholesterol (mg/dL)
                  </label>
                  <div className="text-[11px] text-slate-600">Range: 30 - 300 • Ref: &lt; 100</div>
                  <input
                    type="number"
                    value={patientData.ldl}
                    onChange={(e) => onChange('ldl', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-900">
                    HDL Cholesterol (mg/dL)
                  </label>
                  <div className="text-[11px] text-slate-600">Range: 15 - 120 • Ref: &gt; 40</div>
                  <input
                    type="number"
                    value={patientData.hdl}
                    onChange={(e) => onChange('hdl', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-900">
                    Triglycerides (mg/dL)
                  </label>
                  <div className="text-[11px] text-slate-600">Range: 40 - 650 • Ref: &lt; 150</div>
                  <input
                    type="number"
                    value={patientData.triglycerides}
                    onChange={(e) => onChange('triglycerides', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-900">
                    Fasting Blood Sugar (FBS mg/dL)
                  </label>
                  <div className="text-[11px] text-slate-600">Range: 60 - 400 • Ref: 70 - 99</div>
                  <input
                    type="number"
                    value={patientData.fasting_blood_sugar}
                    onChange={(e) => onChange('fasting_blood_sugar', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Documentation-Only Cardiac Biomarkers with explicit warning badge and tooltip */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Acute Cardiac Biomarkers (Chart Documentation)
                  </span>
                  <DocOnlyBadge />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-900">
                        Cardiac Troponin I (cTnI ng/mL)
                      </label>
                    </div>
                    <DocOnlyBadge />
                    <div className="text-[11px] text-slate-600">Range: 0.0 - 15.0 • Ref: &lt; 0.04</div>
                    <input
                      type="number"
                      step="0.01"
                      value={patientData.troponin_i}
                      onChange={(e) => onChange('troponin_i', Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-900">
                        Creatine Kinase-MB (CK-MB ng/mL)
                      </label>
                    </div>
                    <DocOnlyBadge />
                    <div className="text-[11px] text-slate-600">Range: 0.0 - 150.0 • Ref: &lt; 5.0</div>
                    <input
                      type="number"
                      step="0.1"
                      value={patientData.ck_mb}
                      onChange={(e) => onChange('ck_mb', Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ECHOCARDIOGRAPHY */}
          {activeTab === 'echo' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-900">
                  Left Ventricular Ejection Fraction (EF-TTE %)
                </label>
                <div className="text-[11px] text-slate-600">Range: 15% - 75% • Normal: 50% - 70%</div>
                <input
                  type="number"
                  min="15"
                  max="75"
                  value={patientData.ejection_fraction}
                  onChange={(e) => onChange('ejection_fraction', Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-900">
                  Regional Wall Motion Abnormality (RWMA)
                </label>
                <div className="text-[11px] text-slate-600">Mapped to anatomical coronary perfusion territory</div>
                <select
                  value={patientData.region_rwma}
                  onChange={(e) => onChange('region_rwma', e.target.value)}
                  className={inputClass}
                >
                  <option value="None">None (Normal Wall Motion)</option>
                  <option value="Anterior">Anterior / Septal Wall (Correlates with LAD)</option>
                  <option value="Lateral">Lateral Wall (Correlates with LCX)</option>
                  <option value="Inferior">Inferior Wall (Correlates with RCA)</option>
                  <option value="Apical">Apical Segment</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Form Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            Active category: <span className="font-semibold text-slate-900 capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => onRunAssessment && onRunAssessment(patientData, 'analysis')}
              disabled={isAnalyzing}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAnalyzing ? 'Evaluating Biomarkers...' : 'Run AI Assessment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
