import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MilkyWayGalaxy } from './galaxy/MilkyWayGalaxy';
import { SolarSystem } from './solarsystem/SolarSystem';
import { CameraController, ViewMode } from './CameraController';
import { WarpTunnel } from './WarpTunnel';
import { GalaxyPostProcessing } from './GalaxyPostProcessing';
import { CelestialBodyData, MoonData } from '../../data/astronomy';
import { ScaleMode } from '../../utils/astronomicalUnits';
import { BASE_SIM_DAYS_PER_SECOND } from '../../utils/orbitalPhysics';

const DeepSpaceStarField: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const { geometry, material } = React.useMemo(() => {
    const count = 18000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const radius = THREE.MathUtils.randFloat(900, 1800);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(THREE.MathUtils.randFloat(-1, 1));

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const colorRoll = Math.random();
      if (colorRoll < 0.6) color.set('#c9dcff');
      else if (colorRoll < 0.8) color.set('#ffffff');
      else if (colorRoll < 0.92) color.set('#ffd4a0');
      else color.set('#7ca9ff');

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = 0.35 + Math.pow(Math.random(), 8) * 4;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;

        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (110.0 / -mv.z);
          gl_PointSize = clamp(gl_PointSize, 0.35, 7.0);
          gl_Position = projectionMatrix * mv;
          vColor = color;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float alpha = 1.0 - smoothstep(0.0, 0.5, length(uv));
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vColor, alpha);
        }
      `
    });

    return { geometry: starGeometry, material: starMaterial };
  }, []);

  useFrame(() => {
    if (groupRef.current) groupRef.current.position.copy(camera.position);
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
};

interface SimulationSceneProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedBody: CelestialBodyData | null;
  selectedMoon: MoonData | null;
  scaleMode: ScaleMode;
  onWarpComplete: () => void;
  isCinematicTour: boolean;
  timeScale: number;
  simTimeRef?: React.MutableRefObject<number>;
  handleWarpToSolar: () => void;
  isHoveredOverSun: boolean;
  setIsHoveredOverSun: (hovered: boolean) => void;
  handleSelectBody: (body: CelestialBodyData) => void;
  handleSelectMoon: (moon: MoonData) => void;
  showOrbits: boolean;
  showMoons: boolean;
  showAsteroids: boolean;
  showLabels: boolean;
  showHabitableZone: boolean;
  onTransitionProgressUpdate?: (progress: number) => void;
}

export const SimulationScene: React.FC<SimulationSceneProps> = ({
  viewMode,
  setViewMode,
  selectedBody,
  selectedMoon,
  scaleMode,
  onWarpComplete,
  isCinematicTour,
  timeScale,
  simTimeRef,
  handleWarpToSolar,
  isHoveredOverSun,
  setIsHoveredOverSun,
  handleSelectBody,
  handleSelectMoon,
  showOrbits,
  showMoons,
  showAsteroids,
  showLabels,
  showHabitableZone,
  onTransitionProgressUpdate
}) => {
  const fallbackSimTimeRef = useRef<number>(0);
  const activeSimTimeRef = simTimeRef || fallbackSimTimeRef;
  const [transitionProgress, setTransitionProgress] = useState<number>(0);

  const isWarping = viewMode === 'warp_to_solar' || viewMode === 'warp_to_galaxy';

  // Continuous Exponential Scale & Opacity Calculations:
  // When warping to solar: transitionProgress goes 0 -> 1
  // Galaxy fades out as camera penetrates into Orion Arm (1.0 -> 0.0)
  // Solar system scales up smoothly into view (0.001 -> 1.0)
  const isGalacticOrTransit = viewMode === 'galaxy' || viewMode === 'warp_to_solar' || viewMode === 'warp_to_galaxy';
  
  let galaxyOpacity = 1.0;
  let solarScale = 1.0;

  if (viewMode === 'galaxy') {
    galaxyOpacity = 1.0;
    solarScale = 0.0;
  } else if (viewMode === 'warp_to_solar') {
    // Exponential ease out: galaxy fades as user zooms in deep
    galaxyOpacity = Math.max(0.0, 1.0 - Math.pow(transitionProgress, 1.5));
    // Solar system expands exponentially from micro-point to full size
    solarScale = Math.min(1.0, Math.pow(transitionProgress, 2.0));
  } else if (viewMode === 'warp_to_galaxy') {
    galaxyOpacity = Math.min(1.0, Math.pow(transitionProgress, 0.7));
    solarScale = Math.max(0.0, 1.0 - Math.pow(transitionProgress, 1.8));
  } else {
    galaxyOpacity = 0.0;
    solarScale = 1.0;
  }

  useFrame((_, delta) => {
    if (timeScale > 0) {
      activeSimTimeRef.current += delta * timeScale * BASE_SIM_DAYS_PER_SECOND;
    }
  });

  const handleProgress = (p: number) => {
    setTransitionProgress(p);
    if (onTransitionProgressUpdate) {
      onTransitionProgressUpdate(p);
    }
  };

  return (
    <>
      {viewMode === 'galaxy' ? null : <DeepSpaceStarField />}

      {/* Universal Ambient Starlight */}
      <ambientLight intensity={0.45} color="#64748B" />

      {/* Multi-Scale Camera Controller */}
      <CameraController
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedBody={selectedBody}
        selectedMoon={selectedMoon}
        scaleMode={scaleMode}
        onWarpComplete={onWarpComplete}
        onTransitionProgress={handleProgress}
        isCinematicTour={isCinematicTour}
        timeScale={timeScale}
        simTimeRef={activeSimTimeRef}
      />

      {/* Relativistic Warp Flight Streaks */}
      <WarpTunnel active={isWarping} progress={transitionProgress} />

      {/* 3D Milky Way Galaxy View (with continuous opacity fading) */}
      <MilkyWayGalaxy
        visible={isGalacticOrTransit}
        opacity={galaxyOpacity}
        onWarpToSolarSystem={handleWarpToSolar}
        isHoveredOverSun={isHoveredOverSun}
        setIsHoveredOverSun={setIsHoveredOverSun}
      />

      {/* 3D Solar System View (with continuous exponential scale-in) */}
      <SolarSystem
        visible={viewMode !== 'galaxy'}
        scale={solarScale}
        timeScale={timeScale}
        simTimeRef={activeSimTimeRef}
        selectedBodyId={selectedBody?.id || null}
        selectedMoonId={selectedMoon?.id || null}
        scaleMode={scaleMode}
        onSelectBody={handleSelectBody}
        onSelectMoon={handleSelectMoon}
        showOrbits={showOrbits}
        showMoons={showMoons}
        showAsteroids={showAsteroids}
        showLabels={showLabels}
        showHabitableZone={showHabitableZone}
      />

      {/* Cinematic Post-Processing Bloom pipeline from REYAL look/milky_way.html */}
      <GalaxyPostProcessing viewMode={viewMode} />
    </>
  );
};
