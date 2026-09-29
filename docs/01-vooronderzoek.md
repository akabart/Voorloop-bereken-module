# Vooronderzoek: voorloop-rekenmodule Polderbanden.nl

*Versie 0.1, 29 september 2026*

## Samenvatting

- **Voorloop** is het percentage waarmee de voorwielen bij ingeschakelde vierwielaandrijving sneller
  willen rijden dan de achterwielen. De formule is
  `voorloop % = (i × U_voor / U_achter − 1) × 100`. Hierin is `i` de overbrengingsverhouding
  voor/achter (omwentelingen voorwiel per omwenteling achterwiel) en `U` de afrolomtrek.
- **`i` hoort bij een uitvoering, niet bij een type.** Binnen één type verschilt `i` per transmissie,
  maximumsnelheid, vooras(klasse), serienummerreeks, regio en soms zelfs per fabrieksbandenoptie.
  In jullie data ligt `i` bij 95 % van de uitvoeringen tussen 1,20 en 1,60 (mediaan 1,35).
- **De afrolomtrek is minstens zo bepalend.** Die hangt af van merk, profiel, maat, belasting,
  bandenspanning en slijtage. Met afrolomtrekken uit jullie eigen JD-sheet geldt: dezelfde maten van
  een ander merk verschuiven de voorloop van **1,3 % tot 3,6 %** bij dezelfde trekker. Elke procent
  verschil in afrolomtrek geeft ongeveer één procentpunt verschil in voorloop.
- **Normen lopen per bron uiteen.** Meestal is 0 tot 6 % (of 0,5 tot 5 %) toegestaan, is 1,5 tot
  3,5 % optimaal en is ongeveer 2,5 % ideaal. John Deere-handleidingen noemen 1,5 tot 4 %.
- **Bestaande tools zijn niet toereikend.** Ze vallen in twee soorten:
  - merkgebonden bandencalculators (Continental, Titan), waarbij je de overbrengingsverhouding zelf
    moet weten;
  - gesloten fabrikantlijsten, zoals de JD-compatibiliteitstabellen en de Fendt-bandenvrijgaves.

  Geen enkele tool combineert een merkonafhankelijke trekkerdatabase met uitvoeringen, afrolomtrekken
  van meerdere bandenmerken en een calculator. **De trekkerdataset van Polderbanden is daarom de kern
  van de module.**
- **De vijf Excel-bestanden zijn niet uniform.** Elk heeft een eigen structuur en notatie; Fendt
  schrijft de verhouding zelfs omgekeerd (0,757 in plaats van 1,321). Daarnaast zijn er veel
  datakwaliteitsproblemen: getallen als tekst, ontbrekende decimaaltekens en twee waarden in één
  cel. Voor de overstap is een migratie met normalisatie en een reviewlijst nodig.
- **De bestanden bevatten ook wielaansluitmaten**: flensmaat, steekcirkel, bouten, naafgat,
  boutzitting en aanhaalmoment. Voor een banden- en velgenbedrijf is dat waardevolle informatie, dus
  ons advies is die mee te nemen in het datamodel.

---

## 1. Wat is voorloop en waarom doet het ertoe?

Bij een trekker met mechanische vierwielaandrijving zijn voor- en achteras via tandwielen star met
elkaar verbonden. De voorwielen zijn kleiner dan de achterwielen, dus ze moeten sneller draaien om
dezelfde afstand af te leggen. De fabrikant kiest de overbrengingsverhouding zo dat de voorwielen
iets méér afstand willen afleggen dan de achterwielen. Dat verschil heet **voorloop** (Duits:
*Voreilung*, Engels: *front axle lead*). Een negatieve waarde heet **naloop** (*lag*).

Waarom een kleine positieve voorloop gewenst is:

- **De voorwielen trekken in plaats van te duwen.** Dat geeft beter stuurgedrag, vooral in bochten,
  waar de voorwielen een langere weg afleggen dan de achterwielen.
- **Er blijft marge over.** Door belasting, bandenspanning en slijtage wijkt de werkelijke
  afrolomtrek altijd iets af van de nominale. Met een kleine positieve voorloop blijft de vooras
  ook dan meetrekken in plaats van tegenwerken.
- **Naloop is schadelijk.** Bij naloop remt de vooras de trekker af. Het gevolg: warme voornaven,
  extra slip achter, spanning in de aandrijflijn, meer brandstofverbruik en snelle slijtage van de
  voorbanden ([Bridgestone](https://blog.bridgestone-agriculture.eu/what-are-the-signs-of-an-incorrect-lead-ratio)).
- **Te veel voorloop is ook schadelijk.** De voorbanden sleuren en de noppen slijten snel. Ook dan
  ontstaat verspanning in de aandrijflijn en stijgt het verbruik
  ([Bridgestone](https://blog.bridgestone-agriculture.eu/agricultural-tyres-rules-for-managing-the-lead-ratio),
  [AGTireTalk](https://agtiretalk.com/lead-lag-tractor-tire-calculation/)).
- **Het speelt ook op de weg.** Veel trekkers voor 40 km/h en meer schakelen de vierwielaandrijving
  automatisch in bij het remmen. Een verkeerde voorloop geeft dan spanning in de aandrijflijn, die
  volgens [profi](https://www.profi.de/praktisch/praktisch/voreilung-am-traktor-berechnen-und-reifen-wahlen-ein-rechenexempel-32757.html)
  hoorbaar is bij het loslaten van de rem.

## 2. De berekening

### 2.1 Aandrijflijn

```
                 ┌─► achterdifferentieel (i_diff) ─► eindreductie achter (i_eind) ─► ACHTERWIEL  (U_a)
motor ─ bak ─────┤
                 └─► tussenbak / MFWD-bak (i_tb) ─► cardanas ─► vooras (i_va) ────────► VOORWIEL   (U_v)
                                                               (differentieel + naafreductie)
```

De overbrengingsverhouding voor/achter is een vaste, mechanische waarde:

```
i = n_voorwiel / n_achterwiel = (i_diff × i_eind) / (i_tb × i_va)
```

### 2.2 Formules

```
U_v, U_a   = afrolomtrek voorband / achterband (mm, belast, volgens databook)
T          = U_a / U_v                                  (bandverhouding)

voorloop % = ( i × U_v / U_a − 1 ) × 100  =  ( i / T − 1 ) × 100
```

Omgekeerd rekenen (voor advies):

```
ideale afrolomtrek voorband   U_v = U_a × (1 + v) / i
ideale afrolomtrek achterband U_a = U_v × i / (1 + v)
benodigde verhouding          i   = T × (1 + v)          (bijv. keuze MFWD-bak bij John Deere)
```

Het percentage is relatief ten opzichte van de achteras. Alle bronnen gebruiken deze definitie
([Heuver](https://www.heuver.nl/kennis/landbouw/overbrengingsverhouding-afrolomtrek-en-voorloop),
[pneu-engeli](https://www.pneu-engeli.ch/diverses/fuer-die-landwirtschaft/178-vorlaufberechnungen),
[Titan](https://www.titan-intl.com/en/resources/Lead-Lag-Calculator),
[Michelin-rekenblad](https://www.axontire.com/wp-content/uploads/2021/01/michelin-how-to-calculate-mechanical-lead.pdf)).

### 2.3 Rekenvoorbeelden

**Voorbeeld 1: John Deere 6020, uit jullie eigen sheet "6020 Calculator"**

| Gegeven | Waarde |
|---|---|
| i_eind (vertraging achteras) | 6,4 |
| i_diff (achterdifferentieel) | 5,2 |
| i_va (vooras) | 13,16 |
| i_tb (MFWD-bak) | 1,917 |
| U_v (voorband) | 4.960 mm |
| U_a (achterband) | 6.375 mm |

- `i = (6,4 × 5,2) / (13,16 × 1,917) = 1,3192`
- `voorloop = (1,3192 × 4.960 / 6.375 − 1) × 100 = +2,64 %`
- Ideale voorband voor 2,5 %: 4.953 mm. Het groene gebied van 1 tot 5 % loopt van 4.881 tot 5.074 mm.
- De sheet berekent ook de MFWD-bak die precies 2,75 % zou geven: 1,915.

**Voorbeeld 2: Claas Arion 460, uit [profi](https://www.profi.de/praktisch/praktisch/voreilung-am-traktor-berechnen-und-reifen-wahlen-ein-rechenexempel-32757.html)**

- Mitas AC65 480/65R28 (4.064 mm) met 600/65R38 (5.251 mm), i = 1,335
- `voorloop = (1,335 × 4.064 / 5.251 − 1) × 100 = +3,32 %`

### 2.4 Notaties en valkuilen

Elk merkbestand gebruikt een eigen naam, en Fendt ook een eigen richting:

| Bestand | Naam in de sheet | Voorbeeld | Omrekenen naar `i` |
|---|---|---|---|
| John Deere | bakverhouding, "Nr RATIO", "MFWD pre run" | 1,319 | is al `i` |
| Deutz / SAME / Lamborghini | overbrengingsverhouding, aandrijfverh. | 1,3156 | is al `i` |
| **Fendt** | **Übers. VA/HA (Ratio FA/RA)** | **0,7571** | **`i = 1 / 0,7571 = 1,3208`** |
| Massey Ferguson | voorloop factor | 1,339 | is al `i` (let op: dit is géén voorloop%) |
| New Holland | overbrengingsverhouding | 1,353, vaak geschreven als "1353" | decimaalteken herstellen |

Aandachtspunten:

- **Benaderingen in de JD-tabellen.** De tabellen met voorloopkolommen (0 tot 5 %) rekenen soms
  exact met delen door (1 + v). Andere regels gebruiken een benadering: vermenigvuldigen met
  (1 − v) of met 0,99ⁿ. De 5 %-kolom staat daardoor in werkelijkheid voor 5,26 % respectievelijk
  5,15 %. Het verschil is klein, maar de module moet één exacte formule gebruiken.
- **De 6020-calculator rekent exact.** De formule in B21 is
  `=(A1 × I1 × I3 × 100) / (A2 × I2 × I4)`, gelijk aan de formule hierboven. Dat maakt de sheet
  een goede referentietest voor de nieuwe rekenkern.

## 3. Factoren die de voorloop bepalen

| Factor | Vast of variabel | Effect en voorbeeld uit jullie data | Gevolg voor de module |
|---|---|---|---|
| Transmissie | vast per uitvoering | NH: MECH-S, HI/LO-SL, SLE, SEMI/PS, PS/VARIO. MF: Dyna-4/6/VT/7/E-Power | kenmerk van de uitvoering |
| Maximumsnelheid | vast | 30, 40 of 50 km/h geven andere `i` (Deutz, SAME, NH, JD) | kenmerk van de uitvoering |
| Vooras (type, klasse) | vast | DANA 730/735/740/750, klasse CL3/CL4, standaard of HD, ILS stap 4/5 (JD 8020) | kenmerk van de uitvoering |
| Serienummer of bouwjaar | vast | JD: grens bij sn 251536. Fendt: chassisreeksen. NH: vanaf 008072001 kegelwielset 45/60 in plaats van 47/57 | chassisnummerbereik per uitvoering |
| Fabrieksbanden-optie | vast | NH T5: kegelwielen voor 24"/30"/36" (1,376) of 34"/38" (1,349). MF 7S: R42 of ≥ R38. Deutz: kleine of grote wielen (1,2997 of 1,1997) | uitvoering met voorwaarde |
| Ombouw of service | eenmalig | NH T4 N: nieuwe kegelwielset (P/N 87664468) → i = 1,483, plus kalibratie van de afrolomtrek in ADIC | notities en historie |
| Regio | vast | Fendt "NA" (Noord-Amerika, bar axle) | kenmerk van de uitvoering |
| **Afrolomtrek band** | per band | Merk, profiel en maat. 1 % verschil in afrolomtrek ≈ 1 procentpunt voorloop | bandendatabase (§ 5) |
| Belasting, ballast, frontlader | variabel | Een kleinere belaste straal geeft een kleinere afrolomtrek ([Firestone](https://www.firestone-agriculture.eu/blog/what-affects-my-agricultural-tyres-lead-ratio)) | advies of waarschuwing |
| Bandenspanning (IF/VF op lage druk) | variabel | Idem; VF-banden kunnen tot ongeveer 0,6 bar ([Bridgestone](https://blog.bridgestone-agriculture.eu/impact-of-the-dynamic-rolling-circumference-of-agricultural-tyres)) | advies |
| Slijtage | variabel | Noppen verliezen centimeters. Als de achterband 2 % kleiner wordt door slijtage, gaat 2,64 % naar **4,73 %**; bij de voorband gaat het naar **0,58 %** | advies bij "nieuw op versleten" |
| Ondergrond en slip | variabel | De effectieve voorloop in het veld wijkt af van de mechanische | de module rekent met de mechanische voorloop |

## 4. Aanbevolen bandbreedtes per bron

| Bron | Toegestaan | Optimaal | Opmerking |
|---|---|---|---|
| [Heuver](https://www.heuver.nl/kennis/landbouw/overbrengingsverhouding-afrolomtrek-en-voorloop) | 0 tot +6 % | +1 tot +5 % | `i` meestal 1,20 tot 1,50 |
| [Bridgestone/Firestone](https://blog.bridgestone-agriculture.eu/agricultural-tyres-rules-for-managing-the-lead-ratio) | 0,5 tot 5 % | 1,5 tot 3,5 % (elders 1,5 tot 3 %) | ideaal 2,5 %: minste noppenslijtage |
| [Michelin](https://business.michelin.co.uk/help-advice/farm-vehicles/choose-tyres-6-criteria-for-tractor-tyres) | 0 tot 5 % | n.v.t. | fabrikanten hanteren 0 tot 6 % ([rekenblad](https://www.axontire.com/wp-content/uploads/2021/01/michelin-how-to-calculate-mechanical-lead.pdf)) |
| [Titan / AGTireTalk](https://agtiretalk.com/lead-lag-tractor-tire-calculation/) | 0 tot 6 % (fabrikanten) | 1 tot 4 % (industrie) | n.v.t. |
| [Yokohama OHT (Alliance/Galaxy)](https://yohta-blog.yokohama-oht.com/picking-the-perfect-tractor-tire) | 1 tot 5 % | ongeveer 3 % | n.v.t. |
| John Deere-handleidingen ([bandencombinaties](http://manuals.deere.com/omview/OMAL152844_19/OU12401_0000D1E_19_01MAR03_1.htm), [compatibiliteitstabel](http://manuals.deere.com/omview/OMSJ16026_19/VP27597,0000F45_19_20181129.html)) | per model | 1,5 tot 4 % | compatibiliteitstabel per model |
| JD-forumpraktijk ([Green Tractor Talk](https://www.greentractortalk.com/threads/deere-4210-tire-help.222817/), [TractorByNet](https://www.tractorbynet.com/forums/threads/deere-855-mfwd-tires.259225/)) | 1,0 tot 3,5 % | hoog bij veldwerk, laag bij veel transport | niet geverifieerd |
| Jullie JD-sheets | 1 tot 5 % | 6020-calculator mikt op 2,75 % | n.v.t. |
| [profi / Landtreff](https://www.profi.de/praktisch/praktisch/voreilung-am-traktor-berechnen-und-reifen-wahlen-ein-rechenexempel-32757.html) | meestal 0 tot 5 % | n.v.t. | sommige trekkers: minimaal 1 % of maximaal 4 % |
| [GRDC](https://grdc.com.au/resources-and-publications/grownotes/technical-manuals/spray-application-manual/spraying-system-components-and-set-up/module-15-weight,-balance-and-tyres/15.5-determining-lead-and-lag-for-tractors) | n.v.t. | n.v.t. | typische `i` 1,25 tot 1,35 |

**Conclusie:** de module werkt met instelbare zones (voorstel in het planconcept):

- rood: onder 0 % of boven 6 %
- oranje: 0 tot 1 % en 5 tot 6 %
- groen: 1 tot 5 %
- optimaal: 1,5 tot 3,5 %, met 2,5 % als doel

De zones zijn per merk of uitvoering te overschrijven.

## 5. Afrolomtrek: waar komt het getal vandaan?

- **Definitie.** De afrolomtrek is de afgelegde afstand per omwenteling, onder belasting. De norm is
  [ISO 11795:2018](https://www.iso.org/standard/73299.html) (met Amd 1:2022), die ook de
  *Rolling Circumference Index* (RCI) en de *Speed Radius Index* (SRI) uitlegt. Er wordt gemeten bij
  nominale belasting en spanning, op een typische werksnelheid waarbij de vierwielaandrijving
  ingeschakeld zal zijn.
- **Bron.** De waarden staan per merk, profiel en maat in de databooks van de bandenfabrikanten,
  zoals [Michelin](https://agtiretalk.com/wp-content/uploads/2021/04/TECHNICAL-DATABOOK-AG-MICHELIN_EN_LR.pdf),
  [Continental](https://www.continental-tires.com/content/dam/conti-tires-cms/continental/b2b/agriculture/Continental__AG__Databook__A4__EN.pdf.coredownload.pdf)
  en [Vredestein](https://www.vredestein.nl/content/dam/orbit/vresdestein/agriculture-tyres/Vredestein%20Tyres%20Technical%20Data%20Tyres%20for%20Agriculture%202023-2024_EN_LR.pdf).
  Dat bedoelt jullie JD-sheet met "gebruik de bandenfolder".
- **Merkverschillen zijn groot.** ETRTO en TRA laten maattoleranties toe
  ([AGTireTalk](https://agtiretalk.com/why-do-tire-specs-vary-by-manufacturer/)). Het advies is bij
  vervanging binnen 1 % van de afrolomtrek van de oorspronkelijke band te blijven (zelfde bron).

  Illustratie met afrolomtrekken uit jullie eigen JD-sheet, bij een trekker met i = 1,3156:

  | voor 540/65R28 ↓ / achter 650/65R38 → | Michelin XM108 (5.400) | Vredestein Traxion+ (5.489) | Pirelli TM800 (5.425) |
  |---|---|---|---|
  | Michelin XM108 (4.227) | 2,98 % | **1,31 %** | 2,51 % |
  | Vredestein Traxion+ (4.252) | **3,59 %** | 1,91 % | 3,11 % |
  | Pirelli TM800 (4.250) | 3,54 % | 1,86 % | 3,07 % |

- **"Diameter × π" is alleen een noodoplossing.** De nominale diameter van een 650/65R38 is
  1.810 mm, wat 5.686 mm omtrek geeft. Het databook zegt 5.400 tot 5.489 mm: de schatting is
  ongeveer 4 à 5 % te hoog. Omdat de fout voor en achter bijna gelijk is, valt die in de
  bandverhouding grotendeels weg; merkverschillen doen dat niet. De module moet databookwaarden
  gebruiken en geschatte waarden duidelijk markeren.
- **RCI-families.** Het RCI-systeem groepeert banden met vrijwel dezelfde afrolomtrek. Banden in
  dezelfde familie zijn onderling uitwisselbaar zonder dat de voorloop verandert
  ([Titan RCI-kaart](https://www.titan-intl.com/-/media/Files/RCI_chart.pdf)).

## 6. Meten in de praktijk (als `i` onbekend is)

1. **Typeplaatjes aflezen.** Bij John Deere staan de vooras-, achterdifferentieel- en
   MFWD-bakverhouding op plaatjes op de vooras en bij de rechter hefarm, zoals jullie JD-sheet al
   instrueert.
2. **Omwentelingen tellen**
   ([BWT](https://bwt.uk.com/what-is-front-axle-lead-and-how-to-measure-it/),
   [Michelin](https://www.axontire.com/wp-content/uploads/2021/01/michelin-how-to-calculate-mechanical-lead.pdf),
   [CASE IH-forumwiki](https://www.caseih-forum.de/wiki:voreilung-beim-allad-schlepper-berechnen)).
   Zet een krijtstreep op de zijwand van een voor- en een achterband. Rijd met ingeschakelde
   vierwielaandrijving tot de achterband precies 10 omwentelingen heeft gemaakt en tel de
   omwentelingen van de voorband, op een tiende nauwkeurig: `i` = voor ÷ achter. Herhaal dit zonder
   vierwielaandrijving; de verhouding is dan de werkelijke bandverhouding `T`, en de voorloop is
   `i / T − 1`.
3. **Relatieve methode.** Als `i` onbekend is, maar de fabriekscombinatie bekend en goed is: houd de
   bandverhouding van de nieuwe combinatie binnen ±1 % van die van de fabriekscombinatie
   ([KM Tire](http://www.kmtire.com/takeaways/downloads/AgLeads.pdf)).

Voor de module betekent dit: `i` moet op meerdere manieren in te voeren zijn en de bron moet worden
vastgelegd (zie planconcept).

## 7. Analyse van de huidige Excel-bestanden

### 7.1 Overzicht

| Bestand | Tabbladen | Omvang | Opzet | Extra gegevens |
|---|---|---|---|---|
| **John Deere** | 6 | ongeveer 100 regels | Mengvorm: tabellen met kolommen 0 tot 5 % voorloop (op te zoeken met je eigen bandverhouding), een componententabel (AT50xx) en een echte calculator (6020) | MFWD-bakcodes (F t/m O, A1 t/m A3, oud/nieuw, bestelnummers), lijst "bekende afrolomtrekken" per merk, serienummergrenzen, instructie typeplaatjes |
| **Deutz** (incl. SAME en Lamborghini) | 8 | ongeveer 440 verhoudingen | Per model één verhouding plus wielaansluitmaten | Flensmaat, steekcirkel × aantal, boutgat, naafdiameter, boutzitting (vlak/konisch), vooras- en transmissietype, serienummergrenzen |
| **Fendt** | 24 | 878 typeregels, waarvan 690 met verhouding | AGCO-export "Übersetzungsverhältnisse Inter-Axle-Ratio 10/2012" met vaste kolommen (DE/EN) | Chassisnummer van/tot, motor, kW, versnellingen, transmissie, kegelwielset, as-types, vooras-`i`, flensmaten, wielbouten, steekcirkel, centreerdiameter, aanhaalmomenten, bouwjaren |
| **Massey Ferguson** | 7 (1 leeg) | 196 regels | Nette tabel | Vooras, steekmaat, flens-flens voor/achter, achteras, spacer |
| **New Holland** | 36 (2 leeg) | ongeveer 320 regels | Wielaansluitmaten plus verhouding per transmissie, snelheid of asklasse | Asbelastingen, draaicirkel, servicebulletin (kegelwielset T4 N) |

In totaal zijn buiten John Deere **ongeveer 1.740 verhoudingen** te normaliseren (mediaan 1,347).
Daarvan ligt 95 % tussen 1,20 en 1,60 en 99 % tussen 1,15 en 1,70. Lager liggen alleen bijzondere
concepten met grote voorwielen: de Fendt Xylon en GT (1,12 tot 1,16) en de Agrobil (1,00). Een
plausibiliteitscontrole bij invoer, met een waarschuwing buiten ongeveer 1,15 tot 1,70, vangt dus
tikfouten af. De controle moet wel te overrulen zijn.

### 7.2 Datakwaliteit

- **Fendt**
  - 453 van de 690 verhoudingen staan als tekst in plaats van als getal.
  - Sommige waarden gebruiken een komma, zoals "13,6".
  - 49 regels hebben 0,0.
  - Vrijwel alle verhoudingen staan in omgekeerde notatie (< 1).
- **New Holland**
  - 138 waarden missen het decimaalteken ("1353" is 1,353).
  - 93 cellen bevatten twee waarden, zoals "1,3659/1,3318", "1.321/1.323" of "1,309/1,378". Welke
    waarde bij welke uitvoering hoort, staat in de kolomkop of nergens.
  - Er staat vrije tekst in verhoudingkolommen: "niet leverbaar", "----", "(serv1,343)", ",nn".
  - Er zijn verdachte waarden: "0,852" (MC 35, mogelijk omgekeerd) en "16439" (TC 40/45).
- **Deutz**: typefouten zoals "1,4290." en "1448" (bedoeld: 1,448), plus lege verhoudingen.
- **Kenmerken van de uitvoering staan in vrije tekst**, zoals "Dyna-6 - R42", "VANAF 7566-2634",
  "tot 1441 / van 1442" en "40 HD". Die moeten gestructureerde velden worden.
- **Typenamen zijn inconsistent**, zoals "T.8360" tegenover "T8.360", "TSA 100\115" en "7S " met
  spatie aan het eind.
- **Het chassisnummerprefix bij Fendt is niet het typenummer.** Een Fendt met chassisnummer
  "724/21/…" is een **712 Vario** uit 2006; de **724 Vario** uit 2011 heeft "737/21/…". Een zoekvraag
  "724" moet dus beide vinden, maar het typenummer eerst tonen.

### 7.3 Wat dit betekent voor de module

1. De verhouding hoort bij een **uitvoering** (variant) van een type, met gestructureerde kenmerken:
   transmissie, km/h, vooras, chassisbereik, bouwjaren, regio en voorwaarden.
2. Er komt **één genormaliseerde notatie** (`i` > 1). De originele waarde en notatie blijven bewaard
   voor controle.
3. Per waarde leggen we **bron en status** vast: uit Excel, gecontroleerd, fabrieksdocument of
   gemeten.
4. **Wielaansluitmaten** worden een apart blok per as (voor/achter).
5. Bij de **migratie** worden alle twijfelgevallen op een reviewlijst gezet voor een vakinhoudelijke
   controle. Niets verdwijnt stilletjes.

## 8. Bestaande software: hoe pakken anderen het aan?

### 8.1 Overzicht

| Tool | Soort | Invoer | Trekker-database | Banden-database | Omgekeerd rekenen | Opmerking |
|---|---|---|---|---|---|---|
| [Titan Lead/Lag Calculator](https://www.titan-intl.com/en/resources/Lead-Lag-Calculator) | web | afrolomtrek voor/achter en `i` | nee | nee (zelf opzoeken) | ja: berekent de doel-afrolomtrek | generiek; norm 1 tot 4 % |
| [Continental Agriculture TireTech](https://www.continental-tires.com/us/en/b2b/services-and-solutions/agriculture-tiretech-app/) | app | `i` en keuze uit Continental-banden | nee | ja, alleen Continental | ja: adviseert Continental-banden | merkgebonden |
| [Trelleborg TLC](https://www.trelleborg.com/en-us/wheels/load-calculator) | app en web | machine en belasting | ja: 5.000+ configuraties, maar voor last en spanning | Trelleborg | n.v.t. | geen voorloopfunctie gevonden |
| Michelin [AgroPressure](https://business.michelinman.com/help-advice/tools/agropressure), [Mitas](https://www.mitas-tires.com/en/tech/mitas-tire-pressure-app), [Nokian](https://www.nokiantyres.com/heavy/tires/agricultural-and-contracting/tractor-tire-pressure-calculator/) | app en web | band, last, snelheid | nee | eigen merk | n.v.t. | alleen bandenspanning; voorloop via documentatie of adviseur |
| [Bridgestone VX-R TRACTOR](https://press.bridgestone-emea.com/bridgestone-launches-a-new-dimension-in-agricultural-tyres-the-new-vx-r-tractor-for-wide-and-long-lasting-performance/) | productontwerp | n.v.t. | n.v.t. | n.v.t. | n.v.t. | voor/achter-paren ontworpen op 2,5 % |
| RCI-systeem ([ISO 11795](https://www.iso.org/standard/73299.html), [Titan RCI-kaart](https://www.titan-intl.com/-/media/Files/RCI_chart.pdf)) | tabel | n.v.t. | n.v.t. | families van gelijke afrolomtrek | grof | uitwisselbare maten |
| John Deere ([handleidingen](http://manuals.deere.com/omview/OMRE274654_19/MX_WTIP_OA1A_19_24JUL95_1.htm)) | tabel in handleiding | n.v.t. | per model | vaste combinaties | n.v.t. | compatibiliteitstabellen, MFWD-bakcodes |
| Fendt ([bandenvrijgaves](https://reifenpresse.de/2021/03/23/tractormaster-erhaelt-freigaben-fuer-fendts-200-und-300-vario-serie/)) | vrijgavelijsten | n.v.t. | per model | vrijgegeven combinaties | n.v.t. | dealerinformatie, niet publiek. Volgens fora hebben dealers een online systeem (niet geverifieerd) |
| [Heuver](https://www.heuver.nl/kennis/landbouw/ombouwmogelijkheden-tractorbanden) (NL) | kennisbank, handboek, ombouwtabel | n.v.t. | niet gevonden | ja (handboek, webshop) | via ombouwtabel | formule plus normen |
| [Bohnenkamp](https://shop.bohnenkamp.de/service/index/umbereifung/) (DE) | webshopservice | standaardmaat | nee | ja | via ombouwtabel | "Umbereifung" |
| [AgriDaten](https://www.agridaten.de/traktorreifen-groessenrechner/) (DE) | web | twee bandmaten | nee | berekend | vergelijken | geen verhouding |
| [KM Tire](http://www.kmtire.com/takeaways/downloads/AgLeads.pdf) | methode | afrolomtrek oud en nieuw | n.v.t. | n.v.t. | ±1 % van de oude bandverhouding | werkt zonder `i` |

### 8.2 Lessen voor onze module

1. **Er is een gat in de markt.** Nergens vonden we een merkonafhankelijke trekkerdatabase met
   uitvoeringen, gekoppeld aan afrolomtrekken van meerdere bandenmerken en een calculator.
   Bandenfabrikanten beperken zich tot hun eigen merk en vragen je de verhouding zelf te weten.
   Trekkerfabrikanten houden hun lijsten gesloten. **De dataset van Polderbanden is dus de kern en
   de meerwaarde.**
2. **Wat we overnemen:**
   - omgekeerd rekenen en advies ("welke voorband past bij deze achterband?"), zoals Titan en
     Continental;
   - normzones met een doelwaarde, zoals Bridgestone;
   - de relatieve methode als terugvaloptie, zoals KM Tire;
   - denken in families van gelijke afrolomtrek, zoals RCI.
3. **Fabrikanten denken in vrijgegeven combinaties.** De module kan per uitvoering de
   standaardbanden vastleggen, zoals de JD-tabellen de "standaard uitvoering" tonen. Die dienen dan
   als referentie voor de relatieve methode.
4. **Geen enkele tool legt bron en verificatie vast.** Een fout in de data is het grootste risico,
   dus bronvermelding en een controlestatus zijn een onderscheidende eigenschap.

## 9. Conclusies voor het plan

- De datastructuur is: **Merk › Serie › Type › Uitvoering**, waarbij de verhouding bij de uitvoering
  hoort. Dat sluit aan op jullie wens voor de navigatie Merk › Serie › Type.
- De **rekenkern** is klein en exact. We testen die met de voorbeelden uit dit document en uit de
  Excel-bestanden.
- **Zoeken** moet genormaliseerd zijn ("T7.270" = "t7 270" = "t7270"), typenummers voorrang geven
  boven chassisprefixen en tikfouten verdragen.
- **Invoer** moet de verhouding in elke gangbare notatie accepteren (direct, Fendt VA/HA,
  JD-componenten, gemeten) en automatisch omrekenen.
- Een **bandendatabase** met afrolomtrekken is de grootste kwaliteitswinst na de trekkerdatabase.
- De **migratie** van de vijf bestanden is een project op zich, inclusief een reviewlijst.

Het uitgewerkte voorstel staat in [02-plan-concept.md](02-plan-concept.md).

---

## Verantwoording

- **Excel-bestanden.** Alle vijf bestanden zijn volledig uitgelezen, inclusief formules; voor de
  oude .xls-bestanden met een eigen BIFF-lezer. Aantallen en spreiding zijn berekend met scripts.
- **Webonderzoek.** Dit is gedaan via een zoekmachine. Directe toegang tot de websites was
  geblokkeerd door de netwerkinstellingen van de ontwikkelomgeving. Details over de functionaliteit
  van tools zijn daarom gebaseerd op zoekresultaten en samenvattingen. Waar een bewering alleen uit
  een forum komt, staat "niet geverifieerd".
