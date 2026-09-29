# Voorloop-rekenmodule Polderbanden.nl

Interne WordPress-module voor het opzoeken van overbrengingsverhoudingen van trekkers en het berekenen
van de voorloop bij een bandencombinatie. Vervangt de losse Excel-bestanden per merk.

## Status

**Versie 1.1.2: fase 1 t/m 3 gebouwd.** Dat omvat zoeken, navigatie, trekkerkaart, calculator,
opslaan en printen, en beheer (reviewlijst, normzones, zichtbare velden, bandenlijst, trekkers
toevoegen en bewerken, wijzigingslog). Alle bronbestanden zijn ingelezen.

- **Installeren:** `dist/polderbanden-voorloop-1.1.2.zip`, zie
  [docs/04-installatie-en-gebruik.md](docs/04-installatie-en-gebruik.md).

| Map / document | Inhoud |
|---|---|
| [docs/01-vooronderzoek.md](docs/01-vooronderzoek.md) | Theorie, factoren, normen, analyse van de Excel-bestanden, vergelijking met bestaande software |
| [docs/02-plan-concept.md](docs/02-plan-concept.md) | Plan en besluiten |
| [docs/03-migratierapport.md](docs/03-migratierapport.md) | Tellingen per merk en de reviewlijst uit de migratie (gegenereerd) |
| [docs/04-installatie-en-gebruik.md](docs/04-installatie-en-gebruik.md) | Installeren, bijwerken, gebruik en beheer |
| `bronnen/` | De oorspronkelijke Excel- en PDF-bestanden; bandencatalogi en hun CSV in `bronnen/banden/` |
| `tools/migratie/` | Script dat de bronbestanden omzet naar de startdata van de plugin |
| `tools/banden/` | PDF-lezer voor bandencatalogi (afrolomtrekken naar CSV) |
| `.claude/skills/banden-import/` | Skill voor Claude: bandencatalogus omzetten naar een gecontroleerde CSV |
| `plugin/polderbanden-voorloop/` | De WordPress-plugin |
| `tests/` | Tests van de rekenkern (PHP en JavaScript) |
