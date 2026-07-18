'use client';

import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({ 
  children, 
  variant = 'default',
  className = ''
}) => {
  
  let variantClass = '';
  switch (variant) {
    case 'primary':
      variantClass = 'bg-[#8b5cf6]/20 border-[#8b5cf6]/40 text-[#a78bfa]';
      break;
    case 'success':
      variantClass = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
      break;
    case 'warning':
      variantClass = 'bg-[#fbbf24]/20 border-[#fbbf24]/40 text-[#fcd34d]';
      break;
    case 'danger':
      variantClass = 'bg-[#ff4757]/20 border-[#ff4757]/40 text-[#ff6b81]';
      break;
    case 'info':
      variantClass = 'bg-[#00d4ff]/20 border-[#00d4ff]/40 text-[#22d3ee]';
      break;
    default:
      variantClass = 'bg-white/5 border-white/10 text-[#8888aa]';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.2)] ${variantClass} ${className}`}>
      {children}
    </span>
  );
};
