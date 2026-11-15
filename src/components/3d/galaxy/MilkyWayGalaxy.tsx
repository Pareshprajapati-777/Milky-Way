import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MILKY_WAY_DATA } from '../../../data/astronomy';
import { soundEngine } from '../../../utils/soundEngine';
import { SagittariusABody } from './SagittariusABody';
import { createSeededRandom } from '../../../utils/seededRandom';
import { useSimulationStore } from '../../../state/useSimulationStore';
import { GRAPHICS_PRESETS } from '../../../utils/deviceCapabilities';

/**
 * ============================================================================
 * MILKY WAY GALAXY VISUALIZATION & DENSITY WAVE MODEL
 * ============================================================================
 * Scientific Architecture & Representation Disclosure:
 * - Galaxy Model: Barred Spiral (SBbc) conforming to Lin-Shu Density Wave Theory.
 * - Spiral Arms: 4 main logarithmic spirals (Perseus, Scutum-Centaurus, Sagittarius,
 *   Norma) + local Orion-Cygnus Spur, governed by r(θ) = a * exp(b * θ).
 * - Rotation Curve: v(r) = v0 * tanh(r / r_core), simulating the flat rotation
 *   curve produced by the dark matter halo (Rubin 1980, Sofue 2020).
 * - Dimensions: Scaled to 100,000 Light-Years diameter, ~1,000 LY disk thickness.
 * - Solar System: Located ~26,490 LY from Galactic Center in the Orion Spur.
 * - Sagittarius A*: Located at dynamical center (0, 0, 0), mass 4.154M M☉.
 *
 * NOTE ON PROCEDURAL GEOMETRY VS. OBSERVATIONAL CATALOG:
 * The 240,000 galaxy particle points are a statistical procedural representation
 * of galactic stellar density distributions and are NOT individually catalogued
 * real stars. Specific real astronomical objects are catalogued independently in
 * `src/data/galacticCatalog.ts` (e.g. Sgr A*, Proxima Centauri, Pleiades, Orion Nebula).
 * ============================================================================
 */

interface MilkyWayGalaxyProps {
  onWarpToSolarSystem: () => void;
  isHoveredOverSun: boolean;
  setIsHoveredOverSun: (hovered: boolean) => void;
  visible: boolean;
  opacity?: number;
}

// ============================================================
// MASTER SETTINGS (Direct from REYAL look/milky_way.html)
// ============================================================
const SETTINGS = {
  galaxyStars: 240000,
  backgroundStars: 45000,
  nebulaParticles: 32000,
  dustParticles: 28000,
  starFormation: 11000,
  galaxyRadius: 62,
  bulgeRadius: 9,
  diskThickness: 3.2,
  spiralCurve: 0.235,
  armWidth: 0.19,
  pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1
};

// ============================================================
// COLOR SYSTEM
// ============================================================
const COLOR = {
  deepBlue: new THREE.Color("#274dff"),
  blue: new THREE.Color("#4f8dff"),
  cyan: new THREE.Color("#59d8ff"),
  violet: new THREE.Color("#8268ff"),
  purple: new THREE.Color("#b25cff"),
  pink: new THREE.Color("#ff6fae"),
  red: new THREE.Color("#ff5368"),
  orange: new THREE.Color("#ff9b52"),
  gold: new THREE.Color("#ffc96b"),
  warm: new THREE.Color("#ffe4a8"),
  white: new THREE.Color("#fff9e8")
};

// ============================================================
// 4-ARM LOGARITHMIC SPIRAL EQUATIONS + ORION-CYGNUS SPUR
// r(theta) = a * exp(b * theta)
// Density Wave Theory (Lin & Shu 1964) with Dark Matter Halo
// ============================================================
const ARMS = [
  // 1. Perseus Arm (Major outer spiral)
  { name: 'Perseus', phase: 0.15, strength: 1.00, width: 1.05, offset: 0.00, b: 0.235 },
  // 2. Scutum-Centaurus Arm (Major inner spiral)
  { name: 'Scutum-Centaurus', phase: Math.PI / 2 + 0.18, strength: 0.98, width: 1.02, offset: 0.15, b: 0.235 },
  // 3. Sagittarius Arm (Dense molecular cloud arm)
  { name: 'Sagittarius', phase: Math.PI + 0.08, strength: 0.88, width: 0.92, offset: 0.10, b: 0.235 },
  // 4. Norma-Outer Arm (Distant galactic edge arm)
  { name: 'Norma', phase: (Math.PI * 3) / 2 + 0.12, strength: 0.82, width: 0.90, offset: -0.15, b: 0.235 },
  // 5. Orion-Cygnus Spur (Local spur hosting our Solar System)
  { name: 'Orion-Cygnus Spur', phase: 0.65, strength: 0.75, width: 0.65, offset: 0.25, b: 0.210 }
];

/**
 * Flat Galactic Rotation Curve (Dark Matter Halo Effect)
 * v(r) = v0 * tanh(r / r_core)
 * where v0 ≈ 220 km/s and r_core ≈ 2.0 kpc (~6.5 visual units)
 */
export function getGalacticRotationVelocity(radius: number, v0 = 220.0, rCore = 6.5): number {
  return v0 * Math.tanh(radius / rCore);
}

function angularDifference(a: number, b: number) {
  let d = Math.abs(a - b);
  if (d > Math.PI) {
    d = Math.PI * 2 - d;
  }
  return d;
}

function armAngle(radius: number, arm: typeof ARMS[0]) {
  const normalized = radius / SETTINGS.galaxyRadius;
  const curvature = SETTINGS.spiralCurve * Math.pow(normalized, 0.82);
  const distortion = arm.offset * Math.sin(radius * 0.13);
  return arm.phase + curvature * radius * 0.82 + distortion;
}

function nearestArm(radius: number, angle: number) {
  let best = Infinity;
  let strength = 0;
  let width = 1;
  let index = 0;

  for (let i = 0; i < ARMS.length; i++) {
    const arm = ARMS[i];
    const target = armAngle(radius, arm);
    const difference = angularDifference(angle, target);
    const normalized = difference / (SETTINGS.armWidth * arm.width);

    if (normalized < best) {
      best = normalized;
      strength = arm.strength;
      width = arm.width;
      index = i;
    }
  }

  return { distance: best, strength, width, index };
}

function getStarColor(radius: number, armDensity: number, random: number) {
  const color = new THREE.Color();

  if (radius < SETTINGS.bulgeRadius) {
    if (random < 0.38) color.copy(COLOR.white);
    else if (random < 0.75) color.copy(COLOR.warm);
    else color.copy(COLOR.gold);
    return color;
  }

  if (radius < 17) {
    color.copy(random < 0.58 ? COLOR.gold : COLOR.warm);
    return color;
  }

  if (armDensity > 0.5) {
    if (random < 0.22) color.copy(COLOR.cyan);
    else if (random < 0.45) color.copy(COLOR.blue);
    else if (random < 0.65) color.copy(COLOR.violet);
    else if (random < 0.84) color.copy(COLOR.purple);
    else color.copy(COLOR.pink);
    return color;
  }

  const r = Math.random();
  if (r < 0.45) color.copy(COLOR.blue);
  else if (r < 0.68) color.copy(COLOR.deepBlue);
  else if (r < 0.83) color.copy(COLOR.violet);
  else color.copy(COLOR.white);

  return color;
}

// Procedural Radial Gradient Glow Texture
function createGlowTexture(colorStr: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);

  gradient.addColorStop(0, colorStr);
  gradient.addColorStop(0.1, colorStr);
  gradient.addColorStop(0.3, "rgba(255,190,90,.30)");
  gradient.addColorStop(0.65, "rgba(255,100,40,.07)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function randFloatSpreadSeeded(rng: () => number, range: number): number {
  return (rng() - 0.5) * range;
}

function randFloatSeeded(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export const MilkyWayGalaxy: React.FC<MilkyWayGalaxyProps> = ({
  onWarpToSolarSystem,
  isHoveredOverSun,
  setIsHoveredOverSun,
  visible,
  opacity = 1.0
}) => {
  const activeLOD = useSimulationStore((state) => state.activeLOD);
  const preset = GRAPHICS_PRESETS[activeLOD || 'HIGH'] || GRAPHICS_PRESETS.HIGH;
  const particleMultiplier = preset.particleMultiplier;

  const galaxyGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const sunMarkerRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  // Reference to galaxy star shader material for uniform updates
  const galaxyStarMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  // 1. GALAXY STARS (Adaptive Preset Count: 240,000 at High)
  const { starsGeometry, galaxyStarMaterial } = useMemo(() => {
    const count = Math.round(SETTINGS.galaxyStars * particleMultiplier);
    const rng = createSeededRandom(0x4d696c6b); // Deterministic seed 'Milk'
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const randoms = new Float32Array(count);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      let radius: number;
      if (rng() < 0.22) {
        radius = Math.pow(rng(), 1.9) * 27;
      } else {
        radius = 8 + Math.pow(rng(), 0.63) * 54;
      }

      let angle = rng() * Math.PI * 2;

      if (rng() < 0.74) {
        const selectedArm = ARMS[Math.floor(rng() * ARMS.length)];
        const target = armAngle(radius, selectedArm);
        const spread =
          SETTINGS.armWidth *
          selectedArm.width *
          (0.15 + rng() * 1.45);
        angle = target + randFloatSpreadSeeded(rng, spread);
      }

      const localArm = nearestArm(radius, angle);
      const armDensity =
        Math.exp(-Math.pow(localArm.distance, 2) * 1.6) * localArm.strength;
      const clump = 0.72 + Math.pow(rng(), 3) * 1.6;

      let actualRadius = radius;
      actualRadius += randFloatSpreadSeeded(rng, 1.7 + armDensity * 2.6);

      const x = Math.cos(angle) * actualRadius;
      const z = Math.sin(angle) * actualRadius;

      const thickness =
        SETTINGS.diskThickness * (0.25 + 0.85 * Math.exp(-radius / 27));
      let y = randFloatSpreadSeeded(rng, thickness);
      y +=
        Math.sin(angle * 2.0 + radius * 0.11) *
        (radius / SETTINGS.galaxyRadius) *
        0.45;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      color.copy(getStarColor(radius, armDensity, rng()));
      const brightness =
        (0.52 + rng() * 0.62) *
        (0.72 + armDensity * 0.38) *
        clump;
      color.multiplyScalar(brightness);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      let size = 0.45 + Math.pow(rng(), 8) * 4.8;
      size *= 0.75 + armDensity * 0.55;
      if (radius < SETTINGS.bulgeRadius) size *= 0.85;

      sizes[i] = size;
      alphas[i] = 0.42 + rng() * 0.58;
      randoms[i] = rng();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geometry.computeBoundingSphere();

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: SETTINGS.pixelRatio }
      },
      vertexShader: `
        attribute float aSize;
        attribute float aAlpha;
        attribute float aRandom;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec3 p = position;
          float shimmer = sin(uTime * 0.7 + aRandom * 80.0);
          p *= 1.0 + shimmer * 0.008;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aSize * uPixelRatio * (125.0 / -mvPosition.z);
          gl_PointSize = clamp(gl_PointSize, 0.35, 18.0);
          gl_Position = projectionMatrix * mvPosition;

          vColor = color;
          vAlpha = aAlpha;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float glow = 1.0 - smoothstep(0.0, 0.5, d);
          float core = 1.0 - smoothstep(0.0, 0.13, d);
          float crossX = exp(-abs(uv.y) * 38.0);
          float crossY = exp(-abs(uv.x) * 38.0);
          float sparkle = (crossX + crossY) * 0.10;
          float alpha = (glow * 0.72 + core * 1.8 + sparkle) * vAlpha;

          if (alpha < 0.008) discard;
          gl_FragColor = vec4(vColor, alpha);
        }
      `
    });

    galaxyStarMaterialRef.current = material;
    return { starsGeometry: geometry, galaxyStarMaterial: material };
  }, [particleMultiplier]);

  // 2. CENTRAL BAR (Adaptive Preset Count: 15,000 at High)
  const { barGeometry, barMaterial } = useMemo(() => {
    const count = Math.round(15000 * particleMultiplier);
    const rng = createSeededRandom(0x42617253); // Seed 'BarS'
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const x = randFloatSpreadSeeded(rng, 15);
      const width = 1.7 * (1 - Math.abs(x) / 8);

      positions[i * 3] = x;
      positions[i * 3 + 1] = randFloatSpreadSeeded(rng, width);
      positions[i * 3 + 2] = randFloatSpreadSeeded(rng, width * 0.75);

      color.copy(rng() < 0.7 ? COLOR.gold : COLOR.warm);
      color.multiplyScalar(0.6 + rng() * 0.55);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = 0.5 + rng() * 2.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.computeBoundingSphere();

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;

        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (120.0 / -mv.z);
          gl_PointSize = clamp(gl_PointSize, 0.4, 12.0);
          gl_Position = projectionMatrix * mv;
          vColor = color;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float alpha = 1.0 - smoothstep(0.0, 0.5, d);
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vColor, alpha);
        }
      `
    });

    return { barGeometry: geometry, barMaterial: material };
  }, [particleMultiplier]);

  // 3. STAR FORMATION REGIONS (Adaptive Preset Count: 11,000 at High)
  const { starFormationGeometry, starFormationMaterial } = useMemo(() => {
    const count = Math.round(SETTINGS.starFormation * particleMultiplier);
    const rng = createSeededRandom(0x48325265); // Seed 'H2Re'
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const radius = randFloatSeeded(rng, 12, 56);
      const arm = ARMS[Math.floor(rng() * ARMS.length)];
      const center = armAngle(radius, arm);
      const angle =
        center + randFloatSpreadSeeded(rng, 0.075 + rng() * 0.17);
      const radial = radius + randFloatSpreadSeeded(rng, 2.4);

      positions[i * 3] = Math.cos(angle) * radial;
      positions[i * 3 + 1] = randFloatSpreadSeeded(rng, 1.6);
      positions[i * 3 + 2] = Math.sin(angle) * radial;

      const r = rng();
      if (r < 0.40) color.copy(COLOR.pink);
      else if (r < 0.68) color.copy(COLOR.purple);
      else if (r < 0.86) color.copy(COLOR.cyan);
      else color.copy(COLOR.red);

      color.multiplyScalar(0.55 + rng() * 0.7);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = 0.8 + Math.pow(rng(), 4) * 5.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.computeBoundingSphere();

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;

        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (125.0 / -mv.z);
          gl_PointSize = clamp(gl_PointSize, 0.4, 16.0);
          gl_Position = projectionMatrix * mv;
          vColor = color;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float glow = 1.0 - smoothstep(0.0, 0.5, d);
          float core = 1.0 - smoothstep(0.0, 0.13, d);
          float alpha = glow * (0.42 + core * 1.6);
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vColor, alpha * 0.72);
        }
      `
    });

    return { starFormationGeometry: geometry, starFormationMaterial: material };
  }, [particleMultiplier]);

  // 4. DUST LANES (Adaptive Preset Count: 28,000 at High)
  const { dustGeometry, dustMaterial } = useMemo(() => {
    const count = Math.round(SETTINGS.dustParticles * particleMultiplier);
    const rng = createSeededRandom(0x44757374); // Seed 'Dust'
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = randFloatSeeded(rng, 10, 59);
      const arm = ARMS[Math.floor(rng() * ARMS.length)];
      const center = armAngle(radius, arm);
      const angle =
        center +
        0.055 +
        randFloatSpreadSeeded(rng, 0.11 + arm.width * 0.12);
      const radial = radius + randFloatSpreadSeeded(rng, 3.5);

      positions[i * 3] = Math.cos(angle) * radial;
      positions[i * 3 + 1] = randFloatSpreadSeeded(rng, 1.0);
      positions[i * 3 + 2] = Math.sin(angle) * radial;

      sizes[i] = 1.0 + rng() * 4.0;
      alphas[i] = 0.025 + rng() * 0.075;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.computeBoundingSphere();

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexShader: `
        attribute float aSize;
        attribute float aAlpha;
        varying float vAlpha;

        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (115.0 / -mv.z);
          gl_PointSize = clamp(gl_PointSize, 0.5, 14.0);
          gl_Position = projectionMatrix * mv;
          vAlpha = aAlpha;
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float cloud = 1.0 - smoothstep(0.0, 0.5, d);
          if (cloud < 0.01) discard;
          gl_FragColor = vec4(0.012, 0.008, 0.018, cloud * vAlpha);
        }
      `
    });

    return { dustGeometry: geometry, dustMaterial: material };
  }, [particleMultiplier]);

  // 5. NEBULA CLOUDS (Adaptive Preset Count: 32,000 at High)
  const { nebulaGeometry, nebulaMaterial } = useMemo(() => {
    const count = Math.round(SETTINGS.nebulaParticles * particleMultiplier);
    const rng = createSeededRandom(0x4e656275); // Seed 'Nebu'
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const radius = randFloatSeeded(rng, 12, 59);
      const arm = ARMS[Math.floor(rng() * ARMS.length)];
      const center = armAngle(radius, arm);
      const angle = center + randFloatSpreadSeeded(rng, 0.24);
      const radial = radius + randFloatSpreadSeeded(rng, 5.5);

      positions[i * 3] = Math.cos(angle) * radial;
      positions[i * 3 + 1] = randFloatSpreadSeeded(rng, 2.8);
      positions[i * 3 + 2] = Math.sin(angle) * radial;

      const r = rng();
      if (r < 0.25) color.copy(COLOR.blue);
      else if (r < 0.46) color.copy(COLOR.violet);
      else if (r < 0.68) color.copy(COLOR.purple);
      else if (r < 0.84) color.copy(COLOR.pink);
      else color.copy(COLOR.orange);

      color.multiplyScalar(0.45 + rng() * 0.55);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = 0.5 + rng() * 3.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.computeBoundingSphere();

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;

        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (105.0 / -mv.z);
          gl_PointSize = clamp(gl_PointSize, 0.5, 13.0);
          gl_Position = projectionMatrix * mv;
          vColor = color;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float cloud = 1.0 - smoothstep(0.0, 0.5, d);
          cloud = pow(cloud, 2.0);
          if (cloud < 0.01) discard;
          gl_FragColor = vec4(vColor, cloud * 0.11);
        }
      `
    });

    return { nebulaGeometry: geometry, nebulaMaterial: material };
  }, [particleMultiplier]);

  // 6. BACKGROUND STAR FIELD (Adaptive Preset Count: 45,000 at High)
  const { backgroundStarsGeometry, backgroundStarsMaterial } = useMemo(() => {
    const count = Math.round(SETTINGS.backgroundStars * particleMultiplier);
    const rng = createSeededRandom(0x42675374); // Seed 'BgSt'
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const radius = randFloatSeeded(rng, 110, 520);
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(randFloatSeeded(rng, -1, 1));

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const r = rng();
      if (r < 0.60) color.set("#c9dcff");
      else if (r < 0.80) color.set("#ffffff");
      else if (r < 0.92) color.set("#ffd4a0");
      else color.set("#7ca9ff");

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = 0.35 + Math.pow(rng(), 8) * 4.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.computeBoundingSphere();

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;

        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (110.0 / -mv.z);
          gl_PointSize = clamp(gl_PointSize, 0.25, 7.0);
          gl_Position = projectionMatrix * mv;
          vColor = color;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float alpha = 1.0 - smoothstep(0.0, 0.5, d);
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vColor, alpha);
        }
      `
    });

    return { backgroundStarsGeometry: geometry, backgroundStarsMaterial: material };
  }, [particleMultiplier]);

  // 7. CENTRAL GLOW SPRITES
  const glowTexture1 = useMemo(() => createGlowTexture("rgba(255,238,185,1)"), []);
  const glowTexture2 = useMemo(() => createGlowTexture("rgba(255,150,60,1)"), []);

  // 8. ACCURATE SUN 3D POSITION IN ORION SPUR
  const sunPos = useMemo(() => {
    const [x, y, z] = MILKY_WAY_DATA.sunPosition.position3D;
    return new THREE.Vector3(x, y, z);
  }, []);

  // GPU Resource Disposal Lifecycle
  useEffect(() => {
    return () => {
      starsGeometry.dispose();
      galaxyStarMaterial.dispose();
      barGeometry.dispose();
      barMaterial.dispose();
      starFormationGeometry.dispose();
      starFormationMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      nebulaGeometry.dispose();
      nebulaMaterial.dispose();
      backgroundStarsGeometry.dispose();
      backgroundStarsMaterial.dispose();
      glowTexture1.dispose();
      glowTexture2.dispose();
    };
  }, [
    starsGeometry,
    galaxyStarMaterial,
    barGeometry,
    barMaterial,
    starFormationGeometry,
    starFormationMaterial,
    dustGeometry,
    dustMaterial,
    nebulaGeometry,
    nebulaMaterial,
    backgroundStarsGeometry,
    backgroundStarsMaterial,
    glowTexture1,
    glowTexture2
  ]);

  // Continuous Galactic Dynamics Animation Loop (Zero React Re-renders)
  useFrame((state, delta) => {
    if (!visible || opacity <= 0.001) return;
    const time = state.clock.getElapsedTime();

    // Astronomical rotation rate matching milky_way.html
    if (galaxyGroupRef.current) {
      galaxyGroupRef.current.rotation.y = time * 0.0035;
    }

    // Update twinkle shimmer uniform
    if (galaxyStarMaterialRef.current) {
      galaxyStarMaterialRef.current.uniforms.uTime.value = time;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.05;
      coreRef.current.rotation.z += delta * 0.02;
    }

    if (sunMarkerRef.current) {
      sunMarkerRef.current.position.y = sunPos.y + Math.sin(time * 3.0) * 0.4;
    }

    // Direct mesh ref mutations for 60FPS zero-rerender radar pulse
    const pulse = 1.0 + Math.sin(time * 4.0) * 0.25;
    if (innerRingRef.current) {
      innerRingRef.current.scale.set(pulse, pulse, pulse);
    }
    if (outerRingRef.current) {
      const pulseOuter = pulse * 1.4;
      outerRingRef.current.scale.set(pulseOuter, pulseOuter, pulseOuter);
    }
  });

  if (!visible || opacity <= 0.001) return null;

  return (
    <group>
      {/* Background Stars on Celestial Sphere */}
      <points geometry={backgroundStarsGeometry} material={backgroundStarsMaterial} />

      {/* Main Galactic Body tilted with exact angles from milky_way.html: x=8deg, z=-6deg */}
      <group
        ref={galaxyGroupRef}
        scale={[opacity, opacity, opacity]}
        rotation={[
          THREE.MathUtils.degToRad(8),
          0,
          THREE.MathUtils.degToRad(-6)
        ]}
      >
        {/* 1. Main Galaxy Stars */}
        <points geometry={starsGeometry} material={galaxyStarMaterial} />

        {/* 2. Central Elongated Bar Stars (rotated 8 deg around Z) */}
        <group rotation={[0, 0, THREE.MathUtils.degToRad(8)]}>
          <points geometry={barGeometry} material={barMaterial} />
        </group>

        {/* 3. Star Formation H II Regions */}
        <points geometry={starFormationGeometry} material={starFormationMaterial} />

        {/* 4. Interstellar Dark Dust Lanes */}
        <points geometry={dustGeometry} material={dustMaterial} />

        {/* 5. Volumetric Nebula Clouds */}
        <points geometry={nebulaGeometry} material={nebulaMaterial} />

        {/* 6. Central Galactic Bulge (Double Layer Squashed Spheroids + Point Light) */}
        <group>
          {/* Outer Bulge */}
          <mesh scale={[1, 0.56, 1]}>
            <sphereGeometry args={[8.8, 64, 64]} />
            <meshBasicMaterial
              color={0xffc978}
              transparent
              opacity={0.075}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Inner Core */}
          <mesh scale={[1, 0.58, 1]} ref={coreRef}>
            <sphereGeometry args={[4.3, 64, 64]} />
            <meshBasicMaterial
              color={0xffffd2}
              transparent
              opacity={0.18}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Core Point Light */}
          <pointLight color={0xffc16a} intensity={32} distance={65} />
        </group>

        {/* 7. Central Glow Sprites (Canvas Radial Gradients) */}
        <sprite scale={[24, 24, 1]}>
          <spriteMaterial
            map={glowTexture1}
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
        <sprite scale={[46, 46, 1]}>
          <spriteMaterial
            map={glowTexture2}
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>

        {/* 8. Supermassive Black Hole Sagittarius A* at Galactic Center (0, 0, 0) */}
        <SagittariusABody position={[0, 0, 0]} scale={0.8} />

        {/* 9. EARTH & SOLAR SYSTEM LOCATOR MARKER */}
        <group position={sunPos} ref={sunMarkerRef}>
          {/* Glowing Solar System Star Core (Sol) */}
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playWarpSwoosh();
              onWarpToSolarSystem();
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              soundEngine.playUiHover();
              setIsHoveredOverSun(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setIsHoveredOverSun(false);
              document.body.style.cursor = 'default';
            }}
          >
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshBasicMaterial color="#FFD60A" />
          </mesh>

          {/* Inner Pulsing Radar Range Ring (Local Interstellar Boundary) */}
          <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.8, 2.2, 32]} />
            <meshBasicMaterial
              color="#FFD60A"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Outer Pulsing Radar Range Ring (Oort Cloud Envelope) */}
          <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3.2, 3.5, 32]} />
            <meshBasicMaterial
              color="#00F5D4"
              transparent
              opacity={0.45}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

        </group>
      </group>
    </group>
  );
};
