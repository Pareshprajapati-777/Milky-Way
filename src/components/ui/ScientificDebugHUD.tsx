import React, { useEffect, useState } from 'react';
import { ViewMode } from '../3d/CameraController';
import { CelestialBodyData } from '../../data/astronomy';
import { ScaleMode } from '../../utils/astronomicalUnits';
import { calculateKeplerRatio, calculateKeplerianOrbit, OrbitPhysicsState } from '../../utils/orbitalPhysics';

interface ScientificDebugHUDProps {
  visible: boolean;
  viewMode: ViewMode;
  scaleMode: ScaleMode;
  selectedBody: CelestialBodyData | null;
  timeScale: number;
  simTimeRef?: React.MutableRefObject<number>;
}

export const ScientificDebugHUD: React.FC<ScientificDebugHUDProps> = ({
  visible,
  viewMode,
  scaleMode,
  selectedBody,
  timeScale,
  simTimeRef
}) => {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.6);
  const [simDays, setSimDays] = useState(0);
  const [livePhysics, setLivePhysics] = useState<OrbitPhysicsState | null>(null);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measure = (now: number) => {
      frameCount++;
      const elapsed = now - lastTime;
      if (elapsed >= 500) {
        const currentFps = Math.round((frameCount * 1000) / elapsed);
        setFps(currentFps);
        setFrameTime(Number((1000 / Math.max(1, currentFps)).toFixed(1)));
        frameCount = 0;
        lastTime = now;
      }

      const currentSimDays = simTimeRef ? simTimeRef.current : 0;
      setSimDays(currentSimDays);

      if (selectedBody && selectedBody.id !== 'sun') {
        const state = calculateKeplerianOrbit(selectedBody, currentSimDays);
        setLivePhysics(state);
      } else {
        setLivePhysics(null);
      }

      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, [selectedBody, simTimeRef]);

  if (!visible) return null;

  const keplerRatio = selectedBody ? calculateKeplerRatio(selectedBody) : 1.0;

  return (
    <div className="fixed top-16 right-4 z-40 w-88 font-mono text-[11px] bg-space-950/95 border border-cyan-500/40 rounded-xl p-3.5 backdrop-blur-2xl text-cyan-200/90 shadow-[0_8px_32px_rgba(0,0,0,0.85)] pointer-events-auto select-none animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/25 pb-2 mb-2">
        <span className="font-tech font-bold text-xs tracking-wider text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ASTRONOMICAL PHYSICS HUD
        </span>
        <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold text-[10px] border border-cyan-500/30">
          {fps} FPS ({frameTime} ms)
        </span>
      </div>

      {/* Grid of parameters */}
      <div className="space-y-1.5 text-[10px]">
        <div className="flex justify-between">
          <span className="text-gray-400">NAVIGATION STATE:</span>
          <span className="font-bold text-white uppercase">{viewMode.replace(/_/g, ' ')}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">SCALE MODE:</span>
          <span className={scaleMode === 'enhanced' ? 'text-amber-300 font-bold' : 'text-emerald-400 font-bold'}>
            {scaleMode === 'enhanced' ? 'ENHANCED (LOG-COMPRESSED)' : '1:1 TRUE PHYSICAL'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">COORDINATE FRAME:</span>
          <span className="text-white">
            {viewMode === 'galaxy' ? 'GALACTOCENTRIC (SGR A*)' : 'HELIOCENTRIC (SOL BARYCENTER)'}
          </span>
        </div>

        <div className="flex justify-between border-t border-white/5 pt-1.5">
          <span className="text-gray-400">SIMULATION TIME:</span>
          <span className="text-cyan-300 font-bold">
            {simDays.toFixed(2)} days ({(simDays / 365.256).toFixed(3)} Yrs)
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">SIMULATION TIMESTEP:</span>
          <span className="text-white">
            {timeScale === 0 ? '0 (PAUSED)' : `${timeScale}x (${timeScale.toFixed(1)} days/sec)`}
          </span>
        </div>

        <div className="flex justify-between border-t border-white/5 pt-1.5">
          <span className="text-gray-400">TARGET BODY:</span>
          <span className="text-white font-bold">{selectedBody ? selectedBody.name : 'SOLAR SYSTEM OVERVIEW'}</span>
        </div>

        {selectedBody && selectedBody.id !== 'sun' && livePhysics && (
          <div className="space-y-1.5 bg-space-900/60 p-2 rounded-lg border border-cyan-500/20 text-[10px]">
            <div className="flex justify-between">
              <span className="text-gray-400">SEMI-MAJOR AXIS (a):</span>
              <span className="text-white font-bold">{livePhysics.semiMajorAxisAU.toFixed(4)} AU</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">ECCENTRICITY (e):</span>
              <span className="text-amber-300 font-bold">{livePhysics.eccentricity.toFixed(5)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">CURRENT RADIUS (r):</span>
              <span className="text-emerald-300 font-bold">
                {livePhysics.rAU.toFixed(4)} AU ({livePhysics.distanceMillionKm.toFixed(2)}M km)
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">TRUE ANOMALY (ν):</span>
              <span className="text-cyan-300 font-bold">{livePhysics.trueAnomalyDeg.toFixed(2)}°</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">MEAN ANOMALY (M):</span>
              <span className="text-cyan-300">{livePhysics.meanAnomalyDeg.toFixed(2)}°</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">ORBITAL VELOCITY (v):</span>
              <span className="text-cyber-cyan font-bold">
                {livePhysics.velocityKps.toFixed(2)} km/s ({(livePhysics.velocityKps * 3600).toFixed(0)} km/h)
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">ORBIT PERIOD (T):</span>
              <span className="text-cyan-300">{livePhysics.orbitalPeriodDays.toFixed(2)} Earth Days</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">KEPLER RATIO (a³/T²):</span>
              <span className="text-emerald-400 font-bold">{keplerRatio.toFixed(4)} (NASA: 1.0000)</span>
            </div>
          </div>
        )}

        {selectedBody && selectedBody.id === 'sun' && (
          <div className="bg-space-900/60 p-2 rounded-lg border border-amber-500/20 text-[10px]">
            <span className="text-amber-300 font-bold block mb-1">HELIOCENTRIC ORIGIN</span>
            <span className="text-gray-300">Position: [0.0, 0.0, 0.0] AU</span>
            <span className="text-gray-400 block mt-0.5">Primary gravitational source of Solar System</span>
          </div>
        )}

        <div className="border-t border-white/5 pt-1.5 text-[9px] text-gray-500 italic">
          Physics Model: Sun-centered Keplerian 2-body orbit solver.
        </div>
      </div>
    </div>
  );
};
