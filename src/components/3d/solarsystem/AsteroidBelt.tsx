import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createSeededRandom } from '../../../utils/seededRandom';
import { useSimulationStore } from '../../../state/useSimulationStore';
import { GRAPHICS_PRESETS } from '../../../utils/deviceCapabilities';

interface AsteroidBeltProps {
  innerRadius?: number;
  outerRadius?: number;
  count?: number;
  timeScale?: number;
  visible?: boolean;
}

export const AsteroidBelt: React.FC<AsteroidBeltProps> = ({
  innerRadius = 105,
  outerRadius = 125,
  count = 3200,
  timeScale = 1,
  visible = true
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const activeLOD = useSimulationStore((state) => state.activeLOD);
  const preset = GRAPHICS_PRESETS[activeLOD || 'HIGH'] || GRAPHICS_PRESETS.HIGH;

  const effectiveCount = Math.max(100, Math.round(count * preset.asteroidCountMultiplier));

  // Compute deterministic seeded orbital parameters for each asteroid
  const asteroids = useMemo(() => {
    const list = [];
    const rng = createSeededRandom(0x41737465); // Seed 'Aste'
    for (let i = 0; i < effectiveCount; i++) {
      const radius = innerRadius + rng() * (outerRadius - innerRadius);
      const angle = rng() * Math.PI * 2;
      const speed = (0.55 / Math.sqrt(radius / 100)) * (0.85 + rng() * 0.3);
      const height = (rng() - 0.5) * 5.5;
      const scale = 0.3 + rng() * 0.7;
      const rotSpeedX = (rng() - 0.5) * 2.0;
      const rotSpeedY = (rng() - 0.5) * 2.0;
      const rotSpeedZ = (rng() - 0.5) * 2.0;

      list.push({
        radius,
        angle,
        speed,
        height,
        scale,
        rotX: rng() * Math.PI,
        rotY: rng() * Math.PI,
        rotZ: rng() * Math.PI,
        rotSpeedX,
        rotSpeedY,
        rotSpeedZ
      });
    }
    return list;
  }, [innerRadius, outerRadius, effectiveCount]);

  useFrame((_, delta) => {
    if (!visible || !meshRef.current) return;
    const adjustedDelta = delta * timeScale;

    asteroids.forEach((ast, i) => {
      // Orbital progression
      ast.angle += ast.speed * adjustedDelta * 0.05;
      ast.rotX += ast.rotSpeedX * adjustedDelta;
      ast.rotY += ast.rotSpeedY * adjustedDelta;
      ast.rotZ += ast.rotSpeedZ * adjustedDelta;

      const x = Math.cos(ast.angle) * ast.radius;
      const z = Math.sin(ast.angle) * ast.radius;
      const y = ast.height;

      dummy.position.set(x, y, z);
      dummy.rotation.set(ast.rotX, ast.rotY, ast.rotZ);
      dummy.scale.set(ast.scale, ast.scale, ast.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, effectiveCount]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[0.5, 1]} />
      <meshStandardMaterial
        color="#78716C"
        roughness={0.9}
        metalness={0.2}
      />
    </instancedMesh>
  );
};
