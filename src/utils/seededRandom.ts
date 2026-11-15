/**
 * Mulberry32 Seeded Pseudo-Random Number Generator (PRNG)
 * Produces deterministic, platform-independent uniform random values in [0, 1).
 * Essential for reproducible procedural geometry and particle field allocation.
 */
export function createSeededRandom(initialSeed: number = 0x19800723): () => number {
  let s = initialSeed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

