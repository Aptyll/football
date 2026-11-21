// Turns a called play and its outcome into a full timeline. Pure: no DOM, no three.js.
import { PI } from '../core/math.js';
import { OFF, DEF } from '../core/field.js';
import { createContext } from './context.js';

// Ends the play: the ball carrier is tackled, or scores and celebrates.
function finish(c, o) {
  const carrier = c.carrier;
  if (!carrier) return;
  if (o.td) {
    c.K(carrier, c.tEnd + 0.55, Math.max(c.endX + 3, 53.5), c.endZ);
    c.F(carrier, c.tEnd + 0.6, 99, 'cheer'); c.F(carrier, c.tEnd + 0.6, 99, 'face', -PI / 2);
    OFF.forEach((id) => { if (id !== carrier) c.F(id, c.tEnd + 0.7, 99, 'cheer'); });
    DEF.forEach((id, i) => c.go(id, Math.min(c.tLive, c.tEnd - 0.2), c.tEnd + 0.3, Math.min(c.endX, 49) - 1.5 - i * 1.1, c.endZ + (i - 3) * 1.6));
    c.tEnd += 0.6;
    return;
  }
  let tackler = c.tackler;
  if (!tackler || tackler === carrier) tackler = 'lb';
  DEF.forEach((id, i) => {
    if (id === tackler) return;
    if (/^dl/.test(id) && o.yards > 4) return; // linemen do not chase long gains
    c.go(id, Math.min(c.tLive, c.tEnd - 0.2), c.tEnd + 0.25, c.endX + 1.2 + ((i * 37) % 5) * 0.5, c.endZ + (i - 3) * 1.3);
  });
  c.go(tackler, Math.max(0, Math.min(c.tLive, c.tEnd - 0.5)), c.tEnd, c.endX + 0.55, c.endZ + 0.25);
  c.dropFlags(tackler, (f) => f[2] !== 'shove' || f[1] < c.tEnd - 0.4);
  c.F(carrier, c.tEnd, 99, 'down'); c.F(tackler, c.tEnd, 99, 'down');
}

// play: an entry from src/plays. o: the outcome from rules/resolve.
// G: drive state. form: the formation everyone is standing in.
export function buildPlay(play, o, G, form) {
  const c = createContext(G, form);
  c.endX = c.x0 + o.yards;
  play.script(c, o);
  finish(c, o);
  return { A: c.A, bseg: c.bseg, tEnd: c.tEnd, endX: c.endX, endZ: c.endZ, carrier: c.carrier, o, key: play.key };
}
