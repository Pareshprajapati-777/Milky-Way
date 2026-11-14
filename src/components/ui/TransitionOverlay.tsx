import React from 'react';
import { ViewMode } from '../3d/CameraController';
import { getTransitionScaleLabel, getTransitionPhase } from '../../state/simulationMachine';

interface TransitionOverlayProps {
  viewMode: ViewMode;
  progress: number; // 0.0 to 1.0
}

export const TransitionOverlay: React.FC<TransitionOverlayProps> = ({ viewMode, progress }) => {
  const isTransitioning = viewMode === 'warp_to_solar' || viewMode === 'warp_to_galaxy';
  if (!isTransitioning) return null;

  const phase = getTransitionPhase(progress);
  const scaleLabel = getTransitionScaleLabel(progress);
  const isApproachingSolar = viewMode === 'warp_to_solar';

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-8 font-mono select-none animate-fadeIn">
      {/* Top Transition Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-space-950/80 border border-cyan-500/30 backdrop-blur-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div className="flex flex-col">
            <span className="font-tech text-xs font-bold text-white tracking-widest uppercase">
              {isApproachingSolar ? 'INTERSTELLAR APPROACH VECTOR' : 'GALACTIC SCALE ESCAPE VECTOR'}
            </span>
            <span className="text-[10px] text-cyan-300">
              PHASE: {phase} • CRUISE VELOCITY: 0.9998 c
            </span>
          </div>
        </div>

        {/* Progress % */}
        <div className="px-3.5 py-1.5 rounded-xl bg-space-950/80 border border-white/15 text-xs text-white font-tech font-bold backdrop-blur-xl">
          {(progress * 100).toFixed(0)}%
        </div>
      </div>

      {/* Center Cinematic Scale Callout */}
      <div className="self-center flex flex-col items-center gap-2 text-center">
        <span className="text-[11px] text-gray-400 tracking-widest uppercase">
          ASTRONOMICAL SCALE HORIZON
        </span>
        <h2 className="font-tech text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyber-cyan drop-shadow-[0_0_20px_rgba(0,245,212,0.5)] tracking-wider">
          {scaleLabel}
        </h2>
        {/* Animated Flight Progress Line */}
        <div className="w-64 h-1 rounded-full bg-white/10 overflow-hidden mt-1">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyber-cyan transition-all duration-100 ease-out shadow-[0_0_10px_rgba(0,245,212,0.8)]"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      </div>

      {/* Bottom Context Notice */}
      <div className="self-center text-center text-[10px] text-gray-500 max-w-md">
        Relativistic stellar aberration & depth-of-field propagation active. Navigating from Sagittarius A* galactocentric coordinates into Heliocentric Ecliptic frame.
      </div>
    </div>
  );
};
