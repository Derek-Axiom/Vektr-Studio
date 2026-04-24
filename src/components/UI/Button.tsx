import React from 'react';
import { cn } from '../../lib/utils';

export interface StudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const StudioButton = ({ children, variant = 'primary', className, ...props }: StudioButtonProps) => (
  <button 
    {...props}
    className={cn(
      "inline-flex h-[48px] items-center justify-center rounded-[12px] px-6",
      "text-[11px] font-bold uppercase tracking-[0.18em] transition-all",
      variant === 'primary' 
        ? "bg-white/5 border border-white/10 text-[var(--color-text)] hover:bg-white/10" 
        : "bg-transparent text-[var(--color-text)] hover:text-[var(--color-text)]",
      className
    )}
  >
    {children}
  </button>
);
