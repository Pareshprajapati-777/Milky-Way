import React from 'react';
import { LiquidLogo } from './LiquidLogo';
import { Search, Volume2, VolumeX, Terminal } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

interface HeaderNavProps {
  showDebugHUD: boolean;
  onToggleDebugHUD: () => void;
  onSelectGalaxy: () => void;
  onOpenSearch: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  showDebugHUD,
  onToggleDebugHUD,
  onSelectGalaxy,
  onOpenSearch,
  isMuted,
  setIsMuted
}) => {
  return (
    <header className="w-full flex items-center justify-between gap-4 px-6 py-3.5 pointer-events-auto select-none font-tech">
      {/* 1. Left: Observatory Brand Logo */}
      <LiquidLogo onHomeClick={onSelectGalaxy} />

      {/* 2. Right: Debug HUD, Audio & Omnibar */}
      <div className="flex items-center gap-2">
        {/* Scientific Debug HUD Toggle */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            onToggleDebugHUD();
          }}
          className={`p-2 rounded-xl border transition-all ${
            showDebugHUD
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
              : 'bg-space-950/80 border-white/10 text-gray-400 hover:text-white hover:border-white/25'
          }`}
          title="Toggle Scientific Validation HUD (~)"
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Search Omnibar Trigger */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            onOpenSearch();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-space-950/80 backdrop-blur-md border border-white/15 text-xs text-gray-300 hover:text-white hover:border-cyber-cyan hover:shadow-[0_0_12px_rgba(0,245,212,0.3)] transition-all"
        >
          <Search className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="hidden sm:inline font-mono text-[11px]">Cosmos</span>
          <kbd className="hidden lg:inline px-1.5 py-0.5 text-[9px] font-mono font-bold text-gray-400 bg-space-900 border border-white/10 rounded">
            Ctrl+K
          </kbd>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() => {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            soundEngine.setMuted(nextMuted);
            if (!nextMuted) soundEngine.startAmbientDrone();
          }}
          className="p-2 rounded-xl bg-space-950/80 border border-white/15 text-gray-400 hover:text-white hover:border-white/30 transition-all"
          title={isMuted ? 'Unmute Ambient Sound (M)' : 'Mute Ambient Sound (M)'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyber-cyan" />}
        </button>
      </div>
    </header>
  );
};
