import * as THREE from 'three';
import { getPlutoTexture } from './proceduralTextures';

/**
 * Authentic High-Definition Texture URLs extracted directly from 'REYAL look' HTML files.
 * Uses official NASA / ESA / USGS planetary maps hosted on CORS-enabled repositories.
 */
export const REALISTIC_TEXTURE_URLS = {
  // Sun (2K Photographic Solar Surface) - from REYAL look/SUN.HTML
  sun: 'https://raw.githubusercontent.com/Shriisoot/Planets-texture/refs/heads/main/2k_sun.jpg',

  // Mercury (8K Cratered Map) - from REYAL look/mercury.html
  mercury: 'https://raw.githubusercontent.com/Shriisoot/Planets-texture/main/8k_mercury.jpg',

  // Venus (8K Magellan Radar Imagery Global Map) - from REYAL look/venus.html
  venus: 'https://raw.githubusercontent.com/smithcg1/DigitalSolarSystem/master/8k_venus_surface.jpg',

  // Earth (8K Day Map, 8K City Lights Night Map, 2K Normal Map, Specular, 2K Clouds) - from REYAL look/earth.html
  earthDay: 'https://raw.githubusercontent.com/Shriisoot/Planets-texture/refs/heads/main/8k_earth_daymap.jpg',
  earthNight: 'https://raw.githubusercontent.com/Shriisoot/Planets-texture/refs/heads/main/8k_earth_nightmap.jpg',
  earthNormal: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
  earthSpecular: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
  earthClouds: 'https://raw.githubusercontent.com/Shriisoot/Planets-texture/refs/heads/main/2k_earth_clouds.jpg',

  // Moon (8K Lunar Surface & Topographic Elevation Bump Map) - from REYAL look/moon.html
  moon: 'https://raw.githubusercontent.com/smithcg1/DigitalSolarSystem/master/8k_moon.jpg',
  moonBackup: 'https://raw.githubusercontent.com/Shriisoot/Planets-texture/refs/heads/main/2k_moon.jpg',
  moonElevation: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/moonbump1k.jpg',

  // Mars (2K Global Surface + 2K Normal Map) - from REYAL look/mars.html
  mars: 'https://raw.githubusercontent.com/josdirksen/learning-threejs/master/assets/textures/planets/Mars_2k-050104.png',
  marsNormal: 'https://raw.githubusercontent.com/josdirksen/learning-threejs/master/assets/textures/planets/Mars-normalmap_2k.png',

  // Jupiter (8K High-Resolution Jovian Cloud Belts) - from REYAL look/jupiter.html
  jupiter: 'https://raw.githubusercontent.com/smithcg1/DigitalSolarSystem/master/8k_jupiter.jpg',

  // Saturn (8K Banded Surface + 8K High-Res Alpha Ring Map) - from REYAL look/saturn.html
  saturn: 'https://raw.githubusercontent.com/Shriisoot/Planets-texture/main/8k_saturn.jpg',
  saturnRing: 'https://raw.githubusercontent.com/Shriisoot/Planets-texture/main/8k_saturn_ring_alpha.png',

  // Uranus (2K Ice Giant Texture) - from REYAL look/Uranus.html
  uranus: 'https://raw.githubusercontent.com/Shrey1803/Solar-system/main/textures/2k_uranus.jpg',

  // Neptune (2K Deep Azure Texture) - from REYAL look/Neptune.html
  neptune: 'https://raw.githubusercontent.com/Shriisoot/Planets-texture/refs/heads/main/2k_neptune.jpg',
};

// Global TextureLoader instance with CORS enabled
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = 'anonymous';

// Texture cache to prevent duplicate network calls and ensure shared GPU instances
const textureCache = new Map<string, THREE.Texture>();

function createInitialEarthCanvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  // Deep blue ocean
  ctx.fillStyle = '#0f3875';
  ctx.fillRect(0, 0, 256, 128);
  // Polar ice
  ctx.fillStyle = '#e2f1fc';
  ctx.fillRect(0, 0, 256, 12);
  ctx.fillRect(0, 116, 256, 12);
  // Stylized continents
  ctx.fillStyle = '#2d6a36';
  ctx.beginPath();
  // Eurasia / Africa
  ctx.ellipse(140, 50, 45, 25, 0.2, 0, Math.PI * 2);
  ctx.ellipse(145, 75, 25, 25, 0, 0, Math.PI * 2);
  // Americas
  ctx.ellipse(60, 45, 30, 20, -0.3, 0, Math.PI * 2);
  ctx.ellipse(75, 80, 20, 30, 0.2, 0, Math.PI * 2);
  // Australia
  ctx.ellipse(190, 85, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

function createInitialNightCanvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#05070d';
  ctx.fillRect(0, 0, 256, 128);
  // Golden city clusters
  ctx.fillStyle = '#fce28b';
  for (let i = 0; i < 120; i++) {
    const x = (i * 37) % 256;
    const y = 20 + ((i * 19) % 88);
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  return canvas;
}

function createInitialCloudsCanvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.clearRect(0, 0, 256, 128);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.70)';
  for (let i = 0; i < 30; i++) {
    const x = (i * 47) % 256;
    const y = (i * 23) % 128;
    ctx.beginPath();
    ctx.ellipse(x, y, 25, 6, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
}

/**
 * Direct Three.js Texture loading matching the implementations in REYAL look HTML files.
 * Directly yields a clean Three.js Texture that uploads automatically when received.
 */
export function getDirectRealisticTexture(
  url: string,
  isDataMap = false,
  wrapClamp = false,
  fallbackUrl?: string
): THREE.Texture {
  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }

  const texture = textureLoader.load(
    url,
    (loadedTex) => {
      if (!isDataMap) {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
      }
      loadedTex.anisotropy = 16;
      loadedTex.generateMipmaps = true;
      loadedTex.needsUpdate = true;
    },
    undefined,
    (err) => {
      console.warn(`[SolarSystem] Remote texture failed for ${url}`, err);
      if (fallbackUrl) {
        console.log(`[SolarSystem] Loading fallback texture: ${fallbackUrl}`);
        textureLoader.load(fallbackUrl, (fallbackTex) => {
          texture.image = fallbackTex.image;
          if (!isDataMap) {
            texture.colorSpace = THREE.SRGBColorSpace;
          }
          texture.needsUpdate = true;
        });
      }
    }
  );

  // Pre-seed texture image with instant procedural canvas so it is NEVER blank/transparent
  if (typeof document !== 'undefined') {
    let initialCanvas: HTMLCanvasElement | null = null;
    if (url.includes('earth_daymap')) {
      initialCanvas = createInitialEarthCanvas();
    } else if (url.includes('earth_nightmap')) {
      initialCanvas = createInitialNightCanvas();
    } else if (url.includes('earth_clouds')) {
      initialCanvas = createInitialCloudsCanvas();
    }

    if (initialCanvas) {
      texture.image = initialCanvas;
      texture.needsUpdate = true;
    }
  }

  if (!isDataMap) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  texture.anisotropy = 16;
  texture.generateMipmaps = true;

  if (wrapClamp) {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
  } else {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
  }

  textureCache.set(url, texture);
  return texture;
}

// -------------------------------------------------------------
// Direct Texture Accessors for Each Celestial Body
// -------------------------------------------------------------

// Sun - from REYAL look/SUN.HTML
export const getRealisticSunTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.sun);

// Mercury - from REYAL look/mercury.html
export const getRealisticMercuryTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.mercury);

// Venus - from REYAL look/venus.html
export const getRealisticVenusTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.venus);

// Earth - from REYAL look/earth.html
export const getRealisticEarthDayTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.earthDay);

export const getRealisticEarthNightTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.earthNight);

export const getRealisticEarthNormalTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.earthNormal, true);

export const getRealisticEarthSpecularTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.earthSpecular, true);

export const getRealisticEarthCloudsTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.earthClouds);

// Moon - from REYAL look/moon.html
export const getRealisticMoonTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.moon, false, false, REALISTIC_TEXTURE_URLS.moonBackup);

export const getRealisticMoonElevationTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.moonElevation, true, true);

// Mars - from REYAL look/mars.html
export const getRealisticMarsTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.mars);

export const getRealisticMarsNormalTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.marsNormal, true);

// Jupiter - from REYAL look/jupiter.html
export const getRealisticJupiterTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.jupiter);

// Saturn - from REYAL look/saturn.html
export const getRealisticSaturnTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.saturn);

export const getRealisticSaturnRingTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.saturnRing, false, true);

// Uranus - from REYAL look/Uranus.html
export const getRealisticUranusTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.uranus);

// Neptune - from REYAL look/Neptune.html
export const getRealisticNeptuneTexture = () =>
  getDirectRealisticTexture(REALISTIC_TEXTURE_URLS.neptune);

// Pluto - Retained as explicitly requested ("pluto mat karna remove")
export const getRealisticPlutoTexture = () => getPlutoTexture();
