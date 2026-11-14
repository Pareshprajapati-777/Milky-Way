import React, { useState } from 'react';
import { MILKY_WAY_DATA } from '../../data/astronomy';
import { soundEngine } from '../../utils/soundEngine';
import { Sparkles, Compass, Rocket, Orbit, Eye, Sparkle, X } from 'lucide-react';

interface MilkyWayTelemetryCardProps {
  onWarpToSolarSystem: () => void;
  isHoveredOverSun: boolean;
  onHide: () => void;
}

export const MilkyWayTelemetryCard: React.FC<MilkyWayTelemetryCardProps> = ({
  onWarpToSolarSystem,
  isHoveredOverSun,
  onHide
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'arms' | 'blackhole' | 'location'>('overview');

  return (
    <div className="w-full max-w-[440px] pointer-events-auto relative z-30 select-none animate-fadeIn transition-all">
      {/* Sci-Fi Ambient Glow Backdrop */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-35 blur-xl transition-all duration-700 pointer-events-none"
        style={{
          background: isHoveredOverSun
            ? 'radial-gradient(circle at 50% 20%, #FFD60A 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 20%, #00F5D4 0%, transparent 70%)'
        }}
      />

      {/* Main Frosted Cyber Glass Container */}
      <div className="relative rounded-2xl bg-space-950/85 backdrop-blur-2xl border border-white/15 p-5 shadow-2xl overflow-hidden font-body text-white">
        <button
          type="button"
          onClick={onHide}
          className="absolute right-3 top-3 z-20 rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Hide galaxy card"
          title="Hide galaxy card"
        >
          <X className="h-4 w-4" />
        </button>
        {/* Subtle Tech Corner Brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/30 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/30 rounded-br-lg pointer-events-none" />

        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent pointer-events-none" />

        <div className="relative z-10">
          {/* Header Title with Galactic Classification */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse shadow-neon-cyan" />
                <span className="font-mono text-[9px] font-bold tracking-widest text-cyber-cyan uppercase px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30">
                  GALACTIC SECTOR ATLAS
                </span>
              </div>
              <h2 className="font-tech text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyber-cyan tracking-wider drop-shadow-md">
                {MILKY_WAY_DATA.name}
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Type: <span className="text-cyber-yellow font-bold">{MILKY_WAY_DATA.type}</span> • {MILKY_WAY_DATA.estimatedStarsCount}
              </p>
            </div>

            {/* Warp Button */}
            <button
              onClick={() => {
                soundEngine.playWarpSwoosh();
                onWarpToSolarSystem();
              }}
              onMouseEnter={() => soundEngine.playUiHover()}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white font-tech font-bold text-xs shadow-neon-cyan hover:scale-105 active:scale-95 transition-all border border-cyan-400/40"
            >
              <Rocket className="w-4 h-4 animate-bounce" />
              <span>ENTER SOLAR SYSTEM</span>
            </button>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-space-900/90 border border-white/10 mb-3 text-[11px] font-tech font-bold">
            <button
              onClick={() => { soundEngine.playUiClick(); setActiveTab('overview'); }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'overview'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_10px_rgba(0,245,212,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>STATS</span>
            </button>
            <button
              onClick={() => { soundEngine.playUiClick(); setActiveTab('location'); }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'location'
                  ? 'bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/40 shadow-[0_0_10px_rgba(255,214,10,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>SUN (SOL)</span>
            </button>
            <button
              onClick={() => { soundEngine.playUiClick(); setActiveTab('blackhole'); }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'blackhole'
                  ? 'bg-cyber-magenta/20 text-cyber-magenta border border-cyber-magenta/40 shadow-[0_0_10px_rgba(247,37,133,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>SGR A*</span>
            </button>
            <button
              onClick={() => { soundEngine.playUiClick(); setActiveTab('arms'); }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'arms'
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ARMS</span>
            </button>
          </div>

          {/* Tab 1: Overview Stats */}
          {activeTab === 'overview' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10 shadow-inner">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">DIAMETER</span>
                  <span className="font-tech text-base font-bold text-cyber-cyan">{MILKY_WAY_DATA.diameterLy.toLocaleString()} <span className="text-xs font-normal text-gray-400">LY</span></span>
                  <span className="text-[9px] text-gray-500 block font-mono mt-0.5">~30,660 Parsecs</span>
                </div>
                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10 shadow-inner">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">ESTIMATED MASS</span>
                  <span className="font-tech text-base font-bold text-cyber-yellow">1.5 × 10¹² M☉</span>
                  <span className="text-[9px] text-gray-500 block font-mono mt-0.5">1.5 Trillion Solar Masses</span>
                </div>
                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10 shadow-inner">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">ESTIMATED AGE</span>
                  <span className="font-tech text-base font-bold text-white">{MILKY_WAY_DATA.ageBillionYears} <span className="text-xs font-normal text-gray-400">Billion Yrs</span></span>
                  <span className="text-[9px] text-gray-500 block font-mono mt-0.5">Formed near cosmic dawn</span>
                </div>
                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10 shadow-inner">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">STELLAR COUNT</span>
                  <span className="font-tech text-base font-bold text-cyber-magenta">100 - 400 B</span>
                  <span className="text-[9px] text-gray-500 block font-mono mt-0.5">Stars & Solar Systems</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-space-900/50 border border-white/10 text-xs text-gray-300 leading-relaxed font-body">
                {MILKY_WAY_DATA.overview}
              </div>
            </div>
          )}

          {/* Tab 2: Sun Location */}
          {activeTab === 'location' && (
            <div className="space-y-2.5 text-xs animate-fadeIn">
              <div className="p-3 rounded-xl bg-yellow-950/20 border border-yellow-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-tech text-cyber-yellow font-bold text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    OUR SUN (SOLAR SYSTEM)
                  </span>
                  <span className="font-mono text-[10px] text-gray-300 bg-yellow-900/50 px-2 py-0.5 rounded border border-yellow-500/25">
                    {MILKY_WAY_DATA.sunPosition.arm}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] mt-2">
                  <div className="p-2 rounded bg-space-950/60 border border-white/5">
                    <span className="text-gray-400 block text-[9px]">DISTANCE TO CORE</span>
                    <span className="text-white font-bold">{MILKY_WAY_DATA.sunPosition.distanceFromCoreLy.toLocaleString()} LY</span>
                  </div>
                  <div className="p-2 rounded bg-space-950/60 border border-white/5">
                    <span className="text-gray-400 block text-[9px]">ORBITAL VELOCITY</span>
                    <span className="text-cyber-cyan font-bold">{MILKY_WAY_DATA.sunPosition.orbitalSpeedKps} km/s</span>
                  </div>
                  <div className="p-2 rounded bg-space-950/60 border border-white/5">
                    <span className="text-gray-400 block text-[9px]">COSMIC YEAR (ORBIT)</span>
                    <span className="text-cyber-yellow font-bold">{MILKY_WAY_DATA.sunPosition.galacticYearMyr} Million Yrs</span>
                  </div>
                  <div className="p-2 rounded bg-space-950/60 border border-white/5">
                    <span className="text-gray-400 block text-[9px]">HEIGHT ABOVE PLANE</span>
                    <span className="text-white font-bold">+{MILKY_WAY_DATA.sunPosition.heightAbovePlaneLy} LY</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-space-900/60 border border-white/10 space-y-1.5">
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">HOW TO NAVIGATE:</div>
                <p className="text-xs text-gray-300 leading-relaxed font-body">
                  Look for the <span className="text-red-400 font-bold">red glowing beacon</span> and <span className="text-yellow-400 font-bold">yellow star marker</span> in the galaxy scene. Click it or tap the <span className="text-cyber-cyan font-bold">"WARP TO SOL"</span> button to zoom into the Solar System!
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Sagittarius A* */}
          {activeTab === 'blackhole' && (
            <div className="space-y-3 text-xs animate-fadeIn">
              <div className="p-3.5 rounded-xl bg-purple-950/25 border border-purple-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-tech text-purple-300 font-bold text-base">
                    {MILKY_WAY_DATA.core.blackHoleName}
                  </span>
                  <span className="font-mono text-[9px] font-bold text-cyber-magenta bg-purple-900/50 px-2 py-0.5 rounded border border-purple-400/30">
                    SUPERMASSIVE
                  </span>
                </div>
                <p className="text-gray-300 text-xs mt-2 leading-relaxed font-body">
                  {MILKY_WAY_DATA.core.description}
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px] mt-3">
                  <div className="bg-space-950/80 p-2.5 rounded-lg border border-purple-500/20">
                    <span className="text-gray-400 block text-[9px] mb-0.5">BLACK HOLE MASS</span>
                    <span className="text-cyber-magenta font-bold text-xs">{MILKY_WAY_DATA.core.blackHoleMassSolar}</span>
                  </div>
                  <div className="bg-space-950/80 p-2.5 rounded-lg border border-purple-500/20">
                    <span className="text-gray-400 block text-[9px] mb-0.5">SCHWARZSCHILD RADIUS</span>
                    <span className="text-white font-bold text-xs">{MILKY_WAY_DATA.core.radiusSchwarzschildKm}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Major Spiral Arms */}
          {activeTab === 'arms' && (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs font-body animate-fadeIn">
              {MILKY_WAY_DATA.majorArms.map((arm, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-space-900/70 border border-white/10 flex items-start gap-2.5 hover:border-white/20 transition-colors">
                  <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0 shadow-sm" style={{ backgroundColor: arm.color }} />
                  <div>
                    <span className="font-tech font-bold text-white block tracking-wide">{arm.name}</span>
                    <span className="text-gray-400 text-[11px] leading-snug block mt-0.5">{arm.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
