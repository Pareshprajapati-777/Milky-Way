import React from 'react';
import * as THREE from 'three';
import { CELESTIAL_BODIES, CELESTIAL_ORDER, CelestialBodyData, MoonData } from '../../../data/astronomy';
import { SunBody } from './SunBody';
import { PlanetBody } from './PlanetBody';
import { OrbitPath } from './OrbitPath';
import { AsteroidBelt } from './AsteroidBelt';
import { ScaleMode, auToVisualDistance } from '../../../utils/astronomicalUnits';
import { GravityWellGrid } from '../physics-overlays/GravityWellGrid';
import { LagrangeMarkers } from '../physics-overlays/LagrangeMarkers';
import { Magnetosphere } from '../physics-overlays/Magnetosphere';
import { HohmannTransferOrbit } from '../physics-overlays/HohmannTransferOrbit';
import { useSimulationStore } from '../../../state/useSimulationStore';

interface SolarSystemProps {
  timeScale: number;
  simTime?: number;
  simTimeRef?: React.MutableRefObject<number>;
  selectedBodyId: string | null;
  selectedMoonId: string | null;
  scaleMode?: ScaleMode;
  onSelectBody: (body: CelestialBodyData) => void;
  onSelectMoon: (moon: MoonData) => void;
  showOrbits: boolean;
  showMoons: boolean;
  showAsteroids: boolean;
  showLabels: boolean;
  showHabitableZone: boolean;
  visible: boolean;
  scale?: number;
  position?: [number, number, number];
}

export const SolarSystem: React.FC<SolarSystemProps> = ({
  timeScale,
  simTime = 0,
  simTimeRef,
  selectedBodyId,
  selectedMoonId,
  scaleMode = 'enhanced',
  onSelectBody,
  onSelectMoon,
  showOrbits,
  showMoons,
  showAsteroids,
  showLabels,
  showHabitableZone,
  visible,
  scale = 1.0,
  position = [0, 0, 0]
}) => {
  if (!visible || scale <= 0.001) return null;

  const planetsList = CELESTIAL_ORDER.filter(id => id !== 'sun').map(id => CELESTIAL_BODIES[id]);

  // Habitable zone boundaries: 0.95 AU to 1.37 AU
  const hzInner = scaleMode === 'true_scale' ? 0.95 * 23481.0 : auToVisualDistance(0.95);
  const hzOuter = scaleMode === 'true_scale' ? 1.37 * 23481.0 : auToVisualDistance(1.37);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. The Sun (Central Yellow Dwarf Star & Primary Illuminator) */}
      <SunBody
        onSelect={() => onSelectBody(CELESTIAL_BODIES.sun)}
        isSelected={selectedBodyId === 'sun'}
        timeScale={timeScale}
        scaleMode={scaleMode}
      />

      {/* 2. Habitable Goldilocks Zone (Green Life-Supporting Belt) */}
      {showHabitableZone && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[hzInner, hzOuter, 96]} />
          <meshBasicMaterial
            color="#22C55E"
            transparent
            opacity={0.09}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3. Keplerian Orbit Paths for all planets (exact trajectory match) */}
      {planetsList.map((planet) => (
        <OrbitPath
          key={`orbit-${planet.id}`}
          planetId={planet.id}
          scaleMode={scaleMode}
          color={planet.accentColor}
          visible={showOrbits}
          isHighlighted={selectedBodyId === planet.id}
          opacity={selectedBodyId === planet.id ? 0.95 : 0.48}
        />
      ))}

      {/* 4. Main Asteroid Belt (Between Mars ~1.5 AU and Jupiter ~5.2 AU) */}
      <AsteroidBelt
        innerRadius={scaleMode === 'true_scale' ? 2.2 * 23481.0 : auToVisualDistance(2.2)}
        outerRadius={scaleMode === 'true_scale' ? 3.2 * 23481.0 : auToVisualDistance(3.2)}
        count={2400}
        timeScale={timeScale}
        visible={showAsteroids}
      />

      {/* 5. Kuiper Belt (Beyond Neptune ~30 to 45 AU) */}
      <AsteroidBelt
        innerRadius={scaleMode === 'true_scale' ? 30.0 * 23481.0 : auToVisualDistance(30.0)}
        outerRadius={scaleMode === 'true_scale' ? 45.0 * 23481.0 : auToVisualDistance(45.0)}
        count={1600}
        timeScale={timeScale}
        visible={showAsteroids}
      />

      {/* Physics Overlays */}
      {useSimulationStore((state) => state.showGravityGrid) && <GravityWellGrid />}
      {useSimulationStore((state) => state.showLagrangePoints) && <LagrangeMarkers />}
      {useSimulationStore((state) => state.showMagnetosphere) && <Magnetosphere />}
      {useSimulationStore((state) => state.showHohmannTransfer) && <HohmannTransferOrbit fromPlanetId="earth" toPlanetId="mars" />}

      {/* 6. All 9 Planets with Moons (Completely preserving existing textures, shaders, atmosphere) */}
      {planetsList.map((planet) => (
        <PlanetBody
          key={planet.id}
          planet={planet}
          timeScale={timeScale}
          simTime={simTime}
          simTimeRef={simTimeRef}
          scaleMode={scaleMode}
          onSelectPlanet={onSelectBody}
          onSelectMoon={onSelectMoon}
          isSelected={selectedBodyId === planet.id}
          selectedMoonId={selectedMoonId}
          showOrbits={showOrbits}
          showMoons={showMoons}
          showLabels={showLabels}
          isAnyPlanetSelected={selectedBodyId !== null}
        />
      ))}
    </group>
  );
};
