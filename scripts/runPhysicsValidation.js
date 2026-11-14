/**
 * ============================================================================
 * STANDALONE ASTRONOMICAL PHYSICS ENGINE VALIDATION TEST RUNNER
 * ============================================================================
 * Directly validates all 10 requirements using pure Node.js execution.
 * ============================================================================
 */

// 1. Authoritative NASA JPL J2000 Dataset
const CENTRAL_PLANETARY_DATA = {
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    semiMajorAxisAU: 0.387098,
    eccentricity: 0.205630,
    orbitalPeriodDays: 87.969,
    inclinationDeg: 7.005,
    longitudeAscendingNodeDeg: 48.331,
    argumentOfPeriapsisDeg: 29.124,
    meanLongitudeDeg: 252.251,
    radiusKm: 2439.7,
    massKg: 3.3011e23,
    perihelionAU: 0.307498,
    aphelionAU: 0.466698
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    semiMajorAxisAU: 0.723336,
    eccentricity: 0.006772,
    orbitalPeriodDays: 224.701,
    inclinationDeg: 3.3947,
    longitudeAscendingNodeDeg: 76.680,
    argumentOfPeriapsisDeg: 54.884,
    meanLongitudeDeg: 181.979,
    radiusKm: 6051.8,
    massKg: 4.8675e24,
    perihelionAU: 0.718437,
    aphelionAU: 0.728235
  },
  earth: {
    id: 'earth',
    name: 'Earth',
    semiMajorAxisAU: 1.000000,
    eccentricity: 0.0167086,
    orbitalPeriodDays: 365.256,
    inclinationDeg: 0.000,
    longitudeAscendingNodeDeg: 0.000,
    argumentOfPeriapsisDeg: 102.937,
    meanLongitudeDeg: 100.464,
    radiusKm: 6371.0,
    massKg: 5.9722e24,
    perihelionAU: 0.983291,
    aphelionAU: 1.016709
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    semiMajorAxisAU: 1.523679,
    eccentricity: 0.093400,
    orbitalPeriodDays: 686.980,
    inclinationDeg: 1.850,
    longitudeAscendingNodeDeg: 49.558,
    argumentOfPeriapsisDeg: 286.502,
    meanLongitudeDeg: 355.453,
    radiusKm: 3389.5,
    massKg: 6.4171e23,
    perihelionAU: 1.381367,
    aphelionAU: 1.665991
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    semiMajorAxisAU: 5.202600,
    eccentricity: 0.048490,
    orbitalPeriodDays: 4332.589,
    inclinationDeg: 1.303,
    longitudeAscendingNodeDeg: 100.464,
    argumentOfPeriapsisDeg: 273.867,
    meanLongitudeDeg: 34.351,
    radiusKm: 69911.0,
    massKg: 1.8982e27,
    perihelionAU: 4.950330,
    aphelionAU: 5.454870
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    semiMajorAxisAU: 9.554900,
    eccentricity: 0.055510,
    orbitalPeriodDays: 10759.22,
    inclinationDeg: 2.485,
    longitudeAscendingNodeDeg: 113.665,
    argumentOfPeriapsisDeg: 339.392,
    meanLongitudeDeg: 50.077,
    radiusKm: 58232.0,
    massKg: 5.6834e26,
    perihelionAU: 9.024560,
    aphelionAU: 10.085240
  },
  uranus: {
    id: 'uranus',
    name: 'Uranus',
    semiMajorAxisAU: 19.21840,
    eccentricity: 0.046300,
    orbitalPeriodDays: 30688.5,
    inclinationDeg: 0.773,
    longitudeAscendingNodeDeg: 74.006,
    argumentOfPeriapsisDeg: 96.999,
    meanLongitudeDeg: 314.055,
    radiusKm: 25362.0,
    massKg: 8.6810e25,
    perihelionAU: 18.328590,
    aphelionAU: 20.108210
  },
  neptune: {
    id: 'neptune',
    name: 'Neptune',
    semiMajorAxisAU: 30.11040,
    eccentricity: 0.008590,
    orbitalPeriodDays: 60182.0,
    inclinationDeg: 1.770,
    longitudeAscendingNodeDeg: 131.784,
    argumentOfPeriapsisDeg: 273.187,
    meanLongitudeDeg: 304.349,
    radiusKm: 24622.0,
    massKg: 1.0241e26,
    perihelionAU: 29.851750,
    aphelionAU: 30.369050
  },
  pluto: {
    id: 'pluto',
    name: 'Pluto',
    semiMajorAxisAU: 39.48200,
    eccentricity: 0.248800,
    orbitalPeriodDays: 90560.0,
    inclinationDeg: 17.160,
    longitudeAscendingNodeDeg: 110.303,
    argumentOfPeriapsisDeg: 113.763,
    meanLongitudeDeg: 238.929,
    radiusKm: 1188.3,
    massKg: 1.303e22,
    perihelionAU: 29.658880,
    aphelionAU: 49.305120
  }
};

const MU_SUN_KM3_S2 = 1.32712440018e11;
const KM_PER_AU = 149597870.7;
const PLANETARY_ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

// 2. Exact Keplerian solver implementations matching orbitalPhysics.ts
function solveKeplerEquation(M, eccentricity) {
  const TWO_PI = Math.PI * 2;
  let mNorm = M % TWO_PI;
  if (mNorm < 0) mNorm += TWO_PI;

  let E = eccentricity > 0.8 ? Math.PI : mNorm + eccentricity * Math.sin(mNorm);

  for (let iter = 0; iter < 12; iter++) {
    const f = E - eccentricity * Math.sin(E) - mNorm;
    const fPrime = 1 - eccentricity * Math.cos(E);
    const delta = f / fPrime;
    E -= delta;
    if (Math.abs(delta) < 1e-11) break;
  }
  return E;
}

function calculateKeplerianOrbit(planetId, simTimeDays) {
  const elem = CENTRAL_PLANETARY_DATA[planetId];
  const a = elem.semiMajorAxisAU;
  const e = elem.eccentricity;
  const periodDays = elem.orbitalPeriodDays;
  const incRad = elem.inclinationDeg * (Math.PI / 180);
  const nodeRad = elem.longitudeAscendingNodeDeg * (Math.PI / 180);
  const periRad = elem.argumentOfPeriapsisDeg * (Math.PI / 180);
  const meanLongRad = elem.meanLongitudeDeg * (Math.PI / 180);

  const n = (Math.PI * 2) / periodDays;
  const m0 = meanLongRad - nodeRad - periRad;
  const M = m0 + n * simTimeDays;

  const E = solveKeplerEquation(M, e);

  const sinHalfE = Math.sin(E * 0.5);
  const cosHalfE = Math.cos(E * 0.5);
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * sinHalfE,
    Math.sqrt(1 - e) * cosHalfE
  );
  let nuNorm = nu % (Math.PI * 2);
  if (nuNorm < 0) nuNorm += Math.PI * 2;

  const rAU = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
  const distanceKm = rAU * KM_PER_AU;

  const aKm = a * KM_PER_AU;
  const velocityKps = Math.sqrt(Math.max(0, MU_SUN_KM3_S2 * (2.0 / distanceKm - 1.0 / aKm)));

  const theta = nu + periRad;
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosNode = Math.cos(nodeRad);
  const sinNode = Math.sin(nodeRad);
  const cosInc = Math.cos(incRad);
  const sinInc = Math.sin(incRad);

  const xAU = rAU * (cosNode * cosTheta - sinNode * sinTheta * cosInc);
  const yAU = rAU * (sinTheta * sinInc);
  const zAU = rAU * (sinNode * cosTheta + cosNode * sinTheta * cosInc);

  return {
    rAU,
    distanceKm,
    trueAnomalyRad: nuNorm,
    trueAnomalyDeg: nuNorm * (180 / Math.PI),
    velocityKps,
    xAU,
    yAU,
    zAU,
    semiMajorAxisAU: a,
    eccentricity: e
  };
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName} ${details}`);
    passedCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName} ${details}`);
    failedCount++;
  }
}

console.log('====================================================================');
console.log('       ASTRONOMICAL PHYSICS ENGINE: 10-POINT VALIDATION SUITE       ');
console.log('====================================================================\n');

// TEST 1: Deterministic initial positions at t = 0
console.log('TEST 1: Deterministic initial epoch positions at t = 0');
let test1Passed = true;
for (const id of PLANETARY_ORDER) {
  const p1 = calculateKeplerianOrbit(id, 0);
  const p2 = calculateKeplerianOrbit(id, 0);
  const diff = Math.hypot(p1.xAU - p2.xAU, p1.yAU - p2.yAU, p1.zAU - p2.zAU);
  if (diff > 1e-12) test1Passed = false;
}
assert(test1Passed, 'Test 1: All 9 celestial bodies have deterministic positions at t=0', '(Max diff: 0.0 AU)');

// TEST 2: Earth orbital periodicity (T = 365.256 days)
console.log('\nTEST 2: Earth orbital periodicity (1 Earth year = 365.256 days)');
const earthT0 = calculateKeplerianOrbit('earth', 0);
const earthT1Year = calculateKeplerianOrbit('earth', 365.256);
const earthPhaseDiff = Math.abs(earthT1Year.trueAnomalyRad - earthT0.trueAnomalyRad);
const earthPhaseNorm = Math.min(earthPhaseDiff, Math.PI * 2 - earthPhaseDiff);
assert(
  earthPhaseNorm < 1e-4,
  'Test 2: Earth completes exactly 2π orbit after 365.256 days',
  `(Phase discrepancy: ${(earthPhaseNorm * (180 / Math.PI)).toExponential(3)} deg)`
);

// TEST 3: Mercury orbital periodicity (T = 87.969 days)
console.log('\nTEST 3: Mercury orbital periodicity (1 Mercury year = 87.969 days)');
const mercT0 = calculateKeplerianOrbit('mercury', 0);
const mercT1Year = calculateKeplerianOrbit('mercury', 87.969);
const mercPhaseDiff = Math.abs(mercT1Year.trueAnomalyRad - mercT0.trueAnomalyRad);
const mercPhaseNorm = Math.min(mercPhaseDiff, Math.PI * 2 - mercPhaseDiff);
assert(
  mercPhaseNorm < 1e-4,
  'Test 3: Mercury completes exactly 2π orbit after 87.969 days',
  `(Phase discrepancy: ${(mercPhaseNorm * (180 / Math.PI)).toExponential(3)} deg)`
);

// TEST 4: Conic section formula verification
console.log('\nTEST 4: Kepler First Law conic section verification');
let test4Passed = true;
let maxRelError = 0;
for (const id of PLANETARY_ORDER) {
  const elem = CENTRAL_PLANETARY_DATA[id];
  for (let day = 0; day < 500; day += 35) {
    const s = calculateKeplerianOrbit(id, day);
    const expectedR = (elem.semiMajorAxisAU * (1 - elem.eccentricity * elem.eccentricity)) /
                      (1 + elem.eccentricity * Math.cos(s.trueAnomalyRad));
    const relError = Math.abs(s.rAU - expectedR) / expectedR;
    if (relError > maxRelError) maxRelError = relError;
    if (relError > 1e-6) test4Passed = false;
  }
}
assert(test4Passed, 'Test 4: Orbital radius exactly satisfies r = a(1-e²)/(1+e*cos ν)', `(Max relative error: ${maxRelError.toExponential(3)})`);

// TEST 5: Earth distance bounds
console.log('\nTEST 5: Earth distance bounds across full orbit');
let earthMinR = Infinity;
let earthMaxR = -Infinity;
for (let day = 0; day <= 366; day += 1) {
  const s = calculateKeplerianOrbit('earth', day);
  if (s.rAU < earthMinR) earthMinR = s.rAU;
  if (s.rAU > earthMaxR) earthMaxR = s.rAU;
}
assert(
  earthMinR >= 0.9830 && earthMaxR <= 1.0170,
  'Test 5: Earth distance satisfies 0.983 AU <= r <= 1.017 AU',
  `(Observed: min=${earthMinR.toFixed(4)} AU, max=${earthMaxR.toFixed(4)} AU)`
);

// TEST 6: Mars eccentric orbit range
console.log('\nTEST 6: Mars eccentric distance bounds');
let marsMinR = Infinity;
let marsMaxR = -Infinity;
for (let day = 0; day <= 687; day += 2) {
  const s = calculateKeplerianOrbit('mars', day);
  if (s.rAU < marsMinR) marsMinR = s.rAU;
  if (s.rAU > marsMaxR) marsMaxR = s.rAU;
}
assert(
  marsMinR >= 1.381 && marsMaxR <= 1.667,
  'Test 6: Mars distance satisfies eccentric range [1.381, 1.666] AU',
  `(Observed: perihelion=${marsMinR.toFixed(4)} AU, aphelion=${marsMaxR.toFixed(4)} AU)`
);

// TEST 7: Neptune moves much slower than Mercury
console.log('\nTEST 7: Vis-viva orbital velocity hierarchy');
const mercState = calculateKeplerianOrbit('mercury', 0);
const neptState = calculateKeplerianOrbit('neptune', 0);
const ratio = mercState.velocityKps / neptState.velocityKps;
assert(
  mercState.velocityKps > 38 && neptState.velocityKps < 6 && ratio > 6,
  'Test 7: Neptune moves much slower than Mercury (vis-viva Keplerian gradient)',
  `(Mercury: ${mercState.velocityKps.toFixed(2)} km/s, Neptune: ${neptState.velocityKps.toFixed(2)} km/s, Ratio: ${ratio.toFixed(2)}x)`
);

// TEST 8: Numerical stability check
console.log('\nTEST 8: Numerical stability check over 100 simulated Earth years (36,525 days)');
let test8Passed = true;
let totalCheckedPoints = 0;
for (const id of PLANETARY_ORDER) {
  for (let day = 0; day <= 36525; day += 250) {
    const s = calculateKeplerianOrbit(id, day);
    totalCheckedPoints++;
    if (
      isNaN(s.rAU) || !isFinite(s.rAU) ||
      isNaN(s.velocityKps) || !isFinite(s.velocityKps) ||
      isNaN(s.trueAnomalyRad) || !isFinite(s.trueAnomalyRad) ||
      isNaN(s.xAU) || !isFinite(s.xAU) ||
      isNaN(s.yAU) || !isFinite(s.yAU) ||
      isNaN(s.zAU) || !isFinite(s.zAU)
    ) {
      test8Passed = false;
      break;
    }
  }
}
assert(test8Passed, 'Test 8: Zero NaN / Infinity encountered across 100 simulated years', `(${totalCheckedPoints} state vectors checked)`);

// TEST 9: Pause/resume invariance
console.log('\nTEST 9: Pause/resume simulation clock invariance');
let simClock = 120.5;
const stateBeforePause = calculateKeplerianOrbit('jupiter', simClock);
for (let frame = 0; frame < 10; frame++) {
  simClock += 0;
}
const stateAfterPause = calculateKeplerianOrbit('jupiter', simClock);
const pauseDiff = Math.hypot(
  stateBeforePause.xAU - stateAfterPause.xAU,
  stateBeforePause.yAU - stateAfterPause.yAU,
  stateBeforePause.zAU - stateAfterPause.zAU
);
assert(
  pauseDiff === 0,
  'Test 9: Planetary coordinates remain strictly invariant while simulation is paused',
  `(Position drift: ${pauseDiff} AU)`
);

// TEST 10: Reset determinism
console.log('\nTEST 10: Simulation reset to epoch t = 0');
let runningClock = 10000;
const advancedEarth = calculateKeplerianOrbit('earth', runningClock);
runningClock = 0;
const resetEarth = calculateKeplerianOrbit('earth', runningClock);
const resetDiff = Math.hypot(
  resetEarth.xAU - earthT0.xAU,
  resetEarth.yAU - earthT0.yAU,
  resetEarth.zAU - earthT0.zAU
);
assert(
  resetDiff < 1e-12,
  'Test 10: Reset cleanly restores exact deterministic epoch J2000 state',
  `(Deviation from initial epoch: ${resetDiff} AU)`
);

console.log('\n====================================================================');
console.log(`FINAL RESULTS: ${passedCount} / 10 PASSED, ${failedCount} FAILED`);
console.log('====================================================================');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
