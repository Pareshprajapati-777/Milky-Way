import React, { useMemo } from 'react';
import * as THREE from 'three';

interface MagnetosphereProps {
  radius?: number;
  fieldLineCount?: number;
}

/**
 * 3D Planetary Dipole Magnetic Field Lines
 * Shows Earth's / Jupiter's Van Allen radiation belts & magnetosphere deflection
 */
export const Magnetosphere: React.FC<MagnetosphereProps> = ({
  radius = 2.5,
  fieldLineCount = 12
}) => {
  const lineGeometries = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];

    for (let i = 0; i < fieldLineCount; i++) {
      const phi = (i / fieldLineCount) * Math.PI * 2;
      const points: THREE.Vector3[] = [];

      // Dipole equation: r = R0 * sin^2(theta)
      const R0 = radius * 2.2;
      for (let t = 0.2; t <= Math.PI - 0.2; t += 0.08) {
        const r = R0 * Math.sin(t) * Math.sin(t);
        const x = r * Math.sin(t) * Math.cos(phi);
        const y = r * Math.cos(t); // Dipole along Y-axis
        const z = r * Math.sin(t) * Math.sin(phi);
        points.push(new THREE.Vector3(x, y, z));
      }

      const geom = new THREE.BufferGeometry().setFromPoints(points);
      geometries.push(geom);
    }
    return geometries;
  }, [radius, fieldLineCount]);

  return (
    <group>
      {lineGeometries.map((geom, idx) => (
        <primitive key={idx} object={new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x33ccff, transparent: true, opacity: 0.35 }))} />
      ))}
    </group>
  );
};
