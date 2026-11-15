import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { MoonData } from '../../../data/astronomy';
import { getSpecializedMoonTexture } from '../../../utils/proceduralTextures';
import { getRealisticMoonTexture, getRealisticMoonElevationTexture } from '../../../utils/realisticTextures';
import { soundEngine } from '../../../utils/soundEngine';
import { getMoonRelativePosition } from '../../../utils/orbitalPhysics';

interface MoonBodyProps {
  moonData: MoonData;
  timeScale: number;
  simTime?: number;
  simTimeRef?: React.MutableRefObject<number>;
  onSelectMoon: (moon: MoonData) => void;
  isSelected: boolean;
  parentDistance: number;
}

/**
 * Photorealistic Lunar Body matching REYAL look/moon.html:
 * - 8K lunar albedo equirectangular surface
 * - NASA LOLA elevation bump map for crater relief
 * - MeshStandardMaterial (roughness: 0.94, metalness: 0.0, bumpScale: 0.052)
 * - Subtle photographic rim halo at 1.018
 */
export const MoonBody: React.FC<MoonBodyProps> = ({
  moonData,
  timeScale,
  simTime = 0,
  simTimeRef,
  onSelectMoon,
  isSelected
}) => {
  const moonGroupRef = useRef<THREE.Group>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Surface texture and bump mapping
  const isEarthMoon = moonData.id === 'moon';
  const texture = useMemo(() => {
    if (isEarthMoon) {
      return getRealisticMoonTexture();
    }
    return getSpecializedMoonTexture(moonData.textureType);
  }, [isEarthMoon, moonData.textureType]);

  const elevationTexture = useMemo(() => {
    if (isEarthMoon) {
      return getRealisticMoonElevationTexture();
    }
    return null;
  }, [isEarthMoon]);

  // Authentic 3D inclination rotation for the moon's orbit path
  const orbitRotation = useMemo(() => {
    const incRad = THREE.MathUtils.degToRad(moonData.inclinationDeg ?? 0);
    const nodeRad = THREE.MathUtils.degToRad(moonData.longitudeAscendingNodeDeg ?? 0);
    return new THREE.Euler(-Math.PI / 2 + incRad, 0, nodeRad, 'YXZ');
  }, [moonData.inclinationDeg, moonData.longitudeAscendingNodeDeg]);

  useFrame((_, delta) => {
    const adjustedDelta = delta * timeScale;
    const currentTime = simTimeRef ? simTimeRef.current : simTime;
    const relPos = getMoonRelativePosition(moonData, currentTime);

    if (moonGroupRef.current) {
      moonGroupRef.current.position.copy(relPos);
    }

    if (moonMeshRef.current) {
      moonMeshRef.current.rotation.y += adjustedDelta * 0.1;
    }
  });

  return (
    <>
      {/* Subtle Moon Orbit Line */}
      <mesh rotation={orbitRotation}>
        <ringGeometry
          args={[
            moonData.visualOrbitDistance - 0.03,
            moonData.visualOrbitDistance + 0.03,
            64
          ]}
        />
        <meshBasicMaterial
          color="#94A3B8"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbiting Moon Group */}
      <group ref={moonGroupRef}>
        <mesh
          ref={moonMeshRef}
          rotation={[0, 0, isEarthMoon ? THREE.MathUtils.degToRad(5) : 0]}
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.playUiClick();
            onSelectMoon(moonData);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            soundEngine.playUiHover();
            setIsHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setIsHovered(false);
            document.body.style.cursor = 'default';
          }}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[moonData.visualRadius, isEarthMoon ? 128 : 64, isEarthMoon ? 128 : 64]} />
          <meshStandardMaterial
            map={texture}
            bumpMap={isEarthMoon && elevationTexture ? elevationTexture : (isEarthMoon ? texture : undefined)}
            bumpScale={isEarthMoon ? 0.052 : 0}
            roughness={0.94}
            metalness={0.0}
            envMapIntensity={0.05}
          />
        </mesh>

        {/* Micro detail layer from moon.html: subtle second shell for photographic surface depth */}
        {isEarthMoon && (
          <mesh rotation={[0, 0, THREE.MathUtils.degToRad(5)]}>
            <sphereGeometry args={[moonData.visualRadius * 1.003, 96, 96]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.025}
              depthWrite={false}
              blending={THREE.MultiplyBlending}
            />
          </mesh>
        )}

        {/* Subtle Lunar edge halo layer from moon.html */}
        {isEarthMoon && (
          <mesh>
            <sphereGeometry args={[moonData.visualRadius * 1.018, 64, 64]} />
            <meshBasicMaterial
              color="#bfc4ca"
              transparent
              opacity={0.018}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Selected Highlight Ring */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[moonData.visualRadius * 1.4, moonData.visualRadius * 1.48, 64]} />
            <meshBasicMaterial color="#00f3ff" transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
        )}



        {/* Floating Moon Label on Hover */}
        {isHovered && (
          <Html position={[0, moonData.visualRadius * 2.2, 0]} center distanceFactor={40}>
            <div className="px-2.5 py-1 rounded-lg bg-space-950/90 border border-cyber-cyan/80 text-[10px] font-mono text-cyber-cyan whitespace-nowrap shadow-neon-cyan flex items-center gap-1.5 pointer-events-none animate-float">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
              <span>{moonData.name}</span>
              <span className="text-gray-400">({moonData.radiusKm.toLocaleString()} km)</span>
            </div>
          </Html>
        )}
      </group>
    </>
  );
};
