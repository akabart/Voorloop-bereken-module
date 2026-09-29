# Migratie van de bronbestanden

`migreer.py` leest alle bestanden in `bronnen/` en maakt:

- `plugin/polderbanden-voorloop/data/seed.json`: de startdata die de plugin bij de eerste activatie inleest;
- `docs/03-migratierapport.md`: tellingen per merk en de reviewlijst.

```bash
pip install -r tools/migratie/requirements.txt
python3 tools/migratie/migreer.py
```

Per bronbestand staat de inleesroutine in `parsers.py`. Normalisatie van verhoudingen (decimaalteken,
Fendt-notatie, plausibiliteit) zit in `bronlezer.py`. Alles wat niet zeker is, krijgt status *twijfel*
en een reviewitem.
