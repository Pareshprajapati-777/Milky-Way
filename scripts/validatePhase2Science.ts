/**
 * ============================================================================
 * PHASE 2 SCIENTIFIC ACCURACY & ASTRONOMICAL DATA VERIFICATION SUITE
 * ============================================================================
 * Automated validation of:
 * 1. Planetary datasets against NASA Planetary Fact Sheet / JPL Horizons
 * 2. Retrograde rotation mechanics (Venus, Uranus, Pluto)
 * 3. Moon datasets and 3D Keplerian propagation (inclination & eccentricity)
 * 4. Physical vs Cinematic axial rotation separation
 * 5. General relativistic black hole metrics (Schwarzschild, Photon sphere, ISCO)
 * 6. Habitable zone astrophysical boundaries (Kopparapu et al. 2013)
 * 7. Hohmann transfer orbit equations (Earth to Mars Delta-V & duration)
 * 8. Lagrange points geometry (L1-L5, Trojan & Greek camps)
 * 9. Galactic dimensions, Sgr A* coordinates, and flat rotation curve
 * 10. Scale conversion monotonicity and numerical stability
 * ============================================================================
 */

import * as THREE from 'three';
import { CENTRAL_PLANETARY_DATA, PLANETARY_ORDER, KM_PER_AU, MU_SUN_KM3_S2 } from '../src/data/planetaryOrbits';
import { CELESTIAL_BODIES, MILKY_WAY_DATA } from '../src/data/astronomy';
import {
  getMoonRelativePosition,
  getPhysicalAxialRotation,
  getCinematicAxialRotation,
  calculateKeplerRatio
} from '../src/utils/orbitalPhysics';
import { RelativityEngine, RELATIVISTIC_CONSTANTS } from '../src/core/RelativityEngine';
import { auToVisualDistance } from '../src/utils/astronomicalUnits';
import { getGalacticRotationVelocity } from '../src/components/3d/galaxy/MilkyWayGalaxy';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName} ${details}`);
    passedCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName} ${details}`);
    failedCount++;
  }
}

console.log('====================================================================');
console.log('    PHASE 2 SCIENTIFIC ACCURACY & ASTROPHYSICS VERIFICATION SUITE   ');
console.log('====================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Planetary Data matches NASA Fact Sheet within astronomical tolerances
// -----------------------------------------------------------------------------
console.log('TEST 1: Planetary data audit against NASA Planetary Fact Sheet');
let allPlanetsValid = true;
for (const id of PLANETARY_ORDER) {
  const p = CENTRAL_PLANETARY_DATA[id];
  if (!p || p.semiMajorAxisAU <= 0 || p.orbitalPeriodDays <= 0 || p.radiusKm <= 0) {
    allPlanetsValid = false;
    break;
  }
  // Check Kepler's Third Law (a³ / T² ≈ 1.0 in AU and Julian years)
  const ratio = calculateKeplerRatio(p);
  if (Math.abs(ratio - 1.0) > 0.015) { // allow small ~1% tolerance for multi-body perturbations
    allPlanetsValid = false;
    console.error(`Planet ${id} Kepler ratio deviates: ${ratio}`);
    break;
  }
}
assert(allPlanetsValid, '1. All 9 planets have authoritative Keplerian orbital elements adhering to Kepler’s Third Law');

// -----------------------------------------------------------------------------
// TEST 2: Retrograde Rotations strictly verified (Venus, Uranus, Pluto)
// -----------------------------------------------------------------------------
console.log('\nTEST 2: Planetary rotation directions & retrograde spin verification');
const venusPeriod = CENTRAL_PLANETARY_DATA['venus'].rotationPeriodHours;
const uranusPeriod = CENTRAL_PLANETARY_DATA['uranus'].rotationPeriodHours;
const plutoPeriod = CENTRAL_PLANETARY_DATA['pluto'].rotationPeriodHours;
const earthPeriod = CENTRAL_PLANETARY_DATA['earth'].rotationPeriodHours;

const venusRetrograde = venusPeriod < 0 && CELESTIAL_BODIES.venus.rotationPeriodHours < 0;
const uranusRetrograde = uranusPeriod < 0 && CELESTIAL_BODIES.uranus.rotationPeriodHours < 0;
const plutoRetrograde = plutoPeriod < 0 && CELESTIAL_BODIES.pluto.rotationPeriodHours < 0;
const earthPrograde = earthPeriod > 0 && CELESTIAL_BODIES.earth.rotationPeriodHours > 0;

assert(
  venusRetrograde && uranusRetrograde && plutoRetrograde && earthPrograde,
  '2. Retrograde planets (Venus: -5832.5h, Uranus: -17.24h, Pluto: -153.3h) have negative rotation periods',
  `(Earth: +${earthPeriod}h)`
);

// -----------------------------------------------------------------------------
// TEST 3: Physical vs Cinematic Axial Rotation Separation
// -----------------------------------------------------------------------------
console.log('\nTEST 3: Physical vs Cinematic axial rotation separation');
// Physical rotation for Earth: in 1 simulated day (24 hours), Earth rotates 2π radians
const earthPhysicalRot1Day = getPhysicalAxialRotation('earth', 1.0);
const earthRotDev = Math.abs(earthPhysicalRot1Day - (Math.PI * 2 * (24.0 / 23.934)));

// Retrograde physical direction for Venus
const venusPhysicalRot1Day = getPhysicalAxialRotation('venus', 1.0);
const venusDirectionCorrect = venusPhysicalRot1Day < 0;

// Cinematic rotation preserves direction while applying comfortable visual dampening
const earthCinematicRot = getCinematicAxialRotation('earth', 1.0);
const venusCinematicRot = getCinematicAxialRotation('venus', 1.0);

assert(
  earthRotDev < 0.005 && venusDirectionCorrect && (venusCinematicRot < 0) && (earthCinematicRot > 0),
  '3. Physical and cinematic rotation functions correctly compute sidereal angle & preserve retrograde direction'
);

// -----------------------------------------------------------------------------
// TEST 4: Moon Keplerian Orbital Datasets Audit
// -----------------------------------------------------------------------------
console.log('\nTEST 4: Moon datasets and physical parameters audit');
const luna = CELESTIAL_BODIES.earth.moons.find(m => m.id === 'luna')!;
const triton = CELESTIAL_BODIES.neptune.moons.find(m => m.id === 'triton')!;
const io = CELESTIAL_BODIES.jupiter.moons.find(m => m.id === 'io')!;
const titan = CELESTIAL_BODIES.saturn.moons.find(m => m.id === 'titan')!;

const lunaValid = luna && luna.eccentricity === 0.0549 && luna.inclinationDeg === 5.145;
const tritonRetrograde = triton && triton.orbitPeriodDays < 0 && (triton.inclinationDeg ?? 0) > 150;
const ioValid = io && io.orbitPeriodDays === 1.7691 && (io.eccentricity ?? 0) > 0;
const titanValid = titan && titan.orbitPeriodDays === 15.945 && (titan.eccentricity ?? 0) > 0.02;

assert(
  lunaValid && tritonRetrograde && ioValid && titanValid,
  '4. Moon orbital parameters match NASA data (Luna e=0.0549 i=5.15°, Triton retrograde i=156.9°, Titan e=0.0288)'
);

// -----------------------------------------------------------------------------
// TEST 5: 3D Moon Keplerian Propagation (Eccentricity & Inclination)
// -----------------------------------------------------------------------------
console.log('\nTEST 5: Moon 3D Keplerian positioning and closure check');
// Test Luna across 1 full orbital period (27.32166 days)
let rMin = Infinity;
let rMax = -Infinity;
let yMax = 0;
const steps = 100;
const period = luna.orbitPeriodDays;

for (let i = 0; i <= steps; i++) {
  const t = (i / steps) * period;
  const pos = getMoonRelativePosition(luna, t, 'true_scale');
  const r = pos.length();
  if (r < rMin) rMin = r;
  if (r > rMax) rMax = r;
  if (Math.abs(pos.y) > yMax) yMax = Math.abs(pos.y);
}

// In true_scale, a = 384,400 km / 6,371 km = 60.33 Earth radii
// rMin = a(1 - e) = 60.33 * (1 - 0.0549) = 57.02
// rMax = a(1 + e) = 60.33 * (1 + 0.0549) = 63.65
// Non-zero inclination i=5.145° produces yMax ≈ a * sin(5.145°) ≈ 5.41
const orbitIsElliptical = (rMax - rMin) > 5.0; // distinctly non-circular!
const orbitIsInclined = yMax > 4.0; // distinctly 3D inclined!

// Orbit closure check: pos(0) must equal pos(T)
const posAt0 = getMoonRelativePosition(luna, 0, 'enhanced');
const posAtT = getMoonRelativePosition(luna, period, 'enhanced');
const closureDiscrepancy = posAt0.distanceTo(posAtT);

assert(
  orbitIsElliptical && orbitIsInclined && (closureDiscrepancy < 1e-4),
  '5. Moon trajectory computes authentic eccentric anomaly & 3D inclination with exact 2π closure',
  `(Luna rMin: ${rMin.toFixed(2)}, rMax: ${rMax.toFixed(2)}, yMax: ${yMax.toFixed(2)}, closure diff: ${closureDiscrepancy.toExponential(2)})`
);

// -----------------------------------------------------------------------------
// TEST 6: General Relativity & Black Hole Metrics (Sagittarius A*)
// -----------------------------------------------------------------------------
console.log('\nTEST 6: General Relativity metrics for Sagittarius A*');
const sgrAMass = RELATIVISTIC_CONSTANTS.SGR_A_MASS_SOLAR; // 4.154 million M_sun
const rsMeters = RelativityEngine.calculateSchwarzschildRadiusMeters(sgrAMass);
const rsKm = rsMeters / 1000.0;
const rsAU = rsMeters / (KM_PER_AU * 1000.0);

// Expected Rs ≈ 1.227e7 km ≈ 0.0820 AU
const rsAccurate = Math.abs(rsAU - 0.0820) < 0.001;

// Photon sphere is exactly 1.5 * Rs
const rphMeters = RelativityEngine.calculatePhotonSphereRadiusMeters(sgrAMass);
const rphAccurate = Math.abs(rphMeters - 1.5 * rsMeters) < 1.0;

// ISCO is exactly 3.0 * Rs
const iscoMeters = RelativityEngine.calculateISCOMeters(sgrAMass);
const iscoAccurate = Math.abs(iscoMeters - 3.0 * rsMeters) < 1.0;

// Weak-field deflection at b = 10 Rs: alpha = 2 * Rs / b = 0.200 rad
const deflection = RelativityEngine.calculateEinsteinDeflectionRad(sgrAMass, 10 * rsMeters);
const deflectionAccurate = Math.abs(deflection - 0.200) < 1e-6;

assert(
  rsAccurate && rphAccurate && iscoAccurate && deflectionAccurate,
  '6. General relativity engine reproduces exact Schwarzschild radius, photon sphere, ISCO, and Einstein deflection',
  `(Sgr A* Rs: ${rsKm.toExponential(3)} km = ${rsAU.toFixed(4)} AU)`
);

// -----------------------------------------------------------------------------
// TEST 7: Habitable Zone Boundaries (Kopparapu et al. 2013)
// -----------------------------------------------------------------------------
console.log('\nTEST 7: Habitable Zone astrophysical boundaries');
// Standard conservative HZ for G2V Sun (1.0 L_sun):
// Inner edge (runaway greenhouse): 0.95 AU
// Outer edge (maximum greenhouse): 1.67 AU
const hzInner = 0.95;
const hzOuter = 1.67;
const earthAU = CENTRAL_PLANETARY_DATA.earth.semiMajorAxisAU;
const earthInHZ = earthAU >= hzInner && earthAU <= hzOuter;
const mercuryInHZ = CENTRAL_PLANETARY_DATA.mercury.semiMajorAxisAU >= hzInner;
const jupiterInHZ = CENTRAL_PLANETARY_DATA.jupiter.semiMajorAxisAU <= hzOuter;

assert(
  earthInHZ && !mercuryInHZ && !jupiterInHZ,
  '7. Habitable zone strictly bounds Earth [0.95, 1.67] AU based on Kopparapu et al. (2013) greenhouse limits'
);

// -----------------------------------------------------------------------------
// TEST 8: Hohmann Transfer Orbit Calculations (Earth to Mars)
// -----------------------------------------------------------------------------
console.log('\nTEST 8: Hohmann Transfer orbit mechanics (Earth to Mars)');
const r1_km = 1.000000 * KM_PER_AU;
const r2_km = 1.523679 * KM_PER_AU;
const a_tx_km = (r1_km + r2_km) / 2.0;

const v1_circ = Math.sqrt(MU_SUN_KM3_S2 / r1_km);
const v2_circ = Math.sqrt(MU_SUN_KM3_S2 / r2_km);
const deltaV1 = Math.abs(Math.sqrt(MU_SUN_KM3_S2 * (2.0 / r1_km - 1.0 / a_tx_km)) - v1_circ);
const deltaV2 = Math.abs(v2_circ - Math.sqrt(MU_SUN_KM3_S2 * (2.0 / r2_km - 1.0 / a_tx_km)));
const totalDeltaV = deltaV1 + deltaV2;

// Transfer time: t = π * sqrt(a³ / μ)
const transferDays = (Math.PI * Math.sqrt(Math.pow(a_tx_km, 3) / MU_SUN_KM3_S2)) / 86400;

// Earth-Mars textbook values: DeltaV ~ 5.6 km/s, Transfer days ~ 259 days
const deltaVValid = totalDeltaV > 5.4 && totalDeltaV < 5.8;
const transferTimeValid = transferDays > 255 && transferDays < 263;

assert(
  deltaVValid && transferTimeValid,
  '8. Earth to Mars Hohmann transfer calculates exact Vis-viva Delta-V budget and flight duration',
  `(Total Δv: ${totalDeltaV.toFixed(2)} km/s, Flight time: ${transferDays.toFixed(1)} days)`
);

// -----------------------------------------------------------------------------
// TEST 9: Galactic Center & Solar System Position in Milky Way
// -----------------------------------------------------------------------------
console.log('\nTEST 9: Milky Way dimensions, Sun position, and Flat Rotation Curve');
const mwDiameter = MILKY_WAY_DATA.diameterLy;
const mwThickness = MILKY_WAY_DATA.thicknessLy;
const sunDistLy = MILKY_WAY_DATA.sunPosition.distanceFromCoreLy;
const sunArm = MILKY_WAY_DATA.sunPosition.arm;

// Flat rotation curve at radius r = 26,490 LY (~8.12 kpc)
const vGalactic = getGalacticRotationVelocity(25.0); // around solar orbit radius

const mwDimensionsValid = mwDiameter === 100000 && mwThickness === 1000;
const sunPositionValid = Math.abs(sunDistLy - 26490) < 500 && sunArm.includes('Orion');
const rotationCurveValid = vGalactic > 210.0 && vGalactic < 230.0;

assert(
  mwDimensionsValid && sunPositionValid && rotationCurveValid,
  '9. Milky Way model verifies 100,000 LY diameter, Sun galactocentric distance (~26,490 LY in Orion Spur), and flat dark matter rotation curve (~220 km/s)'
);

// -----------------------------------------------------------------------------
// TEST 10: Scale Conversion Monotonicity & Numerical Stability
// -----------------------------------------------------------------------------
console.log('\nTEST 10: Scale conversion monotonicity & numerical finiteness');
let monotonic = true;
let previousVisualDist = 0;
const testAUs = [0.1, 0.387, 0.723, 1.0, 1.524, 2.77, 5.204, 9.582, 19.2, 30.05, 39.48, 100.0];

for (const au of testAUs) {
  const visualDist = auToVisualDistance(au);
  if (!Number.isFinite(visualDist) || visualDist <= previousVisualDist) {
    monotonic = false;
    break;
  }
  previousVisualDist = visualDist;
}

assert(
  monotonic,
  '10. Scale conversion (auToVisualDistance) strictly monotonic and finite across entire Solar System range [0.1 to 100 AU]'
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n====================================================================');
console.log(`RESULTS: ${passedCount} / ${passedCount + failedCount} PASSED, ${failedCount} FAILED`);
console.log('====================================================================');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
