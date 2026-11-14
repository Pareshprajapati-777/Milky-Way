import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBodyData, MoonData } from '../../data/astronomy';
import {
  getRealisticEarthDayTexture,
  getRealisticEarthNightTexture,
  getRealisticEarthNormalTexture,
  getRealisticEarthCloudsTexture,
  getRealisticMercuryTexture,
  getRealisticVenusTexture,
  getRealisticMarsTexture,
  getRealisticMarsNormalTexture,
  getRealisticJupiterTexture,
  getRealisticSaturnTexture,
  getRealisticSaturnRingTexture,
  getRealisticUranusTexture,
  getRealisticNeptuneTexture,
  getRealisticPlutoTexture
} from '../../utils/realisticTextures';
import { EarthShader, AtmosphereGlowShader } from '../../utils/RealisticShaders';
import { MoonBody } from './MoonBody';
import { soundEngine } from '../../utils/soundEngine';
import { getPlanet3DPosition, getPlanetAxialRotation } from '../../utils/orbitalPhysics';
import { ScaleMode, ASTRO_CONSTANTS } from '../../utils/astronomicalUnits';

interface PlanetBodyProps {
  planet: CelestialBodyData;
  timeScale: number;
  simTime?: number;
  simTimeRef?: React.MutableRefObject<number>;
  scaleMode?: ScaleMode;
  onSelectPlanet: (planet: CelestialBodyData) => void;
  onSelectMoon: (moon: MoonData) => void;
  isSelected: boolean;
  selectedMoonId: string | null;
  showOrbits?: boolean;
  showMoons: boolean;
  showLabels: boolean;
  isAnyPlanetSelected: boolean;
}

/**
 * -------------------------------------------------------------
 * 1. SATURN COMPLETE LOOK (from REYAL look/saturn.html)
 * - MeshPhongMaterial with bumpScale 0.025, specular 0x15100a, shininess 3
 * - Oblate flattening scale [1, 0.904, 1]
 * - Atmosphere Shader with glowColor 0xd8b979, pow 3.2, alpha rim * 0.28
 * - 6 Multi-division rings with 8k_saturn_ring_alpha.png (Inner, C, B, Cassini, A, F)
 * - Ring dust particles
 * -------------------------------------------------------------
 */
const SaturnLook: React.FC<{
  visualRadius: number;
  texture: THREE.Texture;
  ringTexture: THREE.Texture;
  meshRef: React.RefObject<THREE.Mesh>;
  onMeshClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: () => void;
}> = ({ visualRadius, texture, ringTexture, meshRef, onMeshClick, onPointerOver, onPointerOut }) => {
  const R = visualRadius;

  // Exact atmosphere shader from saturn.html
  const saturnAtmosphereMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        glowColor: { value: new THREE.Color(0xd8b979) }
      },
      vertexShader: AtmosphereGlowShader.vertexShader,
      fragmentShader: AtmosphereGlowShader.fragmentShader
    });
  }, []);

  // Multi-division ring creator from saturn.html
  const ringMeshes = useMemo(() => {
    const ringConfigs = [
      { inner: 1.23 * R, outer: 1.38 * R, opacity: 0.85 }, // Inner
      { inner: 1.38 * R, outer: 1.55 * R, opacity: 0.75 }, // C Ring
      { inner: 1.55 * R, outer: 1.82 * R, opacity: 0.95 }, // B Ring
      { inner: 1.82 * R, outer: 1.91 * R, opacity: 0.04 }, // Cassini Division
      { inner: 1.91 * R, outer: 2.15 * R, opacity: 0.90 }, // A Ring
      { inner: 2.18 * R, outer: 2.22 * R, opacity: 0.65 }  // F Ring
    ];

    return ringConfigs.map((cfg) => {
      const geo = new THREE.RingGeometry(cfg.inner, cfg.outer, 256, 16);
      const pos = geo.attributes.position;
      const uv = geo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const r = Math.sqrt(x * x + y * y);
        const u = (r - cfg.inner) / (cfg.outer - cfg.inner);
        const v = (Math.atan2(y, x) / Math.PI) * 0.5 + 0.5;
        uv.setXY(i, u, v);
      }
      geo.attributes.uv.needsUpdate = true;

      const mat = new THREE.MeshPhongMaterial({
        map: ringTexture,
        alphaMap: ringTexture,
        transparent: true,
        opacity: cfg.opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
        color: 0xd8c59a,
        shininess: 4
      });

      return { geo, mat };
    });
  }, [R, ringTexture]);

  // Ring particle dust from saturn.html
  const particleGeo = useMemo(() => {
    const count = 5000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = (1.30 + Math.random() * 0.90) * R;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.015 * R;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const b = 0.55 + Math.random() * 0.45;
      col[i * 3] = b;
      col[i * 3 + 1] = b * 0.92;
      col[i * 3 + 2] = b * 0.70;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [R]);

  return (
    <>
      {/* Saturn Body with real oblate flattening [1, 0.904, 1] */}
      <mesh
        ref={meshRef}
        scale={[1, 0.904, 1]}
        onClick={onMeshClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[R, 192, 192]} />
        <meshPhongMaterial
          map={texture}
          color={0xffffff}
          shininess={3}
          specular={new THREE.Color(0x15100a)}
          bumpScale={0.025}
        />
      </mesh>

      {/* Saturn Atmosphere from saturn.html */}
      <mesh scale={[1, 0.904, 1]} material={saturnAtmosphereMat}>
        <sphereGeometry args={[R * 1.018, 128, 128]} />
      </mesh>

      {/* 6 Multi-division rings with scale.y = 0.905 */}
      {ringMeshes.map((r, idx) => (
        <mesh
          key={`saturn-ring-${idx}`}
          geometry={r.geo}
          material={r.mat}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1, 0.905, 1]}
        />
      ))}

      {/* Ring dust particles */}
      <points geometry={particleGeo} rotation={[Math.PI / 2, 0, 0]}>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};

/**
 * -------------------------------------------------------------
 * 2. URANUS COMPLETE LOOK (from REYAL look/Uranus.html)
 * - MeshPhongMaterial with color 0x78999b, shininess 4, specular 0x173a40
 * - Oblate flattening scale [1, 0.978, 1]
 * - Atmosphere Shader with glowColor 0x31585c
 * - 6 Multi-division thin delicate rings
 * -------------------------------------------------------------
 */
const UranusLook: React.FC<{
  visualRadius: number;
  texture: THREE.Texture;
  meshRef: React.RefObject<THREE.Mesh>;
  onMeshClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: () => void;
}> = ({ visualRadius, texture, meshRef, onMeshClick, onPointerOver, onPointerOut }) => {
  const R = visualRadius;

  const uranusAtmosphereMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        glowColor: { value: new THREE.Color(0x31585c) }
      },
      vertexShader: AtmosphereGlowShader.vertexShader,
      fragmentShader: AtmosphereGlowShader.fragmentShader
    });
  }, []);

  const ringMeshes = useMemo(() => {
    const ringConfigs = [
      { inner: 1.18 * R, outer: 1.205 * R, opacity: 0.42 },
      { inner: 1.23 * R, outer: 1.245 * R, opacity: 0.32 },
      { inner: 1.28 * R, outer: 1.295 * R, opacity: 0.40 },
      { inner: 1.33 * R, outer: 1.350 * R, opacity: 0.35 },
      { inner: 1.39 * R, outer: 1.415 * R, opacity: 0.38 },
      { inner: 1.48 * R, outer: 1.515 * R, opacity: 0.55 }
    ];

    return ringConfigs.map((cfg) => {
      const geo = new THREE.RingGeometry(cfg.inner, cfg.outer, 192, 16);
      const mat = new THREE.MeshPhongMaterial({
        color: new THREE.Color(0x6c7775),
        transparent: true,
        opacity: cfg.opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
        shininess: 1
      });
      return { geo, mat };
    });
  }, [R]);

  return (
    <>
      <mesh
        ref={meshRef}
        scale={[1, 0.978, 1]}
        onClick={onMeshClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[R, 192, 192]} />
        <meshPhongMaterial
          map={texture}
          color={0x78999b}
          shininess={4}
          specular={new THREE.Color(0x173a40)}
        />
      </mesh>

      <mesh scale={[1, 0.978, 1]} material={uranusAtmosphereMat}>
        <sphereGeometry args={[R * 1.025, 128, 128]} />
      </mesh>

      {ringMeshes.map((r, idx) => (
        <mesh
          key={`uranus-ring-${idx}`}
          geometry={r.geo}
          material={r.mat}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
    </>
  );
};

/**
 * -------------------------------------------------------------
 * 3. NEPTUNE COMPLETE LOOK (from REYAL look/Neptune.html)
 * - MeshPhongMaterial with color 0xffffff, shininess 2, specular 0x142c4d
 * - Real shape scale [1, 0.983, 1]
 * - Atmosphere Shader with glowColor 0x164b9a
 * - 3 Rings (1.28, 1.40, 1.65) with color 0x697582
 * -------------------------------------------------------------
 */
const NeptuneLook: React.FC<{
  visualRadius: number;
  texture: THREE.Texture;
  meshRef: React.RefObject<THREE.Mesh>;
  onMeshClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: () => void;
}> = ({ visualRadius, texture, meshRef, onMeshClick, onPointerOver, onPointerOut }) => {
  const R = visualRadius;

  const neptuneAtmosphereMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        glowColor: { value: new THREE.Color(0x164b9a) }
      },
      vertexShader: AtmosphereGlowShader.vertexShader,
      fragmentShader: AtmosphereGlowShader.fragmentShader
    });
  }, []);

  const ringMeshes = useMemo(() => {
    const ringConfigs = [
      { inner: 1.28 * R, outer: 1.30 * R, opacity: 0.28 },
      { inner: 1.40 * R, outer: 1.42 * R, opacity: 0.22 },
      { inner: 1.65 * R, outer: 1.70 * R, opacity: 0.40 }
    ];

    return ringConfigs.map((cfg) => {
      const geo = new THREE.RingGeometry(cfg.inner, cfg.outer, 192, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x697582,
        transparent: true,
        opacity: cfg.opacity,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      return { geo, mat };
    });
  }, [R]);

  return (
    <>
      <mesh
        ref={meshRef}
        scale={[1, 0.983, 1]}
        onClick={onMeshClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[R, 192, 192]} />
        <meshPhongMaterial
          map={texture}
          color={0xffffff}
          shininess={2}
          specular={new THREE.Color(0x142c4d)}
        />
      </mesh>

      <mesh scale={[1, 0.983, 1]} material={neptuneAtmosphereMat}>
        <sphereGeometry args={[R * 1.025, 128, 128]} />
      </mesh>

      {ringMeshes.map((r, idx) => (
        <mesh
          key={`neptune-ring-${idx}`}
          geometry={r.geo}
          material={r.mat}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
    </>
  );
};

/**
 * -------------------------------------------------------------
 * 4. JUPITER COMPLETE LOOK (from REYAL look/jupiter.html)
 * - 8K texture with MeshStandardMaterial (roughness 0.92, metalness 0.0)
 * - Oblate gas giant scale [1.0, 0.955, 1.0]
 * - Atmospheric edge layer at 1.018 with color 0xd9a477, opacity 0.035
 * -------------------------------------------------------------
 */
const JupiterLook: React.FC<{
  visualRadius: number;
  texture: THREE.Texture;
  meshRef: React.RefObject<THREE.Mesh>;
  onMeshClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: () => void;
}> = ({ visualRadius, texture, meshRef, onMeshClick, onPointerOver, onPointerOut }) => {
  const R = visualRadius;

  return (
    <>
      <mesh
        ref={meshRef}
        scale={[1.0, 0.955, 1.0]}
        onClick={onMeshClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[R, 192, 192]} />
        <meshStandardMaterial
          map={texture}
          color={new THREE.Color(0xffffff)}
          roughness={0.92}
          metalness={0.0}
        />
      </mesh>

      <mesh scale={[1.0, 0.955, 1.0]}>
        <sphereGeometry args={[R * 1.018, 128, 128]} />
        <meshBasicMaterial
          color={0xd9a477}
          transparent
          opacity={0.035}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};

/**
 * -------------------------------------------------------------
 * 5. MARS COMPLETE LOOK (from REYAL look/mars.html)
 * - MeshPhongMaterial with marsColor + marsNormal (normalScale 1.25, 1.25), specular 0x24110a, shininess 5
 * - Atmosphere 1 at 1.018 with color 0xd95b32, opacity 0.075
 * - Outer subtle glow at 1.045 with color 0xb83d22, opacity 0.025
 * -------------------------------------------------------------
 */
const MarsLook: React.FC<{
  visualRadius: number;
  texture: THREE.Texture;
  normalTexture: THREE.Texture | null;
  meshRef: React.RefObject<THREE.Mesh>;
  onMeshClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: () => void;
}> = ({ visualRadius, texture, normalTexture, meshRef, onMeshClick, onPointerOver, onPointerOut }) => {
  const R = visualRadius;

  return (
    <>
      <mesh
        ref={meshRef}
        onClick={onMeshClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[R, 160, 160]} />
        <meshPhongMaterial
          map={texture}
          normalMap={normalTexture || undefined}
          normalScale={new THREE.Vector2(1.25, 1.25)}
          color={new THREE.Color(0xffffff)}
          specular={new THREE.Color(0x24110a)}
          shininess={5}
        />
      </mesh>

      {/* Atmosphere 1 from mars.html */}
      <mesh>
        <sphereGeometry args={[R * 1.018, 96, 96]} />
        <meshBasicMaterial
          color={0xd95b32}
          transparent
          opacity={0.075}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer subtle glow from mars.html */}
      <mesh>
        <sphereGeometry args={[R * 1.045, 96, 96]} />
        <meshBasicMaterial
          color={0xb83d22}
          transparent
          opacity={0.025}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};

/**
 * -------------------------------------------------------------
 * 6. VENUS COMPLETE LOOK (from REYAL look/venus.html)
 * - MeshPhongMaterial with specular 0x26170c, shininess 5
 * - Atmosphere 1 at 1.025 with color 0xffc66d, opacity 0.09
 * - Second Atmosphere at 1.055 with color 0xd88a44, opacity 0.035
 * -------------------------------------------------------------
 */
const VenusLook: React.FC<{
  visualRadius: number;
  texture: THREE.Texture;
  meshRef: React.RefObject<THREE.Mesh>;
  onMeshClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: () => void;
}> = ({ visualRadius, texture, meshRef, onMeshClick, onPointerOver, onPointerOut }) => {
  const R = visualRadius;

  return (
    <>
      <mesh
        ref={meshRef}
        onClick={onMeshClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[R, 160, 160]} />
        <meshPhongMaterial
          map={texture}
          color={new THREE.Color(0xffffff)}
          specular={new THREE.Color(0x26170c)}
          shininess={5}
        />
      </mesh>

      {/* Atmosphere 1 from venus.html */}
      <mesh>
        <sphereGeometry args={[R * 1.025, 96, 96]} />
        <meshBasicMaterial
          color={0xffc66d}
          transparent
          opacity={0.09}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Second Atmosphere from venus.html */}
      <mesh>
        <sphereGeometry args={[R * 1.055, 96, 96]} />
        <meshBasicMaterial
          color={0xd88a44}
          transparent
          opacity={0.035}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};

/**
 * -------------------------------------------------------------
 * 7. MERCURY COMPLETE LOOK (from REYAL look/mercury.html)
 * - MeshPhongMaterial with specular 0x17120f, shininess 4, reflectivity 0.05
 * - Very subtle edge glow at 1.025 with color 0xb98d76, opacity 0.025
 * -------------------------------------------------------------
 */
const MercuryLook: React.FC<{
  visualRadius: number;
  texture: THREE.Texture;
  meshRef: React.RefObject<THREE.Mesh>;
  onMeshClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: () => void;
}> = ({ visualRadius, texture, meshRef, onMeshClick, onPointerOver, onPointerOut }) => {
  const R = visualRadius;

  return (
    <>
      <mesh
        ref={meshRef}
        onClick={onMeshClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[R, 160, 160]} />
        <meshPhongMaterial
          map={texture}
          color={0xffffff}
          specular={new THREE.Color(0x17120f)}
          shininess={4}
          reflectivity={0.05}
        />
      </mesh>

      {/* Very subtle edge glow from mercury.html */}
      <mesh>
        <sphereGeometry args={[R * 1.025, 96, 96]} />
        <meshBasicMaterial
          color={0xb98d76}
          transparent
          opacity={0.025}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
};

/**
 * -------------------------------------------------------------
 * 8. EARTH COMPLETE LOOK (from REYAL look/earth.html)
 * - Custom ShaderMaterial with 8K DayMap + 8K NightMap (city lights) + NormalMap + dynamic uSunDirection
 * - Cloud Layer Sphere at 1.008 with earthCloudsMap, AdditiveBlending, opacity 0.8
 * - Rayleigh scattering atmosphere glow
 * -------------------------------------------------------------
 */
const EarthLook: React.FC<{
  visualRadius: number;
  dayMap: THREE.Texture;
  nightMap: THREE.Texture;
  normalMap: THREE.Texture;
  cloudsMap: THREE.Texture;
  meshRef: React.RefObject<THREE.Mesh>;
  cloudsRef: React.RefObject<THREE.Mesh>;
  onMeshClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: () => void;
}> = ({ visualRadius, dayMap, nightMap, normalMap, cloudsMap, meshRef, cloudsRef, onMeshClick, onPointerOver, onPointerOut }) => {
  const R = visualRadius;

  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uDayMap: { value: dayMap },
        uNightMap: { value: nightMap },
        uNormalMap: { value: normalMap },
        uSunDirection: { value: new THREE.Vector3(5, 3, 5).normalize() },
        uNightIntensity: { value: 1.35 },
        uCityGlow: { value: 1.0 },
        uTime: { value: 0.0 }
      },
      vertexShader: EarthShader.vertexShader,
      fragmentShader: EarthShader.fragmentShader
    });
  }, [dayMap, nightMap, normalMap]);

  return (
    <>
      {/* 1. Earth Surface with Day/Night City Lights Shader from earth.html */}
      <mesh
        ref={meshRef}
        material={earthMaterial}
        onClick={onMeshClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[R, 192, 192]} />
      </mesh>

      {/* 2. Cloud Layer Sphere from earth.html */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[R * 1.008, 128, 128]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Subtle Rayleigh atmosphere glow */}
      <mesh>
        <sphereGeometry args={[R * 1.025, 96, 96]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};

export const PlanetBody: React.FC<PlanetBodyProps> = ({
  planet,
  timeScale,
  simTime = 0,
  simTimeRef,
  scaleMode = 'enhanced',
  onSelectPlanet,
  onSelectMoon,
  isSelected,
  selectedMoonId,
  showMoons,
  showLabels,
  isAnyPlanetSelected
}) => {
  const planetOrbitGroupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const cloudsMeshRef = useRef<THREE.Mesh>(null);
  const rotationClockRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  // Effective planetary visual radius depending on scaleMode
  const effectiveRadius =
    scaleMode === 'true_scale'
      ? Math.max(0.4, planet.radiusKm / ASTRO_CONSTANTS.EARTH_RADIUS_KM)
      : planet.visualRadius;

  // Load realistic textures from REYAL look
  const mercuryTexture = useMemo(() => getRealisticMercuryTexture(), []);
  const venusTexture = useMemo(() => getRealisticVenusTexture(), []);
  const earthDayTexture = useMemo(() => getRealisticEarthDayTexture(), []);
  const earthNightTexture = useMemo(() => getRealisticEarthNightTexture(), []);
  const earthNormalTexture = useMemo(() => getRealisticEarthNormalTexture(), []);
  const earthCloudsTexture = useMemo(() => getRealisticEarthCloudsTexture(), []);
  const marsTexture = useMemo(() => getRealisticMarsTexture(), []);
  const marsNormalTexture = useMemo(() => getRealisticMarsNormalTexture(), []);
  const jupiterTexture = useMemo(() => getRealisticJupiterTexture(), []);
  const saturnTexture = useMemo(() => getRealisticSaturnTexture(), []);
  const saturnRingTexture = useMemo(() => getRealisticSaturnRingTexture(), []);
  const uranusTexture = useMemo(() => getRealisticUranusTexture(), []);
  const neptuneTexture = useMemo(() => getRealisticNeptuneTexture(), []);
  const plutoTexture = useMemo(() => getRealisticPlutoTexture(), []);

  // Frame update for planetary orbit, axial rotation, and Sun direction vector
  useFrame((_, delta) => {
    // Rotation clock advances smoothly when simulation is active, freezing when paused
    // At high simulation speeds (e.g. 20x, 100x), damp rotation so planets never spin uncontrollably
    if (timeScale > 0) {
      const rotationSpeedMultiplier = Math.min(2.0, Math.max(0.2, Math.sqrt(timeScale)));
      rotationClockRef.current += delta * rotationSpeedMultiplier;
    }

    // Reset rotation clock when simulation is reset to t = 0
    if (simTimeRef && simTimeRef.current === 0) {
      rotationClockRef.current = 0;
    }

    const currentTimeDays = simTimeRef ? simTimeRef.current : simTime;

    // 1. Orbital motion around Sun (Keplerian calculation)
    const currentPos = getPlanet3DPosition(planet, currentTimeDays, scaleMode);
    if (planetOrbitGroupRef.current) {
      planetOrbitGroupRef.current.position.copy(currentPos);
    }

    // 2. Day/Night Axial Self-Rotation (Normal, smooth, calm viewing speed)
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y = getPlanetAxialRotation(planet, rotationClockRef.current);
    }

    // 3. Earth Day/Night Terminator update (points towards Sun at 0,0,0)
    if (planet.id === 'earth' && planetMeshRef.current && currentPos) {
      const mat = planetMeshRef.current.material as THREE.ShaderMaterial;
      if (mat && mat.uniforms && mat.uniforms.uSunDirection) {
        const sunDir = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), currentPos).normalize();
        mat.uniforms.uSunDirection.value.copy(sunDir);
        mat.uniforms.uTime.value += delta * timeScale;
      }
    }

    // 4. Independent Cloud Layer Drift from earth.html (clouds rotate slightly faster)
    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.rotation.y = getPlanetAxialRotation(planet, rotationClockRef.current) * 1.06;
    }
  });

  const handleMeshClick = (e: any) => {
    e.stopPropagation();
    soundEngine.playPlanetResonance(planet.soundFrequencyHz);
    onSelectPlanet(planet);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    soundEngine.playUiHover();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group ref={planetOrbitGroupRef}>
      {/* Planetary Body Group with Exact Axial Tilt */}
      <group rotation={[0, 0, THREE.MathUtils.degToRad(planet.axialTiltDeg)]}>
        {/* Render each planet with its exact realistic implementation from REYAL look */}
        {planet.id === 'mercury' && (
          <MercuryLook
            visualRadius={effectiveRadius}
            texture={mercuryTexture}
            meshRef={planetMeshRef}
            onMeshClick={handleMeshClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
        )}

        {planet.id === 'venus' && (
          <VenusLook
            visualRadius={effectiveRadius}
            texture={venusTexture}
            meshRef={planetMeshRef}
            onMeshClick={handleMeshClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
        )}

        {planet.id === 'earth' && (
          <EarthLook
            visualRadius={effectiveRadius}
            dayMap={earthDayTexture}
            nightMap={earthNightTexture}
            normalMap={earthNormalTexture}
            cloudsMap={earthCloudsTexture}
            meshRef={planetMeshRef}
            cloudsRef={cloudsMeshRef}
            onMeshClick={handleMeshClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
        )}

        {planet.id === 'mars' && (
          <MarsLook
            visualRadius={effectiveRadius}
            texture={marsTexture}
            normalTexture={marsNormalTexture}
            meshRef={planetMeshRef}
            onMeshClick={handleMeshClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
        )}

        {planet.id === 'jupiter' && (
          <JupiterLook
            visualRadius={effectiveRadius}
            texture={jupiterTexture}
            meshRef={planetMeshRef}
            onMeshClick={handleMeshClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
        )}

        {planet.id === 'saturn' && (
          <SaturnLook
            visualRadius={effectiveRadius}
            texture={saturnTexture}
            ringTexture={saturnRingTexture}
            meshRef={planetMeshRef}
            onMeshClick={handleMeshClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
        )}

        {planet.id === 'uranus' && (
          <UranusLook
            visualRadius={effectiveRadius}
            texture={uranusTexture}
            meshRef={planetMeshRef}
            onMeshClick={handleMeshClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
        )}

        {planet.id === 'neptune' && (
          <NeptuneLook
            visualRadius={effectiveRadius}
            texture={neptuneTexture}
            meshRef={planetMeshRef}
            onMeshClick={handleMeshClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
        )}

        {planet.id === 'pluto' && (
          <mesh
            ref={planetMeshRef}
            onClick={handleMeshClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[effectiveRadius, 96, 96]} />
            <meshStandardMaterial
              map={plutoTexture}
              roughness={0.88}
              metalness={0.05}
            />
          </mesh>
        )}


      </group>

      {/* Moons orbiting around parent planet */}
      {showMoons && planet.moons.map((moon) => (
        <MoonBody
          key={moon.id}
          moonData={moon}
          timeScale={timeScale}
          simTime={simTime}
          simTimeRef={simTimeRef}
          onSelectMoon={onSelectMoon}
          isSelected={selectedMoonId === moon.id}
          parentDistance={planet.visualDistance}
        />
      ))}

      {/* Holographic 3D Floating Name & Telemetry Label */}
      {!isAnyPlanetSelected && (showLabels || isHovered) && (
        <Html
          position={[0, effectiveRadius * 1.45 + 1.8, 0]}
          center
          distanceFactor={240}
          zIndexRange={[10, 0]}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playPlanetResonance(planet.soundFrequencyHz);
              onSelectPlanet(planet);
            }}
            onMouseEnter={() => {
              soundEngine.playUiHover();
              setIsHovered(true);
            }}
            onMouseLeave={() => setIsHovered(false)}
            className={`cursor-pointer transition-all duration-200 transform select-none ${
              isHovered ? 'scale-105' : 'scale-95 opacity-85 hover:opacity-100'
            }`}
          >
            <div
              className={`px-2.5 py-1 rounded-xl backdrop-blur-md border flex items-center gap-1.5 shadow-glass-edge transition-all whitespace-nowrap ${
                isHovered
                  ? 'bg-space-900/95 border-cyber-yellow shadow-neon-gold ring-1 ring-amber-400/30'
                  : 'bg-space-950/80 border-white/20'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: planet.accentColor }}
              />
              <span className="font-serif text-xs font-normal uppercase tracking-widest text-white">
                {planet.name.split(' ')[0]}
              </span>
              <span className="font-mono text-[10px] text-gray-300">
                {planet.temperature.avgC > 0 ? `+${planet.temperature.avgC}` : planet.temperature.avgC}°C
              </span>
              {planet.moonsCount > 0 && (
                <span className="text-[9px] font-mono text-cyber-cyan bg-cyber-cyan/15 px-1 py-0.2 rounded">
                  {planet.moonsCount}M
                </span>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
