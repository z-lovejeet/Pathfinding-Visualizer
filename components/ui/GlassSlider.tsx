'use client';

import React from 'react';

interface GlassSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
}

export const GlassSlider = React.forwardRef<HTMLInputElement, GlassSliderProps>(
  ({ label, showValue, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {(label || showValue) && (
          <div className="flex justify-between items-center text-xs text-[#8888aa]">
            {label && <span>{label}</span>}
            {showValue && <span>{props.value}</span>}
          </div>
        )}
        <input
          type="range"
          ref={ref}
          className={`glass-slider ${className}`}
          {...props}
        />
      </div>
    );
  }
);

GlassSlider.displayName = 'GlassSlider';
