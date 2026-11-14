import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getRealisticSunTexture } from '../../../utils/realisticTextures';
import { SunSurfaceShader, SunCoronalFlareShader } from '../../../shaders/sun/sunShaders';
import { CELESTIAL_BODIES } from '../../../data/astronomy';
import { soundEngine } from '../../../utils/soundEngine';
import { ScaleMode, ASTRO_CONSTANTS } from '../../../utils/astronomicalUnits';

interface SunBodyProps {
  onSelect: () => void;
  isSelected: boolean;
  timeScale: number;
  scaleMode?: ScaleMode;
}

/**
 * Photorealistic Sun implementation matching REYAL look/SUN.HTML:
 * - Real 2K photographic solar surface base
 * - Organic sunspot groups with umbra and penumbra
 * - Dynamic FBM convection granulation
 * - Limb darkening & hot solar emission
 * - 3-layer physical corona streamers (1.035, 1.075, 1.145)
 * - 2,600 solar prominence plasma particles
 */
export const SunBody: React.FC<SunBodyProps> = ({ onSelect, isSelected, timeScale, scaleMode = 'enhanced' }) => {
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const corona1Ref = useRef<THREE.Mesh>(null);
  const corona2Ref = useRef<THREE.Mesh>(null);
  const corona3Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const sunData = CELESTIAL_BODIES.sun;
  const R =
    scaleMode === 'true_scale'
      ? ASTRO_CONSTANTS.SUN_RADIUS_KM / ASTRO_CONSTANTS.EARTH_RADIUS_KM
      : sunData.visualRadius;
  const sunTexture = useMemo(() => getRealisticSunTexture(), []);

  // Sun Photosphere Material from SUN.HTML
  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: sunTexture },
        uTime: { value: 0 }
      },
      vertexShader: SunSurfaceShader.vertexShader,
      fragmentShader: SunSurfaceShader.fragmentShader,
      side: THREE.FrontSide
    });
  }, [sunTexture]);

  // Corona Layer 1 (radius 1.035, alpha 0.38) from SUN.HTML
  const corona1Material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAlpha: { value: 0.38 },
        uColor: { value: new THREE.Color(0xff6a12) }
      },
      vertexShader: SunCoronalFlareShader.vertexShader,
      fragmentShader: SunCoronalFlareShader.fragmentShader,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, []);

  // Corona Layer 2 (radius 1.075, alpha 0.20) from SUN.HTML
  const corona2Material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAlpha: { value: 0.20 },
        uColor: { value: new THREE.Color(0xff6a12) }
      },
      vertexShader: SunCoronalFlareShader.vertexShader,
      fragmentShader: SunCoronalFlareShader.fragmentShader,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, []);

  // Corona Layer 3 (radius 1.145, alpha 0.075) from SUN.HTML
  const corona3Material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAlpha: { value: 0.075 },
        uColor: { value: new THREE.Color(0xff6a12) }
      },
      vertexShader: SunCoronalFlareShader.vertexShader,
      fragmentShader: SunCoronalFlareShader.fragmentShader,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, []);

  // Prominence / Corona Particles from SUN.HTML (2,600 particles)
  const particleGeo = useMemo(() => {
    const particleCount = 2600;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = (1.008 + Math.pow(Math.random(), 1.7) * 0.16) * R;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [R]);

  useFrame((_, delta) => {
    const adjustedDelta = delta * timeScale;

    // Advance dynamic solar granulation and coronal streaming
    if (sunMaterial) {
      sunMaterial.uniforms.uTime.value += adjustedDelta * 1.2;
    }
    if (corona1Material) {
      corona1Material.uniforms.uTime.value += adjustedDelta * 1.5;
    }
    if (corona2Material) {
      corona2Material.uniforms.uTime.value += adjustedDelta * 1.2;
    }
    if (corona3Material) {
      corona3Material.uniforms.uTime.value += adjustedDelta * 0.8;
    }

    // Physical solar rotation on its axis
    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.y += adjustedDelta * 0.015;
    }
    if (corona1Ref.current) {
      corona1Ref.current.rotation.z += adjustedDelta * 0.008;
      corona1Ref.current.rotation.y -= adjustedDelta * 0.01;
    }
    if (corona2Ref.current) {
      corona2Ref.current.rotation.z -= adjustedDelta * 0.006;
    }
    if (corona3Ref.current) {
      corona3Ref.current.rotation.z += adjustedDelta * 0.004;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += adjustedDelta * 0.005;
      particlesRef.current.rotation.z += adjustedDelta * 0.003;
    }
  });

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, THREE.MathUtils.degToRad(sunData.axialTiltDeg || 7.25)]}>
      {/* Primary Solar Omnidirectional Light Source */}
      <pointLight
        color="#FFF9E6"
        intensity={4.2}
        distance={3000}
        decay={0.35}
        castShadow
      />

      {/* 1. Main Sun Photosphere Sphere with Dynamic Solar Surface Shader */}
      <mesh
        ref={sunMeshRef}
        material={sunMaterial}
        onClick={(e) => {
          e.stopPropagation();
          soundEngine.playPlanetResonance(sunData.soundFrequencyHz);
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          soundEngine.playUiHover();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[R, 192, 192]} />
      </mesh>

      {/* 2. Corona Layer 1 (1.035) */}
      <mesh ref={corona1Ref} material={corona1Material}>
        <sphereGeometry args={[R * 1.035, 128, 128]} />
      </mesh>

      {/* 3. Corona Layer 2 (1.075) */}
      <mesh ref={corona2Ref} material={corona2Material}>
        <sphereGeometry args={[R * 1.075, 128, 128]} />
      </mesh>

      {/* 4. Corona Layer 3 (1.145) */}
      <mesh ref={corona3Ref} material={corona3Material}>
        <sphereGeometry args={[R * 1.145, 96, 96]} />
      </mesh>

      {/* 5. Prominence / Solar Flare Particles */}
      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial
          size={scaleMode === 'true_scale' ? 0.35 : 0.2}
          color="#ff9a2b"
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>


    </group>
  );
};
