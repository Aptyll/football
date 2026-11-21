// Defensive looks: what the defense shows before the snap and what it really runs.
// Pure: no DOM, no three.js.
import { rand } from '../core/random.js';

// cb: how far off the line the cornerbacks stand. lb / s: [yards past the line, z].
export const LOOKS = {
  box:   { name: 'Stacked box', tip: 'Loaded up to stop the run.',            cb: 5,   lb: [3, -1],     s: [4, 3] },
  blitz: { name: 'Blitz',       tip: 'Extra rushers are coming.',             cb: 1.8, lb: [1.6, -3.6], s: [8, 1] },
  man:   { name: 'Man press',   tip: 'Tight on your receivers.',              cb: 1.8, lb: [4.5, 0],    s: [12, 0] },
  zone:  { name: 'Deep zone',   tip: 'Dropping back to guard the deep ball.', cb: 8,   lb: [6, 0],      s: [17, 0] },
};

export const DISGUISE_RATE = 0.28; // how often the shown look is a bluff

// Chooses the real call for this down and the look shown to the player.
export function pickDefense(G) {
  let w = { box: 25, blitz: 25, man: 25, zone: 25 };
  if (G.toGo >= 8 && G.down >= 3) w = { box: 8, blitz: 30, man: 22, zone: 40 };
  else if (G.toGo <= 2) w = { box: 45, blitz: 25, man: 20, zone: 10 };
  if (G.ballOn >= 88) { w.zone = 2; w.man += 15; }
  if (G.clock < 50) { w.zone += 20; w.box = Math.max(4, w.box - 15); }
  const keys = Object.keys(w);
  let r = rand() * keys.reduce((a, k) => a + w[k], 0);
  let def = keys[0];
  for (const k of keys) { if ((r -= w[k]) < 0) { def = k; break; } }
  let shown = def;
  if (rand() < DISGUISE_RATE) { const others = keys.filter((k) => k !== def); shown = others[(rand() * others.length) | 0]; }
  return { def, shown };
}
