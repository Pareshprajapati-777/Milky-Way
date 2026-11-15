import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SimulationScene } from './components/3d/SimulationScene';
import { ViewMode } from './components/3d/CameraController';
import { HeaderNav } from './components/ui/HeaderNav';
import { LeftNavTools } from './components/ui/LeftNavTools';
import { BottomControlDeck } from './components/ui/BottomControlDeck';
import { MilkyWayTelemetryCard } from './components/ui/MilkyWayTelemetryCard';
import { TelemetryCard } from './components/ui/TelemetryCard';
import { TransitionOverlay } from './components/ui/TransitionOverlay';
import { ScientificDebugHUD } from './components/ui/ScientificDebugHUD';
import { ScientificDisclosureModal } from './components/ui/ScientificDisclosureModal';
import { Omnibar } from './components/ui/Omnibar';
import { CELESTIAL_BODIES, CELESTIAL_ORDER, CelestialBodyData, MoonData } from './data/astronomy';
import { ScaleMode } from './utils/astronomicalUnits';
import { soundEngine } from './utils/soundEngine';
import { detectDeviceCapabilities, GRAPHICS_PRESETS } from './utils/deviceCapabilities';
import { useSimulationStore } from './state/useSimulationStore';

export function App() {
  // Navigation & Scale States
  const [viewMode, setViewMode] = useState<ViewMode>('galaxy');
  const [scaleMode, setScaleMode] = useState<ScaleMode>('enhanced');
  const [selectedBody, setSelectedBody] = useState<CelestialBodyData | null>(null);
  const [selectedMoon, setSelectedMoon] = useState<MoonData | null>(null);
  const [isHoveredOverSun, setIsHoveredOverSun] = useState<boolean>(false);
  const [transitionProgress, setTransitionProgress] = useState<number>(0);
  const [showGalaxyCard, setShowGalaxyCard] = useState<boolean>(true);

  // Simulation parameters
  const [timeScale, setTimeScale] = useState<number>(1);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showMoons, setShowMoons] = useState<boolean>(true);
  const [showAsteroids, setShowAsteroids] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showHabitableZone, setShowHabitableZone] = useState<boolean>(false);
  const [isCinematicTour, setIsCinematicTour] = useState<boolean>(false);

  // Scientific HUD & Modal States
  const [showDebugHUD, setShowDebugHUD] = useState<boolean>(false);
  const [showDisclosureModal, setShowDisclosureModal] = useState<boolean>(false);

  // Audio & Omnibar States
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isOmnibarOpen, setIsOmnibarOpen] = useState<boolean>(false);
  const [cameraResetToken, setCameraResetToken] = useState<number>(0);
  const [webglContextLost, setWebglContextLost] = useState<boolean>(false);

  // Active graphics LOD configuration
  const activeLOD = useSimulationStore((state) => state.activeLOD);
  const currentPreset = GRAPHICS_PRESETS[activeLOD || 'HIGH'] || GRAPHICS_PRESETS.HIGH;

  // Auto-detect hardware performance tier on initial load
  useEffect(() => {
    const profile = detectDeviceCapabilities();
    const currentLod = useSimulationStore.getState().activeLOD;
    if (!currentLod) {
      useSimulationStore.getState().setActiveLOD(profile.recommendedQuality);
    }
  }, []);

  // Canvas Reference for Screenshots
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Authoritative Central Simulation Time Clock (in Earth Mean Solar Days)
  const simTimeRef = useRef<number>(0);

  // Reset Simulation Time to Deterministic Epoch J2000 (t = 0)
  const handleResetSimulation = useCallback(() => {
    simTimeRef.current = 0;
    soundEngine.playUiClick();
  }, []);

  // 1. Warp from Galaxy Scale down to Solar System Scale
  const handleWarpToSolar = useCallback(() => {
    setViewMode('warp_to_solar');
    setSelectedBody(null);
    setSelectedMoon(null);
  }, []);

  // 2. Return from Solar System / Planets back to Galaxy Scale
  const handleReturnToGalaxy = useCallback(() => {
    setViewMode('warp_to_galaxy');
    setSelectedBody(null);
    setSelectedMoon(null);
  }, []);

  // 3. Select a specific Planet or the Sun
  const handleSelectBody = useCallback((body: CelestialBodyData) => {
    if (viewMode === 'galaxy') {
      setSelectedBody(body);
      setSelectedMoon(null);
      setViewMode('warp_to_solar');
    } else {
      setSelectedBody(body);
      setSelectedMoon(null);
      setViewMode('planet');
    }
  }, [viewMode]);

  // 4. Select a specific Moon of a Planet
  const handleSelectMoon = useCallback((moon: MoonData, parentBody?: CelestialBodyData) => {
    if (parentBody) {
      setSelectedBody(parentBody);
    }
    setSelectedMoon(moon);
    if (viewMode === 'galaxy') {
      setViewMode('warp_to_solar');
    } else {
      setViewMode('moon');
    }
  }, [viewMode]);

  // 5. Reset to Solar System Overview
  const handleSelectSolarOverview = useCallback(() => {
    setSelectedBody(null);
    setSelectedMoon(null);
    setViewMode('solar');
  }, []);

  // 6. Reset Camera Orientation
  const handleResetCamera = useCallback(() => {
    soundEngine.playUiClick();
    setCameraResetToken(prev => prev + 1);
  }, []);

  // 7. Screenshot Capture
  const handleScreenshot = useCallback(() => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `MilkyWay-SolarSystem-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputField = Boolean(
        target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        )
      );

      // Omnibar shortcut (Ctrl+K, Cmd+K, or '/' when not typing in an input field)
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !isInputField)) {
        e.preventDefault();
        setIsOmnibarOpen(prev => !prev);
        return;
      }

      // Escape key handles hierarchical step-back
      if (e.key === 'Escape') {
        if (showDisclosureModal) {
          setShowDisclosureModal(false);
        } else if (isOmnibarOpen) {
          setIsOmnibarOpen(false);
        } else if (showDebugHUD) {
          setShowDebugHUD(false);
        } else if (selectedMoon) {
          setSelectedMoon(null);
          setViewMode('planet');
        } else if (selectedBody) {
          setSelectedBody(null);
          setViewMode('solar');
        } else if (viewMode === 'solar') {
          handleReturnToGalaxy();
        }
        return;
      }

      // If user is typing in a text field, do not trigger single-key simulation controls
      if (isInputField) {
        return;
      }

      // Spacebar toggles simulation play/pause
      if (e.code === 'Space' && !isOmnibarOpen && !showDisclosureModal) {
        e.preventDefault();
        setTimeScale(prev => (prev > 0 ? 0 : 1));
        return;
      }

      // 'G' returns to Milky Way Galaxy
      if (e.key.toLowerCase() === 'g' && !isOmnibarOpen && !showDisclosureModal) {
        handleReturnToGalaxy();
        return;
      }

      // 'M' toggles audio mute
      if (e.key.toLowerCase() === 'm' && !isOmnibarOpen && !showDisclosureModal) {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        soundEngine.setMuted(nextMuted);
        if (!nextMuted) soundEngine.startAmbientDrone();
        return;
      }

      // '~' or 'F2' toggles Scientific Debug HUD
      if ((e.key === '`' || e.key === '~' || e.key === 'F2') && !isOmnibarOpen) {
        e.preventDefault();
        setShowDebugHUD(prev => !prev);
        return;
      }

      // 'O' toggles orbits
      if (e.key.toLowerCase() === 'o' && !isOmnibarOpen) {
        setShowOrbits(prev => !prev);
        return;
      }

      // 'L' toggles labels
      if (e.key.toLowerCase() === 'l' && !isOmnibarOpen) {
        setShowLabels(prev => !prev);
        return;
      }

      // 'C' resets camera
      if (e.key.toLowerCase() === 'c' && !isOmnibarOpen) {
        handleResetCamera();
        return;
      }

      // 'R' resets simulation epoch to t = 0
      if (e.key.toLowerCase() === 'r' && !isOmnibarOpen && !showDisclosureModal) {
        handleResetSimulation();
        return;
      }

      // Number keys 1-9 quick-select planets
      if (!isOmnibarOpen && !showDisclosureModal && e.key >= '1' && e.key <= '9') {
        const planetIndex = parseInt(e.key, 10);
        if (planetIndex < CELESTIAL_ORDER.length) {
          const planetId = CELESTIAL_ORDER[planetIndex];
          handleSelectBody(CELESTIAL_BODIES[planetId]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOmnibarOpen,
    showDisclosureModal,
    showDebugHUD,
    selectedMoon,
    selectedBody,
    viewMode,
    isMuted,
    handleReturnToGalaxy,
    handleResetCamera,
    handleResetSimulation,
    handleSelectBody
  ]);

  // Unlock Web Audio on first user interaction
  useEffect(() => {
    const handleFirstUserGesture = () => {
      soundEngine.startAmbientDrone();
      window.removeEventListener('click', handleFirstUserGesture);
    };
    window.addEventListener('click', handleFirstUserGesture, { once: true });
    return () => window.removeEventListener('click', handleFirstUserGesture);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#020208] text-white overflow-hidden select-none font-body">
      {/* 1. 3D WebGL Canvas Layer */}
      <Canvas
        dpr={[1, currentPreset.maxDpr]}
        gl={{
          antialias: activeLOD !== 'LOW',
          logarithmicDepthBuffer: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.18,
          preserveDrawingBuffer: true
        }}
        camera={{
          position: [0, 28, 86],
          fov: 46,
          near: 0.1,
          far: 10000
        }}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('[WebGL] Context lost. Attempting recovery...');
            setWebglContextLost(true);
          });
          canvas.addEventListener('webglcontextrestored', () => {
            console.info('[WebGL] Context restored.');
            setWebglContextLost(false);
          });
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <SimulationScene
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedBody={selectedBody}
          selectedMoon={selectedMoon}
          scaleMode={scaleMode}
          cameraResetToken={cameraResetToken}
          onWarpComplete={() => {
            if (viewMode === 'warp_to_solar') {
              if (selectedMoon && selectedBody) {
                setViewMode('moon');
              } else if (selectedBody) {
                setViewMode('planet');
              } else {
                setViewMode('solar');
              }
            } else {
              setViewMode('galaxy');
            }
          }}
          isCinematicTour={isCinematicTour}
          timeScale={timeScale}
          simTimeRef={simTimeRef}
          handleWarpToSolar={handleWarpToSolar}
          isHoveredOverSun={isHoveredOverSun}
          setIsHoveredOverSun={setIsHoveredOverSun}
          handleSelectBody={handleSelectBody}
          handleSelectMoon={handleSelectMoon}
          showOrbits={showOrbits}
          showMoons={showMoons}
          showAsteroids={showAsteroids}
          showLabels={showLabels}
          showHabitableZone={showHabitableZone}
          onTransitionProgressUpdate={setTransitionProgress}
        />
      </Canvas>

      {/* 2. Top Observatory Navigation Header */}
      <div className="absolute top-0 inset-x-0 z-30 pointer-events-none">
        <HeaderNav
          showDebugHUD={showDebugHUD}
          onToggleDebugHUD={() => setShowDebugHUD(prev => !prev)}
          onSelectGalaxy={handleReturnToGalaxy}
          onOpenSearch={() => setIsOmnibarOpen(true)}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      </div>

      {/* 3. Left Navigation & Observatory Tool Strip */}
      {viewMode !== 'galaxy' && viewMode !== 'warp_to_solar' && viewMode !== 'warp_to_galaxy' && (
        <LeftNavTools
          scaleMode={scaleMode}
          setScaleMode={setScaleMode}
          showOrbits={showOrbits}
          setShowOrbits={setShowOrbits}
          showMoons={showMoons}
          setShowMoons={setShowMoons}
          showAsteroids={showAsteroids}
          setShowAsteroids={setShowAsteroids}
          showLabels={showLabels}
          setShowLabels={setShowLabels}
          showHabitableZone={showHabitableZone}
          setShowHabitableZone={setShowHabitableZone}
          isCinematicTour={isCinematicTour}
          setIsCinematicTour={setIsCinematicTour}
          onResetView={handleResetCamera}
          onOpenDisclosure={() => setShowDisclosureModal(true)}
          viewMode={viewMode}
        />
      )}

      {/* 4. Right Side Telemetry Card (Milky Way or Celestial Body) */}
      <div className="absolute top-16 bottom-24 sm:bottom-28 right-2 sm:right-4 left-2 sm:left-auto max-w-[calc(100vw-1rem)] sm:max-w-[440px] z-20 flex items-center justify-end pointer-events-none">
        <div className="pointer-events-auto w-full max-h-[calc(100vh-8.5rem)] overflow-y-auto pr-1">
          {viewMode === 'galaxy' && showGalaxyCard && (
            <MilkyWayTelemetryCard
              onWarpToSolarSystem={handleWarpToSolar}
              isHoveredOverSun={isHoveredOverSun}
              onHide={() => setShowGalaxyCard(false)}
            />
          )}

          {viewMode === 'galaxy' && !showGalaxyCard && (
            <button
              type="button"
              onClick={() => setShowGalaxyCard(true)}
              className="pointer-events-auto rounded-xl border border-cyan-400/40 bg-space-950/90 px-3 py-2 text-xs font-tech font-bold text-cyan-300 shadow-neon-cyan transition-colors hover:bg-cyan-950/80"
            >
              &lt;
            </button>
          )}

          {(viewMode === 'planet' || viewMode === 'moon') && selectedBody && (
            <TelemetryCard
              body={selectedBody}
              selectedMoon={selectedMoon}
              onSelectMoon={handleSelectMoon}
              onSelectBody={handleSelectBody}
              onClose={handleSelectSolarOverview}
              onZoomOutToSolar={handleSelectSolarOverview}
              simTimeRef={simTimeRef}
            />
          )}
        </div>
      </div>

      {/* 5. Bottom Scientific Cockpit & Scale Deck */}
      {viewMode !== 'warp_to_solar' && viewMode !== 'warp_to_galaxy' && (
        <BottomControlDeck
          timeScale={timeScale}
          setTimeScale={setTimeScale}
          selectedBodyId={selectedBody?.id || null}
          onSelectBody={handleSelectBody}
          viewMode={viewMode}
          scaleMode={scaleMode}
          onReturnToGalaxy={handleReturnToGalaxy}
          onWarpToSolar={handleWarpToSolar}
          onSelectSolarOverview={handleSelectSolarOverview}
          onScreenshot={handleScreenshot}
          onResetSimulation={handleResetSimulation}
        />
      )}

      {/* 6. Cinematic Interstellar Transit Telemetry Overlay */}
      <TransitionOverlay viewMode={viewMode} progress={transitionProgress} />

      {/* 7. Developer / Scientific Validation HUD */}
      <ScientificDebugHUD
        visible={showDebugHUD}
        viewMode={viewMode}
        scaleMode={scaleMode}
        selectedBody={selectedBody}
        timeScale={timeScale}
        simTimeRef={simTimeRef}
      />

      {/* 8. Scientific Methodology & Disclosures Modal */}
      <ScientificDisclosureModal
        isOpen={showDisclosureModal}
        onClose={() => setShowDisclosureModal(false)}
      />

      {/* 9. Search & Teleport Omnibar Dialog */}
      <Omnibar
        isOpen={isOmnibarOpen}
        onClose={() => setIsOmnibarOpen(false)}
        onSelectBody={handleSelectBody}
        onSelectMoon={(body, moon) => {
          handleSelectMoon(moon, body);
        }}
        onSelectGalaxy={handleReturnToGalaxy}
      />

      {/* 10. WebGL GPU Context Loss Recovery Banner */}
      {webglContextLost && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="p-6 rounded-2xl bg-space-950 border border-amber-500/50 text-center font-tech shadow-2xl">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping inline-block mb-3" />
            <h3 className="text-lg font-bold text-amber-300">GPU CONTEXT RECOVERY IN PROGRESS</h3>
            <p className="text-xs text-gray-400 mt-1 font-mono">Restoring WebGL pipeline buffers and texture shaders...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
