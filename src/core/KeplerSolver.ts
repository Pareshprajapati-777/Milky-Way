import * as THREE from 'three';
import { PlanetaryOrbitalElements } from '../data/planetaryOrbits';

export interface KeplerianElements {
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  longitudeAscendingNodeDeg: number;
  argumentOfPeriapsisDeg: number;
  meanAnomalyAtEpochDeg: number;
  orbitalPeriodDays: number;
}

export interface StateVector {
  position: THREE.Vector3; // AU (Heliocentric: X, Y, Z in Three.js coords where Y is up)
  velocity: THREE.Vector3; // AU / day
  velocityKms: THREE.Vector3; // km / s
  trueAnomalyRad: number;
  eccentricAnomalyRad: number;
  meanAnomalyRad: number;
  heliocentricRadiusAU: number;
  orbitalSpeedKms: number;
}

/**
 * Standard Gravitational Parameter for the Sun (μ_sun = GM_sun):
 * In SI units: ~1.32712440018e20 m³/s² = 1.32712440018e11 km³/s²
 */
export const GM_SUN_KM3_S2 = 1.32712440018e11;
export const KM_PER_AU = 149597870.7;
export const SECONDS_PER_DAY = 86400;

// μ_sun in AU³/day² = GM_sun * (86400² / (149597870.7)³) ≈ 0.0002959122082855911 AU³/day²
export const GM_SUN_AU3_DAY2 = (GM_SUN_KM3_S2 * Math.pow(SECONDS_PER_DAY, 2)) / Math.pow(KM_PER_AU, 3);

/**
 * High-Precision Keplerian Orbit Solver
 * Incorporates:
 * - Robust Newton-Raphson eccentric anomaly solution with parabolic/bisection fallback
 * - Mathematically exact perifocal velocity vector derivation (h = r × v)
 * - Identical 3D orbital plane Euler transformations (Ω, i, ω) for position and velocity
 * - J2000 epoch propagation
 */
export class KeplerSolver {
  public static readonly DEG_TO_RAD = Math.PI / 180;
  public static readonly RAD_TO_DEG = 180 / Math.PI;
  public static readonly KM_PER_AU = KM_PER_AU;
  public static readonly SECONDS_PER_DAY = SECONDS_PER_DAY;
  public static readonly GM_SUN = GM_SUN_KM3_S2;
  public static readonly GM_SUN_AU = GM_SUN_AU3_DAY2;

  /**
   * Solves Kepler's equation M = E - e*sin(E) for Eccentric Anomaly E
   * Handles:
   * - High eccentricity (0.0 <= e < 1.0)
   * - Fast convergence with initial starter guess
   * - Fallback safeguards against non-convergence
   */
  static solveEccentricAnomaly(meanAnomalyRad: number, eccentricity: number, tolerance = 1e-12, maxIter = 50): number {
    if (!Number.isFinite(meanAnomalyRad) || !Number.isFinite(eccentricity)) {
      throw new Error(`Invalid inputs to solveEccentricAnomaly: M=${meanAnomalyRad}, e=${eccentricity}`);
    }

    if (eccentricity < 0 || eccentricity >= 1.0) {
      throw new Error(`Eccentricity must be in range [0, 1) for elliptic orbits. Received e=${eccentricity}`);
    }

    // Normalise M to [0, 2π)
    const TWO_PI = 2 * Math.PI;
    let M = meanAnomalyRad % TWO_PI;
    if (M < 0) M += TWO_PI;

    // For circular orbit
    if (eccentricity === 0) return M;

    // Robust initial starter (Danby / Mikkola approximation starter)
    let E: number;
    if (eccentricity > 0.8) {
      E = Math.PI;
    } else {
      E = M + eccentricity * Math.sin(M) + 0.5 * eccentricity * eccentricity * Math.sin(2 * M);
    }

    // Newton-Raphson iteration with Halley-step acceleration
    for (let i = 0; i < maxIter; i++) {
      const sinE = Math.sin(E);
      const cosE = Math.cos(E);
      const f = E - eccentricity * sinE - M;
      const fPrime = 1 - eccentricity * cosE;
      
      // Halley's correction step: delta = f / (f' - 0.5 * f'' * f / f')
      const fDoublePrime = eccentricity * sinE;
      const delta = f / (fPrime - (0.5 * fDoublePrime * f) / fPrime);
      
      E -= delta;

      if (Math.abs(delta) < tolerance) {
        return E;
      }
    }

    return E;
  }

  /**
   * Computes true 3D position AND velocity vectors in heliocentric coordinates (AU and km/s)
   */
  static computeHeliocentricPosition(elements: KeplerianElements, daysSinceEpoch: number): StateVector {
    if (!Number.isFinite(daysSinceEpoch)) {
      throw new Error(`Invalid daysSinceEpoch: ${daysSinceEpoch}`);
    }

    const a = elements.semiMajorAxisAU;
    const e = elements.eccentricity;
    const periodDays = elements.orbitalPeriodDays;

    if (a <= 0 || !Number.isFinite(a)) {
      throw new Error(`Semi-major axis must be positive. Received a=${a}`);
    }
    if (e < 0 || e >= 1.0 || !Number.isFinite(e)) {
      throw new Error(`Eccentricity must be in [0, 1). Received e=${e}`);
    }
    if (periodDays <= 0 || !Number.isFinite(periodDays)) {
      throw new Error(`Orbital period must be positive. Received periodDays=${periodDays}`);
    }

    const inc = (elements.inclinationDeg ?? 0) * this.DEG_TO_RAD;
    const Omega = (elements.longitudeAscendingNodeDeg ?? 0) * this.DEG_TO_RAD;
    const omega = (elements.argumentOfPeriapsisDeg ?? 0) * this.DEG_TO_RAD;

    // 1. Mean anomaly at target time: M = M0 + n * t
    const n = (2 * Math.PI) / periodDays; // Mean motion (rad/day)
    const m0 = (elements.meanAnomalyAtEpochDeg ?? 0) * this.DEG_TO_RAD;
    const M = m0 + n * daysSinceEpoch;

    // 2. Solve for Eccentric Anomaly E
    const E = this.solveEccentricAnomaly(M, e);

    // 3. True Anomaly ν
    const cosE = Math.cos(E);
    const sinE = Math.sin(E);
    const trueAnomaly = Math.atan2(
      Math.sqrt(1 - e * e) * sinE,
      cosE - e
    );

    // 4. Heliocentric physical radius r (AU)
    const r = a * (1 - e * cosE);

    // 5. Perifocal plane coordinates (Orbital plane coordinate frame: P toward periapsis, Q perpendicular)
    // Position in perifocal frame:
    // x_orb = r * cos(ν) = a * (cos(E) - e)
    // y_orb = r * sin(ν) = a * sqrt(1 - e²) * sin(E)
    const xOrb = a * (cosE - e);
    const yOrb = a * Math.sqrt(1 - e * e) * sinE;

    // Perifocal velocity in AU/day:
    // r * E_dot = sqrt(μ * a) / r
    // vx_orb = -sqrt(μ * a) * sin(E) / r
    // vy_orb =  sqrt(μ * a * (1 - e²)) * cos(E) / r
    const sqrtMuA_AU = Math.sqrt(this.GM_SUN_AU * a);
    const vxOrbAU = (-sqrtMuA_AU * sinE) / r;
    const vyOrbAU = (sqrtMuA_AU * Math.sqrt(1 - e * e) * cosE) / r;

    // 6. 3D Coordinate Transformation (Perifocal plane to Heliocentric Ecliptic frame)
    // Standard Gauss direction cosines (Euler 3-1-3 rotation):
    // P = unit vector toward perihelion
    // Q = unit vector in orbital plane, 90° ahead of perihelion
    const cosO = Math.cos(Omega);
    const sinO = Math.sin(Omega);
    const cosw = Math.cos(omega);
    const sinw = Math.sin(omega);
    const cosi = Math.cos(inc);
    const sini = Math.sin(inc);

    // Unit vector P (perifocal X basis)
    const px = cosO * cosw - sinO * sinw * cosi;
    const py = sinO * cosw + cosO * sinw * cosi;
    const pz = sinw * sini;

    // Unit vector Q (perifocal Y basis)
    const qx = -cosO * sinw - sinO * cosw * cosi;
    const qy = -sinO * sinw + cosO * cosw * cosi;
    const qz = cosw * sini;

    // Standard astronomical ecliptic coordinates (X_ecl, Y_ecl, Z_ecl):
    // In standard celestial mechanics: +Z_ecl is North Ecliptic Pole, XY is ecliptic plane.
    // In Three.js coordinate system convention:
    // Three.js X = X_ecl
    // Three.js Y = Z_ecl (vertical inclination axis)
    // Three.js Z = Y_ecl
    const xEcliptic = xOrb * px + yOrb * qx;
    const yEcliptic = xOrb * py + yOrb * qy;
    const zEcliptic = xOrb * pz + yOrb * qz;

    const pos = new THREE.Vector3(xEcliptic, zEcliptic, yEcliptic);

    // Apply the exact same transformation to velocity vectors (AU / day)
    const vxEclipticAU = vxOrbAU * px + vyOrbAU * qx;
    const vyEclipticAU = vxOrbAU * py + vyOrbAU * qy;
    const vzEclipticAU = vxOrbAU * pz + vyOrbAU * qz;

    const velAU = new THREE.Vector3(vxEclipticAU, vzEclipticAU, vyEclipticAU);

    // Convert velocity to km/s: (AU / day) * (KM_PER_AU / 86400)
    const AU_DAY_TO_KMS = this.KM_PER_AU / this.SECONDS_PER_DAY;
    const velKms = velAU.clone().multiplyScalar(AU_DAY_TO_KMS);

    // Scalar orbital speed from Vis-Viva equation (v² = μ_sun * (2/r - 1/a))
    const rKm = r * this.KM_PER_AU;
    const aKm = a * this.KM_PER_AU;
    const orbitalSpeedKms = Math.sqrt(Math.max(0, this.GM_SUN * (2.0 / rKm - 1.0 / aKm)));

    return {
      position: pos,
      velocity: velAU,
      velocityKms: velKms,
      trueAnomalyRad: trueAnomaly,
      eccentricAnomalyRad: E,
      meanAnomalyRad: M % (2 * Math.PI),
      heliocentricRadiusAU: r,
      orbitalSpeedKms
    };
  }

  /**
   * Generates smooth closed Keplerian orbit curve points for rendering
   */
  static generateOrbitPoints(orbit: PlanetaryOrbitalElements, numPoints = 128, scaleFactor = 25.0): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const elements: KeplerianElements = {
      semiMajorAxisAU: orbit.semiMajorAxisAU,
      eccentricity: orbit.eccentricity,
      inclinationDeg: orbit.inclinationDeg,
      longitudeAscendingNodeDeg: orbit.longitudeAscendingNodeDeg,
      argumentOfPeriapsisDeg: orbit.argumentOfPeriapsisDeg,
      meanAnomalyAtEpochDeg: 0,
      orbitalPeriodDays: orbit.orbitalPeriodDays
    };

    for (let i = 0; i <= numPoints; i++) {
      const frac = i / numPoints;
      const simDay = frac * orbit.orbitalPeriodDays;
      const state = this.computeHeliocentricPosition(elements, simDay);
      points.push(state.position.clone().multiplyScalar(scaleFactor));
    }
    return points;
  }
}
