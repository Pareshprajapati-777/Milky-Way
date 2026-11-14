export interface AtmosphereComponent {
  gas: string;
  formula: string;
  percentage: number;
  color: string;
}

export interface MoonData {
  id: string;
  name: string;
  radiusKm: number;
  visualRadius: number;
  orbitDistanceKm: number;
  visualOrbitDistance: number;
  orbitPeriodDays: number;
  orbitSpeed: number;
  color: string;
  textureType: 'moon' | 'io' | 'europa' | 'ganymede' | 'titan' | 'triton' | 'rocky';
  description: string;
  temperatureC: string;
  gravity: string;
  tidallyLocked: boolean;
  specialFeature: string;
  missions: string[];
}

export interface CelestialBodyData {
  id: string;
  name: string;
  category: 'star' | 'terrestrial' | 'gas_giant' | 'ice_giant' | 'dwarf' | 'moon';
  tagline: string;
  accentColor: string;
  glowColor: string;

  // Real Physical Parameters
  radiusKm: number;
  massKg: string;
  massEarthRelative: number;
  gravityMps2: number;
  gravityEarthRelative: number;
  escapeVelocityKps: number;

  // Real Orbital Parameters
  distanceFromSunAU: number;
  distanceFromSunMillionKm: number;
  orbitalPeriodDays: number;
  orbitalPeriodYears: number;
  orbitalVelocityKps: number;
  eccentricity: number;
  inclinationDeg: number;
  axialTiltDeg: number;
  rotationPeriodHours: number;

  // Temperature Range
  temperature: {
    minC: number;
    avgC: number;
    maxC: number;
    minK: number;
    avgK: number;
    maxK: number;
  };

  // Atmosphere
  atmosphere: {
    hasAtmosphere: boolean;
    surfacePressureBar: number;
    composition: AtmosphereComponent[];
  };

  // 3D Scene Visualization Parameters (Optimized for Interactive Navigation)
  visualRadius: number;
  visualDistance: number;
  visualOrbitSpeed: number;
  visualRotationSpeed: number;
  color: string;
  roughness: number;
  metalness: number;
  hasRings?: boolean;
  ringsConfig?: {
    innerRadius: number;
    outerRadius: number;
    tiltAngle: number;
    textureColors: string[];
  };
  hasAtmosphereGlow?: boolean;
  atmosphereGlowColor?: string;
  atmosphereGlowSize?: number;

  // Moons
  moonsCount: number;
  moons: MoonData[];

  // Science & Lore
  geology: string;
  explorationHistory: {
    mission: string;
    agency: string;
    year: number;
    highlight: string;
  }[];
  trivia: string[];
  soundFrequencyHz: number;
  assets?: {
    videoClipUrl: string;
    posterStillUrl: string;
    transparentCutoutUrl: string;
  };
}

export interface MilkyWayData {
  name: string;
  type: string;
  diameterLy: number;
  thicknessLy: number;
  massSolarMasses: string;
  estimatedStarsCount: string;
  ageBillionYears: number;
  sunPosition: {
    arm: string;
    distanceFromCoreLy: number;
    distanceFromCoreKpc: number;
    heightAbovePlaneLy: number;
    galacticCoords: { l: string; b: string };
    orbitalSpeedKps: number;
    galacticYearMyr: number;
    position3D: [number, number, number];
  };
  core: {
    blackHoleName: string;
    blackHoleMassSolar: string;
    radiusSchwarzschildKm: string;
    description: string;
  };
  majorArms: {
    name: string;
    description: string;
    color: string;
  }[];
  overview: string;
  funFacts: string[];
}

export const MILKY_WAY_DATA: MilkyWayData = {
  name: "Milky Way Galaxy (Via Lactea)",
  type: "Barred Spiral Galaxy (SBbc)",
  diameterLy: 100000,
  thicknessLy: 1000,
  massSolarMasses: "1.5 × 10¹² M☉ (1.5 Trillion Suns)",
  estimatedStarsCount: "100 - 400 Billion Stars",
  ageBillionYears: 13.61,
  sunPosition: {
    arm: "Orion-Cygnus Arm (Local Spur)",
    distanceFromCoreLy: 26490,
    distanceFromCoreKpc: 8.12,
    heightAbovePlaneLy: 55,
    galacticCoords: { l: "0° (Center)", b: "0° (Plane)" },
    orbitalSpeedKps: 220, // ~828,000 km/h
    galacticYearMyr: 230,
    position3D: [16.4, 0.8, 29.4] // Scaled 3D position in Galaxy view
  },
  core: {
    blackHoleName: "Sagittarius A* (Sgr A*)",
    blackHoleMassSolar: "4.154 ± 0.014 Million M☉",
    radiusSchwarzschildKm: "12.3 Million km (0.08 AU)",
    description: "A supermassive, quiescent black hole surrounded by a relativistic accretion flow and a cluster of rapidly orbiting S-stars."
  },
  majorArms: [
    { name: "Scutum-Centaurus Arm", description: "One of the two major stellar spiral arms rich in old giant stars and stellar nurseries.", color: "#3B82F6" },
    { name: "Perseus Arm", description: "Major outer spiral arm hosting massive OB stellar associations.", color: "#8B5CF6" },
    { name: "Sagittarius Arm", description: "Dense gas and molecular cloud arm between the Sun and Galactic Core.", color: "#EC4899" },
    { name: "Norma-Outer Arm", description: "Outer boundary spiral structure tracing the distant galactic disk edge.", color: "#10B981" },
    { name: "Orion-Cygnus Spur (Home)", description: "The bridge spur hosting our Sun, Alpha Centauri, and the Pleiades.", color: "#F59E0B" }
  ],
  overview: "Our home galaxy is a gravitationally bound barred spiral system containing our Solar System, billions of exoplanets, stellar remnants, diffuse interstellar gas, and an extensive dark matter halo.",
  funFacts: [
    "The Milky Way travels through the cosmos toward the Andromeda Galaxy at 110 km/s (400,000 km/h).",
    "It takes the Solar System approximately 230 million years to complete one galactic orbit (one Cosmic Year).",
    "Over 90% of the Milky Way's total gravitational mass consists of invisible Dark Matter."
  ]
};

export const CELESTIAL_BODIES: Record<string, CelestialBodyData> = {
  sun: {
    id: 'sun',
    name: 'The Sun (Sol)',
    category: 'star',
    tagline: 'The G2V Yellow Dwarf star at the heart of our Solar System',
    accentColor: '#FFD60A',
    glowColor: '#FF9500',
    radiusKm: 696340,
    massKg: '1.989 × 10³⁰ kg',
    massEarthRelative: 333000,
    gravityMps2: 274.0,
    gravityEarthRelative: 27.94,
    escapeVelocityKps: 617.7,
    distanceFromSunAU: 0,
    distanceFromSunMillionKm: 0,
    orbitalPeriodDays: 0,
    orbitalPeriodYears: 0,
    orbitalVelocityKps: 0,
    eccentricity: 0,
    inclinationDeg: 0,
    axialTiltDeg: 7.25,
    rotationPeriodHours: 609.12, // 25.4 days at equator
    temperature: { minC: 5500, avgC: 5505, maxC: 15000000, minK: 5773, avgK: 5778, maxK: 15000273 },
    atmosphere: {
      hasAtmosphere: true,
      surfacePressureBar: 0.868,
      composition: [
        { gas: 'Hydrogen', formula: 'H₂', percentage: 73.46, color: '#38BDF8' },
        { gas: 'Helium', formula: 'He', percentage: 24.85, color: '#FCD34D' },
        { gas: 'Oxygen', formula: 'O', percentage: 0.77, color: '#4ADE80' },
        { gas: 'Carbon', formula: 'C', percentage: 0.29, color: '#C084FC' },
        { gas: 'Iron & Others', formula: 'Fe+', percentage: 0.63, color: '#FB7185' }
      ]
    },
    visualRadius: 38.0,
    visualDistance: 0,
    visualOrbitSpeed: 0,
    visualRotationSpeed: 0.005,
    color: '#FFD60A',
    roughness: 0.2,
    metalness: 0.1,
    hasAtmosphereGlow: true,
    atmosphereGlowColor: '#FF8800',
    atmosphereGlowSize: 2.2,
    moonsCount: 0,
    moons: [],
    geology: "Plasma dynamic body driven by thermonuclear fusion (p-p chain) in its core, surrounded by radiative and convective zones producing violent magnetic solar flares and coronal loops.",
    explorationHistory: [
      { mission: 'Parker Solar Probe', agency: 'NASA', year: 2018, highlight: 'Flew within 6.5 million km of the Sun, directly sampling coronal plasma.' },
      { mission: 'Solar Orbiter', agency: 'ESA/NASA', year: 2020, highlight: 'Captured closest images of solar campfires and polar magnetic fields.' },
      { mission: 'SOHO', agency: 'ESA/NASA', year: 1995, highlight: 'Continuous monitoring of space weather and discovery of over 4,000 comets.' }
    ],
    trivia: [
      "The Sun contains 99.86% of the entire mass of the Solar System.",
      "Every second, the Sun converts 600 million tons of hydrogen into helium, releasing 3.8 × 10²⁶ Joules of energy.",
      "Light takes approximately 8 minutes and 20 seconds to travel from the Sun to Earth."
    ],
    soundFrequencyHz: 126.22
  },

  mercury: {
    id: 'mercury',
    name: 'Mercury',
    category: 'terrestrial',
    tagline: 'The innermost, swift and intensely cratered world',
    accentColor: '#94A3B8',
    glowColor: '#CBD5E1',
    radiusKm: 2439.7,
    massKg: '3.301 × 10²³ kg',
    massEarthRelative: 0.055,
    gravityMps2: 3.7,
    gravityEarthRelative: 0.38,
    escapeVelocityKps: 4.25,
    distanceFromSunAU: 0.387,
    distanceFromSunMillionKm: 57.91,
    orbitalPeriodDays: 87.97,
    orbitalPeriodYears: 0.24,
    orbitalVelocityKps: 47.36,
    eccentricity: 0.2056,
    inclinationDeg: 7.00,
    axialTiltDeg: 0.034,
    rotationPeriodHours: 1407.6, // 58.65 days
    temperature: { minC: -180, avgC: 167, maxC: 430, minK: 93, avgK: 440, maxK: 703 },
    atmosphere: {
      hasAtmosphere: true,
      surfacePressureBar: 1e-15,
      composition: [
        { gas: 'Oxygen', formula: 'O₂', percentage: 42.0, color: '#38BDF8' },
        { gas: 'Sodium', formula: 'Na', percentage: 29.0, color: '#FCD34D' },
        { gas: 'Hydrogen', formula: 'H₂', percentage: 22.0, color: '#4ADE80' },
        { gas: 'Helium', formula: 'He', percentage: 6.0, color: '#C084FC' },
        { gas: 'Potassium', formula: 'K', percentage: 0.5, color: '#FB7185' }
      ]
    },
    visualRadius: 1.15,
    visualDistance: 97,
    visualOrbitSpeed: 1.6,
    visualRotationSpeed: 0.008,
    color: '#9CA3AF',
    roughness: 0.9,
    metalness: 0.2,
    moonsCount: 0,
    moons: [],
    geology: "Dense metallic core occupying 85% of its planetary radius, covered by a thin silicate crust scored with lobate scarps (thrust faults formed as the planet cooled and shrank).",
    explorationHistory: [
      { mission: 'MESSENGER', agency: 'NASA', year: 2004, highlight: 'Orbited Mercury for 4 years; discovered water ice in permanently shadowed polar craters.' },
      { mission: 'BepiColombo', agency: 'ESA/JAXA', year: 2018, highlight: 'Dual-orbiter mission mapping surface composition and magnetic environment.' },
      { mission: 'Mariner 10', agency: 'NASA', year: 1973, highlight: 'First spacecraft to visit Mercury, capturing initial high-res images.' }
    ],
    trivia: [
      "Mercury has the greatest temperature swings in the Solar System, spanning 610°C between day and night.",
      "A day on Mercury (sunrise to sunrise) lasts 176 Earth days due to its 3:2 spin-orbit resonance.",
      "Despite being closest to the Sun, water ice exists inside dark craters at its north and south poles."
    ],
    soundFrequencyHz: 141.27
  },

  venus: {
    id: 'venus',
    name: 'Venus',
    category: 'terrestrial',
    tagline: 'The veiled volcanic planet with a runaway greenhouse furnace',
    accentColor: '#F59E0B',
    glowColor: '#FBBF24',
    radiusKm: 6051.8,
    massKg: '4.867 × 10²⁴ kg',
    massEarthRelative: 0.815,
    gravityMps2: 8.87,
    gravityEarthRelative: 0.904,
    escapeVelocityKps: 10.36,
    distanceFromSunAU: 0.723,
    distanceFromSunMillionKm: 108.2,
    orbitalPeriodDays: 224.7,
    orbitalPeriodYears: 0.615,
    orbitalVelocityKps: 35.02,
    eccentricity: 0.0067,
    inclinationDeg: 3.39,
    axialTiltDeg: 177.36, // Retrograde rotation
    rotationPeriodHours: 5832.5, // 243 days retrograde
    temperature: { minC: 438, avgC: 464, maxC: 482, minK: 711, avgK: 737, maxK: 755 },
    atmosphere: {
      hasAtmosphere: true,
      surfacePressureBar: 92.0,
      composition: [
        { gas: 'Carbon Dioxide', formula: 'CO₂', percentage: 96.5, color: '#F97316' },
        { gas: 'Nitrogen', formula: 'N₂', percentage: 3.5, color: '#38BDF8' },
        { gas: 'Sulfur Dioxide', formula: 'SO₂', percentage: 0.015, color: '#FACC15' },
        { gas: 'Water Vapor', formula: 'H₂O', percentage: 0.002, color: '#60A5FA' }
      ]
    },
    visualRadius: 2.28,
    visualDistance: 134,
    visualOrbitSpeed: 1.17,
    visualRotationSpeed: -0.004,
    color: '#EAB308',
    roughness: 0.7,
    metalness: 0.1,
    hasAtmosphereGlow: true,
    atmosphereGlowColor: '#FBBF24',
    atmosphereGlowSize: 1.15,
    moonsCount: 0,
    moons: [],
    geology: "Vast volcanic plains covering 80% of the surface, punctuated by shield volcanoes, pancake domes, and arachnoids beneath crushing supercritical CO₂ atmospheric pressure.",
    explorationHistory: [
      { mission: 'Magellan', agency: 'NASA', year: 1989, highlight: 'Synthetic aperture radar mapped 98% of Venusian surface at 100m resolution.' },
      { mission: 'Venera 13', agency: 'Soviet Union', year: 1981, highlight: 'Landed on surface and transmitted first color photographs and soil analysis.' },
      { mission: 'Akatsuki', agency: 'JAXA', year: 2010, highlight: 'Studied super-rotating atmospheric dynamics and equatorial jet streams.' }
    ],
    trivia: [
      "Venus rotates backwards (clockwise) compared to almost all other planets, so the Sun rises in the west.",
      "Its surface pressure is 92 times greater than Earth's—equivalent to being 900 meters under ocean water.",
      "Venus is the hottest planet in the Solar System, hotter even than Mercury, hot enough to melt lead."
    ],
    soundFrequencyHz: 221.23,
    assets: {
      videoClipUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_b211cd74-013b-4dd3-bfd0-64491d8696fa.mp4',
      posterStillUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_cf55d1d8-7b59-4a64-80da-d72052ae974e.png',
      transparentCutoutUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202012_640b239a-d08a-4200-adb2-741bbe129ac8.png'
    }
  },

  earth: {
    id: 'earth',
    name: 'Earth (Terra)',
    category: 'terrestrial',
    tagline: 'The vibrant blue oasis of life, liquid oceans, and dynamic atmosphere',
    accentColor: '#00F5D4',
    glowColor: '#38BDF8',
    radiusKm: 6371.0,
    massKg: '5.972 × 10²⁴ kg',
    massEarthRelative: 1.0,
    gravityMps2: 9.807,
    gravityEarthRelative: 1.0,
    escapeVelocityKps: 11.186,
    distanceFromSunAU: 1.000,
    distanceFromSunMillionKm: 149.6,
    orbitalPeriodDays: 365.256,
    orbitalPeriodYears: 1.000,
    orbitalVelocityKps: 29.78,
    eccentricity: 0.0167,
    inclinationDeg: 0.00,
    axialTiltDeg: 23.44,
    rotationPeriodHours: 23.934, // 23h 56m 4s
    temperature: { minC: -89.2, avgC: 15.0, maxC: 56.7, minK: 184, avgK: 288, maxK: 330 },
    atmosphere: {
      hasAtmosphere: true,
      surfacePressureBar: 1.013,
      composition: [
        { gas: 'Nitrogen', formula: 'N₂', percentage: 78.08, color: '#38BDF8' },
        { gas: 'Oxygen', formula: 'O₂', percentage: 20.95, color: '#4ADE80' },
        { gas: 'Argon', formula: 'Ar', percentage: 0.93, color: '#C084FC' },
        { gas: 'Carbon Dioxide', formula: 'CO₂', percentage: 0.042, color: '#FB923C' }
      ]
    },
    visualRadius: 2.40,
    visualDistance: 162,
    visualOrbitSpeed: 1.0,
    visualRotationSpeed: 0.015,
    color: '#2563EB',
    roughness: 0.4,
    metalness: 0.3,
    hasAtmosphereGlow: true,
    atmosphereGlowColor: '#00BAF2',
    atmosphereGlowSize: 1.18,
    moonsCount: 1,
    moons: [
      {
        id: 'luna',
        name: 'The Moon (Luna)',
        radiusKm: 1737.4,
        visualRadius: 0.65,
        orbitDistanceKm: 384400,
        visualOrbitDistance: 5.2,
        orbitPeriodDays: 27.32,
        orbitSpeed: 2.2,
        color: '#E2E8F0',
        textureType: 'moon',
        description: 'Earth’s only natural satellite, with dark volcanic maria, highland craters, and permanent tidal locking.',
        temperatureC: '-130°C to +120°C',
        gravity: '1.62 m/s² (0.166g)',
        tidallyLocked: true,
        specialFeature: 'Tidally locked to Earth, causing ocean tides and stabilizing Earth’s axial tilt.',
        missions: ['Apollo 11 (1969)', 'Artemis I (2022)', 'Chandrayaan-3 (2023)', 'Chang\'e 5 (2020)']
      }
    ],
    geology: "Dynamic active plate tectonics with continental and oceanic crusts, liquid water oceans covering 70.8% of the surface, protective magnetosphere generated by a liquid iron outer core dynamo.",
    explorationHistory: [
      { mission: 'Earth Observation Constellations', agency: 'NASA/ESA/ISRO', year: 1972, highlight: 'Over 50 years of continuous climate, ocean, and biosphere monitoring.' },
      { mission: 'ISS (International Space Station)', agency: 'International', year: 1998, highlight: 'Continuous human presence in low Earth orbit conducting microgravity science.' },
      { mission: 'Terra & Aqua Satellites', agency: 'NASA', year: 1999, highlight: 'Global monitoring of atmospheric aerosols, radiation budget, and carbon cycle.' }
    ],
    trivia: [
      "Earth is the only known celestial body in the universe confirmed to harbor life and surface liquid oceans.",
      "The planet’s magnetic field shields surface biology from lethal solar wind and cosmic radiation.",
      "Earth is not a perfect sphere; it bulges at the equator due to its rotational centrifugal force (oblate spheroid)."
    ],
    soundFrequencyHz: 194.18,
    assets: {
      videoClipUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_3ffb4889-c520-432d-8458-038009eb40df.mp4',
      posterStillUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_508c64b8-a31e-4290-bdfc-1187df70e0a6.png',
      transparentCutoutUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202005_3346cc4d-ec3b-44ab-825c-b18e49f5021a.png'
    }
  },

  mars: {
    id: 'mars',
    name: 'Mars',
    category: 'terrestrial',
    tagline: 'The rust-red frontier with towering volcanoes and ancient riverbeds',
    accentColor: '#EF4444',
    glowColor: '#F87171',
    radiusKm: 3389.5,
    massKg: '6.417 × 10²³ kg',
    massEarthRelative: 0.107,
    gravityMps2: 3.721,
    gravityEarthRelative: 0.379,
    escapeVelocityKps: 5.027,
    distanceFromSunAU: 1.524,
    distanceFromSunMillionKm: 227.9,
    orbitalPeriodDays: 686.98,
    orbitalPeriodYears: 1.881,
    orbitalVelocityKps: 24.07,
    eccentricity: 0.0934,
    inclinationDeg: 1.85,
    axialTiltDeg: 25.19,
    rotationPeriodHours: 24.623, // 24h 37m 22s (1 Sol)
    temperature: { minC: -140, avgC: -63, maxC: 20, minK: 133, avgK: 210, maxK: 293 },
    atmosphere: {
      hasAtmosphere: true,
      surfacePressureBar: 0.00636,
      composition: [
        { gas: 'Carbon Dioxide', formula: 'CO₂', percentage: 95.32, color: '#F97316' },
        { gas: 'Nitrogen', formula: 'N₂', percentage: 2.6, color: '#38BDF8' },
        { gas: 'Argon', formula: 'Ar', percentage: 1.9, color: '#C084FC' },
        { gas: 'Oxygen', formula: 'O₂', percentage: 0.13, color: '#4ADE80' }
      ]
    },
    visualRadius: 1.55,
    visualDistance: 214,
    visualOrbitSpeed: 0.81,
    visualRotationSpeed: 0.014,
    color: '#DC2626',
    roughness: 0.8,
    metalness: 0.2,
    hasAtmosphereGlow: true,
    atmosphereGlowColor: '#F87171',
    atmosphereGlowSize: 1.12,
    moonsCount: 2,
    moons: [
      {
        id: 'phobos',
        name: 'Phobos',
        radiusKm: 11.2,
        visualRadius: 0.28,
        orbitDistanceKm: 9376,
        visualOrbitDistance: 2.8,
        orbitPeriodDays: 0.32,
        orbitSpeed: 4.5,
        color: '#9CA3AF',
        textureType: 'rocky',
        description: 'Heavily grooved, potato-shaped moon spiraling inexorably closer to Mars.',
        temperatureC: '-40°C to -112°C',
        gravity: '0.0057 m/s²',
        tidallyLocked: true,
        specialFeature: 'Orbits faster than Mars rotates, rising in the west and setting in the east twice per Martian day.',
        missions: ['Mars Express (2004)', 'MRO (2006)']
      },
      {
        id: 'deimos',
        name: 'Deimos',
        radiusKm: 6.2,
        visualRadius: 0.22,
        orbitDistanceKm: 23463,
        visualOrbitDistance: 3.8,
        orbitPeriodDays: 1.26,
        orbitSpeed: 3.0,
        color: '#D1D5DB',
        textureType: 'rocky',
        description: 'Smooth outer Martian moon blanketed in a thick layer of regolith dust.',
        temperatureC: '-40°C to -120°C',
        gravity: '0.003 m/s²',
        tidallyLocked: true,
        specialFeature: 'One of the smallest known natural satellites in the Solar System.',
        missions: ['Hope Probe (2023)', 'Viking 2 (1977)']
      }
    ],
    geology: "Hosts Olympus Mons (the tallest volcano in the Solar System at 21.9 km) and Valles Marineris (a grand canyon spanning 4,000 km across), with iron oxide dust giving its iconic red appearance.",
    explorationHistory: [
      { mission: 'Perseverance Rover & Ingenuity', agency: 'NASA', year: 2020, highlight: 'Investigating Jezero crater for biosignatures and completed 72 powered flights.' },
      { mission: 'Curiosity Rover', agency: 'NASA', year: 2011, highlight: 'Confirmed ancient Gale Crater possessed a habitable freshwater lake environment.' },
      { mission: 'Tianwen-1 & Zhurong', agency: 'CNSA', year: 2020, highlight: 'Orbiter, lander, and rover mission exploring Utopia Planitia.' }
    ],
    trivia: [
      "Sunsets on Mars appear blue due to how fine dust particles scatter reddish light in the thin atmosphere.",
      "Mars has seasonal polar ice caps made of water ice and frozen carbon dioxide (dry ice).",
      "Mars has the largest dust storms in the Solar System, which can envelop the entire planet for months."
    ],
    soundFrequencyHz: 144.72,
    assets: {
      videoClipUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_51eae59a-2459-4c84-907c-cc5edfe5fea7.mp4',
      posterStillUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_0ba6de7c-285d-43dc-b7ab-8c54c73707cb.png',
      transparentCutoutUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202018_3d559490-f613-4ed7-a3bb-3b7e9fc90fb8.png'
    }
  },

  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    category: 'gas_giant',
    tagline: 'The reigning king of planets, giant storm systems, and miniature solar system of moons',
    accentColor: '#F97316',
    glowColor: '#FB923C',
    radiusKm: 69911,
    massKg: '1.898 × 10²⁷ kg',
    massEarthRelative: 317.8,
    gravityMps2: 24.79,
    gravityEarthRelative: 2.528,
    escapeVelocityKps: 59.5,
    distanceFromSunAU: 5.204,
    distanceFromSunMillionKm: 778.5,
    orbitalPeriodDays: 4332.59,
    orbitalPeriodYears: 11.862,
    orbitalVelocityKps: 13.07,
    eccentricity: 0.0484,
    inclinationDeg: 1.30,
    axialTiltDeg: 3.13,
    rotationPeriodHours: 9.925, // Fastest planetary rotation
    temperature: { minC: -160, avgC: -110, maxC: -80, minK: 113, avgK: 163, maxK: 193 },
    atmosphere: {
      hasAtmosphere: true,
      surfacePressureBar: 2.0, // at 1 bar level
      composition: [
        { gas: 'Hydrogen', formula: 'H₂', percentage: 89.8, color: '#38BDF8' },
        { gas: 'Helium', formula: 'He', percentage: 10.2, color: '#FCD34D' },
        { gas: 'Methane', formula: 'CH₄', percentage: 0.3, color: '#4ADE80' },
        { gas: 'Ammonia', formula: 'NH₃', percentage: 0.026, color: '#F472B6' }
      ]
    },
    visualRadius: 9.20,
    visualDistance: 546,
    visualOrbitSpeed: 0.43,
    visualRotationSpeed: 0.035,
    color: '#D97706',
    roughness: 0.6,
    metalness: 0.1,
    hasAtmosphereGlow: true,
    atmosphereGlowColor: '#FDBA74',
    atmosphereGlowSize: 1.08,
    moonsCount: 95,
    moons: [
      {
        id: 'io',
        name: 'Io',
        radiusKm: 1821.6,
        visualRadius: 0.72,
        orbitDistanceKm: 421700,
        visualOrbitDistance: 13.5,
        orbitPeriodDays: 1.77,
        orbitSpeed: 2.6,
        color: '#FACC15',
        textureType: 'io',
        description: 'Most volcanically active body in the Solar System, driven by tidal friction from Jupiter and Europa.',
        temperatureC: '-143°C (Plumes: 1300°C)',
        gravity: '1.79 m/s²',
        tidallyLocked: true,
        specialFeature: 'Over 400 active volcanoes spewing sulfur plumes hundreds of kilometers high.',
        missions: ['Galileo (1995)', 'Juno (2016)']
      },
      {
        id: 'europa',
        name: 'Europa',
        radiusKm: 1560.8,
        visualRadius: 0.65,
        orbitDistanceKm: 670900,
        visualOrbitDistance: 17.0,
        orbitPeriodDays: 3.55,
        orbitSpeed: 2.0,
        color: '#E0F2FE',
        textureType: 'europa',
        description: 'Smooth icy crust crisscrossed with reddish fracture lineae concealing a global liquid water ocean.',
        temperatureC: '-160°C to -220°C',
        gravity: '1.31 m/s²',
        tidallyLocked: true,
        specialFeature: 'Subsurface ocean contains more liquid water than all of Earth’s oceans combined.',
        missions: ['Europa Clipper (2024)', 'Galileo (1995)']
      },
      {
        id: 'ganymede',
        name: 'Ganymede',
        radiusKm: 2634.1,
        visualRadius: 0.95,
        orbitDistanceKm: 1070400,
        visualOrbitDistance: 22.0,
        orbitPeriodDays: 7.15,
        orbitSpeed: 1.6,
        color: '#94A3B8',
        textureType: 'ganymede',
        description: 'The largest moon in the Solar System (bigger than planet Mercury) with its own internal magnetic field.',
        temperatureC: '-113°C to -183°C',
        gravity: '1.42 m/s²',
        tidallyLocked: true,
        specialFeature: 'Only known moon in the universe with its own self-generated magnetosphere.',
        missions: ['JUICE (2023)', 'Voyager 1 & 2 (1979)']
      },
      {
        id: 'callisto',
        name: 'Callisto',
        radiusKm: 2410.3,
        visualRadius: 0.88,
        orbitDistanceKm: 1882700,
        visualOrbitDistance: 27.5,
        orbitPeriodDays: 16.69,
        orbitSpeed: 1.2,
        color: '#64748B',
        textureType: 'rocky',
        description: 'Most heavily cratered object in the Solar System, preserving an ancient 4-billion-year-old surface.',
        temperatureC: '-139°C to -193°C',
        gravity: '1.23 m/s²',
        tidallyLocked: true,
        specialFeature: 'Features the massive Valhalla multi-ring impact basin spanning 3,800 km.',
        missions: ['Galileo (1995)', 'Pioneer 10 & 11 (1973)']
      }
    ],
    geology: "Gas giant with no solid surface. Atmospheric pressure transitions smoothly from gaseous hydrogen/helium to liquid metallic hydrogen at 20,000 km depth, surrounding a dense rock/ice core.",
    explorationHistory: [
      { mission: 'Juno', agency: 'NASA', year: 2011, highlight: 'Probed deep atmospheric ammonia abundance, auroras, and magnetic dynamo.' },
      { mission: 'Galileo Orbiter & Probe', agency: 'NASA', year: 1989, highlight: 'Deployed first atmospheric entry probe and discovered oceans beneath icy moons.' },
      { mission: 'JUICE (JUpiter ICy moons Explorer)', agency: 'ESA', year: 2023, highlight: 'En route to perform detailed studies of Ganymede, Europa, and Callisto.' }
    ],
    trivia: [
      "The Great Red Spot is an anticyclonic storm larger than Earth that has raged for over 350 years.",
      "Jupiter acts as a gravitational shield for the inner planets, deflecting or capturing many incoming comets.",
      "Jupiter’s magnetic field is 20,000 times stronger than Earth’s, creating colossal auroral storms at its poles."
    ],
    soundFrequencyHz: 183.58
  },

  saturn: {
    id: 'saturn',
    name: 'Saturn',
    category: 'gas_giant',
    tagline: 'The magnificent jewel of the Solar System with colossal icy rings',
    accentColor: '#EAB308',
    glowColor: '#FDE047',
    radiusKm: 58232,
    massKg: '5.683 × 10²⁶ kg',
    massEarthRelative: 95.16,
    gravityMps2: 10.44,
    gravityEarthRelative: 1.065,
    escapeVelocityKps: 35.5,
    distanceFromSunAU: 9.582,
    distanceFromSunMillionKm: 1433.5,
    orbitalPeriodDays: 10759.22,
    orbitalPeriodYears: 29.457,
    orbitalVelocityKps: 9.69,
    eccentricity: 0.0542,
    inclinationDeg: 2.49,
    axialTiltDeg: 26.73,
    rotationPeriodHours: 10.656,
    temperature: { minC: -178, avgC: -140, maxC: -130, minK: 95, avgK: 133, maxK: 143 },
    atmosphere: {
      hasAtmosphere: true,
      surfacePressureBar: 1.4,
      composition: [
        { gas: 'Hydrogen', formula: 'H₂', percentage: 96.3, color: '#38BDF8' },
        { gas: 'Helium', formula: 'He', percentage: 3.25, color: '#FCD34D' },
        { gas: 'Methane', formula: 'CH₄', percentage: 0.45, color: '#4ADE80' },
        { gas: 'Ammonia', formula: 'NH₃', percentage: 0.01, color: '#F472B6' }
      ]
    },
    visualRadius: 7.80,
    visualDistance: 914,
    visualOrbitSpeed: 0.32,
    visualRotationSpeed: 0.032,
    color: '#CA8A04',
    roughness: 0.5,
    metalness: 0.1,
    hasRings: true,
    ringsConfig: {
      innerRadius: 9.6,
      outerRadius: 17.3,
      tiltAngle: 26.73,
      textureColors: ['#E4D4B2', '#D0BF98', '#BCA97E', '#A89467']
    },
    hasAtmosphereGlow: true,
    atmosphereGlowColor: '#FEF08A',
    atmosphereGlowSize: 1.08,
    moonsCount: 146,
    moons: [
      {
        id: 'titan',
        name: 'Titan',
        radiusKm: 2574.7,
        visualRadius: 0.92,
        orbitDistanceKm: 1221870,
        visualOrbitDistance: 26.0,
        orbitPeriodDays: 15.95,
        orbitSpeed: 1.8,
        color: '#F59E0B',
        textureType: 'titan',
        description: 'Only moon with a dense atmosphere and liquid hydrocarbon lakes (methane/ethane) on its surface.',
        temperatureC: '-179°C (94 K)',
        gravity: '1.35 m/s²',
        tidallyLocked: true,
        specialFeature: 'Possesses a complete hydrological cycle of evaporating, raining, and flowing liquid methane.',
        missions: ['Cassini-Huygens (1997-2017)', 'Dragonfly (planned 2028)']
      },
      {
        id: 'enceladus',
        name: 'Enceladus',
        radiusKm: 252.1,
        visualRadius: 0.42,
        orbitDistanceKm: 238000,
        visualOrbitDistance: 19.5,
        orbitPeriodDays: 1.37,
        orbitSpeed: 3.2,
        color: '#F8FAFC',
        textureType: 'europa',
        description: 'Ultra-reflective icy moon with active cryovolcanic geysers erupting from south polar tiger stripe fractures.',
        temperatureC: '-198°C to -201°C',
        gravity: '0.113 m/s²',
        tidallyLocked: true,
        specialFeature: 'Geysers spray organic molecules, salts, and water into space, feeding Saturn’s E-ring.',
        missions: ['Cassini (2005-2017)']
      },
      {
        id: 'mimas',
        name: 'Mimas',
        radiusKm: 198.2,
        visualRadius: 0.35,
        orbitDistanceKm: 185520,
        visualOrbitDistance: 18.2,
        orbitPeriodDays: 0.94,
        orbitSpeed: 3.8,
        color: '#E2E8F0',
        textureType: 'rocky',
        description: 'Small icy moon dominated by the colossal 130 km wide Herschel impact crater (looks like the Death Star).',
        temperatureC: '-209°C',
        gravity: '0.064 m/s²',
        tidallyLocked: true,
        specialFeature: 'Recent orbital wobbles indicate a young hidden liquid ocean 20-30 km beneath its crust.',
        missions: ['Cassini (2004-2017)']
      }
    ],
    geology: "Lowest density planet in the Solar System (0.687 g/cm³ - less dense than water). Famous for its North Polar Hexagon (a persistent geometric jet stream storm).",
    explorationHistory: [
      { mission: 'Cassini-Huygens', agency: 'NASA/ESA/ASI', year: 1997, highlight: 'Orbited Saturn for 13 years; landed the Huygens probe on Titan and discovered Enceladus ocean geysers.' },
      { mission: 'Voyager 1 & 2', agency: 'NASA', year: 1980, highlight: 'Revealed intricate ringlet structures, spoke phenomena, and complex moon systems.' },
      { mission: 'Pioneer 11', agency: 'NASA', year: 1979, highlight: 'Discovered Saturn’s narrow F-ring and measured upper magnetosphere.' }
    ],
    trivia: [
      "Saturn is the only planet light enough that it would float in a gigantic cosmic bathtub of water.",
      "The rings span 282,000 km wide but are extraordinarily thin—in most places only 10 to 30 meters thick!",
      "A permanent geometric hexagon-shaped cloud pattern rotates at Saturn’s north pole."
    ],
    soundFrequencyHz: 147.85
  },

  uranus: {
    id: 'uranus',
    name: 'Uranus',
    category: 'ice_giant',
    tagline: 'The mysterious tilted ice giant rolling on its side around the Sun',
    accentColor: '#06B6D4',
    glowColor: '#22D3EE',
    radiusKm: 25362,
    massKg: '8.681 × 10²⁵ kg',
    massEarthRelative: 14.54,
    gravityMps2: 8.69,
    gravityEarthRelative: 0.886,
    escapeVelocityKps: 21.3,
    distanceFromSunAU: 19.201,
    distanceFromSunMillionKm: 2872.5,
    orbitalPeriodDays: 30685.4,
    orbitalPeriodYears: 84.02,
    orbitalVelocityKps: 6.81,
    eccentricity: 0.0457,
    inclinationDeg: 0.77,
    axialTiltDeg: 97.77, // Rotates on its side!
    rotationPeriodHours: -17.24, // Retrograde
    temperature: { minC: -224, avgC: -195, maxC: -190, minK: 49, avgK: 78, maxK: 83 },
    atmosphere: {
      hasAtmosphere: true,
      surfacePressureBar: 1.2,
      composition: [
        { gas: 'Hydrogen', formula: 'H₂', percentage: 82.5, color: '#38BDF8' },
        { gas: 'Helium', formula: 'He', percentage: 15.2, color: '#FCD34D' },
        { gas: 'Methane', formula: 'CH₄', percentage: 2.3, color: '#22D3EE' }
      ]
    },
    visualRadius: 4.40,
    visualDistance: 1688,
    visualOrbitSpeed: 0.22,
    visualRotationSpeed: -0.02,
    color: '#06B6D4',
    roughness: 0.6,
    metalness: 0.1,
    hasRings: true,
    ringsConfig: {
      innerRadius: 5.6,
      outerRadius: 7.5,
      tiltAngle: 97.77,
      textureColors: ['#0E7490', '#155E75', '#164E63']
    },
    hasAtmosphereGlow: true,
    atmosphereGlowColor: '#67E8F9',
    atmosphereGlowSize: 1.1,
    moonsCount: 28,
    moons: [
      {
        id: 'titania',
        name: 'Titania',
        radiusKm: 788.4,
        visualRadius: 0.60,
        orbitDistanceKm: 435910,
        visualOrbitDistance: 10.5,
        orbitPeriodDays: 8.71,
        orbitSpeed: 1.5,
        color: '#CBD5E1',
        textureType: 'rocky',
        description: 'Largest moon of Uranus, scored with colossal fault canyons and impact scarps.',
        temperatureC: '-203°C to -213°C',
        gravity: '0.367 m/s²',
        tidallyLocked: true,
        specialFeature: 'Deep rift valleys stretch over 1,500 km across its surface.',
        missions: ['Voyager 2 (1986)']
      },
      {
        id: 'miranda',
        name: 'Miranda',
        radiusKm: 235.8,
        visualRadius: 0.35,
        orbitDistanceKm: 129390,
        visualOrbitDistance: 8.5,
        orbitPeriodDays: 1.41,
        orbitSpeed: 2.4,
        color: '#E2E8F0',
        textureType: 'rocky',
        description: 'Extreme patchwork terrain with the steepest cliff in the Solar System (Verona Rupes, 20 km high).',
        temperatureC: '-213°C',
        gravity: '0.079 m/s²',
        tidallyLocked: true,
        specialFeature: 'A human jumping off Verona Rupes would take 12 minutes to fall to the bottom.',
        missions: ['Voyager 2 (1986)']
      }
    ],
    geology: "Ice giant composed predominantly of supercritical 'hot, dense ice' (water, methane, ammonia) over a small rocky core. Exhibits the lowest internal thermal heat flux of all giants.",
    explorationHistory: [
      { mission: 'Voyager 2', agency: 'NASA', year: 1986, highlight: 'Only probe to visit Uranus, discovering 10 new moons, 2 rings, and measuring its tilted magnetic axis.' }
    ],
    trivia: [
      "Uranus rotates sideways with an axial tilt of 97.8°, meaning its poles point almost directly at the Sun.",
      "Each pole gets 42 years of continuous sunlight followed by 42 years of complete darkness.",
      "It holds the record for the coldest recorded atmospheric temperature of any Solar System planet (−224.2°C)."
    ],
    soundFrequencyHz: 207.36
  },

  neptune: {
    id: 'neptune',
    name: 'Neptune',
    category: 'ice_giant',
    tagline: 'The deep sapphire realm of supersonic storms and cryovolcanic moons',
    accentColor: '#3B82F6',
    glowColor: '#60A5FA',
    radiusKm: 24622,
    massKg: '1.024 × 10²⁶ kg',
    massEarthRelative: 17.15,
    gravityMps2: 11.15,
    gravityEarthRelative: 1.14,
    escapeVelocityKps: 23.5,
    distanceFromSunAU: 30.047,
    distanceFromSunMillionKm: 4495.1,
    orbitalPeriodDays: 60189.0,
    orbitalPeriodYears: 164.8,
    orbitalVelocityKps: 5.43,
    eccentricity: 0.0086,
    inclinationDeg: 1.77,
    axialTiltDeg: 28.32,
    rotationPeriodHours: 16.11,
    temperature: { minC: -218, avgC: -201, maxC: -195, minK: 55, avgK: 72, maxK: 78 },
    atmosphere: {
      hasAtmosphere: true,
      surfacePressureBar: 1.5,
      composition: [
        { gas: 'Hydrogen', formula: 'H₂', percentage: 80.0, color: '#38BDF8' },
        { gas: 'Helium', formula: 'He', percentage: 19.0, color: '#FCD34D' },
        { gas: 'Methane', formula: 'CH₄', percentage: 1.5, color: '#2563EB' }
      ]
    },
    visualRadius: 4.20,
    visualDistance: 2532,
    visualOrbitSpeed: 0.17,
    visualRotationSpeed: 0.022,
    color: '#2563EB',
    roughness: 0.5,
    metalness: 0.1,
    hasAtmosphereGlow: true,
    atmosphereGlowColor: '#3B82F6',
    atmosphereGlowSize: 1.12,
    moonsCount: 16,
    moons: [
      {
        id: 'triton',
        name: 'Triton',
        radiusKm: 1353.4,
        visualRadius: 0.68,
        orbitDistanceKm: 354760,
        visualOrbitDistance: 9.5,
        orbitPeriodDays: -5.88, // Retrograde orbit
        orbitSpeed: 1.9,
        color: '#BAE6FD',
        textureType: 'triton',
        description: 'Captured Kuiper Belt dwarf planet with active nitrogen geysers and cantaloupe terrain.',
        temperatureC: '-235°C (38 K)',
        gravity: '0.779 m/s²',
        tidallyLocked: true,
        specialFeature: 'Orbits backwards in a retrograde direction; will eventually be torn into rings by Neptune.',
        missions: ['Voyager 2 (1989)']
      }
    ],
    geology: "Vibrant blue coloration caused by atmospheric methane absorbing red light. Possesses an intense internal heat source driving the fastest atmospheric winds in the Solar System.",
    explorationHistory: [
      { mission: 'Voyager 2', agency: 'NASA', year: 1989, highlight: 'Discovered the Great Dark Spot, 6 new moons, 4 rings, and erupting nitrogen geysers on Triton.' }
    ],
    trivia: [
      "Neptune’s supersonic winds reach speeds of 2,100 km/h (1,300 mph)—faster than the speed of sound on Earth.",
      "Neptune was the first planet located through mathematical predictions rather than empirical observation.",
      "It completed its first full orbit around the Sun since its discovery in 1846 only in the year 2011!"
    ],
    soundFrequencyHz: 211.44
  },

  pluto: {
    id: 'pluto',
    name: 'Pluto',
    category: 'dwarf',
    tagline: 'The beloved heart-shaped dwarf planet of the Kuiper Belt',
    accentColor: '#F43F5E',
    glowColor: '#FB7185',
    radiusKm: 1188.3,
    massKg: '1.303 × 10²² kg',
    massEarthRelative: 0.0022,
    gravityMps2: 0.62,
    gravityEarthRelative: 0.063,
    escapeVelocityKps: 1.21,
    distanceFromSunAU: 39.482,
    distanceFromSunMillionKm: 5906.4,
    orbitalPeriodDays: 90560.0,
    orbitalPeriodYears: 248.0,
    orbitalVelocityKps: 4.74,
    eccentricity: 0.2488,
    inclinationDeg: 17.16,
    axialTiltDeg: 122.53,
    rotationPeriodHours: -153.3, // 6.39 days retrograde
    temperature: { minC: -240, avgC: -229, maxC: -218, minK: 33, avgK: 44, maxK: 55 },
    atmosphere: {
      hasAtmosphere: true,
      surfacePressureBar: 1e-5,
      composition: [
        { gas: 'Nitrogen', formula: 'N₂', percentage: 99.0, color: '#38BDF8' },
        { gas: 'Methane', formula: 'CH₄', percentage: 0.5, color: '#4ADE80' },
        { gas: 'Carbon Monoxide', formula: 'CO', percentage: 0.5, color: '#FB923C' }
      ]
    },
    visualRadius: 0.75,
    visualDistance: 3250,
    visualOrbitSpeed: 0.12,
    visualRotationSpeed: 0.006,
    color: '#E2E8F0',
    roughness: 0.8,
    metalness: 0.1,
    moonsCount: 5,
    moons: [
      {
        id: 'charon',
        name: 'Charon',
        radiusKm: 606.0,
        visualRadius: 0.38,
        orbitDistanceKm: 19570,
        visualOrbitDistance: 2.5,
        orbitPeriodDays: 6.39,
        orbitSpeed: 1.8,
        color: '#94A3B8',
        textureType: 'rocky',
        description: 'Mutually tidally locked binary companion to Pluto with a red tholin-rich north pole (Mordor Macula).',
        temperatureC: '-220°C',
        gravity: '0.288 m/s²',
        tidallyLocked: true,
        specialFeature: 'Center of mass lies outside Pluto, making Pluto-Charon a true double dwarf planet system.',
        missions: ['New Horizons (2015)']
      }
    ],
    geology: "Dominated by Sputnik Planitia (a 1,000 km wide heart-shaped glacier of nitrogen and carbon monoxide ice) and water-ice mountains rising 3,500 meters high.",
    explorationHistory: [
      { mission: 'New Horizons', agency: 'NASA', year: 2006, highlight: 'Historic flyby in July 2015 revealed active cryogenic convection, floating nitrogen glaciers, and blue haze.' }
    ],
    trivia: [
      "Pluto’s orbit is so eccentric that for 20 years of its 248-year orbit (1979 to 1999), it was closer to the Sun than Neptune.",
      "Pluto and its largest moon Charon are mutually tidally locked—they always show the exact same face to each other.",
      "Pluto has a nitrogen atmospheric haze layer that glows pale blue in backscattered sunlight."
    ],
    soundFrequencyHz: 140.25
  }
};

export const CELESTIAL_ORDER = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto'
];
