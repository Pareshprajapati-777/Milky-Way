import React, { useMemo } from 'react';
import * as THREE from 'three';

interface GravityWellGridProps {
  gridSize?: number;
  divisions?: number;
  depthScale?: number;
}

/**
 * 3D Curved Spacetime Wireframe (General Relativity Gravity Well Visualization)
 * Visualizes the curvature of spacetime around the Sun / massive bodies
 */
export const GravityWellGrid: React.FC<GravityWellGridProps> = ({
  gridSize = 60,
  divisions = 60,
  depthScale = 4.0
}) => {
  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(gridSize, gridSize, divisions, divisions);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.sqrt(x * x + z * z);
      // Schwarzschild curvature funnel: z ~ -1 / (r + c)
      const dip = -depthScale / (r * 0.4 + 1.2);
      pos.setY(i, dip);
    }
    geom.computeVertexNormals();
    return geom;
  }, [gridSize, divisions, depthScale]);

  return (
    <group position={[0, -0.5, 0]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#00ddff"
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>
    </group>
  );
};

