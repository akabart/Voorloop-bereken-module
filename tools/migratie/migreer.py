"""Leest alle bronbestanden in bronnen/ en schrijft:

- plugin/polderbanden-voorloop/data/seed.json  (startdata voor de WordPress-plugin)
- docs/03-migratierapport.md                    (tellingen en reviewlijst)

Gebruik:  python3 tools/migratie/migreer.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

import parsers  # noqa: E402
from dataset import Dataset  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BRONNEN = os.path.join(ROOT, 'bronnen')
SEED = os.path.join(ROOT, 'plugin', 'polderbanden-voorloop', 'data', 'seed.json')
RAPPORT = os.path.join(ROOT, 'docs', '03-migratierapport.md')

STAPPEN = [
    ('Overbrengverhouding Fendt.xls', parsers.fendt_xls),
    ('Overbrengverhoudingen en Flensmaten - Fendt trekkers nieuw.pdf', parsers.fendt_pdf),
    ('JOHN DEERE VOORLOOP BEREKENIG.xls', parsers.john_deere),
    ('voorloopberekening.xls', parsers.losse_jd_calculator),
    ('Overbrengingsverhouding Deutz.xlsx', parsers.deutz_xlsx),
    ('Deutz Fahr as gegevens.pdf', parsers.deutz_pdf),
    ('Overbrengverhouding Massey Ferguson.xlsx', parsers.massey),
    ('Overbrengverhouding NewHolland_2020.xlsx', parsers.new_holland),
    ('Aslengtes Case Steyr + overbreng.xls', parsers.case_steyr),
]


def main():
    ds = Dataset()
    for bestand, parser in STAPPEN:
        parser(ds, os.path.join(BRONNEN, bestand), bestand)
    samengevoegd = ds.ontdubbel()
    data = ds.naar_json()
    os.makedirs(os.path.dirname(SEED), exist_ok=True)
    with open(SEED, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    schrijf_rapport(ds, data, samengevoegd)
    for rij in ds.telling():
        print('%-18s series=%3d types=%4d uitvoeringen=%4d met_ratio=%4d twijfel=%4d' % rij)
    print('banden', len(ds.banden), 'reviewitems', len(ds.review), 'samengevoegd', samengevoegd)


def schrijf_rapport(ds, data, samengevoegd):
    regels = [
        '# Migratierapport',
        '',
        'Automatisch gegenereerd door `tools/migratie/migreer.py`. Niet met de hand aanpassen; draai het script',
        'opnieuw als de bronbestanden wijzigen.',
        '',
        '## Tellingen',
        '',
        '| Merk | Series | Types | Uitvoeringen | Met verhouding | Twijfel |',
        '|---|---|---|---|---|---|',
    ]
    for rij in ds.telling():
        regels.append('| %s | %d | %d | %d | %d | %d |' % rij)
    regels += ['', '- Bandenlijst (afrolomtrekken uit de JD-sheet): %d banden' % len(ds.banden),
               '- Identieke uitvoeringen samengevoegd: %d' % samengevoegd,
               '- Reviewitems: %d' % len(ds.review), '',
               '## Reviewlijst', '',
               'Deze punten komen in het reviewscherm van de module. De beheerder beoordeelt ze daar.', '',
               '| # | Soort | Merk | Type | Uitvoering | Bron | Origineel | Probleem | Voorstel i |',
               '|---|---|---|---|---|---|---|---|---|']
    for n, r in enumerate(ds.review, 1):
        voorstel = ('%.4f' % r['voorstel']).replace('.', ',') if r.get('voorstel') else ''
        regels.append('| %d | %s | %s | %s | %s | %s / %s / %s | %s | %s | %s |' % (
            n, r['soort'], r['merk'] or '', r['type'] or '', (r['label'] or '').replace('|', '/'), r['bestand'], r['blad'],
            r['cel'] or '', (str(r['origineel'] or '')).replace('|', '/'), r['probleem'].replace('|', '/'), voorstel))
    with open(RAPPORT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(regels) + '\n')


if __name__ == '__main__':
    main()
