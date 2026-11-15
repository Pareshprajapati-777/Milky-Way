import * as THREE from 'three';
import { CelestialBodyData, MoonData } from '../data/astronomy';
import {
  CENTRAL_PLANETARY_DATA,
  PlanetaryOrbitalElements,
  MU_SUN_KM3_S2,
  KM_PER_AU
} from '../data/planetaryOrbits';
import { auToVisualDistance, ASTRO_CONSTANTS, ScaleMode } from './astronomicalUnits';
import { KeplerSolver, KeplerianElements } from '../core/KeplerSolver';

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
  velocityVectorKps: THREE.Vector3;
  velocityAUPerDay: THREE.Vector3;
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
 * Solve Kepler's Equation M = E - e*sin(E) for Eccentric Anomaly E.
 * Delegates directly to the authoritative KeplerSolver engine.
 */
export function solveKeplerEquation(M: number, eccentricity: number): number {
  return KeplerSolver.solveEccentricAnomaly(M, eccentricity);
}

/**
 * Validates and extracts Keplerian parameters for a given celestial body input.
 * Throws an explicit descriptive error instead of silently falling back to Earth.
 */
export function resolvePlanetaryElements(
  planetOrId: CelestialBodyData | PlanetaryOrbitalElements | string
): PlanetaryOrbitalElements {
  let elem: PlanetaryOrbitalElements | null = null;

  if (typeof planetOrId === 'string') {
    elem = CENTRAL_PLANETARY_DATA[planetOrId.toLowerCase()] || null;
  } else if ('semiMajorAxisAU' in planetOrId && 'longitudeAscendingNodeDeg' in planetOrId) {
    elem = planetOrId as PlanetaryOrbitalElements;
  } else if ('id' in planetOrId) {
    elem = CENTRAL_PLANETARY_DATA[planetOrId.id.toLowerCase()] || null;
  }

  if (!elem) {
    const identifier = typeof planetOrId === 'string' ? planetOrId : (planetOrId as any)?.id ?? 'unknown';
    throw new Error(
      `[CelestialMechanicsError] Unknown celestial body identifier: "${identifier}". ` +
      `No authoritative Keplerian ephemeris found in CENTRAL_PLANETARY_DATA.`
    );
  }

  return elem;
}

/**
 * Compute the complete Keplerian state vector and physical orbital telemetry.
 * Origin: Sun center (0, 0, 0).
 */
export function calculateKeplerianOrbit(
  planetOrId: CelestialBodyData | PlanetaryOrbitalElements | string,
  simTimeDays: number
): OrbitPhysicsState {
  if (!Number.isFinite(simTimeDays)) {
    throw new Error(`[CelestialMechanicsError] Invalid simulation time (simTimeDays=${simTimeDays}). Must be a finite number.`);
  }

  // Authoritative element resolution without silent fallback
  const elem = resolvePlanetaryElements(planetOrId);

  const a = elem.semiMajorAxisAU;
  const e = elem.eccentricity;
  const periodDays = elem.orbitalPeriodDays;

  // Compute mean anomaly at epoch J2000 from Mean Longitude:
  // L = Ω + ω + M0  =>  M0 = L - Ω - ω
  const meanLongRad = THREE.MathUtils.degToRad(elem.meanLongitudeDeg ?? 0);
  const nodeRad = THREE.MathUtils.degToRad(elem.longitudeAscendingNodeDeg ?? 0);
  const periRad = THREE.MathUtils.degToRad(elem.argumentOfPeriapsisDeg ?? 0);
  const m0Rad = meanLongRad - nodeRad - periRad;

  const keplerElements: KeplerianElements = {
    semiMajorAxisAU: a,
    eccentricity: e,
    inclinationDeg: elem.inclinationDeg ?? 0,
    longitudeAscendingNodeDeg: elem.longitudeAscendingNodeDeg ?? 0,
    argumentOfPeriapsisDeg: elem.argumentOfPeriapsisDeg ?? 0,
    meanAnomalyAtEpochDeg: THREE.MathUtils.radToDeg(m0Rad),
    orbitalPeriodDays: periodDays
  };

  // Authoritative State Vector from KeplerSolver
  const stateVector = KeplerSolver.computeHeliocentricPosition(keplerElements, simTimeDays);

  const rAU = stateVector.heliocentricRadiusAU;
  const distanceKm = rAU * KM_PER_AU;
  const distanceMillionKm = distanceKm / 1e6;

  let nuNorm = stateVector.trueAnomalyRad % (Math.PI * 2);
  if (nuNorm < 0) nuNorm += Math.PI * 2;

  let mNorm = stateVector.meanAnomalyRad % (Math.PI * 2);
  if (mNorm < 0) mNorm += Math.PI * 2;

  return {
    rAU,
    distanceMillionKm,
    trueAnomalyRad: nuNorm,
    trueAnomalyDeg: THREE.MathUtils.radToDeg(nuNorm),
    meanAnomalyRad: mNorm,
    meanAnomalyDeg: THREE.MathUtils.radToDeg(mNorm),
    eccentricAnomalyRad: stateVector.eccentricAnomalyRad,
    eccentricAnomalyDeg: THREE.MathUtils.radToDeg(stateVector.eccentricAnomalyRad),
    velocityKps: stateVector.orbitalSpeedKms,
    velocityVectorKps: stateVector.velocityKms,
    velocityAUPerDay: stateVector.velocity,
    positionAU: stateVector.position,
    direction: stateVector.position.clone().normalize(),
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
  // Tame visual inclination for Pluto/Mercury so orbits form an aesthetically readable celestial system
  const elem = resolvePlanetaryElements(planet);
  const periRad = THREE.MathUtils.degToRad(elem.argumentOfPeriapsisDeg ?? 0);
  const nodeRad = THREE.MathUtils.degToRad(elem.longitudeAscendingNodeDeg ?? 0);
  const incRad = THREE.MathUtils.degToRad(elem.inclinationDeg ?? 0) * 0.15;

  const nu = state.trueAnomalyRad;
  const theta = nu + periRad;
  const rAU = state.rAU;

  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosNode = Math.cos(nodeRad);
  const sinNode = Math.sin(nodeRad);
  const cosInc = Math.cos(incRad);
  const sinInc = Math.sin(incRad);

  // In Three.js coords: X = X, Y = Z (vertical inclination), Z = Y
  const x = rAU * (cosNode * cosTheta - sinNode * sinTheta * cosInc);
  const y = rAU * (sinTheta * sinInc);
  const z = rAU * (sinNode * cosTheta + cosNode * sinTheta * cosInc);

  const pos = new THREE.Vector3(x, y, z);
  const dir = pos.clone().normalize();
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
  const elem = resolvePlanetaryElements(planetOrId);

  const a = elem.semiMajorAxisAU;
  const e = elem.eccentricity;
  const nodeRad = THREE.MathUtils.degToRad(elem.longitudeAscendingNodeDeg ?? 0);
  const periRad = THREE.MathUtils.degToRad(elem.argumentOfPeriapsisDeg ?? 0);
  const incRad =
    scaleMode === 'true_scale'
      ? THREE.MathUtils.degToRad(elem.inclinationDeg ?? 0)
      : THREE.MathUtils.degToRad(elem.inclinationDeg ?? 0) * 0.15;

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
      const dir = posAU.clone().normalize();
      const visualDist = auToVisualDistance(rAU);
      points.push(dir.multiplyScalar(visualDist));
    }
  }

  return points;
}

/**
 * Calculates a moon's 3D position relative to its host planet.
 * Upgraded from flat circular orbit to authentic 3D Keplerian mechanics:
 * - Solves Kepler's equation for eccentric anomaly E when e > 0
 * - Transforms perifocal orbital plane coordinates using inclination (i) and node (Ω)
 * - Supports both prograde and retrograde moon orbits (e.g. Triton)
 */
export function getMoonRelativePosition(
  moon: MoonData,
  simTimeDays: number,
  scaleMode: ScaleMode = 'enhanced'
): THREE.Vector3 {
  if (!moon) {
    throw new Error('[CelestialMechanicsError] Null or undefined moon passed to getMoonRelativePosition');
  }

  const periodDays = Math.abs(moon.orbitPeriodDays) || 27.32166;
  const isRetrograde = moon.orbitPeriodDays < 0;
  const n = (Math.PI * 2) / periodDays * (isRetrograde ? -1 : 1);
  const M = n * simTimeDays;

  const e = Math.max(0, Math.min(0.99, moon.eccentricity ?? 0));
  const incRad = THREE.MathUtils.degToRad(moon.inclinationDeg ?? 0);
  const nodeRad = THREE.MathUtils.degToRad(moon.longitudeAscendingNodeDeg ?? 0);
  const periRad = THREE.MathUtils.degToRad(moon.argumentOfPeriapsisDeg ?? 0);

  // Solve for Eccentric Anomaly E
  const E = e > 0.0001 ? KeplerSolver.solveEccentricAnomaly(M, e) : M;

  // Compute radius factor r / a = 1 - e * cos(E)
  const rFactor = 1.0 - e * Math.cos(E);

  // Perifocal coordinates in the moon's orbital plane
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const sqrtOneMinusESq = Math.sqrt(Math.max(0, 1.0 - e * e));

  // Base semi-major axis depending on scale mode
  let a: number;
  if (scaleMode === 'true_scale') {
    // 1 Earth radius = 6,371 km
    a = moon.orbitDistanceKm / ASTRO_CONSTANTS.EARTH_RADIUS_KM;
  } else {
    a = moon.visualOrbitDistance;
  }

  // Coordinates in orbital plane
  const xOrb = a * (cosE - e);
  const yOrb = a * sqrtOneMinusESq * sinE;

  // Euler 3-1-3 rotation into 3D planet-centered space (X-Z orbital plane, +Y is north pole)
  const cosNode = Math.cos(nodeRad);
  const sinNode = Math.sin(nodeRad);
  const cosPeri = Math.cos(periRad);
  const sinPeri = Math.sin(periRad);
  const cosInc = Math.cos(incRad);
  const sinInc = Math.sin(incRad);

  const Px = cosNode * cosPeri - sinNode * sinPeri * cosInc;
  const Py = sinPeri * sinInc;
  const Pz = sinNode * cosPeri + cosNode * sinPeri * cosInc;

  const Qx = -cosNode * sinPeri - sinNode * cosPeri * cosInc;
  const Qy = cosPeri * sinInc;
  const Qz = -sinNode * sinPeri + cosNode * cosPeri * cosInc;

  const x = xOrb * Px + yOrb * Qx;
  const y = xOrb * Py + yOrb * Qy;
  const z = xOrb * Pz + yOrb * Qz;

  return new THREE.Vector3(x, y, z);
}

/**
 * Calculates Kepler's 3rd Law ratio: a³ / T²
 * For any body orbiting the Sun, a³ / T² in AU and Julian Years equals exactly 1.000.
 */
export function calculateKeplerRatio(planet: CelestialBodyData | PlanetaryOrbitalElements | string): number {
  const elem = resolvePlanetaryElements(planet);
  const a = elem.semiMajorAxisAU;
  const T = elem.orbitalPeriodDays / 365.256;
  return Math.pow(a, 3) / Math.pow(T, 2);
}

/**
 * Physical Axial Rotation:
 * Computes exact, unscaled physical rotation angle θ in radians according to true sidereal period.
 * 1 simulated day = 24.0 hours.
 * θ(t) = direction * (2π * (simTimeDays * 24.0) / |periodHours|)
 * Direction is -1 for retrograde rotators (Venus, Uranus, Pluto) and +1 for prograde.
 */
export function getPhysicalAxialRotation(
  planet: CelestialBodyData | PlanetaryOrbitalElements | string,
  simTimeDays: number
): number {
  const elem = resolvePlanetaryElements(planet);
  const periodHours = elem.rotationPeriodHours ?? 24.0;
  const id = elem.id.toLowerCase();

  const isRetrograde = periodHours < 0 || id === 'venus' || id === 'uranus' || id === 'pluto';
  const direction = isRetrograde ? -1 : 1;
  const absHours = Math.abs(periodHours);

  // Exact unscaled sidereal rotation
  return direction * ((Math.PI * 2 * (simTimeDays * 24.0)) / absHours);
}

/**
 * Cinematic Visual Axial Rotation:
 * Provides smooth, comfortable visual spin rate for real-time 3D interactive observation:
 * - Earth completes 1 rotation every ~32 seconds at 1x simulation speed (1 day/s).
 * - Relative rotation rate ratios between planets are authentically preserved.
 * - Retrograde direction is strictly maintained.
 */
export function getCinematicAxialRotation(
  planet: CelestialBodyData | PlanetaryOrbitalElements | string,
  simTimeDays: number
): number {
  const elem = resolvePlanetaryElements(planet);
  const periodHours = elem.rotationPeriodHours ?? 24.0;
  const id = elem.id.toLowerCase();

  const isRetrograde = periodHours < 0 || id === 'venus' || id === 'uranus' || id === 'pluto';
  const direction = isRetrograde ? -1 : 1;
  const absHours = Math.abs(periodHours);

  // Visual dampening factor preserving planetary rotation ratios without strobe effects:
  const relativeRate = Math.min(3.0, 24.0 / Math.max(8.0, absHours));
  const baseAngularSpeed = 0.196; // ~32s period at 1x speed

  return direction * baseAngularSpeed * relativeRate * simTimeDays;
}

/**
 * Legacy compatibility alias: delegates directly to getCinematicAxialRotation.
 */
export function getPlanetAxialRotation(
  planet: CelestialBodyData | PlanetaryOrbitalElements | string,
  simTimeDays: number
): number {
  return getCinematicAxialRotation(planet, simTimeDays);
}
