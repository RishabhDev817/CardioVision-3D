import React, { useState } from 'react';
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Database,
  ShieldAlert,
  SlidersHorizontal,
  Cpu,
  Layers
} from 'lucide-react';
import heartIllustration from '../assets/heart-medical-illustration.png';

export default function HomeSection({
  onNavigate,
  onRunAssessment,
  metricsData,
  predictionData
}) {
  const hasPrediction = Boolean(predictionData?.overall_cad);
  
  // Format probabilities to 1 decimal place if available
  const cadPct = hasPrediction && predictionData.overall_cad.probability != null
    ? (predictionData.overall_cad.probability * 100).toFixed(1)
    : null;
  const ladPct = hasPrediction && predictionData.vessels?.LAD?.probability != null
    ? (predictionData.vessels.LAD.probability * 100).toFixed(1)
    : null;
  const lcxPct = hasPrediction && predictionData.vessels?.LCX?.probability != null
    ? (predictionData.vessels.LCX.probability * 100).toFixed(1)
    : null;
  const rcaPct = hasPrediction && predictionData.vessels?.RCA?.probability != null
    ? (predictionData.vessels.RCA.probability * 100).toFixed(1)
    : null;

  const overallTier = predictionData?.overall_cad?.risk_tier || 'Estimated';
  const ladTier = predictionData?.vessels?.LAD?.risk_tier || 'Estimated';
  const lcxTier = predictionData?.vessels?.LCX?.risk_tier || 'Estimated';
  const rcaTier = predictionData?.vessels?.RCA?.risk_tier || 'Estimated';


  const pipelineSteps = [
    {
      num: '01',
      title: 'UCI Cohort',
      desc: 'Z-Alizadeh Sani dataset ID #411 with 303 angiographically validated patient cases.',
      icon: Database
    },
    {
      num: '02',
      title: 'Drop Leakage',
      desc: 'Strict exclusion of post-catheterization targets (Cath, LAD, LCX, RCA) prevents test leakage.',
      icon: ShieldAlert
    },
    {
      num: '03',
      title: 'Scale Features',
      desc: 'Robust scaling across 60 non-invasive clinical, ECG, and echocardiographic biomarkers.',
      icon: SlidersHorizontal
    },
    {
      num: '04',
      title: 'Dual Classifiers',
      desc: 'Stratified 5-fold cross-validated Random Forest & XGBoost with balanced class-weight calibration.',
      icon: Cpu
    },
    {
      num: '05',
      title: 'Explain & Project',
      desc: 'Local TreeSHAP attributions mapped onto interactive 3D coronary anatomy with risk tiers.',
      icon: Layers
    }
  ];

  return (
    <div className="medical-pattern-bg space-y-10 pb-12">
      {/* 1. HERO SECTION: Asymmetric Value Proposition & Interactive 3D Anatomy Preview */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Soft clinical ambient glow */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[#F0FDFA]/80 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-[#FFF1F2]/80 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Clinical Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pastel Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
              <span>Multimodal AI Decision Support</span>
            </div>

            {/* Main Heading & Subtitle */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Explore Coronary Artery Predictions
              </h1>
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-xl">
                CardioVision AI integrates structured machine learning classifiers, local TreeSHAP feature attributions, and interactive 3D coronary anatomy to deliver transparent, vessel-specific decision support.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('assessment')}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-[#E11D48] hover:bg-[#BE123C] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-2 group cursor-pointer"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('anatomy')}
                className="px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-[#E11D48]" />
                <span>Explore 3D Anatomy</span>
              </button>
            </div>

            {/* Safety Micro-Copy */}
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>Research and educational prototype — Validated against UCI Dataset #411.</span>
            </div>
          </div>

          {/* Right Column: Borderless Floating Medical Heart Hologram */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <img
              src={heartIllustration}
              alt="Anatomical Medical Heart Illustration"
              className="w-full max-w-[420px] object-contain mx-auto animate-hologram-float select-none transition-transform duration-500 hover:scale-105"
              style={{
                mixBlendMode: 'multiply',
                filter: 'drop-shadow(0 20px 30px rgba(13, 148, 136, 0.25))'
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. TARGET PREDICTION ESTIMATES SECTION ("Awaiting Inference" Cards) */}
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Target Prediction Estimates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Branch-level and overall disease estimates generated by trained Random Forest and XGBoost classifiers
            </p>
          </div>
          <div className="self-start sm:self-auto shrink-0">
            {hasPrediction ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-emerald-800 border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Inference Computed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                Awaiting Live Inference
              </span>
            )}
          </div>
        </div>

        {/* 4 Distinct Un-Nested White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Overall CAD (#E11D48) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-[#E11D48] flex flex-col justify-between min-h-[195px] space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#BE123C]">
                    Overall CAD
                  </span>
                </div>
                {hasPrediction ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFF1F2] text-[#BE123C] border border-[#FFE4E6]">
                    {overallTier} Risk
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    Pending
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Coronary Artery Disease
              </h3>
            </div>

            <div className="space-y-1.5">
              {hasPrediction && cadPct != null ? (
                <div className="text-3xl font-extrabold font-mono text-[#E11D48]">
                  {cadPct}%
                </div>
              ) : (
                <div className="py-1">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#E11D48]/40 animate-pulse" />
                    <span>Awaiting Assessment</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-600 leading-relaxed">
                Patient-level probability of significant luminal stenosis (≥50%) in any major coronary branch.
              </p>
            </div>
          </div>

          {/* Card 2: LAD Branch (#F43F5E) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-[#F43F5E] flex flex-col justify-between min-h-[195px] space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#BE123C]">
                    LAD Branch
                  </span>
                </div>
                {hasPrediction ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFF1F2] text-[#BE123C] border border-[#FFE4E6]">
                    {ladTier}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    Pending
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Left Anterior Descending
              </h3>
            </div>

            <div className="space-y-1.5">
              {hasPrediction && ladPct != null ? (
                <div className="text-3xl font-extrabold font-mono text-[#F43F5E]">
                  {ladPct}%
                </div>
              ) : (
                <div className="py-1">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#F43F5E]/40 animate-pulse" />
                    <span>Awaiting Assessment</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-600 leading-relaxed">
                Anterior ventricular wall, cardiac apex, and septal myocardial perfusion territory.
              </p>
            </div>
          </div>

          {/* Card 3: LCX Branch (#0D9488) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-[#0D9488] flex flex-col justify-between min-h-[195px] space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F766E]">
                    LCX Branch
                  </span>
                </div>
                {hasPrediction ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                    {lcxTier}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    Pending
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Left Circumflex Artery
              </h3>
            </div>

            <div className="space-y-1.5">
              {hasPrediction && lcxPct != null ? (
                <div className="text-3xl font-extrabold font-mono text-[#0D9488]">
                  {lcxPct}%
                </div>
              ) : (
                <div className="py-1">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#0D9488]/40 animate-pulse" />
                    <span>Awaiting Assessment</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-600 leading-relaxed">
                Lateral and posterolateral left ventricular myocardial perfusion territory.
              </p>
            </div>
          </div>

          {/* Card 4: RCA Branch (#F97316) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-[#F97316] flex flex-col justify-between min-h-[195px] space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#B45309]">
                    RCA Branch
                  </span>
                </div>
                {hasPrediction ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]">
                    {rcaTier}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    Pending
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Right Coronary Artery
              </h3>
            </div>

            <div className="space-y-1.5">
              {hasPrediction && rcaPct != null ? (
                <div className="text-3xl font-extrabold font-mono text-[#F97316]">
                  {rcaPct}%
                </div>
              ) : (
                <div className="py-1">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#F97316]/40 animate-pulse" />
                    <span>Awaiting Assessment</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-600 leading-relaxed">
                Inferior LV myocardial wall, right ventricle, and sinoatrial/AV nodal conduction territory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PIPELINE ARCHITECTURE FLOW SECTION */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                RIGOROUS COMPUTATION
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Pipeline Architecture Flow
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Five-step rigorous computational workflow ensuring verifiable predictions and strict leakage prevention
            </p>
          </div>
          <button
            onClick={() => onNavigate('methodology')}
            className="text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors cursor-pointer"
          >
            <span>Methodology Details</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Sleek 5-Step Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative flex flex-col p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                {/* Step Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-mono font-bold text-[#0D9488] shadow-2xs group-hover:border-[#0D9488] transition-colors">
                    {step.num}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#0D9488] transition-colors" />
                </div>

                {/* Title & Desc */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {step.desc}
                </p>

                {/* Stepper Arrow to next on desktop */}
                {idx < pipelineSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-300 pointer-events-none">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
