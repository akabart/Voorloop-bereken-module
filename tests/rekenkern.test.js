// Draai met: node tests/rekenkern.test.js
const assert = require('assert');
const R = require('../plugin/polderbanden-voorloop/assets/rekenkern.js');
const T = require('./testgevallen.json');
let n = 0;
const dicht = (a, b, tol, naam) => { assert.ok(Math.abs(a - b) <= tol, `${naam}: ${a} != ${b}`); n++; };
for (const g of T.voorloop) {
  const v = R.voorloop(g.i, g.voor, g.achter);
  if (g.verwacht === null) { assert.strictEqual(v, null, g.naam); n++; } else dicht(v, g.verwacht, 0.001, g.naam);
}
for (const g of T.componenten) dicht(R.uitComponenten(g.i_eind, g.i_diff, g.i_vooras, g.i_tussenbak), g.verwacht, 1e-5, g.naam);
for (const g of T.fendt) dicht(R.uitFendt(g.va_ha), g.verwacht, 1e-5, 'fendt ' + g.va_ha);
for (const g of T.ideaal) dicht(R.idealeVoor(g.i, g.achter, g.doel), g.verwacht_voor, 0.1, g.naam);
for (const g of T.zones) { assert.strictEqual(R.zone(g.v), g.verwacht, 'zone ' + g.v); n++; }
assert.strictEqual(R.getal('1,3208'), 1.3208); assert.strictEqual(R.getal('abc'), null); assert.strictEqual(R.getal(' 4 252 '), 4252); n += 3;
for (const [in_, uit] of T.banden.normaliseer) { assert.strictEqual(R.normaliseerMaat(in_), uit, 'maat ' + in_); n++; }
for (const g of T.banden.plausibel) {
  const p = R.bandPlausibel(g.maat, g.rc);
  assert.strictEqual(p.oordeel, g.oordeel, `plausibel ${g.maat} ${g.rc}`); assert.strictEqual(p.factor, g.factor, `factor ${g.maat} ${g.rc}`); n += 2;
}
console.log(`rekenkern.js: ${n} controles geslaagd`);
