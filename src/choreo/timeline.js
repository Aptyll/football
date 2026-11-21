// Timeline evaluation. Pure: no DOM, no three.js.
// A keyframe list is [[t, x, z], ...] sorted by t. A flag is [t0, t1, name, value].
import { lerp, clamp } from '../core/math.js';

export function posAt(kf, t) {
  if (t <= kf[0][0]) return [kf[0][1], kf[0][2]];
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) {
      const a = kf[i - 1], b = kf[i], k = (t - a[0]) / Math.max(1e-4, b[0] - a[0]);
      return [lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    }
  }
  const l = kf[kf.length - 1];
  return [l[1], l[2]];
}

// Pose flags active at time t. See src/actors/pose.js for what each one does.
export function flagsAt(actor, t) {
  const o = {};
  for (const f of actor.fl) {
    if (t < f[0] || t >= f[1]) continue;
    if (f[2] === 'pass') o.pass = clamp(1 - Math.abs(t - f[3]) / 0.18, 0, 1);
    else if (f[2] === 'reach') o.reach = clamp((t - f[0]) / 0.25, 0, 1);
    else if (f[2] === 'face') o.face = f[3];
    else o[f[2]] = true;
  }
  return o;
}
