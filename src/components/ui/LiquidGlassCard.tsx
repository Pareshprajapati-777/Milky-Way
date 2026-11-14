import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: 'cyan' | 'gold' | 'red' | 'purple' | 'none';
  variant?: 'panel' | 'pill' | 'hud';
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  className,
  glowColor = 'cyan',
  variant = 'panel',
  ...props
}) => {
  const glowStyles = {
    cyan: 'border-cyber-cyan/30 shadow-[0_8px_32px_0_rgba(0,245,212,0.12)] hover:border-cyber-cyan/60',
    gold: 'border-cyber-yellow/30 shadow-[0_8px_32px_0_rgba(255,214,10,0.12)] hover:border-cyber-yellow/60',
    red: 'border-cyber-red/30 shadow-[0_8px_32px_0_rgba(255,59,48,0.15)] hover:border-cyber-red/60',
    purple: 'border-cyber-purple/30 shadow-[0_8px_32px_0_rgba(123,44,191,0.15)] hover:border-cyber-purple/60',
    none: 'border-white/15'
  }[glowColor];

  const variantStyles = {
    panel: 'rounded-2xl bg-space-950/80 backdrop-blur-2xl p-5 border',
    pill: 'rounded-full bg-space-900/85 backdrop-blur-xl px-4 py-2 border',
    hud: 'rounded-xl bg-space-950/90 backdrop-blur-3xl p-4 border border-cyan-500/25 relative overflow-hidden'
  }[variant];

  return (
    <div
      className={twMerge(
        'transition-all duration-300 relative text-white shadow-glass-edge',
        variantStyles,
        glowStyles,
        className
      )}
      {...props}
    >
      {/* Specular Top-Edge Ambient Light Rim */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      {/* Internal Content */}
      {children}
    </div>
  );
};
