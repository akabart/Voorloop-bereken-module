/*
 * Rekenkern voor de voorloop. Moet exact overeenkomen met includes/class-pbv-reken.php
 * (beide worden getest met tests/testgevallen.json).
 *
 * i          = omwentelingen voorwiel per omwenteling achterwiel (> 1)
 * voorloop % = (i × U_voor / U_achter − 1) × 100
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PBVReken = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ZONES = { min: 0, groen_min: 1, opt_min: 1.5, doel: 2.5, opt_max: 3.5, groen_max: 5, max: 6 };

  function voorloop(i, uVoor, uAchter) {
    i = Number(i); uVoor = Number(uVoor); uAchter = Number(uAchter);
    if (!(i > 0) || !(uVoor > 0) || !(uAchter > 0)) return null;
    return (i * uVoor / uAchter - 1) * 100;
  }

  function idealeVoor(i, uAchter, doel) {
    return i > 0 ? uAchter * (1 + doel / 100) / i : null;
  }

  function idealeAchter(i, uVoor, doel) {
    return doel > -100 ? uVoor * i / (1 + doel / 100) : null;
  }

  function uitComponenten(iEind, iDiff, iVooras, iTussenbak) {
    var noemer = Number(iVooras) * Number(iTussenbak);
    return noemer > 0 ? Number(iEind) * Number(iDiff) / noemer : null;
  }

  function uitFendt(vaHa) {
    return Number(vaHa) > 0 ? 1 / Number(vaHa) : null;
  }

  function uitMeting(omwVoor, omwAchter) {
    return Number(omwAchter) > 0 ? Number(omwVoor) / Number(omwAchter) : null;
  }

  function zone(v, zones) {
    var z = Object.assign({}, ZONES, zones || {});
    if (v === null || v === undefined || isNaN(v)) return null;
    if (v < z.min || v > z.max) return 'rood';
    if (v < z.groen_min || v > z.groen_max) return 'oranje';
    if (v >= z.opt_min && v <= z.opt_max) return 'optimaal';
    return 'groen';
  }

  /** Leest een getal in met komma of punt als decimaalteken. */
  function getal(s) {
    if (typeof s === 'number') return isFinite(s) ? s : null;
    if (s === null || s === undefined) return null;
    var t = String(s).trim().replace(/\s/g, '').replace(',', '.');
    if (t === '' || !/^-?\d*\.?\d+$/.test(t)) return null;
    return parseFloat(t);
  }

  /* ---- Bandmaten (zelfde regels als tools/banden/bandmaat.py) ---- */
  var PLAUSIBEL_MIN = 0.91, PLAUSIBEL_MAX = 1.02, INCH_MIN = 0.75, INCH_MAX = 1.0;
  var METRISCH = /^(VF|IF|CFO|CHO)?\s*(\d{2,3})\/(\d{2})\s*(-|R|B|D)?\s*(\d{2}(?:\.\d)?)$/i;
  var INCH = /^(VF|IF)?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(-|R)\s*(\d{2}(?:\.\d)?)$/i;
  var SLASH = /^(\d{1,2}(?:\.\d{1,2})?)\/(\d{2})\s*(-|R)\s*(\d{2}(?:\.\d)?)$/i;

  /** '650/65R38' -> '650/65 R38', '18.4R38' -> '18.4 R38', '18.4-38' blijft (diagonaal). */
  function normaliseerMaat(maat) {
    var s = String(maat || '').trim().toUpperCase().replace(/,/g, '.').replace(/\s+/g, ' ').replace(/\*+$/, '').trim();
    var m = s.match(METRISCH);
    if (m) {
      var sep = (m[4] || 'R').toUpperCase();
      return (m[1] || '') + m[2] + '/' + m[3] + (sep === '-' ? '-' : ' ' + sep) + m[5];
    }
    m = s.match(INCH);
    if (m) return (m[1] || '') + m[2] + (m[3].toUpperCase() === 'R' ? ' R' : '-') + m[4];
    m = s.match(SLASH);
    if (m) return m[1] + '/' + m[2] + (m[3].toUpperCase() === 'R' ? ' R' : '-') + m[4];
    return s;
  }

  /** [min, max] theoretische buitendiameter in mm, of null als de maat niet herkend wordt. */
  function diameterbereik(maat) {
    var s = normaliseerMaat(maat), m, d;
    if ((m = s.match(METRISCH))) { d = parseFloat(m[5]) * 25.4 + 2 * m[2] * m[3] / 100; return [d, d]; }
    if ((m = s.match(SLASH))) { d = parseFloat(m[4]) * 25.4 + 2 * parseFloat(m[1]) * 25.4 * m[2] / 100; return [d, d]; }
    if ((m = s.match(INCH))) {
      var velg = parseFloat(m[4]) * 25.4, b = parseFloat(m[2]) * 25.4;
      return [velg + 2 * INCH_MIN * b, velg + 2 * INCH_MAX * b];
    }
    return null;
  }

  /** Past de afrolomtrek bij de maat? { oordeel: 'ok' | 'twijfel' | 'onbekend', factor }. */
  function bandPlausibel(maat, afrolomtrek) {
    var r = diameterbereik(maat);
    if (!r || !afrolomtrek) return { oordeel: 'onbekend', factor: null };
    var ok = afrolomtrek >= PLAUSIBEL_MIN * Math.PI * r[0] && afrolomtrek <= PLAUSIBEL_MAX * Math.PI * r[1];
    return { oordeel: ok ? 'ok' : 'twijfel', factor: Math.round(afrolomtrek / (Math.PI * (r[0] + r[1]) / 2) * 1000) / 1000 };
  }

  return {
    ZONES: ZONES,
    voorloop: voorloop,
    idealeVoor: idealeVoor,
    idealeAchter: idealeAchter,
    uitComponenten: uitComponenten,
    uitFendt: uitFendt,
    uitMeting: uitMeting,
    zone: zone,
    getal: getal,
    normaliseerMaat: normaliseerMaat,
    diameterbereik: diameterbereik,
    bandPlausibel: bandPlausibel
  };
});
