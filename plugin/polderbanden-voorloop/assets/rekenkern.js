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

  return {
    ZONES: ZONES,
    voorloop: voorloop,
    idealeVoor: idealeVoor,
    idealeAchter: idealeAchter,
    uitComponenten: uitComponenten,
    uitFendt: uitFendt,
    uitMeting: uitMeting,
    zone: zone,
    getal: getal
  };
});
