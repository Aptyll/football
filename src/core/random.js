// Randomness for game rules and play scripts. Pure: no DOM, no three.js.
// Tests call setRandom(seeded(n)) to make outcomes repeatable.
let source = Math.random;

export const rand = () => source();
export function setRandom(fn) { source = fn || Math.random; }

// Normally distributed value, mean 0, spread 1.
export function gauss() {
  let u = 0;
  while (!u) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

// Small deterministic generator. Use for static art (crowd, turf noise) and tests.
export function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
