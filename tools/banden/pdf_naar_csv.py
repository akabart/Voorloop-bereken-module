"""Eerste, automatische poging om uit een banden-PDF (databook, technische catalogus) per maat de
afrolomtrek te halen. Uitvoer: een CSV voor Beheer -> Bandenlijst -> Importeren, plus een lijst met
twijfelgevallen die met de hand (of door Claude, zie .claude/skills/banden-import) gecontroleerd moeten
worden.

Werkwijze: op elke pagina worden bandmaten gezocht. Bij elke maat zoekt het script in dezelfde regel of
een paar regels erboven/eronder naar vier opeenvolgende getallen die samen kloppen als
breedte (SW), buitendiameter (OD), straal (SLR) en afrolomtrek (RC), waarbij SW en OD ook omgedraaid
mogen staan:
  SW < OD,  0,40 x OD <= SLR <= 0,52 x OD,  0,88 x pi x OD <= RC <= 1,00 x pi x OD,
en waarvan SW en OD passen bij de maat (650/65 R38: ongeveer 650 breed en 1810 mm hoog). Die natuurkundige samenhang maakt
het script onafhankelijk van de kolomvolgorde of opmaak van de fabrikant, en voorkomt dat een maat de
gegevens van de buurregel krijgt. Daarna volgt de controle van RC tegen de maat (bandmaat.plausibel).

Standaard komen alleen trekkerbanden in de CSV: profielen waarvan de catalogus als toepassing een trekker
met voorwielaandrijving noemt (Tractor MFWD / Tractor 4WD) en geen aanhanger, werktuig of pers. Alleen
bij die trekkers speelt voorloop. Met --alle komen alle banden mee. Noemt de catalogus geen toepassing,
dan blijft de band staan met een opmerking.

Gebruik:
  python3 pdf_naar_csv.py <pdf> --merk Eurogrip [--uit banden.csv] [--paginas 16-50] [--bron "..."] [--alle]
"""
import argparse
import csv
import math
import re
import sys
from pathlib import Path

import pdfplumber

sys.path.insert(0, str(Path(__file__).parent))
from bandmaat import past_bij_maat, normaliseer, plausibel  # noqa: E402

MAAT = re.compile(
    r'(?<![\w./])('
    r'(?:VF|IF|CFO|CHO)?\s?\d{2,3}/\d{2}\s?(?:R|-|B)\s?\d{2}(?:\.\d)?'  # 650/65R38, VF710/60R42, 400/60-15.5
    r'|\d{1,2}\.\d{1,2}/\d{2}\s?(?:R|-)\s?\d{2}(?:\.\d)?'               # 11.5/80-15.3
    r'|\d{1,2}(?:\.\d{1,2})?\s?(?:R|-)\s?\d{2}(?:\.\d)?'                 # 18.4R38, 18.4-38, 6-14
    r')\*?(?![\w/])'
)
GETAL = re.compile(r'(?<![\d.])\d{2,4}(?:\.\d+)?(?![\d.])')
ZOEKBEREIK = 4  # regels boven en onder de maat

# Toepassingen (pictogramteksten in de catalogus). Trekker met aangedreven vooras = voorloop is van belang.
TREKKER = re.compile(r'Tractor\s+(MFWD|4WD)', re.I)
GEEN_TREKKERBAND = re.compile(r'Trailer|Semi|Wagon|Plough|Planter|Seeder|Baler|Spreader|Tanker|Irrigat|Harvester|Combine', re.I)


def kwartet(getallen):
    """Alle (positie, SW, OD, SLR, RC) in een rij gehele getallen die natuurkundig samenhangen."""
    uit = []
    for i in range(len(getallen) - 3):
        a, b, slr, rc = getallen[i:i + 4]
        sw, od = min(a, b), max(a, b)
        if 80 <= sw < od <= 2600 and 0.40 * od <= slr <= 0.52 * od and 0.88 * math.pi * od <= rc <= 1.00 * math.pi * od:
            uit.append((i, sw, od, slr, rc))
    return uit


def profiel_uit_kop(regels):
    """Profielnaam uit de paginakop: 'Radial' / 'Diagonal' + naam, of '<naam> (contd)'."""
    if not regels:
        return None
    eerste = regels[0].strip()
    if eerste.lower().endswith('(contd)'):
        return eerste[:-len('(contd)')].strip()
    if eerste in ('Radial', 'Diagonal', 'Bias') and len(regels) > 1:
        naam = regels[1].strip()
        if re.search(r'[A-Za-z]', naam) and len(naam) <= 40:
            return naam
    return None


def toepassing_uit_pagina(regels):
    """Pictogramteksten na 'TRA Code Speed Index' tot de tabelkop, of None als de pagina die niet heeft."""
    for i, r in enumerate(regels):
        if 'TRA Code' in r:
            delen = [r.split('Speed Index', 1)[-1]]
            for volgende in regels[i + 1:i + 3]:
                if re.search(r'Unloaded|Rim|Size|Dimension|Recommended', volgende):
                    break
                delen.append(volgende)
            return ' '.join(' '.join(delen).split())
    return None


def is_trekkerband(toepassing):
    """True/False, of None als de toepassing onbekend is."""
    if not toepassing:
        return None
    return bool(TREKKER.search(toepassing)) and not GEEN_TREKKERBAND.search(toepassing)


def profiel_uit_regel(regel, maat):
    """Terugval als de kop een afbeelding is: de profielcode direct na de maat ('500/45-20 TC09 ...').
    Velgcodes (W12, DW16L) en getallen tellen niet mee."""
    rest = regel.split(maat, 1)[-1].split()
    if rest and re.fullmatch(r'[A-Z]{1,4}\s?\d{1,4}[A-Z]{0,2}', rest[0]) and not re.match(r'D?W\d', rest[0]):
        return re.sub(r'^([A-Z]+)(\d)', r'\1 \2', rest[0])  # 'TC09' -> 'TC 09', zoals in de koppen
    return None


def lees(pdf, paginas=None):
    rijen, twijfel = [], []
    toepassing_per_profiel = {}
    with pdfplumber.open(pdf) as doc:
        for nr, pagina in enumerate(doc.pages, start=1):
            if paginas and nr not in paginas:
                continue
            regels = (pagina.extract_text() or '').split('\n')
            profiel = profiel_uit_kop(regels)
            toepassing = toepassing_uit_pagina(regels)
            if profiel and toepassing:
                toepassing_per_profiel[profiel] = toepassing
            elif profiel:  # vervolgpagina ('(contd)'): toepassing van de eerste pagina van dit profiel
                toepassing = toepassing_per_profiel.get(profiel)
            getallen = [[round(float(g)) for g in GETAL.findall(MAAT.sub(' ', r))] for r in regels]
            kwartetten = {i: kwartet(g) for i, g in enumerate(getallen)}
            gebruikt = set()
            maten = [(i, m.group(1)) for i, r in enumerate(regels) for m in MAAT.finditer(r)]
            if not maten or not any(kwartetten.values()):
                continue
            # Eerst maten met gegevens in dezelfde regel, daarna de rest op afstand.
            toegewezen = {}
            for afstand in [0] + [d for k in range(1, ZOEKBEREIK + 1) for d in (-k, k)]:
                for i, maat in maten:
                    if (i, maat) in toegewezen:
                        continue
                    j = i + afstand
                    for k in kwartetten.get(j, []):
                        if (j, k[0]) not in gebruikt and past_bij_maat(maat, k[1], k[2]) is not False:
                            gebruikt.add((j, k[0]))
                            toegewezen[(i, maat)] = (j, k)
                            break
            for i, maat in maten:
                gevonden = toegewezen.get((i, maat))
                naam = normaliseer(maat)
                profiel = profiel_uit_kop(regels) or profiel_uit_regel(regels[i], maat)
                if not gevonden:
                    twijfel.append({'pagina': nr, 'maat': naam, 'profiel': profiel or '', 'reden': 'geen afrolomtrek gevonden bij deze maat',
                                    'regel': regels[i].strip()[:90], 'toepassing': toepassing})
                    continue
                j, (_, sw, od, slr, rc) = gevonden
                rijen.append({'pagina': nr, 'maat': naam, 'profiel': profiel or '', 'sw': sw, 'od': od, 'slr': slr,
                              'afrolomtrek': rc, 'afstand': j - i, 'regel': regels[i].strip()[:90], 'toepassing': toepassing})
    return rijen, twijfel


def paginabereik(tekst):
    if not tekst:
        return None
    uit = set()
    for deel in tekst.split(','):
        a, _, b = deel.partition('-')
        uit.update(range(int(a), int(b or a) + 1))
    return uit


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('pdf')
    ap.add_argument('--merk', required=True)
    ap.add_argument('--uit', help='CSV-bestand (standaard: naast de PDF, <naam>.csv)')
    ap.add_argument('--paginas', help='bijvoorbeeld 16-50,52')
    ap.add_argument('--bron', help='tekst voor de kolom bron (standaard: bestandsnaam van de PDF)')
    ap.add_argument('--alle', action='store_true', help='ook banden voor aanhangers, werktuigen, persen enz.')
    a = ap.parse_args()

    rijen, twijfel = lees(a.pdf, paginabereik(a.paginas))
    if not a.alle:
        weg = [r for r in rijen if is_trekkerband(r['toepassing']) is False]
        weg_profielen = sorted({(r['profiel'] or '?', r['toepassing']) for r in weg})
        rijen = [r for r in rijen if is_trekkerband(r['toepassing']) is not False]
        twijfel = [t for t in twijfel if is_trekkerband(t['toepassing']) is not False]
        print(f'{len(weg)} banden van {len(weg_profielen)} profielen overgeslagen (geen trekkerband; --alle om ze mee te nemen):')
        for prof, toep in weg_profielen:
            print(f'  {prof:<18} {toep}')
        print()
    bron = a.bron or Path(a.pdf).name
    uit = Path(a.uit) if a.uit else Path(a.pdf).with_suffix('.csv')

    # Ontdubbelen: dezelfde maat + profiel + afrolomtrek komt vaak in meerdere tabellen voor.
    gezien, uniek = set(), []
    for r in rijen:
        sleutel = (r['maat'], r['profiel'], r['afrolomtrek'])
        if sleutel not in gezien:
            gezien.add(sleutel)
            uniek.append(r)
    # Zelfde maat + profiel met verschillende afrolomtrek (bijv. andere load index): alle houden, markeren.
    per_band = {}
    for r in uniek:
        per_band.setdefault((r['maat'], r['profiel']), set()).add(r['afrolomtrek'])

    with open(uit, 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f, delimiter=';')
        w.writerow(['maat', 'merk', 'profiel', 'afrolomtrek', 'buitendiameter', 'toepassing', 'bron', 'controle'])
        for r in uniek:
            oordeel, factor = plausibel(r['maat'], r['afrolomtrek'])
            opm = []
            if oordeel != 'ok':
                opm.append(f'plausibiliteit {oordeel} ({factor})')
            if len(per_band[(r['maat'], r['profiel'])]) > 1:
                opm.append('meerdere afrolomtrekken voor deze maat')
            if not r['profiel']:
                opm.append('profiel onbekend')
            if not a.alle and is_trekkerband(r['toepassing']) is None:
                opm.append('toepassing onbekend, controleer of dit een trekkerband is')
            w.writerow([r['maat'], a.merk, r['profiel'], r['afrolomtrek'], r['od'], r['toepassing'] or '', f'{bron} p.{r["pagina"]}', '; '.join(opm)])

    n_opm = sum(1 for r in uniek if plausibel(r['maat'], r['afrolomtrek'])[0] != 'ok' or not r['profiel']
                or (not a.alle and is_trekkerband(r['toepassing']) is None)
                or len(per_band[(r['maat'], r['profiel'])]) > 1)
    print(f'{len(uniek)} banden geschreven naar {uit} ({n_opm} met een opmerking in de kolom controle)')
    if twijfel:
        print(f'\n{len(twijfel)} maten zonder afrolomtrek (vaak inhoudsopgave of maten zonder gegevens):')
        for t in twijfel:
            print(f"  p.{t['pagina']:>3}  {t['maat']:<16} {t['profiel']:<14} | {t['regel']}")


if __name__ == '__main__':
    main()
