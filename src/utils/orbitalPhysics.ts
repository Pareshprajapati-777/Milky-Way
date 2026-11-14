import * as THREE from 'three';
import { CelestialBodyData, MoonData } from '../data/astronomy';
import {
  CENTRAL_PLANETARY_DATA,
  PlanetaryOrbitalElements,
  MU_SUN_KM3_S2,
  KM_PER_AU
} from '../data/planetaryOrbits';
import { auToVisualDistance, ASTRO_CONSTANTS, ScaleMode } from './astronomicalUnits';

/**
 * Standard simulated days elapsed per real second at 1x simulation speed.
 * 1 real second = 1.0 simulated Earth day.
 */
export const BASE_SIM_DAYS_PER_SECOND = 1.0;

export interface OrbitPhysicsState {
  rAU: number;
  distanceMillionKm: number;
  trueAnomalyRad: number;
  trueAnomalyDeg: number;
  meanAnomalyRad: number;
  meanAnomalyDeg: number;
  eccentricAnomalyRad: number;
  eccentricAnomalyDeg: number;
  velocityKps: number;
  positionAU: THREE.Vector3;
  direction: THREE.Vector3;
  semiMajorAxisAU: number;
  eccentricity: number;
  orbitalPeriodDays: number;
}

/**
 * Retrieve centralized authoritative orbital elements for any celestial body ID.
 */
export function getPlanetOrbitalElements(planetOrId: CelestialBodyData | string): PlanetaryOrbitalElements | null {
  const id = typeof planetOrId === 'string' ? planetOrId.toLowerCase() : planetOrId.id.toLowerCase();
  return CENTRAL_PLANETARY_DATA[id] || null;
}

/**
 * Solve Kepler's Equation M = E - e*sin(E) for Eccentric Anomaly E
 * using high-precision Newton-Raphson iteration.
 * Converges to machine precision in 3-5 iterations.
 */
export function solveKeplerEquation(M: number, eccentricity: number): number {
  // Normalize mean anomaly M to [0, 2π)
  const TWO_PI = Math.PI * 2;
  let mNorm = M % TWO_PI;
  if (mNorm < 0) mNorm += TWO_PI;

  // Initial estimate (improved for eccentric orbits)
  let E: number;
  if (eccentricity > 0.8) {
    E = Math.PI;
  } else {
    E = mNorm + eccentricity * Math.sin(mNorm);
  }

  // Newton-Raphson iterations with tolerance 1e-11
  for (let iter = 0; iter < 12; iter++) {
    const f = E - eccentricity * Math.sin(E) - mNorm;
    const fPrime = 1 - eccentricity * Math.cos(E);
    const delta = f / fPrime;
    E -= delta;
    if (Math.abs(delta) < 1e-11) break;
  }

  return E;
}

/**
 * Compute the complete Keplerian state vector and physical orbital telemetry.
 * Origin: Sun center (0, 0, 0).
 */
export function calculateKeplerianOrbit(
  planetOrId: CelestialBodyData | PlanetaryOrbitalElements | string,
  simTimeDays: number
): OrbitPhysicsState {
  let elem: PlanetaryOrbitalElements | null = null;

  if (typeof planetOrId === 'string') {
    elem = CENTRAL_PLANETARY_DATA[planetOrId.toLowerCase()] || null;
  } else if ('semiMajorAxisAU' in planetOrId && 'longitudeAscendingNodeDeg' in planetOrId) {
    elem = planetOrId as PlanetaryOrbitalElements;
  } else if ('id' in planetOrId) {
    elem = CENTRAL_PLANETARY_DATA[planetOrId.id.toLowerCase()] || null;
  }

  // Fallback defaults for safety (Earth reference)
  const a = elem?.semiMajorAxisAU ?? 1.0;
  const e = elem?.eccentricity ?? 0.0167;
  const periodDays = elem?.orbitalPeriodDays ?? 365.256;
  const incRad = THREE.MathUtils.degToRad(elem?.inclinationDeg ?? 0);
  const nodeRad = THREE.MathUtils.degToRad(elem?.longitudeAscendingNodeDeg ?? 0);
  const periRad = THREE.MathUtils.degToRad(elem?.argumentOfPeriapsisDeg ?? 0);
  const meanLongRad = THREE.MathUtils.degToRad(elem?.meanLongitudeDeg ?? 0);

  // 1. Mean motion in radians per simulated day
  const n = (Math.PI * 2) / periodDays;

  // 2. Mean anomaly at epoch J2000: M0 = L - Ω - ω
  const m0 = meanLongRad - nodeRad - periRad;
  const M = m0 + n * simTimeDays;

  // 3. Solve for Eccentric Anomaly E
  const E = solveKeplerEquation(M, e);

  // 4. True Anomaly ν
  const sinHalfE = Math.sin(E * 0.5);
  const cosHalfE = Math.cos(E * 0.5);
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * sinHalfE,
    Math.sqrt(1 - e) * cosHalfE
  );
  let nuNorm = nu % (Math.PI * 2);
  if (nuNorm < 0) nuNorm += Math.PI * 2;

  // 5. Heliocentric physical radius r (AU) via Kepler's 1st Law
  const rAU = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
  const distanceKm = rAU * KM_PER_AU;
  const distanceMillionKm = distanceKm / 1e6;

  // 6. Orbital velocity v (km/s) via Vis-Viva equation: v² = μ * (2/r - 1/a)
  const aKm = a * KM_PER_AU;
  const velocityKps = Math.sqrt(Math.max(0, MU_SUN_KM3_S2 * (2.0 / distanceKm - 1.0 / aKm)));

  // 7. 3D Heliocentric coordinates in J2000 Ecliptic Frame
  // Argument of latitude in orbital plane: θ = ν + ω
  const theta = nu + periRad;

  // Canonical transformation: R_y(Ω) * R_x(i) * R_y(ω) * [r*cos(ν), 0, r*sin(ν)]
  // X = r * (cos(Ω)*cos(θ) - sin(Ω)*sin(θ)*cos(i))
  // Y = r * (sin(θ)*sin(i))
  // Z = r * (sin(Ω)*cos(θ) + cos(Ω)*sin(θ)*cos(i))
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosNode = Math.cos(nodeRad);
  const sinNode = Math.sin(nodeRad);
  const cosInc = Math.cos(incRad);
  const sinInc = Math.sin(incRad);

  const xAU = rAU * (cosNode * cosTheta - sinNode * sinTheta * cosInc);
  const yAU = rAU * (sinTheta * sinInc);
  const zAU = rAU * (sinNode * cosTheta + cosNode * sinTheta * cosInc);

  const positionAU = new THREE.Vector3(xAU, yAU, zAU);
  const direction = positionAU.clone().normalize();

  return {
    rAU,
    distanceMillionKm,
    trueAnomalyRad: nuNorm,
    trueAnomalyDeg: THREE.MathUtils.radToDeg(nuNorm),
    meanAnomalyRad: M % (Math.PI * 2),
    meanAnomalyDeg: THREE.MathUtils.radToDeg(M % (Math.PI * 2)),
    eccentricAnomalyRad: E,
    eccentricAnomalyDeg: THREE.MathUtils.radToDeg(E),
    velocityKps,
    positionAU,
    direction,
    semiMajorAxisAU: a,
    eccentricity: e,
    orbitalPeriodDays: periodDays
  };
}

/**
 * Compute true heliocentric 3D position vector in scene units.
 * Supports both Enhanced Visibility (log-compressed) and True Scale (1:1 Earth radii).
 */
export function getPlanet3DPosition(
  planet: CelestialBodyData | PlanetaryOrbitalElements | string,
  simTimeDays: number,
  scaleMode: ScaleMode = 'enhanced'
): THREE.Vector3 {
  const id = typeof planet === 'string' ? planet.toLowerCase() : planet.id.toLowerCase();
  if (id === 'sun') return new THREE.Vector3(0, 0, 0);

  const state = calculateKeplerianOrbit(planet, simTimeDays);

  if (scaleMode === 'true_scale') {
    // 1 scene unit = 1 Earth Radius (6,371 km)
    // 1 AU = 149,597,870.7 km / 6,371 km ≈ 23,481.0 scene units
    return state.positionAU.clone().multiplyScalar(23481.0);
  }

  // Enhanced visibility mode with logarithmic depth compression
  // Tame extreme visual inclination for Pluto/Mercury so orbits form a harmonious celestial disc
  const elem = CENTRAL_PLANETARY_DATA[id];
  const periRad = THREE.MathUtils.degToRad(elem?.argumentOfPeriapsisDeg ?? 0);
  const nodeRad = THREE.MathUtils.degToRad(elem?.longitudeAscendingNodeDeg ?? 0);
  const incRad = THREE.MathUtils.degToRad(elem?.inclinationDeg ?? 0) * 0.15;

  const nu = state.trueAnomalyRad;
  const theta = nu + periRad;
  const rAU = state.rAU;

  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosNode = Math.cos(nodeRad);
  const sinNode = Math.sin(nodeRad);
  const cosInc = Math.cos(incRad);
  const sinInc = Math.sin(incRad);

  const x = rAU * (cosNode * cosTheta - sinNode * sinTheta * cosInc);
  const y = rAU * (sinTheta * sinInc);
  const z = rAU * (sinNode * cosTheta + cosNode * sinTheta * cosInc);

  const pos = new THREE.Vector3(x, y, z);
  const dir = pos.normalize();
  const visualDist = auToVisualDistance(rAU);
  return dir.multiplyScalar(visualDist);
}

/**
 * Generate 3D trajectory points for drawing Keplerian orbit paths.
 * Sampled from the EXACT SAME mathematical equations as getPlanet3DPosition,
 * guaranteeing zero visual deviation or drift between planet and orbit line.
 */
export function getPlanetOrbitLinePoints(
  planetOrId: CelestialBodyData | PlanetaryOrbitalElements | string,
  scaleMode: ScaleMode = 'enhanced',
  segments = 256
): THREE.Vector3[] {
  let elem: PlanetaryOrbitalElements | null = null;

  if (typeof planetOrId === 'string') {
    elem = CENTRAL_PLANETARY_DATA[planetOrId.toLowerCase()] || null;
  } else if ('semiMajorAxisAU' in planetOrId && 'longitudeAscendingNodeDeg' in planetOrId) {
    elem = planetOrId as PlanetaryOrbitalElements;
  } else if ('id' in planetOrId) {
    elem = CENTRAL_PLANETARY_DATA[planetOrId.id.toLowerCase()] || null;
  }

  if (!elem) return [];

  const a = elem.semiMajorAxisAU;
  const e = elem.eccentricity;
  const nodeRad = THREE.MathUtils.degToRad(elem.longitudeAscendingNodeDeg);
  const periRad = THREE.MathUtils.degToRad(elem.argumentOfPeriapsisDeg);
  const incRad =
    scaleMode === 'true_scale'
      ? THREE.MathUtils.degToRad(elem.inclinationDeg)
      : THREE.MathUtils.degToRad(elem.inclinationDeg) * 0.15;

  const cosNode = Math.cos(nodeRad);
  const sinNode = Math.sin(nodeRad);
  const cosInc = Math.cos(incRad);
  const sinInc = Math.sin(incRad);

  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const nu = (i / segments) * (Math.PI * 2);
    // r(ν) = a*(1 - e²) / (1 + e*cos(ν))
    const rAU = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
    const theta = nu + periRad;

    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const xAU = rAU * (cosNode * cosTheta - sinNode * sinTheta * cosInc);
    const yAU = rAU * (sinTheta * sinInc);
    const zAU = rAU * (sinNode * cosTheta + cosNode * sinTheta * cosInc);

    const posAU = new THREE.Vector3(xAU, yAU, zAU);

    if (scaleMode === 'true_scale') {
      points.push(posAU.multiplyScalar(23481.0));
    } else {
      const dir = posAU.normalize();
      const visualDist = auToVisualDistance(rAU);
      points.push(dir.multiplyScalar(visualDist));
    }
  }

  return points;
}

/**
 * Calculates a moon's 3D position relative to its host planet.
 */
export function getMoonRelativePosition(
  moon: MoonData,
  simTimeDays: number,
  scaleMode: ScaleMode = 'enhanced'
): THREE.Vector3 {
  const periodDays = Math.abs(moon.orbitPeriodDays) || 27.32;
  const isRetrograde = moon.orbitPeriodDays < 0;
  const n = (Math.PI * 2) / periodDays * (isRetrograde ? -1 : 1);
  const angle = n * simTimeDays;

  let r = moon.visualOrbitDistance;
  if (scaleMode === 'true_scale') {
    // 1 Earth radius = 6,371 km
    r = moon.orbitDistanceKm / ASTRO_CONSTANTS.EARTH_RADIUS_KM;
  }

  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  return new THREE.Vector3(x, 0, z);
}

/**
 * Calculates Kepler's 3rd Law ratio: a³ / T²
 * For any body orbiting the Sun, a³ / T² in AU and Julian Years equals exactly 1.000.
 */
export function calculateKeplerRatio(planet: CelestialBodyData | PlanetaryOrbitalElements | string): number {
  let elem: PlanetaryOrbitalElements | null = null;
  if (typeof planet === 'string') {
    elem = CENTRAL_PLANETARY_DATA[planet.toLowerCase()] || null;
  } else if ('semiMajorAxisAU' in planet) {
    elem = planet as PlanetaryOrbitalElements;
  } else if ('id' in planet) {
    elem = CENTRAL_PLANETARY_DATA[planet.id.toLowerCase()] || null;
  }

  if (!elem) return 1.0;
  const a = elem.semiMajorAxisAU;
  const T = elem.orbitalPeriodDays / 365.256;
  return Math.pow(a, 3) / Math.pow(T, 2);
}

/**
 * Calculate natural, aesthetically pleasing axial rotation angle for day/night cycles.
 * Preserves true relative physical rotation periods between planets (Jupiter spins 2.4x faster
 * than Earth, Venus spins slowly backwards, Mars matches Earth), while maintaining a comfortable,
 * majestic viewing speed (Earth takes ~32s for 1 rotation at 1x, instead of spinning like a drill).
 */
export function getPlanetAxialRotation(
  planet: CelestialBodyData | PlanetaryOrbitalElements | string,
  simTimeDays: number
): number {
  let periodHours = 24.0;
  let id = '';

  if (typeof planet === 'string') {
    id = planet.toLowerCase();
    periodHours = CENTRAL_PLANETARY_DATA[id]?.rotationPeriodHours ?? 24.0;
  } else {
    id = planet.id.toLowerCase();
    periodHours = planet.rotationPeriodHours || 24.0;
  }

  const isRetrograde = periodHours < 0 || id === 'venus' || id === 'uranus' || id === 'pluto';
  const direction = isRetrograde ? -1 : 1;
  const absHours = Math.abs(periodHours);

  // Normal, aesthetically pleasing visual rotation speed:
  // Earth (24h) completes 1 rotation every ~32 seconds.
  // Other planets scale proportionally according to (24.0 / absHours).
  const relativeRate = Math.min(3.0, 24.0 / Math.max(8.0, absHours));
  const baseAngularSpeed = 0.196; // ~32s period

  return direction * baseAngularSpeed * relativeRate * simTimeDays;
}
