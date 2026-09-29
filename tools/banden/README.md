# Banden importeren

Hulpmiddelen om afrolomtrekken uit een banden-PDF (databook of technische catalogus) te halen. De
volledige werkwijze, inclusief de controle door Claude, staat in de skill
[`.claude/skills/banden-import/SKILL.md`](../../.claude/skills/banden-import/SKILL.md).

| Bestand | Functie |
|---|---|
| `pdf_naar_csv.py` | Eerste, automatische CSV uit een PDF, met een lijst van twijfelgevallen |
| `bandmaat.py` | Maten normaliseren (`650/65R38` → `650/65 R38`) en de plausibiliteitscontrole; gelijk aan `bandPlausibel` in de plugin |

```
pip install -r tools/banden/requirements.txt
python3 tools/banden/pdf_naar_csv.py bronnen/banden/<bestand>.pdf --merk Eurogrip --uit bronnen/banden/eurogrip-2025-05.csv
python3 tests/bandmaat.test.py
```

Het resultaat importeer je in WordPress via **Beheer → Bandenlijst → Banden importeren**.
