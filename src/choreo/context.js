// The scripting context handed to every play script. Pure: no DOM, no three.js.
//
// Time is seconds from the snap (t = 0). A play script moves players by adding
// keyframes, sets pose flags over time ranges, and appends ball segments.
import { IDS, yardToX } from '../core/field.js';
import { posAt } from './timeline.js';

export function createContext(G, form) {
  const A = {};
  IDS.forEach((id) => { A[id] = { kf: [[-9, form[id][0], form[id][1]], [0, form[id][0], form[id][1]]], fl: [] }; });

  const c = {
    x0: yardToX(G.ballOn), // line of scrimmage
    def: G.def,            // what the defense is really running
    zone: G.def === 'zone',
    A,                     // per-player { kf, fl }
    bseg: [],              // ball segments, in time order
    // Results the script fills in; finish() and the game read them.
    tEnd: 1, endX: 0, endZ: 0, carrier: null, tackler: null, tLive: 0.5,

    // K: player is at (x, z) at time t. Later keyframes at or after t are replaced.
    K(id, t, x, z) { const kf = A[id].kf; while (kf.length > 1 && kf[kf.length - 1][0] >= t - 1e-3) kf.pop(); kf.push([t, x, z]); },
    // go: from wherever the player is at t0, head to (x, z) by t1, dropping later plans.
    go(id, t0, t1, x, z) { const p = posAt(A[id].kf, t0); c.K(id, t0, p[0], p[1]); c.K(id, Math.max(t1, t0 + 0.05), x, z); },
    // F: pose flag `name` is on from t0 until t1.
    F(id, t0, t1, name, value) { A[id].fl.push([t0, t1, name, value === undefined ? 1 : value]); },
    at(id, t) { return posAt(A[id].kf, t); },
    dropFlags(id, keep) { A[id].fl = A[id].fl.filter(keep); },
    // Ball segment: { t0, t1, held: id } | { fly: id, h } | { ground: [x, z], h } | { rest: [x, z] }
    ball(seg) { c.bseg.push(seg); },
  };

  ['ol0', 'ol1', 'ol2', 'dl0', 'dl1', 'dl2'].forEach((id) => c.F(id, -9, 0, 'stance'));
  c.F('qb', -9, 0.1, 'ready');
  c.ball({ t0: -9, t1: 0, held: 'ol1' });
  c.ball({ t0: 0, t1: 0.24, fly: 'qb', h: 0.35 }); // the snap
  return c;
}
