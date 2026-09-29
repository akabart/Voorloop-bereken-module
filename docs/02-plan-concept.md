# Plan (concept v0.1): voorloop-rekenmodule

*Status: concept om samen te finetunen. Beslispunten zijn gemarkeerd met **[B1]**, **[B2]**, enzovoort
en staan samengevat in § 11. Achtergrond en onderbouwing: [01-vooronderzoek.md](01-vooronderzoek.md).*

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

## 2. Gebruikers en situaties (aannames, te bevestigen) [B1]

| Wie | Situatie | Wat is nodig |
|---|---|---|
| Balie en telefoon | Klant belt: "Ik heb een 724 met 650/65R42 achter, welke voorband?" | Snel zoeken, calculator, advies ideale voorband |
| Werkplaats en buitendienst | Bij de trekker, met telefoon of tablet; typeplaatje of chassisnummer in beeld | Mobiel bruikbaar, zoeken op chassisnummer, wielaansluitmaten |
| Beheerder(s) | Nieuwe trekker, correctie, import | Formulieren, notaties omrekenen, bron en status, wijzigingslog |

## 3. Scope

**In versie 1 (fase 1 t/m 3, zie § 9):** zoeken, navigatie, trekkerkaart, voorloopcalculator,
beheer, en de migratie van de vijf Excel-bestanden.

**Later (fase 4, 5 en verder):** bandendatabase met omgekeerd rekenen, Excel- en PDF-import,
rapport of print, koppeling met webshop of offertes.

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
- wielaansluitmaten voor en achter [B4];
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

Optioneel: berekening opslaan of printen voor een werkorder of klant [B7].

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

```
i          = n_voorwiel / n_achterwiel                    (genormaliseerd; normaal 1,15 tot 1,70)
voorloop % = (i × U_voor / U_achter − 1) × 100
ideale U_voor   = U_achter × (1 + doel) / i
ideale U_achter = U_voor × i / (1 + doel)
```

Voorstel voor de zones, per merk of uitvoering te overschrijven (bijvoorbeeld JD 1,5 tot 4 %
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
Berekening     uitvoering · voorband · achterband · uitkomst · wie · wanneer · referentie   (optioneel)
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

## 7. Migratie van de vijf Excel-bestanden

1. **Per merk een inleesroutine.** Elk bestand heeft een eigen opzet: vaste kolommen bij Fendt en
   MF, blokken per tabblad bij NH, Deutz en JD.
2. **Normaliseren:**
   - decimaaltekens herstellen ("1353" wordt 1,353, "13,6" wordt 13,6);
   - tekst omzetten naar getal;
   - de Fendt-notatie omkeren;
   - dubbele waarden ("1,3659/1,3318") splitsen in twee uitvoeringen.
3. **Kenmerken uit vrije tekst halen**, zoals "vanaf sn …", "tot 1441", "Dyna-6 - R42", "40 HD" en
   "KL 3/KL 4". Waar dat niet automatisch lukt, gaat het naar de reviewlijst.
4. **Reviewlijst** met alle twijfelgevallen, elk met een verwijzing naar bestand, tabblad en regel,
   zodat een vakspecialist ze kan beoordelen [B8].
5. **Controle achteraf:** de aantallen per merk of tabblad in de module komen overeen met de
   Excel-bestanden, en steekproeven worden naast het origineel gelegd.

## 8. Techniek [B2] [B3]

| Optie | Omschrijving | Voordelen | Nadelen |
|---|---|---|---|
| **A. Losse webapp (aanbevolen)** | Eigen webapplicatie in de browser op pc, tablet en telefoon | Snelle zoek- en reken-UI; schoon datamodel; later te koppelen aan de webshop via een API of widget | Eigen hosting en inlog nodig |
| B. Plugin in polderbanden.nl (WordPress/WooCommerce) | Module binnen de bestaande website | Zelfde hosting en accounts; later makkelijk publiek te tonen | Afhankelijk van WordPress-updates; beperktere beheerschermen; interne data naast de webshop |
| C. Low-code (Airtable, AppSheet e.d.) | Database en formulieren als SaaS | Snel neer te zetten | Slim zoeken en rekenen beperkt; kosten per gebruiker; afhankelijk van één leverancier |

**Voorstel bij optie A (te bevestigen):**

- TypeScript met een modern webframework (Next.js of SvelteKit), responsive zodat het ook op de
  telefoon werkt.
- PostgreSQL met trigram-zoeken; de huidige omvang (ongeveer 2.000 uitvoeringen, later enkele
  duizenden banden) is ruim binnen bereik.
- De rekenkern als losse, volledig geteste module.
- Inloggen met rollen: lezen of beheren.
- Dagelijkse back-up en een export naar Excel, zodat de data nooit "vastzit".

## 9. Fasering

| Fase | Inhoud | Resultaat |
|---|---|---|
| **1. Fundament** | Datamodel en database, rekenkern met tests, migratiescript, reviewlijst | Alle data genormaliseerd in de database |
| **2. MVP** | Zoeken, navigatie, trekkerkaart (incl. wielaansluitmaten, alleen lezen), calculator met handmatige afrolomtrek, zones en advies | Collega's kunnen de Excel-bestanden loslaten |
| **3. Beheer** | Toevoegen, bewerken en dupliceren; vier notaties; bron en status; wijzigingslog; rollen | Data groeit en blijft betrouwbaar |
| **4. Bandendatabase** | Afrolomtrekken per merk, profiel en maat; band kiezen uit lijst; omgekeerd rekenen ("welke voorbanden passen?"); fabriekscombinatie en relatieve methode | Minder typwerk, beter advies |
| **5. Import** | Excel/CSV-wizard, PDF-import met controle | Snel nieuwe series toevoegen |
| Later | Zoeken op wielaansluitmaten ("welke velg past"), rapport of print, koppeling met webshop of offertes, meetwizard | n.v.t. |

## 10. Risico's en maatregelen

| Risico | Maatregel |
|---|---|
| Foute verhouding in de data leidt tot een verkeerd advies | Bron en status per waarde, reviewlijst bij de migratie, plausibiliteitscontrole, "twijfel"-label zichtbaar in de calculator |
| Afrolomtrek wijkt af door belasting, spanning of slijtage | Rekenen met databookwaarden; het advies benoemt dat het om mechanische voorloop gaat en noemt de slijtage-effecten |
| Verkeerde notatie bij invoer (Fendt omgekeerd) | Expliciete keuze van de notatie plus automatische herkenning bij waarden onder 1 |
| Collega's blijven Excel gebruiken | De MVP bevat vanaf dag één alle data en werkt sneller dan Excel; Excel-export blijft beschikbaar |
| Bedrijfsdata lekt uit | Private repository, inloggen verplicht, geen publieke toegang |

## 11. Beslispunten

| # | Vraag | Voorstel |
|---|---|---|
| **B1** | Wie gebruikt de module, en ook op telefoon of tablet in de werkplaats of bij de klant? | Balie, werkplaats en buitendienst; mobiel bruikbaar |
| **B2** | Platform: losse webapp, plugin in de WordPress-site of low-code? | A: losse webapp |
| **B3** | Hosting en inloggen: waar draaien, hoe inloggen, wie mag wijzigen? | Kleine cloudserver; rollen lezen/beheren |
| **B4** | Wielaansluitmaten (flens, steekcirkel, bouten, naafgat, aanhaalmoment) meenemen? | Ja, alleen lezen in de MVP |
| **B5** | Bandendatabase: welke fase, welke merken eerst, en zijn er databooks of lijsten met afrolomtrekken? | Fase 4; eerst de merken die jullie het meest verkopen |
| **B6** | Normzones: akkoord met het voorstel in § 5? Uitzonderingen per merk? | Zie § 5 |
| **B7** | Berekening opslaan of printen, gekoppeld aan klant of werkorder? | Later; eerst alleen berekenen |
| **B8** | Wie beoordeelt de reviewlijst na de migratie? | Iemand met de meeste vakkennis van de huidige sheets |
| **B9** | Mogen de Excel-bestanden in de GitHub-repository? Is die privé? | Alleen in een privé-repository |
| **B10** | Welke merken ontbreken nog en hebben prioriteit (Case IH/Steyr, Claas, Valtra, Kubota, JCB, McCormick/Landini, Zetor)? | Na de migratie via beheer of import |
