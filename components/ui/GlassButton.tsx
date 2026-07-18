'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'default' | 'primary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  loading?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ variant = 'default', size = 'md', icon: Icon, loading, className = '', children, disabled, ...props }, ref) => {
    
    let variantClass = 'glass-button';
    if (variant === 'primary') variantClass += ' glass-button-primary';
    if (variant === 'danger') variantClass += ' glass-button-danger';
    if (variant === 'ghost') variantClass += ' glass-button-ghost';
    
    let sizeClass = '';
    if (size === 'sm') sizeClass = 'text-xs px-3 py-1.5';
    if (size === 'lg') sizeClass = 'text-base px-6 py-3';

    return (
      <button
        ref={ref}
        className={`${variantClass} ${sizeClass} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : Icon ? (
          <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className={children ? 'mr-2' : ''} />
        ) : null}
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
