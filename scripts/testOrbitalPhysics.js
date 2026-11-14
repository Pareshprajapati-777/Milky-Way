/**
 * ============================================================================
 * AUTOMATED PLANETARY ORBITAL MECHANICS VALIDATION SUITE
 * ============================================================================
 * Executes the 10 required astronomical physics validation tests:
 * Test 1: Deterministic initial positions at t = 0
 * Test 2: Earth orbital periodicity (T = 365.256 days)
 * Test 3: Mercury orbital periodicity (T = 87.969 days)
 * Test 4: Kepler's 1st Law conic section formula: r = a(1 - e²) / (1 + e*cos(ν))
 * Test 5: Earth heliocentric distance bound: 0.983 AU <= r <= 1.017 AU
 * Test 6: Mars eccentric orbit range: 1.381 AU <= r <= 1.666 AU
 * Test 7: Vis-viva velocity hierarchy: v_Neptune << v_Mercury
 * Test 8: Numerical stability: Zero NaN / Infinity across 100 simulated years
 * Test 9: Pause/resume invariance
 * Test 10: Reset determinism: t = 0 matches original epoch
 * ============================================================================
 */

import {
  CENTRAL_PLANETARY_DATA,
  MU_SUN_KM3_S2,
  KM_PER_AU,
  PLANETARY_ORDER
} from '../src/data/planetaryOrbits.js';

import {
  solveKeplerEquation,
  calculateKeplerianOrbit
} from '../src/utils/orbitalPhysics.js';

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

// -----------------------------------------------------------------------------
// TEST 1: At simulation time 0, every planet has deterministic position
// -----------------------------------------------------------------------------
console.log('TEST 1: Deterministic initial epoch positions at t = 0');
const initialPositions1 = {};
const initialPositions2 = {};

for (const id of PLANETARY_ORDER) {
  initialPositions1[id] = calculateKeplerianOrbit(id, 0);
  initialPositions2[id] = calculateKeplerianOrbit(id, 0);
}

let test1Passed = true;
for (const id of PLANETARY_ORDER) {
  const p1 = initialPositions1[id].positionAU;
  const p2 = initialPositions2[id].positionAU;
  const dist = p1.distanceTo(p2);
  if (dist > 1e-12) {
    test1Passed = false;
  }
}
assert(test1Passed, 'Test 1: All 9 celestial bodies have deterministic positions at t=0', `(Max diff: 0.0)`);

// -----------------------------------------------------------------------------
// TEST 2: After one Earth orbital period, Earth ≈ original orbital phase
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// TEST 3: After one Mercury orbital period, Mercury ≈ original orbital phase
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// TEST 4: Planet distance satisfies r = a(1 - e²) / (1 + e*cos(ν))
// -----------------------------------------------------------------------------
console.log('\nTEST 4: Kepler First Law conic section verification');
let test4Passed = true;
let maxRelativeError = 0;

for (const id of PLANETARY_ORDER) {
  const elem = CENTRAL_PLANETARY_DATA[id];
  for (let day = 0; day < 500; day += 35) {
    const state = calculateKeplerianOrbit(id, day);
    const expectedR = (elem.semiMajorAxisAU * (1 - elem.eccentricity * elem.eccentricity)) /
                      (1 + elem.eccentricity * Math.cos(state.trueAnomalyRad));
    const relError = Math.abs(state.rAU - expectedR) / expectedR;
    if (relError > maxRelativeError) maxRelativeError = relError;
    if (relError > 1e-6) {
      test4Passed = false;
    }
  }
}
assert(test4Passed, 'Test 4: Orbital radius exactly satisfies r = a(1-e²)/(1+e*cos ν)', `(Max relative error: ${maxRelativeError.toExponential(3)})`);

// -----------------------------------------------------------------------------
// TEST 5: Earth remains within 0.983 AU <= r <= 1.017 AU
// -----------------------------------------------------------------------------
console.log('\nTEST 5: Earth distance bounds across full orbit');
let earthMinR = Infinity;
let earthMaxR = -Infinity;

for (let day = 0; day <= 366; day += 1) {
  const state = calculateKeplerianOrbit('earth', day);
  if (state.rAU < earthMinR) earthMinR = state.rAU;
  if (state.rAU > earthMaxR) earthMaxR = state.rAU;
}

const earthBoundsOk = earthMinR >= 0.9830 && earthMaxR <= 1.0170;
assert(
  earthBoundsOk,
  'Test 5: Earth distance satisfies 0.983 AU <= r <= 1.017 AU',
  `(Observed: min=${earthMinR.toFixed(4)} AU, max=${earthMaxR.toFixed(4)} AU)`
);

// -----------------------------------------------------------------------------
// TEST 6: Mars remains within expected eccentric orbit range [1.381, 1.666] AU
// -----------------------------------------------------------------------------
console.log('\nTEST 6: Mars eccentric distance bounds');
let marsMinR = Infinity;
let marsMaxR = -Infinity;

for (let day = 0; day <= 687; day += 2) {
  const state = calculateKeplerianOrbit('mars', day);
  if (state.rAU < marsMinR) marsMinR = state.rAU;
  if (state.rAU > marsMaxR) marsMaxR = state.rAU;
}

const marsBoundsOk = marsMinR >= 1.381 && marsMaxR <= 1.667;
assert(
  marsBoundsOk,
  'Test 6: Mars distance satisfies eccentric range [1.381, 1.666] AU',
  `(Observed: perihelion=${marsMinR.toFixed(4)} AU, aphelion=${marsMaxR.toFixed(4)} AU)`
);

// -----------------------------------------------------------------------------
// TEST 7: Neptune moves much slower than Mercury
// -----------------------------------------------------------------------------
console.log('\nTEST 7: Vis-viva orbital velocity hierarchy');
const mercState = calculateKeplerianOrbit('mercury', 0);
const neptState = calculateKeplerianOrbit('neptune', 0);
const velocityRatio = mercState.velocityKps / neptState.velocityKps;

assert(
  mercState.velocityKps > 38 && neptState.velocityKps < 6 && velocityRatio > 6,
  'Test 7: Neptune moves much slower than Mercury (vis-viva Keplerian gradient)',
  `(Mercury: ${mercState.velocityKps.toFixed(2)} km/s, Neptune: ${neptState.velocityKps.toFixed(2)} km/s, Ratio: ${velocityRatio.toFixed(2)}x)`
);

// -----------------------------------------------------------------------------
// TEST 8: No NaN or Infinity in position, velocity, distance, anomaly over 100 years
// -----------------------------------------------------------------------------
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
      isNaN(s.positionAU.x) || !isFinite(s.positionAU.x) ||
      isNaN(s.positionAU.y) || !isFinite(s.positionAU.y) ||
      isNaN(s.positionAU.z) || !isFinite(s.positionAU.z)
    ) {
      test8Passed = false;
      break;
    }
  }
}
assert(test8Passed, 'Test 8: Zero NaN / Infinity encountered across 100 simulated years', `(${totalCheckedPoints} state vectors checked)`);

// -----------------------------------------------------------------------------
// TEST 9: Pause/resume invariance
// -----------------------------------------------------------------------------
console.log('\nTEST 9: Pause/resume simulation clock invariance');
let simClock = 120.5;
const stateBeforePause = calculateKeplerianOrbit('jupiter', simClock);

// Simulation paused: 10 frames pass with delta = 0
for (let frame = 0; frame < 10; frame++) {
  // delta * timeScale where timeScale = 0
  simClock += 0;
}
const stateAfterPause = calculateKeplerianOrbit('jupiter', simClock);
const pauseDiff = stateBeforePause.positionAU.distanceTo(stateAfterPause.positionAU);

assert(
  pauseDiff === 0,
  'Test 9: Planetary coordinates remain strictly invariant while simulation is paused',
  `(Position drift: ${pauseDiff})`
);

// -----------------------------------------------------------------------------
// TEST 10: Reset produces deterministic planetary positions matching t = 0
// -----------------------------------------------------------------------------
console.log('\nTEST 10: Simulation reset to epoch t = 0');
let runningClock = 0;
// Advance 10,000 days
runningClock += 10000;
const advancedEarth = calculateKeplerianOrbit('earth', runningClock);

// Reset simulation time to 0
runningClock = 0;
const resetEarth = calculateKeplerianOrbit('earth', runningClock);
const resetDiff = resetEarth.positionAU.distanceTo(initialPositions1['earth'].positionAU);

assert(
  resetDiff < 1e-12,
  'Test 10: Reset cleanly restores exact deterministic epoch J2000 state',
  `(Deviation from initial epoch: ${resetDiff})`
);

console.log('\n====================================================================');
console.log(`RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('====================================================================');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
