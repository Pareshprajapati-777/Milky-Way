import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getPlanetOrbitLinePoints } from '../../../utils/orbitalPhysics';
import { ScaleMode } from '../../../utils/astronomicalUnits';

interface OrbitPathProps {
  planetId: string;
  scaleMode?: ScaleMode;
  color?: string;
  opacity?: number;
  visible?: boolean;
  isHighlighted?: boolean;
}

export const OrbitPath: React.FC<OrbitPathProps> = ({
  planetId,
  scaleMode = 'enhanced',
  color = '#38BDF8',
  opacity = 0.45,
  visible = true,
  isHighlighted = false
}) => {
  // Generate 3D trajectory points using the exact same Keplerian equations as the planet
  const points = useMemo(() => {
    return getPlanetOrbitLinePoints(planetId, scaleMode, 256);
  }, [planetId, scaleMode]);

  const lineGeometry = useMemo(() => {
    if (!points || points.length === 0) return null;
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  if (!visible || !lineGeometry) return null;

  const activeOpacity = isHighlighted ? 0.95 : Math.max(0.42, opacity);

  return (
    <group>
      {/* 1. Primary Crisp Keplerian Orbit LineLoop (Guaranteed Seamless Loop) */}
      <lineLoop geometry={lineGeometry}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={activeOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineLoop>

      {/* 2. Secondary Luminous Accent Glow when Planet is Hovered or Selected */}
      {isHighlighted && (
        <lineLoop geometry={lineGeometry}>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineLoop>
      )}
    </group>
  );
};
