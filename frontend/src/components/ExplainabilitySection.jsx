import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Info,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Play,
  Search,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Calculator,
  Equal
} from 'lucide-react';
import { VESSEL_COLORS } from './HeartCanvas';

export default function ExplainabilitySection({
  predictionData,
  predictionError,
  selectedVessel,
  onSelectVessel,
  onNavigate
}) {
  const [activeTarget, setActiveTarget] = useState('CAD');
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize active tab when selectedVessel is passed from 3D viewer or parent
  useEffect(() => {
    if (selectedVessel && ['LAD', 'LCX', 'RCA'].includes(selectedVessel)) {
      setActiveTarget(selectedVessel);
    } else if (selectedVessel === 'CAD' || selectedVessel === null) {
      setActiveTarget('CAD');
    }
  }, [selectedVessel]);

  // Extract real SHAP values from the live prediction payload
  const hasPrediction = Boolean(predictionData?.overall_cad);
  const cadData = predictionData?.overall_cad;
  const ladData = predictionData?.vessels?.LAD;
  const lcxData = predictionData?.vessels?.LCX;
  const rcaData = predictionData?.vessels?.RCA;

  const targetMap = useMemo(() => ({
    CAD: {
      key: 'CAD',
      name: 'Overall Coronary Artery Disease (CAD)',
      shortName: 'CAD',
      targetDefinition: 'Binary classification: Significant CAD (stenosis ≥ 50% in ≥ 1 vessel)',
      estimatorName: 'RandomForestClassifier (180 trees, max_depth=6)',
      modelFamily: 'Random Forest',
      outputSpace: cadData?.shap_output_space || 'probability',
      baseValue: cadData?.shap_base_value ?? 0.5006,
      sumShap: cadData?.shap_sum ?? 0,
      color: '#E11D48',
      prob: cadData?.percentage,
      probVal: cadData?.probability,
      riskTier: cadData?.risk_tier,
      topFeatures: cadData?.top_shap_features || [],
      allFeatures: cadData?.all_shap_features || cadData?.top_shap_features || [],
      groupedFeatures: cadData?.grouped_shap_features || [],
      desc: 'Overall patient-level CAD probability and underlying additive feature attributions'
    },
    LAD: {
      key: 'LAD',
      name: 'Left Anterior Descending Artery (LAD)',
      shortName: 'LAD',
      targetDefinition: 'Binary classification: LAD lumen stenosis ≥ 50%',
      estimatorName: 'RandomForestClassifier (180 trees, max_depth=6)',
      modelFamily: 'Random Forest',
      outputSpace: ladData?.shap_output_space || 'probability',
      baseValue: ladData?.shap_base_value ?? 0.5022,
      sumShap: ladData?.shap_sum ?? 0,
      color: '#BE123C',
      prob: ladData?.percentage,
      probVal: ladData?.probability,
      riskTier: ladData?.risk_tier,
      territory: ladData?.territory || 'Anterior LV wall, apex, anterior 2/3 of interventricular septum',
      topFeatures: ladData?.top_shap_features || [],
      allFeatures: ladData?.all_shap_features || ladData?.top_shap_features || [],
      groupedFeatures: ladData?.grouped_shap_features || [],
      desc: 'Target-specific TreeSHAP attributions for LAD arterial branch'
    },
    LCX: {
      key: 'LCX',
      name: 'Left Circumflex Artery (LCX)',
      shortName: 'LCX',
      targetDefinition: 'Binary classification: LCX lumen stenosis ≥ 50%',
      estimatorName: 'XGBClassifier (120 trees, max_depth=4, lr=0.04)',
      modelFamily: 'XGBoost',
      outputSpace: lcxData?.shap_output_space || 'raw_log_odds',
      baseValue: lcxData?.shap_base_value ?? 0.0396,
      sumShap: lcxData?.shap_sum ?? 0,
      color: '#0F766E',
      prob: lcxData?.percentage,
      probVal: lcxData?.probability,
      riskTier: lcxData?.risk_tier,
      territory: lcxData?.territory || 'Posterolateral LV wall, obtuse marginal branches',
      topFeatures: lcxData?.top_shap_features || [],
      allFeatures: lcxData?.all_shap_features || lcxData?.top_shap_features || [],
      groupedFeatures: lcxData?.grouped_shap_features || [],
      desc: 'Target-specific TreeSHAP attributions for LCX arterial branch'
    },
    RCA: {
      key: 'RCA',
      name: 'Right Coronary Artery (RCA)',
      shortName: 'RCA',
      targetDefinition: 'Binary classification: RCA lumen stenosis ≥ 50%',
      estimatorName: 'XGBClassifier (120 trees, max_depth=4, lr=0.04)',
      modelFamily: 'XGBoost',
      outputSpace: rcaData?.shap_output_space || 'raw_log_odds',
      baseValue: rcaData?.shap_base_value ?? 0.0639,
      sumShap: rcaData?.shap_sum ?? 0,
      color: '#B45309',
      prob: rcaData?.percentage,
      probVal: rcaData?.probability,
      riskTier: rcaData?.risk_tier,
      territory: rcaData?.territory || 'RV free wall, inferior LV myocardial wall, posterior descending artery',
      topFeatures: rcaData?.top_shap_features || [],
      allFeatures: rcaData?.all_shap_features || rcaData?.top_shap_features || [],
      groupedFeatures: rcaData?.grouped_shap_features || [],
      desc: 'Target-specific TreeSHAP attributions for RCA arterial branch'
    },
  }), [cadData, ladData, lcxData, rcaData]);

  const current = targetMap[activeTarget] || targetMap.CAD;

  const [provenanceFilter, setProvenanceFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('clinical'); // 'clinical' (55 grouped) or 'technical' (60 transformed)
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategoryExpand = (catKey) => {
    setExpandedCategories(prev => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  // Base feature source based on viewMode (clinical grouped vs technical transformed)
  const baseSource = useMemo(() => {
    if (viewMode === 'clinical' && current.groupedFeatures && current.groupedFeatures.length > 0) {
      return current.groupedFeatures;
    }
    return current.allFeatures;
  }, [viewMode, current.groupedFeatures, current.allFeatures]);

  // Select feature list based on showAllFeatures toggle
  const rawFeaturesList = showAllFeatures ? baseSource : baseSource.slice(0, 10);

  // Filter features if searchQuery or provenanceFilter is present
  const featuresList = useMemo(() => {
    let list = rawFeaturesList;
    if (provenanceFilter !== 'ALL') {
      list = (showAllFeatures ? baseSource : baseSource.slice(0, 10)).filter(f => f.provenance_type === provenanceFilter);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(f =>
      f.feature.toLowerCase().includes(q) ||
      (f.raw_feature_parent && f.raw_feature_parent.toLowerCase().includes(q)) ||
      (f.provenance_label && f.provenance_label.toLowerCase().includes(q))
    );
  }, [rawFeaturesList, baseSource, showAllFeatures, provenanceFilter, searchQuery]);

  // Compute maximum absolute magnitude for proportional bar widths
  const maxMag = Math.max(
    ...featuresList.map(f => Math.abs(f.shap_value || 0)),
    0.001
  );

  const handleTargetChange = (tgt) => {
    setActiveTarget(tgt);
    if (tgt === 'CAD') {
      if (onSelectVessel) onSelectVessel(null);
    } else {
      if (onSelectVessel) onSelectVessel(tgt);
    }
  };

  const isRF = current.outputSpace === 'probability';
  const marginSum = Number((current.baseValue + current.sumShap).toFixed(4));

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Target Selection Bar */}
      <div className="bg-white rounded-2xl p-6 space-y-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                EXPLAINABLE AI • TREESHAP
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Feature Contributions &amp; Mathematical Attributions
              </h2>
            </div>
            <p className="text-xs text-slate-700 mt-1">
              Patient-specific additive feature attributions calculated using TreeSHAP on the trained model for each target.
            </p>
          </div>

          {/* Target Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto shrink-0">
            {['CAD', 'LAD', 'LCX', 'RCA'].map((tgt) => {
              const isSelected = activeTarget === tgt;
              const tgtInfo = targetMap[tgt];
              return (
                <button
                  key={tgt}
                  onClick={() => handleTargetChange(tgt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  aria-label={`Select ${tgt} target explanation`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: tgtInfo.color }}
                  />
                  <span>{tgt}</span>
                  {tgtInfo.prob != null && (
                    <span className="text-[10px] font-semibold text-slate-600">
                      {tgtInfo.prob}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Concise SHAP Attribution Notice */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>Feature contributions describe model behavior, not biological causality.</span>
          </div>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            Attributions quantify how each biomarker nudged the model's output above or below the cohort baseline. They describe mathematical model behavior and do not establish direct clinical etiology.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-start gap-2.5 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] mt-1 shrink-0" />
              <div>
                <span className="font-bold block text-slate-900">
                  Positive Contribution (+):
                </span>
                <span className="text-[11px] text-slate-700">Pushes model estimate higher toward positive stenosis classification.</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-start gap-2.5 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E] mt-1 shrink-0" />
              <div>
                <span className="font-bold block text-slate-900">
                  Negative Contribution (-):
                </span>
                <span className="text-[11px] text-slate-700">Pushes model estimate lower away from positive classification.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Target Context & Mathematical Output Space Decomposition Card */}
      <div className="bg-white rounded-2xl p-6 space-y-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: current.color }}
              />
              <h3 className="text-base font-bold text-slate-900">
                {current.name}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {current.estimatorName}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1">
              {current.targetDefinition}
              {current.territory && (
                <span className="block text-[11px] text-slate-600 mt-0.5">
                  Anatomical Territory: {current.territory}
                </span>
              )}
            </p>
          </div>

          {/* Current Probability & Risk Badge */}
          <div className="flex items-center gap-3">
            {hasPrediction && current.prob != null ? (
              <div className="text-right">
                <span className="text-[11px] uppercase font-mono text-slate-600 block font-medium">
                  Model Probability
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {current.prob}%
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                      current.riskTier === 'High'
                        ? 'bg-[#FFF1F2] text-[#BE123C] border-[#FFE4E6]'
                        : current.riskTier === 'Moderate'
                        ? 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]'
                        : 'bg-[#F0FDFA] text-[#0F766E] border-[#CCFBF1]'
                    }`}
                  >
                    {current.riskTier} Risk
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                Awaiting Assessment
              </div>
            )}
          </div>
        </div>

        {/* Clean Equation Pill Badges & Output Space Breakdown */}
        {hasPrediction && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  TreeSHAP Additive Decomposition
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border bg-slate-50 text-[#1D4ED8] border-[#BFDBFE]">
                {isRF ? 'Probability Space (Random Forest)' : 'Margin / Log-Odds Space (XGBoost)'}
              </span>
            </div>

            {/* Equation Block Formatted as Clean Pill Badges & Code Styling */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              {isRF ? (
                /* Random Forest: Probability Space Equation */
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  {/* Base Value */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-600 uppercase font-sans font-medium">Base Expected 𝔼[f(x)]</span>
                    <span className="font-bold text-slate-900">{current.baseValue}</span>
                  </div>

                  <span className="text-slate-500 font-bold text-sm">+</span>

                  {/* Net Feature SHAP */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-600 uppercase font-sans font-medium">Net Feature SHAP Σφᵢ</span>
                    <span className={`font-bold ${current.sumShap >= 0 ? 'text-[#BE123C]' : 'text-[#0F766E]'}`}>
                      {current.sumShap >= 0 ? `+${current.sumShap}` : current.sumShap}
                    </span>
                  </div>

                  <span className="text-slate-500 font-bold text-sm">=</span>

                  {/* Estimated Output */}
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FFF1F2] border border-[#FFE4E6] text-[#BE123C] shadow-xs font-bold">
                    <span className="text-[10px] uppercase font-sans">Model Probability</span>
                    <span>{current.probVal} ({current.prob}%)</span>
                  </div>
                </div>
              ) : (
                /* XGBoost: Margin / Log-Odds Space Equation */
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  {/* Base Margin */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-600 uppercase font-sans font-medium">Base Log-Odds 𝔼[f(x)]</span>
                    <span className="font-bold text-slate-900">
                      {current.baseValue >= 0 ? `+${current.baseValue}` : current.baseValue}
                    </span>
                  </div>

                  <span className="text-slate-500 font-bold text-sm">+</span>

                  {/* Net Margin SHAP */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-600 uppercase font-sans font-medium">Net Feature SHAP Σφᵢ</span>
                    <span className={`font-bold ${current.sumShap >= 0 ? 'text-[#BE123C]' : 'text-[#0F766E]'}`}>
                      {current.sumShap >= 0 ? `+${current.sumShap}` : current.sumShap}
                    </span>
                  </div>

                  <span className="text-slate-500 font-bold text-sm">=</span>

                  {/* Margin Total */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-900">
                    <span className="text-[10px] uppercase font-sans font-medium text-slate-600">Total Margin (z)</span>
                    <span>{marginSum >= 0 ? `+${marginSum}` : marginSum}</span>
                  </div>

                  <span className="text-[#1D4ED8] font-bold">→ σ(z) =</span>

                  {/* Sigmoid Probability */}
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] shadow-xs font-bold">
                    <span className="text-[10px] uppercase font-sans">Sigmoid Output</span>
                    <span>{current.probVal} ({current.prob}%)</span>
                  </div>
                </div>
              )}

              {/* Explanatory context note */}
              <p className="text-[11px] text-slate-700 leading-relaxed border-t border-slate-200 pt-2.5">
                {isRF
                  ? 'Random Forest target: TreeSHAP operates directly in continuous probability space. Local feature attributions sum additively from the cohort prior probability to the final estimate.'
                  : 'XGBoost target: TreeSHAP computes additivity in margin (log-odds) space. The base margin plus feature contributions produce the total margin z, converted to predicted probability via logistic sigmoid σ(z) = 1 / (1 + e⁻ᶻ).'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. SHAP Feature Attribution Visualization */}
      <div className="bg-white rounded-2xl p-6 space-y-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {showAllFeatures
                  ? (viewMode === 'clinical' ? 'All 55 Clinical Feature Attributions' : 'All 60 Transformed Feature Attributions')
                  : 'Top Influential Features'} for {current.shortName}
              </h3>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Ranked by |SHAP| Magnitude
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5">
              Features with larger absolute SHAP values exerted greater mathematical influence on this patient's prediction.
            </p>
          </div>

          {/* Direction Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold self-start sm:self-auto">
            <div className="flex items-center gap-1.5 text-[#BE123C]">
              <span className="w-2.5 h-2.5 rounded bg-[#BE123C]" />
              <span>Pushes Prediction Higher (+)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#0F766E]">
              <span className="w-2.5 h-2.5 rounded bg-[#0F766E]" />
              <span>Pushes Prediction Lower (-)</span>
            </div>
          </div>
        </div>

        {/* Error / Backend Offline State */}
        {predictionError && (
          <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
            <h4 className="text-sm font-bold text-rose-900">
              Patient-specific explanation unavailable
            </h4>
            <p className="text-xs text-rose-700 max-w-lg mx-auto">
              Patient-specific explanation unavailable because the model service could not be reached. Ensure the backend server is running.
            </p>
          </div>
        )}

        {/* Empty State / No Prediction */}
        {!hasPrediction && !predictionError && (
          <div className="p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
              <Sliders className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                No Active Patient Assessment
              </h4>
              <p className="text-slate-700 text-xs max-w-md mx-auto">
                Run AI Assessment to generate patient-specific explanations. Authentic TreeSHAP feature attributions will be computed live for {current.name}.
              </p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('assessment')}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Open Patient Assessment</span>
              </button>
            )}
          </div>
        )}

        {/* Live SHAP Features List */}
        {hasPrediction && (
          <div className="space-y-4">
            {/* Feature Provenance & Imputation Disclosure Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Feature Provenance &amp; Baseline Imputation Disclosure</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                CardioVision AI evaluates 55 candidate clinical variables (transformed into 60 model inputs). 
                <strong> 18</strong> are measured patient inputs, <strong>3</strong> are derived physiological metrics, <strong>5</strong> are clinical heuristics, and <strong>29</strong> are uncollected parameters defaulted to population reference baselines.
              </p>
              <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Clinical Interpretation Note:</strong> When an unmeasured reference baseline feature (such as platelet count or ESR) appears with a non-zero SHAP attribution, it reflects the model's sensitivity under standard population assumptions, <em>not an actual laboratory measurement</em> of this patient.
                </span>
              </div>
            </div>

            {/* Search, Provenance Filters & Toggle Controls */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                  {/* View Mode Toggle: Clinical (55) vs Technical (60) */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-200 border border-slate-300 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setViewMode('clinical')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        viewMode === 'clinical'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Clinical (55)
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('technical')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        viewMode === 'technical'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Technical (60)
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                    className="px-3 py-1.5 rounded-lg font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    {showAllFeatures ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Show Top 10 Only</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>View All {viewMode === 'clinical' ? '55' : '60'} Features</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Provenance Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">Provenance Filter:</span>
                {[
                  { id: 'ALL', label: 'All Predictors' },
                  { id: 'user_entered', label: 'Measured Inputs (18)' },
                  { id: 'derived', label: 'Derived Metrics (3)' },
                  { id: 'heuristic', label: 'Clinical Heuristics (5)' },
                  { id: 'fixed_constant', label: 'Reference Baselines (29)' },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setProvenanceFilter(btn.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all cursor-pointer ${
                      provenanceFilter === btn.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Bars */}
            {featuresList.length === 0 ? (
              <div className="p-8 text-center text-slate-700 text-xs">
                No features match the filter query "{searchQuery}" with provenance "{provenanceFilter}".
              </div>
            ) : (
              <div className="space-y-3">
                {featuresList.map((f, idx) => {
                  const isPositive = (f.shap_value || 0) >= 0;
                  const absVal = Math.abs(f.shap_value || 0);
                  const barWidthPct = Math.min(100, Math.max(4, (absVal / maxMag) * 100));

                  const getProvenanceBadge = () => {
                    switch (f.provenance_type) {
                      case 'user_entered':
                        return (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            Measured Input
                          </span>
                        );
                      case 'derived':
                        return (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                            Derived Metric
                          </span>
                        );
                      case 'heuristic':
                        return (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 shrink-0" title={f.provenance_description}>
                            Clinical Heuristic
                          </span>
                        );
                      case 'fixed_constant':
                      default:
                        return (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0" title={f.provenance_description}>
                            Reference Baseline
                          </span>
                        );
                    }
                  };

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:bg-white hover:border-slate-300 transition-all space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <span className="font-mono text-slate-500 text-[11px] w-5 text-right shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="font-semibold text-slate-900 truncate">
                            {f.feature}
                          </span>
                          {f.is_one_hot && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] shrink-0 font-medium">
                              One-Hot
                            </span>
                          )}
                          {f.is_grouped_categorical && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 shrink-0 font-medium">
                              Grouped Clinical
                            </span>
                          )}
                          {getProvenanceBadge()}
                        </div>

                        <div className="flex items-center gap-2 font-mono shrink-0">
                          <span className="text-[11px] text-slate-600 font-medium hidden sm:inline">
                            {isPositive ? 'Pushes Higher (+)' : 'Pushes Lower (-)'}
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs border ${
                              isPositive
                                ? 'bg-[#FFF1F2] text-[#BE123C] border-[#FFE4E6]'
                                : 'bg-[#F0FDFA] text-[#0F766E] border-[#CCFBF1]'
                            }`}
                          >
                            {f.contribution || (isPositive ? `+${absVal.toFixed(3)}` : `-${absVal.toFixed(3)}`)}
                          </span>
                        </div>
                      </div>

                      {/* Value disclosure line */}
                      <div className="text-[11px] text-slate-600 pl-7 flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          {f.provenance_type === 'user_entered' ? (
                            <span>Patient value: <strong className="text-slate-800 font-mono">{f.patient_value ?? 'Recorded'}</strong></span>
                          ) : f.provenance_type === 'derived' ? (
                            <span>Calculated from inputs: <strong className="text-slate-800 font-mono">{f.patient_value}</strong></span>
                          ) : f.provenance_type === 'heuristic' ? (
                            <span>Clinical heuristic assumption: <strong className="text-slate-800 font-mono">{f.patient_value}</strong></span>
                          ) : (
                            <span>
                              Population reference baseline: <strong className="text-slate-800 font-mono">{f.baseline_value ?? f.patient_value}</strong>{' '}
                              <span className="italic text-slate-500">(unmeasured in active inputs)</span>
                            </span>
                          )}
                        </div>

                        {/* Expandable one-hot component drawer toggle */}
                        {f.is_grouped_categorical && f.sub_components && f.sub_components.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleCategoryExpand(f.feature)}
                            className="text-[10px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{expandedCategories[f.feature] ? 'Hide Levels' : `Inspect ${f.sub_components.length} One-Hot Components`}</span>
                            {expandedCategories[f.feature] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      {/* Nested sub-components breakdown card */}
                      {f.is_grouped_categorical && expandedCategories[f.feature] && f.sub_components && (
                        <div className="mt-2 ml-7 p-3 rounded-lg bg-slate-100/80 border border-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span>Constituent One-Hot Components (Exact Signed Decomposition)</span>
                            <span className="font-mono text-purple-700">Net: {f.contribution}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {f.sub_components.map((sub, sIdx) => (
                              <div key={sIdx} className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between text-[11px]">
                                <div className="space-y-0.5">
                                  <span className="font-mono font-semibold text-slate-800 block">{sub.feature}</span>
                                  <span className="text-[10px] text-slate-500">Indicator value: {sub.patient_value ?? 0}</span>
                                </div>
                                <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] border ${
                                  (sub.shap_value || 0) >= 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-teal-50 text-teal-700 border-teal-200'
                                }`}>
                                  {sub.contribution}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-500 italic">
                            Mathematical property: Net categorical attribution equals the exact linear sum of constituent one-hot features.
                          </p>
                        </div>
                      )}

                      {/* Horizontal Bar Visualizer */}
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden flex items-center">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPositive ? 'bg-[#E11D48]' : 'bg-[#0F766E]'
                          }`}
                          style={{ width: `${barWidthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Scientific Footnote */}
        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
          <span>
            Algorithm: TreeSHAP (Lundberg &amp; Lee, 2017) • Target: {current.name} • 60 Transformed Predictors Evaluated
          </span>
          <span className="italic font-medium">
            All SHAP values are calculated live on trained model estimators.
          </span>
        </div>
      </div>
    </div>
  );
}
