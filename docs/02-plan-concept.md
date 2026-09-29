# Plan (concept v0.2): voorloop-rekenmodule

*Status: concept v0.2 (29-09-2026), bijgewerkt met de antwoorden op de beslispunten. Die staan met
het besluit in § 11; wat nog open is, staat in § 12. Achtergrond en onderbouwing: [01-vooronderzoek.md](01-vooronderzoek.md).*

## 1. Doel en succescriteria

**Doel:** één centrale, betrouwbare plek waar medewerkers van Polderbanden.nl binnen enkele seconden
de overbrengingsverhouding van een trekker vinden en de voorloop van een bandencombinatie berekenen.
De module vervangt de losse Excel-bestanden per merk.

**Succescriteria (voorstel):**

1. Een trekker is te vinden met één zoekopdracht of in maximaal drie klikken. Voorbeeld: "724" toont
   alle Fendt 724-uitvoeringen.
2. Een voorloopberekening kost minder dan 30 seconden en geeft een duidelijk oordeel (stoplicht) met
   advies.
3. Een nieuwe trekker of uitvoering toevoegen kost minder dan twee minuten, in elke gangbare notatie.
4. Alle data uit de vijf Excel-bestanden is overgezet. Twijfelgevallen blijven zichtbaar
   gemarkeerd totdat iemand ze heeft beoordeeld.
5. Van elke verhouding is te zien waar die vandaan komt en of die gecontroleerd is.

## 2. Gebruikers en situaties [B1]

| Wie | Situatie | Wat is nodig |
|---|---|---|
| Kantoor (pc) | Klant belt: "Ik heb een 724 met 650/65R42 achter, welke voorband?" | Snel zoeken, calculator, advies ideale voorband, berekening opslaan en printen |
| Vakinhoudelijk beheerder (de baas) | Correcties, normzones, beoordelen van twijfelgevallen | Beheerschermen, instellingen, reviewscherm |

Het ontwerp is voor een pc-scherm. Het blijft wel bruikbaar op een tablet, maar daar optimaliseren we
niet voor.

## 3. Scope

**In versie 1 (fase 1 t/m 3, zie § 9):** zoeken, navigatie, trekkerkaart, voorloopcalculator,
berekeningen opslaan en printen, beheer inclusief instelbare normzones, en de migratie van alle
bronbestanden in de repository.

**Later (fase 4, 5 en verder):** bandendatabase met omgekeerd rekenen, Excel- en PDF-import,
koppeling met webshop of offertes.

Alles onder "later" is al in het datamodel voorzien, zodat er niets omgebouwd hoeft te worden.

## 4. Functionaliteit

### 4.1 Slim zoeken

Eén zoekbalk bovenaan elk scherm, met resultaten tijdens het typen.

- **Normalisatie.** Hoofdletters, spaties, punten en streepjes maken niet uit: "T7.270", "t7 270"
  en "T7270" geven hetzelfde resultaat.
- **Waarin gezocht wordt:**
  - merk, inclusief afkortingen (JD, NH, MF, DF);
  - serie, type en aliassen;
  - kenmerken van de uitvoering (transmissie, as-type);
  - chassisnummerprefix.
- **Volgorde van resultaten:**
  1. exact typenummer;
  2. begint met;
  3. bevat;
  4. chassisnummerprefix;
  5. bijna-treffers (tikfouten).
- **Weergave.** Resultaten worden gegroepeerd per merk en serie. Vanuit een resultaat klik je direct
  door naar de trekkerkaart of de calculator.

Voorbeeld voor "724":

```
Fendt › 700 Vario › 724 Vario        (uitvoeringen: 2011 Stufe 3b, …)
Fendt › 700 Vario › 724 Vario NA
Chassisnummer begint met 724/… → Fendt 712 Vario (COM3, 2006–)
```

### 4.2 Navigatie: Merk › Serie › Type › Uitvoering

- De drie niveaus die je noemde (Merk › Serie › Type), met de **uitvoeringen op de typepagina**. Dat
  is nodig omdat de verhouding per uitvoering verschilt.
- Per niveau zijn er tegels of lijsten, met het aantal onderliggende items en een snelle filter.

### 4.3 Trekkerkaart

Eén pagina per type, met per uitvoering:

- overbrengingsverhouding `i`, de originele notatie, de bron en de status;
- kenmerken: transmissie, km/h, vooras, chassisbereik, bouwjaren en voorwaarden;
- wielaansluitmaten voor en achter [B4]. Welke velden zichtbaar zijn, is in de instellingen per
  veld aan of uit te zetten, zodat de kaart overzichtelijk blijft;
- notities, zoals servicebulletins of "controleer typeplaatje";
- een knop **Bereken voorloop**, waarmee de verhouding meteen in de calculator staat.

### 4.4 Voorloopcalculator

**Invoer:**

- een uitvoering (die levert `i`), óf een handmatig ingevulde `i`;
- de afrolomtrek van voor- en achterband. Die typ je in, of je kiest de band uit de
  bandendatabase zodra die er is.

**Uitvoer:**

- voorloop in procenten, met stoplicht (§ 5);
- bandverhouding en verschil in afrolomtrek (mm);
- advies:
  - ideale afrolomtrek voorband bij de gekozen achterband (en andersom), voor de doelwaarde;
  - het groene gebied in mm.
- waarschuwingen, bijvoorbeeld "verhouding nog niet gecontroleerd", "afrolomtrek geschat" of
  "buiten gebruikelijk bereik".

**Opslaan en printen [B7]:** een berekening is op te slaan met klantnaam, referentie (bijvoorbeeld
werkorder of kenteken), chassisnummer en opmerking. Opgeslagen berekeningen zijn terug te zoeken.
De printweergave is één A4 met logo, trekker, banden, uitkomst, stoplicht en advies.

### 4.5 Beheer: toevoegen en wijzigen

- **Formulier** voor merk, serie, type en uitvoering, met keuzelijsten en de optie "nieuw". Een
  bestaande uitvoering is te dupliceren en daarna aan te passen.
- **De verhouding is in vier notaties in te voeren**; de module rekent automatisch om naar `i`:
  1. direct (`i` > 1), zoals Deutz, MF, NH en JD;
  2. Fendt VA/HA (< 1), waarbij `i` = 1 / waarde;
  3. JD-componenten: `i` = (i_eind × i_diff) / (i_va × i_tb);
  4. gemeten: omwentelingen voor per 10 omwentelingen achter.
- **Plausibiliteitscontrole.** Buiten ongeveer 1,15 tot 1,70 volgt een waarschuwing, die te
  overrulen is (Fendt Xylon en GT zitten rond 1,12). Een waarde onder 1 levert de vraag op: "Is
  dit Fendt-notatie?"
- **Bron en status** per waarde: *uit Excel (migratie)*, *fabrieksdocument*, *gemeten*,
  *gecontroleerd door …* of *twijfel*.
- **Wijzigingslog:** wie heeft wat wanneer veranderd, met de oude en de nieuwe waarde.

### 4.6 Import (latere fase)

- **Excel/CSV:** een wizard met kolomkoppeling, een voorbeeldweergave en validatie. De opzet van het
  Fendt- en MF-bestand dient als sjabloon.
- **PDF:** tabellen automatisch uitlezen, eventueel met AI-ondersteuning. Het resultaat gaat
  **altijd** eerst naar een reviewscherm voordat het wordt opgeslagen.

## 5. Rekenregels en normzones [B6]

De zones zijn **instelbaar in een instellingenscherm**, zodat de vakinhoudelijk beheerder een
grens direct kan aanpassen. Er is één standaardset en per merk (of per uitvoering) een afwijkende
set. Wijzigingen komen in het wijzigingslog.

```
i          = n_voorwiel / n_achterwiel                    (genormaliseerd; normaal 1,15 tot 1,70)
voorloop % = (i × U_voor / U_achter − 1) × 100
ideale U_voor   = U_achter × (1 + doel) / i
ideale U_achter = U_voor × i / (1 + doel)
```

Standaardwaarden bij oplevering, per merk of uitvoering te overschrijven (bijvoorbeeld JD 1,5 tot 4 %
volgens de handleidingen):

| Zone | Voorloop | Betekenis |
|---|---|---|
| Rood | < 0 % | naloop: niet gebruiken |
| Oranje | 0 tot 1 % | laag: alleen acceptabel bij veel transport |
| **Groen** | **1 tot 5 %** | **goed** |
| — optimaal | 1,5 tot 3,5 %, doel 2,5 % | beste compromis tussen trekkracht en slijtage |
| Oranje | 5 tot 6 % | hoog: verhoogde slijtage |
| Rood | > 6 % | te hoog: niet gebruiken |

**Afronding:** `i` wordt opgeslagen met 4 tot 5 decimalen, de voorloop getoond met 2 decimalen.

**Testbasis:** de rekenkern wordt getest met onder meer:

- de JD 6020-calculator (+2,64 %);
- het Claas-voorbeeld uit profi (+3,32 %);
- de bandentabel uit het vooronderzoek.

## 6. Datamodel (concept)

```
Merk                    bv. Fendt
 └─ Serie               bv. 700 Vario
     └─ Type            bv. 724 Vario           (+ aliassen voor zoeken)
         └─ Uitvoering  bv. 2011 · Stufe 3b · vooras 737 F7 · chassis 737/21/0001–
              ├─ overbrengingsverhouding
              ├─ wielaansluiting voor + achter
              └─ standaardbanden (fabriekscombinatie, optioneel)

Band           merk · profiel · maat · afrolomtrek · bron (databook + jaar) · status
Berekening     uitvoering · voorband · achterband · uitkomst · klant · referentie · wie · wanneer
Instellingen   normzones (standaard + per merk) · zichtbare velden
Reviewitem     bronbestand · tabblad · regel · probleem · voorstel · besluit
Wijzigingslog  wie · wanneer · wat (oud → nieuw)
```

**Uitvoering:**

- label (automatisch samengesteld, aan te passen);
- transmissie, maximumsnelheid (km/h), vooras (type/klasse), achteras;
- chassisnummer van/tot, bouwjaar van/tot, regio;
- voorwaarde (bijvoorbeeld "alleen met R42 achter");
- `i` (genormaliseerd) en de originele waarde en notatie;
- componenten (i_eind, i_diff, i_va, i_tb), optioneel;
- bron, status en opmerking;
- afwijkende normzone, optioneel.

**Wielaansluiting (per as):** flensmaat, steekcirkel, aantal bouten, draad (bijvoorbeeld M18×1,5),
boutgat, naafgat of centreerdiameter, boutzitting (vlak, konisch of bol), aanhaalmoment, spacer en
opmerking.

## 7. Migratie van de bronbestanden

Bronnen in de repository:

| Bestand | Merken | Opmerking |
|---|---|---|
| JOHN DEERE VOORLOOP BEREKENIG.xls | John Deere | tabellen, componenten, calculator |
| voorloopberekening.xls | John Deere (6R) | losse calculator; de ingevulde waarden geven 23 % voorloop, dus de invoer hoort op de reviewlijst |
| Overbrengingsverhouding Deutz.xlsx | Deutz-Fahr, SAME, Lamborghini | verhouding en wielaansluitmaten |
| Deutz Fahr as gegevens.pdf | Deutz-Fahr, SAME, Lamborghini (recent) | met productcodes, flens, bouten, steek, naafdiameter en **grootste afrolomtrek** |
| Overbrengverhouding Fendt.xls | Fendt (tot ongeveer 2012) | AGCO-export, omgekeerde notatie |
| Overbrengverhoudingen en Flensmaten - Fendt trekkers nieuw.pdf | Fendt (stand nov. 2023, o.a. 700 Gen6/Gen7, 900 Gen6/7, 1000) | met **standaardbanden** voor en achter |
| Overbrengverhouding Massey Ferguson.xlsx | Massey Ferguson | nette tabel |
| Overbrengverhouding NewHolland_2020.xlsx | New Holland | verhouding en wielaansluitmaten |
| Aslengtes Case Steyr + overbreng.xls | Case IH, Steyr | zelfde opzet als NH; de verborgen tabbladen zijn NH-kopieën en worden niet dubbel ingelezen |

De PDF's zijn met tekstextractie uit te lezen. Kolommen lopen daarbij soms in elkaar over, dus die
regels gaan altijd via de reviewlijst.


1. **Per merk een inleesroutine.** Elk bestand heeft een eigen opzet: vaste kolommen bij Fendt en
   MF, blokken per tabblad bij NH, Deutz en JD.
2. **Normaliseren:**
   - decimaaltekens herstellen ("1353" wordt 1,353, "13,6" wordt 13,6);
   - tekst omzetten naar getal;
   - de Fendt-notatie omkeren;
   - dubbele waarden ("1,3659/1,3318") splitsen in twee uitvoeringen.
3. **Kenmerken uit vrije tekst halen**, zoals "vanaf sn …", "tot 1441", "Dyna-6 - R42", "40 HD" en
   "KL 3/KL 4". Waar dat niet automatisch lukt, gaat het naar de reviewlijst.
4. **Reviewscherm in de module** met alle twijfelgevallen, elk met bestand, tabblad, regel, de
   originele waarde en een voorstel. De vakinhoudelijk beheerder keurt goed, past aan of verwerpt;
   pas daarna krijgt de waarde de status "gecontroleerd" [B8].
5. **Controle achteraf:** de aantallen per merk of tabblad in de module komen overeen met de
   Excel-bestanden, en steekproeven worden naast het origineel gelegd.

## 8. Techniek [B2] [B3]

**Besluit: een WordPress-plugin op de bestaande hosting van polderbanden.nl.** Daarmee is de data
altijd centraal en actueel, zonder aparte server. Een lokale app op de pc valt af, omdat de data dan
niet gedeeld en bijgewerkt wordt.

Opzet:

- **Eigen plugin** ("Polderbanden Voorloop"), los van het thema en van WooCommerce. Te installeren
  als zip-bestand via *Plugins → Nieuwe plugin → Uploaden*.
- **Eigen databasetabellen** in de bestaande WordPress-database (MySQL/MariaDB), niet in
  WooCommerce-producten of berichten.
- **Gebruikersscherm** op een interne pagina via een shortcode, met een snelle zoek- en
  rekeninterface (JavaScript). Data gaat via de REST API van WordPress.
- **Beheerschermen** in wp-admin: trekkers, instellingen (normzones, zichtbare velden), reviewlijst,
  opgeslagen berekeningen.
- **Toegang**: zie § 8.1.
- **Rekenkern** op één plek, met geautomatiseerde tests (PHP en JavaScript rekenen met dezelfde
  testgevallen).
- **Back-up en export**: de tabellen gaan mee in de gewone WordPress-back-up; daarnaast een
  export naar Excel/CSV.
- **Ontwikkeling en test** gebeuren lokaal in een WordPress-testomgeving; jullie installeren de zip
  op de live site (of eerst op een staging-site als die er is).

### 8.1 Toegang: wachtwoordpagina of WordPress-accounts?

Een wachtwoord op de pagina plus *noindex* houdt zoekmachines en toevallige bezoekers weg, maar
beschermt de **data** niet. De calculator haalt zijn gegevens op via de REST API, en die
aanroepen vallen niet onder het paginawachtwoord. Bovendien kan de baas dan niets wijzigen zonder
extra inlog.

**Voorstel:** gewone WordPress-gebruikersaccounts met twee eigen rollen:

- *Voorloop gebruiker*: zoeken, rekenen, berekeningen opslaan en printen;
- *Voorloop beheerder*: daarnaast data, normzones, zichtbare velden en reviewlijst beheren.

De pagina en de API zijn alleen bereikbaar voor ingelogde gebruikers met een van die rollen;
anderen gaan naar het inlogscherm. Pagina's krijgen *noindex*. Dit kost collega's één keer een
account aanmaken en is niet ingewikkelder in gebruik.

## 9. Fasering

| Fase | Inhoud | Resultaat |
|---|---|---|
| **1. Fundament** | Datamodel en database, rekenkern met tests, migratiescript, reviewlijst | Alle data genormaliseerd in de database |
| **2. MVP** | Zoeken, navigatie, trekkerkaart (incl. wielaansluitmaten met aan/uit per veld), calculator met handmatige afrolomtrek, zones en advies, opslaan en printen | Collega's kunnen de Excel-bestanden loslaten |
| **3. Beheer** | Toevoegen, bewerken en dupliceren; vier notaties; bron en status; wijzigingslog; instelbare normzones; reviewscherm | Data groeit en blijft betrouwbaar |
| **4. Bandendatabase** | Afrolomtrekken per merk, profiel en maat; band kiezen uit lijst; omgekeerd rekenen ("welke voorbanden passen?"); fabriekscombinatie en relatieve methode | Minder typwerk, beter advies |
| **5. Import** | Excel/CSV-wizard, PDF-import met controle | Snel nieuwe series toevoegen |
| Later | Zoeken op wielaansluitmaten ("welke velg past"), koppeling met webshop of offertes, meetwizard | n.v.t. |

## 10. Risico's en maatregelen

| Risico | Maatregel |
|---|---|
| Foute verhouding in de data leidt tot een verkeerd advies | Bron en status per waarde, reviewlijst bij de migratie, plausibiliteitscontrole, "twijfel"-label zichtbaar in de calculator |
| Afrolomtrek wijkt af door belasting, spanning of slijtage | Rekenen met databookwaarden; het advies benoemt dat het om mechanische voorloop gaat en noemt de slijtage-effecten |
| Verkeerde notatie bij invoer (Fendt omgekeerd) | Expliciete keuze van de notatie plus automatische herkenning bij waarden onder 1 |
| Collega's blijven Excel gebruiken | De MVP bevat vanaf dag één alle data en werkt sneller dan Excel; Excel-export blijft beschikbaar |
| Bedrijfsdata lekt uit | Private repository, inloggen verplicht (ook voor de API), noindex |
| Plugin botst met thema, andere plugins of WordPress-updates | Eigen tabellen en prefixen, geen afhankelijkheid van WooCommerce, eerst testen op staging |

## 11. Besluiten

| # | Onderwerp | Besluit |
|---|---|---|
| **B1** | Gebruikers | Kantoor, op de pc |
| **B2** | Platform | WordPress-plugin op de bestaande hosting (§ 8) |
| **B3** | Toegang | Afgeschermd en noindex; voorstel WordPress-accounts met twee rollen (§ 8.1), nog te bevestigen |
| **B4** | Wielaansluitmaten | Zoveel mogelijk meenemen; velden per stuk aan/uit te zetten |
| **B5** | Bandendatabase | Niet nodig voor de start: je typt de afrolomtrek in. Afrolomtrekken die gebruikers invoeren kunnen wel meteen als bandenlijst bewaard worden; databooks volgen in fase 4 |
| **B6** | Normzones | Voorstel akkoord als startwaarde; instelbaar door de beheerder, standaard en per merk |
| **B7** | Opslaan en printen | Ja, in de MVP |
| **B8** | Reviewlijst | De baas, via een reviewscherm in de module |
| **B9** | Bronbestanden | Staan in de repository; de repository is nu nog **openbaar** (zie § 12) |
| **B10** | Merken | Fendt, John Deere, Deutz-Fahr/SAME/Lamborghini, Massey Ferguson, New Holland, Case IH/Steyr; andere merken later via beheer of import |

## 12. Nog open

1. **Repository privé maken.** De repository staat op *public*, dus iedereen kan de bronbestanden
   downloaden. Zet hem via *Settings → General → Danger Zone → Change visibility* op *private*.
2. **Toegang (B3):** akkoord met WordPress-accounts met twee rollen in plaats van één
   paginawachtwoord?
3. **Hosting:** welke hostingpartij en welke PHP-versie? Mag er een eigen plugin geïnstalleerd
   worden, en is er een staging-omgeving?
4. **Print:** welke gegevens moeten er op de print (klantnaam, referentie, logo, opmerkingen)?
