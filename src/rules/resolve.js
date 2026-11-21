// Decides what happens on a play. Pure: no DOM, no three.js.
// The outcome is fixed here, at the snap; src/choreo then animates it.
import { rand, gauss } from '../core/random.js';

// play.table[def] is
//   run:  [mean yards, spread, breakaway chance]
//   pass: [completion, mean yards, spread, sack chance, interception chance]
// Returns { kind: 'run'|'complete'|'incomplete'|'sack'|'int', yards, td? }.
export function resolve(play, def, ballOn) {
  const t = play.table[def], room = 100 - ballOn;
  let o;
  if (play.kind === 'run') {
    let y = Math.round(t[0] + gauss() * t[1]);
    if (rand() < t[2]) y += 12 + Math.round(rand() * 24);
    o = { kind: 'run', yards: Math.max(-4, y) };
  } else if (rand() < t[3]) {
    o = { kind: 'sack', yards: -(5 + Math.round(rand() * 4)) };
  } else if (rand() < t[0]) {
    o = { kind: 'complete', yards: Math.max(play.minYards === undefined ? 1 : play.minYards, Math.round(t[1] + gauss() * t[2])) };
  } else if (rand() < t[4] / (1 - t[0])) {
    o = { kind: 'int', yards: 0 };
  } else {
    o = { kind: 'incomplete', yards: 0 };
  }
  if (o.yards >= room) { o.yards = room; o.td = true; }
  if (ballOn + o.yards < 1) o.yards = 1 - ballOn;
  return o;
}
