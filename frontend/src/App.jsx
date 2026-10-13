import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Component Imports
import DisclaimerBanner from './components/DisclaimerBanner';
import Navbar from './components/Navbar';
import HomeSection from './components/HomeSection';
import AssessmentSection, { DEMO_SCENARIOS } from './components/AssessmentSection';
import AnalysisSection from './components/AnalysisSection';
import AnatomySection from './components/AnatomySection';
import ExplainabilitySection from './components/ExplainabilitySection';
import PerformanceSection from './components/PerformanceSection';
import MethodologySection from './components/MethodologySection';
import ReportSection from './components/ReportSection';
import SafetySection from './components/SafetySection';

const API_BASE = '/api';

const getSectionFromUrl = () => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  if (path === '3d-anatomy' || path === 'anatomy') return 'anatomy';
  if (['home', 'assessment', 'analysis', 'explainability', 'performance', 'methodology', 'report', 'safety'].includes(path)) {
    return path;
  }
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  if (hash === '3d-anatomy' || hash === 'anatomy') return 'anatomy';
  if (['home', 'assessment', 'analysis', 'explainability', 'performance', 'methodology', 'report', 'safety'].includes(hash)) {
    return hash;
  }
  return 'home';
};

export default function App() {
  // Navigation State with URL & History sync (e.g. /3d-anatomy)
  const [activeSection, setActiveSectionState] = useState(getSectionFromUrl);

  const setActiveSection = (section) => {
    setActiveSectionState(section);
    if (typeof window !== 'undefined') {
      const targetPath = section === 'anatomy' ? '/3d-anatomy' : section === 'home' ? '/' : `/${section}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveSectionState(getSectionFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Selected Target Vessel for 3D and Inspector
  const [selectedVessel, setSelectedVessel] = useState('LAD');

  // Patient Input State (Initializes with Demo Scenario 1)
  const [patientData, setPatientData] = useState(DEMO_SCENARIOS.scenario1.data);

  // Status & API State
  const [apiConnected, setApiConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Backend Metadata & Metrics Cache
  const [metricsData, setMetricsData] = useState(null);
  const [methodologyData, setMethodologyData] = useState(null);
  const [featuresCatalog, setFeaturesCatalog] = useState(null);
  const [modelCardData, setModelCardData] = useState(null);

  // Predictions State: null on initial load until live assessment is run
  const [predictionData, setPredictionData] = useState(null);
  const [predictionError, setPredictionError] = useState(null);

  // Permanent hospital-grade light theme: ensure dark class is removed
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('cardiovision_theme');
  }, []);

  // Fetch metrics, methodology, and features from backend on mount
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [healthRes, metricsRes, methodRes, featRes, cardRes] = await Promise.all([
          axios.get(`${API_BASE}/`, { timeout: 3000 }),
          axios.get(`${API_BASE}/metrics`, { timeout: 3000 }),
          axios.get(`${API_BASE}/methodology`, { timeout: 3000 }),
          axios.get(`${API_BASE}/features`, { timeout: 3000 }),
          axios.get(`${API_BASE}/model-card`, { timeout: 3000 }).catch(() => null)
        ]);

        if (healthRes.data?.status === 'healthy') {
          setApiConnected(true);
        }
        if (metricsRes.data?.status === 'available') {
          setMetricsData(metricsRes.data);
        }
        if (methodRes.data) {
          setMethodologyData(methodRes.data);
        }
        if (featRes.data) {
          setFeaturesCatalog(featRes.data);
        }
        if (cardRes?.data) {
          setModelCardData(cardRes.data);
        }
      } catch (err) {
        console.warn('API connection check failed, using cached authentic models:', err.message);
        setApiConnected(false);
      }
    };

    fetchBackendData();
    const interval = setInterval(fetchBackendData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle patient input adjustments
  const handlePatientChange = (field, value) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Run AI Assessment using live ML backend
  const runAssessment = async (overrideData = null, targetSection = 'analysis') => {
    const dataToUse = overrideData || patientData;
    if (overrideData) {
      setPatientData(overrideData);
    }
    setIsAnalyzing(true);
    setPredictionError(null);
    try {
      const payload = {
        age: Number(dataToUse.age),
        sex: Number(dataToUse.sex),
        bmi: Number(dataToUse.bmi),
        smoking: Number(dataToUse.smoking),
        diabetes: Number(dataToUse.diabetes),
        hypertension: Number(dataToUse.hypertension),
        family_history: Number(dataToUse.family_history),
        systolic_bp: Number(dataToUse.systolic_bp),
        diastolic_bp: Number(dataToUse.diastolic_bp),
        heart_rate: Number(dataToUse.heart_rate),
        total_cholesterol: Number(dataToUse.total_cholesterol),
        ldl: Number(dataToUse.ldl),
        hdl: Number(dataToUse.hdl),
        triglycerides: Number(dataToUse.triglycerides),
        fasting_blood_sugar: Number(dataToUse.fasting_blood_sugar),
        troponin_i: Number(dataToUse.troponin_i),
        ck_mb: Number(dataToUse.ck_mb),
        st_elevation: Number(dataToUse.st_elevation),
        t_inversion: Number(dataToUse.t_inversion),
        lvh: Number(dataToUse.lvh),
        ejection_fraction: Number(dataToUse.ejection_fraction),
        region_rwma: dataToUse.region_rwma || 'None'
      };

      const res = await axios.post(`${API_BASE}/predict`, payload, { timeout: 8000 });
      setPredictionData(res.data);
      setApiConnected(true);
      if (targetSection) {
        setActiveSection(targetSection);
      }
    } catch (err) {
      console.error('Error calling /predict endpoint:', err);
      // Strictly non-prescriptive: clear prediction state so stale SHAP explanations are not retained
      setPredictionData(null);
      let errorMsg = 'Patient-specific explanation unavailable because the model service could not be reached.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = 'Validation Error: ' + err.response.data.detail.map(d => `${d.loc?.slice(-1)[0] || 'field'}: ${d.msg}`).join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        }
      }
      setPredictionError(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* 1. Persistent Visible Clinical Disclaimer */}
      <DisclaimerBanner onNavigate={setActiveSection} />

      {/* 2. Top Header & Navigation */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        apiConnected={apiConnected}
        isAnalyzing={isAnalyzing}
        onRunAssessment={runAssessment}
      />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {predictionError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
            <span>{predictionError}</span>
            <button onClick={() => setPredictionError(null)} className="font-bold text-sm px-1.5 hover:text-rose-900 cursor-pointer">×</button>
          </div>
        )}

        {activeSection === 'home' && (
          <HomeSection
            onNavigate={(sec) => setActiveSection(sec)}
            onRunAssessment={runAssessment}
            metricsData={metricsData}
            predictionData={predictionData}
          />
        )}

        {activeSection === 'assessment' && (
          <AssessmentSection
            patientData={patientData}
            onChange={handlePatientChange}
            onReset={(defaultData) => {
              setPatientData(defaultData);
              setPredictionData(null);
            }}
            onRunAssessment={runAssessment}
            isAnalyzing={isAnalyzing}
          />
        )}

        {activeSection === 'analysis' && (
          <AnalysisSection
            predictionData={predictionData}
            onNavigate={(sec) => setActiveSection(sec)}
            onSelectVessel={(v) => setSelectedVessel(v)}
          />
        )}

        {activeSection === 'anatomy' && (
          <AnatomySection
            predictionData={predictionData}
            selectedVessel={selectedVessel}
            onSelectVessel={(v) => setSelectedVessel(v)}
            onNavigate={(sec) => setActiveSection(sec)}
          />
        )}

        {activeSection === 'explainability' && (
          <ExplainabilitySection
            predictionData={predictionData}
            predictionError={predictionError}
            selectedVessel={selectedVessel}
            onSelectVessel={(v) => setSelectedVessel(v)}
            onNavigate={(sec) => setActiveSection(sec)}
          />
        )}

        {activeSection === 'performance' && (
          <PerformanceSection
            metricsData={metricsData}
            modelCardData={modelCardData}
            onRefreshMetrics={() => {
              axios.get(`${API_BASE}/metrics`).then(r => setMetricsData(r.data));
              axios.get(`${API_BASE}/model-card`).then(r => setModelCardData(r.data));
            }}
          />
        )}

        {activeSection === 'methodology' && (
          <MethodologySection
            methodologyData={methodologyData}
            featuresCatalog={featuresCatalog}
            modelCardData={modelCardData}
          />
        )}

        {activeSection === 'report' && (
          <ReportSection
            patientData={patientData}
            predictionData={predictionData}
          />
        )}

        {activeSection === 'safety' && (
          <SafetySection />
        )}
      </main>

      {/* 4. Global Scientific Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CardioVision AI</span>
            <span>•</span>
            <span className="text-slate-600">Cardiovascular AI Research Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-600">
            <span>UCI Dataset ID: 411</span>
            <span>•</span>
            <span>TreeSHAP Interpretability</span>
            <span>•</span>
            <button onClick={() => setActiveSection('methodology')} className="hover:underline text-[#0D9488] font-medium cursor-pointer">Methodology</button>
            <span>•</span>
            <button onClick={() => setActiveSection('safety')} className="hover:underline text-slate-600 cursor-pointer">Safety &amp; Ethics</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

