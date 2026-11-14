import React from 'react';
import { CELESTIAL_BODIES, CELESTIAL_ORDER, CelestialBodyData } from '../../data/astronomy';
import { LiquidGlassCard } from './LiquidGlassCard';
import { soundEngine } from '../../utils/soundEngine';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Eye,
  Camera,
  Compass,
  Layers,
  CircleDot,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ControlCockpitProps {
  timeScale: number;
  setTimeScale: (scale: number) => void;
  selectedBodyId: string | null;
  onSelectBody: (body: CelestialBodyData) => void;
  showOrbits: boolean;
  setShowOrbits: React.Dispatch<React.SetStateAction<boolean>>;
  showMoons: boolean;
  setShowMoons: React.Dispatch<React.SetStateAction<boolean>>;
  showAsteroids: boolean;
  setShowAsteroids: React.Dispatch<React.SetStateAction<boolean>>;
  showLabels: boolean;
  setShowLabels: React.Dispatch<React.SetStateAction<boolean>>;
  showHabitableZone: boolean;
  setShowHabitableZone: React.Dispatch<React.SetStateAction<boolean>>;
  isCinematicTour: boolean;
  setIsCinematicTour: React.Dispatch<React.SetStateAction<boolean>>;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onScreenshot: () => void;
  viewMode: string;
  onReturnToGalaxy: () => void;
}

export const ControlCockpit: React.FC<ControlCockpitProps> = ({
  timeScale,
  setTimeScale,
  selectedBodyId,
  onSelectBody,
  showOrbits,
  setShowOrbits,
  showMoons,
  setShowMoons,
  showAsteroids,
  setShowAsteroids,
  showLabels,
  setShowLabels,
  showHabitableZone,
  setShowHabitableZone,
  isCinematicTour,
  setIsCinematicTour,
  isMuted,
  setIsMuted,
  onScreenshot,
  viewMode,
  onReturnToGalaxy
}) => {
  const isPlaying = timeScale > 0;
  const speedPresets = [0.2, 1, 5, 20, 100];

  const getPlanetLabel = (id: string, name: string) => {
    switch (id) {
      case 'sun': return 'SUN';
      case 'earth': return 'EARTH';
      case 'pluto': return 'PLUTO';
      default: return name.split(' ')[0].toUpperCase();
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-2 pointer-events-auto select-none">
      {/* 1. Quick Planet Navigator Carousel Strip */}
      {viewMode !== 'galaxy' && (
        <div className="w-full overflow-x-auto pb-1 scrollbar-none flex items-center justify-start md:justify-center gap-1.5 px-4">
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
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 backdrop-blur-lg shrink-0 ${
                  isSelected
                    ? 'bg-space-900 border-cyber-cyan shadow-neon-cyan scale-105'
                    : 'bg-space-950/75 border-white/10 hover:border-white/30 hover:bg-space-900/80'
                }`}
              >
                {body.assets?.transparentCutoutUrl ? (
                  <img
                    src={body.assets.transparentCutoutUrl}
                    alt=""
                    className="w-4 h-4 object-contain filter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] shrink-0"
                  />
                ) : (
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow shrink-0"
                    style={{
                      backgroundColor: body.color,
                      boxShadow: isSelected ? `0 0 10px ${body.accentColor}` : undefined
                    }}
                  />
                )}
                <span className={`font-serif text-xs uppercase tracking-wider ${
                  isSelected ? 'text-cyber-cyan font-semibold' : 'text-gray-300 group-hover:text-white'
                }`}>
                  {getPlanetLabel(id, body.name)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Main Liquid Glass Cockpit Hub */}
      <LiquidGlassCard glowColor="none" className="py-2.5 px-4 w-full flex flex-wrap items-center justify-between gap-3 bg-space-950/85 backdrop-blur-3xl border-white/15">
        {/* Left: View Mode Selector / Galaxy Button */}
        <div className="flex items-center gap-2">
          {viewMode !== 'galaxy' ? (
            <button
              onClick={() => {
                soundEngine.playWarpSwoosh();
                onReturnToGalaxy();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-cyber-cyan text-white text-xs font-tech font-bold shadow-neon-cyan hover:scale-105 active:scale-95 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>MILKY WAY GALAXY</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 font-tech text-xs text-cyber-cyan px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/20">
              <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
              <span>GALACTIC ATLAS VIEW</span>
            </div>
          )}

          {/* Cinematic Grand Tour Toggle */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setIsCinematicTour(!isCinematicTour);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-tech font-medium transition-all ${
              isCinematicTour
                ? 'bg-cyber-magenta/20 border-cyber-magenta text-cyber-magenta shadow-[0_0_15px_rgba(247,37,133,0.3)]'
                : 'bg-space-900 border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>GRAND TOUR</span>
          </button>
        </div>

        {/* Center: Time Simulation Controller */}
        {viewMode !== 'galaxy' && (
          <div className="flex items-center gap-2 bg-space-900/90 px-3 py-1.5 rounded-2xl border border-white/10">
            {/* Play/Pause Button */}
            <button
              onClick={() => {
                soundEngine.playUiClick();
                setTimeScale(isPlaying ? 0 : 1);
              }}
              className="p-1.5 rounded-lg bg-cyber-cyan text-black hover:bg-white transition-colors"
              title={isPlaying ? 'Pause simulation' : 'Play simulation'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Reset / Real-time 1x button */}
            <button
              onClick={() => {
                soundEngine.playUiClick();
                setTimeScale(1);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-space-850 transition-colors"
              title="Reset to 1x Speed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Speed Multiplier Presets */}
            <div className="flex items-center gap-1 font-mono text-[11px]">
              {speedPresets.map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    soundEngine.playUiClick();
                    setTimeScale(spd);
                  }}
                  className={`px-2 py-0.5 rounded transition-all ${
                    timeScale === spd
                      ? 'bg-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/50 font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right: Display Toggles & Utilities */}
        <div className="flex items-center gap-1.5">
          {viewMode !== 'galaxy' && (
            <>
              {/* Orbits Toggle */}
              <button
                onClick={() => { soundEngine.playUiClick(); setShowOrbits(v => !v); }}
                title="Toggle Planetary Orbit Lines"
                className={`p-2 rounded-xl border transition-all ${
                  showOrbits ? 'bg-cyan-950/60 border-cyber-cyan/60 text-cyber-cyan' : 'bg-space-900 border-white/10 text-gray-400'
                }`}
              >
                <CircleDot className="w-4 h-4" />
              </button>

              {/* Moons Toggle */}
              <button
                onClick={() => { soundEngine.playUiClick(); setShowMoons(v => !v); }}
                title="Toggle Natural Moons"
                className={`p-2 rounded-xl border transition-all ${
                  showMoons ? 'bg-cyan-950/60 border-cyber-cyan/60 text-cyber-cyan' : 'bg-space-900 border-white/10 text-gray-400'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>

              {/* Labels Toggle */}
              <button
                onClick={() => { soundEngine.playUiClick(); setShowLabels(v => !v); }}
                title="Toggle 3D Floating Labels"
                className={`p-2 rounded-xl border transition-all ${
                  showLabels ? 'bg-cyan-950/60 border-cyber-cyan/60 text-cyber-cyan' : 'bg-space-900 border-white/10 text-gray-400'
                }`}
              >
                <Eye className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Screenshot / Photo Mode */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onScreenshot();
            }}
            title="Capture 3D View Screenshot"
            className="p-2 rounded-xl bg-space-900 border border-white/10 text-gray-300 hover:text-white hover:border-cyber-yellow transition-all"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Audio Synthesizer Mute Toggle */}
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              soundEngine.setMuted(nextMuted);
              if (!nextMuted) soundEngine.startAmbientDrone();
            }}
            title={isMuted ? 'Unmute Cosmic Audio Synthesizer' : 'Mute Sound'}
            className={`p-2 rounded-xl border transition-all ${
              !isMuted ? 'bg-space-900 border-cyber-cyan/60 text-cyber-cyan shadow-neon-cyan' : 'bg-space-900 border-white/10 text-gray-500'
            }`}
          >
            {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </LiquidGlassCard>
    </div>
  );
};
