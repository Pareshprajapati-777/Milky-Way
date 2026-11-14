/**
 * General Relativity & Relativistic Astrophysics Calculations
 * Focused on Sagittarius A* (Supermassive Black Hole at the Galactic Center)
 */

export const RELATIVISTIC_CONSTANTS = {
  G: 6.67430e-11,       // m^3 kg^-1 s^-2
  C: 2.99792458e8,      // m s^-1
  SOLAR_MASS_KG: 1.98847e30,
  SGR_A_MASS_SOLAR: 4.154e6, // ~4.15 million solar masses
  SGR_A_DISTANCE_LY: 26670,   // Distance from Sun in light years
};

export class RelativityEngine {
  /**
   * Schwarzschild Radius: r_s = 2GM / c^2 (Event Horizon of non-spinning Schwarzschild BH)
   */
  static calculateSchwarzschildRadiusMeters(massSolarUnits: number): number {
    const massKg = massSolarUnits * RELATIVISTIC_CONSTANTS.SOLAR_MASS_KG;
    return (2 * RELATIVISTIC_CONSTANTS.G * massKg) / (RELATIVISTIC_CONSTANTS.C ** 2);
  }

  /**
   * Photon Sphere Radius: r_ph = 1.5 * r_s = 3GM / c^2
   * Orbits of light rays, determining the critical shadow diameter
   */
  static calculatePhotonSphereRadiusMeters(massSolarUnits: number): number {
    return 1.5 * this.calculateSchwarzschildRadiusMeters(massSolarUnits);
  }

  /**
   * Innermost Stable Circular Orbit (ISCO) for non-rotating black hole:
   * r_isco = 3 * r_s = 6GM / c^2
   */
  static calculateISCOMeters(massSolarUnits: number): number {
    return 3.0 * this.calculateSchwarzschildRadiusMeters(massSolarUnits);
  }

  /**
   * Gravitational Lensing Deflection Angle:
   * α = 4GM / (c^2 * b) = 2 * r_s / b
   * where b is the impact parameter
   */
  static calculateEinsteinDeflectionRad(massSolarUnits: number, impactParameterMeters: number): number {
    const rs = this.calculateSchwarzschildRadiusMeters(massSolarUnits);
    if (impactParameterMeters <= rs) return Math.PI; // Absorbed into event horizon
    return (2 * rs) / impactParameterMeters;
  }

  /**
   * Gravitational Redshift Factor: z = 1 / sqrt(1 - r_s / r) - 1
   */
  static calculateGravitationalRedshift(massSolarUnits: number, radiusMeters: number): number {
    const rs = this.calculateSchwarzschildRadiusMeters(massSolarUnits);
    if (radiusMeters <= rs) return Infinity;
    return 1.0 / Math.sqrt(1.0 - rs / radiusMeters) - 1.0;
  }
}

