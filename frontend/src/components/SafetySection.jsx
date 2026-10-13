import React from 'react';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  FileCheck,
  ExternalLink,
  Heart,
  Scale
} from 'lucide-react';

export default function SafetySection() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 space-y-3 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]">
            CLINICAL SAFETY &amp; ETHICS
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Clinical Safety, Governance &amp; Attributions
          </h2>
        </div>
        <p className="text-xs text-slate-700 max-w-3xl leading-relaxed">
          CardioVision AI is intentionally designed to elevate scientific credibility, ML transparency, and clinical safety above mere visual aesthetics.
        </p>
      </div>

      {/* Persistent Disclaimer Deep-Dive */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 border-l-4 border-l-amber-500 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <AlertTriangle className="w-5 h-5 text-[#B45309]" />
          <h3 className="text-base font-bold">Persistent Safety Mandate</h3>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] text-xs text-[#92400E] space-y-2 leading-relaxed">
          <p className="font-bold text-sm">
            &ldquo;Research &amp; Educational Decision-Support Prototype. Model outputs are estimates for demonstration purposes only and are not medical diagnoses or substitutes for professional evaluation or formal diagnostic imaging.&rdquo;
          </p>
          <p className="text-slate-800">
            CardioVision AI does not provide definitive medical diagnoses, does not prescribe pharmaceutical interventions, and does not replace coronary angiography, intravascular ultrasound (IVUS), or fractional flow reserve (FFR).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900">What This System Does:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Computes statistical probabilities of significant stenosis (&ge;50%).</li>
              <li>Maps risk estimates to coronary arterial territories (LAD, LCX, RCA).</li>
              <li>Provides transparent, additive TreeSHAP feature attributions.</li>
              <li>Strictly prevents target leakage by excluding outcome proxies.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900">What This System Does NOT Do:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Does not detect physical plaque coordinates or intravascular morphology.</li>
              <li>Does not recommend invasive revascularization (PCI / CABG).</li>
              <li>Does not generate unverified medical claims or hardcoded metrics.</li>
              <li>Does not replace formal cardiovascular clinical judgment.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Attributions & Licenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3D MODEL ATTRIBUTION */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#BE123C]" />
            <span>3D Anatomical Model License &amp; Attribution</span>
          </h3>
          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <p>
              <strong className="text-slate-900">Asset:</strong> Procedurally synthesized 3D Heart Mesh (<code className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">heart.glb</code>) generated via custom Three.js computational script (<code className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">frontend/scripts/generate_heart_model.mjs</code>).
            </p>
            <p>
              <strong className="text-slate-900">License:</strong> Open-source MIT License under this repository (no external CC-BY third-party dependencies).
            </p>
            <p>
              <strong className="text-slate-900">Coronary Sulcus Alignment:</strong> Target vessels LAD, LCX, and RCA are registered along their respective anatomical grooves (anterior interventricular, circumflex atrioventricular, and right atrioventricular sulci).
            </p>
            <p className="text-[11px] text-slate-600 italic">
              <strong>Disclaimer:</strong> Geometry reflects standard human macroscopic coronary anatomy. Vessel highlights denote statistical model predictions, not directly measured endovascular plaque.
            </p>
          </div>
        </div>

        {/* DATASET CITATION */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1D4ED8]" />
            <span>Dataset &amp; Scientific Literature Citations</span>
          </h3>
          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <p>
              <strong className="text-slate-900">UCI Machine Learning Repository:</strong> Alizadehsani, R., et al. (2013, 2018). <em>Extension of Z-Alizadeh Sani Dataset</em> (Dataset ID: 411).
            </p>
            <p>
              <strong className="text-slate-900">Explainability:</strong> Lundberg, S. M., &amp; Lee, S.-I. (2017). <em>A Unified Approach to Interpreting Model Predictions</em>. Advances in Neural Information Processing Systems (NeurIPS).
            </p>
            <p>
              <strong className="text-slate-900">Gradient Boosting:</strong> Chen, T., &amp; Guestrin, C. (2016). <em>XGBoost: A Scalable Tree Boosting System</em>. ACM SIGKDD.
            </p>
            <p>
              <strong className="text-slate-900">Ensemble Learning:</strong> Breiman, L. (2001). <em>Random Forests</em>. Machine Learning, 45(1), 5-32.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
