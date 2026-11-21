// Field geometry and roster ids. Pure: no DOM, no three.js.
//
// World units are yards. The field runs along x: goal lines at x = -50 and +50,
// end zones out to +-60. z is across the field, -26.65..26.65, and +z is the
// offense's right. The offense always drives toward +x.
// "ballOn" is the yard line counted from the offense's own goal line (0..100).

export const HALF_WIDTH = 26.65;
export const GOAL_X = 50;
export const END_X = 60;
export const HASH_Z = 3.1;
export const SPLIT = 9.5; // how wide the receivers and cornerbacks line up

export const yardToX = (ballOn) => ballOn - 50;

export const OFF = ['ol0', 'ol1', 'ol2', 'qb', 'rb', 'wrL', 'wrR'];
export const DEF = ['dl0', 'dl1', 'dl2', 'lb', 'cbL', 'cbR', 's'];
export const IDS = OFF.concat(DEF);
export const teamOf = (id) => (OFF.includes(id) ? 0 : 1);
export const NUMBERS = { ol0: 62, ol1: 55, ol2: 71, qb: 12, rb: 28, wrL: 81, wrR: 19, dl0: 93, dl1: 97, dl2: 90, lb: 52, cbL: 21, cbR: 24, s: 33 };
