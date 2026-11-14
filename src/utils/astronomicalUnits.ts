/**
 * ============================================================================
 * ASTRONOMICAL CONSTANTS, UNIT CONVERSIONS & SCALING SYSTEM
 * ============================================================================
 * Centralized scientific reference module for the Milky Way & Solar System
 * 3D simulation. Converts between physical SI / Astronomical units and
 * 3D scene units under both "Enhanced Visibility" and "True Physical Scale" modes.
 *
 * References:
 * - IAU (International Astronomical Union) 2012 / 2015 Constants
 * - NASA Planetary Fact Sheets (JPL / Goddard)
 * - Reid et al. (2019) Galactic Center Astrometric Measurements
 * ============================================================================
 */

export const ASTRO_CONSTANTS = {
  // Distance Constants
  KM_PER_AU: 149597870.7, // 1 Astronomical Unit in km
  KM_PER_LIGHT_YEAR: 9.4607304725808e12, // 1 Light-Year in km
  AU_PER_LIGHT_YEAR: 63241.077, // AU per light-year
  PARSEC_IN_LY: 3.26156, // 1 Parsec in light-years
  LIGHT_SPEED_KPS: 299792.458, // Speed of light in vacuum (km/s)

  // Solar & Terrestrial Radii
  SUN_RADIUS_KM: 696340.0,
  EARTH_RADIUS_KM: 6371.0,
  JUPITER_RADIUS_KM: 69911.0,
  MOON_RADIUS_KM: 1737.4,

  // Milky Way Physical Parameters
  MILKY_WAY_DIAMETER_LY: 100000.0,
  MILKY_WAY_RADIUS_LY: 50000.0,
  MILKY_WAY_DISK_THICKNESS_LY: 1000.0,
  SUN_GALACTOCENTRIC_DISTANCE_LY: 26490.0, // ~8.12 kpc
  SUN_GALACTOCENTRIC_DISTANCE_KPC: 8.12,
  SUN_ORBITAL_SPEED_KPS: 220.0, // Sun orbital speed around galactic center
  GALACTIC_YEAR_MYR: 230.0, // Cosmic Year duration in million Earth years
} as const;

export type ScaleMode = 'enhanced' | 'true_scale';

export type DataSourceStatus =
  | 'OBSERVATIONAL' // Measured observational data (NASA/JPL/IAU)
  | 'THEORETICAL' // Derived from astrophysics models
  | 'SIMULATED' // Calculated dynamically in simulation
  | 'APPROXIMATION'; // Scaled/visual approximation for rendering

export interface ScientificDisclosure {
  title: string;
  category: 'Scale' | 'Orbital Mechanics' | 'Coordinate Frame' | 'Atmosphere';
  description: string;
  source: string;
}

export const SCIENTIFIC_DISCLOSURES: ScientificDisclosure[] = [
  {
    title: 'Enhanced Visibility Scaling vs. True Scale',
    category: 'Scale',
    description:
      'In real space, the Sun is 109 times the diameter of Earth, and the distance between them is 23,481 Earth radii. Rendering true scale simultaneously renders planets sub-pixel specks of dust. Enhanced Visibility logarithmically compresses interplanetary space and amplifies planetary radii for clear exploration, while True Scale mode lets you inspect physical proportions.',
    source: 'IAU Division I / Visual Astrodynamics'
  },
  {
    title: 'Galactic Frame & Solar System Location',
    category: 'Coordinate Frame',
    description:
      'The Solar System is placed at approximately 26,490 light-years (8.12 kpc) from the Galactic Center (Sagittarius A*) in the Orion-Cygnus Local Spur, inclined ~60° to the Galactic disk plane.',
    source: 'Reid et al. (2019) / VLBA Astrometry'
  },
  {
    title: 'Keplerian Orbital Propagation',
    category: 'Orbital Mechanics',
    description:
      'Planetary orbits follow Keplerian motion conforming to a³/T² = constant for bodies orbiting the central Solar mass, preserving realistic period ratios and velocities.',
    source: 'Keplerian Elements / NASA JPL Horizons Ephemeris'
  }
];

/**
 * Format physical distances cleanly with appropriate SI / Astronomical units.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1000) {
    return `${distanceKm.toFixed(1)} km`;
  }
  if (distanceKm < 1e6) {
    return `${(distanceKm).toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;
  }
  if (distanceKm < ASTRO_CONSTANTS.KM_PER_AU * 0.1) {
    return `${(distanceKm / 1e6).toFixed(2)} Million km`;
  }
  if (distanceKm < ASTRO_CONSTANTS.KM_PER_LIGHT_YEAR * 0.05) {
    const au = distanceKm / ASTRO_CONSTANTS.KM_PER_AU;
    return `${au.toFixed(3)} AU`;
  }
  const ly = distanceKm / ASTRO_CONSTANTS.KM_PER_LIGHT_YEAR;
  return `${ly.toLocaleString(undefined, { maximumFractionDigits: 1 })} LY`;
}

/**
 * Format Light-Years or Parsecs for deep space / galactic scale.
 */
export function formatGalacticDistance(ly: number): string {
  if (ly < 1) {
    const au = ly * ASTRO_CONSTANTS.AU_PER_LIGHT_YEAR;
    return `${au.toLocaleString(undefined, { maximumFractionDigits: 0 })} AU`;
  }
  if (ly < 1000) {
    return `${ly.toFixed(1)} Light-Years`;
  }
  const kpc = ly / 3261.56;
  return `${ly.toLocaleString(undefined, { maximumFractionDigits: 0 })} LY (${kpc.toFixed(2)} kpc)`;
}

/**
 * Format orbital velocity with units.
 */
export function formatVelocity(velocityKps: number): string {
  return `${velocityKps.toFixed(2)} km/s (${(velocityKps * 3600).toLocaleString(undefined, { maximumFractionDigits: 0 })} km/h)`;
}

/**
 * Calculate light travel time for a given distance in km.
 */
export function formatLightTravelTime(distanceKm: number): string {
  const seconds = distanceKm / ASTRO_CONSTANTS.LIGHT_SPEED_KPS;
  if (seconds < 60) {
    return `${seconds.toFixed(1)} light-seconds`;
  }
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remSec = (seconds % 60).toFixed(0);
    return `${minutes}m ${remSec}s light-time`;
  }
  const hours = (seconds / 3600).toFixed(2);
  return `${hours} light-hours`;
}

/**
 * Convert AU to visual scene units for Enhanced Visibility mode.
 * Uses smooth logarithmic scaling ensuring inner terrestrial planets are
 * distinct and outer gas giants remain within navigable camera range.
 */
export function auToVisualDistance(au: number): number {
  if (au <= 0) return 0;
  // Physically-grounded progressive scaling:
  // Sun visual radius = 38.0 (outer corona reaches ~43.5)
  // Mercury at 0.387 AU (perihelion 0.307 AU) starts at ~88 units, leaving a generous 44.5-unit gap from Sun.
  // Preserves generous, distinct gaps between inner terrestrial planets
  // (eliminates cramped/overlapping rings) and expansive, realistic gaps for outer gas giants.
  // Mercury (0.387 AU) -> ~97.2
  // Venus (0.723 AU)   -> ~133.6 (Δ = 36.4)
  // Earth (1.000 AU)   -> ~162.0 (Δ = 28.4)
  // Mars (1.524 AU)    -> ~213.6 (Δ = 51.6)
  // Jupiter (5.204 AU) -> ~546.1 (Δ = 332.5)
  // Saturn (9.582 AU)  -> ~914.1 (Δ = 368.0)
  // Uranus (19.20 AU)  -> ~1687.7 (Δ = 773.6)
  // Neptune (30.05 AU) -> ~2532.0 (Δ = 844.3)
  // Pluto (39.48 AU)   -> ~3250.0 (Δ = 718.0)
  return 46 + au * 62 + Math.pow(au, 0.72) * 54;
}

/**
 * Convert km radius to visual scene radius for Enhanced Visibility mode.
 */
export function kmToVisualRadius(radiusKm: number, category: string): number {
  if (category === 'star') return 38.0;
  if (category === 'gas_giant') {
    return 7.8 + ((radiusKm - 58232) / (69911 - 58232 + 1)) * 1.4;
  }
  if (category === 'ice_giant') {
    return 4.2 + ((radiusKm - 24622) / (25362 - 24622 + 1)) * 0.2;
  }
  if (radiusKm <= 1200) return 0.75;
  if (radiusKm <= 2600) return 1.15;
  if (radiusKm <= 3500) return 1.55;
  if (radiusKm <= 6100) return 2.28;
  return 2.4;
}
