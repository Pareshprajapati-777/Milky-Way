import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface MagnetosphereProps {
  radius?: number;
  fieldLineCount?: number;
  includeParkerSpiral?: boolean;
}

/**
 * 3D Planetary Dipole Magnetic Field Lines & Solar Wind Vectors
 * - Van Allen Radiation Belts & Dipole deflection around Earth / planetary bodies
 * - Parker Spiral Solar Wind stream lines originating from the Sun
 */
export const Magnetosphere: React.FC<MagnetosphereProps> = ({
  radius = 2.5,
  fieldLineCount = 16,
  includeParkerSpiral = true
}) => {
  // 1. Van Allen Dipole Field Lines
  const dipoleGeometries = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];

    for (let i = 0; i < fieldLineCount; i++) {
      const phi = (i / fieldLineCount) * Math.PI * 2;
      const points: THREE.Vector3[] = [];

      // Dipole equation: r = R0 * sin^2(theta)
      const R0 = radius * 2.4;
      for (let t = 0.15; t <= Math.PI - 0.15; t += 0.06) {
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

  // 2. Parker Spiral Solar Wind Streamlines (Archimedean spiral from solar rotation)
  const parkerSpiralGeometries = useMemo(() => {
    if (!includeParkerSpiral) return [];
    const spirals: THREE.BufferGeometry[] = [];
    const numSpirals = 8;
    const maxRadius = 45.0;

    for (let s = 0; s < numSpirals; s++) {
      const phi0 = (s / numSpirals) * Math.PI * 2;
      const points: THREE.Vector3[] = [];

      // Parker spiral formula: r = v_sw * (t), theta = omega * r / v_sw
      for (let r = 2.5; r <= maxRadius; r += 0.8) {
        const theta = phi0 - r * 0.12; // Spiral pitch
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        points.push(new THREE.Vector3(x, 0, z));
      }

      const geom = new THREE.BufferGeometry().setFromPoints(points);
      spirals.push(geom);
    }
    return spirals;
  }, [includeParkerSpiral]);

  useEffect(() => {
    return () => {
      dipoleGeometries.forEach((g) => g.dispose());
      parkerSpiralGeometries.forEach((g) => g.dispose());
    };
  }, [dipoleGeometries, parkerSpiralGeometries]);

  return (
    <group>
      {/* Dipole Van Allen Radiation Belts */}
      {dipoleGeometries.map((geom, idx) => (
        <primitive key={`dipole-${idx}`} object={new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.40 }))} />
      ))}

      {/* Parker Spiral Solar Wind Vectors */}
      {parkerSpiralGeometries.map((geom, idx) => (
        <primitive key={`parker-${idx}`} object={new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.25 }))} />
      ))}
    </group>
  );
};
