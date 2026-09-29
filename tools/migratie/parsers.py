"""Parsers per bronbestand. Elke parser leest één bestand en voegt uitvoeringen toe aan de Dataset."""
import re

from bronlezer import (aanhaalmoment, bouten_draad, draad, getal, kolomnaam, open_werkboek,
                       schoon_mm, tekst, verhoudingen)


def wiel(**kw):
    uit = {}
    for k, v in kw.items():
        if v in (None, '', []):
            continue
        if isinstance(v, float) and v.is_integer():
            v = int(v)
        uit[k] = v
    return uit


def wielen(voor=None, achter=None):
    w = {}
    if voor:
        w['voor'] = voor
    if achter:
        w['achter'] = achter
    return w


def label(*delen):
    return ' · '.join(str(d).strip() for d in delen if d not in (None, '') and str(d).strip())


def voeg_verhoudingen_toe(ds, merk, serie, type_naam, basis, ruw, notatie, bron, extra_opm=()):
    """Maakt per gevonden verhouding een uitvoering; zonder verhouding één uitvoering zonder ratio."""
    waarden, opm = verhoudingen(ruw, notatie)
    opm = list(opm) + list(extra_opm)
    bron = dict(bron, origineel=tekst(ruw))
    if not waarden:
        u = dict(basis, ratio=None, ratio_origineel=tekst(ruw), ratio_notatie=notatie, bron=bron)
        return [ds.uitvoering(merk, serie, type_naam, u, opm if ruw not in (None, '') else extra_opm)]
    uit = []
    for n, w in enumerate(waarden):
        b = dict(basis)
        if len(waarden) > 1:
            b['label'] = label(b.get('label'), 'waarde %d van %d' % (n + 1, len(waarden)))
        u = dict(b, ratio=w, ratio_origineel=tekst(ruw), ratio_notatie=notatie, bron=bron)
        uit.append(ds.uitvoering(merk, serie, type_naam, u, opm))
    return uit


def cel(blad, r, c):
    return '%s%d' % (kolomnaam(c), r + 1)


# ===========================================================================
# Fendt (AGCO-export, .xls)
# ===========================================================================

def fendt_xls(ds, pad, bestand):
    for b in open_werkboek(pad):
        serie = b.naam.replace('_', ' ').strip()
        for r in range(4, b.nrows):
            typ = tekst(b.v(r, 0))
            if not typ:
                continue
            regio = None
            if re.search(r'\bNA\b', typ):
                regio = 'Noord-Amerika'
                typ = re.sub(r'\s*\bNA\b', '', typ).strip()
            jaren = [tekst(b.v(r, 25)), tekst(b.v(r, 26))]
            opm_bron = tekst(b.v(r, 24))
            vooras = tekst(b.v(r, 9))
            basis = {
                'label': label('–'.join(j or '' for j in jaren) if any(jaren) else None, opm_bron,
                               ('VA ' + vooras) if vooras else None, regio),
                'transmissie': tekst(b.v(r, 6)), 'vooras': vooras, 'achteras': tekst(b.v(r, 8)),
                'chassis_van': tekst(b.v(r, 1)), 'chassis_tot': tekst(b.v(r, 2)),
                'bouwjaar_van': tekst(b.v(r, 25)), 'bouwjaar_tot': tekst(b.v(r, 26)), 'regio': regio,
                'extra': {k: v for k, v in {
                    'Motor': tekst(b.v(r, 3)), 'Vermogen (kW)': tekst(b.v(r, 4)), 'Versnellingen': tekst(b.v(r, 5)),
                    'Kegelwielset': tekst(b.v(r, 7)), 'Overbrenging vooras': tekst(b.v(r, 10))}.items() if v},
                'wielen': wielen(
                    voor=wiel(flensmaat=schoon_mm(b.v(r, 13)), bouten=getal(b.v(r, 19)), steekcirkel=schoon_mm(b.v(r, 20)),
                              naafgat=schoon_mm(b.v(r, 21)), draad=draad(tekst(b.v(r, 22))),
                              aanhaalmoment=getal(b.v(r, 23))),
                    achter=wiel(flensmaat=schoon_mm(b.v(r, 12)), bouten=getal(b.v(r, 14)), steekcirkel=schoon_mm(b.v(r, 15)),
                                naafgat=schoon_mm(b.v(r, 16)), draad=draad(tekst(b.v(r, 17))),
                                aanhaalmoment=getal(b.v(r, 18)))),
            }
            ruw = b.v(r, 11)
            opm = []
            tweewiel = vooras is None or bool(re.search(r'\bHR\b|2WD', vooras))
            if tweewiel and (ruw is None or getal(ruw) == 0):
                basis['label'] = label(basis['label'], '2WD')
            if ruw is not None and getal(ruw) == 0:
                if tweewiel:
                    ruw = None          # tweewielaandrijving: geen verhouding
                else:
                    opm.append('verhouding 0 in bron')
                    ruw = None
            voeg_verhoudingen_toe(ds, 'Fendt', serie, typ, basis, ruw, 'va_ha',
                                  {'bestand': bestand, 'blad': b.naam, 'cel': cel(b, r, 11)}, opm)


# ===========================================================================
# Fendt (PDF, stand november 2023)
# ===========================================================================

BAND = re.compile(r'\d+(?:[.,]\d+)?(?:/\d+)?\s*(?:R|L-|-)\s*\d+(?:[.,]\d+)?')


def fendt_pdf(ds, pad, bestand):
    import pdfplumber
    serie, generatie = None, None
    with pdfplumber.open(pad) as pdf:
        regels = []
        for p in pdf.pages:
            regels += (p.extract_text() or '').splitlines()
    for regel in regels:
        regel = regel.strip()
        m = re.match(r'^(?P<typ>.+?)\s+(?:T\s+)?(?P<vin>\d{3}(?:\s*/\s*\d{3})?)\s+(?P<pn>\d+\s*/\s*\d+)\s+'
                     r'(?P<pm>\d+\s*/\s*\d+)\s+(?P<fv>\d+\s*/\s*\d+)\s+(?P<fa>\d+\s*/\s*\d+)\s+(?P<as>.*?)\s*'
                     r'(?P<i>0,\d+)\s*(?P<rest>.*)$', regel)
        if not m:
            kop = re.match(r'^(\d{3,4}\s*(?:[A-Z]\s+)?(?:Vario)?)\s*(Gen\s*\d(?:\s*/\s*Gen\s*\d)?|S4)?\s*$', regel)
            if kop and not re.search(r'\d{3}\s+\d', regel):
                serie = re.sub(r'\s+', ' ', kop.group(1)).strip()
                generatie = (kop.group(2) or '').replace(' ', '') or None
            continue
        typ = re.sub(r'\s+T$', '', m.group('typ')).strip()
        gen = generatie
        g = re.search(r'\s+(Gen\s*\d)$', typ)
        if g:
            gen = g.group(1).replace(' ', '')
            typ = typ[:g.start()].strip()
        rest = m.group('rest')
        dmax = re.search(r'(\d{4})\s*$', rest)
        banden = BAND.findall(rest)
        opm = []
        if len(banden) != 2:
            opm.append('standaardbanden niet eenduidig uit de PDF te lezen: "%s"' % rest)
        fv, fa = [x.replace(' ', '') for x in (m.group('fv'), m.group('fa'))]
        vin = m.group('vin').replace(' ', '')
        basis = {
            'label': label(gen, 'stand nov. 2023'), 'vooras': m.group('as').strip() or None,
            'chassis_van': vin.split('/')[0], 'extra': {'Chassisprefix (FgNr)': vin,
                                                         'Vermogen nominaal kW/pk': m.group('pn').replace(' ', ''),
                                                         'Vermogen max kW/pk': m.group('pm').replace(' ', '')},
            'wielen': wielen(voor=wiel(flensmaat=fv.split('/')[0], bouten=getal(fv.split('/')[1])),
                             achter=wiel(flensmaat=fa.split('/')[0], bouten=getal(fa.split('/')[1]))),
            'banden_std': {'voor': banden[0] if len(banden) > 0 else None,
                           'achter': banden[1] if len(banden) > 1 else None},
        }
        if dmax:
            basis['extra']['Max. banddiameter (mm)'] = dmax.group(1)
        voeg_verhoudingen_toe(ds, 'Fendt', serie or 'Overig', typ, basis, m.group('i'), 'va_ha',
                              {'bestand': bestand, 'blad': 'pdf', 'cel': typ}, opm)


# ===========================================================================
# Massey Ferguson
# ===========================================================================

def steekmaat(s):
    """'8 x 275 (M18)' -> (8, '275', 'M18'); '8 x 203,2 (11/16-16)' -> (8, '203,2', '11/16-16')."""
    if not s:
        return None, None, None
    m = re.match(r'^\s*(\d+)\s*[xX]\s*([\d.,]+)\s*(?:\((.+?)\))?', str(s))
    if not m:
        return None, schoon_mm(s), None
    return int(m.group(1)), m.group(2).replace('.', ','), draad(m.group(3)) if m.group(3) else None


def massey(ds, pad, bestand):
    for b in open_werkboek(pad):
        for r in range(1, b.nrows):
            serie, typ = tekst(b.v(r, 0)), tekst(b.v(r, 1))
            if not typ:
                continue
            bv, pv, dv = steekmaat(b.v(r, 4))
            ba, pa, da = steekmaat(b.v(r, 7))
            trans = tekst(b.v(r, 2))
            basis = {
                'label': label(trans if trans and trans.lower() != 'alle' else None, tekst(b.v(r, 3))),
                'transmissie': trans, 'vooras': tekst(b.v(r, 3)), 'achteras': tekst(b.v(r, 6)),
                'wielen': wielen(voor=wiel(bouten=bv, steekcirkel=pv, draad=dv, flensmaat=schoon_mm(b.v(r, 5))),
                                 achter=wiel(bouten=ba, steekcirkel=pa, draad=da, flensmaat=schoon_mm(b.v(r, 8)),
                                             spacer=schoon_mm(b.v(r, 10)))),
            }
            m = re.search(r'(- R42|≥ R38)', trans or '')
            if m:
                basis['voorwaarde'] = 'achterband ' + m.group(1).replace('- ', '')
            voeg_verhoudingen_toe(ds, 'Massey Ferguson', serie or b.naam, typ, basis, b.v(r, 9), 'direct',
                                  {'bestand': bestand, 'blad': b.naam, 'cel': cel(b, r, 9)})


# ===========================================================================
# New Holland en Case IH/Steyr: tabellen "WIELAANSLUITMATEN | OVERBRENGINGSVERHOUDING"
# ===========================================================================

STOP = re.compile(r'(max\.? ?toegestane|^drive$|axle class|^vooras klasse|weight|^brand:|^concern|^action|'
                  r'unrestricted|restricted|^4wd fa|^gvw|dimension across|^oscillation|^[a-e]$|axle capacity)', re.I)


def _kop_tekst(b, r, c):
    return (tekst(b.kop(r, c)) or '').upper()


def cnh_blad(ds, b, merk, serie, bestand):
    """Leest één werkblad met één of meer tabellen in de opzet van New Holland / Case IH."""
    r = 0
    notities = []
    while r < b.nrows:
        # zoek een kopregel met TYPE
        kolommen = [(c, _kop_tekst(b, r, c)) for c in range(b.ncols)]
        typ_col = next((c for c, t in kolommen if t == 'TYPE'), None)
        if typ_col is None or not any('FLENSMAAT' in t for _, t in kolommen):
            rijtekst = [tekst(x) for x in b.rij(r) if x is not None]
            if len(rijtekst) == 1 and isinstance(rijtekst[0], str) and len(rijtekst[0]) > 25:
                notities.append(rijtekst[0])
            r += 1
            continue
        kop, sub = r, r + 1
        titel = r - 2 if r >= 2 else r - 1
        # start van het verhoudingsdeel: kolom met OVERBRENGINGSVERHOUDING in de titelregel(s)
        ratio_start = None
        for rr in range(max(0, r - 2), r):
            for c in range(b.ncols):
                if 'OVERBRENGING' in _kop_tekst(b, rr, c):
                    ratio_start = c if ratio_start is None else min(ratio_start, c)
                    break
        groepen = {}
        for c, t in kolommen:
            for naam in ('FLENSMAAT', 'NAAFGAT', 'STEEKCIRKEL', 'WIELBOUTEN'):
                if naam in t:
                    groepen.setdefault(naam, c)
        grens = sorted(groepen.values()) + [ratio_start if ratio_start is not None else b.ncols]
        wielkol = {}
        for naam, c in groepen.items():
            eind = min(x for x in grens if x > c)
            if naam == 'WIELBOUTEN' and ratio_start is None:
                eind = c + 2
            subs = [(cc, _kop_tekst(b, sub, cc)) for cc in range(c, eind)]
            voor = next((cc for cc, t in subs if 'VOOR' in t and '4' in t), None)
            if voor is None:
                voor = next((cc for cc, t in subs if 'VOOR' in t), c)
            achter = next((cc for cc, t in subs if 'ACHTER' in t and 'BAR' not in t), None)
            if achter is None:
                achter = voor + 1
            wielkol[naam] = (voor, achter)
        if ratio_start is None:
            ratio_start = max(a for _, a in wielkol.values()) + 1 if wielkol else typ_col + 1
        # attribuutkolommen tussen TYPE en eerste wielgroep
        eerste_wiel = min(groepen.values()) if groepen else ratio_start
        attr = {}
        for c in range(typ_col + 1, eerste_wiel):
            t = (_kop_tekst(b, kop, c) + ' ' + _kop_tekst(b, sub, c)).strip()
            attr[c] = t
        # kolom vóór TYPE (bv. 'Uitvoering' bij T6000)
        voor_type = typ_col - 1 if typ_col > 0 and tekst(b.v(kop, typ_col - 1)) else None
        # verhoudingskolommen
        ratiokol = {}
        koppel = None
        for c in range(ratio_start, b.ncols):
            t1, t2 = tekst(b.kop(kop, c)), tekst(b.kop(sub, c))
            k = ' '.join(x for x in (t1, t2) if x and x.upper() not in ('V/A',))
            if (t1 or '').upper() in ('(NM)',):
                koppel = c
                continue
            if (t1 or '').upper() == 'TYPE':
                attr[c] = 'ASTYPE'
                continue
            if k:
                ratiokol[c] = k          # kolommen zonder kop zijn notities of infoblokken
        # datarijen
        r = sub + 1
        vorig_type, groepsnaam, uitv = None, None, None
        while r < b.nrows:
            if _kop_tekst(b, r, typ_col) == 'TYPE' or any(_kop_tekst(b, r, c) == 'TYPE' for c in range(b.ncols)):
                break
            rij = b.rij(r)
            eerste = tekst(b.v(r, typ_col))
            if eerste and STOP.search(eerste) or (voor_type is not None and STOP.search(tekst(b.v(r, voor_type)) or '')):
                break
            wieldata = any(b.v(r, c) is not None for c in [a for p in wielkol.values() for a in p] + list(attr))
            ratiodata = any(verhoudingen(b.v(r, c))[0] for c in ratiokol)
            heeft_data = wieldata or (ratiodata and (eerste or vorig_type))
            if not eerste and not (wieldata and ratiodata):
                heeft_data = False
            if voor_type is not None and tekst(b.v(r, voor_type)):
                uitv = tekst(b.v(r, voor_type))
            if not heeft_data:
                if eerste and len(eerste) <= 25:
                    groepsnaam = eerste          # bv. 'JXU' in Oude Reeksen
                elif eerste:
                    notities.append(eerste)
                r += 1
                continue
            typ = eerste or vorig_type
            if not typ:
                r += 1
                continue
            if eerste and groepsnaam and re.match(r'^\d+$', eerste):
                typ = groepsnaam + ' ' + eerste
            vorig_type = typ
            if eerste and eerste.lower().startswith('sheet'):
                break

            def wv(naam, idx):
                p = wielkol.get(naam)
                return b.v(r, p[idx]) if p else None

            bv, dv = bouten_draad(wv('WIELBOUTEN', 0))
            ba, da = bouten_draad(wv('WIELBOUTEN', 1))
            torque = tekst(b.v(r, koppel)) if koppel is not None else None
            tv = ta = None
            if torque:
                delen = re.findall(r'\d+', torque)
                tv = int(delen[0]) if delen else None
                ta = int(delen[1]) if len(delen) > 1 else tv
            tv = tv or aanhaalmoment(wv('WIELBOUTEN', 0))
            ta = ta or aanhaalmoment(wv('WIELBOUTEN', 1))
            kenmerken = {}
            for c, t in attr.items():
                val = tekst(b.v(r, c))
                if not val:
                    continue
                if t == 'ASTYPE':
                    kenmerken['vooras'] = val
                elif 'KL' in t.split() and not re.match(r'^\d{2}\b', val):
                    kenmerken.setdefault('asklasse', []).append(val)
                elif 'KM' in t:
                    km = re.match(r'^(\d+)\s*(.*)$', val)
                    if km:
                        kenmerken['snelheid'] = int(km.group(1))
                        if km.group(2):
                            kenmerken['extra_label'] = km.group(2)
                    else:
                        kenmerken['extra_label'] = val
                elif t.startswith('KL') or 'KLASSE' in t or t in ('VA',) or 'A-AS' in t:
                    kenmerken.setdefault('asklasse', []).append(val)
                else:
                    kenmerken['extra_label'] = val
            basis = {
                'label': None, 'snelheid': kenmerken.get('snelheid'), 'vooras': kenmerken.get('vooras'),
                'asklasse': ' / '.join(kenmerken.get('asklasse', [])) or None,
                'wielen': wielen(
                    voor=wiel(flensmaat=schoon_mm(wv('FLENSMAAT', 0)), naafgat=schoon_mm(wv('NAAFGAT', 0)),
                              steekcirkel=schoon_mm(wv('STEEKCIRKEL', 0)), bouten=bv, draad=dv, aanhaalmoment=tv),
                    achter=wiel(flensmaat=schoon_mm(wv('FLENSMAAT', 1)), naafgat=schoon_mm(wv('NAAFGAT', 1)),
                                steekcirkel=schoon_mm(wv('STEEKCIRKEL', 1)), bouten=ba, draad=da, aanhaalmoment=ta)),
            }
            notitie_rij = [tekst(b.v(r, c)) for c in range(ratio_start, b.ncols)
                           if c not in ratiokol and b.v(r, c) is not None]
            gevonden = False
            for c, kolomlabel in ratiokol.items():
                ruw = b.v(r, c)
                if ruw is None:
                    continue
                w_, o_ = verhoudingen(ruw)
                if not w_ and not o_:
                    if isinstance(ruw, str) and ruw.strip().lower() not in ('----', 'n/a', 'niet leverbaar', 'upgrade'):
                        notitie_rij.append('%s: %s' % (kolomlabel, ruw.strip()))
                    continue
                gevonden = True
                b2 = dict(basis)
                b2['transmissie'] = kolomlabel or None
                b2['label'] = label(uitv, kenmerken.get('extra_label'),
                                    ('%d km/h' % basis['snelheid']) if basis.get('snelheid') else None,
                                    kolomlabel, ('klasse ' + basis['asklasse']) if basis.get('asklasse') else None)
                if notitie_rij:
                    b2['opmerking'] = '; '.join(x for x in notitie_rij if x)
                voeg_verhoudingen_toe(ds, merk, serie, typ, b2, ruw, 'direct',
                                      {'bestand': bestand, 'blad': b.naam, 'cel': cel(b, r, c)})
            if not gevonden:
                b2 = dict(basis, label=label(uitv, kenmerken.get('extra_label'),
                                             ('%d km/h' % basis['snelheid']) if basis.get('snelheid') else None))
                if notitie_rij:
                    b2['opmerking'] = '; '.join(x for x in notitie_rij if x)
                ds.uitvoering(merk, serie, typ, dict(b2, ratio=None, bron={'bestand': bestand, 'blad': b.naam,
                                                                          'cel': cel(b, r, typ_col)}))
            r += 1
    for n in notities:
        ds.notitie(merk, serie, n)


def new_holland(ds, pad, bestand):
    for b in open_werkboek(pad):
        if b.nrows <= 1:
            continue
        serie = re.sub(r'\s*\(\d+\)$', '', b.naam).replace('TD$', 'TD4').replace(',', '.').strip()
        cnh_blad(ds, b, 'New Holland', serie, bestand)


def case_steyr(ds, pad, bestand):
    for b in open_werkboek(pad):
        if b.nrows <= 1 or b.verborgen:
            continue            # verborgen tabbladen zijn kopieën van New Holland
        serie = b.naam.strip()
        if b.naam == 'Oude Reeksen':
            oude_reeksen(ds, b, bestand)
        else:
            cnh_blad(ds, b, 'Case IH / Steyr', serie, bestand)
    ds.algemene_review('Case IH / Steyr', bestand, 'Quantum',
                       'Tabblad "Quantum" bevat New Holland-typenamen (TNF, TND, TNV …). Controleren of dit de '
                       'Case IH Quantum-gegevens zijn of een kopie van New Holland.')


def oude_reeksen(ds, b, bestand):
    """Case IH 'Oude Reeksen': blokken met groepskop, klassekolommen (Cl 3/Cl 4) en losse verhoudingskolommen."""
    merk, serie = 'Case IH / Steyr', 'Oude reeksen'
    blokken = [r for r in range(b.nrows) if any(_kop_tekst(b, r, c) == 'TYPE' for c in range(b.ncols))]
    for n, h in enumerate(blokken):
        eind = blokken[n + 1] - 3 if n + 1 < len(blokken) else b.nrows
        kop = {}
        for c in range(b.ncols):
            if _kop_tekst(b, h, c):
                kop.setdefault(_kop_tekst(b, h, c), c)
        tc = kop['TYPE']
        oc = next((c for rr in range(max(0, h - 3), h) for c in range(b.ncols)
                   if 'OVERBRENGING' in _kop_tekst(b, rr, c)), b.ncols)
        groepen = sorted((kop[g], g) for g in ('FLENSMAAT', 'NAAFGAT', 'STEEKCIRKEL', 'WIELBOUTEN') if g in kop)
        span = {}
        for i, (c, g) in enumerate(groepen):
            c_eind = groepen[i + 1][0] if i + 1 < len(groepen) else oc
            achter = next((cc for cc in range(c, c_eind) if 'ACHTER' in _kop_tekst(b, h + 1, cc)), c + 1)
            span[g] = (c, achter, c_eind)
        voorwaarde = ' '.join(tekst(b.v(rr, 0)) for rr in range(h - 2, h + 2)
                              if rr >= 0 and tc > 0 and tekst(b.v(rr, 0))) or None
        groep, klassen, ratio_labels = None, {}, {}
        for r in range(h + 2, eind):
            t = tekst(b.v(r, tc))
            if _kop_tekst(b, r, tc + 1 if tc + 1 < b.ncols else tc) in ('AANTAL',) or 'AANTAL' in [
                    _kop_tekst(b, r, c) for c in range(b.ncols)]:
                continue
            waarden = {c: b.v(r, c) for c in range(b.ncols) if b.v(r, c) is not None}
            if not waarden:
                continue
            # klasse- en labelregels (Cl 3 / Cl 4 / Ratio A / Vast en geveerd)
            if all(isinstance(v, str) and not verhoudingen(v)[0] and not re.match(r'^\d+$', v)
                   for v in waarden.values()):
                if t and not any(re.match(r'^(cl|ratio)', str(v), re.I) for v in waarden.values()):
                    groep = t
                for c, v in waarden.items():
                    if re.match(r'^(cl|ratio)', str(v), re.I):
                        if c >= oc:
                            ratio_labels[c] = str(v)
                        else:
                            klassen[c] = str(v)
                continue
            if not t:
                continue
            typ = '%s %s' % (groep, t) if groep and re.match(r'^\d', t) else t

            def deel(g, voor=True):
                if g not in span:
                    return None
                c, achter, c_eind = span[g]
                cols = range(c, achter) if voor else range(achter, c_eind)
                vals = [(cc, tekst(b.v(r, cc))) for cc in cols if b.v(r, cc) is not None]
                if g == 'WIELBOUTEN':
                    return [v for _, v in vals]
                if len(vals) > 1:
                    return ' / '.join('%s (%s)' % (v, klassen.get(cc, '')) if klassen.get(cc) else v for cc, v in vals)
                return vals[0][1] if vals else None

            bv = deel('WIELBOUTEN', True) or []
            ba = deel('WIELBOUTEN', False) or []
            opm = [tekst(v) for c, v in waarden.items() if c > oc and not verhoudingen(v)[0]
                   and c not in ratio_labels and isinstance(v, str)]
            basis = {
                'voorwaarde': voorwaarde, 'opmerking': '; '.join(opm) or None,
                'wielen': wielen(
                    voor=wiel(flensmaat=schoon_mm(deel('FLENSMAAT')), naafgat=schoon_mm(deel('NAAFGAT')),
                              steekcirkel=schoon_mm(deel('STEEKCIRKEL')), bouten=getal(bv[0]) if bv else None,
                              draad=draad(bv[1]) if len(bv) > 1 else None),
                    achter=wiel(flensmaat=schoon_mm(deel('FLENSMAAT', False)), naafgat=schoon_mm(deel('NAAFGAT', False)),
                                steekcirkel=schoon_mm(deel('STEEKCIRKEL', False)), bouten=getal(ba[0]) if ba else None,
                                draad=draad(ba[1]) if len(ba) > 1 else None)),
            }
            gevonden = False
            for c in range(oc, b.ncols):
                ruw = b.v(r, c)
                if ruw is None or not verhoudingen(ruw)[0]:
                    continue
                gevonden = True
                kolom = ratio_labels.get(c) or tekst(b.kop(h, c)) or None
                b2 = dict(basis, transmissie=kolom, label=label(voorwaarde, kolom))
                voeg_verhoudingen_toe(ds, merk, serie, typ, b2, ruw, 'direct',
                                      {'bestand': bestand, 'blad': b.naam, 'cel': cel(b, r, c)})
            if not gevonden:
                ds.uitvoering(merk, serie, typ, dict(basis, label=label(voorwaarde), ratio=None,
                                                     bron={'bestand': bestand, 'blad': b.naam, 'cel': cel(b, r, tc)}))


# ===========================================================================
# Deutz-Fahr, SAME, Lamborghini (xlsx)
# ===========================================================================

NOTITIE = re.compile(r'^(boutgat|cilindrisch|conisch|met |asgat|113 mm|gat conisch|kleine wielen|grote wielen|'
                     r'\d{4} \d{3} \d{3}|vanaf|\d+$|modellen|boutgaten)', re.I)


def deutz_serie_uit_naam(naam):
    n = re.sub(r'\(.*?\)', '', naam).strip()
    n = re.sub(r'^AT\s+', 'Agrotron ', n)
    if re.match(r'^\d', n):
        return 'Serie %s%s' % (n[0], ' TTV' if 'TTV' in n else '')
    woorden = n.split()
    kop = []
    for w in woorden:
        if re.search(r'\d', w):
            letters = re.match(r'^([A-Za-z]+)\d', w)
            if letters:
                kop.append(letters.group(1))
            break
        kop.append(w)
    return ' '.join(kop) or n


def deutz_sluit(s):
    """'139,7x5' of '139,7 / 5' -> (steekcirkel, bouten)."""
    if not s:
        return None, None
    m = re.match(r'^\s*([\d.,]+)\s*[x/]\s*(\d+)', str(s))
    if m:
        return m.group(1).replace('.', ','), int(m.group(2))
    return schoon_mm(s), None


def deutz_xlsx(ds, pad, bestand):
    for b in open_werkboek(pad):
        naam = b.naam
        if naam in ('Huidig', 'Meest gangbaar'):
            for r in range(2, b.nrows):
                typ = tekst(b.v(r, 0))
                if not typ or typ.startswith('*'):
                    continue
                pv, bv = deutz_sluit(b.v(r, 3))
                pa, ba = deutz_sluit(b.v(r, 8))
                basis = {'label': None, 'wielen': wielen(
                    voor=wiel(flensmaat=schoon_mm(b.v(r, 2)), steekcirkel=pv, bouten=bv, boutgat=schoon_mm(b.v(r, 4)),
                              naafgat=schoon_mm(b.v(r, 5)), boutzitting=tekst(b.v(r, 6))),
                    achter=wiel(flensmaat=schoon_mm(b.v(r, 7)), steekcirkel=pa, bouten=ba, boutgat=schoon_mm(b.v(r, 9)),
                                naafgat=schoon_mm(b.v(r, 10)), boutzitting=tekst(b.v(r, 11))))}
                if '*' in (tekst(b.v(r, 2)) or ''):
                    basis['opmerking'] = '* met geremde vooras'
                merk = 'Deutz-Fahr'
                voeg_verhoudingen_toe(ds, merk, deutz_serie_uit_naam(typ), typ, basis, b.v(r, 1), 'direct',
                                      {'bestand': bestand, 'blad': naam, 'cel': cel(b, r, 1)})
        elif naam in ('Deutz-Fahr <2011', 'Deutz-Fahr 92-95', 'Lamborghini', 'SAME', 'SAME OUD'):
            merk = {'Lamborghini': 'Lamborghini', 'SAME': 'SAME', 'SAME OUD': 'SAME'}.get(naam, 'Deutz-Fahr')
            if naam == 'SAME':
                cols = {'typ': 1, 'sn': 2, 'ratio': [(3, None)], 'v': 4, 'a': 7}
            elif naam == 'SAME OUD':
                cols = {'typ': 1, 'sn': None, 'ratio': [(2, 30), (3, 40)], 'v': 4, 'a': 7}
            else:
                cols = {'typ': 1, 'sn': None, 'ratio': [(2, None)], 'v': 3, 'a': 6}
            serie = None
            for r in range(2, b.nrows):
                a = tekst(b.v(r, 0))
                notitie = None
                if a and not NOTITIE.match(a) and not a.strip() == '':
                    serie = a.strip()
                elif a:
                    notitie = a
                typ = tekst(b.v(r, cols['typ']))
                if not typ or not serie:
                    continue
                snelheid = None
                m = re.search(r'(\d0)\s*km', typ)
                if m:
                    snelheid = int(m.group(1))
                pv, bv = deutz_sluit(b.v(r, cols['v'] + 1))
                pa, ba = deutz_sluit(b.v(r, cols['a'] + 1))
                sn = tekst(b.v(r, cols['sn'])) if cols['sn'] is not None else None
                basis = {
                    'label': label(sn if sn and not re.match(r'^\d', sn or '') else None),
                    'voorwaarde': label(('serienr. ' + sn) if sn and re.search(r'\d', sn) else None,
                                        notitie if notitie and re.search(r'wielen|\d{4} \d{3}', notitie, re.I) else None)
                    or None,
                    'snelheid': snelheid,
                    'wielen': wielen(
                        voor=wiel(flensmaat=schoon_mm(b.v(r, cols['v'])), steekcirkel=pv, bouten=bv,
                                  draad=draad(tekst(b.v(r, cols['v'] + 2)))),
                        achter=wiel(flensmaat=schoon_mm(b.v(r, cols['a'])), steekcirkel=pa, bouten=ba,
                                    draad=draad(tekst(b.v(r, cols['a'] + 2))))),
                }
                model = '%s %s' % (serie, typ) if not typ.lower().startswith(serie.lower()) else typ
                for c, km in cols['ratio']:
                    ruw = b.v(r, c)
                    if isinstance(ruw, str) and not re.search(r'\d[.,]\d', ruw):
                        if ruw.strip():
                            basis['opmerking'] = ruw.strip()
                        ruw = None
                    b2 = dict(basis)
                    if km:
                        b2['snelheid'] = km
                        b2['label'] = label(basis['label'], '%d km/h' % km)
                    if ruw is None and len(cols['ratio']) > 1:
                        continue
                    voeg_verhoudingen_toe(ds, merk, serie, model, b2, ruw, 'direct',
                                          {'bestand': bestand, 'blad': naam, 'cel': cel(b, r, c)})
        elif naam == 'Deutz-Fahr OUD':
            vooras_tabel, trans_tabel = {}, {}
            for r in range(1, b.nrows):
                if b.v(r, 8):
                    vooras_tabel[str(b.v(r, 8)).strip().upper().replace(' ', '')] = r
                if b.v(r, 14):
                    trans_tabel[str(b.v(r, 14)).strip().upper().replace(' ', '')] = r

            def boutinfo(r, c):
                s = tekst(b.v(r, c)) or ''
                m = re.match(r'^(\d+)\s+(.+)$', s)
                return (int(m.group(1)), draad(m.group(2))) if m else (None, None)

            for r in range(2, b.nrows):
                typ = tekst(b.v(r, 0))
                if not typ:
                    continue
                vooras, trans = tekst(b.v(r, 2)), tekst(b.v(r, 3))
                wv = wa = None
                k = (vooras or '').upper().replace(' ', '')
                for sleutel_tabel, rr in vooras_tabel.items():
                    if sleutel_tabel.endswith(k) and k:
                        n, d = boutinfo(rr, 11)
                        wv = wiel(flensmaat=schoon_mm(b.v(rr, 9)), steekcirkel=schoon_mm(b.v(rr, 10)), bouten=n, draad=d)
                        break
                k = (trans or '').upper().replace(' ', '')
                if k in trans_tabel:
                    rr = trans_tabel[k]
                    n, d = boutinfo(rr, 17)
                    wa = wiel(flensmaat=schoon_mm(b.v(rr, 15)), steekcirkel=schoon_mm(b.v(rr, 16)), bouten=n, draad=d)
                variant = tekst(b.v(r, 1))
                nr = tekst(b.v(r, 4))
                basis = {'label': label(variant and 'uitvoering ' + variant, 'VA ' + vooras if vooras else None,
                                        trans),
                         'vooras': vooras, 'transmissie': trans,
                         'voorwaarde': nr if nr and 'VANAF' in nr.upper() else None,
                         'wielen': wielen(voor=wv, achter=wa)}
                if nr and 'VANAF' not in nr.upper():
                    basis['opmerking'] = nr
                opm = []
                if wv is None or wa is None:
                    opm = []  # wielmaten ontbreken: geen reviewpunt, alleen informatief
                serie = re.match(r'^([A-Z]+)', typ.replace(' ', ''))
                voeg_verhoudingen_toe(ds, 'Deutz-Fahr', 'Oude typen ' + (serie.group(1) if serie else ''), typ, basis,
                                      b.v(r, 5), 'direct', {'bestand': bestand, 'blad': naam, 'cel': cel(b, r, 5)}, opm)


# ===========================================================================
# Deutz-Fahr / SAME / Lamborghini (PDF met productcodes)
# ===========================================================================

def deutz_pdf(ds, pad, bestand):
    import collections

    import pdfplumber
    with pdfplumber.open(pad) as pdf:
        tb = pdf.pages[0].find_tables()[0]
        kop = tb.rows[2]
        xs = sorted(set([c[0] for c in kop.cells if c] + [c[2] for c in kop.cells if c]))
        serie = None
        for pg in pdf.pages:
            regels = collections.defaultdict(list)
            for ch in pg.chars:
                regels[round(ch['top'] / 2)].append(ch)
            woorden_per_regel = collections.defaultdict(list)
            for w in pg.extract_words(keep_blank_chars=False):
                woorden_per_regel[round(w['top'] / 2)].append(w)
            for k in sorted(regels):
                cols = [''] * (len(xs) - 1)
                for ch in sorted(regels[k], key=lambda c: c['x0']):
                    xm = (ch['x0'] + ch['x1']) / 2
                    for j in range(len(xs) - 1):
                        if xs[j] <= xm < xs[j + 1]:
                            cols[j] += ch['text']
                            break
                cols = [c.strip() for c in cols]
                naam, ratio = cols[0], cols[6]
                if naam and not ratio and not re.search(r'\d{4}', naam) and naam not in ('Handelsnaam',):
                    if naam not in ('Deutz-Fahr', 'SAME DEUTZ-FAHR'):
                        serie = naam
                    continue
                if not ratio or not re.search(r'\d,\d', ratio) or not naam:
                    continue
                # front: flensmaat / aantal / boutgat uit woorden in kolom 8
                ws = [w['text'] for w in woorden_per_regel.get(k, []) if xs[8] <= (w['x0'] + w['x1']) / 2 < xs[9]]
                fl = bt = bg = None
                if len(ws) >= 3:
                    fl, bt, bg = ws[0], ws[1], ws[2]
                elif ws:
                    fl = ws[0]
                ruw = ratio
                opm = []
                if '(STD)' in ratio:
                    opm.append('verhouding gemarkeerd als (STD) in de PDF')
                basis = {
                    'label': label(cols[7] and 'kastmaat ' + cols[7]),
                    'extra': {k2: v for k2, v in {'Productcode': cols[1],
                                                  'Lamborghini': cols[2] if cols[2] not in ('XXX', '') else None,
                                                  'SAME': cols[4] if cols[4] not in ('XXX', '') else None,
                                                  'Grootste afrolomtrek (mm)': cols[16]}.items() if v},
                    'wielen': wielen(
                        voor=wiel(flensmaat=fl, bouten=getal(bt), boutgat=bg, steekcirkel=cols[9] or None,
                                  naafgat=cols[10] or None),
                        achter=wiel(flensmaat=cols[11] or None, bouten=getal(cols[12]), boutgat=cols[13] or None,
                                    steekcirkel=cols[14] or None, naafgat=cols[15] or None)),
                }
                voeg_verhoudingen_toe(ds, 'Deutz-Fahr', serie or 'Overig', naam, basis, ruw, 'direct',
                                      {'bestand': bestand, 'blad': 'pdf p%d' % (pdf.pages.index(pg) + 1), 'cel': naam},
                                      opm)


# ===========================================================================
# John Deere
# ===========================================================================

def jd_serie(naam):
    m = re.match(r'^\s*(\d)', naam or '')
    return ('%s000-serie' % m.group(1)) if m else 'Overig'


def john_deere(ds, pad, bestand):
    bladen = {b.naam: b for b in open_werkboek(pad)}
    merk = 'John Deere'

    # -- tabellen met kolommen 0..5 % voorloop ------------------------------
    for naam, voorwaarde in (('60x0 < sn 251536', 'tot sn 251536'),
                             ('60x0 >sn 251536, RW 10 serie', 'vanaf sn 251536'),
                             ('6020 oud, RW 20 serie', None)):
        b = bladen[naam]
        for r in range(b.nrows):
            typ = tekst(b.v(r, 0))
            ruw = b.v(r, 1)
            if not typ or not isinstance(ruw, float):
                continue
            if typ.upper().startswith(('LET OP', 'MET BEHULP')):
                continue
            basis = {'label': label(voorwaarde, ('diff ' + tekst(b.v(r, 7))) if b.v(r, 7) else None),
                     'voorwaarde': voorwaarde,
                     'componenten': {k: v for k, v in {'differentieel achter': tekst(b.v(r, 7)),
                                                        'vooras': tekst(b.v(r, 8)),
                                                        'MFWD-bak': tekst(b.v(r, 9))}.items() if v}}
            if b.v(r, 10) and naam.startswith('6020'):
                basis['extra'] = {'Bestelnummer MFWD-bak': tekst(b.v(r, 10))}
            voeg_verhoudingen_toe(ds, merk, jd_serie(typ), typ.strip(), basis, ruw, 'direct',
                                  {'bestand': bestand, 'blad': naam, 'cel': cel(b, r, 1)})
        for r in range(b.nrows):
            rij = [tekst(x) for x in b.rij(r) if x is not None]
            regel = ' '.join(x for x in rij if isinstance(x, str))
            if re.search(r'LET OP|CONTROLEER|typeplaat|voorbehoud|50km|standaard|DTAC|afwijken', regel, re.I) \
                    and not re.search(r'deel afrolomtrek|zoek in de juiste|^\d', regel, re.I):
                ds.notitie(merk, 'Algemeen', regel)

    # -- MFWD-bakcodes (rechterkant) als notitie -----------------------------
    b = bladen['60x0 >sn 251536, RW 10 serie']
    codes = []
    for r in range(12, 25):
        code, nieuw, oud, nr = b.v(r, 11), b.v(r, 12), b.v(r, 13), b.v(r, 14)
        if code:
            codes.append('%s: nieuw %s, oud %s, bestelnr. %s' % (code, tekst(nieuw) or '-', tekst(oud) or '-',
                                                                  tekst(nr) or '-'))
    ds.notitie(merk, 'Algemeen', 'MFWD-bakcodes (tussenbakverhouding): ' + '; '.join(codes))

    # -- AT50xx: componenten -----------------------------------------------
    b = bladen['AT50xx']
    sectie = '5000'
    for r in range(b.nrows):
        a = tekst(b.v(r, 0))
        if a and a.lower().startswith('serie'):
            sectie = re.sub(r'[^0-9]', '', a) or sectie
            continue
        if not a or not isinstance(b.v(r, 18), float):
            continue
        comp = {'eindreductie achter': tekst(b.v(r, 2)),
                'differentieel achter': '%s/%s' % (tekst(b.v(r, 3)), tekst(b.v(r, 5))),
                'tussenbak': '%s/%s' % (tekst(b.v(r, 6)), tekst(b.v(r, 8))),
                'eindreductie voor': '%s/%s' % (tekst(b.v(r, 10)), tekst(b.v(r, 13))),
                'differentieel voor': '%s/%s' % (tekst(b.v(r, 14)), tekst(b.v(r, 16)))}
        basis = {'label': a, 'componenten': comp,
                 'voorwaarde': tekst(b.v(r, 22)), 'extra': {'Vooras-code': tekst(b.v(r, 20))}}
        m = re.search(r'(\d0)\s*km', a, re.I)
        if m:
            basis['snelheid'] = int(m.group(1))
        voeg_verhoudingen_toe(ds, merk, '5000-serie', 'Serie %s' % sectie, basis, b.v(r, 18), 'direct',
                              {'bestand': bestand, 'blad': 'AT50xx', 'cel': cel(b, r, 18)})

    # -- 40 & 50 serie: matrix ------------------------------------------------
    b = bladen['40&50 serie']
    r = 0
    while r < b.nrows:
        if tekst(b.v(r, 1)) == '50 serie':
            modellen = {c: tekst(b.v(r, c)) for c in range(3, 10) if b.v(r, c)}
            alt = {c: tekst(b.v(r + 1, c)) for c in range(3, 10) if b.v(r + 1, c)}
            snelheid = getal(b.v(r + 1, 1))
            paren = {c: tekst(b.v(r + 2, c)) for c in range(3, 10) if b.v(r + 2, c)}
            rr = r + 3
            while rr < b.nrows and tekst(b.v(rr, 1)) != '50 serie' and not (tekst(b.v(rr, 1)) or '').startswith('LET'):
                if tekst(b.v(rr, 1)) and b.v(rr, 2) == 0:
                    for c, mod in modellen.items():
                        if isinstance(b.v(rr, c), float):
                            for model in [mod] + ([alt[c]] if c in alt else []):
                                basis = {'label': label('%d km/h' % snelheid if snelheid else None,
                                                        'tandwielpaar ' + tekst(b.v(rr, 1)),
                                                        'kegelwiel ' + paren.get(c, '')),
                                         'snelheid': int(snelheid) if snelheid else None}
                                voeg_verhoudingen_toe(ds, merk, '40/50-serie', model, basis, b.v(rr, c), 'direct',
                                                      {'bestand': bestand, 'blad': '40&50 serie',
                                                       'cel': cel(b, rr, c)})
                rr += 1
            r = rr
        else:
            r += 1

    # -- bekende afrolomtrekken uit de 6020-calculator -> bandenlijst ------
    b = bladen['6020 Calculator']
    for kol_maat, kol_rc in ((11, 12), (14, 15)):
        merk_band = None
        for r in range(2, b.nrows):
            maat, rc = tekst(b.v(r, kol_maat)), b.v(r, kol_rc)
            if maat and not isinstance(rc, float) and not re.search(r'\d/\d', maat):
                merk_band = maat.replace('Vredenstein', 'Vredestein')
                continue
            if maat and isinstance(rc, float) and rc > 2000 and merk_band:
                m = re.match(r'^\s*([\d.,]+/[\d.,]+\s*R\s*\d+|[\d.,]+R\d+)\s*(.*)$', maat, re.I)
                if not m:
                    continue
                maatnorm = re.sub(r'\s*[rR]\s*', ' R', m.group(1)).replace(' R', ' R')
                profiel = (m.group(2) or '').strip()
                merknaam = merk_band.split()[0]
                if not profiel and len(merk_band.split()) > 1:
                    profiel = ' '.join(merk_band.split()[1:])
                ds.banden.append({'merk': merknaam, 'profiel': profiel, 'maat': maatnorm.upper().replace(' R', ' R'),
                                  'afrolomtrek': int(rc), 'bron': '%s, blad 6020 Calculator' % bestand})


def losse_jd_calculator(ds, pad, bestand):
    b = open_werkboek(pad)[0]
    ds.algemene_review('John Deere', bestand, b.naam,
                       'Losse calculator (6R). De ingevulde waarden geven %.1f %% voorloop (A1=%s, A2=%s, I1=%s, '
                       'I2=%s, I3=%s, I4=%s); de invoer lijkt niet bij elkaar te horen. Controleren welke '
                       'componentwaarden bij de 6R-serie horen.' % (
                           (b.v(18, 0) or 100) - 100, tekst(b.v(3, 2)), tekst(b.v(4, 2)), tekst(b.v(5, 2)),
                           tekst(b.v(8, 2)), tekst(b.v(9, 2)), tekst(b.v(10, 2))),
                       origineel='zie werkblad')
