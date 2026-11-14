import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { CENTRAL_PLANETARY_DATA, MU_SUN_KM3_S2, KM_PER_AU } from '../../../data/planetaryOrbits';

interface HohmannTransferOrbitProps {
  fromPlanetId?: string;
  toPlanetId?: string;
  scaleFactor?: number;
}

/**
 * Hohmann Transfer Orbit Calculator & Visualization
 * Calculates optimal bi-elliptic transfer orbit:
 * - Semi-major axis: a_tx = (r1 + r2) / 2
 * - Transfer duration: t_tx = π * sqrt(a_tx³ / μ)
 * - Delta-v1 (departure burn): Δv1 = sqrt(μ/r1) * (sqrt(2*r2 / (r1 + r2)) - 1)
 * - Delta-v2 (insertion burn): Δv2 = sqrt(μ/r2) * (1 - sqrt(2*r1 / (r1 + r2)))
 */
export const HohmannTransferOrbit: React.FC<HohmannTransferOrbitProps> = ({
  fromPlanetId = 'earth',
  toPlanetId = 'mars',
  scaleFactor = 25.0
}) => {
  const p1 = CENTRAL_PLANETARY_DATA[fromPlanetId] || CENTRAL_PLANETARY_DATA['earth'];
  const p2 = CENTRAL_PLANETARY_DATA[toPlanetId] || CENTRAL_PLANETARY_DATA['mars'];

  const r1_AU = p1.semiMajorAxisAU;
  const r2_AU = p2.semiMajorAxisAU;

  const r1_km = r1_AU * KM_PER_AU;
  const r2_km = r2_AU * KM_PER_AU;

  // Semi-major axis of the transfer ellipse
  const a_tx_km = (r1_km + r2_km) / 2.0;
  const a_tx_AU = (r1_AU + r2_AU) / 2.0;

  // Eccentricity of transfer orbit
  const e_tx = Math.abs(r2_AU - r1_AU) / (r2_AU + r1_AU);

  // Delta-V 1 & 2
  const v1_circ = Math.sqrt(MU_SUN_KM3_S2 / r1_km);
  const v2_circ = Math.sqrt(MU_SUN_KM3_S2 / r2_km);

  const deltaV1 = Math.abs(Math.sqrt(MU_SUN_KM3_S2 * (2.0 / r1_km - 1.0 / a_tx_km)) - v1_circ);
  const deltaV2 = Math.abs(v2_circ - Math.sqrt(MU_SUN_KM3_S2 * (2.0 / r2_km - 1.0 / a_tx_km)));
  const totalDeltaV = deltaV1 + deltaV2;

  // Transfer time in days: t_tx = π * sqrt(a_tx³ / μ)
  const transferTimeSeconds = Math.PI * Math.sqrt(Math.pow(a_tx_km, 3) / MU_SUN_KM3_S2);
  const transferDays = transferTimeSeconds / 86400;

  // Build half-ellipse curve
  const { curvePoints, midPoint } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const numPoints = 80;

    for (let i = 0; i <= numPoints; i++) {
      const nu = (i / numPoints) * Math.PI; // Half orbit from 0 to π
      const rAU = (a_tx_AU * (1 - e_tx * e_tx)) / (1 + e_tx * Math.cos(nu));
      const visualR = rAU * scaleFactor;
      const x = visualR * Math.cos(nu);
      const z = visualR * Math.sin(nu);
      points.push(new THREE.Vector3(x, 0.05, z));
    }

    const midIdx = Math.floor(numPoints / 2);
    return { curvePoints: points, midPoint: points[midIdx] };
  }, [a_tx_AU, e_tx, scaleFactor]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(curvePoints), [curvePoints]);

  return (
    <group>
      {/* Transfer trajectory line */}
      <primitive
        object={new THREE.Line(geometry, new THREE.LineDashedMaterial({
          color: 0xff3b30,
          dashSize: 1.2,
          gapSize: 0.6,
          linewidth: 2
        }))}
      />

      {/* Trajectory Infocard */}
      <Html position={[midPoint.x, 2.0, midPoint.z]} center distanceFactor={70}>
        <div className="p-2.5 rounded-xl bg-space-950/90 border border-red-500/40 text-[10px] font-mono text-white shadow-xl backdrop-blur-md pointer-events-none whitespace-nowrap">
          <div className="font-bold text-red-400 flex items-center gap-1 mb-1">
            <span>🚀 HOHMANN TRANSFER:</span>
            <span className="uppercase text-white">{p1.name} ➔ {p2.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 text-gray-300 text-[9px]">
            <div>Transfer Time: <span className="text-white font-bold">{transferDays.toFixed(0)} Days</span></div>
            <div>Total Δv: <span className="text-cyber-cyan font-bold">{totalDeltaV.toFixed(2)} km/s</span></div>
            <div>Burn 1 (Departure): <span className="text-amber-400 font-bold">{deltaV1.toFixed(2)} km/s</span></div>
            <div>Burn 2 (Capture): <span className="text-amber-400 font-bold">{deltaV2.toFixed(2)} km/s</span></div>
          </div>
        </div>
      </Html>
    </group>
  );
};
