import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Orbit,
  Moon,
  CircleDot,
  Layers,
  Scale,
  ShieldCheck,
  Maximize2,
  Tag,
  Compass,
  Grid,
  Radio,
  Zap,
  Send
} from 'lucide-react';
import { ScaleMode } from '../../utils/astronomicalUnits';
import { soundEngine } from '../../utils/soundEngine';
import { useSimulationStore } from '../../state/useSimulationStore';

interface LeftNavToolsProps {
  scaleMode: ScaleMode;
  setScaleMode: (mode: ScaleMode) => void;
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
  onResetView: () => void;
  onOpenDisclosure: () => void;
  viewMode: string;
}

export const LeftNavTools: React.FC<LeftNavToolsProps> = ({
  scaleMode,
  setScaleMode,
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
  onResetView,
  onOpenDisclosure,
  viewMode
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="fixed left-2 sm:left-4 top-16 sm:top-20 z-30 flex flex-col gap-2 pointer-events-auto select-none font-tech">
      {/* Floating Glass Tool Strip */}
      <div className="flex flex-col gap-1.5 p-1.5 rounded-2xl bg-space-950/80 border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* 1. Reset Camera Angle */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            onResetView();
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="group relative p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          title="Reset Camera Orientation"
        >
          <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Reset Camera (C)
          </span>
        </button>

        {/* 2. Scale Mode Switcher (Enhanced vs True Scale) */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            setScaleMode(scaleMode === 'enhanced' ? 'true_scale' : 'enhanced');
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`group relative p-2.5 rounded-xl transition-all ${
            scaleMode === 'true_scale'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
              : 'hover:bg-white/10 text-gray-400 hover:text-cyan-300'
          }`}
          title="Toggle True Physical Scale vs. Enhanced Visibility Mode"
        >
          <Scale className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Scale Mode: {scaleMode === 'enhanced' ? 'Enhanced Visibility' : '1:1 True Physical Scale'}
          </span>
        </button>

        <div className="h-px bg-white/10 my-0.5" />

        {/* 3. Orbit Paths Toggle */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            setShowOrbits(prev => !prev);
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`group relative p-2.5 rounded-xl transition-all ${
            showOrbits ? 'text-cyber-cyan bg-cyan-950/60' : 'text-gray-500 hover:text-gray-300'
          }`}
          title="Toggle Keplerian Orbit Lines (O)"
        >
          <Orbit className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Orbit Lines: {showOrbits ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* 4. Labels Toggle */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            setShowLabels(prev => !prev);
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`group relative p-2.5 rounded-xl transition-all ${
            showLabels ? 'text-cyber-cyan bg-cyan-950/60' : 'text-gray-500 hover:text-gray-300'
          }`}
          title="Toggle Body Labels (L)"
        >
          <Tag className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Object Labels: {showLabels ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* 5. Moons Toggle */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            setShowMoons(prev => !prev);
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`group relative p-2.5 rounded-xl transition-all ${
            showMoons ? 'text-cyber-cyan bg-cyan-950/60' : 'text-gray-500 hover:text-gray-300'
          }`}
          title="Toggle Natural Moons"
        >
          <Moon className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Moons: {showMoons ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* 6. Asteroids Toggle */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            setShowAsteroids(prev => !prev);
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`group relative p-2.5 rounded-xl transition-all ${
            showAsteroids ? 'text-cyber-cyan bg-cyan-950/60' : 'text-gray-500 hover:text-gray-300'
          }`}
          title="Toggle Asteroid Belts"
        >
          <CircleDot className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Asteroid Belts: {showAsteroids ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* 7. Habitable Zone Toggle */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            setShowHabitableZone(prev => !prev);
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`group relative p-2.5 rounded-xl transition-all ${
            showHabitableZone ? 'text-emerald-400 bg-emerald-950/60' : 'text-gray-500 hover:text-gray-300'
          }`}
          title="Toggle Goldilocks Habitable Zone"
        >
          <Compass className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Habitable Zone: {showHabitableZone ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* 8. Cinematic Grand Tour */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            setIsCinematicTour(prev => !prev);
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`group relative p-2.5 rounded-xl transition-all ${
            isCinematicTour ? 'text-cyber-yellow bg-yellow-950/60 shadow-neon-yellow' : 'text-gray-500 hover:text-gray-300'
          }`}
          title="Toggle Cinematic Orbital Tour"
        >
          <Sparkles className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Cinematic Orbit Tour: {isCinematicTour ? 'ACTIVE' : 'OFF'}
          </span>
        </button>

        <div className="h-px bg-white/10 my-0.5" />

        {/* 9. PHYSICS LAYERS (Scientific Overlays) */}
        {/* A. 3D Gravitational Potential Spacetime Fabric */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            useSimulationStore.getState().toggleGravityGrid();
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`group relative p-2.5 rounded-xl transition-all ${
            useSimulationStore((state) => state.showGravityGrid) ? 'text-cyber-cyan bg-cyan-950/60 border border-cyber-cyan/40 shadow-neon-cyan' : 'text-gray-500 hover:text-gray-300'
          }`}
          title="Toggle 3D Spacetime Curvature Fabric (-GM/r)"
        >
          <Grid className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Spacetime Gravity Grid: {useSimulationStore((state) => state.showGravityGrid) ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* B. Lagrange Points & JWST Marker */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            useSimulationStore.getState().toggleLagrangePoints();
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`group relative p-2.5 rounded-xl transition-all ${
            useSimulationStore((state) => state.showLagrangePoints) ? 'text-amber-300 bg-amber-950/60 border border-amber-400/40' : 'text-gray-500 hover:text-gray-300'
          }`}
          title="Toggle L1-L5 Lagrange Equilibrium Points & JWST"
        >
          <Radio className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Lagrange Points (L1-L5 + JWST): {useSimulationStore((state) => state.showLagrangePoints) ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* C. Magnetosphere & Solar Wind Vectors */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            useSimulationStore.getState().toggleMagnetosphere();
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`group relative p-2.5 rounded-xl transition-all ${
            useSimulationStore((state) => state.showMagnetosphere) ? 'text-sky-400 bg-sky-950/60 border border-sky-400/40' : 'text-gray-500 hover:text-gray-300'
          }`}
          title="Toggle Magnetosphere & Parker Solar Wind Vectors"
        >
          <Zap className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Magnetosphere & Solar Wind: {useSimulationStore((state) => state.showMagnetosphere) ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* D. Hohmann Transfer Orbit Trajectory */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            useSimulationStore.getState().toggleHohmannTransfer();
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`group relative p-2.5 rounded-xl transition-all ${
            useSimulationStore((state) => state.showHohmannTransfer) ? 'text-red-400 bg-red-950/60 border border-red-500/40' : 'text-gray-500 hover:text-gray-300'
          }`}
          title="Toggle Hohmann Transfer Trajectory (Earth ➔ Mars Δv)"
        >
          <Send className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Hohmann Transfer (Earth➔Mars): {useSimulationStore((state) => state.showHohmannTransfer) ? 'ON' : 'OFF'}
          </span>
        </button>

        <div className="h-px bg-white/10 my-0.5" />

        {/* 9. Scientific Methodology Disclosures */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            onOpenDisclosure();
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="group relative p-2.5 rounded-xl hover:bg-cyan-500/10 text-cyan-400/80 hover:text-cyan-300 transition-all"
          title="View Scientific Methodology & References"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Scientific Disclosures & Sources
          </span>
        </button>

        {/* 10. Fullscreen */}
        <button
          onClick={() => {
            soundEngine.playUiClick();
            toggleFullscreen();
          }}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="group relative p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-space-900 border border-white/15 text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg">
            Toggle Fullscreen
          </span>
        </button>
      </div>
    </div>
  );
};
