import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createSeededRandom } from '../../utils/seededRandom';
import { useSimulationStore } from '../../state/useSimulationStore';
import { GRAPHICS_PRESETS } from '../../utils/deviceCapabilities';

interface WarpTunnelProps {
  active: boolean;
  progress: number; // 0.0 to 1.0 from transition timeline
}

/**
 * Cinematic Relativistic Space Flight Particles
 * Renders high-velocity interstellar star streaks during scale transitions
 * between Milky Way and Solar System.
 */
export const WarpTunnel: React.FC<WarpTunnelProps> = ({ active, progress }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const activeLOD = useSimulationStore((state) => state.activeLOD);
  const preset = GRAPHICS_PRESETS[activeLOD || 'HIGH'] || GRAPHICS_PRESETS.HIGH;

  // Adaptive GPU Streaking Interstellar Particles (3,000 at High)
  const { positions, colors, speeds, lengths } = useMemo(() => {
    const count = Math.round(3000 * preset.particleMultiplier);
    const rng = createSeededRandom(0x57617270); // Seed 'Warp'
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const lengths = new Float32Array(count);

    const cyan = new THREE.Color('#00F5D4');
    const blue = new THREE.Color('#38BDF8');
    const amber = new THREE.Color('#FDE047');
    const white = new THREE.Color('#FFFFFF');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Cylinder distribution along flight corridor
      const radius = 1.5 + Math.pow(rng(), 1.5) * 55;
      const angle = rng() * Math.PI * 2;
      const z = (rng() - 0.5) * 800;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = z;

      const randColor = rng();
      const col =
        randColor < 0.38
          ? cyan
          : randColor < 0.72
          ? blue
          : randColor < 0.88
          ? white
          : amber;

      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      speeds[i] = 400 + rng() * 600;
      lengths[i] = 1.5 + rng() * 3.5;
    }

    return { positions, colors, speeds, lengths };
  }, [preset.particleMultiplier]);

  useFrame((_, delta) => {
    if (!active || !pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    // Velocity bell-curve peaks at mid-flight (t = 0.5)
    const bellCurve = Math.sin(Math.min(1.0, Math.max(0.0, progress)) * Math.PI);
    const currentSpeed = 300 + bellCurve * 1400;

    for (let i = 0; i < pos.length / 3; i++) {
      const i3 = i * 3;
      pos[i3 + 2] += speeds[i] * (currentSpeed / 600) * delta;

      // Wrap around tunnel depth
      if (pos[i3 + 2] > 250) {
        pos[i3 + 2] = -550;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  // Opacity smoothly fades in and out with flight progress
  const opacity = Math.sin(Math.min(1.0, Math.max(0.0, progress)) * Math.PI) * 0.95;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2.4}
        vertexColors
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
