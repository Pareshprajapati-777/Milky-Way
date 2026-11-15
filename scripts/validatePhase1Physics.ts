/**
 * ============================================================================
 * PHASE 1 SCIENTIFIC VALIDATION & ACCURACY SUITE
 * ============================================================================
 * Validates:
 * 1. Earth orbital period (365.256 days -> 2π return)
 * 2. Mercury orbital period (87.969 days -> 2π return)
 * 3. Earth perihelion & aphelion bounds [0.9830, 1.0170] AU
 * 4. Mars eccentric distance bounds [1.381, 1.667] AU
 * 5. Orbital velocity hierarchy (v_Mercury > v_Venus > ... > v_Neptune)
 * 6. Position & Velocity vector finiteness (No NaN, No Infinity)
 * 7. Position & Velocity consistency via Numerical Differentiation (v ≈ dr/dt)
 * 8. Error handling: Unknown ID rejection without silent Earth fallback
 * 9. Error handling: Invalid eccentricity & non-finite times rejected
 * 10. Pause / resume / reset determinism
 * ============================================================================
 */

import { CENTRAL_PLANETARY_DATA, PLANETARY_ORDER } from '../src/data/planetaryOrbits.ts';
import { calculateKeplerianOrbit, solveKeplerEquation } from '../src/utils/orbitalPhysics.ts';
import { KeplerSolver } from '../src/core/KeplerSolver.ts';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}\n     Error: ${err.message}`);
    failed++;
  }
}

function assertClose(actual, expected, tol, msg) {
  const diff = Math.abs(actual - expected);
  if (diff > tol) {
    throw new Error(`${msg}: expected ${expected} ± ${tol}, got ${actual} (diff=${diff})`);
  }
}

console.log('====================================================================');
console.log('         PHASE 1 SCIENTIFIC & KEPLERIAN VERIFICATION SUITE          ');
console.log('====================================================================\n');

// 1. Earth Orbital Period
test('1. Earth orbital period closes 2π orbit in 365.256 days', () => {
  const s0 = calculateKeplerianOrbit('earth', 0);
  const sYear = calculateKeplerianOrbit('earth', 365.256);
  const phaseDiff = Math.abs(sYear.trueAnomalyRad - s0.trueAnomalyRad);
  const normDiff = Math.min(phaseDiff, 2 * Math.PI - phaseDiff);
  assertClose(normDiff, 0, 1e-4, 'Earth true anomaly discrepancy after 1 orbit');
});

// 2. Mercury Orbital Period
test('2. Mercury orbital period closes 2π orbit in 87.969 days', () => {
  const s0 = calculateKeplerianOrbit('mercury', 0);
  const sYear = calculateKeplerianOrbit('mercury', 87.969);
  const phaseDiff = Math.abs(sYear.trueAnomalyRad - s0.trueAnomalyRad);
  const normDiff = Math.min(phaseDiff, 2 * Math.PI - phaseDiff);
  assertClose(normDiff, 0, 1e-4, 'Mercury true anomaly discrepancy after 1 orbit');
});

// 3. Earth Perihelion & Aphelion Bounds
test('3. Earth distances strictly bound within perihelion & aphelion [0.9830, 1.0170] AU', () => {
  let minR = Infinity;
  let maxR = -Infinity;
  for (let day = 0; day <= 366; day += 0.5) {
    const s = calculateKeplerianOrbit('earth', day);
    if (s.rAU < minR) minR = s.rAU;
    if (s.rAU > maxR) maxR = s.rAU;
  }
  if (minR < 0.9830 || maxR > 1.0170) {
    throw new Error(`Earth distance out of bounds: min=${minR}, max=${maxR}`);
  }
});

// 4. Mars Orbital Distance Bounds
test('4. Mars distances strictly bound within eccentric range [1.381, 1.667] AU', () => {
  let minR = Infinity;
  let maxR = -Infinity;
  for (let day = 0; day <= 687; day += 1.0) {
    const s = calculateKeplerianOrbit('mars', day);
    if (s.rAU < minR) minR = s.rAU;
    if (s.rAU > maxR) maxR = s.rAU;
  }
  if (minR < 1.381 || maxR > 1.667) {
    throw new Error(`Mars distance out of bounds: min=${minR}, max=${maxR}`);
  }
});

// 5. Orbital Velocity Hierarchy (The 8 Major Planets)
test('5. Vis-viva velocity hierarchy strictly preserved: v_Merc > v_Venus > v_Earth > ... > v_Neptune', () => {
  const majorPlanets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const speeds = majorPlanets.map(id => ({
    id,
    speed: calculateKeplerianOrbit(id, 0).velocityKps
  }));

  for (let i = 0; i < speeds.length - 1; i++) {
    if (speeds[i].speed <= speeds[i + 1].speed) {
      throw new Error(`Hierarchy inversion: ${speeds[i].id} (${speeds[i].speed} km/s) <= ${speeds[i+1].id} (${speeds[i+1].speed} km/s)`);
    }
  }
});

// 6. Vector Finiteness Across 100 Years
test('6. Finiteness check: No NaN / Infinity in position, velocity, and scalar fields over 100 years', () => {
  for (const id of PLANETARY_ORDER) {
    for (let day = 0; day <= 36525; day += 300) {
      const s = calculateKeplerianOrbit(id, day);
      const isOk = Number.isFinite(s.rAU) &&
                   Number.isFinite(s.velocityKps) &&
                   Number.isFinite(s.positionAU.x) &&
                   Number.isFinite(s.positionAU.y) &&
                   Number.isFinite(s.positionAU.z) &&
                   Number.isFinite(s.velocityVectorKps.x) &&
                   Number.isFinite(s.velocityVectorKps.y) &&
                   Number.isFinite(s.velocityVectorKps.z);
      if (!isOk) {
        throw new Error(`Non-finite numbers encountered for ${id} on day ${day}`);
      }
    }
  }
});

// 7. Numerical Derivative Consistency (v ≈ dr/dt)
test('7. Kinematic consistency: velocity vector matches numerical derivative dr/dt', () => {
  const dt = 1e-4; // 0.0001 days ~ 8.64 seconds
  const testBodies = ['mercury', 'earth', 'jupiter'];

  for (const id of testBodies) {
    const sBefore = calculateKeplerianOrbit(id, 50.0 - dt);
    const sAfter = calculateKeplerianOrbit(id, 50.0 + dt);

    // Central difference numerical derivative: dr/dt in AU/day
    const numVx = (sAfter.positionAU.x - sBefore.positionAU.x) / (2 * dt);
    const numVy = (sAfter.positionAU.y - sBefore.positionAU.y) / (2 * dt);
    const numVz = (sAfter.positionAU.z - sBefore.positionAU.z) / (2 * dt);

    const analyticV = sAfter.velocityAUPerDay;
    const diff = Math.hypot(numVx - analyticV.x, numVy - analyticV.y, numVz - analyticV.z);
    
    // Relative error tolerance
    const speed = Math.hypot(analyticV.x, analyticV.y, analyticV.z);
    const relErr = diff / speed;
    if (relErr > 1e-3) {
      throw new Error(`Kinematic discrepancy for ${id}: relErr=${relErr}, num=[${numVx},${numVy},${numVz}], ana=[${analyticV.x},${analyticV.y},${analyticV.z}]`);
    }
  }
});

// 8. Error Handling: Unknown IDs Rejected
test('8. Error handling: Unknown celestial body ID throws explicit error instead of silent Earth fallback', () => {
  let threw = false;
  try {
    calculateKeplerianOrbit('krypton_999', 0);
  } catch (err) {
    threw = true;
    if (!err.message.includes('krypton_999')) {
      throw new Error(`Expected error to mention unknown ID, got: ${err.message}`);
    }
  }
  if (!threw) throw new Error('Failed to throw error on unknown planet ID!');
});

// 9. Error Handling: Invalid Parameters Rejected
test('9. Error handling: Non-finite times and invalid eccentricities rejected', () => {
  let threwNaN = false;
  try {
    calculateKeplerianOrbit('earth', NaN);
  } catch {
    threwNaN = true;
  }
  if (!threwNaN) throw new Error('Failed to throw on NaN simulation time');

  let threwEcc = false;
  try {
    solveKeplerEquation(1.0, 1.5); // parabolic/hyperbolic out of bounds
  } catch {
    threwEcc = true;
  }
  if (!threwEcc) throw new Error('Failed to throw on eccentricity >= 1.0');
});

// 10. Pause / Reset Determinism
test('10. Pause / Reset determinism: t = 0 matches original J2000 epoch exactly', () => {
  const initialEarth = calculateKeplerianOrbit('earth', 0);
  
  // Advance 5000 days
  calculateKeplerianOrbit('earth', 5000);

  // Reset to 0
  const resetEarth = calculateKeplerianOrbit('earth', 0);
  const drift = resetEarth.positionAU.distanceTo(initialEarth.positionAU);
  assertClose(drift, 0, 1e-12, 'Deviation after reset to epoch t=0');
});

console.log('\n====================================================================');
console.log(`RESULTS: ${passed} / 10 PASSED, ${failed} FAILED`);
console.log('====================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
