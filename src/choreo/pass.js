// Shared machinery for passing plays. Pure: no DOM, no three.js.
//
// A pass play script calls passPlay(c, o, spec). spec fields:
//   tThrow      seconds after the snap the ball leaves the quarterback's hand
//   drop        how deep the quarterback sets up, in yards behind the line
//   target      id of the intended receiver
//   typical     yards to aim for when the pass is not completed
//   routes(c, sg)             keyframes for every route, the target's included
//   catchPoint(c, yards, sg)  [x, z] where the ball arrives
//   steer(cz, tCatch)         optional: adjust catch z once the catch time is known
//   endZ(c, info)             optional: where the runner ends up across the field
//   tackler(c, o, info)       optional: who makes the tackle
//   quick                     optional: a throw too fast for the safety to jump
// sg is -1 when the target is on the left, +1 otherwise.
import { PI, clamp } from '../core/math.js';
import { rand } from '../core/random.js';

function passProtection(c) {
  ['ol0', 'ol1', 'ol2'].forEach((id, i) => { c.K(id, 0.5, c.x0 - 1.7, (i - 1) * 2.1); c.F(id, 0.3, 99, 'shove'); });
  ['dl0', 'dl1', 'dl2'].forEach((id, i) => { c.K(id, 0.55, c.x0 - 0.8, (i - 1) * 2.1); c.F(id, 0.5, 99, 'shove'); });
}

function cover(c, cb, wr, lag, until) {
  const sg = wr === 'wrL' ? -1 : 1;
  if (c.zone) { c.K(cb, 1.4, Math.min(57, c.x0 + 15), sg * 9.5); c.F(cb, 0, 1.3, 'face', -PI / 2); return; }
  for (let t = 0.3; t <= until + 0.01; t += 0.3) { const p = c.at(wr, Math.max(0, t - lag)); c.K(cb, t, Math.min(58, p[0] + 1.1), p[1] - sg * 0.7); }
}

export function passPlay(c, o, spec) {
  const { x0 } = c, tgt = spec.target, sg = tgt === 'wrL' ? -1 : 1, tT = spec.tThrow;
  passProtection(c);
  spec.routes(c, sg);
  c.K('qb', 0.9, x0 - spec.drop, 0); c.F('qb', 0, 99, 'face', PI / 2);

  const yards = o.kind === 'complete' ? o.yards : spec.typical;
  let [cx, cz] = spec.catchPoint(c, yards, sg);
  cx = Math.min(cx, 58.5);
  const flight = Math.max(0.42, Math.hypot(cx - (x0 - spec.drop), cz) / 26), tC = tT + flight;
  if (spec.steer) cz = spec.steer(cz, tC);
  c.K(tgt, tC, cx, cz); c.F(tgt, tC - 0.35, tC, 'reach');

  // rushers and coverage
  if (c.def === 'blitz') { c.K('lb', 1.5, x0 - 4.6, -1.2); c.F('lb', 1.5, 99, 'shove'); c.K('s', 1.2, x0 + 5, 0); }
  else { c.K('lb', 1.1, x0 + 5, c.zone ? cz * 0.5 : cz * 0.25); c.K('s', 1.4, Math.min(58, x0 + (c.zone ? 19 : 13)), cz * 0.3); }
  const lag = o.kind === 'complete' ? 0.42 : 0.12;
  cover(c, 'cbL', 'wrL', tgt === 'wrL' ? lag : 0.3, 3.2);
  cover(c, 'cbR', 'wrR', tgt === 'wrR' ? lag : 0.3, 3.2);

  if (o.kind === 'sack') {
    const tS = Math.min(tT - 0.12, 1.25 + rand() * 0.7), who = c.def === 'blitz' ? 'lb' : 'dl2', qx = x0 + o.yards;
    c.K('qb', tS, qx, 0.3);
    c.go(who, Math.max(0.2, tS - 0.75), tS, qx + 0.5, 0.4);
    c.dropFlags(who, (f) => f[2] !== 'shove' || f[0] < 0.1);
    c.F(who, tS, 99, 'down'); c.F('qb', tS, 99, 'down');
    c.ball({ t0: 0.24, t1: 99, held: 'qb' });
    c.tEnd = tS + 0.1; c.endX = qx; c.endZ = 0.3; c.carrier = null; c.tLive = 1.2;
    return;
  }

  c.F('qb', 0.3, tT - 0.2, 'ready'); c.F('qb', tT - 0.18, tT + 0.18, 'pass', tT);
  c.ball({ t0: 0.24, t1: tT, held: 'qb' });
  const cb = tgt === 'wrL' ? 'cbL' : tgt === 'wrR' ? 'cbR' : 'lb', arc = 1 + flight * 2.6;
  c.tLive = tC;

  if (o.kind === 'complete') {
    c.ball({ t0: tT, t1: tC, fly: tgt, h: arc }); c.ball({ t0: tC, t1: 99, held: tgt });
    c.F(tgt, tC, 99, 'carry'); c.carrier = tgt;
    const info = { cx, cz, sg, cb, yac: Math.max(0, c.endX - cx) };
    c.endZ = clamp(spec.endZ ? spec.endZ(c, info) : cz + (rand() - 0.5) * info.yac * 0.5, -24, 24);
    c.tEnd = tC + Math.max(0.22, Math.hypot(c.endX - cx, c.endZ - cz) / 7.6);
    c.K(tgt, c.tEnd, c.endX, c.endZ);
    c.tackler = spec.tackler ? spec.tackler(c, o, info) : (o.yards - (cx - x0) > 9 ? 's' : cb);
  } else if (o.kind === 'int') {
    const thief = c.zone && !spec.quick ? 's' : cb;
    c.go(thief, Math.max(0.3, tC - 0.9), tC, cx - 0.4, cz);
    c.F(thief, tC - 0.3, tC, 'reach'); c.F(thief, tC, 99, 'carry');
    c.ball({ t0: tT, t1: tC, fly: thief, h: arc }); c.ball({ t0: tC, t1: 99, held: thief });
    c.K(thief, tC + 0.9, cx - 6, cz * 0.8); c.K(tgt, tC + 0.9, cx - 5.2, cz * 0.8 + 0.4);
    c.F(tgt, tC + 0.9, 99, 'down'); c.F(thief, tC + 0.95, 99, 'down');
    c.tEnd = tC + 0.9; c.endX = cx - 6; c.endZ = cz * 0.8; c.carrier = null;
  } else {
    const over = rand() > 0.45; // overthrown, or broken up by the defender
    c.go(cb, Math.max(0.3, tC - 0.6), tC, cx + (over ? 1.2 : 0.3), cz + (over ? 0.6 : 0.2));
    if (!over) c.F(cb, tC - 0.3, tC + 0.1, 'reach');
    const gx = cx + (over ? 3.2 : 1), gz = cz + (over ? 1.5 : -1.2) * sg;
    c.ball({ t0: tT, t1: tC + 0.18, ground: [gx, gz], h: arc + (over ? 0.8 : 0) }); c.ball({ t0: tC + 0.18, t1: 99, rest: [gx + 0.8, gz + 0.3] });
    c.K(tgt, tC + 0.5, cx + 2, cz);
    c.tEnd = tC + 0.35; c.endX = gx; c.endZ = gz; c.carrier = null;
  }
}
