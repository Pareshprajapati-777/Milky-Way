import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BlackHoleAccretionShader, GravitationalLensingShader } from '../../../shaders/blackhole/blackholeShaders';

interface SagittariusABodyProps {
  position?: [number, number, number];
  scale?: number;
  onClick?: () => void;
}

export const SagittariusABody: React.FC<SagittariusABodyProps> = ({
  position = [0, 0, 0],
  scale = 1.0,
  onClick
}) => {
  const diskMeshRef = useRef<THREE.Mesh>(null);
  const diskMatRef = useRef<THREE.ShaderMaterial>(null);
  const lensingMatRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state, delta) => {
    if (diskMatRef.current) {
      diskMatRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    if (lensingMatRef.current) {
      lensingMatRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]} onClick={onClick}>
      {/* 1. Event Horizon Black Sphere (absorbs 100% light) */}
      <mesh>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. Gravitational Lensing / Photon Sphere Halo */}
      <mesh>
        <planeGeometry args={[14.0, 14.0]} />
        <shaderMaterial
          ref={lensingMatRef}
          vertexShader={GravitationalLensingShader.vertexShader}
          fragmentShader={GravitationalLensingShader.fragmentShader}
          uniforms={{
            uTime: { value: 0 }
          }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Relativistic Accretion Disk */}
      <mesh ref={diskMeshRef} rotation={[-Math.PI / 3, 0, 0]}>
        <ringGeometry args={[2.5, 12.0, 128]} />
        <shaderMaterial
          ref={diskMatRef}
          vertexShader={BlackHoleAccretionShader.vertexShader}
          fragmentShader={BlackHoleAccretionShader.fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uInnerColor: { value: new THREE.Color('#ffe17d') },
            uOuterColor: { value: new THREE.Color('#ff3c00') },
            uRadius: { value: 12.0 }
          }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Polar Relativistic Jet Streamers */}
      <mesh position={[0, 6.0, 0]}>
        <cylinderGeometry args={[0.08, 0.6, 12.0, 16]} />
        <meshBasicMaterial color="#88ddff" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, -6.0, 0]}>
        <cylinderGeometry args={[0.6, 0.08, 12.0, 16]} />
        <meshBasicMaterial color="#88ddff" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};
