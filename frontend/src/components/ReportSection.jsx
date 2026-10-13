import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Heart
} from 'lucide-react';

export default function ReportSection({
  patientData,
  predictionData
}) {
  const [copied, setCopied] = useState(false);

  const cadPct = predictionData?.overall_cad?.probability != null 
    ? (predictionData.overall_cad.probability * 100).toFixed(1)
    : (predictionData?.overall_cad?.percentage ?? null);
  const ladPct = predictionData?.vessels?.LAD?.probability != null 
    ? (predictionData.vessels.LAD.probability * 100).toFixed(1)
    : (predictionData?.vessels?.LAD?.percentage ?? null);
  const lcxPct = predictionData?.vessels?.LCX?.probability != null 
    ? (predictionData.vessels.LCX.probability * 100).toFixed(1)
    : (predictionData?.vessels?.LCX?.percentage ?? null);
  const rcaPct = predictionData?.vessels?.RCA?.probability != null 
    ? (predictionData.vessels.RCA.probability * 100).toFixed(1)
    : (predictionData?.vessels?.RCA?.percentage ?? null);

  const topCadShap = predictionData?.overall_cad?.top_shap_features || [];

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `
CARDIOVISION AI - CLINICAL DECISION-SUPPORT ASSESSMENT REPORT
Date: ${new Date().toLocaleDateString()}
Report ID: CV-${Date.now().toString().slice(-6)}
Model Version: v1.0.0 (Trained on UCI ML Repository Dataset #411)

1. PATIENT BIOMARKER SUMMARY:
- Demographics: Age: ${patientData.age} years | Sex: ${patientData.sex === 1 ? 'Male' : 'Female'} | BMI: ${patientData.bmi} kg/m²
- Hemodynamics & Vitals: Systolic BP: ${patientData.systolic_bp} mmHg (Primary model input) | Diastolic BP: ${patientData.diastolic_bp} mmHg (Documentation-only) | Heart Rate: ${patientData.heart_rate} bpm
- Lipid Profile: Total Cholesterol: ${patientData.total_cholesterol} mg/dL | LDL: ${patientData.ldl} mg/dL | HDL: ${patientData.hdl} mg/dL | Triglycerides: ${patientData.triglycerides} mg/dL | FBS: ${patientData.fasting_blood_sugar} mg/dL
- Acute Cardiac Enzymes: cTnI: ${patientData.troponin_i} ng/mL | CK-MB: ${patientData.ck_mb} ng/mL (Documentation-only fields; do not alter model predictions)
- Medical Risk History: Hypertension: ${patientData.hypertension ? 'Yes' : 'No'} | Diabetes: ${patientData.diabetes ? 'Yes' : 'No'} | Smoker: ${patientData.smoking ? 'Yes' : 'No'} | Family History: ${patientData.family_history ? 'Yes' : 'No'}
- 12-Lead ECG: ST Elevation: ${patientData.st_elevation ? 'Yes' : 'No'} | T-Wave Inversion: ${patientData.t_inversion ? 'Yes' : 'No'} | LVH: ${patientData.lvh ? 'Yes' : 'No'}
- Echocardiography: LVEF: ${patientData.ejection_fraction}% | RWMA: ${patientData.region_rwma}

2. AI MODEL PREDICTIONS:
- Overall CAD Probability: ${cadPct != null ? `${cadPct}%` : 'Pending Live Assessment'}
- LAD Branch Stenosis: ${ladPct != null ? `${ladPct}%` : 'Pending Live Assessment'}
- LCX Branch Stenosis: ${lcxPct != null ? `${lcxPct}%` : 'Pending Live Assessment'}
- RCA Branch Stenosis: ${rcaPct != null ? `${rcaPct}%` : 'Pending Live Assessment'}

3. TOP MODEL-CONTRIBUTING FEATURES (TreeSHAP):
${topCadShap.slice(0, 5).map(f => `  • ${f.feature}: ${f.contribution} (${(f.shap_value || 0) >= 0 ? 'Pushes Higher' : 'Pushes Lower'})`).join('\n')}

4. TARGET LEAKAGE PREVENTION & METHODOLOGY STATEMENT:
Target variables (Cath, LAD, LCX, RCA) were strictly excluded from model input features to prevent target leakage.
Cardiac enzymes (Troponin I, CK-MB) and diastolic blood pressure are recorded for comprehensive clinical chart documentation only and do not alter model predictions or TreeSHAP attributions.

5. MANDATORY CLINICAL SAFETY NOTICE:
Research & Educational Decision-Support Prototype. Model outputs are estimates for demonstration purposes only and are not medical diagnoses or substitutes for professional evaluation or formal diagnostic imaging.
Predictions highlight vessels; they do not locate individual plaques.
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Actions */}
      <div className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              DECISION-SUPPORT REPORT
            </span>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E11D48]" />
              <span>Standardized Technical Clinical Report</span>
            </h2>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Standardized technical summary formatted for multidisciplinary review, clinical research documentation, and print export.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#E11D48] text-white hover:bg-[#BE123C] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-10 space-y-8 shadow-sm border border-slate-200">
        {/* Report Top Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center text-[#BE123C]">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight text-slate-900">CardioVision AI</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-700">
                AI-Assisted Cardiovascular Decision-Support Prototype
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs font-mono text-slate-700 space-y-0.5">
            <div>Report Ref: <strong className="text-slate-900">CV-{Date.now().toString().slice(-6)}</strong></div>
            <div>Generated: {new Date().toLocaleDateString()}</div>
            <div>Cohort Benchmark: <strong className="text-slate-900">UCI ML Repository #411</strong></div>
          </div>
        </div>

        {/* 1. Patient Biomarker Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
            1. Patient Biomarker Summary
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-600 font-medium block">Demographics</span>
              <span className="font-bold text-slate-900">{patientData.age} yrs • {patientData.sex === 1 ? 'Male' : 'Female'}</span>
              <span className="text-[11px] text-slate-700 block">BMI: {patientData.bmi} kg/m²</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-600 font-medium block">Vitals &amp; BP</span>
              <span className="font-bold text-slate-900">{patientData.systolic_bp}/{patientData.diastolic_bp} mmHg</span>
              <span className="text-[10px] text-[#1D4ED8] block font-mono font-semibold">Systolic used in model</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-600 font-medium block">Lipid Fractions</span>
              <span className="font-bold text-slate-900">LDL {patientData.ldl} • HDL {patientData.hdl}</span>
              <span className="text-[11px] text-slate-700 block">TG: {patientData.triglycerides} mg/dL</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-600 font-medium block">Echo / RWMA</span>
              <span className="font-bold text-slate-900">LVEF {patientData.ejection_fraction}%</span>
              <span className="text-[11px] text-slate-700 block">RWMA: {patientData.region_rwma}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-600 font-medium block">Cardiac Enzymes</span>
              <span className="font-bold text-slate-900">cTnI: {patientData.troponin_i} ng/mL</span>
              <span className="text-[10px] text-[#B45309] block font-mono font-semibold">Documentation-only</span>
            </div>
          </div>
        </div>

        {/* 2. Model-Estimated Stenosis Probabilities */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
            2. Model-Estimated Stenosis Probabilities
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 border-t-4 border-t-[#E11D48]">
              <span className="text-xs font-mono font-bold text-[#BE123C]">Overall CAD</span>
              <div className="text-2xl font-black font-mono text-slate-900">{cadPct != null ? `${cadPct}%` : 'Pending'}</div>
              <p className="text-[11px] text-slate-700 font-medium">Patient-level probability</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 border-t-4 border-t-[#BE123C]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BE123C]" />
                <span className="text-xs font-mono font-bold text-[#BE123C]">LAD Territory</span>
              </div>
              <div className="text-2xl font-black font-mono text-[#BE123C]">{ladPct != null ? `${ladPct}%` : 'Pending'}</div>
              <p className="text-[11px] text-slate-700 font-medium">Predicted stenosis prob</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 border-t-4 border-t-[#0F766E]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                <span className="text-xs font-mono font-bold text-[#0F766E]">LCX Territory</span>
              </div>
              <div className="text-2xl font-black font-mono text-[#0F766E]">{lcxPct != null ? `${lcxPct}%` : 'Pending'}</div>
              <p className="text-[11px] text-slate-700 font-medium">Predicted stenosis prob</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 border-t-4 border-t-[#B45309]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
                <span className="text-xs font-mono font-bold text-[#B45309]">RCA Territory</span>
              </div>
              <div className="text-2xl font-black font-mono text-[#B45309]">{rcaPct != null ? `${rcaPct}%` : 'Pending'}</div>
              <p className="text-[11px] text-slate-700 font-medium">Predicted stenosis prob</p>
            </div>
          </div>
        </div>

        {/* 3. Top Model-Contributing Features (TreeSHAP Table with perfect text wrapping) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
            3. Top Model-Contributing Features (TreeSHAP)
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left border-collapse table-auto">
              <thead className="bg-slate-50 text-slate-700 font-mono text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Feature Name</th>
                  <th className="py-2.5 px-4 font-bold">Attribution (SHAP)</th>
                  <th className="py-2.5 px-4 font-bold">Direction</th>
                  <th className="py-2.5 px-4 font-bold">Clinical &amp; Mathematical Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {topCadShap.length > 0 ? (
                  topCadShap.slice(0, 5).map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 break-words whitespace-normal max-w-[200px]">
                        {f.feature}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {f.contribution}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                          (f.shap_value || 0) >= 0 
                            ? 'bg-[#FFF1F2] text-[#BE123C] border border-[#FFE4E6]' 
                            : 'bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]'
                        }`}>
                          {(f.shap_value || 0) >= 0 ? '+ Pushes Higher' : '- Pushes Lower'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-[11px] leading-relaxed break-words whitespace-normal max-w-[340px]">
                        Additive local attribution derived from trained Random Forest ensemble on the UCI cohort.
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-center text-slate-600 italic">
                      Awaiting live patient evaluation to compute TreeSHAP feature contributions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Target Leakage Protection & Methodology Statement */}
        <div className="space-y-2 text-xs text-slate-700 border-t border-slate-200 pt-5 leading-relaxed">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
            4. Methodology &amp; Target Leakage Prevention Statement
          </h4>
          <p>
            <strong className="text-slate-900">Target variables (Cath, LAD, LCX, RCA) were strictly excluded from model input features to prevent target leakage.</strong> The predictive architecture utilizes 60 non-invasive clinical and ECG biomarkers trained with Stratified 5-Fold Cross-Validation on the UCI Z-Alizadeh Sani extension cohort (Repository #411).
          </p>
          <p className="text-[11px]">
            <strong>Input Mapping Disclosure:</strong> Cardiac biomarkers (<em className="font-semibold text-slate-900">Troponin I, CK-MB</em>) and diastolic blood pressure are recorded for clinical documentation only and do not alter model predictions or TreeSHAP explanations.
          </p>
        </div>

        {/* 5. Persistent Visible Disclaimer */}
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] text-xs text-[#92400E] space-y-1.5 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 text-[#B45309]">
            <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />
            <span>MANDATORY CLINICAL SAFETY NOTICE</span>
          </div>
          <p>
            Research &amp; Educational Decision-Support Prototype. Model outputs are estimates for demonstration purposes only and are not medical diagnoses or substitutes for professional evaluation or formal diagnostic imaging.
          </p>
          <p className="text-[11px] text-[#92400E]">
            Predictions highlight vessels; they do not locate individual plaques.
          </p>
        </div>
      </div>
    </div>
  );
}
