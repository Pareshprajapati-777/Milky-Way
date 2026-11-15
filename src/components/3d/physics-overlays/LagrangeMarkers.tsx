import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface LagrangeSystem {
  primaryName: string;
  secondaryName: string;
  r: number;
  rotationOffset: number;
}

interface LagrangeMarkersProps {
  scaleFactor?: number;
}

/**
 * Lagrange Points (L1 - L5) & Hill Sphere Visualization
 * Displays Sun-Earth (with JWST at L2) and Sun-Jupiter Lagrange positions:
 * - L1: Between Sun and secondary body, balanced by gravitational pull
 * - L2: Beyond secondary body, home to JWST (1.5M km from Earth)
 * - L3: Opposite side of Sun along orbit
 * - L4: Leading secondary body by +60° (Greek camp for Jupiter)
 * - L5: Trailing secondary body by -60° (Trojan camp for Jupiter)
 *
 * Visual Scaling Note:
 * Real Hill sphere radius r_H = r * (m / 3M)^(1/3) is ~0.01 AU for Earth.
 * In 3D visualization, L1/L2 radial offsets are visually enlarged to 4% (0.04 * r)
 * to prevent marker geometry from intersecting the rendered planetary body.
 */
export const LagrangeMarkers: React.FC<LagrangeMarkersProps> = ({
  scaleFactor = 25.0
}) => {
  const systems: LagrangeSystem[] = [
    { primaryName: 'Sun', secondaryName: 'Earth', r: 1.0 * scaleFactor, rotationOffset: 0 },
    { primaryName: 'Sun', secondaryName: 'Jupiter', r: 5.2 * 12.0, rotationOffset: Math.PI / 4 }
  ];

  return (
    <group>
      {systems.map((sys, sIdx) => {
        const r = sys.r;
        const l4x = r * Math.cos(Math.PI / 3 + sys.rotationOffset);
        const l4z = r * Math.sin(Math.PI / 3 + sys.rotationOffset);
        const l5x = r * Math.cos(-Math.PI / 3 + sys.rotationOffset);
        const l5z = r * Math.sin(-Math.PI / 3 + sys.rotationOffset);

        const l1x = (r * 0.96) * Math.cos(sys.rotationOffset);
        const l1z = (r * 0.96) * Math.sin(sys.rotationOffset);
        const l2x = (r * 1.04) * Math.cos(sys.rotationOffset);
        const l2z = (r * 1.04) * Math.sin(sys.rotationOffset);
        const l3x = -r * Math.cos(sys.rotationOffset);
        const l3z = -r * Math.sin(sys.rotationOffset);

        const points = [
          { label: `${sys.secondaryName} L1`, pos: [l1x, 0, l1z] as [number, number, number], color: '#ffea75', info: 'SOHO / Solar Observatory' },
          { label: `${sys.secondaryName} L2`, pos: [l2x, 0, l2z] as [number, number, number], color: '#38bdf8', info: sys.secondaryName === 'Earth' ? '★ JWST (James Webb)' : 'Deep Space Station' },
          { label: `${sys.secondaryName} L3`, pos: [l3x, 0, l3z] as [number, number, number], color: '#ff7596', info: 'Anti-Solar Horizon' },
          { label: `${sys.secondaryName} L4`, pos: [l4x, 0, l4z] as [number, number, number], color: '#66ffaa', info: sys.secondaryName === 'Jupiter' ? 'Greek Asteroid Camp (+60° Leading)' : 'Equilateral Leading' },
          { label: `${sys.secondaryName} L5`, pos: [l5x, 0, l5z] as [number, number, number], color: '#66ffaa', info: sys.secondaryName === 'Jupiter' ? 'Trojan Asteroid Camp (-60° Trailing)' : 'Equilateral Trailing' }
        ];

        return (
          <group key={sIdx}>
            {points.map((pt, idx) => (
              <group key={idx} position={pt.pos}>
                <mesh>
                  <octahedronGeometry args={[0.35, 0]} />
                  <meshBasicMaterial color={pt.color} wireframe />
                </mesh>
                <mesh>
                  <sphereGeometry args={[0.10, 16, 16]} />
                  <meshBasicMaterial color={pt.color} />
                </mesh>
                <Html distanceFactor={60} position={[0, 0.6, 0]} center>
                  <div className="px-1.5 py-0.5 rounded bg-black/85 border border-white/20 text-[9px] font-mono text-white whitespace-nowrap pointer-events-none shadow-md">
                    <span className="font-bold" style={{ color: pt.color }}>{pt.label}</span>
                    <span className="text-gray-300 block text-[8px]">{pt.info}</span>
                  </div>
                </Html>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
};

