import React, { useMemo } from 'react';
import * as THREE from 'three';

interface MassSource {
  x: number;
  z: number;
  massWeight: number; // proportional to GM
}

interface GravityWellGridProps {
  gridSize?: number;
  divisions?: number;
  masses?: MassSource[];
}

/**
 * Gravitational Potential Well Grid (3D Spacetime Fabric)
 * Deformable wireframe representing curvature of spacetime bending proportionally to:
 * Φ(x, z) ∝ -Σ (GM_i / r_i)
 * for Sun, Jupiter, Earth, and Sagittarius A*
 */
export const GravityWellGrid: React.FC<GravityWellGridProps> = ({
  gridSize = 120,
  divisions = 80,
  masses = [
    { x: 0, z: 0, massWeight: 18.0 },      // The Sun (or Sgr A* in galactic frame)
    { x: 30, z: 20, massWeight: 3.5 },     // Jupiter well
    { x: 18, z: 0, massWeight: 1.2 }       // Earth well
  ]
}) => {
  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(gridSize, gridSize, divisions, divisions);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      let totalPotential = 0;
      for (const m of masses) {
        const dx = x - m.x;
        const dz = z - m.z;
        const r = Math.sqrt(dx * dx + dz * dz);
        // Potential ~ -GM / (r + softening)
        totalPotential -= m.massWeight / (r * 0.45 + 1.2);
      }

      pos.setY(i, Math.max(-12.0, totalPotential));
    }
    geom.computeVertexNormals();
    return geom;
  }, [gridSize, divisions, masses]);

  return (
    <group position={[0, -0.6, 0]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#00F5D4"
          wireframe
          transparent
          opacity={0.28}
        />
      </mesh>
    </group>
  );
};

