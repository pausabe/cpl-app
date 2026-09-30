# MIGRA-018 — El join triava les lectures de la missa pel capítol, i en va exportar nou amb el text d'una altra missa

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | Eines de migració · `migration-to-saints/join-content.test.js` (`observeMass`) · `lib/citation-key.js` |
| **Gravetat** | **Alta**: saints-app en català llegia, cada any, una lectura que no toca en nou dies de l'any |
| **Trobat** | 30 de setembre de 2026, revisant sant Jeroni: la casella del salm del sant (`lecturas_texto/368`) quedava retinguda per un salm de la fèria de sant Alfons del 2022 |
| **Correcció** | Triar pels versets (`readingMatch`), donar cada lectura de cpl-app només a la casella del dia on encaixa millor, i acceptar la missa d'ahir només quan hi encaixa sencera |
| **Regressió** | `citation-key.test.js`, «readingMatch»: les vuit parelles que es van exportar; sense la correcció en fallen 12 dels 43 tests |

## El fet

La missa és l'única part del dia on el join no pot saber per l'índex quina lectura va a cada casella:
cpl-app en té fins a tres (la del dia, la de la fèria i la d'ahir) i saints-app fins a dues columnes.
Ho decideix la cita que el castellà ja té a la casella (PLAN §18.7). Però es comparava amb el
`token` de `fingerprint()`, que és **llibre i capítol**, i guanyava la primera candidata que hi
encaixava.

Llibre i capítol diuen que dues cites són la mateixa lectura escrita de dues maneres («Salm 109» i
«Salmo 109, 1-5. 7»), que és el que necessita la revisió. No serveixen per triar entre dues lectures
del mateix capítol:

| dia | casella | el castellà hi diu | el català exportat hi deia | d'on sortia |
|---|---|---|---|---|
| 24-VI, vigília de sant Joan Baptista | evangeli (`703` · `883`) i aclamació (`6058`) | Lc 1, 5-17 | Lc 1,57-66.80 | la missa del dia |
| 24-XII, vigília de Nadal | salm (`927` · `1163`) | Sal 88, 4-5.16-17.27.29 | Sl 88,2-3.4-5.27 i 29 | la missa del matí |
| 7-X, la Mare de Déu del Roser | salm (`328` · `408`) | Lc 1, 46-55 (el Magníficat) | Lc 1,69-75 (el Benedictus) | la fèria d'un any |
| 5-II i 14-VIII, Comú de màrtirs | salm (`444` · `553`) | Sal 30, 3cd-4.6.8ab.16bc-17 | Sl 30,20-24 | la fèria d'un any |
| 10-XI, sant Lleó el Gran | salm (`1619` · `998`) | Sal 36, 3-6.30-31 | Sl 36,3-4.18.23.27.29 | la fèria del 2020 |
| 26-V, sant Felip Neri | evangeli (`1790`) | Jn 17, 20-26 | Jo 17,1-11a | la fèria del 2020 |
| 26-VIII, santa Teresa Jornet | evangeli (`283` · `350`) | Mt 25, 31-40 | Mt 25,1-13 | la fèria del 2022 |
| 4-XI, sant Carles Borromeu | 1a lectura (`1946` · `2426`) | Rm 12, 3-13 | Rm 12,5-16a | la fèria del 2025 |
| 3-IX, sant Gregori el Gran | salm (`964`) | Sal 95, 1-3.7-8a.10 | Sl 95,1 i 3.4-5.11-13 | la missa d'ahir, el 2-IX-2019 |

La casella és de la celebració i es llegeix cada any, o sigui que un sol any dolent n'hi havia prou.

## La correcció

1. **`readingMatch()`** a `lib/citation-key.js` gradua la coincidència pels versets: 2 si són els
   mateixos (sense les lletres de mig verset, i tolerant la numeració desplaçada d'Osees 2, Tobit i
   Daniel 3), 1 si es toquen o si una banda no els escriu, i 0 si no es toquen gens.
2. **Cada lectura de cpl-app va a la casella del dia on encaixa millor.** El Rm 12,5-16a de la fèria
   encaixa del tot a la casella de la fèria (Rm 12, 5-16) i ja no s'ofereix a la del sant (Rm 12, 3-13),
   amb la qual només es toca.
3. **La missa d'ahir només compta si hi encaixa sencera**: dues lectures o més de la mateixa columna.
   Hi és per a la Vigília Pasqual i, de fet, també fa els dies de després de l'Epifania (cpl-app hi
   va per data i saints-app per dia de la setmana); un salm sol que comparteix capítol, no.

La igualtat estricta de versets no servia: les dues edicions agafen trossos diferents del mateix
salm tot sovint, i rebutjava 122 de les 2.010 cites ja exportades, gairebé totes bones.

## Què canvia

Contra el join d'abans, amb la mateixa base (`db-fixed`) i la mateixa sonda:

- **Deixen de sortir** les cites i els textos de la taula: 9 cites i 8 textos. La cita de sant Felip
  Neri ja no sortia del join (quedava retinguda), però era a saints-app d'una exportació anterior.
- **Surten 7 cites i 8 textos nous**, que abans quedaven retinguts per culpa d'aquestes observacions
  dolentes: entre d'altres el salm de sant Jeroni (`368`) i el de sant Alfons (`297`), l'evangeli de
  sant Felip Neri (`1225`) i el salm de sant Gregori (`88`). Tots iguals al castellà de la casella.
- **Cap lectura bona perduda**: la Vigília Pasqual (`1110`, Gn 22 en la forma breu) i els dies de
  després de l'Epifania (`1517`) es mantenen.

L'exportació només afegeix o canvia claus, no n'esborra cap. Les 17 dolentes (9 cites i 8 textos) s'han tret a mà de
`commons/ca` de saints-app: vegeu la SA-18 al registre.
