# Installatie en gebruik

## Installeren

1. Download `dist/polderbanden-voorloop-1.1.2.zip` uit deze repository.
2. Ga in WordPress naar **Plugins → Nieuwe plugin → Plugin uploaden**, kies het zip-bestand en klik
   op **Nu installeren** en daarna **Activeren**.
   - Lukt uploaden niet, pak de zip dan uit en zet de map `polderbanden-voorloop` met de
     bestandsbeheer-plugin in `wp-content/plugins/`. Activeer de plugin daarna onder **Plugins**.
3. Bij het activeren gebeurt automatisch het volgende:
   - de databasetabellen worden aangemaakt;
   - alle trekkerdata uit de bronbestanden wordt ingelezen (ongeveer 10 seconden);
   - er wordt een pagina **Voorloop** gemaakt (adres `/voorloop/`) met de module erop. Zoekmachines
     indexeren die pagina niet.
4. Ga naar **Instellingen → Voorloop-module** en vul in:
   - **Wachtwoord medewerkers**: voor zoeken, rekenen, opslaan en printen;
   - **Wachtwoord beheer**: daarnaast ook normzones, zichtbare velden, trekkers bewerken en de
     reviewlijst. Geef dit wachtwoord aan de vakinhoudelijk beheerder;
   - **huisstijlkleuren** en de **printgegevens**, waaronder het logo-adres uit de mediabibliotheek.

De pagina is gewoon te openen op `https://www.polderbanden.nl/voorloop/`. Zet hem liever niet in het
menu van de website.

## Bijwerken naar een nieuwe versie

Upload de nieuwe zip via **Plugins → Nieuwe plugin → Plugin uploaden**. WordPress vraagt of de
huidige versie vervangen moet worden; kies **Vervangen**. De data (trekkers, wijzigingen,
berekeningen, instellingen) blijft staan.

Verwijder de plugin niet via **Plugins → Verwijderen** om bij te werken. Dat is niet nodig, en de
tabellen blijven bij verwijderen overigens bewaard.

## Gebruik

| Wat | Hoe |
|---|---|
| Trekker zoeken | Typ in de zoekbalk, bijvoorbeeld `724`, `t7270`, `jd 6320` of een chassisnummer als `737/21`. Pijltjestoetsen en Enter werken. |
| Bladeren | **Merken** → merk → serie → type |
| Voorloop berekenen | Op de typepagina: kies een uitvoering en daarna de achter- en voorband uit de lijst, of vul de afrolomtrek in mm in. De uitkomst, het stoplicht en de ideale bandmaat verschijnen direct. |
| Trekker staat er niet in | Gebruik **Losse berekening**. De verhouding kan direct, in Fendt-notatie (0,757), als JD-componenten of gemeten (omwentelingen) worden ingevoerd. |
| Opslaan en printen | Onder de uitkomst: **Opslaan of printen**. Opgeslagen berekeningen staan onder **Opgeslagen** en zijn doorzoekbaar. |
| Band zoeken | In de bandvelden van de calculator en in **Beheer → Bandenlijst**: typ de maat zoals je wilt, bijvoorbeeld `650/65 R38`, `65065r38` of alleen de cijfers `6506538`. Een merk of profiel erbij typen kan ook: `6506538 vred`. Met de pijltjestoetsen loop je door de lijst en Enter kiest; na de achterband springt de cursor naar de voorband. |
| Passende voorbanden | Zodra de achterband bekend is, staan onder de bandvelden de voorbanden uit de lijst die in het groene gebied vallen, de beste eerst. Klik op een band (of Enter) om hem als voorband in te vullen. |
| Nieuwe banden | Een band die je bij een berekening intypt met een afrolomtrek, wordt automatisch aan de bandenlijst toegevoegd. |

### Beheer (met het beheerwachtwoord)

| Tabblad | Functie |
|---|---|
| Reviewlijst | Twijfelgevallen uit de bronbestanden. Per punt kun je kiezen uit **Klopt**, **Aanpassen** (andere verhouding) of **Afwijzen** (verhouding leegmaken). De 243 punten waarbij alleen het decimaalteken is hersteld ("1353" → 1,353) zijn in één keer goed te keuren. |
| Normzones | De grenzen voor rood, oranje, groen en optimaal, en de doelwaarde. Er is één standaardset, en per merk kan een afwijkende set worden ingesteld. |
| Zichtbare velden | Kies welke gegevens op de trekkerkaart staan. |
| Bandenlijst | Afrolomtrekken toevoegen, zoeken, verwijderen of importeren uit een CSV (zie hieronder). |
| Nieuwe trekker | Merk, serie en type met een eerste uitvoering. Bestaan merk of serie nog niet, dan worden ze aangemaakt. |
| Wijzigingslog | Elke wijziging, met de oude en de nieuwe waarde. |

Op een typepagina ziet de beheerder ook **Type bewerken**, **Bewerken** per uitvoering en
**+ Uitvoering toevoegen**.

## Banden importeren

Onder **Beheer → Bandenlijst → Banden importeren** kies je een CSV-bestand met de kolommen `maat`,
`merk`, `profiel` en `afrolomtrek` (eventueel ook `bron`). Scheidingsteken `;` of `,` mag allebei; een
Excel-lijst sla je eerst op als CSV.

Voordat er iets wordt opgeslagen, zie je per regel wat er gebeurt:

| Status | Betekenis | Standaard |
|---|---|---|
| nieuw | Band staat nog niet in de lijst | aangevinkt |
| andere afrolomtrek | Zelfde maat, merk en profiel met een andere waarde; wordt bijgewerkt | aangevinkt |
| twijfel | Afrolomtrek past niet goed bij de maat, of er is geen merk | uit |
| staat er al | Precies dezelfde band bestaat al | overgeslagen |
| fout | Geen maat, of afrolomtrek niet tussen 1000 en 10000 mm | overgeslagen |

Een PDF-catalogus van een fabrikant zet je eerst om naar zo'n CSV. Dat doe je met Claude Code in
deze repository:

1. Zet de PDF in `bronnen/banden/`.
2. Vraag Claude: *"Importeer de banden uit bronnen/banden/<bestand>.pdf"*. Claude gebruikt dan de
   skill `banden-import`. Die leest de PDF, controleert twijfelgevallen op de pagina zelf en zet een
   gecontroleerde CSV naast de PDF.
3. Importeer die CSV zoals hierboven.

Alleen trekkerbanden komen in de CSV: banden voor trekkers met een aangedreven vooras. Banden voor
aanhangers, werktuigen, persen, pootmachines en dergelijke worden overgeslagen.

Als voorbeeld staat `bronnen/banden/eurogrip-2025-05.csv` klaar: 146 trekkerbanden uit de
Eurogrip-catalogus van mei 2025.

**Verkeerde import terugdraaien.** Zoek in de bandenlijst op bijvoorbeeld het merk (`eurogrip`). Onder
het zoekveld verschijnt **Verwijder deze N banden**; daarmee verwijder je alle gevonden banden in één
keer. Dat staat in het wijzigingslog. Importeer daarna de juiste CSV.

## Data exporteren

Onder **Instellingen → Voorloop-module** staat **Exporteer alle uitvoeringen**. Dat levert een
CSV-bestand dat direct in Excel opent.

## Voor de ontwikkelaar

- Bronbestanden staan in `bronnen/`. `tools/migratie/migreer.py` maakt daaruit
  `plugin/polderbanden-voorloop/data/seed.json` en `docs/03-migratierapport.md`.
- `tools/bouw-zip.sh` bouwt de installeerbare zip in `dist/`.
- Tests van de rekenkern (PHP en JavaScript rekenen met dezelfde testgevallen):
  `node tests/rekenkern.test.js` en `php tests/rekenkern.test.php`. De bandmaatcontrole (JavaScript
  en Python) wordt getest met `node tests/rekenkern.test.js` en `python3 tests/bandmaat.test.py`.
- `tools/banden/` bevat de PDF-lezer voor bandencatalogi; de werkwijze staat in
  `.claude/skills/banden-import/SKILL.md`.
- **Startdata opnieuw inlezen** (onder de instellingen) vervangt alle trekkerdata en de reviewlijst
  door de inhoud van `seed.json`. Gebruik dat alleen na een nieuwe migratie; wijzigingen die in de
  module zelf zijn gedaan, gaan dan verloren.
