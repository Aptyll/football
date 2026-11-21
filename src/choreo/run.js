// Shared setup for running plays. Pure: no DOM, no three.js.
import { PI } from '../core/math.js';
import { SPLIT } from '../core/field.js';

// The back carries the ball; receivers block the cornerbacks downfield.
export function runSetup(c) {
  c.carrier = 'rb';
  c.F('rb', 0.6, 99, 'carry');
  c.F('qb', 0, 0.7, 'face', PI / 2);
  ['wrL', 'wrR'].forEach((w) => {
    const sg = w === 'wrL' ? -1 : 1, cb = sg < 0 ? 'cbL' : 'cbR';
    c.K(w, 1, c.x0 + 3.5, sg * SPLIT); c.F(w, 1, 99, 'shove');
    c.K(cb, 1, c.x0 + 4.6, sg * SPLIT); c.F(cb, 1, 2.2, 'shove');
  });
  c.tLive = 0.7;
}
