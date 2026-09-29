/* Polderbanden Voorloop – front-end (vanilla JavaScript, geen build-stap). */
(function () {
  'use strict';

  var R = window.PBVReken;
  var CFG = window.PBV_CONFIG || {};
  var root = document.getElementById('pbv-app');
  if (!root || !R) return;

  var S = {
    rol: null,
    boom: [],
    banden: [],
    inst: null,
    index: [],
    types: {},
    calc: null,
    reviewFilter: 'alle'
  };

  // ------------------------------------------------------------------
  // Hulpfuncties
  // ------------------------------------------------------------------

  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = !!v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) voegToe(el, arguments[i]);
    return el;
  }
  function voegToe(el, kind) {
    if (kind === null || kind === undefined || kind === false) return;
    if (Array.isArray(kind)) { kind.forEach(function (k) { voegToe(el, k); }); return; }
    el.appendChild(typeof kind === 'string' || typeof kind === 'number' ? document.createTextNode(String(kind)) : kind);
  }
  function leeg(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

  function fmt(n, d) {
    if (n === null || n === undefined || isNaN(n)) return '–';
    return Number(n).toLocaleString('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtI(n) { return fmt(n, 4); }
  function fmtMm(n) { return n === null || isNaN(n) ? '–' : Math.round(n).toLocaleString('nl-NL') + ' mm'; }
  function fmtProc(n) { return n === null || isNaN(n) ? '–' : (n > 0 ? '+' : '') + fmt(n, 2) + ' %'; }
  function datum(s) {
    if (!s) return '';
    var d = new Date(s.replace(' ', 'T'));
    return isNaN(d) ? s : d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function norm(s) { return String(s || '').toLowerCase().replace(/[^0-9a-z]/g, ''); }
  function zoneNaam(z) {
    return { rood: 'Niet toegestaan', oranje: 'Afwijkend', groen: 'Goed', optimaal: 'Optimaal' }[z] || '';
  }

  function api(methode, pad, data) {
    var opties = { method: methode, credentials: 'same-origin', headers: { 'Accept': 'application/json' } };
    if (CFG.nonce) opties.headers['X-WP-Nonce'] = CFG.nonce;
    if (data !== undefined) {
      opties.headers['Content-Type'] = 'application/json';
      opties.body = JSON.stringify(data);
    }
    return fetch(CFG.rest + pad, opties).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) {
          var e = new Error((j && j.message) || 'Er ging iets mis (' + r.status + ').');
          e.status = r.status;
          throw e;
        }
        return j;
      });
    });
  }

  function melding(tekst, soort) {
    return h('div', { class: 'pbv-melding' + (soort ? ' pbv-' + soort : '') }, tekst);
  }

  function isBeheer() { return S.rol === 'beheerder'; }

  function zonesVoor(merkId) {
    var per = S.inst.zones_per_merk || {};
    return (merkId && per[merkId]) ? per[merkId] : S.inst.zones;
  }

  // ------------------------------------------------------------------
  // Zoekindex en slim zoeken
  // ------------------------------------------------------------------

  var AFKORTINGEN = { jd: 'johndeere', nh: 'newholland', mf: 'masseyferguson', df: 'deutzfahr', cih: 'caseih', ih: 'caseih' };

  function bouwIndex() {
    S.index = [];
    S.boom.forEach(function (m) {
      m.series.forEach(function (s) {
        s.types.forEach(function (t) {
          var woorden = String(t.naam).toLowerCase().split(/[^0-9a-z]+/).filter(Boolean);
          S.index.push({
            id: t.id, naam: t.naam, merk: m.naam, merkId: m.id, serie: s.naam, serieId: s.id,
            n: t.n, twijfel: t.twijfel, chassis: t.chassis || [],
            tNorm: norm(t.naam),
            woorden: woorden,
            getallen: String(t.naam).match(/\d+/g) || [],
            aliassen: (t.aliassen || []).map(norm),
            merkNorm: norm(m.naam), serieNorm: norm(s.naam),
            chassisNorm: (t.chassis || []).map(norm)
          });
        });
      });
    });
  }

  function afstand1(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    var i = 0, j = 0, verschil = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++verschil > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return verschil + (a.length - i) + (b.length - j) <= 1;
  }

  /** Geeft gesorteerde treffers: typenummer eerst, dan begint-met, bevat, chassisnummer, bijna-treffers. */
  function zoek(q) {
    var tokens = String(q).toLowerCase().split(/\s+/).map(function (t) { return AFKORTINGEN[norm(t)] || norm(t); }).filter(Boolean);
    if (!tokens.length) return [];
    var geheel = norm(q);
    var uit = [];
    S.index.forEach(function (e) {
      var score = 0, chassisTreffer = null;
      for (var k = 0; k < tokens.length; k++) {
        var t = tokens[k], s = 0;
        if (e.getallen.indexOf(t) >= 0 || e.woorden.indexOf(t) >= 0) s = 100;
        else if (e.tNorm.indexOf(t) === 0) s = 80;
        else if (e.aliassen.some(function (a) { return a === t; })) s = 75;
        else if (e.woorden.some(function (w) { return w.indexOf(t) > 0; })) s = 50;
        else if (e.aliassen.some(function (a) { return a.indexOf(t) >= 0; })) s = 45;
        else if (e.merkNorm.indexOf(t) === 0 || e.merkNorm === t) s = 30;
        else if (e.serieNorm.indexOf(t) >= 0) s = 25;
        else if (t.length >= 3 && e.chassisNorm.some(function (c) { return c.indexOf(t) === 0; })) {
          s = 15;
          chassisTreffer = e.chassis[e.chassisNorm.findIndex(function (c) { return c.indexOf(t) === 0; })];
        } else if (t.length >= 4 && e.woorden.some(function (w) { return afstand1(w, t); })) s = 10;
        if (!s) return;
        score += s;
      }
      if (geheel.length > 2 && (e.merkNorm + e.tNorm).indexOf(geheel) >= 0) score += 20;
      uit.push({ e: e, score: score, chassis: score < 30 * tokens.length ? chassisTreffer : null });
    });
    uit.sort(function (a, b) {
      return b.score - a.score || a.e.merk.localeCompare(b.e.merk) ||
        a.e.naam.localeCompare(b.e.naam, 'nl', { numeric: true });
    });
    return uit.slice(0, 40);
  }

  // ------------------------------------------------------------------
  // Opbouw: inlog, kopregel, router
  // ------------------------------------------------------------------

  var hoofd, zoekveld, zoekResultaten, navEl;

  function start() {
    api('GET', '/sessie').then(function (s) {
      if (!s.rol) return toonInlog(s.ingesteld);
      return laadStart();
    }).catch(function (e) {
      leeg(root).appendChild(melding(e.message, 'fout'));
    });
  }

  function laadStart() {
    leeg(root).appendChild(h('div', { class: 'pbv-laden' }, 'Gegevens laden…'));
    return api('GET', '/start').then(function (d) {
      S.rol = d.rol; S.boom = d.boom; S.banden = d.banden; S.inst = d.instellingen;
      bouwIndex();
      bouwShell();
      window.addEventListener('hashchange', route);
      route();
    });
  }

  function toonInlog(ingesteld) {
    var ww = h('input', { type: 'password', id: 'pbv-ww', autocomplete: 'current-password', autofocus: true });
    var fout = h('div');
    var form = h('form', {
      class: 'pbv-inlog pbv-blok', onsubmit: function (ev) {
        ev.preventDefault();
        leeg(fout);
        api('POST', '/sessie', { wachtwoord: ww.value }).then(laadStart).catch(function (e) {
          fout.appendChild(melding(e.message, 'fout'));
        });
      }
    },
      h('h2', {}, 'Voorloop'),
      ingesteld === false ? melding('Er is nog geen wachtwoord ingesteld. Dat kan in WordPress via Instellingen → Voorloop-module.') : null,
      h('div', { class: 'pbv-veld' }, h('label', { for: 'pbv-ww' }, 'Wachtwoord'), ww),
      fout,
      h('button', { type: 'submit' }, 'Inloggen')
    );
    leeg(root).appendChild(form);
    ww.focus();
  }

  function bouwShell() {
    zoekveld = h('input', { type: 'search', placeholder: 'Zoek een trekker, bijv. 724, T7.270 of JD 6155R', 'aria-label': 'Zoeken', autocomplete: 'off' });
    zoekResultaten = h('div', { class: 'pbv-resultaten pbv-verborgen' });
    zoekveld.addEventListener('input', toonZoekresultaten);
    zoekveld.addEventListener('keydown', zoekToetsen);
    zoekveld.addEventListener('focus', toonZoekresultaten);
    document.addEventListener('click', function (ev) {
      if (!ev.target.closest || !ev.target.closest('.pbv-zoek')) zoekResultaten.classList.add('pbv-verborgen');
    });
    navEl = h('nav', { class: 'pbv-nav' });
    hoofd = h('main');
    leeg(root).appendChild(h('div', {},
      h('header', { class: 'pbv-kop' },
        h('div', { class: 'pbv-zoek' }, zoekveld, zoekResultaten),
        navEl
      ),
      hoofd
    ));
    vulNav();
  }

  function vulNav() {
    var hash = location.hash || '#/';
    var items = [['#/', 'Merken'], ['#/bereken', 'Losse berekening'], ['#/berekeningen', 'Opgeslagen']];
    if (isBeheer()) items.push(['#/beheer/review', 'Beheer']);
    leeg(navEl);
    items.forEach(function (it) {
      var actief = it[0] === '#/' ? /^#\/(merk|serie|type)?/.test(hash) && !/^#\/(bereken|beheer)/.test(hash) : hash.indexOf(it[0]) === 0;
      navEl.appendChild(h('a', { href: it[0], class: actief ? 'actief' : '' }, it[1]));
    });
    navEl.appendChild(h('a', {
      href: '#', onclick: function (ev) {
        ev.preventDefault();
        api('DELETE', '/sessie').then(function () { location.hash = ''; location.reload(); });
      }
    }, 'Uitloggen'));
  }

  var gekozenResultaat = -1;
  function toonZoekresultaten() {
    var q = zoekveld.value.trim();
    leeg(zoekResultaten);
    gekozenResultaat = -1;
    if (!q) { zoekResultaten.classList.add('pbv-verborgen'); return; }
    var treffers = zoek(q);
    zoekResultaten.classList.remove('pbv-verborgen');
    if (!treffers.length) { zoekResultaten.appendChild(h('div', { class: 'pbv-leeg' }, 'Niets gevonden voor "' + q + '".')); return; }
    var vorigeGroep = null;
    treffers.forEach(function (t) {
      var groep = t.chassis ? 'Op chassisnummer' : t.e.merk;
      if (groep !== vorigeGroep) { zoekResultaten.appendChild(h('div', { class: 'pbv-groep' }, groep)); vorigeGroep = groep; }
      zoekResultaten.appendChild(h('a', { href: '#/type/' + t.e.id, onclick: sluitZoeken },
        h('span', {}, (t.chassis ? t.e.merk + ' ' : '') + t.e.naam),
        h('span', { class: 'pbv-sub' }, t.chassis ? 'chassis ' + t.chassis + '…' : t.e.serie + ' · ' + t.e.n + (t.e.n === 1 ? ' uitvoering' : ' uitvoeringen'))
      ));
    });
  }
  function sluitZoeken() { zoekResultaten.classList.add('pbv-verborgen'); zoekveld.blur(); }
  function zoekToetsen(ev) {
    var links = zoekResultaten.querySelectorAll('a');
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (!links.length) return;
      gekozenResultaat = (gekozenResultaat + (ev.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach(function (l, i) { l.classList.toggle('actief', i === gekozenResultaat); });
      links[gekozenResultaat].scrollIntoView({ block: 'nearest' });
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      var l = links[gekozenResultaat >= 0 ? gekozenResultaat : 0];
      if (l) { location.hash = l.getAttribute('href'); sluitZoeken(); zoekveld.value = ''; }
    } else if (ev.key === 'Escape') {
      sluitZoeken();
    }
  }

  function route() {
    var hash = location.hash || '#/';
    var m;
    vulNav();
    leeg(hoofd);
    window.scrollTo(0, 0);
    if ((m = hash.match(/^#\/merk\/(\d+)/))) return paginaMerk(+m[1]);
    if ((m = hash.match(/^#\/serie\/(\d+)/))) return paginaSerie(+m[1]);
    if ((m = hash.match(/^#\/type\/(\d+)(?:\?u=(\d+))?/))) return paginaType(+m[1], m[2] ? +m[2] : null);
    if (hash.indexOf('#/bereken') === 0 && hash.indexOf('#/berekeningen') !== 0 && hash.indexOf('#/berekening/') !== 0) return paginaLosseBerekening();
    if ((m = hash.match(/^#\/berekening\/(\d+)/))) return paginaBerekening(+m[1]);
    if (hash.indexOf('#/berekeningen') === 0) return paginaBerekeningen();
    if ((m = hash.match(/^#\/beheer\/?(\w*)/))) return isBeheer() ? paginaBeheer(m[1] || 'review') : paginaMerken();
    return paginaMerken();
  }

  // ------------------------------------------------------------------
  // Bladeren
  // ------------------------------------------------------------------

  function vindMerk(id) { return S.boom.find(function (m) { return m.id === id; }); }
  function vindSerie(id) {
    for (var i = 0; i < S.boom.length; i++) {
      var s = S.boom[i].series.find(function (x) { return x.id === id; });
      if (s) return { merk: S.boom[i], serie: s };
    }
    return null;
  }
  function telTypes(m) { return m.series.reduce(function (n, s) { return n + s.types.length; }, 0); }

  function paginaMerken() {
    hoofd.appendChild(h('h1', {}, 'Merken'));
    hoofd.appendChild(h('div', { class: 'pbv-tegels' }, S.boom.map(function (m) {
      return h('a', { class: 'pbv-tegel', href: '#/merk/' + m.id },
        h('strong', {}, m.naam), h('span', {}, m.series.length + ' series · ' + telTypes(m) + ' types'));
    })));
    if (isBeheer()) hoofd.appendChild(h('p', { style: 'margin-top:1.5em' }, h('a', { class: 'pbv-knop pbv-licht', href: '#/beheer/nieuw' }, '+ Nieuwe trekker toevoegen')));
  }

  function paginaMerk(id) {
    var m = vindMerk(id);
    if (!m) return paginaMerken();
    hoofd.appendChild(h('div', { class: 'pbv-pad' }, h('a', { href: '#/' }, 'Merken'), ' › '));
    hoofd.appendChild(h('h1', {}, m.naam));
    hoofd.appendChild(h('div', { class: 'pbv-tegels' }, m.series.map(function (s) {
      return h('a', { class: 'pbv-tegel', href: '#/serie/' + s.id },
        h('strong', {}, s.naam), h('span', {}, s.types.length + ' types'));
    })));
  }

  function paginaSerie(id) {
    var r = vindSerie(id);
    if (!r) return paginaMerken();
    hoofd.appendChild(h('div', { class: 'pbv-pad' }, h('a', { href: '#/' }, 'Merken'), ' › ', h('a', { href: '#/merk/' + r.merk.id }, r.merk.naam), ' › '));
    hoofd.appendChild(h('h1', {}, r.serie.naam));
    var types = r.serie.types.slice().sort(function (a, b) { return a.naam.localeCompare(b.naam, 'nl', { numeric: true }); });
    hoofd.appendChild(h('ul', { class: 'pbv-lijst' }, types.map(function (t) {
      return h('li', {}, h('a', { href: '#/type/' + t.id }, t.naam,
        h('span', {}, t.n > 1 ? t.n + ' uitv.' : '', t.twijfel ? ' ·  controleren' : '')));
    })));
  }

  // ------------------------------------------------------------------
  // Typepagina met calculator
  // ------------------------------------------------------------------

  function laadType(id, vers) {
    if (!vers && S.types[id]) return Promise.resolve(S.types[id]);
    return api('GET', '/types/' + id).then(function (t) { S.types[id] = t; return t; });
  }

  function paginaType(id, uitvId) {
    hoofd.appendChild(h('div', { class: 'pbv-laden' }, 'Laden…'));
    laadType(id).then(function (t) {
      leeg(hoofd);
      var links = h('div'), rechts = h('div', { class: 'pbv-plakkend' });
      hoofd.appendChild(h('div', { class: 'pbv-pad' },
        h('a', { href: '#/' }, 'Merken'), ' › ', h('a', { href: '#/merk/' + t.merk_id }, t.merk), ' › ',
        h('a', { href: '#/serie/' + t.serie_id }, t.serie), ' › '));
      hoofd.appendChild(h('div', { class: 'pbv-uitv-kop' },
        h('h1', {}, t.merk + ' ' + t.naam),
        isBeheer() ? h('button', { class: 'pbv-licht pbv-klein', onclick: function () { typeFormulier(t, links); } }, 'Type bewerken') : null));
      if (t.aliassen && t.aliassen.length) hoofd.appendChild(h('p', { class: 'pbv-zacht' }, 'Ook bekend als: ' + t.aliassen.join(', ')));
      hoofd.appendChild(h('div', { class: 'pbv-twee' }, links, rechts));

      if (t.notities && t.notities.length) {
        links.appendChild(h('details', { class: 'pbv-blok pbv-vlak' },
          h('summary', {}, 'Aandachtspunten (' + t.notities.length + ')'),
          h('ul', { class: 'pbv-klein' }, t.notities.map(function (n) { return h('li', {}, n); }))));
      }
      var uitvoeringen = t.uitvoeringen.slice();
      var gekozen = uitvoeringen.find(function (u) { return u.id === uitvId; }) ||
        uitvoeringen.find(function (u) { return u.ratio; }) || null;
      S.calc = nieuweCalc(gekozen, t);
      var kaarten = {};
      uitvoeringen.forEach(function (u) {
        var kaart = uitvoeringKaart(u, t, function () {
          S.calc.uitvoering = u; S.calc.i = u.ratio; S.calc.trekker = t.merk + ' ' + t.naam + (u.label ? ' (' + u.label + ')' : '');
          Object.keys(kaarten).forEach(function (k) { kaarten[k].classList.toggle('gekozen', +k === u.id); });
          tekenCalc(rechts);
        });
        if (gekozen && u.id === gekozen.id) kaart.classList.add('gekozen');
        kaarten[u.id] = kaart;
        links.appendChild(kaart);
      });
      if (isBeheer()) {
        links.appendChild(h('button', { class: 'pbv-licht', onclick: function (ev) { uitvoeringFormulier(null, t, ev.target); } }, '+ Uitvoering toevoegen'));
      }
      tekenCalc(rechts);
    }).catch(function (e) { leeg(hoofd).appendChild(melding(e.message, 'fout')); });
  }

  function zichtbaar(veld) { return !S.inst.velden || S.inst.velden[veld] !== false; }

  function uitvoeringKaart(u, t, kiezen) {
    var k = [];
    function kv(veld, naam, waarde) { if (waarde && zichtbaar(veld)) k.push(h('span', {}, naam + ' ', h('b', {}, String(waarde)))); }
    kv('transmissie', 'Transmissie', u.transmissie);
    kv('snelheid', 'Max.', u.snelheid ? u.snelheid + ' km/h' : null);
    kv('vooras', 'Vooras', u.vooras);
    kv('achteras', 'Achteras', u.achteras);
    kv('asklasse', 'Klasse', u.asklasse);
    kv('chassis', 'Chassis', u.chassis_van ? u.chassis_van + (u.chassis_tot ? ' – ' + u.chassis_tot : ' en later') : null);
    kv('bouwjaar', 'Bouwjaar', u.bouwjaar_van ? u.bouwjaar_van + (u.bouwjaar_tot ? '–' + u.bouwjaar_tot : '–') : null);
    kv('regio', 'Regio', u.regio);
    kv('voorwaarde', 'Voorwaarde', u.voorwaarde);
    if (zichtbaar('banden_std') && u.banden_std && (u.banden_std.voor || u.banden_std.achter)) {
      kv('banden_std', 'Standaardbanden', (u.banden_std.voor || '?') + ' / ' + (u.banden_std.achter || '?'));
    }

    var status = u.status === 'twijfel' ? h('span', { class: 'pbv-badge twijfel', title: 'Nog niet gecontroleerd; zie beheer' }, 'controleren')
      : u.status === 'gecontroleerd' ? h('span', { class: 'pbv-badge gecontroleerd' }, 'gecontroleerd') : null;

    var detailRegels = [];
    var wielTabel = wielenTabel(u.wielen);
    if (wielTabel) detailRegels.push(h('div', {}, h('h3', { style: 'margin-top:.6em' }, 'Wielaansluiting'), wielTabel));
    var comp = u.componenten && Object.keys(u.componenten).length ? u.componenten : null;
    if (comp && zichtbaar('componenten')) detailRegels.push(sleutelTabel('Componenten', comp));
    var extra = u.extra && Object.keys(u.extra).length ? u.extra : null;
    if (extra && zichtbaar('extra')) detailRegels.push(sleutelTabel('Overige gegevens', extra));
    if (u.opmerking && zichtbaar('opmerking')) detailRegels.push(h('p', { class: 'pbv-klein' }, 'Opmerking: ' + u.opmerking));
    if (zichtbaar('bron')) detailRegels.push(h('p', { class: 'pbv-klein pbv-zacht' }, 'Bron: ' + bronTekst(u)));
    if (u.review && u.review.length && isBeheer()) {
      detailRegels.push(h('p', { class: 'pbv-klein' }, h('span', { class: 'pbv-badge twijfel' }, 'review'), ' ',
        u.review.map(function (r) { return r.probleem; }).join('; '), ' ', h('a', { href: '#/beheer/review' }, 'Naar reviewlijst')));
    }

    var kaart = h('div', { class: 'pbv-uitv' },
      h('div', { class: 'pbv-uitv-kop' },
        h('div', {}, h('span', { class: 'pbv-label' }, u.label || 'Standaard'), ' ', status),
        h('div', { class: 'pbv-ratio', title: 'Overbrengingsverhouding voor/achter' },
          u.ratio ? ['i = ', fmtI(u.ratio)] : h('small', {}, 'geen verhouding'),
          u.ratio_notatie === 'va_ha' ? h('small', {}, ' (Fendt ' + u.ratio_origineel + ')') : null)),
      k.length ? h('div', { class: 'pbv-kenmerken' }, k) : null,
      detailRegels.length ? h('details', {}, h('summary', {}, 'Details'), detailRegels) : null,
      h('div', { class: 'pbv-acties' },
        u.ratio ? h('button', { class: 'pbv-klein', onclick: kiezen }, 'Gebruik in berekening') : null,
        isBeheer() ? h('button', { class: 'pbv-licht pbv-klein', onclick: function () { uitvoeringFormulier(u, t, kaart); } }, 'Bewerken') : null)
    );
    return kaart;
  }

  function bronTekst(u) {
    var b = u.bron || {};
    var t = [b.bestand, b.blad, b.cel].filter(Boolean).join(' · ');
    if (b.ook_in && b.ook_in.length) t += ' (ook in ' + b.ook_in.length + ' andere bron' + (b.ook_in.length > 1 ? 'nen' : '') + ')';
    return t || 'onbekend';
  }

  var WIELVELDEN = [['flensmaat', 'Flensmaat (mm)'], ['steekcirkel', 'Steekcirkel (mm)'], ['bouten', 'Aantal bouten'],
    ['draad', 'Draad'], ['boutgat', 'Boutgat (mm)'], ['naafgat', 'Naafgat / centrering (mm)'],
    ['boutzitting', 'Boutzitting'], ['aanhaalmoment', 'Aanhaalmoment (Nm)'], ['spacer', 'Spacer (mm)']];

  function wielenTabel(w) {
    if (!w) return null;
    var voor = w.voor || {}, achter = w.achter || {};
    var rijen = WIELVELDEN.filter(function (v) { return zichtbaar(v[0]) && (voor[v[0]] || achter[v[0]]); }).map(function (v) {
      return h('tr', {}, h('th', {}, v[1]), h('td', {}, voor[v[0]] !== undefined ? String(voor[v[0]]) : ''), h('td', {}, achter[v[0]] !== undefined ? String(achter[v[0]]) : ''));
    });
    if (!rijen.length) return null;
    return h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, 'Voor'), h('th', {}, 'Achter'))), h('tbody', {}, rijen));
  }

  function sleutelTabel(titel, obj) {
    return h('div', {}, h('h3', { style: 'margin-top:.6em' }, titel), h('table', {}, h('tbody', {}, Object.keys(obj).map(function (k) {
      return h('tr', {}, h('th', {}, k), h('td', {}, obj[k] === null ? '' : String(obj[k])));
    }))));
  }

  // ------------------------------------------------------------------
  // Calculator
  // ------------------------------------------------------------------

  function nieuweCalc(u, t) {
    return {
      uitvoering: u,
      merkId: t ? t.merk_id : null,
      trekker: t ? t.merk + ' ' + t.naam + (u && u.label ? ' (' + u.label + ')' : '') : '',
      i: u ? u.ratio : null,
      voor: { band: '', rc: '' },
      achter: { band: '', rc: '' },
      bewaarBanden: true
    };
  }

  function berekenUitkomst(c) {
    var i = Number(c.i), uv = R.getal(c.voor.rc), ua = R.getal(c.achter.rc);
    var zones = zonesVoor(c.merkId);
    var v = R.voorloop(i, uv, ua);
    return {
      i: i, uv: uv, ua: ua, zones: zones, voorloop: v, zone: R.zone(v, zones),
      idealeVoor: ua ? R.idealeVoor(i, ua, zones.doel) : null,
      voorMin: ua ? R.idealeVoor(i, ua, zones.groen_min) : null,
      voorMax: ua ? R.idealeVoor(i, ua, zones.groen_max) : null,
      idealeAchter: uv ? R.idealeAchter(i, uv, zones.doel) : null,
      achterMin: uv ? R.idealeAchter(i, uv, zones.groen_max) : null,
      achterMax: uv ? R.idealeAchter(i, uv, zones.groen_min) : null
    };
  }

  function bandInvoer(kant, c, bijWijziging) {
    var titel = kant === 'voor' ? 'Voorband' : 'Achterband';
    var tekst = h('input', { type: 'text', value: c[kant].band, placeholder: 'Maat, merk of profiel, bijv. 6506538', autocomplete: 'off' });
    var rc = h('input', { type: 'text', inputmode: 'numeric', value: c[kant].rc, placeholder: 'mm' });
    var lijst = h('div', { class: 'pbv-resultaten pbv-verborgen' });
    function filter() {
      leeg(lijst);
      var treffers = zoekBanden(tekst.value).slice(0, 30);
      if (!treffers.length) { lijst.classList.add('pbv-verborgen'); return; }
      lijst.classList.remove('pbv-verborgen');
      treffers.forEach(function (b) {
        lijst.appendChild(h('a', {
          href: '#', onmousedown: function (ev) {
            ev.preventDefault();
            tekst.value = bandNaam(b); rc.value = String(b.afrolomtrek);
            c[kant].band = tekst.value; c[kant].rc = rc.value;
            lijst.classList.add('pbv-verborgen');
            bijWijziging();
          }
        }, h('span', {}, bandNaam(b)), h('span', { class: 'pbv-sub' }, fmtMm(b.afrolomtrek))));
      });
    }
    tekst.addEventListener('input', function () { c[kant].band = tekst.value; filter(); });
    tekst.addEventListener('focus', filter);
    tekst.addEventListener('blur', function () { setTimeout(function () { lijst.classList.add('pbv-verborgen'); }, 150); });
    rc.addEventListener('input', function () { c[kant].rc = rc.value; bijWijziging(); });
    return h('div', { class: 'pbv-veld' },
      h('label', {}, titel),
      h('div', { class: 'pbv-rij', style: 'grid-template-columns: 1fr 96px' },
        h('div', { class: 'pbv-band' }, tekst, lijst),
        h('div', {}, rc)));
  }

  function bandNaam(b) { return [b.maat, b.merk, b.profiel].filter(Boolean).join(' '); }

  /* Banden zoeken zoals aan de balie: '650/65 R38', '65065r38' en '6506538' vinden allemaal dezelfde maat.
     Elk woord moet ergens passen; de maat is ook te vinden als alleen de cijfers ('18.4 R38' -> 18438). */
  function bandCijfers(maat) { return String(maat || '').replace(/[^0-9]/g, ''); }
  function bandPast(b, q) {
    var woorden = String(q || '').split(/\s+/).map(norm).filter(Boolean);
    if (!woorden.length) return false;
    var hooiberg = [norm(b.maat), bandCijfers(b.maat), norm(b.merk), norm(b.profiel)].join(' ');
    return woorden.every(function (w) { return hooiberg.indexOf(w) >= 0; }) ||
      norm(b.maat + b.merk + b.profiel).indexOf(norm(q)) >= 0;
  }
  function zoekBanden(q) {
    var cijfers = bandCijfers(q);
    return S.banden.filter(function (b) { return bandPast(b, q); }).sort(function (a, b) {
      // Exacte maat eerst, daarna op maat en merk
      var ea = bandCijfers(a.maat) === cijfers ? 0 : 1, eb = bandCijfers(b.maat) === cijfers ? 0 : 1;
      return ea - eb || bandNaam(a).localeCompare(bandNaam(b), 'nl');
    });
  }

  function schaal(uitkomst) {
    var z = uitkomst.zones, lo = Math.min(-1, z.min - 1), hi = Math.max(8, z.max + 1.5);
    function pos(v) { return Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100)); }
    var delen = [[lo, z.min, 'rood'], [z.min, z.groen_min, 'oranje'], [z.groen_min, z.opt_min, 'groen'],
      [z.opt_min, z.opt_max, 'optimaal'], [z.opt_max, z.groen_max, 'groen'], [z.groen_max, z.max, 'oranje'], [z.max, hi, 'rood']];
    var balk = h('div', { class: 'pbv-schaal' }, delen.map(function (d) {
      return h('div', { class: d[2], style: 'width:' + (pos(d[1]) - pos(d[0])) + '%' });
    }));
    var wrap = h('div', { class: 'pbv-schaal-wrap' }, balk);
    if (uitkomst.voorloop !== null) wrap.appendChild(h('div', { class: 'pbv-wijzer', style: 'left:' + pos(uitkomst.voorloop) + '%' }));
    var as = h('div', { class: 'pbv-schaal-as' });
    [[z.min, fmt(z.min, 0) + '%'], [z.doel, fmt(z.doel, 1) + '%'], [z.max, fmt(z.max, 0) + '%']].forEach(function (p) {
      as.appendChild(h('span', { style: 'left:' + pos(p[0]) + '%' }, p[1]));
    });
    return h('div', {}, wrap, as);
  }

  function tekenCalc(container, opties) {
    opties = opties || {};
    var c = S.calc;
    var uitkomstEl = h('div');
    var bewaarEl = h('div');
    function update() {
      leeg(uitkomstEl);
      var u = berekenUitkomst(c);
      if (!(c.i > 0)) { uitkomstEl.appendChild(melding('Kies een uitvoering of vul een overbrengingsverhouding in.')); return; }
      if (u.voorloop === null) {
        uitkomstEl.appendChild(h('div', { class: 'pbv-uitkomst' }, h('div', { class: 'pbv-procent pbv-zacht' }, '–')));
      } else {
        uitkomstEl.appendChild(h('div', { class: 'pbv-uitkomst' },
          h('div', { class: 'pbv-procent ' + u.zone }, fmtProc(u.voorloop)),
          h('span', { class: 'pbv-badge ' + u.zone }, zoneNaam(u.zone))));
      }
      uitkomstEl.appendChild(schaal(u));
      var dl = h('dl');
      function rij(a, b) { dl.appendChild(h('dt', {}, a)); dl.appendChild(h('dd', {}, b)); }
      rij('Overbrengingsverhouding i', fmtI(u.i));
      if (u.uv && u.ua) {
        rij('Bandverhouding achter/voor', fmtI(u.ua / u.uv));
        rij('Verschil afrolomtrek', fmtMm(u.ua - u.uv));
      }
      if (u.ua) {
        rij('Ideale voorband (' + fmt(u.zones.doel, 1) + '%)', fmtMm(u.idealeVoor));
        rij('Voorband in het groene gebied', fmt(Math.round(u.voorMin), 0) + ' – ' + fmtMm(u.voorMax));
      }
      if (u.uv) {
        rij('Ideale achterband (' + fmt(u.zones.doel, 1) + '%)', fmtMm(u.idealeAchter));
      }
      uitkomstEl.appendChild(h('div', { class: 'pbv-advies' }, dl));
      if (u.ua) {
        var passend = S.banden.filter(function (b) { return b.afrolomtrek >= u.voorMin && b.afrolomtrek <= u.voorMax; })
          .sort(function (a, b) { return Math.abs(a.afrolomtrek - u.idealeVoor) - Math.abs(b.afrolomtrek - u.idealeVoor); }).slice(0, 6);
        if (passend.length) {
          uitkomstEl.appendChild(h('details', {}, h('summary', {}, 'Passende voorbanden uit de lijst (' + passend.length + ')'),
            h('table', {}, h('tbody', {}, passend.map(function (b) {
              var v = R.voorloop(u.i, b.afrolomtrek, u.ua);
              return h('tr', {}, h('td', {}, bandNaam(b)), h('td', { class: 'pbv-getal' }, fmtMm(b.afrolomtrek)),
                h('td', { class: 'pbv-getal' }, h('span', { class: 'pbv-badge ' + R.zone(v, u.zones) }, fmtProc(v))));
            })))));
        }
      }
      tekenBewaar(bewaarEl, u);
    }
    leeg(container);
    var blok = h('div', { class: 'pbv-blok pbv-calc' },
      h('h2', {}, 'Voorloop berekenen'),
      opties.handmatig ? opties.handmatig(update) :
        h('div', { class: 'pbv-trekker' }, c.uitvoering ? ['Trekker: ', h('b', {}, c.trekker)] : 'Kies links een uitvoering.',
          c.uitvoering && c.uitvoering.status === 'twijfel' ? h('div', {}, h('span', { class: 'pbv-badge twijfel' }, 'Let op'), ' Deze verhouding is nog niet gecontroleerd.') : null),
      bandInvoer('achter', c, update),
      bandInvoer('voor', c, update),
      h('p', { class: 'pbv-klein pbv-zacht' }, 'Kies een band uit de lijst of vul de afrolomtrek (mm) uit het databook in.'),
      uitkomstEl,
      bewaarEl
    );
    container.appendChild(blok);
    update();
  }

  function tekenBewaar(el, u) {
    leeg(el);
    if (u.voorloop === null) return;
    var c = S.calc;
    var velden = {
      klant: h('input', { type: 'text' }), referentie: h('input', { type: 'text', placeholder: 'Werkorder, kenteken…' }),
      chassisnummer: h('input', { type: 'text' }), opmerking: h('textarea', { rows: 2 })
    };
    var bewaarBand = h('input', { type: 'checkbox', checked: c.bewaarBanden, onchange: function (ev) { c.bewaarBanden = ev.target.checked; } });
    var status = h('div');
    function gegevens() {
      return {
        uitvoering_id: c.uitvoering ? c.uitvoering.id : null, trekker: c.trekker, ratio: u.i,
        voor_band: c.voor.band, voor_rc: Math.round(u.uv), achter_band: c.achter.band, achter_rc: Math.round(u.ua),
        klant: velden.klant.value, referentie: velden.referentie.value, chassisnummer: velden.chassisnummer.value, opmerking: velden.opmerking.value
      };
    }
    el.appendChild(h('details', { class: 'pbv-bewaar', style: 'margin-top:1em' },
      h('summary', {}, 'Opslaan of printen'),
      h('div', { style: 'margin-top:.8em' },
        h('div', { class: 'pbv-rij' },
          h('div', { class: 'pbv-veld' }, h('label', {}, 'Klant'), velden.klant),
          h('div', { class: 'pbv-veld' }, h('label', {}, 'Referentie'), velden.referentie)),
        h('div', { class: 'pbv-veld' }, h('label', {}, 'Chassisnummer'), velden.chassisnummer),
        h('div', { class: 'pbv-veld' }, h('label', {}, 'Opmerking'), velden.opmerking),
        h('label', { class: 'pbv-klein', style: 'display:flex;gap:.5em;align-items:center' }, bewaarBand, 'Nieuwe banden onthouden in de bandenlijst'),
        status,
        h('div', { class: 'pbv-acties' },
          h('button', {
            onclick: function (ev) {
              ev.target.disabled = true;
              leeg(status);
              bewaarNieuweBanden().then(function () { return api('POST', '/berekeningen', gegevens()); }).then(function (b) {
                status.appendChild(melding('Opgeslagen.', 'ok'));
                status.appendChild(h('div', { class: 'pbv-acties' },
                  h('button', { class: 'pbv-licht', onclick: function () { printBerekening(b); } }, 'Printen'),
                  h('a', { class: 'pbv-knop pbv-licht', href: '#/berekening/' + b.id }, 'Bekijken')));
              }).catch(function (e) { status.appendChild(melding(e.message, 'fout')); ev.target.disabled = false; });
            }
          }, 'Opslaan'),
          h('button', {
            class: 'pbv-licht', onclick: function () {
              var g = gegevens();
              g.voorloop = u.voorloop; g.zone = u.zone; g.aangemaakt = null;
              printBerekening(g);
            }
          }, 'Printen zonder opslaan'))
      )));
  }

  function bewaarNieuweBanden() {
    var c = S.calc;
    if (!c.bewaarBanden) return Promise.resolve();
    var taken = ['voor', 'achter'].filter(function (k) {
      var rc = Math.round(R.getal(c[k].rc));
      return c[k].band && rc && !S.banden.some(function (b) { return bandNaam(b) === c[k].band && b.afrolomtrek === rc; });
    }).map(function (k) {
      var delen = c[k].band.trim().match(/^(\S+(?:\s*R\s*\d+(?:[.,]\d)?)?)\s*(.*)$/i) || [];
      var merkProfiel = (delen[2] || '').split(/\s+/);
      return api('POST', '/banden', {
        maat: (delen[1] || c[k].band).replace(/\s*R\s*/i, ' R'), merk: merkProfiel.shift() || '', profiel: merkProfiel.join(' '),
        afrolomtrek: Math.round(R.getal(c[k].rc))
      }).then(function (r) { S.banden = r.banden; });
    });
    return Promise.all(taken);
  }

  // ------------------------------------------------------------------
  // Losse berekening (handmatige verhouding)
  // ------------------------------------------------------------------

  function paginaLosseBerekening() {
    S.calc = nieuweCalc(null, null);
    S.calc.trekker = '';
    hoofd.appendChild(h('h1', {}, 'Losse berekening'));
    hoofd.appendChild(h('p', { class: 'pbv-zacht' }, 'Voor een trekker die (nog) niet in de lijst staat. Vul de verhouding in zoals je die hebt: direct, in Fendt-notatie, als JD-componenten of gemeten.'));
    var kolom = h('div', { style: 'max-width:520px' });
    hoofd.appendChild(kolom);
    tekenCalc(kolom, { handmatig: verhoudingInvoer });
  }

  function verhoudingInvoer(update) {
    var c = S.calc;
    var trekker = h('input', { type: 'text', placeholder: 'Merk en type (voor het printvel)', oninput: function (ev) { c.trekker = ev.target.value; } });
    var velden = h('div');
    var uitleg = h('div', { class: 'pbv-klein pbv-zacht' });
    var notatie = h('select', {},
      h('option', { value: 'direct' }, 'Verhouding i (bijv. 1,321)'),
      h('option', { value: 'va_ha' }, 'Fendt VA/HA (bijv. 0,757)'),
      h('option', { value: 'componenten' }, 'John Deere-componenten'),
      h('option', { value: 'gemeten' }, 'Gemeten (omwentelingen tellen)'));
    function veld(naam, ph) { return h('div', { class: 'pbv-veld' }, h('label', {}, naam), h('input', { type: 'text', placeholder: ph || '', oninput: bereken })); }
    function bereken() {
      var w = Array.prototype.map.call(velden.querySelectorAll('input'), function (x) { return R.getal(x.value); });
      var i = null;
      if (notatie.value === 'direct') i = w[0];
      else if (notatie.value === 'va_ha') i = w[0] ? R.uitFendt(w[0]) : null;
      else if (notatie.value === 'componenten') i = w.every(function (x) { return x; }) ? R.uitComponenten(w[0], w[1], w[2], w[3]) : null;
      else if (notatie.value === 'gemeten') i = w[0] && w[1] ? R.uitMeting(w[0], w[1]) : null;
      c.i = i;
      uitleg.textContent = i ? 'i = ' + fmtI(i) + (i < 1.1 || i > 1.75 ? ' (ongebruikelijke waarde, controleer de invoer)' : '') : '';
      update();
    }
    function tekenVelden() {
      leeg(velden);
      if (notatie.value === 'direct') velden.appendChild(veld('Overbrengingsverhouding i', '1,321'));
      if (notatie.value === 'va_ha') velden.appendChild(veld('Fendt Übers. VA/HA', '0,757'));
      if (notatie.value === 'componenten') {
        velden.appendChild(h('div', { class: 'pbv-rij' }, veld('Eindreductie achter', '6,4'), veld('Differentieel achter', '5,2')));
        velden.appendChild(h('div', { class: 'pbv-rij' }, veld('Vooras', '13,16'), veld('MFWD-bak', '1,917')));
      }
      if (notatie.value === 'gemeten') {
        velden.appendChild(h('div', { class: 'pbv-rij' }, veld('Omwentelingen voor', '13,2'), veld('bij omwentelingen achter', '10')));
        velden.appendChild(h('p', { class: 'pbv-klein pbv-zacht' }, 'Vierwielaandrijving ingeschakeld, krijtstreep op de zijwand, 10 omwentelingen achter tellen.'));
      }
      bereken();
    }
    notatie.addEventListener('change', tekenVelden);
    var blok = h('div', {}, h('div', { class: 'pbv-veld' }, h('label', {}, 'Trekker'), trekker),
      h('div', { class: 'pbv-veld' }, h('label', {}, 'Invoer verhouding'), notatie), velden, uitleg);
    setTimeout(tekenVelden, 0);
    return blok;
  }

  // ------------------------------------------------------------------
  // Opgeslagen berekeningen en print
  // ------------------------------------------------------------------

  function paginaBerekeningen() {
    hoofd.appendChild(h('h1', {}, 'Opgeslagen berekeningen'));
    var zoekIn = h('input', { type: 'search', placeholder: 'Zoek op klant, referentie, trekker, band of chassisnummer' });
    var lijst = h('div');
    hoofd.appendChild(h('div', { class: 'pbv-veld', style: 'max-width:520px' }, zoekIn));
    hoofd.appendChild(lijst);
    var timer;
    function laad() {
      api('GET', '/berekeningen?zoek=' + encodeURIComponent(zoekIn.value)).then(function (rijen) {
        leeg(lijst);
        if (!rijen.length) { lijst.appendChild(h('p', { class: 'pbv-zacht' }, 'Nog geen berekeningen gevonden.')); return; }
        lijst.appendChild(h('table', {},
          h('thead', {}, h('tr', {}, ['Datum', 'Klant', 'Referentie', 'Trekker', 'Banden (voor / achter)', 'Voorloop'].map(function (k, i) {
            return h('th', { class: i === 5 ? 'pbv-getal' : '' }, k);
          }))),
          h('tbody', {}, rijen.map(function (b) {
            return h('tr', { class: 'klikbaar', onclick: function () { location.hash = '#/berekening/' + b.id; } },
              h('td', {}, datum(b.aangemaakt)), h('td', {}, b.klant || ''), h('td', {}, b.referentie || ''),
              h('td', {}, b.trekker || ''), h('td', {}, (b.voor_band || fmtMm(b.voor_rc)) + ' / ' + (b.achter_band || fmtMm(b.achter_rc))),
              h('td', { class: 'pbv-getal' }, h('span', { class: 'pbv-badge ' + b.zone }, fmtProc(b.voorloop))));
          }))));
      }).catch(function (e) { leeg(lijst).appendChild(melding(e.message, 'fout')); });
    }
    zoekIn.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(laad, 250); });
    laad();
  }

  function paginaBerekening(id) {
    api('GET', '/berekeningen/' + id).then(function (b) {
      hoofd.appendChild(h('div', { class: 'pbv-pad' }, h('a', { href: '#/berekeningen' }, 'Opgeslagen berekeningen'), ' › '));
      hoofd.appendChild(h('h1', {}, (b.klant || 'Berekening') + (b.referentie ? ' · ' + b.referentie : '')));
      hoofd.appendChild(h('div', { class: 'pbv-blok', style: 'max-width:640px' }, berekeningTabel(b),
        h('div', { class: 'pbv-acties' },
          h('button', { onclick: function () { printBerekening(b); } }, 'Printen'),
          b.type_id ? h('a', { class: 'pbv-knop pbv-licht', href: '#/type/' + b.type_id + '?u=' + b.uitvoering_id }, 'Naar trekker') : null,
          isBeheer() ? h('button', {
            class: 'pbv-gevaar', onclick: function () {
              if (confirm('Deze berekening verwijderen?')) api('DELETE', '/berekeningen/' + b.id).then(function () { location.hash = '#/berekeningen'; });
            }
          }, 'Verwijderen') : null)));
    }).catch(function (e) { hoofd.appendChild(melding(e.message, 'fout')); });
  }

  function berekeningTabel(b) {
    var zones = S.inst.zones;
    var ideaal = R.idealeVoor(b.ratio, b.achter_rc, zones.doel);
    function rij(a, w) { return h('tr', {}, h('th', {}, a), h('td', {}, w)); }
    return h('table', {}, h('tbody', {},
      b.aangemaakt ? rij('Datum', datum(b.aangemaakt)) : null,
      b.klant ? rij('Klant', b.klant) : null,
      b.referentie ? rij('Referentie', b.referentie) : null,
      rij('Trekker', b.trekker || '–'),
      b.chassisnummer ? rij('Chassisnummer', b.chassisnummer) : null,
      rij('Overbrengingsverhouding i', fmtI(b.ratio)),
      rij('Voorband', (b.voor_band ? b.voor_band + ' · ' : '') + fmtMm(b.voor_rc)),
      rij('Achterband', (b.achter_band ? b.achter_band + ' · ' : '') + fmtMm(b.achter_rc)),
      rij('Voorloop', [fmtProc(b.voorloop), ' ', h('span', { class: 'pbv-badge ' + b.zone }, zoneNaam(b.zone))]),
      rij('Ideale voorband (' + fmt(zones.doel, 1) + '%)', fmtMm(ideaal)),
      b.opmerking ? rij('Opmerking', b.opmerking) : null));
  }

  function printBerekening(b) {
    var oud = document.querySelector('.pbv-print');
    if (oud) oud.parentNode.removeChild(oud);
    var inst = S.inst;
    var zones = inst.zones;
    var vel = h('div', { class: 'pbv-print' },
      h('div', { class: 'pbv-print-kop' },
        h('div', {}, h('h1', {}, 'Voorloopberekening'), h('div', {}, new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }))),
        h('div', { style: 'text-align:right' }, inst.logo_url ? h('img', { src: inst.logo_url, alt: inst.bedrijfsnaam }) : h('strong', {}, inst.bedrijfsnaam),
          inst.logo_url ? null : h('div', {}, inst.bedrijfsregel))),
      h('table', {}, h('tbody', {},
        prRij('Klant', b.klant), prRij('Referentie', b.referentie), prRij('Trekker', b.trekker), prRij('Chassisnummer', b.chassisnummer))),
      h('table', {}, h('tbody', {},
        prRij('Overbrengingsverhouding voor/achter (i)', fmtI(b.ratio)),
        prRij('Voorband', (b.voor_band ? b.voor_band + ' – ' : '') + 'afrolomtrek ' + fmtMm(b.voor_rc)),
        prRij('Achterband', (b.achter_band ? b.achter_band + ' – ' : '') + 'afrolomtrek ' + fmtMm(b.achter_rc)))),
      h('div', {}, 'Voorloop'),
      h('div', { class: 'pbv-print-uitkomst' }, fmtProc(b.voorloop) + ' – ' + zoneNaam(b.zone)),
      h('table', {}, h('tbody', {},
        prRij('Beoordeling', 'goed tussen ' + fmt(zones.groen_min, 1) + '% en ' + fmt(zones.groen_max, 1) + '%, optimaal ' + fmt(zones.opt_min, 1) + '–' + fmt(zones.opt_max, 1) + '%'),
        prRij('Ideale afrolomtrek voorband (' + fmt(zones.doel, 1) + '%)', fmtMm(R.idealeVoor(b.ratio, b.achter_rc, zones.doel))),
        prRij('Opmerking', b.opmerking))),
      h('div', { class: 'pbv-print-voet' },
        'Voorloop = (i × afrolomtrek voor ÷ afrolomtrek achter − 1) × 100%. Dit is de mechanische voorloop op basis van de opgegeven afrolomtrekken; ',
        'belasting, bandenspanning en slijtage beïnvloeden de werkelijke waarde. ', inst.logo_url ? inst.bedrijfsnaam + ' · ' + inst.bedrijfsregel : '')
    );
    document.body.appendChild(vel);
    window.print();
  }
  function prRij(a, w) { return w ? h('tr', {}, h('th', {}, a), h('td', {}, String(w))) : null; }

  // ------------------------------------------------------------------
  // Beheer
  // ------------------------------------------------------------------

  function paginaBeheer(tab) {
    var tabs = [['review', 'Reviewlijst'], ['zones', 'Normzones'], ['velden', 'Zichtbare velden'], ['banden', 'Bandenlijst'], ['nieuw', 'Nieuwe trekker'], ['log', 'Wijzigingslog']];
    hoofd.appendChild(h('h1', {}, 'Beheer'));
    hoofd.appendChild(h('div', { class: 'pbv-tabs' }, tabs.map(function (t) {
      return h('a', { href: '#/beheer/' + t[0], class: t[0] === tab ? 'actief' : '' }, t[1]);
    })));
    var inhoud = h('div');
    hoofd.appendChild(inhoud);
    ({ review: beheerReview, zones: beheerZones, velden: beheerVelden, banden: beheerBanden, nieuw: beheerNieuw, log: beheerLog }[tab] || beheerReview)(inhoud);
  }

  var SOORTEN = { decimaal: 'Decimaalteken hersteld', meerdere: 'Meerdere waarden in één cel', tekst: 'Tekst in de cel', plausibiliteit: 'Onwaarschijnlijke waarde', overig: 'Overig' };

  function beheerReview(el) {
    el.appendChild(h('p', { class: 'pbv-zacht' }, 'Punten uit de migratie die een vakinhoudelijke controle nodig hebben. Goedkeuren zet de uitvoering op "gecontroleerd"; aanpassen legt een andere verhouding vast; afwijzen maakt de verhouding leeg.'));
    var lijst = h('div');
    el.appendChild(lijst);
    function laad() {
      api('GET', '/review').then(function (rijen) {
        leeg(lijst);
        var tellingen = {};
        rijen.forEach(function (r) { tellingen[r.soort] = (tellingen[r.soort] || 0) + 1; });
        if (!rijen.length) { lijst.appendChild(melding('Alle reviewpunten zijn afgehandeld.', 'ok')); return; }
        var chips = h('div', { class: 'pbv-chips' },
          h('button', { class: S.reviewFilter === 'alle' ? 'actief' : '', onclick: function () { S.reviewFilter = 'alle'; laad(); } }, 'Alle (' + rijen.length + ')'),
          Object.keys(tellingen).map(function (s) {
            return h('button', { class: S.reviewFilter === s ? 'actief' : '', onclick: function () { S.reviewFilter = s; laad(); } }, (SOORTEN[s] || s) + ' (' + tellingen[s] + ')');
          }));
        lijst.appendChild(chips);
        var zichtbareRijen = rijen.filter(function (r) { return S.reviewFilter === 'alle' || r.soort === S.reviewFilter; });
        if (S.reviewFilter === 'decimaal') {
          lijst.appendChild(h('p', {}, h('button', {
            onclick: function (ev) {
              if (!confirm('Alle ' + zichtbareRijen.length + ' punten met een hersteld decimaalteken goedkeuren?')) return;
              ev.target.disabled = true;
              api('POST', '/review/bulk', { soort: 'decimaal' }).then(function () { S.types = {}; laad(); });
            }
          }, 'Alle ' + zichtbareRijen.length + ' in één keer goedkeuren')));
        }
        lijst.appendChild(h('table', {}, h('thead', {}, h('tr', {}, ['Trekker', 'Bron', 'Probleem', 'Voorstel i', ''].map(function (k) { return h('th', {}, k); }))),
          h('tbody', {}, zichtbareRijen.slice(0, 150).map(reviewRij))));
        if (zichtbareRijen.length > 150) lijst.appendChild(h('p', { class: 'pbv-zacht' }, 'Eerste 150 van ' + zichtbareRijen.length + ' getoond.'));
      }).catch(function (e) { leeg(lijst).appendChild(melding(e.message, 'fout')); });
    }
    function reviewRij(r) {
      var invoer = h('input', { type: 'text', value: r.voorstel ? fmt(r.voorstel, 4) : '', style: 'width:7em' });
      function besluit(b) {
        var data = { besluit: b };
        if (b === 'aangepast') {
          data.ratio = R.getal(invoer.value);
          if (!data.ratio) { alert('Vul een geldige verhouding in.'); return; }
        }
        api('POST', '/review/' + r.id, data).then(function () { S.types = {}; laad(); }).catch(function (e) { alert(e.message); });
      }
      return h('tr', {},
        h('td', {}, r.type_id ? h('a', { href: '#/type/' + r.type_id }, (r.merk || '') + ' ' + (r.type || '')) : (r.merk || ''),
          r.label ? h('div', { class: 'pbv-klein pbv-zacht' }, r.label) : null),
        h('td', { class: 'pbv-klein' }, [r.bestand, r.blad, r.cel].filter(Boolean).join(' · '), r.origineel ? h('div', { class: 'pbv-zacht' }, '"' + r.origineel + '"') : null),
        h('td', { class: 'pbv-klein' }, r.probleem),
        h('td', {}, r.uitvoering_ids.length ? invoer : ''),
        h('td', { class: 'pbv-nowrap' }, h('div', { class: 'pbv-acties', style: 'margin:0;flex-wrap:nowrap' },
          r.uitvoering_ids.length ? [
            h('button', { class: 'pbv-klein', onclick: function () { besluit('goedgekeurd'); } }, 'Klopt'),
            h('button', { class: 'pbv-klein pbv-licht', onclick: function () { besluit('aangepast'); } }, 'Aanpassen'),
            h('button', { class: 'pbv-klein pbv-gevaar', onclick: function () { if (confirm('Verhouding leegmaken?')) besluit('afgewezen'); } }, 'Afwijzen')
          ] : h('button', { class: 'pbv-klein pbv-licht', onclick: function () { besluit('gezien'); } }, 'Gezien'))));
    }
    laad();
  }

  var ZONEVELDEN = [['min', 'Ondergrens toegestaan'], ['groen_min', 'Begin groen'], ['opt_min', 'Begin optimaal'], ['doel', 'Doelwaarde'],
    ['opt_max', 'Einde optimaal'], ['groen_max', 'Einde groen'], ['max', 'Bovengrens toegestaan']];

  function zoneFormulier(waarden, opslaan, extra) {
    var inputs = {};
    var voorbeeld = h('div');
    function lees() {
      var z = {};
      ZONEVELDEN.forEach(function (v) { z[v[0]] = R.getal(inputs[v[0]].value); });
      return z;
    }
    function toon() {
      leeg(voorbeeld);
      var z = lees();
      if (ZONEVELDEN.every(function (v) { return z[v[0]] !== null; })) voorbeeld.appendChild(schaal({ zones: z, voorloop: z.doel }));
    }
    var status = h('div');
    var form = h('div', { class: 'pbv-blok' },
      extra || null,
      h('div', { class: 'pbv-rij' }, ZONEVELDEN.map(function (v) {
        inputs[v[0]] = h('input', { type: 'text', value: fmt(waarden[v[0]], 2), oninput: toon });
        return h('div', { class: 'pbv-veld' }, h('label', {}, v[1] + ' (%)'), inputs[v[0]]);
      })),
      voorbeeld, status,
      h('div', { class: 'pbv-acties' }, h('button', {
        onclick: function () {
          leeg(status);
          opslaan(lees()).then(function () { status.appendChild(melding('Opgeslagen.', 'ok')); })
            .catch(function (e) { status.appendChild(melding(e.message, 'fout')); });
        }
      }, 'Opslaan')));
    toon();
    return form;
  }

  function slaInstellingenOp(data) {
    return api('POST', '/instellingen', data).then(function (inst) { S.inst = inst; });
  }

  function beheerZones(el) {
    el.appendChild(h('h2', {}, 'Standaard'));
    el.appendChild(h('p', { class: 'pbv-zacht' }, 'Gelden voor alle merken, tenzij hieronder een afwijkende set voor een merk is ingesteld.'));
    el.appendChild(zoneFormulier(S.inst.zones, function (z) { return slaInstellingenOp({ zones: z }); }));
    el.appendChild(h('h2', { style: 'margin-top:1.5em' }, 'Afwijkend per merk'));
    var kies = h('select', {}, h('option', { value: '' }, 'Kies een merk…'), S.boom.map(function (m) {
      var per = S.inst.zones_per_merk || {};
      return h('option', { value: m.id }, m.naam + (per[m.id] ? ' (afwijkend)' : ''));
    }));
    var plek = h('div');
    kies.addEventListener('change', function () {
      leeg(plek);
      var id = kies.value;
      if (!id) return;
      var per = Object.assign({}, S.inst.zones_per_merk || {});
      plek.appendChild(zoneFormulier(per[id] || S.inst.zones, function (z) {
        per[id] = z;
        return slaInstellingenOp({ zones_per_merk: per });
      }, per[id] ? h('p', {}, h('button', {
        class: 'pbv-gevaar pbv-klein', onclick: function () {
          delete per[id];
          slaInstellingenOp({ zones_per_merk: per }).then(function () { route(); });
        }
      }, 'Afwijking verwijderen (standaard gebruiken)')) : h('p', { class: 'pbv-zacht' }, 'Nu gelden de standaardwaarden voor dit merk.')));
    });
    el.appendChild(h('div', { class: 'pbv-veld', style: 'max-width:320px' }, kies));
    el.appendChild(plek);
  }

  function beheerVelden(el) {
    el.appendChild(h('p', { class: 'pbv-zacht' }, 'Kies welke gegevens op de trekkerkaart zichtbaar zijn. Uitgezette gegevens blijven bewaard.'));
    var vinkjes = {};
    var namen = S.inst.veldnamen;
    var blok = h('div', { class: 'pbv-blok pbv-vinkjes' }, Object.keys(namen).map(function (k) {
      vinkjes[k] = h('input', { type: 'checkbox', checked: S.inst.velden[k] !== false });
      return h('label', {}, vinkjes[k], namen[k]);
    }));
    var status = h('div');
    el.appendChild(blok);
    el.appendChild(status);
    el.appendChild(h('button', {
      onclick: function () {
        var v = {};
        Object.keys(vinkjes).forEach(function (k) { v[k] = vinkjes[k].checked; });
        leeg(status);
        slaInstellingenOp({ velden: v }).then(function () { status.appendChild(melding('Opgeslagen.', 'ok')); });
      }
    }, 'Opslaan'));
  }

  function beheerBanden(el) {
    el.appendChild(h('p', { class: 'pbv-zacht' }, 'Afrolomtrekken die in de calculator gekozen kunnen worden. Nieuwe banden die bij een berekening worden ingevoerd, komen hier automatisch bij.'));
    var velden = { maat: h('input', { type: 'text', placeholder: '540/65 R28' }), merk: h('input', { type: 'text' }), profiel: h('input', { type: 'text' }), afrolomtrek: h('input', { type: 'text', placeholder: 'mm' }) };
    var status = h('div');
    el.appendChild(h('div', { class: 'pbv-blok' }, h('h3', {}, 'Band toevoegen'),
      h('div', { class: 'pbv-rij' }, Object.keys(velden).map(function (k) { return h('div', { class: 'pbv-veld' }, h('label', {}, k === 'afrolomtrek' ? 'Afrolomtrek (mm)' : k[0].toUpperCase() + k.slice(1)), velden[k]); })),
      status,
      h('button', {
        onclick: function () {
          leeg(status);
          api('POST', '/banden', { maat: velden.maat.value, merk: velden.merk.value, profiel: velden.profiel.value, afrolomtrek: R.getal(velden.afrolomtrek.value), bron: 'Ingevoerd in beheer' })
            .then(function (r) { S.banden = r.banden; route(); }).catch(function (e) { status.appendChild(melding(e.message, 'fout')); });
        }
      }, 'Toevoegen')));
    el.appendChild(bandImportBlok());
    var zoek = h('input', { type: 'search', placeholder: 'Zoek in de bandenlijst, bijv. 6506538 of michelin' });
    var tbody = h('tbody');
    el.appendChild(h('div', { class: 'pbv-veld' }, zoek));
    el.appendChild(h('table', {}, h('thead', {}, h('tr', {}, ['Maat', 'Merk', 'Profiel', 'Afrolomtrek', 'Bron', ''].map(function (k) { return h('th', {}, k); }))), tbody));
    function toon() {
      leeg(tbody);
      (zoek.value.trim() ? zoekBanden(zoek.value) : S.banden).forEach(function (b) { tbody.appendChild(bandRij(b)); });
    }
    zoek.addEventListener('input', toon);
    toon();
    function bandRij(b) {
        return h('tr', {}, h('td', {}, b.maat), h('td', {}, b.merk), h('td', {}, b.profiel), h('td', { class: 'pbv-getal' }, fmtMm(b.afrolomtrek)),
          h('td', { class: 'pbv-klein pbv-zacht' }, b.bron || ''),
          h('td', {}, h('button', {
            class: 'pbv-gevaar pbv-klein', onclick: function () {
              if (confirm('Band ' + bandNaam(b) + ' verwijderen?')) api('DELETE', '/banden/' + b.id).then(function (r) { S.banden = r.banden; route(); });
            }
          }, 'Verwijderen')));
    }
  }

  function beheerLog(el) {
    api('GET', '/log').then(function (rijen) {
      el.appendChild(h('table', {}, h('thead', {}, h('tr', {}, ['Tijd', 'Onderwerp', 'Omschrijving', 'Door'].map(function (k) { return h('th', {}, k); }))),
        h('tbody', {}, rijen.map(function (r) {
          var detail = r.nieuw || r.oud ? h('details', {}, h('summary', {}, 'details'),
            r.oud ? h('div', { class: 'pbv-klein pbv-zacht' }, 'Oud: ' + r.oud) : null, r.nieuw ? h('div', { class: 'pbv-klein' }, 'Nieuw: ' + r.nieuw) : null) : null;
          return h('tr', {}, h('td', { class: 'pbv-klein' }, r.tijd), h('td', {}, r.onderwerp), h('td', {}, r.omschrijving, detail), h('td', { class: 'pbv-klein' }, r.rol || ''));
        }))));
    }).catch(function (e) { el.appendChild(melding(e.message, 'fout')); });
  }

  // -- formulieren voor types en uitvoeringen ---------------------------

  /* ---- Banden importeren uit CSV (zie .claude/skills/banden-import voor PDF -> CSV) ---- */

  /** Leest CSV-tekst: scheidingsteken ; , of tab (automatisch), aanhalingstekens, BOM. */
  function leesCsv(tekst) {
    tekst = String(tekst || '').replace(/^\uFEFF/, '');
    var eerste = tekst.split(/\r?\n/)[0] || '';
    var sep = [';', '\t', ','].sort(function (a, b) { return eerste.split(b).length - eerste.split(a).length; })[0];
    var rijen = [], rij = [], veld = '', aanh = false;
    for (var i = 0; i < tekst.length; i++) {
      var c = tekst[i];
      if (aanh) {
        if (c === '"' && tekst[i + 1] === '"') { veld += '"'; i++; } else if (c === '"') aanh = false; else veld += c;
      } else if (c === '"') aanh = true;
      else if (c === sep) { rij.push(veld); veld = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && tekst[i + 1] === '\n') i++;
        rij.push(veld); veld = '';
        if (rij.some(function (v) { return v.trim() !== ''; })) rijen.push(rij);
        rij = [];
      } else veld += c;
    }
    rij.push(veld);
    if (rij.some(function (v) { return v.trim() !== ''; })) rijen.push(rij);
    return rijen;
  }

  var KOLOMNAMEN = {
    maat: ['maat', 'bandmaat', 'size', 'tyre size', 'tire size', 'dimension', 'grosse', 'größe'],
    merk: ['merk', 'brand', 'marke', 'fabrikant'],
    profiel: ['profiel', 'pattern', 'profil', 'type', 'model'],
    afrolomtrek: ['afrolomtrek', 'rc', 'rci', 'rolling circumference', 'abrollumfang', 'omtrek', 'afrolomtrek (mm)'],
    bron: ['bron', 'source', 'quelle'],
    controle: ['controle', 'opmerking', 'check']
  };

  function bandImportBlok() {
    var bestand = h('input', { type: 'file', accept: '.csv,.txt,text/csv' });
    var merkVeld = h('input', { type: 'text', placeholder: 'Alleen nodig als de CSV geen kolom merk heeft' });
    var uitleg = h('p', { class: 'pbv-zacht pbv-klein' },
      'CSV met de kolommen maat, merk, profiel, afrolomtrek (en eventueel bron). Scheidingsteken ; of , mag allebei. ',
      'Uit Excel: Bestand → Opslaan als → CSV. Een PDF-catalogus eerst omzetten met de skill banden-import (zie de documentatie).');
    var voorbeeld = h('div'), status = h('div');
    var rijen = [], bestandsnaam = '', laatsteCsv = null;

    function lees() {
      leeg(voorbeeld); leeg(status);
      var f = bestand.files && bestand.files[0];
      if (!f) return;
      bestandsnaam = f.name;
      var r = new FileReader();
      r.onload = function () { laatsteCsv = leesCsv(r.result); verwerk(laatsteCsv); };
      r.readAsText(f, 'utf-8');
    }

    function verwerk(csv) {
      if (csv.length < 2) { status.appendChild(melding('Het bestand bevat geen gegevens.', 'fout')); return; }
      var kop = csv[0].map(function (k) { return k.trim().toLowerCase(); });
      var kol = {};
      Object.keys(KOLOMNAMEN).forEach(function (k) {
        var i = kop.findIndex(function (x) { return KOLOMNAMEN[k].indexOf(x) >= 0; });
        if (i >= 0) kol[k] = i;
      });
      if (kol.maat === undefined || kol.afrolomtrek === undefined) {
        status.appendChild(melding('Kolommen maat en afrolomtrek niet gevonden. Gevonden kolommen: ' + csv[0].join(', '), 'fout'));
        return;
      }
      var bestaand = {};
      S.banden.forEach(function (b) {
        var k = (b.maat + '|' + (b.merk || '') + '|' + (b.profiel || '')).toLowerCase();
        (bestaand[k] = bestaand[k] || []).push(b.afrolomtrek);
      });
      var perSleutel = {};
      rijen = csv.slice(1).map(function (v) {
        function w(k) { return kol[k] === undefined ? '' : String(v[kol[k]] || '').trim(); }
        var rij = {
          maat: R.normaliseerMaat(w('maat')),
          merk: w('merk') || merkVeld.value.trim(),
          profiel: w('profiel'),
          afrolomtrek: Math.round(R.getal(w('afrolomtrek')) || 0),
          bron: w('bron'),
          controle: w('controle')
        };
        var sleutel = (rij.maat + '|' + rij.merk + '|' + rij.profiel).toLowerCase();
        perSleutel[sleutel] = (perSleutel[sleutel] || 0) + 1;
        var oud = bestaand[sleutel] || [];
        var p = R.bandPlausibel(rij.maat, rij.afrolomtrek);
        if (!rij.maat || !(rij.afrolomtrek >= 1000 && rij.afrolomtrek <= 10000)) {
          rij.status = 'fout'; rij.toelichting = !rij.maat ? 'Geen maat' : 'Afrolomtrek ontbreekt of ligt niet tussen 1000 en 10000 mm';
        } else if (oud.indexOf(rij.afrolomtrek) >= 0) {
          rij.status = 'ongewijzigd'; rij.toelichting = 'Staat al in de bandenlijst';
        } else if (p.oordeel === 'twijfel') {
          rij.status = 'twijfel'; rij.toelichting = 'Afrolomtrek past niet goed bij de maat (factor ' + fmt(p.factor, 3) + ', gebruikelijk is 0,94–0,99)';
        } else if (oud.length === 1) {
          rij.status = 'wijziging'; rij.toelichting = 'Nu ' + fmtMm(oud[0]);
        } else {
          rij.status = 'nieuw'; rij.toelichting = p.oordeel === 'onbekend' ? 'Maat niet herkend, niet gecontroleerd' : '';
        }
        if (!rij.merk && rij.status !== 'fout') { rij.status = 'twijfel'; rij.toelichting = 'Geen merk'; }
        rij.sleutel = sleutel;
        rij.aan = rij.status === 'nieuw' || rij.status === 'wijziging';
        return rij;
      });
      rijen.forEach(function (r) {
        if (perSleutel[r.sleutel] > 1 && r.status !== 'fout' && r.status !== 'ongewijzigd') {
          r.toelichting = (r.toelichting ? r.toelichting + '. ' : '') + 'Deze band staat ' + perSleutel[r.sleutel] + ' keer in het bestand';
        }
      });
      toon();
    }

    function toon() {
      leeg(voorbeeld);
      var telling = {};
      rijen.forEach(function (r) { telling[r.status] = (telling[r.status] || 0) + 1; });
      var namen = { nieuw: 'nieuw', wijziging: 'andere afrolomtrek', twijfel: 'twijfel', ongewijzigd: 'staat er al', fout: 'fout' };
      var kleur = { nieuw: 'optimaal', wijziging: 'oranje', twijfel: 'oranje', ongewijzigd: '', fout: 'rood' };
      var knop = h('button', { onclick: importeer });
      function tel() {
        var n = rijen.filter(function (r) { return r.aan; }).length;
        knop.textContent = 'Importeer ' + n + ' band' + (n === 1 ? '' : 'en');
        knop.disabled = !n;
      }
      voorbeeld.appendChild(h('p', {}, rijen.length + ' regels: ' + Object.keys(namen).filter(function (k) { return telling[k]; })
        .map(function (k) { return telling[k] + ' ' + namen[k]; }).join(', ') + '. Twijfelgevallen staan uit; vink ze aan als ze kloppen.'));
      var tbody = h('tbody');
      rijen.forEach(function (r) {
        var vink = h('input', { type: 'checkbox', checked: r.aan, disabled: r.status === 'fout' || r.status === 'ongewijzigd' });
        vink.addEventListener('change', function () { r.aan = vink.checked; tel(); });
        tbody.appendChild(h('tr', {},
          h('td', {}, vink), h('td', { class: 'pbv-nowrap' }, r.maat), h('td', {}, r.merk), h('td', {}, r.profiel),
          h('td', { class: 'pbv-getal' }, r.afrolomtrek ? fmtMm(r.afrolomtrek) : '–'),
          h('td', {}, h('span', { class: 'pbv-badge ' + kleur[r.status] }, namen[r.status])),
          h('td', { class: 'pbv-klein pbv-zacht' }, [r.toelichting, r.controle].filter(Boolean).join('. '))));
      });
      voorbeeld.appendChild(h('div', { style: 'max-height:60vh;overflow:auto;margin-bottom:1em' },
        h('table', {}, h('thead', {}, h('tr', {}, ['', 'Maat', 'Merk', 'Profiel', 'Afrolomtrek', 'Status', 'Toelichting'].map(function (k) { return h('th', {}, k); }))), tbody)));
      voorbeeld.appendChild(knop);
      tel();
    }

    function importeer(ev) {
      var knop = ev.currentTarget; knop.disabled = true;
      leeg(status);
      var te = rijen.filter(function (r) { return r.aan; }).map(function (r) {
        return { maat: r.maat, merk: r.merk, profiel: r.profiel, afrolomtrek: r.afrolomtrek, bron: r.bron };
      });
      api('POST', '/banden/import', { rijen: te, bestand: bestandsnaam }).then(function (u) {
        S.banden = u.banden;
        S.importMelding = 'Import klaar: ' + u.nieuw + ' nieuw, ' + u.bijgewerkt + ' bijgewerkt, ' + u.ongewijzigd + ' ongewijzigd' + (u.fout ? ', ' + u.fout + ' fout' : '') + '.';
        route();
      }).catch(function (e) { knop.disabled = false; status.appendChild(melding(e.message, 'fout')); });
    }

    bestand.addEventListener('change', lees);
    merkVeld.addEventListener('change', function () { if (laatsteCsv) { leeg(status); verwerk(laatsteCsv); } });
    var klaar = S.importMelding ? melding(S.importMelding, 'ok') : null;
    S.importMelding = null;
    return h('div', { class: 'pbv-blok' }, h('h3', {}, 'Banden importeren'), uitleg, klaar,
      h('div', { class: 'pbv-rij' }, veldBlok('CSV-bestand', bestand), veldBlok('Merk (optioneel)', merkVeld)),
      status, voorbeeld);
  }

  function tekstVeld(naam, waarde, ph) { return h('input', { type: 'text', value: waarde === null || waarde === undefined ? '' : String(waarde), placeholder: ph || '' }); }
  function veldBlok(label, input) { return h('div', { class: 'pbv-veld' }, h('label', {}, label), input); }

  function merkSerieVelden(merk, serie) {
    var merkIn = tekstVeld('merk', merk, 'bijv. Fendt');
    var serieIn = tekstVeld('serie', serie, 'bijv. 700 Vario');
    var ml = h('datalist', { id: 'pbv-merken' }, S.boom.map(function (m) { return h('option', { value: m.naam }); }));
    var sl = h('datalist', { id: 'pbv-series' });
    merkIn.setAttribute('list', 'pbv-merken');
    serieIn.setAttribute('list', 'pbv-series');
    function vulSeries() {
      leeg(sl);
      var m = S.boom.find(function (x) { return x.naam === merkIn.value; });
      if (m) m.series.forEach(function (s) { sl.appendChild(h('option', { value: s.naam })); });
    }
    merkIn.addEventListener('input', vulSeries);
    vulSeries();
    return { merk: merkIn, serie: serieIn, el: h('div', { class: 'pbv-rij' }, veldBlok('Merk', merkIn), veldBlok('Serie', serieIn), ml, sl) };
  }

  function uitvoeringVelden(u) {
    u = u || {};
    var f = {};
    var TEKST = [['label', 'Omschrijving uitvoering'], ['transmissie', 'Transmissie'], ['snelheid', 'Max. snelheid (km/h)'], ['vooras', 'Vooras'],
      ['achteras', 'Achteras'], ['asklasse', 'Asklasse'], ['chassis_van', 'Chassisnummer van'], ['chassis_tot', 'Chassisnummer tot'],
      ['bouwjaar_van', 'Bouwjaar van'], ['bouwjaar_tot', 'Bouwjaar tot'], ['regio', 'Regio'], ['voorwaarde', 'Voorwaarde']];
    TEKST.forEach(function (v) { f[v[0]] = tekstVeld(v[0], u[v[0]]); });
    f.opmerking = h('textarea', { rows: 2 }, u.opmerking || '');
    f.status = h('select', {}, [['gecontroleerd', 'Gecontroleerd'], ['bron', 'Uit bronbestand (ongecontroleerd)'], ['twijfel', 'Twijfel']].map(function (s) {
      var o = h('option', { value: s[0] }, s[1]);
      if ((u.status || 'gecontroleerd') === s[0]) o.selected = true;
      return o;
    }));
    // verhouding
    f.notatie = h('select', {}, [['direct', 'Verhouding i'], ['va_ha', 'Fendt VA/HA'], ['componenten', 'JD-componenten'], ['gemeten', 'Gemeten'], ['geen', 'Geen verhouding']].map(function (s) {
      return h('option', { value: s[0] }, s[1]);
    }));
    var ratioVelden = h('div');
    var r = {};
    function tekenRatio() {
      leeg(ratioVelden);
      r = {};
      var n = f.notatie.value;
      if (n === 'direct') { r.ratio_invoer = tekstVeld('', u.ratio ? fmt(u.ratio, 5) : ''); ratioVelden.appendChild(veldBlok('i (voor/achter)', r.ratio_invoer)); }
      if (n === 'va_ha') { r.ratio_invoer = tekstVeld('', u.ratio ? fmt(1 / u.ratio, 5) : ''); ratioVelden.appendChild(veldBlok('Fendt VA/HA', r.ratio_invoer)); }
      if (n === 'componenten') {
        ['i_eind', 'i_diff', 'i_vooras', 'i_tussenbak'].forEach(function (k) { r[k] = tekstVeld(k); });
        ratioVelden.appendChild(h('div', { class: 'pbv-rij' }, veldBlok('Eindreductie achter', r.i_eind), veldBlok('Differentieel achter', r.i_diff), veldBlok('Vooras', r.i_vooras), veldBlok('MFWD-bak', r.i_tussenbak)));
      }
      if (n === 'gemeten') {
        r.omw_voor = tekstVeld(''); r.omw_achter = tekstVeld('', '10');
        r.omw_achter.value = '10';
        ratioVelden.appendChild(h('div', { class: 'pbv-rij' }, veldBlok('Omwentelingen voor', r.omw_voor), veldBlok('bij omwentelingen achter', r.omw_achter)));
      }
    }
    f.notatie.addEventListener('change', tekenRatio);
    tekenRatio();
    // wielen
    var wiel = { voor: {}, achter: {} };
    var wielRijen = WIELVELDEN.map(function (v) {
      wiel.voor[v[0]] = tekstVeld('', u.wielen && u.wielen.voor ? u.wielen.voor[v[0]] : '');
      wiel.achter[v[0]] = tekstVeld('', u.wielen && u.wielen.achter ? u.wielen.achter[v[0]] : '');
      return h('tr', {}, h('th', {}, v[1]), h('td', {}, wiel.voor[v[0]]), h('td', {}, wiel.achter[v[0]]));
    });
    var bandVoor = tekstVeld('', u.banden_std ? u.banden_std.voor : ''), bandAchter = tekstVeld('', u.banden_std ? u.banden_std.achter : '');
    var el = h('div', {},
      h('div', { class: 'pbv-rij' }, veldBlok('Verhouding invoeren als', f.notatie), veldBlok('Status', f.status)),
      ratioVelden,
      h('div', { class: 'pbv-rij' }, TEKST.map(function (v) { return veldBlok(v[1], f[v[0]]); })),
      veldBlok('Opmerking', f.opmerking),
      h('details', {}, h('summary', {}, 'Wielaansluiting en standaardbanden'),
        h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, 'Voor'), h('th', {}, 'Achter'))), h('tbody', {}, wielRijen,
          h('tr', {}, h('th', {}, 'Standaardband'), h('td', {}, bandVoor), h('td', {}, bandAchter))))));
    function waarden() {
      var d = {};
      TEKST.forEach(function (v) { d[v[0]] = f[v[0]].value; });
      d.opmerking = f.opmerking.value;
      d.status = f.status.value;
      d.notatie = f.notatie.value;
      Object.keys(r).forEach(function (k) { d[k] = r[k].value; });
      d.wielen = { voor: {}, achter: {} };
      WIELVELDEN.forEach(function (v) { d.wielen.voor[v[0]] = wiel.voor[v[0]].value; d.wielen.achter[v[0]] = wiel.achter[v[0]].value; });
      d.banden_std = { voor: bandVoor.value, achter: bandAchter.value };
      return d;
    }
    return { el: el, waarden: waarden };
  }

  function uitvoeringFormulier(u, t, vervang) {
    var v = uitvoeringVelden(u);
    var status = h('div');
    var form = h('div', { class: 'pbv-blok' },
      h('h3', {}, u ? 'Uitvoering bewerken' : 'Uitvoering toevoegen'),
      v.el, status,
      h('div', { class: 'pbv-acties' },
        h('button', {
          onclick: function () {
            var d = v.waarden();
            leeg(status);
            var verzoek = u ? api('POST', '/uitvoeringen/' + u.id, d) : api('POST', '/uitvoeringen', Object.assign(d, { type_id: t.id }));
            verzoek.then(function (r) { S.types[t.id] = r.type; herlaadBoom(); route(); }).catch(function (e) { status.appendChild(melding(e.message, 'fout')); });
          }
        }, 'Opslaan'),
        h('button', { class: 'pbv-licht', onclick: function () { route(); } }, 'Annuleren'),
        u ? h('button', {
          class: 'pbv-gevaar', onclick: function () {
            if (!confirm('Deze uitvoering verwijderen?')) return;
            api('DELETE', '/uitvoeringen/' + u.id).then(function (r) {
              S.boom = r.boom; bouwIndex();
              if (r.type) { S.types[t.id] = r.type; route(); } else { delete S.types[t.id]; location.hash = '#/'; }
            });
          }
        }, 'Verwijderen') : null));
    vervang.parentNode.replaceChild(form, vervang);
  }

  function herlaadBoom() {
    api('GET', '/start').then(function (d) { S.boom = d.boom; bouwIndex(); });
  }

  function typeFormulier(t, links) {
    var ms = merkSerieVelden(t.merk, t.serie);
    var naam = tekstVeld('naam', t.naam);
    var alias = tekstVeld('aliassen', (t.aliassen || []).join(', '), 'gescheiden door komma’s');
    var status = h('div');
    var form = h('div', { class: 'pbv-blok' }, h('h3', {}, 'Type bewerken'), ms.el,
      h('div', { class: 'pbv-rij' }, veldBlok('Typenaam', naam), veldBlok('Andere namen (voor zoeken)', alias)), status,
      h('div', { class: 'pbv-acties' },
        h('button', {
          onclick: function () {
            leeg(status);
            api('POST', '/types/' + t.id, { merk: ms.merk.value, serie: ms.serie.value, naam: naam.value, aliassen: alias.value.split(',') })
              .then(function (r) { S.types[t.id] = r.type; S.boom = r.boom; bouwIndex(); route(); })
              .catch(function (e) { status.appendChild(melding(e.message, 'fout')); });
          }
        }, 'Opslaan'),
        h('button', { class: 'pbv-licht', onclick: function () { route(); } }, 'Annuleren')));
    links.insertBefore(form, links.firstChild);
  }

  function beheerNieuw(el) {
    el.appendChild(h('p', { class: 'pbv-zacht' }, 'Voeg een nieuwe trekker toe. Bestaan merk of serie nog niet, dan worden ze aangemaakt. Extra uitvoeringen voeg je daarna toe op de typepagina.'));
    var ms = merkSerieVelden('', '');
    var naam = tekstVeld('naam', '', 'bijv. 724 Vario');
    var alias = tekstVeld('aliassen', '', 'gescheiden door komma’s');
    var v = uitvoeringVelden(null);
    var status = h('div');
    el.appendChild(h('div', { class: 'pbv-blok' }, ms.el,
      h('div', { class: 'pbv-rij' }, veldBlok('Typenaam', naam), veldBlok('Andere namen (voor zoeken)', alias)),
      h('h3', {}, 'Eerste uitvoering'), v.el, status,
      h('button', {
        onclick: function () {
          leeg(status);
          api('POST', '/types', { merk: ms.merk.value, serie: ms.serie.value, naam: naam.value, aliassen: alias.value.split(','), uitvoering: v.waarden() })
            .then(function (r) { S.boom = r.boom; bouwIndex(); S.types[r.id] = r.type; location.hash = '#/type/' + r.id; })
            .catch(function (e) { status.appendChild(melding(e.message, 'fout')); });
        }
      }, 'Trekker opslaan')));
  }

  start();
})();
