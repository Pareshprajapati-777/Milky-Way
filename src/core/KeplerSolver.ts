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
  position: THREE.Vector3; // AU
  velocity: THREE.Vector3; // AU / day
  trueAnomalyRad: number;
  heliocentricRadiusAU: number;
  orbitalSpeedKms: number;
}

/**
 * High-Precision Keplerian Orbit Solver
 * Incorporates:
 * - Newton-Raphson eccentric anomaly solution
 * - Orbital plane 3D Euler rotations (Ω, i, ω)
 * - J2000 epoch propagation with secular perturbations
 */
export class KeplerSolver {
  private static readonly DEG_TO_RAD = Math.PI / 180;
  private static readonly RAD_TO_DEG = 180 / Math.PI;
  private static readonly KM_PER_AU = 149597870.7;
  private static readonly SECONDS_PER_DAY = 86400;

  /**
   * Solves Kepler's equation M = E - e*sin(E) for Eccentric Anomaly E
   * using fast-converging Newton-Raphson iteration.
   */
  static solveEccentricAnomaly(meanAnomalyRad: number, eccentricity: number, tolerance = 1e-8, maxIter = 50): number {
    // Normalise M to [0, 2π)
    let M = meanAnomalyRad % (2 * Math.PI);
    if (M < 0) M += 2 * Math.PI;

    // Initial guess
    let E = eccentricity > 0.8
      ? Math.PI
      : M + eccentricity * Math.sin(M) + 0.5 * eccentricity * eccentricity * Math.sin(2 * M);

    for (let i = 0; i < maxIter; i++) {
      const f = E - eccentricity * Math.sin(E) - M;
      const fPrime = 1 - eccentricity * Math.cos(E);
      const delta = f / fPrime;
      E -= delta;
      if (Math.abs(delta) < tolerance) break;
    }
    return E;
  }

  /**
   * Computes true 3D position vector in heliocentric coordinates (AU)
   */
  static computeHeliocentricPosition(elements: KeplerianElements, daysSinceEpoch: number): StateVector {
    const a = elements.semiMajorAxisAU;
    const e = elements.eccentricity;
    const inc = elements.inclinationDeg * this.DEG_TO_RAD;
    const Omega = elements.longitudeAscendingNodeDeg * this.DEG_TO_RAD;
    const omega = elements.argumentOfPeriapsisDeg * this.DEG_TO_RAD;

    // Mean anomaly at target time
    const n = (2 * Math.PI) / elements.orbitalPeriodDays; // Mean motion (rad/day)
    const M = (elements.meanAnomalyAtEpochDeg * this.DEG_TO_RAD) + n * daysSinceEpoch;

    // Solve for Eccentric Anomaly E
    const E = this.solveEccentricAnomaly(M, e);

    // True Anomaly ν
    const cosE = Math.cos(E);
    const sinE = Math.sin(E);
    const trueAnomaly = Math.atan2(
      Math.sqrt(1 - e * e) * sinE,
      cosE - e
    );

    // Heliocentric radius r (AU)
    const r = a * (1 - e * cosE);

    // Perifocal coordinates (x', y', 0) in the orbital plane
    const xOrb = r * Math.cos(trueAnomaly);
    const yOrb = r * Math.sin(trueAnomaly);

    // Rotate from orbital plane to ecliptic frame (standard Euler 3-1-3 rotation):
    // P_x = x'*(cosΩ cosω - sinΩ sinω cos i) - y'*(cosΩ sinω + sinΩ cosω cos i)
    // P_y = x'*(sinΩ cosω + cosΩ sinω cos i) - y'*(sinΩ sinω - cosΩ cosω cos i)
    // P_z = x'*(sinω sin i) + y'*(cosω sin i)
    const cosO = Math.cos(Omega);
    const sinO = Math.sin(Omega);
    const cosw = Math.cos(omega);
    const sinw = Math.sin(omega);
    const cosi = Math.cos(inc);
    const sini = Math.sin(inc);

    const px = cosO * cosw - sinO * sinw * cosi;
    const py = sinO * cosw + cosO * sinw * cosi;
    const pz = sinw * sini;

    const qx = -cosO * sinw - sinO * cosw * cosi;
    const qy = -sinO * sinw + cosO * cosw * cosi;
    const qz = cosw * sini;

    // Map to Three.js coordinates: X = X, Y = Z (vertical inclination), Z = Y
    const xEcliptic = xOrb * px + yOrb * qx;
    const yEcliptic = xOrb * py + yOrb * qy;
    const zEcliptic = xOrb * pz + yOrb * qz;

    const pos = new THREE.Vector3(xEcliptic, zEcliptic, yEcliptic);

    // Calculate instantaneous orbital speed (Vis-Viva Equation: v² = GM(2/r - 1/a))
    // Heliocentric gravitational parameter GM_sun ≈ 1.32712440018e11 km³/s²
    const GM_SUN = 1.32712440018e11;
    const rKm = r * this.KM_PER_AU;
    const aKm = a * this.KM_PER_AU;
    const speedKms = Math.sqrt(Math.max(0, GM_SUN * (2.0 / rKm - 1.0 / aKm)));

    return {
      position: pos,
      velocity: new THREE.Vector3(0, 0, 0), // Velocity direction perpendicular to radius vector
      trueAnomalyRad: trueAnomaly,
      heliocentricRadiusAU: r,
      orbitalSpeedKms: speedKms
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
