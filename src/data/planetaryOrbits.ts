/**
 * ============================================================================
 * CENTRALIZED PLANETARY ORBITAL ELEMENTS (AUTHORITATIVE DATASET)
 * ============================================================================
 * Scientific references:
 * - NASA JPL Horizons System (J2000.0 epoch: JD 2451545.0, Jan 1 2000 12:00 TT)
 * - Standish, E. M. (1992) Keplerian Elements for Approximate Positions of Major Planets
 * - IAU Working Group on Cartographic Coordinates and Rotational Elements
 *
 * Coordinates:
 * - Origin: Sun center (0, 0, 0)
 * - Fundamental plane: J2000 Ecliptic plane (X-Z in Three.js, +Y is North Ecliptic Pole)
 * - Primary reference direction: J2000 Vernal Equinox (+X axis)
 * ============================================================================
 */

export interface PlanetaryOrbitalElements {
  id: string;
  name: string;
  category: 'terrestrial' | 'gas_giant' | 'ice_giant' | 'dwarf';
  semiMajorAxisAU: number;             // a (Astronomical Units)
  eccentricity: number;                // e (Dimensionless)
  orbitalPeriodDays: number;           // T (Earth mean solar days)
  inclinationDeg: number;              // i (Degrees relative to ecliptic)
  longitudeAscendingNodeDeg: number;   // Ω (Degrees from vernal equinox)
  argumentOfPeriapsisDeg: number;       // ω = ϖ - Ω (Degrees along orbital plane)
  meanLongitudeDeg: number;             // L = ϖ + M at J2000 epoch (Degrees)
  // Physical parameters
  radiusKm: number;
  massKg: number;
  rotationPeriodHours: number;
  axialTiltDeg: number;
  // Visual presentation
  visualRadius: number;
  accentColor: string;
  perihelionAU: number;
  aphelionAU: number;
}

export const CENTRAL_PLANETARY_DATA: Record<string, PlanetaryOrbitalElements> = {
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    category: 'terrestrial',
    semiMajorAxisAU: 0.387098,
    eccentricity: 0.205630,
    orbitalPeriodDays: 87.969,
    inclinationDeg: 7.005,
    longitudeAscendingNodeDeg: 48.331,
    argumentOfPeriapsisDeg: 29.124,
    meanLongitudeDeg: 252.251,
    radiusKm: 2439.7,
    massKg: 3.3011e23,
    rotationPeriodHours: 1407.6,
    axialTiltDeg: 0.034,
    visualRadius: 1.15,
    accentColor: '#94A3B8',
    perihelionAU: 0.307498,
    aphelionAU: 0.466698
  },

  venus: {
    id: 'venus',
    name: 'Venus',
    category: 'terrestrial',
    semiMajorAxisAU: 0.723336,
    eccentricity: 0.006772,
    orbitalPeriodDays: 224.701,
    inclinationDeg: 3.3947,
    longitudeAscendingNodeDeg: 76.680,
    argumentOfPeriapsisDeg: 54.884,
    meanLongitudeDeg: 181.979,
    radiusKm: 6051.8,
    massKg: 4.8675e24,
    rotationPeriodHours: -5832.5, // Retrograde
    axialTiltDeg: 177.36,
    visualRadius: 2.28,
    accentColor: '#F59E0B',
    perihelionAU: 0.718437,
    aphelionAU: 0.728235
  },

  earth: {
    id: 'earth',
    name: 'Earth',
    category: 'terrestrial',
    semiMajorAxisAU: 1.000000,
    eccentricity: 0.0167086,
    orbitalPeriodDays: 365.256,
    inclinationDeg: 0.000,
    longitudeAscendingNodeDeg: 0.000,
    argumentOfPeriapsisDeg: 102.937,
    meanLongitudeDeg: 100.464,
    radiusKm: 6371.0,
    massKg: 5.9722e24,
    rotationPeriodHours: 23.934,
    axialTiltDeg: 23.44,
    visualRadius: 2.40,
    accentColor: '#00F5D4',
    perihelionAU: 0.983291,
    aphelionAU: 1.016709
  },

  mars: {
    id: 'mars',
    name: 'Mars',
    category: 'terrestrial',
    semiMajorAxisAU: 1.523679,
    eccentricity: 0.093400,
    orbitalPeriodDays: 686.980,
    inclinationDeg: 1.850,
    longitudeAscendingNodeDeg: 49.558,
    argumentOfPeriapsisDeg: 286.502,
    meanLongitudeDeg: 355.453,
    radiusKm: 3389.5,
    massKg: 6.4171e23,
    rotationPeriodHours: 24.623,
    axialTiltDeg: 25.19,
    visualRadius: 1.55,
    accentColor: '#EF4444',
    perihelionAU: 1.381367,
    aphelionAU: 1.665991
  },

  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    category: 'gas_giant',
    semiMajorAxisAU: 5.202600,
    eccentricity: 0.048490,
    orbitalPeriodDays: 4332.589,
    inclinationDeg: 1.303,
    longitudeAscendingNodeDeg: 100.464,
    argumentOfPeriapsisDeg: 273.867,
    meanLongitudeDeg: 34.351,
    radiusKm: 69911.0,
    massKg: 1.8982e27,
    rotationPeriodHours: 9.925,
    axialTiltDeg: 3.13,
    visualRadius: 9.20,
    accentColor: '#F97316',
    perihelionAU: 4.950330,
    aphelionAU: 5.454870
  },

  saturn: {
    id: 'saturn',
    name: 'Saturn',
    category: 'gas_giant',
    semiMajorAxisAU: 9.554900,
    eccentricity: 0.055510,
    orbitalPeriodDays: 10759.22,
    inclinationDeg: 2.485,
    longitudeAscendingNodeDeg: 113.665,
    argumentOfPeriapsisDeg: 339.392,
    meanLongitudeDeg: 50.077,
    radiusKm: 58232.0,
    massKg: 5.6834e26,
    rotationPeriodHours: 10.656,
    axialTiltDeg: 26.73,
    visualRadius: 7.80,
    accentColor: '#EAB308',
    perihelionAU: 9.024560,
    aphelionAU: 10.085240
  },

  uranus: {
    id: 'uranus',
    name: 'Uranus',
    category: 'ice_giant',
    semiMajorAxisAU: 19.21840,
    eccentricity: 0.046300,
    orbitalPeriodDays: 30688.5,
    inclinationDeg: 0.773,
    longitudeAscendingNodeDeg: 74.006,
    argumentOfPeriapsisDeg: 96.999,
    meanLongitudeDeg: 314.055,
    radiusKm: 25362.0,
    massKg: 8.6810e25,
    rotationPeriodHours: -17.24, // Retrograde
    axialTiltDeg: 97.77,
    visualRadius: 4.40,
    accentColor: '#06B6D4',
    perihelionAU: 18.328590,
    aphelionAU: 20.108210
  },

  neptune: {
    id: 'neptune',
    name: 'Neptune',
    category: 'ice_giant',
    semiMajorAxisAU: 30.11040,
    eccentricity: 0.008590,
    orbitalPeriodDays: 60182.0,
    inclinationDeg: 1.770,
    longitudeAscendingNodeDeg: 131.784,
    argumentOfPeriapsisDeg: 273.187,
    meanLongitudeDeg: 304.349,
    radiusKm: 24622.0,
    massKg: 1.0241e26,
    rotationPeriodHours: 16.11,
    axialTiltDeg: 28.32,
    visualRadius: 4.20,
    accentColor: '#3B82F6',
    perihelionAU: 29.851750,
    aphelionAU: 30.369050
  },

  pluto: {
    id: 'pluto',
    name: 'Pluto',
    category: 'dwarf',
    semiMajorAxisAU: 39.48200,
    eccentricity: 0.248800,
    orbitalPeriodDays: 90560.0,
    inclinationDeg: 17.160,
    longitudeAscendingNodeDeg: 110.303,
    argumentOfPeriapsisDeg: 113.763,
    meanLongitudeDeg: 238.929,
    radiusKm: 1188.3,
    massKg: 1.303e22,
    rotationPeriodHours: -153.3, // Retrograde
    axialTiltDeg: 122.53,
    visualRadius: 0.75,
    accentColor: '#F43F5E',
    perihelionAU: 29.658880,
    aphelionAU: 49.305120
  }
};

/**
 * Standard Solar Gravitational Parameter:
 * μ_sun = G * M_sun = 1.32712440018e11 km³/s²
 */
export const MU_SUN_KM3_S2 = 1.32712440018e11;

/**
 * Astronomical Unit in kilometers (IAU 2012 exact definition)
 */
export const KM_PER_AU = 149597870.7;

/**
 * Ordered list of planet IDs from innermost to outermost.
 */
export const PLANETARY_ORDER = [
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto'
] as const;
