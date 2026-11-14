import React, { useState, useEffect, useRef } from 'react';
import { CelestialBodyData, MoonData, CELESTIAL_BODIES } from '../../data/astronomy';
import { soundEngine } from '../../utils/soundEngine';
import {
  Thermometer,
  Compass,
  CircleDot,
  Layers,
  Sparkles,
  History,
  Volume2,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Film,
  Globe,
  Radio,
  Gauge,
  Wind
} from 'lucide-react';

import { calculateKeplerianOrbit } from '../../utils/orbitalPhysics';

interface TelemetryCardProps {
  body: CelestialBodyData;
  selectedMoon: MoonData | null;
  onSelectMoon: (moon: MoonData) => void;
  onSelectBody?: (body: CelestialBodyData) => void;
  onClose: () => void;
  onZoomOutToSolar: () => void;
  simTimeRef?: React.MutableRefObject<number>;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  body,
  selectedMoon,
  onSelectMoon,
  onSelectBody,
  onClose,
  onZoomOutToSolar,
  simTimeRef
}) => {
  const [activeTab, setActiveTab] = useState<'physical' | 'atmosphere' | 'orbit' | 'moons' | 'missions'>('physical');
  const [tempUnit, setTempUnit] = useState<'C' | 'K' | 'F'>('C');
  const [showCinematicVideo, setShowCinematicVideo] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Direct DOM Ref Mutators for 60FPS Zero-Rerender Telemetry updates (throttled at 10Hz/100ms)
  const distAuRef = useRef<HTMLSpanElement>(null);
  const distKmRef = useRef<HTMLSpanElement>(null);
  const velKpsRef = useRef<HTMLSpanElement>(null);
  const velKmhRef = useRef<HTMLSpanElement>(null);
  const anomalyRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (body.id === 'sun') return;

    const interval = setInterval(() => {
      const currentSimDays = simTimeRef ? simTimeRef.current : 0;
      const state = calculateKeplerianOrbit(body, currentSimDays);

      if (distAuRef.current) {
        distAuRef.current.innerText = `${state.rAU.toFixed(3)} AU`;
      }
      if (distKmRef.current) {
        distKmRef.current.innerText = `${state.distanceMillionKm.toFixed(1)}M km (Current)`;
      }
      if (velKpsRef.current) {
        velKpsRef.current.innerText = `${state.velocityKps.toFixed(2)} km/s`;
      }
      if (velKmhRef.current) {
        velKmhRef.current.innerText = `${(state.velocityKps * 3600).toFixed(0)} km/h`;
      }
      if (anomalyRef.current) {
        anomalyRef.current.innerText = `Anomaly ν: ${state.trueAnomalyDeg.toFixed(1)}°`;
      }
    }, 100); // 10Hz / 100ms smooth throttle

    return () => clearInterval(interval);
  }, [body.id, simTimeRef]);

  // Initial calculation fallback
  const initialOrbitState = body.id !== 'sun' && simTimeRef ? calculateKeplerianOrbit(body, simTimeRef.current) : null;

  // Helper to convert temperatures
  const formatTemp = (tempC: number) => {
    if (tempUnit === 'K') return `${(tempC + 273.15).toFixed(0)} K`;
    if (tempUnit === 'F') return `${((tempC * 9) / 5 + 32).toFixed(0)} °F`;
    return `${tempC > 0 ? '+' : ''}${tempC.toFixed(0)} °C`;
  };

  // Determine side-slot planets for the Earth / Venus / Mars trio
  const trioOrder = ['earth', 'venus', 'mars'];
  const isInTrio = trioOrder.includes(body.id);
  const currentIndex = trioOrder.indexOf(body.id);
  const prevPlanetId = isInTrio ? trioOrder[(currentIndex - 1 + trioOrder.length) % trioOrder.length] : null;
  const nextPlanetId = isInTrio ? trioOrder[(currentIndex + 1) % trioOrder.length] : null;
  const prevPlanet = prevPlanetId ? CELESTIAL_BODIES[prevPlanetId] : null;
  const nextPlanet = nextPlanetId ? CELESTIAL_BODIES[nextPlanetId] : null;

  return (
    <div className="w-full max-w-[440px] pointer-events-auto relative z-30 select-none animate-fadeIn transition-all">
      {/* Sci-Fi Ambient Glow Backdrop */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-35 blur-xl transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 20%, ${body.accentColor} 0%, transparent 70%)`
        }}
      />

      {/* Main Frosted Cyber Glass Container */}
      <div className="relative rounded-2xl bg-space-950/85 backdrop-blur-2xl border border-white/15 p-5 shadow-2xl overflow-hidden font-body text-white">
        {/* Subtle Tech Corner Brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/30 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/30 rounded-br-lg pointer-events-none" />

        {/* Top Glow Accent Bar in Planet Accent Color */}
        <div
          className="absolute top-0 left-6 right-6 h-[2px] transition-colors duration-500"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${body.accentColor} 50%, transparent 100%)`
          }}
        />

        {/* Optional Live Cinematic Background Video Overlay */}
        {showCinematicVideo && body.assets?.videoClipUrl && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 mix-blend-screen transition-opacity duration-700">
            <video
              src={body.assets.videoClipUrl}
              poster={body.assets.posterStillUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/70 to-transparent" />
          </div>
        )}

        <div className="relative z-10">
          {/* Header with Celestial Identity & Controls */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              {/* Celestial Avatar with Spinning Glow */}
              <div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center p-1 border shadow-glass-edge overflow-hidden bg-space-950/90 transition-transform group-hover:scale-105"
                style={{
                  borderColor: `${body.accentColor}77`,
                  boxShadow: `0 0 25px ${body.accentColor}44`
                }}
              >
                {/* Internal Glow aura */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-40 blur-sm pointer-events-none"
                  style={{ backgroundColor: body.accentColor }}
                />

                {body.assets?.transparentCutoutUrl ? (
                  <img
                    src={body.assets.transparentCutoutUrl}
                    alt={body.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.45)] animate-spin-slow"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full shadow-lg"
                    style={{
                      backgroundColor: body.color,
                      boxShadow: `0 0 18px ${body.accentColor}`
                    }}
                  />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="font-mono text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1"
                    style={{
                      backgroundColor: `${body.accentColor}18`,
                      borderColor: `${body.accentColor}55`,
                      color: body.accentColor
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: body.accentColor }} />
                    {body.category.replace('_', ' ')}
                  </span>

                  {body.id === 'earth' && (
                    <span className="font-mono text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      HABITABLE ZONE
                    </span>
                  )}

                  {body.moonsCount > 0 && (
                    <span className="font-mono text-[9px] text-gray-400 bg-space-900/80 px-1.5 py-0.5 rounded border border-white/10">
                      {body.moonsCount} {body.moonsCount === 1 ? 'MOON' : 'MOONS'}
                    </span>
                  )}
                </div>

                {/* Planet Headline - Orbitron font-tech */}
                <h2 className="font-tech text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  {selectedMoon ? selectedMoon.name : body.name.split(' ')[0]}
                </h2>
              </div>
            </div>

            {/* Interactive Utility Action Bar */}
            <div className="flex items-center gap-1.5">
              {/* Cinematic Live Backdrop Toggle */}
              {body.assets?.videoClipUrl && (
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    setShowCinematicVideo(!showCinematicVideo);
                  }}
                  title={showCinematicVideo ? "Disable Live Video Backdrop" : "View 60fps Live Video Backdrop"}
                  className={`p-2 rounded-xl border transition-all ${
                    showCinematicVideo
                      ? 'bg-cyber-cyan text-space-950 border-cyber-cyan shadow-neon-cyan'
                      : 'bg-space-900/90 border-white/15 text-gray-300 hover:text-white hover:border-cyber-cyan'
                  }`}
                >
                  <Film className="w-4 h-4" />
                </button>
              )}

              {/* Electromagnetic Resonance Soundscape Button */}
              <button
                onClick={() => {
                  setIsPlayingAudio(true);
                  soundEngine.playPlanetResonance(body.soundFrequencyHz);
                  setTimeout(() => setIsPlayingAudio(false), 2000);
                }}
                title={`Play NASA ${body.name} electromagnetic frequency (${body.soundFrequencyHz} Hz)`}
                className={`p-2 rounded-xl border transition-all ${
                  isPlayingAudio
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,245,212,0.5)] scale-105'
                    : 'bg-space-900/90 border-white/15 text-cyber-cyan hover:bg-space-850 hover:border-cyber-cyan'
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onClose();
                }}
                title="Close and return to Solar System Overview"
                className="p-2 rounded-xl bg-space-900/90 border border-white/15 text-gray-400 hover:text-white hover:border-red-400/60 hover:bg-red-950/40 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Intel Tagline Brief */}
          <div className="relative mb-3 pl-3 py-1 text-xs text-gray-300 font-body leading-relaxed border-l-2 bg-space-900/30 rounded-r-lg" style={{ borderColor: body.accentColor }}>
            <p>
              {selectedMoon ? selectedMoon.description : body.tagline}
            </p>
          </div>

          {/* Quick Navigator Pill (Earth / Venus / Mars Trio) */}
          {isInTrio && prevPlanet && nextPlanet && onSelectBody && (
            <div className="mb-3 p-1 rounded-xl bg-space-900/80 border border-white/10 flex items-center justify-between gap-1.5 shadow-inner">
              <button
                onClick={() => {
                  soundEngine.playPlanetResonance(prevPlanet.soundFrequencyHz);
                  onSelectBody(prevPlanet);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-space-950/70 border border-white/10 hover:border-cyber-cyan hover:bg-space-900 transition-all group"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyber-cyan group-hover:-translate-x-0.5 transition-transform" />
                {prevPlanet.assets?.transparentCutoutUrl && (
                  <img
                    src={prevPlanet.assets.transparentCutoutUrl}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="font-tech text-[10px] font-bold tracking-wider text-gray-300 group-hover:text-white uppercase">
                  {prevPlanet.name.split(' ')[0]}
                </span>
              </button>

              <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest px-1">
                INNER WORLDS
              </span>

              <button
                onClick={() => {
                  soundEngine.playPlanetResonance(nextPlanet.soundFrequencyHz);
                  onSelectBody(nextPlanet);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-space-950/70 border border-white/10 hover:border-cyber-cyan hover:bg-space-900 transition-all group"
              >
                <span className="font-tech text-[10px] font-bold tracking-wider text-gray-300 group-hover:text-white uppercase">
                  {nextPlanet.name.split(' ')[0]}
                </span>
                {nextPlanet.assets?.transparentCutoutUrl && (
                  <img
                    src={nextPlanet.assets.transparentCutoutUrl}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                )}
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyber-cyan group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* High-Tech Segmented Tabs */}
          <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-space-900/90 border border-white/10 mb-3 text-[11px] font-tech font-bold">
            <button
              onClick={() => { soundEngine.playUiClick(); setActiveTab('physical'); }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'physical'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_10px_rgba(0,245,212,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CircleDot className="w-3 h-3" />
              <span>SPECS</span>
            </button>
            <button
              onClick={() => { soundEngine.playUiClick(); setActiveTab('atmosphere'); }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'atmosphere'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_10px_rgba(0,245,212,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>ATMO</span>
            </button>
            <button
              onClick={() => { soundEngine.playUiClick(); setActiveTab('orbit'); }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'orbit'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_10px_rgba(0,245,212,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>ORBIT</span>
            </button>
            <button
              onClick={() => { soundEngine.playUiClick(); setActiveTab('moons'); }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 relative ${
                activeTab === 'moons'
                  ? 'bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/40 shadow-[0_0_10px_rgba(255,214,10,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>MOONS</span>
              {body.moons.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-yellow absolute top-1 right-1 shadow-neon-gold" />
              )}
            </button>
            <button
              onClick={() => { soundEngine.playUiClick(); setActiveTab('missions'); }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'missions'
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3 h-3" />
              <span>LORE</span>
            </button>
          </div>

          {/* TAB 1: Physical Parameters (SPECS) */}
          {activeTab === 'physical' && (
            <div className="space-y-2.5 text-xs font-body animate-fadeIn">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10 hover:border-cyan-500/30 transition-colors shadow-inner">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">
                    EQUATORIAL RADIUS
                  </span>
                  <span className="font-tech text-base font-bold text-white tracking-wide">
                    {selectedMoon ? selectedMoon.radiusKm.toLocaleString() : body.radiusKm.toLocaleString()} <span className="text-xs font-normal text-gray-400">km</span>
                  </span>
                  <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                    {selectedMoon ? 'Natural Satellite' : `${(body.radiusKm / 6371).toFixed(2)}x Earth`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10 hover:border-cyan-500/30 transition-colors shadow-inner">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">
                    SURFACE GRAVITY
                  </span>
                  <span className="font-tech text-base font-bold text-cyber-cyan tracking-wide">
                    {selectedMoon ? selectedMoon.gravity : `${body.gravityMps2} m/s²`}
                  </span>
                  <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                    {selectedMoon ? '' : `${body.gravityEarthRelative}g (relative)`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10 hover:border-cyan-500/30 transition-colors shadow-inner">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">
                    TOTAL MASS
                  </span>
                  <span className="font-tech text-xs font-bold text-cyber-yellow tracking-wide truncate block">
                    {body.massKg}
                  </span>
                  <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                    {body.massEarthRelative > 1 ? `${body.massEarthRelative}x Earth` : `${(body.massEarthRelative * 100).toFixed(2)}% Earth`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10 hover:border-cyan-500/30 transition-colors shadow-inner">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">
                    ESCAPE VELOCITY
                  </span>
                  <span className="font-tech text-base font-bold text-white tracking-wide">
                    {body.escapeVelocityKps} <span className="text-xs font-normal text-gray-400">km/s</span>
                  </span>
                  <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                    {(body.escapeVelocityKps * 3600).toLocaleString()} km/h
                  </span>
                </div>
              </div>

              {/* Geology Description Box */}
              <div className="p-3 rounded-xl bg-space-900/50 border border-white/10">
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-cyan-300 tracking-wider">
                  <Globe className="w-3 h-3 text-cyber-cyan" />
                  <span>GEOLOGICAL & CORE STRUCTURE</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed font-body">
                  {body.geology}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Atmosphere Composition (ATMO) */}
          {activeTab === 'atmosphere' && (
            <div className="space-y-3 text-xs font-body animate-fadeIn">
              {body.atmosphere.hasAtmosphere && body.atmosphere.composition.length > 0 ? (
                <>
                  <div className="p-2.5 rounded-xl bg-space-900/70 border border-white/10 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-gray-300 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-cyber-cyan" />
                      SURFACE PRESSURE:
                    </span>
                    <span className="font-bold text-cyber-cyan font-tech">
                      {body.atmosphere.surfacePressureBar} bar
                    </span>
                  </div>

                  {/* Composition Visual Bars */}
                  <div className="space-y-2.5 p-3 rounded-xl bg-space-900/50 border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                      GAS ABUNDANCE SPECTRUM
                    </span>
                    {body.atmosphere.composition.map((comp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-white flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shadow-sm"
                              style={{ backgroundColor: comp.color }}
                            />
                            {comp.gas}{' '}
                            <span className="text-gray-400 font-mono text-[10px]">
                              ({comp.formula})
                            </span>
                          </span>
                          <span className="font-mono text-cyber-cyan font-bold">
                            {comp.percentage}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-space-950 overflow-hidden border border-white/5">
                          <div
                            className="h-full rounded-full transition-all duration-700 shadow-sm"
                            style={{
                              width: `${comp.percentage}%`,
                              backgroundColor: comp.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-5 rounded-xl bg-space-900/40 border border-white/10 text-center text-gray-400 font-body">
                  <Wind className="w-6 h-6 text-gray-500 mx-auto mb-2 opacity-60" />
                  <p className="font-mono text-xs text-white">No permanent thick atmosphere.</p>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                    Exosphere consists of trace vacuum-level particles continually sputtered by solar wind and micrometeorite impacts.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Orbit & Dynamics (ORBIT) */}
          {activeTab === 'orbit' && (
            <div className="space-y-2.5 text-xs font-body animate-fadeIn">
              {/* Temperature Gauge Header with Unit Toggles */}
              <div className="p-3 rounded-xl bg-space-900/70 border border-white/10 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-gray-300 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-red-400" />
                    SURFACE TEMPERATURE RANGE
                  </span>
                  <div className="flex items-center gap-1 bg-space-950 p-0.5 rounded-lg border border-white/10 text-[9px] font-mono">
                    {(['C', 'K', 'F'] as const).map(unit => (
                      <button
                        key={unit}
                        onClick={() => setTempUnit(unit)}
                        className={`px-1.5 py-0.5 rounded transition-colors ${
                          tempUnit === unit
                            ? 'bg-cyber-cyan text-space-950 font-bold shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        °{unit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 rounded-lg bg-space-950/80 border border-blue-500/20">
                    <span className="text-[9px] text-blue-400 block mb-0.5">MINIMUM</span>
                    <span className="text-white font-bold text-xs">{formatTemp(body.temperature.minC)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-space-950/80 border border-cyan-500/40 ring-1 ring-cyan-500/20">
                    <span className="text-[9px] text-cyber-cyan block mb-0.5">MEAN / AVG</span>
                    <span className="text-cyber-cyan font-bold text-xs">{formatTemp(body.temperature.avgC)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-space-950/80 border border-red-500/20">
                    <span className="text-[9px] text-red-400 block mb-0.5">MAXIMUM</span>
                    <span className="text-white font-bold text-xs">{formatTemp(body.temperature.maxC)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">
                    DISTANCE FROM SUN
                  </span>
                  <span ref={distAuRef} className="font-tech text-base font-bold text-white">
                    {initialOrbitState ? `${initialOrbitState.rAU.toFixed(3)} AU` : `${body.distanceFromSunAU} AU`}
                  </span>
                  <span ref={distKmRef} className="text-[9px] text-gray-400 block font-mono mt-0.5">
                    {initialOrbitState ? `${initialOrbitState.distanceMillionKm.toFixed(1)}M km (Current)` : `${body.distanceFromSunMillionKm} Million km`}
                  </span>
                  <span className="text-[9px] text-cyan-300/80 block font-mono">
                    a: {body.distanceFromSunAU} AU • e: {body.eccentricity}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">
                    ORBITAL VELOCITY
                  </span>
                  <span ref={velKpsRef} className="font-tech text-base font-bold text-cyber-cyan">
                    {initialOrbitState ? `${initialOrbitState.velocityKps.toFixed(2)} km/s` : `${body.orbitalVelocityKps} km/s`}
                  </span>
                  <span ref={velKmhRef} className="text-[9px] text-gray-400 block font-mono mt-0.5">
                    {initialOrbitState ? `${(initialOrbitState.velocityKps * 3600).toFixed(0)} km/h` : `${(body.orbitalVelocityKps * 3600).toLocaleString()} km/h`}
                  </span>
                  <span ref={anomalyRef} className="text-[9px] text-emerald-400/80 block font-mono">
                    {initialOrbitState ? `Anomaly ν: ${initialOrbitState.trueAnomalyDeg.toFixed(1)}°` : `Mean: ${body.orbitalVelocityKps} km/s`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">
                    ORBITAL PERIOD (YEAR)
                  </span>
                  <span className="font-tech text-xs font-bold text-cyber-yellow">
                    {body.orbitalPeriodDays.toFixed(1)} Earth Days
                  </span>
                  <span className="text-[9px] text-gray-400 block font-mono mt-0.5">
                    {body.orbitalPeriodYears} Julian Years
                  </span>
                  <span className="text-[9px] text-emerald-400 block font-mono">
                    a³/T² = 1.0000 (Kepler Law)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-space-900/70 border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider mb-0.5">
                    DAY LENGTH (ROTATION)
                  </span>
                  <span className="font-tech text-xs font-bold text-white">
                    {Math.abs(body.rotationPeriodHours).toFixed(1)} Hours
                  </span>
                  <span className="text-[9px] text-gray-400 block font-mono mt-0.5">
                    Axial Tilt: {body.axialTiltDeg}°
                  </span>
                  <span className="text-[9px] text-amber-300/80 block font-mono">
                    {body.rotationPeriodHours < 0 ? 'Retrograde Spin' : 'Prograde Spin'}
                  </span>
                </div>
              </div>

              {/* Scientific Disclosure */}
              <div className="p-2.5 rounded-xl bg-space-950/70 border border-white/5 font-mono text-[9px] text-gray-400">
                <span className="text-cyan-300 font-bold">MODEL TRANSPARENCY: </span>
                Heliocentric Keplerian approximation solving M = E - e*sin(E). Relativistic corrections and N-body perturbations omitted for real-time visualization.
              </div>
            </div>
          )}

          {/* TAB 4: Moons System (MOONS) */}
          {activeTab === 'moons' && (
            <div className="space-y-2 font-body animate-fadeIn">
              {body.moons.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {body.moons.map((moon) => {
                    const isMoonSelected = selectedMoon?.id === moon.id;
                    return (
                      <div
                        key={moon.id}
                        onClick={() => {
                          soundEngine.playUiClick();
                          onSelectMoon(moon);
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isMoonSelected
                            ? 'bg-space-900 border-cyber-cyan shadow-neon-cyan ring-1 ring-cyan-400/30'
                            : 'bg-space-900/60 border-white/10 hover:border-white/30 hover:bg-space-900/90'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center shadow-inner flex-shrink-0"
                            style={{ backgroundColor: moon.color }}
                          />
                          <div>
                            <span className="font-tech text-xs font-bold text-white block tracking-wide">
                              {moon.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              Radius: {moon.radiusKm.toLocaleString()} km // Period: {moon.orbitPeriodDays}d
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-cyber-cyan text-xs font-tech font-bold px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/20">
                          <span>EXPLORE</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-space-900/40 border border-white/10 text-center text-gray-400 text-xs font-mono font-body">
                  <Radio className="w-5 h-5 text-gray-500 mx-auto mb-1.5 opacity-60" />
                  No major natural satellites orbit {body.name}.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Exploration History (LORE) */}
          {activeTab === 'missions' && (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs font-body animate-fadeIn">
              {body.explorationHistory.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-space-900/70 border border-white/10 space-y-1 hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-tech font-bold text-cyber-cyan tracking-wide">{m.mission}</span>
                    <span className="font-mono text-gray-400 text-[10px] bg-space-950 px-1.5 py-0.5 rounded border border-white/10">
                      {m.agency} • {m.year}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-snug font-body">
                    {m.highlight}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Card Footer: Overview Trigger & Sol ID */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => {
                soundEngine.playUiClick();
                onZoomOutToSolar();
              }}
              className="flex items-center gap-1.5 text-xs text-cyber-cyan hover:text-white font-tech font-bold transition-colors group"
            >
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>SOLAR SYSTEM OVERVIEW</span>
            </button>

            <span className="font-mono text-[9px] text-gray-500 tracking-wider">
              SOL ID: {body.id.toUpperCase()} // SYS-01
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
