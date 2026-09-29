"""Verzamelt merken, series, types, uitvoeringen, banden en reviewitems en schrijft ze naar seed.json."""
import json
import re
from collections import OrderedDict

from bronlezer import soort_probleem


def sleutel(s):
    """Normalisatie voor vergelijken en zoeken: kleine letters, alleen letters en cijfers."""
    return re.sub(r'[^0-9a-z]', '', (s or '').lower())


class Dataset:
    def __init__(self):
        self.merken = OrderedDict()   # naam -> {'series': OrderedDict}
        self.banden = []
        self.review = []
        self._volgnummer = 0

    # -- structuur -------------------------------------------------------
    def serie(self, merk, serie):
        m = self.merken.setdefault(merk, {'series': OrderedDict()})
        return m['series'].setdefault(serie, {'notities': [], 'types': OrderedDict()})

    def notitie(self, merk, serie, tekst):
        if serie == 'Algemeen':
            m = self.merken.setdefault(merk, {'series': OrderedDict()})
            lijst = m.setdefault('notities', [])
            tekst = re.sub(r'\s+', ' ', tekst).strip()
            if tekst and tekst not in lijst:
                lijst.append(tekst)
            return
        s = self.serie(merk, serie)
        tekst = re.sub(r'\s+', ' ', tekst).strip()
        if tekst and tekst not in s['notities']:
            s['notities'].append(tekst)

    def uitvoering(self, merk, serie, type_naam, u, opmerkingen=(), review_extra=None):
        """Voegt een uitvoering toe. `u` bevat o.a. label, ratio, bron. Opmerkingen worden reviewitems."""
        type_naam = re.sub(r'\s+', ' ', str(type_naam)).strip()
        s = self.serie(merk, serie)
        t = s['types'].setdefault(type_naam, {'aliassen': [], 'uitvoeringen': []})
        self._volgnummer += 1
        u = dict(u)
        u['ref'] = self._volgnummer
        u.setdefault('status', 'bron')
        opmerkingen = [o for o in opmerkingen if o]
        if opmerkingen:
            u['status'] = 'twijfel'
            bron = u.get('bron', {})
            probleem = '; '.join(dict.fromkeys(opmerkingen))
            for r in self.review:
                if (r['bestand'], r['blad'], r['cel'], r['probleem']) == (bron.get('bestand'), bron.get('blad'),
                                                                          bron.get('cel'), probleem):
                    r['refs'].append(u['ref'])
                    break
            else:
                self.review.append({
                    'refs': [u['ref']], 'soort': soort_probleem(opmerkingen),
                    'merk': merk, 'serie': serie, 'type': type_naam, 'label': u.get('label') or '',
                    'bestand': bron.get('bestand'), 'blad': bron.get('blad'), 'cel': bron.get('cel'),
                    'origineel': bron.get('origineel'),
                    'probleem': probleem,
                    'voorstel': u.get('ratio'),
                })
        t['uitvoeringen'].append(u)
        return u

    def alias(self, merk, serie, type_naam, alias):
        t = self.serie(merk, serie)['types'].get(type_naam)
        if t is not None and alias and alias not in t['aliassen'] and sleutel(alias) != sleutel(type_naam):
            t['aliassen'].append(alias)

    def algemene_review(self, merk, bestand, blad, probleem, cel=None, origineel=None):
        self.review.append({'refs': [], 'soort': 'overig', 'merk': merk, 'serie': None, 'type': None, 'label': '',
                            'bestand': bestand, 'blad': blad, 'cel': cel, 'origineel': origineel,
                            'probleem': probleem, 'voorstel': None})

    # -- opschonen ---------------------------------------------------------
    def ontdubbel(self):
        """Voegt identieke uitvoeringen binnen hetzelfde type samen (bron wordt een lijst)."""
        weg = set()
        for m in self.merken.values():
            for s in m['series'].values():
                for t in s['types'].values():
                    gezien = {}
                    nieuw = []
                    for u in t['uitvoeringen']:
                        k = json.dumps([u.get('label'), u.get('ratio'), u.get('voorwaarde'), u.get('chassis_van'),
                                        u.get('chassis_tot'), u.get('wielen')], sort_keys=True, ensure_ascii=False)
                        if k in gezien:
                            doel = gezien[k]
                            doel.setdefault('extra_bronnen', []).append(u['bron'])
                            if u['status'] == 'twijfel' and doel['status'] != 'twijfel':
                                doel['status'] = 'twijfel'
                            weg.add(u['ref'])
                            for r in self.review:
                                r['refs'] = list(dict.fromkeys(doel['ref'] if x == u['ref'] else x
                                                               for x in r['refs']))
                            continue
                        gezien[k] = u
                        nieuw.append(u)
                    t['uitvoeringen'] = nieuw
        return len(weg)

    # -- uitvoer -----------------------------------------------------------
    def telling(self):
        rij = []
        for mn, m in self.merken.items():
            n_s = len(m['series'])
            n_t = sum(len(s['types']) for s in m['series'].values())
            n_u = sum(len(t['uitvoeringen']) for s in m['series'].values() for t in s['types'].values())
            n_r = sum(1 for s in m['series'].values() for t in s['types'].values()
                      for u in t['uitvoeringen'] if u.get('ratio'))
            n_tw = sum(1 for s in m['series'].values() for t in s['types'].values()
                       for u in t['uitvoeringen'] if u.get('status') == 'twijfel')
            rij.append((mn, n_s, n_t, n_u, n_r, n_tw))
        return rij

    def naar_json(self):
        merken = []
        for mn, m in self.merken.items():
            series = []
            for sn, s in m['series'].items():
                types = [{'naam': tn, 'aliassen': t['aliassen'], 'uitvoeringen': t['uitvoeringen']}
                         for tn, t in s['types'].items() if t['uitvoeringen']]
                if types:
                    series.append({'naam': sn, 'notities': s['notities'], 'types': types})
            if series:
                merken.append({'naam': mn, 'notities': m.get('notities', []), 'series': series})
        return {'versie': 1, 'merken': merken, 'banden': self.banden, 'review': self.review}
