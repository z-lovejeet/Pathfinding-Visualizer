'use client';

import React from 'react';

interface GlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const GlassToggle: React.FC<GlassToggleProps> = ({ 
  checked, 
  onChange, 
  label,
  disabled = false
}) => {
  return (
    <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ease-in-out ${checked ? 'bg-[#00d4ff]/40' : 'bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] backdrop-blur-md'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${checked ? 'transform translate-x-4 shadow-[0_0_10px_#00d4ff]' : ''}`}></div>
      </div>
      {label && <div className="ml-3 text-[#f0f0f5] text-sm font-medium">{label}</div>}
    </label>
  );
};
