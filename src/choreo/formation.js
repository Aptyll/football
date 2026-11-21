// Where everyone lines up before the snap. Pure: no DOM, no three.js.
import { OFF, DEF, SPLIT, yardToX } from '../core/field.js';
import { LOOKS } from '../rules/looks.js';

// [yards from the line of scrimmage, z]
export const OFFENSE = { ol0: [-0.7, -1.9], ol1: [-0.7, 0], ol2: [-0.7, 1.9], qb: [-5, 0], rb: [-5, 2.3], wrL: [-0.7, -SPLIT], wrR: [-0.7, SPLIT] };

// Returns { id: [x, z] } for all 14 players, with the defense in the given look.
export function formation(look, ballOn) {
  const x0 = yardToX(ballOn), L = LOOKS[look], f = {};
  OFF.forEach((id) => { f[id] = [x0 + OFFENSE[id][0], OFFENSE[id][1]]; });
  f.dl0 = [x0 + 1, -1.9]; f.dl1 = [x0 + 1, 0]; f.dl2 = [x0 + 1, 1.9];
  f.lb = [x0 + L.lb[0], L.lb[1]];
  f.cbL = [x0 + L.cb, -SPLIT]; f.cbR = [x0 + L.cb, SPLIT];
  f.s = [x0 + L.s[0], L.s[1]];
  DEF.forEach((id) => { f[id][0] = Math.min(f[id][0], 58); });
  return f;
}
