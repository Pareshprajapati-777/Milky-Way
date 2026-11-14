import React from 'react';
import * as THREE from 'three';

interface LagrangeMarkersProps {
  primaryRadiusAU?: number;
  scaleFactor?: number;
}

/**
 * Lagrange Points (L1 - L5) & Hill Sphere Visualization
 * Calculated for Sun-Earth gravitational equilibrium positions
 */
export const LagrangeMarkers: React.FC<LagrangeMarkersProps> = ({
  primaryRadiusAU = 1.0,
  scaleFactor = 25.0
}) => {
  const r = primaryRadiusAU * scaleFactor;
  // L1 is between Sun & Earth (~0.99 r)
  // L2 is outer side (~1.01 r)
  // L3 is opposite side (~-1.0 r)
  // L4 is 60° ahead along orbit
  // L5 is 60° behind along orbit
  const l4x = r * Math.cos(Math.PI / 3);
  const l4z = r * Math.sin(Math.PI / 3);
  const l5x = r * Math.cos(-Math.PI / 3);
  const l5z = r * Math.sin(-Math.PI / 3);

  const points = [
    { label: 'L1', pos: [r * 0.96, 0, 0] as [number, number, number], color: '#ffea75' },
    { label: 'L2', pos: [r * 1.04, 0, 0] as [number, number, number], color: '#ffea75' },
    { label: 'L3', pos: [-r, 0, 0] as [number, number, number], color: '#ff7596' },
    { label: 'L4 (Trojan)', pos: [l4x, 0, l4z] as [number, number, number], color: '#66ffaa' },
    { label: 'L5 (Greek)', pos: [l5x, 0, l5z] as [number, number, number], color: '#66ffaa' }
  ];

  return (
    <group>
      {points.map((pt, idx) => (
        <group key={idx} position={pt.pos}>
          <mesh>
            <octahedronGeometry args={[0.25, 0]} />
            <meshBasicMaterial color={pt.color} wireframe />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color={pt.color} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

