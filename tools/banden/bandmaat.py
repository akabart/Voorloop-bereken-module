"""Bandmaten normaliseren en een afrolomtrek op plausibiliteit controleren.

Dezelfde regels staan in de plugin (assets/rekenkern.js: normaliseerMaat en bandPlausibel), zodat de
controle hier en bij het importeren in WordPress hetzelfde oordeel geeft.
"""
import math
import re

# Afrolomtrek gedeeld door (pi x theoretische buitendiameter). Landbouwbanden zitten tussen ongeveer
# 0,94 en 0,99; daarbuiten is de waarde waarschijnlijk verkeerd overgenomen.
PLAUSIBEL_MIN = 0.91
PLAUSIBEL_MAX = 1.02
# Hoogte/breedte-verhouding van inch-maten zonder verhoudingsgetal (18.4 R38, 13.6-24, 6.00-16):
# trekkerbanden zitten rond 0,8, smalle voorwielbanden rond 0,95.
INCH_MIN = 0.75
INCH_MAX = 1.0

_METRISCH = re.compile(r'^(VF|IF|CFO|CHO)?\s*(\d{2,3})/(\d{2})\s*(-|R|B|D)?\s*(\d{2}(?:\.\d)?)$', re.I)
_INCH = re.compile(r'^(VF|IF)?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(-|R)\s*(\d{2}(?:\.\d)?)$', re.I)
_SLASH = re.compile(r'^(\d{1,2}(?:\.\d{1,2})?)/(\d{2})\s*(-|R)\s*(\d{2}(?:\.\d)?)$', re.I)


def normaliseer(maat):
    """'650/65R38' -> '650/65 R38', 'vf 710/60r42' -> 'VF710/60 R42', '18.4R38' -> '18.4 R38',
    '18.4-38' blijft '18.4-38' (diagonaal). Onbekende notaties komen ongewijzigd (opgeschoond) terug."""
    s = re.sub(r'\s+', ' ', str(maat or '').strip().upper().replace(',', '.'))
    s = s.rstrip('*').strip()
    m = _METRISCH.match(s)
    if m:
        pre, b, h, sep, velg = m.groups()
        sep = (sep or 'R').upper()
        return f"{pre or ''}{b}/{h} {sep}{velg}" if sep != '-' else f"{pre or ''}{b}/{h}-{velg}"
    m = _INCH.match(s)
    if m:
        pre, b, sep, velg = m.groups()
        return f"{pre or ''}{b} R{velg}" if sep.upper() == 'R' else f"{pre or ''}{b}-{velg}"
    m = _SLASH.match(s)
    if m:
        b, h, sep, velg = m.groups()
        return f"{b}/{h} R{velg}" if sep.upper() == 'R' else f"{b}/{h}-{velg}"
    return s


def diameterbereik(maat):
    """(min, max) theoretische buitendiameter in mm uit de maat, of None als de notatie niet herkend
    wordt. Metrische maten geven een exacte waarde; bij inch-maten zonder verhoudingsgetal (18.4-38,
    6.00-16) ligt de hoogte tussen 0,75 en 1,0 keer de breedte."""
    s = normaliseer(maat)
    m = _METRISCH.match(s)
    if m:
        _, b, h, _, velg = m.groups()
        d = float(velg) * 25.4 + 2 * int(b) * int(h) / 100
        return d, d
    m = _SLASH.match(s)
    if m:  # 11.5/80-15.3: breedte in inch
        b, h, _, velg = m.groups()
        d = float(velg) * 25.4 + 2 * float(b) * 25.4 * int(h) / 100
        return d, d
    m = _INCH.match(s)
    if m:
        _, b, _, velg = m.groups()
        velg_mm, b_mm = float(velg) * 25.4, float(b) * 25.4
        return velg_mm + 2 * INCH_MIN * b_mm, velg_mm + 2 * INCH_MAX * b_mm
    return None


def plausibel(maat, afrolomtrek):
    """(oordeel, factor): oordeel is 'ok', 'twijfel' of 'onbekend' (maat niet herkend). De factor is
    afrolomtrek / (pi x theoretische diameter), bij inch-maten ten opzichte van het midden van het bereik."""
    bereik = diameterbereik(maat)
    if not bereik or not afrolomtrek:
        return 'onbekend', None
    dmin, dmax = bereik
    ok = afrolomtrek >= PLAUSIBEL_MIN * math.pi * dmin and afrolomtrek <= PLAUSIBEL_MAX * math.pi * dmax
    return ('ok' if ok else 'twijfel'), round(afrolomtrek / (math.pi * (dmin + dmax) / 2), 3)


def nominale_breedte(maat):
    """Nominale breedte in mm uit de maat, of None."""
    s = normaliseer(maat)
    m = _METRISCH.match(s)
    if m:
        return float(m.group(2))
    m = _SLASH.match(s) or _INCH.match(s)
    if m:
        return float(m.group(1) if m.re is _SLASH else m.group(2)) * 25.4
    return None


def past_bij_maat(maat, sw, od):
    """Passen breedte en buitendiameter uit een tabel bij de maat (ruime marge)? None als de maat
    onbekend is. Voorkomt dat een maat de gegevens van een buurregel krijgt."""
    bereik, breedte = diameterbereik(maat), nominale_breedte(maat)
    if not bereik or not breedte:
        return None
    return 0.93 * bereik[0] <= od <= 1.07 * bereik[1] and 0.85 * breedte <= sw <= 1.3 * breedte
