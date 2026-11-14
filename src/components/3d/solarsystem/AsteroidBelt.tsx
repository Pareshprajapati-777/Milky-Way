import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidBeltProps {
  innerRadius?: number;
  outerRadius?: number;
  count?: number;
  timeScale?: number;
  visible?: boolean;
}

export const AsteroidBelt: React.FC<AsteroidBeltProps> = ({
  innerRadius = 105,
  outerRadius = 125,
  count = 3200,
  timeScale = 1,
  visible = true
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Compute initial random orbital parameters for each asteroid
  const asteroids = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.55 / Math.sqrt(radius / 100)) * (0.85 + Math.random() * 0.3);
      const height = (Math.random() - 0.5) * 5.5;
      const scale = 0.3 + Math.random() * 0.7;
      const rotSpeedX = (Math.random() - 0.5) * 2.0;
      const rotSpeedY = (Math.random() - 0.5) * 2.0;
      const rotSpeedZ = (Math.random() - 0.5) * 2.0;

      list.push({
        radius,
        angle,
        speed,
        height,
        scale,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        rotSpeedX,
        rotSpeedY,
        rotSpeedZ
      });
    }
    return list;
  }, [innerRadius, outerRadius, count]);

  useFrame((_, delta) => {
    if (!visible || !meshRef.current) return;
    const adjustedDelta = delta * timeScale;

    asteroids.forEach((ast, i) => {
      // Orbital progression
      ast.angle += ast.speed * adjustedDelta * 0.05;
      ast.rotX += ast.rotSpeedX * adjustedDelta;
      ast.rotY += ast.rotSpeedY * adjustedDelta;
      ast.rotZ += ast.rotSpeedZ * adjustedDelta;

      const x = Math.cos(ast.angle) * ast.radius;
      const z = Math.sin(ast.angle) * ast.radius;
      const y = ast.height;

      dummy.position.set(x, y, z);
      dummy.rotation.set(ast.rotX, ast.rotY, ast.rotZ);
      dummy.scale.set(ast.scale, ast.scale, ast.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[0.5, 1]} />
      <meshStandardMaterial
        color="#78716C"
        roughness={0.9}
        metalness={0.2}
      />
    </instancedMesh>
  );
};
