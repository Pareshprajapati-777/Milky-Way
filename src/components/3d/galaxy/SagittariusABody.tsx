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
      {/* 1. Event Horizon Black Sphere: Rs = 2GM/c^2 = 0.127 AU (scaled to 1.27 units) */}
      <mesh>
        <sphereGeometry args={[1.27, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. Photon Sphere (R_ph = 1.5 * Rs = 0.19 AU / 1.9 units) - Pure Relativistic Light Trap */}
      <mesh>
        <sphereGeometry args={[1.90, 48, 48]} />
        <meshBasicMaterial color="#ffbb44" wireframe transparent opacity={0.15} />
      </mesh>

      {/* 3. Gravitational Lensing / Photon Ring Halo */}
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
