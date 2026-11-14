import * as THREE from 'three';

// Fast Simplex-like Perlin 2D noise implementation for procedural texture generation
class SimpleNoise {
  private p: number[] = [];
  private perm: number[] = [];

  constructor(seed = 1337) {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      const temp = p[i];
      p[i] = p[j];
      p[j] = temp;
    }
    this.p = p;
    this.perm = new Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  public noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const aa = this.perm[this.perm[X] + Y];
    const ab = this.perm[this.perm[X] + Y + 1];
    const ba = this.perm[this.perm[X + 1] + Y];
    const bb = this.perm[this.perm[X + 1] + Y + 1];

    const g1 = this.grad(aa, xf, yf);
    const g2 = this.grad(ba, xf - 1, yf);
    const g3 = this.grad(ab, xf, yf - 1);
    const g4 = this.grad(bb, xf - 1, yf - 1);

    const x1 = this.lerp(u, g1, g2);
    const x2 = this.lerp(u, g3, g4);

    return (this.lerp(v, x1, x2) + 1) * 0.5;
  }

  public fbm(x: number, y: number, octaves = 4, persistence = 0.5, lacunarity = 2.0): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }
}

const noiseGen = new SimpleNoise(42);
const textureCache = new Map<string, THREE.CanvasTexture>();

function createTextureFromCanvas(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

/**
 * PLUTO TEXTURE (Heart-shaped Sputnik Planitia Glacier)
 * Retained as requested ("pluto mat karna remove") because Pluto is not in REYAL look.
 */
export function getPlutoTexture(): THREE.CanvasTexture {
  const cacheKey = 'pluto_texture';
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // Heart center coordinates (Sputnik Planitia)
  const hX = 0.50;
  const hY = 0.52;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const index = (y * width + x) * 4;

      const n = noiseGen.fbm(nx * 8.0, ny * 4.0, 5, 0.55, 2.0);

      // Heart shape equation
      const px = (nx - hX) * 3.0;
      const py = -(ny - hY) * 3.0;
      const heartFormula = Math.pow(px * px + py * py - 0.25, 3.0) - px * px * py * py * py;
      const isHeart = heartFormula < 0;

      let r = 0, g = 0, b = 0;
      if (isHeart) {
        // Bright nitrogen glacier
        r = 240;
        g = 230;
        b = 220;
      } else {
        // Reddish tholin terrain
        r = Math.floor(175 + n * 60);
        g = Math.floor(120 + n * 45);
        b = Math.floor(95 + n * 35);
      }

      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = createTextureFromCanvas(canvas);
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * SPECIALIZED MOON TEXTURES (Io, Europa, Titan, Triton, etc.)
 */
export function getSpecializedMoonTexture(type: 'io' | 'europa' | 'ganymede' | 'titan' | 'triton' | 'rocky' | 'moon'): THREE.CanvasTexture {
  const cacheKey = `moon_${type}_texture`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const index = (y * width + x) * 4;

      const n1 = noiseGen.fbm(nx * 8.0, ny * 4.0, 4, 0.5, 2.0);
      const n2 = noiseGen.noise(nx * 20.0, ny * 10.0);

      let r = 200, g = 200, b = 200;

      if (type === 'io') {
        const caldera = Math.pow(noiseGen.noise(nx * 28.0 + 4, ny * 14.0 + 2), 5.0);
        if (caldera > 0.4) {
          r = 40; g = 20; b = 15;
        } else {
          r = Math.floor(235 * n1 + 20);
          g = Math.floor(190 * n1 + 30);
          b = Math.floor(35 * n1 + 10);
        }
      } else if (type === 'europa') {
        const fracture = Math.sin((nx + ny) * 40.0 + n1 * 10.0);
        if (Math.abs(fracture) < 0.15) {
          r = 180; g = 80; b = 60;
        } else {
          r = 230 + Math.floor(n2 * 25);
          g = 240 + Math.floor(n2 * 15);
          b = 250;
        }
      } else if (type === 'titan') {
        r = Math.floor(230 + n1 * 25);
        g = Math.floor(155 + n1 * 35);
        b = Math.floor(45 + n1 * 25);
      } else if (type === 'triton') {
        r = Math.floor(185 + n1 * 45);
        g = Math.floor(210 + n1 * 35);
        b = Math.floor(235 + n2 * 20);
      } else {
        const val = Math.floor(140 + n1 * 90);
        r = val; g = val; b = val + 5;
      }

      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = createTextureFromCanvas(canvas);
  textureCache.set(cacheKey, texture);
  return texture;
}
