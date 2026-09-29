# Migratierapport

Automatisch gegenereerd door `tools/migratie/migreer.py`. Niet met de hand aanpassen; draai het script
opnieuw als de bronbestanden wijzigen.

## Tellingen

| Merk | Series | Types | Uitvoeringen | Met verhouding | Twijfel |
|---|---|---|---|---|---|
| Fendt | 30 | 406 | 925 | 680 | 6 |
| John Deere | 7 | 67 | 112 | 111 | 0 |
| Deutz-Fahr | 49 | 445 | 522 | 514 | 10 |
| SAME | 16 | 59 | 77 | 73 | 0 |
| Lamborghini | 9 | 32 | 33 | 32 | 0 |
| Massey Ferguson | 21 | 135 | 196 | 195 | 0 |
| New Holland | 34 | 319 | 585 | 580 | 243 |
| Case IH / Steyr | 11 | 156 | 249 | 230 | 92 |

- Bandenlijst (afrolomtrekken uit de JD-sheet): 27 banden
- Identieke uitvoeringen samengevoegd: 24
- Reviewitems: 313

## Reviewlijst

Deze punten komen in het reviewscherm van de module. De beheerder beoordeelt ze daar.

| # | Soort | Merk | Type | Uitvoering | Bron | Origineel | Probleem | Voorstel i |
|---|---|---|---|---|---|---|---|---|
| 1 | plausibiliteit | Fendt | 206 V | VA HR/2WD | Overbrengverhouding Fendt.xls / X 200 / L5 |  | verhouding 0 in bron |  |
| 2 | plausibiliteit | Fendt | 206 F | VA HR/2WD | Overbrengverhouding Fendt.xls / X 200 / L6 |  | verhouding 0 in bron |  |
| 3 | plausibiliteit | Fendt | 207 V | VA HR/2WD | Overbrengverhouding Fendt.xls / X 200 / L11 |  | verhouding 0 in bron |  |
| 4 | plausibiliteit | Fendt | 207 F | VA HR/2WD | Overbrengverhouding Fendt.xls / X 200 / L12 |  | verhouding 0 in bron |  |
| 5 | tekst | Fendt | Favorit 12 S | VA ZF 3050 | Overbrengverhouding Fendt.xls / Favorit S_150-184 / L34 | 0.68751 bei 11.2- 24 vorn | tekst in de cel: "0.68751 bei 11.2- 24 vorn" | 1,4545 |
| 6 | tekst | Fendt | Favorit 12 S | VA ZF 3050 | Overbrengverhouding Fendt.xls / Favorit S_150-184 / L35 | 0.74654 bei 11.2- 28 vorn | tekst in de cel: "0.74654 bei 11.2- 28 vorn" | 1,3395 |
| 7 | overig | John Deere |  |  | voorloopberekening.xls / Voorloop Formule /  | zie werkblad | Losse calculator (6R). De ingevulde waarden geven 23.1 % voorloop (A1=4180, A2=5220, I1=7,0714, I2=15,692, I3=4,9, I4=1,436); de invoer lijkt niet bij elkaar te horen. Controleren welke componentwaarden bij de 6R-serie horen. |  |
| 8 | decimaal | Deutz-Fahr | DX 3 V | uitvoering S · VA 207K10 · TW 550 | Overbrengingsverhouding Deutz.xlsx / Deutz-Fahr OUD / F151 | 1448 | decimaalteken ontbrak (1448 gelezen als 1,4480) | 1,4480 |
| 9 | tekst | Deutz-Fahr | 5115 DS TTV geveerd/ongev. | kastmaat 440 biji 24" | Deutz Fahr as gegevens.pdf / pdf p2 / 5115 DS TTV geveerd/ongev. | 1,5925 (STD) | verhouding gemarkeerd als (STD) in de PDF | 1,5925 |
| 10 | tekst | Deutz-Fahr | 5105 DS TTV gefedert/ ungef. | kastmaat 440 biji 24" | Deutz Fahr as gegevens.pdf / pdf p2 / 5105 DS TTV gefedert/ ungef. | 1,5925 (STD) | verhouding gemarkeerd als (STD) in de PDF | 1,5925 |
| 11 | tekst | Deutz-Fahr | 5090.4 DS TTV gefedert/ | kastmaat 440 biji 24" | Deutz Fahr as gegevens.pdf / pdf p2 / 5090.4 DS TTV gefedert/ | 1,5925 (STD) | verhouding gemarkeerd als (STD) in de PDF | 1,5925 |
| 12 | tekst | Deutz-Fahr | 5100 DS TTV gefedert/ungef | kastmaat 440 biji 24" | Deutz Fahr as gegevens.pdf / pdf p2 / 5100 DS TTV gefedert/ungef | 1,5925 (STD) | verhouding gemarkeerd als (STD) in de PDF | 1,5925 |
| 13 | tekst | Deutz-Fahr | 5115 DV TTV geveerd/ongev./schma | kastmaat 440 | Deutz Fahr as gegevens.pdf / pdf p2 / 5115 DV TTV geveerd/ongev./schma | 1,4988 (STD) | verhouding gemarkeerd als (STD) in de PDF | 1,4988 |
| 14 | tekst | Deutz-Fahr | 5105 DV TTV geveerd/ongev./schma | kastmaat 440 | Deutz Fahr as gegevens.pdf / pdf p2 / 5105 DV TTV geveerd/ongev./schma | 1,4988 (STD) | verhouding gemarkeerd als (STD) in de PDF | 1,4988 |
| 15 | tekst | Deutz-Fahr | 5090.4 DV TTV geveerd/ongev./schm | kastmaat 440 | Deutz Fahr as gegevens.pdf / pdf p2 / 5090.4 DV TTV geveerd/ongev./schm | 1,4988 (STD) | verhouding gemarkeerd als (STD) in de PDF | 1,4988 |
| 16 | tekst | Deutz-Fahr | 5100 DV TTV geveerd/ongev./schma | kastmaat 440 | Deutz Fahr as gegevens.pdf / pdf p2 / 5100 DV TTV geveerd/ongev./schma | 1,4988 (STD) | verhouding gemarkeerd als (STD) in de PDF | 1,4988 |
| 17 | tekst | Deutz-Fahr | 5090 DV TTV geveerd/ongev./schma | kastmaat 440 | Deutz Fahr as gegevens.pdf / pdf p2 / 5090 DV TTV geveerd/ongev./schma | 1,4988 (STD) | verhouding gemarkeerd als (STD) in de PDF | 1,4988 |
| 18 | decimaal | New Holland | T5.75 | 40 km/h · HI/LO-SL | Overbrengverhouding NewHolland_2020.xlsx / T5,XXX Utility (2) / L6 | 1345 | decimaalteken ontbrak (1345 gelezen als 1,3450) | 1,3450 |
| 19 | decimaal | New Holland | T5.85 | 40 km/h · HI/LO-SL | Overbrengverhouding NewHolland_2020.xlsx / T5,XXX Utility (2) / L7 | 1345 | decimaalteken ontbrak (1345 gelezen als 1,3450) | 1,3450 |
| 20 | decimaal | New Holland | T5.95 | 40 km/h · HI/LO-SL | Overbrengverhouding NewHolland_2020.xlsx / T5,XXX Utility (2) / L8 | 1345 | decimaalteken ontbrak (1345 gelezen als 1,3450) | 1,3450 |
| 21 | decimaal | New Holland | T5.105 | 40 km/h · HI/LO-SL | Overbrengverhouding NewHolland_2020.xlsx / T5,XXX Utility (2) / L9 | 1345 | decimaalteken ontbrak (1345 gelezen als 1,3450) | 1,3450 |
| 22 | decimaal | New Holland | T5.115 | 40 km/h · HI/LO-SL | Overbrengverhouding NewHolland_2020.xlsx / T5,XXX Utility (2) / L10 | 1345 | decimaalteken ontbrak (1345 gelezen als 1,3450) | 1,3450 |
| 23 | decimaal | New Holland | T5.75 | 40 km/h · HI/LO-SL | Overbrengverhouding NewHolland_2020.xlsx / T5,XXX Utility (2) / L13 | 1376 | decimaalteken ontbrak (1376 gelezen als 1,3760) | 1,3760 |
| 24 | decimaal | New Holland | T5.85 | 40 km/h · HI/LO-SL | Overbrengverhouding NewHolland_2020.xlsx / T5,XXX Utility (2) / L14 | 1376 | decimaalteken ontbrak (1376 gelezen als 1,3760) | 1,3760 |
| 25 | decimaal | New Holland | T5.95 | 40 km/h · HI/LO-SL | Overbrengverhouding NewHolland_2020.xlsx / T5,XXX Utility (2) / L15 | 1376 | decimaalteken ontbrak (1376 gelezen als 1,3760) | 1,3760 |
| 26 | decimaal | New Holland | T5.105 | 40 km/h · HI/LO-SL | Overbrengverhouding NewHolland_2020.xlsx / T5,XXX Utility (2) / L16 | 1376 | decimaalteken ontbrak (1376 gelezen als 1,3760) | 1,3760 |
| 27 | decimaal | New Holland | T5.115 | 40 km/h · HI/LO-SL | Overbrengverhouding NewHolland_2020.xlsx / T5,XXX Utility (2) / L17 | 1376 | decimaalteken ontbrak (1376 gelezen als 1,3760) | 1,3760 |
| 28 | decimaal | New Holland | TCE | MECH-S | Overbrengverhouding NewHolland_2020.xlsx / TC_TCE_MC / K5 | 1470 | decimaalteken ontbrak (1470 gelezen als 1,4700) | 1,4700 |
| 29 | decimaal | New Holland | TC 27 D | MECH-S | Overbrengverhouding NewHolland_2020.xlsx / TC_TCE_MC / K8 | 1589 | decimaalteken ontbrak (1589 gelezen als 1,5890) | 1,5890 |
| 30 | decimaal | New Holland | TC 40, 45 D | MECH-S | Overbrengverhouding NewHolland_2020.xlsx / TC_TCE_MC / K10 | 16439 | decimaalteken ontbrak (16439 gelezen als 1,6439) | 1,6439 |
| 31 | plausibiliteit | New Holland | MC 35 | MECH-S | Overbrengverhouding NewHolland_2020.xlsx / TC_TCE_MC / K12 | 0.852 | waarde 0,852 < 1: omgekeerd gelezen als 1,1737 | 1,1737 |
| 32 | decimaal | New Holland | T3.50F | OVERBRENGINGSVERHOUDING 30 KM · klasse 1 | Overbrengverhouding NewHolland_2020.xlsx / T3.XXF / N4 | 1465 | decimaalteken ontbrak (1465 gelezen als 1,4650) | 1,4650 |
| 33 | decimaal | New Holland | T3.50F | OVERBRENGINGSVERHOUDING 40 KM · klasse 1 | Overbrengverhouding NewHolland_2020.xlsx / T3.XXF / O4 | 1463 | decimaalteken ontbrak (1463 gelezen als 1,4630) | 1,4630 |
| 34 | decimaal | New Holland | T3.55F | OVERBRENGINGSVERHOUDING 30 KM · klasse 1 | Overbrengverhouding NewHolland_2020.xlsx / T3.XXF / N5 | 1465 | decimaalteken ontbrak (1465 gelezen als 1,4650) | 1,4650 |
| 35 | decimaal | New Holland | T3.55F | OVERBRENGINGSVERHOUDING 40 KM · klasse 1 | Overbrengverhouding NewHolland_2020.xlsx / T3.XXF / O5 | 1463 | decimaalteken ontbrak (1463 gelezen als 1,4630) | 1,4630 |
| 36 | decimaal | New Holland | T3.65F | OVERBRENGINGSVERHOUDING 30 KM · klasse 1 | Overbrengverhouding NewHolland_2020.xlsx / T3.XXF / N6 | 1465 | decimaalteken ontbrak (1465 gelezen als 1,4650) | 1,4650 |
| 37 | decimaal | New Holland | T3.65F | OVERBRENGINGSVERHOUDING 40 KM · klasse 1 | Overbrengverhouding NewHolland_2020.xlsx / T3.XXF / O6 | 1463 | decimaalteken ontbrak (1463 gelezen als 1,4630) | 1,4630 |
| 38 | decimaal | New Holland | T3.75F | OVERBRENGINGSVERHOUDING 30 KM · klasse 1 | Overbrengverhouding NewHolland_2020.xlsx / T3.XXF / N7 | 1465 | decimaalteken ontbrak (1465 gelezen als 1,4650) | 1,4650 |
| 39 | decimaal | New Holland | T3.75F | OVERBRENGINGSVERHOUDING 40 KM · klasse 1 | Overbrengverhouding NewHolland_2020.xlsx / T3.XXF / O7 | 1463 | decimaalteken ontbrak (1463 gelezen als 1,4630) | 1,4630 |
| 40 | decimaal | New Holland | TNN 65/75 | HI/LO-SL | Overbrengverhouding NewHolland_2020.xlsx / TN_TNA / L18 | 1506 | decimaalteken ontbrak (1506 gelezen als 1,5060) | 1,5060 |
| 41 | decimaal | New Holland | T5.75 | SS · 30 km | Overbrengverhouding NewHolland_2020.xlsx / T5.75 Tm T5.115 utillity / K6 | 1318 | decimaalteken ontbrak (1318 gelezen als 1,3180) | 1,3180 |
| 42 | decimaal | New Holland | T5.85 | SS · 30 km | Overbrengverhouding NewHolland_2020.xlsx / T5.75 Tm T5.115 utillity / K8 | 1318 | decimaalteken ontbrak (1318 gelezen als 1,3180) | 1,3180 |
| 43 | decimaal | New Holland | T5.95 | SS · 30 km | Overbrengverhouding NewHolland_2020.xlsx / T5.75 Tm T5.115 utillity / K10 | 1318 | decimaalteken ontbrak (1318 gelezen als 1,3180) | 1,3180 |
| 44 | decimaal | New Holland | T5.105 | SS · 30 km | Overbrengverhouding NewHolland_2020.xlsx / T5.75 Tm T5.115 utillity / K12 | 1318 | decimaalteken ontbrak (1318 gelezen als 1,3180) | 1,3180 |
| 45 | decimaal | New Holland | T5.115 | SS · 30 km | Overbrengverhouding NewHolland_2020.xlsx / T5.75 Tm T5.115 utillity / K14 | 1318 | decimaalteken ontbrak (1318 gelezen als 1,3180) | 1,3180 |
| 46 | decimaal | New Holland | 40 | 1790 · 30 km | Overbrengverhouding NewHolland_2020.xlsx / T5.75 Tm T5.115 utillity / K18 | 1345 | decimaalteken ontbrak (1345 gelezen als 1,3450) | 1,3450 |
| 47 | decimaal | New Holland | 40 | 1790 · 30 km | Overbrengverhouding NewHolland_2020.xlsx / T5.75 Tm T5.115 utillity / K19 | 1345 | decimaalteken ontbrak (1345 gelezen als 1,3450) | 1,3450 |
| 48 | decimaal | New Holland | 40 | 1790 · 30 km | Overbrengverhouding NewHolland_2020.xlsx / T5.75 Tm T5.115 utillity / K20 | 1345 | decimaalteken ontbrak (1345 gelezen als 1,3450) | 1,3450 |
| 49 | decimaal | New Holland | 40 | 1790 · 30 km | Overbrengverhouding NewHolland_2020.xlsx / T5.75 Tm T5.115 utillity / K21 | 1345 | decimaalteken ontbrak (1345 gelezen als 1,3450) | 1,3450 |
| 50 | decimaal | New Holland | 40 | 1790 · 30 km | Overbrengverhouding NewHolland_2020.xlsx / T5.75 Tm T5.115 utillity / K22 | 1345 | decimaalteken ontbrak (1345 gelezen als 1,3450) | 1,3450 |
| 51 | decimaal | New Holland | T5.95 | 40 km/h · EC | Overbrengverhouding NewHolland_2020.xlsx / T5.xxxT4 EC / M5 | 1361 | decimaalteken ontbrak (1361 gelezen als 1,3610) | 1,3610 |
| 52 | decimaal | New Holland | T5.105 | 40 km/h · EC | Overbrengverhouding NewHolland_2020.xlsx / T5.xxxT4 EC / M6 | 1361 | decimaalteken ontbrak (1361 gelezen als 1,3610) | 1,3610 |
| 53 | decimaal | New Holland | T5.115 | 40 km/h · EC | Overbrengverhouding NewHolland_2020.xlsx / T5.xxxT4 EC / M7 | 1361 | decimaalteken ontbrak (1361 gelezen als 1,3610) | 1,3610 |
| 54 | meerdere | New Holland | 5640 | MECH-S · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / K5 | 1,3659/1,3318 | meerdere waarden in één cel: "1,3659/1,3318" | 1,3659 |
| 55 | meerdere | New Holland | 5640 | HI/LO-SL · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / L5 | 1,3805/1,3442 | meerdere waarden in één cel: "1,3805/1,3442" | 1,3805 |
| 56 | meerdere | New Holland | 5640 | SLE · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / M5 | 1,3777/1,3415 | meerdere waarden in één cel: "1,3777/1,3415" | 1,3777 |
| 57 | meerdere | New Holland | 6640 | MECH-S · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / K6 | 1,3659/1,3318 | meerdere waarden in één cel: "1,3659/1,3318" | 1,3659 |
| 58 | meerdere | New Holland | 6640 | HI/LO-SL · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / L6 | 1,3805/1,3442 | meerdere waarden in één cel: "1,3805/1,3442" | 1,3805 |
| 59 | meerdere | New Holland | 6640 | SLE · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / M6 | 1,3777/1,3415 | meerdere waarden in één cel: "1,3777/1,3415" | 1,3777 |
| 60 | meerdere | New Holland | 7740 | MECH-S · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / K7 | 1,3659/1,3318 | meerdere waarden in één cel: "1,3659/1,3318" | 1,3659 |
| 61 | meerdere | New Holland | 7740 | HI/LO-SL · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / L7 | 1,3805/1,3442 | meerdere waarden in één cel: "1,3805/1,3442" | 1,3805 |
| 62 | meerdere | New Holland | 7740 | SLE · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / M7 | 1,3777/1,3415 | meerdere waarden in één cel: "1,3777/1,3415" | 1,3777 |
| 63 | meerdere | New Holland | 7840 | MECH-S · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / K8 | 1,3659/1,3318 | meerdere waarden in één cel: "1,3659/1,3318" | 1,3659 |
| 64 | meerdere | New Holland | 7840 | HI/LO-SL · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / L8 | 1,3805/1,3442 | meerdere waarden in één cel: "1,3805/1,3442" | 1,3805 |
| 65 | meerdere | New Holland | 7840 | SLE · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / M8 | 1,3777/1,3415 | meerdere waarden in één cel: "1,3777/1,3415" | 1,3777 |
| 66 | meerdere | New Holland | 8240 | HI/LO-SL · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / L9 | 1,3586/1,3228 | meerdere waarden in één cel: "1,3586/1,3228" | 1,3586 |
| 67 | meerdere | New Holland | 8240 | SLE · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / M9 | 1,3558/1,3201 | meerdere waarden in één cel: "1,3558/1,3201" | 1,3558 |
| 68 | meerdere | New Holland | 8340 | HI/LO-SL · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / L10 | 1,3586/1,3228 | meerdere waarden in één cel: "1,3586/1,3228" | 1,3586 |
| 69 | meerdere | New Holland | 8340 | SLE · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / M10 | 1,3558/1,3201 | meerdere waarden in één cel: "1,3558/1,3201" | 1,3558 |
| 70 | meerdere | New Holland | TS 80 | MECH-S · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / K12 | 1,3659/1,3318 | meerdere waarden in één cel: "1,3659/1,3318" | 1,3659 |
| 71 | meerdere | New Holland | TS 80 | HI/LO-SL · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / L12 | 1,3805/1,3442 | meerdere waarden in één cel: "1,3805/1,3442" | 1,3805 |
| 72 | meerdere | New Holland | TS 80 | SLE · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / M12 | 1,3777/1,3415 | meerdere waarden in één cel: "1,3777/1,3415" | 1,3777 |
| 73 | meerdere | New Holland | TS 90 | MECH-S · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / K13 | 1,3659/1,3318 | meerdere waarden in één cel: "1,3659/1,3318" | 1,3659 |
| 74 | meerdere | New Holland | TS 90 | HI/LO-SL · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / L13 | 1,3805/1,3442 | meerdere waarden in één cel: "1,3805/1,3442" | 1,3805 |
| 75 | meerdere | New Holland | TS 90 | SLE · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / M13 | 1,3777/1,3415 | meerdere waarden in één cel: "1,3777/1,3415" | 1,3777 |
| 76 | meerdere | New Holland | TS 100 | MECH-S · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / K14 | 1,3659/1,3318 | meerdere waarden in één cel: "1,3659/1,3318" | 1,3659 |
| 77 | meerdere | New Holland | TS 100 | HI/LO-SL · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / L14 | 1,3805/1,3442 | meerdere waarden in één cel: "1,3805/1,3442" | 1,3805 |
| 78 | meerdere | New Holland | TS 100 | SLE · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / M14 | 1,3777/1,3415 | meerdere waarden in één cel: "1,3777/1,3415" | 1,3777 |
| 79 | meerdere | New Holland | TS 110 | MECH-S · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / K15 | 1,3659/1,3318 | meerdere waarden in één cel: "1,3659/1,3318" | 1,3659 |
| 80 | meerdere | New Holland | TS 110 | HI/LO-SL · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / L15 | 1,3805/1,3442 | meerdere waarden in één cel: "1,3805/1,3442" | 1,3805 |
| 81 | meerdere | New Holland | TS 110 | SLE · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / M15 | 1,3777/1,3415 | meerdere waarden in één cel: "1,3777/1,3415" | 1,3777 |
| 82 | meerdere | New Holland | TS 115 | MECH-S · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / K16 | 1,3659/1,3318 | meerdere waarden in één cel: "1,3659/1,3318" | 1,3659 |
| 83 | meerdere | New Holland | TS 115 | HI/LO-SL · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / L16 | 1,3805/1,3442 | meerdere waarden in één cel: "1,3805/1,3442" | 1,3805 |
| 84 | meerdere | New Holland | TS 115 | SLE · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / TS_TSA / M16 | 1,3777/1,3415 | meerdere waarden in één cel: "1,3777/1,3415" | 1,3777 |
| 85 | meerdere | New Holland | T6030 | Elite · Type Achteras/Transmissie Heavy Duty · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T6000 / M30 | 1.321/1.323 | meerdere waarden in één cel: "1.321/1.323" | 1,3210 |
| 86 | meerdere | New Holland | T6050 | Elite · Type Achteras/Transmissie Heavy Duty · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T6000 / M32 | 1.321/1.323 | meerdere waarden in één cel: "1.321/1.323" | 1,3210 |
| 87 | meerdere | New Holland | T6070 | Elite · Type Achteras/Transmissie Heavy Duty · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T6000 / M35 | 1.321/1.323 | meerdere waarden in één cel: "1.321/1.323" | 1,3210 |
| 88 | meerdere | New Holland | T6030 FSUS | Elite · Type Achteras/Transmissie Heavy Duty · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T6000 / M39 | 1.321/1.323 | meerdere waarden in één cel: "1.321/1.323" | 1,3210 |
| 89 | meerdere | New Holland | T6050 FSUS | Elite · Type Achteras/Transmissie Heavy Duty · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T6000 / M41 | 1.321/1.323 | meerdere waarden in één cel: "1.321/1.323" | 1,3210 |
| 90 | meerdere | New Holland | T6070 FSUS | Elite · Type Achteras/Transmissie Heavy Duty · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T6000 / M44 | 1.321/1.323 | meerdere waarden in één cel: "1.321/1.323" | 1,3210 |
| 91 | meerdere | New Holland | T6030 SS | Elite · Type Achteras/Transmissie Heavy Duty · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T6000 / M48 | 1.321/1.323 | meerdere waarden in één cel: "1.321/1.323" | 1,3210 |
| 92 | meerdere | New Holland | T6050 SS | Elite · Type Achteras/Transmissie Heavy Duty · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T6000 / M50 | 1.321/1.323 | meerdere waarden in één cel: "1.321/1.323" | 1,3210 |
| 93 | meerdere | New Holland | T6070 SS | Elite · Type Achteras/Transmissie Heavy Duty · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T6000 / M53 | 1.321/1.323 | meerdere waarden in één cel: "1.321/1.323" | 1,3210 |
| 94 | decimaal | New Holland | T6.120 | KL 3 1353 · klasse 3 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx / L6 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 95 | decimaal | New Holland | T6.140 | KL 3 1353 · klasse 3 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx / L7 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 96 | decimaal | New Holland | T6.150 | KL 3 1353 · klasse 3 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx / L8 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 97 | decimaal | New Holland | T6.160 | KL 3 1353 · klasse 3 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx / L9 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 98 | decimaal | New Holland | T6.155 | KL 3 1353 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx / L10 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 99 | decimaal | New Holland | T6.155 | KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx / M10 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 100 | decimaal | New Holland | T6.165 | KL 3 1353 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx / L11 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 101 | decimaal | New Holland | T6.165 | KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx / M11 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 102 | decimaal | New Holland | T6.175 | KL 3 1353 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx / L12 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 103 | decimaal | New Holland | T6.175 | KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx / M12 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 104 | decimaal | New Holland | T6.125 | KL 3 1326 · klasse 3 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx T4B / L6 | 1326 | decimaalteken ontbrak (1326 gelezen als 1,3260) | 1,3260 |
| 105 | decimaal | New Holland | T6.145 | KL 3 1326 · klasse 3 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx T4B / L7 | 1326 | decimaalteken ontbrak (1326 gelezen als 1,3260) | 1,3260 |
| 106 | decimaal | New Holland | T6.155 | KL 3 1326 · klasse 3 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx T4B / L8 | 1326 | decimaalteken ontbrak (1326 gelezen als 1,3260) | 1,3260 |
| 107 | decimaal | New Holland | T6.165 | KL 3 1326 · klasse 3 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx T4B / L9 | 1326 | decimaalteken ontbrak (1326 gelezen als 1,3260) | 1,3260 |
| 108 | decimaal | New Holland | T6.175 | KL 3 1326 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx T4B / L10 | 1326 | decimaalteken ontbrak (1326 gelezen als 1,3260) | 1,3260 |
| 109 | decimaal | New Holland | T6.175 | KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx T4B / M10 | 1329 | decimaalteken ontbrak (1329 gelezen als 1,3290) | 1,3290 |
| 110 | decimaal | New Holland | T6.180 | KL 3 1326 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx T4B / L11 | 1326 | decimaalteken ontbrak (1326 gelezen als 1,3260) | 1,3260 |
| 111 | decimaal | New Holland | T6.180 | KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T6.xxx T4B / M11 | 1329 | decimaalteken ontbrak (1329 gelezen als 1,3290) | 1,3290 |
| 112 | decimaal | New Holland | T7.170 | SPS/PS/VARIO KL 3 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L5 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 113 | decimaal | New Holland | T7.170 | SPS/PS/VARIO KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M5 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 114 | decimaal | New Holland | T7.185 | SPS/PS/VARIO KL 3 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L6 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 115 | decimaal | New Holland | T7.185 | SPS/PS/VARIO KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M6 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 116 | decimaal | New Holland | T7.200 | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L7 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 117 | decimaal | New Holland | T7.200 | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M7 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 118 | decimaal | New Holland | T7.210 | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L8 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 119 | decimaal | New Holland | T7.210 | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M8 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 120 | decimaal | New Holland | T7.170 SS | SPS/PS/VARIO KL 3 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L10 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 121 | decimaal | New Holland | T7.170 SS | SPS/PS/VARIO KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M10 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 122 | decimaal | New Holland | T7.185 SS | SPS/PS/VARIO KL 3 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L11 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 123 | decimaal | New Holland | T7.185 SS | SPS/PS/VARIO KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M11 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 124 | decimaal | New Holland | T7.200 SS | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L12 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 125 | decimaal | New Holland | T7.200 SS | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M12 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 126 | decimaal | New Holland | T7.210 SS | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L13 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 127 | decimaal | New Holland | T7.210 SS | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M13 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 128 | decimaal | New Holland | T7.170 SUS | SPS/PS/VARIO KL 3 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L16 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 129 | decimaal | New Holland | T7.170 SUS | SPS/PS/VARIO KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M16 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 130 | decimaal | New Holland | T7.185 SUS | SPS/PS/VARIO KL 3 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L17 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 131 | decimaal | New Holland | T7.185 SUS | SPS/PS/VARIO KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M17 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 132 | decimaal | New Holland | T7.200 SUS | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L18 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 133 | decimaal | New Holland | T7.200 SUS | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M18 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 134 | decimaal | New Holland | T7.210 SUS | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / L19 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 135 | decimaal | New Holland | T7.210 SUS | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB / M19 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 136 | decimaal | New Holland | T7.175 | SPS/PS/VARIO KL 3 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / L5 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 137 | decimaal | New Holland | T7.175 | SPS/PS/VARIO KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / M5 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 138 | decimaal | New Holland | T7.190 | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / L6 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 139 | decimaal | New Holland | T7.190 | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / M6 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 140 | decimaal | New Holland | T7.210 | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / L7 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 141 | decimaal | New Holland | T7.210 | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / M7 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 142 | decimaal | New Holland | T7.175 SS | SPS/PS/VARIO KL 3 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / L10 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 143 | decimaal | New Holland | T7.175 SS | SPS/PS/VARIO KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / M10 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 144 | decimaal | New Holland | T7.190 SS | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / L11 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 145 | decimaal | New Holland | T7.190 SS | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / M11 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 146 | decimaal | New Holland | T7.210 SS | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / L12 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 147 | decimaal | New Holland | T7.210 SS | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / M12 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 148 | decimaal | New Holland | T7.175 SUS | SPS/PS/VARIO KL 3 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / L15 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 149 | decimaal | New Holland | T7.175 SUS | SPS/PS/VARIO KL 4 · klasse 3/4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / M15 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 150 | decimaal | New Holland | T7.190 SUS | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / L16 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 151 | decimaal | New Holland | T7.190 SUS | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / M16 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 152 | decimaal | New Holland | T7.210 SUS | SPS/PS/VARIO KL 3 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / L17 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 153 | decimaal | New Holland | T7.210 SUS | SPS/PS/VARIO KL 4 · klasse 4 | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxSWB T4B / M17 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 154 | decimaal | New Holland | T7030 | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L5 | 1343 | decimaalteken ontbrak (1343 gelezen als 1,3430) | 1,3430 |
| 155 | decimaal | New Holland | T7030 | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M5 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 156 | decimaal | New Holland | T7040 | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L6 | 1343 | decimaalteken ontbrak (1343 gelezen als 1,3430) | 1,3430 |
| 157 | decimaal | New Holland | T7040 | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M6 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 158 | decimaal | New Holland | T7050 | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L7 | 1343 | decimaalteken ontbrak (1343 gelezen als 1,3430) | 1,3430 |
| 159 | decimaal | New Holland | T7050 | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M7 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 160 | decimaal | New Holland | T7060 | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L8 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 161 | decimaal | New Holland | T7060 | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M8 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 162 | decimaal | New Holland | T7030 SS | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L11 | 1343 | decimaalteken ontbrak (1343 gelezen als 1,3430) | 1,3430 |
| 163 | decimaal | New Holland | T7030 SS | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M11 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 164 | decimaal | New Holland | T7040 SS | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L12 | 1343 | decimaalteken ontbrak (1343 gelezen als 1,3430) | 1,3430 |
| 165 | decimaal | New Holland | T7040 SS | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M12 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 166 | decimaal | New Holland | T7050 SS | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L13 | 1343 | decimaalteken ontbrak (1343 gelezen als 1,3430) | 1,3430 |
| 167 | decimaal | New Holland | T7050 SS | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M13 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 168 | decimaal | New Holland | T7060 SS | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L14 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 169 | decimaal | New Holland | T7060 SS | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M14 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 170 | decimaal | New Holland | T7030 SUS | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L17 | 1343 | decimaalteken ontbrak (1343 gelezen als 1,3430) | 1,3430 |
| 171 | decimaal | New Holland | T7030 SUS | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M17 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 172 | decimaal | New Holland | T7040 SUS | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L18 | 1343 | decimaalteken ontbrak (1343 gelezen als 1,3430) | 1,3430 |
| 173 | decimaal | New Holland | T7040 SUS | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M18 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 174 | decimaal | New Holland | T7050 SUS | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L19 | 1343 | decimaalteken ontbrak (1343 gelezen als 1,3430) | 1,3430 |
| 175 | decimaal | New Holland | T7050 SUS | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M19 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 176 | decimaal | New Holland | T7060 SUS | PS/VARIO TOT 008072001 (47/57) · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / L20 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 177 | decimaal | New Holland | T7060 SUS | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M20 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 178 | decimaal | New Holland | T7070 SUS | PS/VARIO 008072001 (45/60) ONW · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7000 / M21 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 179 | decimaal | New Holland | T7.220 | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M5 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 180 | decimaal | New Holland | T7.235 | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M6 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 181 | decimaal | New Holland | T7.250 | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M7 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 182 | decimaal | New Holland | T7.260 | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M8 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 183 | decimaal | New Holland | T7.270 | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M9 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 184 | decimaal | New Holland | T7.220 SS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M11 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 185 | decimaal | New Holland | T7.235 SS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M12 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 186 | decimaal | New Holland | T7.250 SS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M13 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 187 | decimaal | New Holland | T7.260 SS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M14 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 188 | decimaal | New Holland | T7.270.SS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M15 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 189 | decimaal | New Holland | T7.220 SUS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M17 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 190 | decimaal | New Holland | T7.235 SUS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M18 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 191 | decimaal | New Holland | T7.250 SUS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M19 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 192 | decimaal | New Holland | T7.260 SUS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M20 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 193 | decimaal | New Holland | T7.270.SUS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB / M21 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 194 | decimaal | New Holland | T7.230 | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M5 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 195 | decimaal | New Holland | T7.245 | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M6 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 196 | decimaal | New Holland | T7.260 | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M7 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 197 | decimaal | New Holland | T7.270 | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M8 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 198 | decimaal | New Holland | T7.230 SS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M10 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 199 | decimaal | New Holland | T7.245 SS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M11 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 200 | decimaal | New Holland | T7.260 SS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M12 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 201 | decimaal | New Holland | T7.270.SS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M13 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 202 | decimaal | New Holland | T7.230 SUS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M15 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 203 | decimaal | New Holland | T7.245 SUS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M16 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 204 | decimaal | New Holland | T7.260 SUS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M17 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 205 | decimaal | New Holland | T7.270.SUS | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.xxxLWB T4B / M18 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 206 | decimaal | New Holland | T7.290 | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.XXXHD / M5 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 207 | decimaal | New Holland | T7.315 | PS/VARIO · klasse 4HD | Overbrengverhouding NewHolland_2020.xlsx / T7.XXXHD / M6 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 208 | meerdere | New Holland | G190/8770 | PS/VARIO · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / 70_70A / O6 | 1,309/1,378 | meerdere waarden in één cel: "1,309/1,378" | 1,3090 |
| 209 | meerdere | New Holland | G210/8870 | PS/VARIO · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / 70_70A / O7 | 1,309/1,378 | meerdere waarden in één cel: "1,309/1,378" | 1,3090 |
| 210 | meerdere | New Holland | G240/8970 | PS/VARIO · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / 70_70A / O8 | 1,309/1,378 | meerdere waarden in één cel: "1,309/1,378" | 1,3090 |
| 211 | meerdere | New Holland | T8.320 | PS/VARIO · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T8 / O6 | 1.32204/1.32454 | meerdere waarden in één cel: "1.32204/1.32454" | 1,3220 |
| 212 | meerdere | New Holland | T8.350 | PS/VARIO · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T8 / O7 | 1.32204/1.32454 | meerdere waarden in één cel: "1.32204/1.32454" | 1,3220 |
| 213 | meerdere | New Holland | T8.380 | PS/VARIO · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T8 / O8 | 1.32204/1.32454 | meerdere waarden in één cel: "1.32204/1.32454" | 1,3220 |
| 214 | meerdere | New Holland | T8.410 | PS/VARIO · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T8 / O9 | 1.32204/1.32454 | meerdere waarden in één cel: "1.32204/1.32454" | 1,3220 |
| 215 | meerdere | New Holland | T8.435 | PS/VARIO · waarde 1 van 2 | Overbrengverhouding NewHolland_2020.xlsx / T8 / O10 | 1.32204/1.32454 | meerdere waarden in één cel: "1.32204/1.32454" | 1,3220 |
| 216 | decimaal | Case IH / Steyr | TNN 65/75 | HI/LO-SL | Aslengtes Case Steyr + overbreng.xls / Quantum / L18 | 1506 | decimaalteken ontbrak (1506 gelezen als 1,5060) | 1,5060 |
| 217 | decimaal | Case IH / Steyr | Maxxum 110 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L6 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 218 | decimaal | Case IH / Steyr | Maxxum 110 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M6 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 219 | decimaal | Case IH / Steyr | Maxxum 120 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L7 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 220 | decimaal | Case IH / Steyr | Maxxum 120 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M7 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 221 | decimaal | Case IH / Steyr | Maxxum 130 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L8 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 222 | decimaal | Case IH / Steyr | Maxxum 130 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M8 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 223 | decimaal | Case IH / Steyr | Maxxum 115 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L10 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 224 | decimaal | Case IH / Steyr | Maxxum 115 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M10 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 225 | decimaal | Case IH / Steyr | Maxxum 125 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L11 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 226 | decimaal | Case IH / Steyr | Maxxum 125 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M11 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 227 | decimaal | Case IH / Steyr | Maxxum 140 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L12 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 228 | decimaal | Case IH / Steyr | Maxxum 140 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M12 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 229 | decimaal | Case IH / Steyr | Maxxum MC 110 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L15 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 230 | decimaal | Case IH / Steyr | Maxxum MC 110 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M15 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 231 | decimaal | Case IH / Steyr | Maxxum MC 120 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L16 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 232 | decimaal | Case IH / Steyr | Maxxum MC 120 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M16 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 233 | decimaal | Case IH / Steyr | Maxxum MC 130 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L17 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 234 | decimaal | Case IH / Steyr | Maxxum MC 130 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M17 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 235 | decimaal | Case IH / Steyr | Maxxum MC 115 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L19 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 236 | decimaal | Case IH / Steyr | Maxxum MC 115 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M19 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 237 | decimaal | Case IH / Steyr | Maxxum MC 125 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L20 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 238 | decimaal | Case IH / Steyr | Maxxum MC 125 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M20 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 239 | decimaal | Case IH / Steyr | Maxxum MC 140 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L21 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 240 | decimaal | Case IH / Steyr | Maxxum MC 140 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M21 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 241 | decimaal | Case IH / Steyr | Maxxum CVX 110 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L24 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 242 | decimaal | Case IH / Steyr | Maxxum CVX 110 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M24 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 243 | decimaal | Case IH / Steyr | Maxxum CVX 120 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L25 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 244 | decimaal | Case IH / Steyr | Maxxum CVX 120 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M25 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 245 | decimaal | Case IH / Steyr | Maxxum CVX 130 | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L26 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 246 | decimaal | Case IH / Steyr | Maxxum CVX 130 | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M26 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 247 | decimaal | Case IH / Steyr | 4110 Profi ET | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L30 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 248 | decimaal | Case IH / Steyr | 4110 Profi ET | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M30 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 249 | decimaal | Case IH / Steyr | 6125 Profi ET | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L31 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 250 | decimaal | Case IH / Steyr | 6125 Profi ET | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M31 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 251 | decimaal | Case IH / Steyr | 6140 Profi ET | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L32 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 252 | decimaal | Case IH / Steyr | 6140 Profi ET | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M32 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 253 | decimaal | Case IH / Steyr | 4110 Profi ET | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L34 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 254 | decimaal | Case IH / Steyr | 4110 Profi ET | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M34 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 255 | decimaal | Case IH / Steyr | 4120 Profi ET | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L35 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 256 | decimaal | Case IH / Steyr | 4120 Profi ET | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M35 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 257 | decimaal | Case IH / Steyr | 4130 Profi ET | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L36 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 258 | decimaal | Case IH / Steyr | 4130 Profi ET | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M36 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 259 | decimaal | Case IH / Steyr | 6115 Profi ET | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L38 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 260 | decimaal | Case IH / Steyr | 6115 Profi ET | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M38 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 261 | decimaal | Case IH / Steyr | 6125 Profi ET | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L39 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 262 | decimaal | Case IH / Steyr | 6125 Profi ET | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M39 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 263 | decimaal | Case IH / Steyr | 6140 Profi ET | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L40 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 264 | decimaal | Case IH / Steyr | 6140 Profi ET | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M40 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 265 | decimaal | Case IH / Steyr | 4110 Profi CVT | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L43 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 266 | decimaal | Case IH / Steyr | 4110 Profi CVT | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M43 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 267 | decimaal | Case IH / Steyr | 4120 Profi CVT | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L44 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 268 | decimaal | Case IH / Steyr | 4120 Profi CVT | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M44 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 269 | decimaal | Case IH / Steyr | 4130 Profi CVT | KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / L45 | 1353 | decimaalteken ontbrak (1353 gelezen als 1,3530) | 1,3530 |
| 270 | decimaal | Case IH / Steyr | 4130 Profi CVT | KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Maxxum / M45 | 1356 | decimaalteken ontbrak (1356 gelezen als 1,3560) | 1,3560 |
| 271 | decimaal | Case IH / Steyr | Puma 130 | SPS/PS/VARIO KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M5 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 272 | decimaal | Case IH / Steyr | Puma 130 | SPS/PS/VARIO KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N5 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 273 | decimaal | Case IH / Steyr | Puma 145 | SPS/PS/VARIO KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M6 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 274 | decimaal | Case IH / Steyr | Puma 145 | SPS/PS/VARIO KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N6 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 275 | decimaal | Case IH / Steyr | Puma 160 | SPS/PS/VARIO KL 3 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M7 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 276 | meerdere | Case IH / Steyr | Puma 160 | SPS/PS/VARIO KL 4 · klasse 4 · waarde 1 van 2 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N7 | 1.323 Or 1.322 if CVT | meerdere waarden in één cel: "1.323 Or 1.322 if CVT" | 1,3230 |
| 277 | decimaal | Case IH / Steyr | 6130 CVT | SPS/PS/VARIO KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M12 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 278 | decimaal | Case IH / Steyr | 6130 CVT | SPS/PS/VARIO KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N12 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 279 | decimaal | Case IH / Steyr | 6145 CVT | SPS/PS/VARIO KL 3 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M13 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 280 | decimaal | Case IH / Steyr | 6145 CVT | SPS/PS/VARIO KL 4 · klasse 3/4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N13 | 1323 | decimaalteken ontbrak (1323 gelezen als 1,3230) | 1,3230 |
| 281 | decimaal | Case IH / Steyr | 6160 CVT | SPS/PS/VARIO KL 3 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M14 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 282 | decimaal | Case IH / Steyr | 6160 CVT | SPS/PS/VARIO KL 4 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N14 | 1322 | decimaalteken ontbrak (1322 gelezen als 1,3220) | 1,3220 |
| 283 | decimaal | Case IH / Steyr | Puma 150 | SPS/PS/VARIO KL 3 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M18 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 284 | meerdere | Case IH / Steyr | Puma 150 | SPS/PS/VARIO KL 4 · klasse 4 · waarde 1 van 2 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N18 | 1.323 Or 1.322 if CVT | meerdere waarden in één cel: "1.323 Or 1.322 if CVT" | 1,3230 |
| 285 | decimaal | Case IH / Steyr | Puma 165 | SPS/PS/VARIO KL 3 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M19 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 286 | meerdere | Case IH / Steyr | Puma 165 | SPS/PS/VARIO KL 4 · klasse 4 · waarde 1 van 2 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N19 | 1.323 Or 1.322 if CVT | meerdere waarden in één cel: "1.323 Or 1.322 if CVT" | 1,3230 |
| 287 | decimaal | Case IH / Steyr | Puma 175 | SPS/PS/VARIO KL 3 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M20 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 288 | meerdere | Case IH / Steyr | Puma 175 | SPS/PS/VARIO KL 4 · klasse 4 · waarde 1 van 2 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N20 | 1.323 Or 1.322 if CVT | meerdere waarden in één cel: "1.323 Or 1.322 if CVT" | 1,3230 |
| 289 | decimaal | Case IH / Steyr | 6150 CVT | SPS/PS/VARIO KL 3 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M22 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 290 | decimaal | Case IH / Steyr | 6150 CVT | SPS/PS/VARIO KL 4 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N22 | 1322 | decimaalteken ontbrak (1322 gelezen als 1,3220) | 1,3220 |
| 291 | decimaal | Case IH / Steyr | 6165 CVT | SPS/PS/VARIO KL 3 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M23 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 292 | decimaal | Case IH / Steyr | 6165 CVT | SPS/PS/VARIO KL 4 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N23 | 1322 | decimaalteken ontbrak (1322 gelezen als 1,3220) | 1,3220 |
| 293 | decimaal | Case IH / Steyr | 6175 CVT | SPS/PS/VARIO KL 3 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / M24 | 1321 | decimaalteken ontbrak (1321 gelezen als 1,3210) | 1,3210 |
| 294 | decimaal | Case IH / Steyr | 6175 CVT | SPS/PS/VARIO KL 4 · klasse 4 | Aslengtes Case Steyr + overbreng.xls / Puma SWB / N24 | 1322 | decimaalteken ontbrak (1322 gelezen als 1,3220) | 1,3220 |
| 295 | decimaal | Case IH / Steyr | Puma 170 | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M5 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 296 | decimaal | Case IH / Steyr | Puma 185 | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M6 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 297 | decimaal | Case IH / Steyr | Puma 200 | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M7 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 298 | decimaal | Case IH / Steyr | Puma 215 | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M8 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 299 | decimaal | Case IH / Steyr | Puma 230 | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M9 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 300 | decimaal | Case IH / Steyr | 6170 CVT | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M14 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 301 | decimaal | Case IH / Steyr | 6185 CVT | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M15 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 302 | decimaal | Case IH / Steyr | 6205 CVT | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M16 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 303 | decimaal | Case IH / Steyr | 6215 CVT | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M17 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 304 | decimaal | Case IH / Steyr | 6230 CVT | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M18 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 305 | decimaal | Case IH / Steyr | Puma 185 | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M22 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 306 | decimaal | Case IH / Steyr | Puma 200 | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M23 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 307 | decimaal | Case IH / Steyr | Puma 220 | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M24 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 308 | decimaal | Case IH / Steyr | Puma 240 | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M25 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 309 | decimaal | Case IH / Steyr | 6185 CVT | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M28 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 310 | decimaal | Case IH / Steyr | 6200 CVT | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M29 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 311 | decimaal | Case IH / Steyr | 6220 CVT | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M30 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 312 | decimaal | Case IH / Steyr | 6240 CVT | PS/VARIO · klasse 4HD | Aslengtes Case Steyr + overbreng.xls / Puma LWB / M31 | 1324 | decimaalteken ontbrak (1324 gelezen als 1,3240) | 1,3240 |
| 313 | overig | Case IH / Steyr |  |  | Aslengtes Case Steyr + overbreng.xls / Quantum /  |  | Tabblad "Quantum" bevat New Holland-typenamen (TNF, TND, TNV …). Controleren of dit de Case IH Quantum-gegevens zijn of een kopie van New Holland. |  |
