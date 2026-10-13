import React, { useState } from 'react';
import HeartCanvas, { VESSEL_COLORS, getRiskColor, getRiskTier } from './HeartCanvas';
import {
  Heart,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Activity,
  Layers,
  Compass
} from 'lucide-react';

const VESSEL_ANATOMY = {
  LAD: {
    name: 'Left Anterior Descending Artery',
    code: 'LAD',
    territory: 'Anterior & Apical',
    color: '#F43F5E',
    course: 'Originates from the Left Main Coronary Artery (LMCA) and courses along the anterior interventricular sulcus down to the cardiac apex.',
    perfusion: 'Supplies the anterior wall of the left ventricle, apex, anterior two-thirds of the interventricular septum, and bundle branches.',
    significance: 'Primary conduit for left ventricular anterior perfusion. Stenosis ≥50% impairs systolic ejection and anterior wall motion.',
    sourceLandmark: 'Anterior interventricular sulcus in 3D scene.'
  },
  LCX: {
    name: 'Left Circumflex Artery',
    code: 'LCX',
    territory: 'Posterolateral',
    color: '#0D9488',
    course: 'Arises from the LMCA and runs along the left atrioventricular groove around the left cardiac border to the diaphragmatic surface.',
    perfusion: 'Supplies the lateral and posterolateral myocardial walls of the left ventricle via obtuse marginal branches.',
    significance: 'Critical for lateral ventricular perfusion. Stenosis precipitates lateral hypokinesis and mitral papillary dysfunction.',
    sourceLandmark: 'Left atrioventricular groove in 3D scene.'
  },
  RCA: {
    name: 'Right Coronary Artery',
    code: 'RCA',
    territory: 'Inferior & RV Free Wall',
    color: '#F97316',
    course: 'Originates from the right aortic sinus and travels inferiorly along the right atrioventricular sulcus to the crux of the heart.',
    perfusion: 'Supplies the right ventricular free wall, inferior LV wall, sinus node (~60%), and AV node (~90%).',
    significance: 'Supplies nodal conduction tissue and the inferior wall. Stenosis triggers inferior ischemia and acute conduction blocks.',
    sourceLandmark: 'Right atrioventricular sulcus and crux in 3D scene.'
  }
};

export default function AnatomySection({
  predictionData,
  selectedVessel,
  onSelectVessel,
  onNavigate
}) {
  const [showAttribution, setShowAttribution] = useState(false);

  // Extract authentic prediction values without fabricating
  const hasPrediction = Boolean(predictionData?.vessels);
  const ladProb = hasPrediction ? (predictionData.vessels.LAD?.probability ?? null) : null;
  const lcxProb = hasPrediction ? (predictionData.vessels.LCX?.probability ?? null) : null;
  const rcaProb = hasPrediction ? (predictionData.vessels.RCA?.probability ?? null) : null;

  const currentCode = selectedVessel || 'LAD';
  const currentVessel = VESSEL_ANATOMY[currentCode] || VESSEL_ANATOMY.LAD;
  const currentVesselData = hasPrediction ? predictionData.vessels[currentCode] : null;
  const currentProb = currentVesselData?.probability ?? null;
  const currentShap = currentVesselData?.top_shap_features || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Compact Vessel Selector */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                3D ANATOMICAL WORKSPACE
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Coronary Anatomy &amp; Territory Mapping
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Interactive 3D model mapped to coronary perfusion territories. Click branches, callouts, or selector pills to inspect.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Compact Vessel Selector Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200">
              {['LAD', 'LCX', 'RCA'].map((code) => {
                const isSelected = currentCode === code;
                const vColor = code === 'LAD' ? '#F43F5E' : code === 'LCX' ? '#0D9488' : '#F97316';
                return (
                  <button
                    key={code}
                    onClick={() => onSelectVessel(code)}
                    aria-label={`Select ${code}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-white shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: vColor }} />
                    <span style={{ color: isSelected ? vColor : undefined }}>{code}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowAttribution(!showAttribution)}
              className="p-2 rounded-xl text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              title="Attribution & Provenance"
              aria-label="Attribution and provenance information"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Anatomy Workspace: 2-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): 3D Viewer & Clear Legend */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-5 space-y-4 border border-slate-200 shadow-xs">
          <div className="w-full h-[580px] lg:h-[620px] rounded-xl overflow-hidden relative border border-slate-200 shadow-inner bg-[#F8FAFC]">
            <HeartCanvas
              ladProb={ladProb}
              lcxProb={lcxProb}
              rcaProb={rcaProb}
              selectedVessel={selectedVessel}
              onSelectVessel={onSelectVessel}
              isLightTheme={true}
            />
          </div>

          {/* Dedicated Clean Legend: Territories + Validated Risk Tiers + Pinned Plaque Notice */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-3 pb-1 text-xs text-slate-600 border-t border-slate-100">
            {/* Combined Territories & Risk Tiers */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {/* Territories */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Territories:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                  <span className="font-semibold text-slate-900">LAD</span>
                  <span className="text-[11px] text-slate-500">(Anterior)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
                  <span className="font-semibold text-slate-900">LCX</span>
                  <span className="text-[11px] text-slate-500">(Lateral)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                  <span className="font-semibold text-slate-900">RCA</span>
                  <span className="text-[11px] text-slate-500">(Inferior)</span>
                </div>
              </div>

              <div className="h-3 w-px bg-slate-200 hidden sm:block" />

              {/* Validated Risk Tiers */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Risk Tiers:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669]" />
                  <span className="text-[11px] font-medium text-slate-700">Low (&lt;35%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                  <span className="text-[11px] font-medium text-slate-700">Mod (35–65%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  <span className="text-[11px] font-medium text-slate-700">High (≥65%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                  <span className="text-[11px] font-medium text-slate-500">Pending</span>
                </div>
              </div>
            </div>

            {/* Mandatory Pinned Plaque Notice */}
            <div className="flex items-center gap-1.5 text-[11px] text-amber-900 bg-[#FFFBEB] px-2.5 py-1 rounded-lg border border-[#FEF3C7] font-medium shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Highlights vascular territories; does not locate individual plaques.</span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Selected Vessel Side Inspector Panel with Refined Information Hierarchy */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 space-y-5 border border-slate-200 shadow-xs mt-3 lg:mt-0">
          {/* 1. Vessel Name & Abbreviation */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentVessel.color }} />
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {currentVessel.name}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  {currentVessel.territory} Territory
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              {currentVessel.code}
            </span>
          </div>

          {/* 2. Current Prediction State (Pending or Validated Model Estimate) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Model-Estimated Stenosis Likelihood (≥50% Narrowing)
            </span>
            {hasPrediction && currentProb !== null ? (
              <div className="flex items-baseline justify-between pt-0.5">
                <div className="text-3xl font-black font-mono" style={{ color: getRiskColor(currentProb) }}>
                  {(currentProb * 100).toFixed(1)}%
                </div>
                <span 
                  className="text-xs font-semibold px-2 py-0.5 rounded border bg-white"
                  style={{
                    color: getRiskColor(currentProb),
                    borderColor: `${getRiskColor(currentProb)}40`
                  }}
                >
                  {getRiskTier(currentProb)} Risk
                </span>
              </div>
            ) : (
              <div className="space-y-1.5 pt-0.5">
                <div className="text-xs font-semibold text-slate-600">
                  Awaiting Assessment
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Input patient biomarkers to compute tree-derived stenosis probability.
                </p>
                <button
                  onClick={() => onNavigate('assessment')}
                  className="text-xs font-semibold text-[#E11D48] hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <span>Start patient assessment</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* 3, 4, 5. Anatomical Course, Perfusion Territory & Clinical Context */}
          <div className="space-y-3.5 text-xs pt-1">
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">Anatomical Course</span>
              <p className="text-slate-600 leading-relaxed">{currentVessel.course}</p>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-3">
              <span className="font-bold text-slate-900 block">Perfusion Territory</span>
              <p className="text-slate-600 leading-relaxed">{currentVessel.perfusion}</p>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-3">
              <span className="font-bold text-slate-900 block">Clinical Significance</span>
              <p className="text-slate-600 leading-relaxed">{currentVessel.significance}</p>
            </div>
          </div>

          {/* 6. Link to Model Explanation (SHAP) when Available */}
          <div className="border-t border-slate-100 pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Top Biomarker Contributors (TreeSHAP)
              </span>
              <button
                onClick={() => onNavigate('explainability')}
                className="text-[11px] font-semibold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Explanation</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {hasPrediction && currentShap.length > 0 ? (
              <div className="space-y-1.5">
                {currentShap.slice(0, 3).map((f, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-800 font-medium truncate pr-2">
                      {f.feature}
                    </span>
                    <span
                      className={`font-mono font-bold text-[11px] shrink-0 ${
                        (f.shap_value || 0) >= 0 ? 'text-[#E11D48]' : 'text-[#0D9488]'
                      }`}
                    >
                      {(f.shap_value || 0) >= 0 ? `+${Math.abs(f.shap_value || 0).toFixed(3)}` : `-${Math.abs(f.shap_value || 0).toFixed(3)}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">
                {hasPrediction ? 'No dominant single feature attributions for this vessel.' : 'Run assessment to inspect patient-specific TreeSHAP attributions.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Model Attribution Modal / Provenance */}
      {showAttribution && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0D9488]" />
              <span>3D Anatomical Model Attribution &amp; Scientific Provenance</span>
            </h4>
            <button
              onClick={() => setShowAttribution(false)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <p>
              <strong>Asset Provenance:</strong> Custom procedural 3D anatomical heart mesh (<code className="font-mono text-[11px] px-1 py-0.5 rounded bg-slate-100">heart.glb</code>) synthesized programmatically via Three.js computational geometry script (<code className="font-mono text-[11px] px-1 py-0.5 rounded bg-slate-100">frontend/scripts/generate_heart_model.mjs</code>).
            </p>
            <p>
              <strong>License &amp; Rights:</strong> Open-source MIT License under the CardioVision AI repository. No external third-party copyrighted or CC-BY download assets.
            </p>
            <p>
              <strong>Landmark Correspondence:</strong>
              <br />• LAD: Segmented along the anterior interventricular sulcus to the apex.
              <br />• LCX: Segmented along the left atrioventricular groove to the posterolateral LV wall.
              <br />• RCA: Segmented along the right atrioventricular sulcus to the crux and posterior descending artery.
            </p>
            <p className="text-[11px] text-slate-600 italic">
              <strong>Caveat:</strong> Model outputs represent empirical statistical risk correlations derived from the UCI Z-Alizadeh Sani cohort (≥50% luminal stenosis verified by catheterization), not direct optical or CT plaque reconstruction.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
