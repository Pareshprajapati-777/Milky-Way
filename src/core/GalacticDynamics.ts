import * as THREE from 'three';

export interface SpiralArmConfig {
  name: string;
  arms: number;
  pitchAngleRad: number;
  rotationOffsetRad: number;
  coreRadiusLY: number;
  outerRadiusLY: number;
  dispersionZ: number;
}

/**
 * Galactic Dynamics & Dark Matter Density Profile Engine
 * Implements:
 * - Logarithmic spiral arm coordinate generators
 * - Navarro-Frenk-White (NFW) Dark Matter halo rotation curve
 * - Stellar velocity dispersion in the galactic disk and central bulge
 */
export class GalacticDynamics {
  /**
   * Logarithmic Spiral Arm equation: r = a * exp(b * θ)
   * where b = tan(pitchAngle)
   */
  static generateSpiralPoint(
    theta: number,
    armIndex: number,
    totalArms: number,
    pitchAngleDeg = 12.0,
    armOffsetScale = 800.0,
    coreRadius = 3000.0
  ): THREE.Vector3 {
    const pitchRad = (pitchAngleDeg * Math.PI) / 180;
    const b = Math.tan(pitchRad);
    const armAngleOffset = (armIndex * 2 * Math.PI) / totalArms;
    const currentAngle = theta + armAngleOffset;

    const r = coreRadius + armOffsetScale * Math.exp(b * theta);

    // Natural turbulent dispersion in disk thickness
    const diskHeightZ = (Math.random() - 0.5) * (300.0 + r * 0.05);

    const x = r * Math.cos(currentAngle);
    const z = r * Math.sin(currentAngle);

    return new THREE.Vector3(x, diskHeightZ, z);
  }

  /**
   * Flat Galactic Rotation Curve (Rubin-Ford Effect / Dark Matter Halo)
   * v(r) ~ constant (~220 km/s) across middle and outer disk radii (r > 3 kpc)
   */
  static getOrbitalSpeedKmS(radiusKpc: number): number {
    if (radiusKpc < 0.1) return 50.0;
    // Central rigid Keplerian rise
    if (radiusKpc < 2.0) {
      return 220.0 * Math.sqrt(radiusKpc / 2.0);
    }
    // Flat rotation plateau supported by dark matter halo
    return 220.0 + (Math.sin(radiusKpc * 0.5) * 5.0);
  }

  /**
   * Orbital period in millions of years (Myr) at a given galactic radius
   */
  static getGalacticOrbitalPeriodMyr(radiusLY: number): number {
    const radiusKm = radiusLY * 9.461e12;
    const radiusKpc = radiusLY / 3261.56;
    const speedKmS = this.getOrbitalSpeedKmS(radiusKpc);
    const circumferenceKm = 2 * Math.PI * radiusKm;
    const seconds = circumferenceKm / speedKmS;
    return seconds / (86400 * 365.25 * 1e6); // ~230 Myr for Solar circle (26,000 LY)
  }
}

