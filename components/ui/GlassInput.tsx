'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-xs text-[#8888aa] ml-1">{label}</label>}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555577]">
              <Icon size={16} />
            </div>
          )}
          <input
            ref={ref}
            className={`glass-input ${Icon ? 'pl-9' : ''} ${
              error ? '!border-[rgba(255,71,87,0.5)] focus:!shadow-[0_0_20px_rgba(255,71,87,0.15)]' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-[#ff4757] ml-1 mt-1">{error}</span>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
