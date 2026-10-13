import React from 'react';
import { ArrowRight, ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner({ onNavigate }) {
  return (
    <div className="bg-[#FFFBEB] border-b border-[#FEF3C7] text-[#92400E] px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 min-w-0">
          <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5 sm:mt-0" />
          <p className="font-medium text-[11px] sm:text-xs leading-snug">
            <span className="font-bold text-[#78350F]">Research &amp; Educational Decision-Support Prototype.</span>{' '}
            Model outputs are estimates for demonstration purposes only and are not medical diagnoses or substitutes for professional evaluation or formal diagnostic imaging.
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('safety')}
            className="text-[11px] font-semibold text-[#78350F] hover:text-[#451A03] flex items-center gap-1 shrink-0 underline-offset-2 hover:underline transition-colors whitespace-nowrap self-end sm:self-auto cursor-pointer"
          >
            <span>Safety Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
