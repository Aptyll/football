// Drive state: downs, distance, clock, score, and how the drive ends.
// Pure: no DOM, no three.js.
import { LOOKS } from './looks.js';

export const START = { ballOn: 25, down: 1, toGo: 10, clock: 150, us: 16, them: 20, plays: 0 };
export const SECONDS = { play: 16, sack: 18, incomplete: 6, score: 6 };

export function newDrive(G = {}) { return Object.assign(G, START); }

export const spotName = (ballOn) => (ballOn === 50 ? 'midfield' : ballOn < 50 ? 'own ' + ballOn : 'Bison ' + (100 - ballOn));
export const clockText = (s) => { const m = Math.max(0, Math.ceil(s)); return ((m / 60) | 0) + ':' + String(m % 60).padStart(2, '0'); };
export const isGoalToGo = (G) => G.ballOn + G.toGo >= 100;

// Applies an outcome to G. Returns the text for the result banner, and `over`
// ([eyebrow, headline, detail]) when the drive has ended.
export function applyOutcome(G, o) {
  const disguised = G.def !== G.shown;
  const why = 'Defense ran ' + LOOKS[G.def].name.toLowerCase() + (disguised ? '. They disguised it.' : '.');
  let big, sub = '', bad = false, used = SECONDS.play, over = null;

  if (o.kind === 'int') {
    big = 'Intercepted'; bad = true;
    over = ['Drive over', 'Picked off', 'The Bison take over and run out the clock.'];
  } else if (o.kind === 'incomplete') {
    big = 'Incomplete'; bad = true; used = SECONDS.incomplete;
  } else {
    const y = o.yards;
    G.ballOn += y;
    if (o.kind === 'sack') { big = 'Sacked'; sub = 'Loss of ' + -y; bad = true; used = SECONDS.sack; }
    else { big = y > 0 ? '+' + y + ' yards' : y === 0 ? 'No gain' : 'Loss of ' + -y; bad = y <= 0; }
    if (o.td) {
      big = 'Touchdown!'; sub = ''; bad = false; used = SECONDS.score; G.us += 6;
      over = ['Final', 'Comets win ' + G.us + '-' + G.them, 'You scored in ' + G.plays + (G.plays === 1 ? ' play' : ' plays') + ' with ' + clockText(Math.max(0, G.clock - used)) + ' left.'];
    } else if (y >= G.toGo) {
      sub = 'First down'; G.down = 1; G.toGo = Math.min(10, 100 - G.ballOn); G.clock -= used;
      if (G.clock <= 0) { G.clock = 0; over = ['Final', 'Out of time', 'The clock hit zero at the ' + spotName(G.ballOn) + '. Bison win ' + G.them + '-' + G.us + '.']; }
      return { big, sub, why, bad: false, over };
    }
  }
  G.clock -= used;
  if (!o.td && o.kind !== 'int') {
    G.toGo -= o.yards; G.down++;
    if (G.down > 4) { G.down = 4; over = ['Drive over', 'Turnover on downs', 'You came up short on 4th down at the ' + spotName(G.ballOn) + '.']; }
  }
  if (!over && G.clock <= 0) { G.clock = 0; over = ['Final', 'Out of time', 'The clock hit zero at the ' + spotName(G.ballOn) + '. Bison win ' + G.them + '-' + G.us + '.']; }
  return { big, sub, why, bad, over };
}
