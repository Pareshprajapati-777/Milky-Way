import React from 'react';
import { soundEngine } from '../../utils/soundEngine';

interface LiquidLogoProps {
  onHomeClick: () => void;
}

export const LiquidLogo: React.FC<LiquidLogoProps> = ({ onHomeClick }) => {
  return (
    <div
      onClick={() => {
        soundEngine.playUiClick();
        onHomeClick();
      }}
      className="group cursor-pointer flex items-center gap-3 select-none"
      title="Return to Milky Way Galaxy Overview"
    >
      {/* Dynamic Earth Emblem Capsule */}
      <div className="relative w-11 h-11 flex items-center justify-center">
        {/* Atmosphere Glow Halo */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-cyber-cyan blur-md opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 animate-pulse" />

        {/* Liquid Glass Capsule Base */}
        <div className="relative w-11 h-11 rounded-2xl bg-space-950/90 border border-cyan-400/40 backdrop-blur-xl flex items-center justify-center overflow-hidden shadow-glass-edge group-hover:border-cyan-300 transition-colors">
          {/* Subtle rotating cyber radar grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.15),transparent_70%)] group-hover:rotate-90 transition-transform duration-1000" />

          {/* Earth Logo (Configured Earth Cutout) */}
          <img
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202005_3346cc4d-ec3b-44ab-825c-b18e49f5021a.png"
            alt="Earth Logo"
            className="w-8 h-8 object-contain filter drop-shadow-[0_0_8px_rgba(0,245,212,0.6)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 animate-spin-slow"
          />

          {/* Glass Specular Sheen */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20 pointer-events-none rounded-2xl" />
        </div>
      </div>

      {/* Project Brand Typography - ONLY "MILKY WAY" */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-tech font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyber-cyan group-hover:from-white group-hover:via-cyan-200 group-hover:to-cyan-300 transition-all drop-shadow-[0_0_12px_rgba(0,245,212,0.35)]">
            MILKY WAY
          </span>
          <span className="font-tech text-[10px] text-cyber-cyan font-bold px-1.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-400/30 shadow-[0_0_10px_rgba(0,245,212,0.2)] tracking-wider">
            3D
          </span>
        </div>
        <span className="font-mono text-[9px] text-cyan-200/60 tracking-widest uppercase">
          SOLAR SYSTEM ATLAS
        </span>
      </div>
    </div>
  );
};

