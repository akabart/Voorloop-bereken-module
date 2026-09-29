---
name: banden-import
description: Zet een banden-PDF of Excel-lijst van een fabrikant (databook, technische catalogus, bijvoorbeeld Eurogrip, Michelin, Vredestein, Trelleborg, BKT, Mitas) om naar een gecontroleerde CSV met afrolomtrekken voor de voorloopmodule (Beheer > Bandenlijst > Banden importeren). Gebruik dit als iemand banden wil toevoegen of importeren uit een PDF, catalogus of databook, of vraagt om afrolomtrekken (rolling circumference, RC, RCI, Abrollumfang) uit een bestand te halen.
---

# Banden importeren uit een PDF of Excel-lijst

Doel: een CSV die zonder verrassingen in de plugin te importeren is. Elke afrolomtrek moet
aantoonbaar uit de bron komen.

**Alleen trekkerbanden.** Voorloop speelt alleen bij trekkers met een aangedreven vooras. Neem dus
de aangedreven banden voor trekkers mee (voor en achter, ook smalle rijgewasbanden en compacte
trekkers). Laat weg: banden voor aanhangers, werktuigen, pakpersen, zaai- en pootmachines,
spuiten, maaidorsers, beregening en shovels, en geleide voorbanden van 2WD-trekkers (F-2, TF).
Een catalogus noemt de toepassing meestal met pictogrammen ("Tractor MFWD", "Tractor 4WD",
"Trailer"); het script filtert daarop. Staat er geen toepassing, beoordeel het profiel dan zelf
(TRA-code R-1, R-1W of R-2 en een beschrijving voor trekkers betekent: trekkerband). Alleen als
de gebruiker er uitdrukkelijk om vraagt, neem je met `--alle` alle banden mee. **Nooit een afrolomtrek schatten of berekenen.** Een band zonder
afrolomtrek in de bron hoort niet in de CSV.

## Het CSV-formaat

Puntkomma als scheidingsteken, UTF-8 met BOM (dan opent Excel het goed):

```
maat;merk;profiel;afrolomtrek;buitendiameter;toepassing;bron;controle
650/65 R38;Eurogrip;AR 600;5569;1834;Tractor MFWD Tractor 4WD;Eurogrip technische catalogus mei 2025 p.18;
```

| Kolom | Inhoud |
|---|---|
| `maat` | Genormaliseerd: `650/65 R38`, `VF710/60 R42`, `18.4 R38` (radiaal), `18.4-38` (diagonaal), `11.5/80-15.3`. Gebruik `normaliseer()` uit `tools/banden/bandmaat.py`. |
| `merk` | Merknaam zoals Polderbanden hem gebruikt: `Eurogrip`, `Michelin`, `Vredestein`. |
| `profiel` | Profielnaam zoals in de kop van de catalogus: `AR 600`, `TR 45`, `Traxion+`. |
| `afrolomtrek` | In mm, geheel getal. Bron-kolommen heten o.a. *Rolling circumference*, *RC*, *RCI*, *C.R.*, *Abrollumfang*, *Circonférence de roulement*. Staat de waarde alleen in inch, reken om (× 25,4) en vermeld dat in `controle`. |
| `buitendiameter` | OD in mm; alleen ter controle, de plugin gebruikt hem niet. |
| `toepassing` | Toepassing volgens de catalogus; alleen ter controle. |
| `bron` | Documentnaam en paginanummer, zodat elke waarde terug te vinden is. |
| `controle` | Leeg als alles klopt, anders een korte toelichting. De plugin toont deze tekst in het importvoorbeeld. |

De plugin leest ook `,`- of tab-gescheiden bestanden en Engelse kolomnamen (`size`, `brand`,
`pattern`, `rolling circumference`), maar lever bij voorkeur exact het formaat hierboven.

## Werkwijze

1. **Bron in de repository.** Zet de PDF in `bronnen/banden/` (map aanmaken mag). De CSV komt
   ernaast als `<merk>-<jaar>-<maand>.csv`, bijvoorbeeld `bronnen/banden/eurogrip-2025-05.csv`.

2. **Automatische eerste versie** (PDF):
   ```
   pip install -r tools/banden/requirements.txt
   python3 tools/banden/pdf_naar_csv.py bronnen/banden/<bestand>.pdf --merk <Merk> \
     --bron "<Merk> <documentnaam> <maand jaar>" --uit bronnen/banden/<merk>-<jaar>-<maand>.csv
   ```
   Het script zoekt bij elke bandmaat vier getallen die natuurkundig bij elkaar horen (breedte,
   buitendiameter, straal, afrolomtrek) en bij de maat passen. Daardoor werkt het bij de meeste
   catalogi zonder aanpassing. Het drukt af welke profielen het als "geen trekkerband" heeft
   overgeslagen, met hun toepassing, en welke maten geen afrolomtrek kregen. Controleer die
   overgeslagen profielen: staat daar een trekkerband tussen, neem hem dan alsnog mee.
   Bij een Excel-lijst: lees die met `openpyxl`, zoek de kolommen zelf en schrijf hetzelfde formaat
   (gebruik `normaliseer()` en `plausibel()` uit `bandmaat.py`).

3. **Controle door jou (Claude).** Het script is een eerste versie, niet het eindresultaat. Loop langs:
   - **Rijen met tekst in `controle`** (plausibiliteit twijfel, meerdere afrolomtrekken, profiel
     onbekend). Open de pagina en kijk wat er echt staat. Render een pagina zo:
     ```python
     import pdfplumber
     p = pdfplumber.open(pdf); p.pages[n - 1].to_image(resolution=90).save('scratch/pN.png')
     ```
     Gebruik `.crop((x0, y0, x1, y1))` voor een scherper detail, en `extract_text()` om de exacte
     getallen te lezen.
   - **Maten zonder afrolomtrek** (uitvoer van het script). Meestal zijn dat inhoudsopgaven,
     "under development"-maten (`*`) of maten zonder gegevens; dan is het goed zo. Staat er wel
     een afrolomtrek op de pagina, voeg de rij dan met de hand toe.
   - **Een steekproef van ongeveer 10 gewone rijen** verspreid over de catalogus, tegen de
     gerenderde pagina. Vind je daar een fout, controleer dan de hele tabel van dat profiel.
   - **Rijen met "toepassing onbekend"**: beoordeel of het een trekkerband is en verwijder de rij
     als dat niet zo is.
   - **Profielnamen**: als de kop van een pagina een afbeelding is, vult het script de code uit de
     tabel in of laat het profiel leeg. Vul lege profielen in vanaf de gerenderde pagina.

4. **Uitkomst van de controle vastleggen** in de kolom `controle`:
   - `GECONTROLEERD p.<n>: <wat je zag>`, en `niet importeren` als de waarde fout is in de bron.
   - Pas een waarde alleen aan als de bron dat onderbouwt (bijvoorbeeld een inch-waarde die wel
     klopt). Vermeld dan de oude waarde.
   - Fouten in de catalogus zelf (twee verschillende waarden bij dezelfde diameter, waarden die van
     een andere maat zijn gekopieerd) niet verbeteren maar markeren. De beheerder beslist.

5. **Opleveren.** Commit de PDF en de CSV. Meld de gebruiker in het Nederlands:
   - aantal banden, aantal met een opmerking, en de belangrijkste twijfelgevallen met paginanummer;
   - hoe te importeren: **Voorloop-pagina → Beheer → Bandenlijst → Banden importeren**, CSV kiezen,
     het voorbeeld nalopen (twijfelgevallen staan standaard uit) en op **Importeer** klikken.

## Hoe de plugin importeert

- Zelfde maat + merk + profiel + afrolomtrek bestaat al: overgeslagen ("staat er al").
- Zelfde maat + merk + profiel met één andere afrolomtrek: bijgewerkt (staat in het wijzigingslog).
- Anders: nieuw toegevoegd. De bron wordt opgeslagen als `Import: <bron>`; zulke banden blijven
  staan als de startdata opnieuw wordt ingelezen.
- De plugin controleert elke rij opnieuw met dezelfde plausibiliteitsregel
  (`assets/rekenkern.js`: `bandPlausibel`, gelijk aan `tools/banden/bandmaat.py`). Twijfelrijen
  staan in het voorbeeld uit; de beheerder kan ze aanvinken.

## De plausibiliteitsregel

afrolomtrek ÷ (π × theoretische buitendiameter) ligt bij landbouwbanden tussen ongeveer 0,94 en 0,99.
De controle keurt 0,91 tot 1,02 goed. De theoretische diameter is velg × 25,4 + 2 × breedte × serie;
bij inch-maten zonder serie (18.4-38, 6.00-16) ligt de hoogte tussen 0,75 en 1,0 keer de breedte.
Skid-steer- en sommige flotatiebanden vallen er soms net buiten; dat is dan geen fout in de bron.
Wijzig de grenzen alleen samen in `bandmaat.py` én `rekenkern.js`, en werk de testgevallen bij
(`tests/testgevallen.json`, draai `python3 tests/bandmaat.test.py` en `node tests/rekenkern.test.js`).
