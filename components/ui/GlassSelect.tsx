'use client';

import React from 'react';

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  label?: string;
}

export const GlassSelect = React.forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ options, label, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-xs text-[#8888aa] ml-1">{label}</label>}
        <select
          ref={ref}
          className={`glass-select ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a0f] text-[#f0f0f5]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';
