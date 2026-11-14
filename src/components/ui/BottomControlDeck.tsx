import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Camera,
  Layers,
  ChevronRight,
  Clock,
  Gauge
} from 'lucide-react';
import { CELESTIAL_BODIES, CELESTIAL_ORDER, CelestialBodyData } from '../../data/astronomy';
import { ViewMode } from '../3d/CameraController';
import { ScaleMode } from '../../utils/astronomicalUnits';
import { soundEngine } from '../../utils/soundEngine';

interface BottomControlDeckProps {
  timeScale: number;
  setTimeScale: (scale: number) => void;
  selectedBodyId: string | null;
  onSelectBody: (body: CelestialBodyData) => void;
  viewMode: ViewMode;
  scaleMode: ScaleMode;
  onReturnToGalaxy: () => void;
  onWarpToSolar: () => void;
  onScreenshot: () => void;
  onResetSimulation?: () => void;
}

export const BottomControlDeck: React.FC<BottomControlDeckProps> = ({
  timeScale,
  setTimeScale,
  selectedBodyId,
  onSelectBody,
  viewMode,
  scaleMode,
  onReturnToGalaxy,
  onWarpToSolar,
  onScreenshot,
  onResetSimulation
}) => {
  const isPlaying = timeScale > 0;
  const speedPresets = [0.2, 1, 5, 20, 100];

  // Persistent astronomical scale ruler text
  const getScaleRulerText = () => {
    if (viewMode === 'galaxy') {
      return { ruler: '|──────────── 10,000 LIGHT-YEARS (3.07 kpc) ────────────|', lightTime: 'Light travel: ~10,000 Earth Years' };
    }
    if (viewMode === 'warp_to_solar' || viewMode === 'warp_to_galaxy') {
      return { ruler: '|─── RELATIVISTIC TRANSIT: 0.9998 c (SCALE COMPRESSION) ───|', lightTime: 'Interstellar Flight Corridor' };
    }
    if (viewMode === 'solar') {
      return { ruler: '|──────────── 10 AU (1.496 BILLION KM) ────────────|', lightTime: 'Light travel: ~83.2 Minutes' };
    }
    // Planet mode
    return { ruler: '|──────────── 10,000 KM (TERRESTRIAL SCALE) ────────────|', lightTime: 'Light travel: ~33.3 Milliseconds' };
  };

  const { ruler, lightTime } = getScaleRulerText();

  return (
    <div className="fixed bottom-3 inset-x-0 z-30 flex flex-col items-center gap-1.5 px-4 pointer-events-auto select-none font-tech">
      {/* 1. Quick Celestial Body Selector Strip (when inside Solar System or Planet view) */}
      {viewMode !== 'galaxy' && viewMode !== 'warp_to_galaxy' && (
        <div className="w-full max-w-4xl flex items-center justify-start md:justify-center gap-1.5 overflow-x-auto pb-1 scrollbar-none animate-fadeIn">
          {CELESTIAL_ORDER.map((id) => {
            const body = CELESTIAL_BODIES[id];
            const isSelected = selectedBodyId === id;

            return (
              <button
                key={id}
                onClick={() => {
                  soundEngine.playPlanetResonance(body.soundFrequencyHz);
                  onSelectBody(body);
                }}
                onMouseEnter={() => soundEngine.playUiHover()}
                className={`group flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-200 backdrop-blur-xl shrink-0 text-xs ${
                  isSelected
                    ? 'bg-space-900 border-cyber-cyan shadow-[0_0_15px_rgba(0,245,212,0.4)] scale-105'
                    : 'bg-space-950/80 border-white/10 hover:border-white/30 hover:bg-space-900/90 text-gray-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: body.accentColor }}
                />
                <span className="font-bold tracking-wider">{body.name.split(' ')[0].toUpperCase()}</span>
                {isSelected && (
                  <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/80 px-1 rounded">
                    LOCKED
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Main Scientific Deck & Persistent Scale Ruler */}
      <div className="w-full max-w-4xl rounded-2xl bg-space-950/85 border border-white/10 backdrop-blur-2xl px-5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Scientific Timeline Navigation (Milky Way -> Solar System -> Planet) */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onReturnToGalaxy();
            }}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
              viewMode === 'galaxy'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,245,212,0.25)]'
                : 'text-gray-400 hover:text-white border-transparent hover:border-white/10'
            }`}
          >
            <span>1. MILKY WAY</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />

          <button
            onClick={() => {
              soundEngine.playUiClick();
              if (viewMode === 'galaxy') onWarpToSolar();
            }}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
              viewMode === 'solar'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,245,212,0.25)]'
                : 'text-gray-400 hover:text-white border-transparent hover:border-white/10'
            }`}
          >
            <span>2. SOLAR SYSTEM</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />

          <span
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              viewMode === 'planet' || viewMode === 'moon'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,245,212,0.25)]'
                : 'text-gray-600 border-transparent'
            }`}
          >
            3. {selectedBodyId ? selectedBodyId.toUpperCase() : 'PLANETARY'}
          </span>
        </div>

        {/* Center: Persistent Scale Indicator & Metric Reference */}
        <div className="hidden lg:flex flex-col items-center justify-center font-mono text-[10px] text-cyan-300/80">
          <span className="tracking-widest font-semibold text-white drop-shadow-[0_0_8px_rgba(0,245,212,0.3)]">
            {ruler}
          </span>
          <span className="text-[9px] text-gray-400 tracking-tight">
            {lightTime} • Scale: {scaleMode === 'enhanced' ? 'Log-Compressed' : '1:1 True Physical'}
          </span>
        </div>

        {/* Right: Simulation Controls (Play/Pause, Timestep Speed, Screenshot) */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setTimeScale(isPlaying ? 0 : 1);
            }}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              isPlaying
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
            }`}
            title={isPlaying ? 'Pause Simulation (Space)' : 'Resume Simulation (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Reset Epoch (t = 0) */}
          {onResetSimulation && (
            <button
              onClick={() => {
                soundEngine.playUiClick();
                onResetSimulation();
              }}
              className="p-2 rounded-xl border border-white/10 bg-space-900/80 hover:bg-space-800 text-gray-400 hover:text-white transition-all flex items-center justify-center"
              title="Reset Simulation Time to Epoch J2000 (R)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Speed Presets */}
          <div className="flex items-center bg-space-900/80 p-0.5 rounded-xl border border-white/10 text-xs">
            {speedPresets.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  soundEngine.playUiClick();
                  setTimeScale(speed);
                }}
                className={`px-2 py-1 rounded-lg font-mono text-[10px] transition-all ${
                  timeScale === speed
                    ? 'bg-cyan-500 text-black font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Screenshot Capture */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onScreenshot();
            }}
            className="p-2 rounded-xl bg-space-900/80 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-all"
            title="Capture High-Res Observatory Frame"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
