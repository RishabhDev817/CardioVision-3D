import React from 'react';
import {
  Heart,
  Info,
  Sparkles,
  ChevronRight,
  Play
} from 'lucide-react';

export default function AnalysisSection({
  predictionData,
  onNavigate,
  onSelectVessel
}) {
  if (!predictionData?.overall_cad) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center space-y-4 my-8 max-w-xl mx-auto border border-slate-200 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center mx-auto text-[#E11D48]">
          <Heart className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Awaiting Assessment
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Patient biomarkers must be evaluated through the trained machine learning pipeline before model-estimated probabilities and vessel stenosis predictions can be displayed.
        </p>
        <button
          onClick={() => onNavigate('assessment')}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] shadow-sm inline-flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Open Patient Assessment</span>
        </button>
      </div>
    );
  }

  const overall = predictionData.overall_cad;
  const vessels = predictionData.vessels || {};
  const summary = predictionData.summary || {};

  const getTierBadge = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'high':
        return 'bg-[#FFF1F2] text-[#BE123C] border-[#FFE4E6]';
      case 'moderate':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#FEF3C7]';
      default:
        return 'bg-[#F0FDFA] text-[#0F766E] border-[#CCFBF1]';
    }
  };

  const cadFormatted = overall.probability != null ? (overall.probability * 100).toFixed(1) : overall.percentage;
  const ladFormatted = vessels.LAD?.probability != null ? (vessels.LAD.probability * 100).toFixed(1) : vessels.LAD?.percentage;
  const lcxFormatted = vessels.LCX?.probability != null ? (vessels.LCX.probability * 100).toFixed(1) : vessels.LCX?.percentage;
  const rcaFormatted = vessels.RCA?.probability != null ? (vessels.RCA.probability * 100).toFixed(1) : vessels.RCA?.percentage;

  const handleInspectAnatomy = (vesselCode) => {
    if (onSelectVessel) onSelectVessel(vesselCode);
    if (onNavigate) onNavigate('anatomy');
  };

  const handleInspectTreeShap = (targetCode) => {
    if (onSelectVessel) onSelectVessel(targetCode);
    if (onNavigate) onNavigate('explainability');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Quick Navigation */}
      <div className="bg-white rounded-2xl p-6 space-y-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                INFERENCE RESULTS
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Prediction Estimates &amp; Target Breakdown
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Estimated probabilities from trained XGBoost and Random Forest classifiers on the UCI cohort.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onNavigate('anatomy')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>3D Anatomy</span>
            </button>
            <button
              onClick={() => onNavigate('explainability')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>TreeSHAP Explanations</span>
            </button>
          </div>
        </div>

        {/* Anatomical & Educational Notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
          <Info className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <p className="font-semibold text-slate-900">
              Predictions highlight vessels; they do not locate individual plaques.
            </p>
            <p className="text-[11px] text-slate-600">
              Values represent model-estimated probability of significant luminal narrowing (≥50% diameter stenosis) based on clinical covariates, not intravascular diagnostic imaging.
            </p>
          </div>
        </div>

        {/* Probability Calibration & Clinical Decision-Support Notice (CV-07) */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Uncalibrated Model Decision Scores — Research &amp; Educational Prototype</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            Probabilities displayed below are raw statistical decision scores produced by <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-white text-slate-800">predict_proba()</code> on the trained tree ensemble models. Formal post-hoc calibration (e.g. Platt scaling or isotonic regression) was not applied. An estimated score of 70% represents model decision confidence under the cohort distribution, not an epidemiologically verified 70% real-world event rate. Risk tiers are application display categories (&lt;35% Low, 35–65% Moderate, ≥65% High).
          </p>
        </div>
      </div>

      {/* Four Probability Cards with Actionable Inline Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OVERALL CAD CARD */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-t-4 border-t-[#E11D48] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#BE123C]">
                Overall CAD
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTierBadge(overall.risk_tier)}`}>
                {overall.risk_tier} Risk
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-3xl font-black font-mono text-slate-900">
                {cadFormatted}%
              </div>
              <div className="text-xs font-medium text-slate-600">
                Patient-level probability
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#E11D48] h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Number(cadFormatted))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Estimated likelihood of ≥50% stenosis in at least one major coronary branch.
            </p>
          </div>

          {/* Actionable Inline Links */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => handleInspectAnatomy('LAD')}
              className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Inspect in 3D Anatomy</span>
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
            <button
              onClick={() => handleInspectTreeShap('CAD')}
              className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#BE123C] border border-[#FFE4E6] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>View TreeSHAP Breakdown</span>
              </span>
              <ChevronRight className="w-3 h-3 text-[#BE123C]" />
            </button>
          </div>
        </div>

        {/* LAD CARD */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-t-4 border-t-[#F43F5E] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                <span className="text-xs font-mono font-bold text-[#BE123C]">
                  LAD Territory
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTierBadge(vessels.LAD?.risk_tier)}`}>
                {vessels.LAD?.risk_tier} Risk
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-3xl font-black font-mono text-[#F43F5E]">
                {ladFormatted}%
              </div>
              <div className="text-xs font-medium text-slate-600">
                Left anterior descending
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 bg-[#F43F5E]"
                style={{ width: `${Math.min(100, Number(ladFormatted) || 0)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Anterior ventricular wall, cardiac apex, and septal myocardial supply.
            </p>
          </div>

          {/* Actionable Inline Links */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => handleInspectAnatomy('LAD')}
              className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#F43F5E]" />
                <span>Inspect in 3D Anatomy</span>
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
            <button
              onClick={() => handleInspectTreeShap('LAD')}
              className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#BE123C] border border-[#FFE4E6] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F43F5E]" />
                <span>View TreeSHAP Breakdown</span>
              </span>
              <ChevronRight className="w-3 h-3 text-[#BE123C]" />
            </button>
          </div>
        </div>

        {/* LCX CARD */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-t-4 border-t-[#0D9488] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
                <span className="text-xs font-mono font-bold text-[#0F766E]">
                  LCX Territory
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTierBadge(vessels.LCX?.risk_tier)}`}>
                {vessels.LCX?.risk_tier} Risk
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-3xl font-black font-mono text-[#0D9488]">
                {lcxFormatted}%
              </div>
              <div className="text-xs font-medium text-slate-600">
                Left circumflex artery
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 bg-[#0D9488]"
                style={{ width: `${Math.min(100, Number(lcxFormatted) || 0)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Lateral and posterolateral left ventricular territory through obtuse marginals.
            </p>
          </div>

          {/* Actionable Inline Links */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => handleInspectAnatomy('LCX')}
              className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Inspect in 3D Anatomy</span>
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
            <button
              onClick={() => handleInspectTreeShap('LCX')}
              className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0F766E] border border-[#CCFBF1] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>View TreeSHAP Breakdown</span>
              </span>
              <ChevronRight className="w-3 h-3 text-[#0F766E]" />
            </button>
          </div>
        </div>

        {/* RCA CARD */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-t-4 border-t-[#F97316] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                <span className="text-xs font-mono font-bold text-[#B45309]">
                  RCA Territory
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTierBadge(vessels.RCA?.risk_tier)}`}>
                {vessels.RCA?.risk_tier} Risk
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-3xl font-black font-mono text-[#F97316]">
                {rcaFormatted}%
              </div>
              <div className="text-xs font-medium text-slate-600">
                Right coronary artery
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 bg-[#F97316]"
                style={{ width: `${Math.min(100, Number(rcaFormatted) || 0)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Inferior myocardial wall, right ventricle, and conduction system supply.
            </p>
          </div>

          {/* Actionable Inline Links */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => handleInspectAnatomy('RCA')}
              className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Inspect in 3D Anatomy</span>
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
            <button
              onClick={() => handleInspectTreeShap('RCA')}
              className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] border border-[#FEF3C7] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                <span>View TreeSHAP Breakdown</span>
              </span>
              <ChevronRight className="w-3 h-3 text-[#B45309]" />
            </button>
          </div>
        </div>
      </div>

      {/* Structured Assessment Synthesis Section */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 space-y-5 border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            Assessment Results Synthesis
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Structured synthesis of vessel-level risks, target territories, and decision-support context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              High-Probability Target Vessels (≥50%)
            </span>
            <div className="flex flex-wrap gap-2">
              {summary.high_probability_vessels && summary.high_probability_vessels.length > 0 ? (
                summary.high_probability_vessels.map((v) => {
                  const vesselColor = v === 'LAD' ? '#F43F5E' : v === 'LCX' ? '#0D9488' : '#F97316';
                  return (
                    <span
                      key={v}
                      className="px-3 py-1 rounded-lg text-xs font-mono font-bold border"
                      style={{
                        backgroundColor: `${vesselColor}15`,
                        color: vesselColor,
                        borderColor: `${vesselColor}40`
                      }}
                    >
                      {v} Territory (≥50% Probability)
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-slate-600">None detected above 50% probability threshold</span>
              )}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pt-1">
              {summary.ai_assessment_summary || 'Evaluation complete across LAD, LCX, and RCA coronary arterial territories.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Educational Decision-Support Context
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {predictionData?.summary?.clinical_recommendation || 
                'Educational prototype: Model outputs provide statistical estimates based on cohort correlates. Formal diagnosis requires coronary CT angiography or invasive catheterization.'}
            </p>
            <p className="text-[11px] text-slate-500 italic border-t border-slate-200 pt-2">
              Note: This prototype does not generate medical orders or formal clinical diagnoses.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
