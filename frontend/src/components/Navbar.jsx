import React, { useState } from 'react';
import {
  Heart,
  Home,
  ClipboardEdit,
  Activity,
  Sparkles,
  BarChart3,
  GitBranch,
  FileText,
  Shield,
  Play,
  Menu,
  X,
  Loader2
} from 'lucide-react';

export const SECTIONS = [
  { id: 'home', label: 'Overview', icon: Home },
  { id: 'assessment', label: 'Assessment', icon: ClipboardEdit },
  { id: 'analysis', label: 'Results', icon: Activity },
  { id: 'anatomy', label: '3D Anatomy', icon: Heart },
  { id: 'explainability', label: 'Explainability', icon: Sparkles },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'methodology', label: 'Methodology', icon: GitBranch },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'safety', label: 'Safety', icon: Shield },
];

export default function Navbar({
  activeSection,
  setActiveSection,
  apiConnected,
  isAnalyzing,
  onRunAssessment
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const handlePrimaryCta = () => {
    if (onRunAssessment) {
      onRunAssessment(null, 'analysis');
    } else {
      setActiveSection('assessment');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Mark & Identity */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-[#E11D48] fill-[#E11D48]/15 group-hover:fill-[#E11D48] transition-all" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[15px] sm:text-base tracking-tight text-slate-900">
                  CardioVision AI
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-600 leading-tight">
                Cardiovascular Decision-Support
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live ML Engine Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium border bg-slate-50 border-slate-200 text-slate-700 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${apiConnected ? 'bg-emerald-500' : 'bg-[#E11D48]'}`} />
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-700">
                {apiConnected ? 'ML Engine Online' : 'ML Engine Offline'}
              </span>
            </div>

            {/* Primary Action Button: Run AI Assessment */}
            <button
              onClick={handlePrimaryCta}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60 active:scale-98 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden xs:inline">Run AI Assessment</span>
                  <span className="xs:hidden">Run AI</span>
                </>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none border-t border-slate-100">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => handleNavClick(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all select-none cursor-pointer ${
                  isActive
                    ? 'bg-[#FFF1F2] text-[#BE123C] font-semibold border border-[#FFE4E6] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E11D48]' : 'text-slate-500'}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Responsive Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 grid grid-cols-2 gap-1.5">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => handleNavClick(sec.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#FFF1F2] text-[#BE123C] font-semibold border border-[#FFE4E6]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E11D48]' : 'text-slate-500'}`} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
