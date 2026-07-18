'use client';

import React from 'react';

type CardVariant = 'glass' | 'glass-elevated' | 'glass-subtle';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: string;
  children: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'glass', padding = 'p-6', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variant} ${padding} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
