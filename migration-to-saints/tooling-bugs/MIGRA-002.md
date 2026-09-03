# MIGRA-002 — La empremta de cites llegia l'ordinal del llibre com si fos el capítol

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | Eines de migració · `migration-to-saints/lib/citation-key.js` (abans dins de `review/build-rows.js`) |
| **Gravetat** | **Alta.** És un detector que **no detectava**: feia passar per «mateixa lectura» dues lectures diferents, i la revisió n'informava com a dia net |
| **Trobat** | 3 de setembre de 2026, extraient el codi de cites a una llibreria compartida per a la proposta del Comú |
| **Correcció** | `lib/citation-key.js`, funció `fingerprint()` |
| **Regressió** | `migration-to-saints/citation-key.test.js` — sense el pedaç, 3 dels 7 tests cauen |

## Símptoma

`fingerprint()` és qui contesta «les dues apps citen la mateixa lectura?». Treia el capítol
així:

```js
const afterBook = stem.replace(/^[^\d]*/, '');      // fora tot el que no sigui xifra
const chapter = (afterBook.match(/^\d+/) || [null])[0];
```

Amb `Rm 14, 17-19` va bé. Amb qualsevol llibre que **comenci per un ordinal** no: el primer
caràcter ja és una xifra, no s'esborra res, i el «capítol» que en surt és l'ordinal del llibre.

| cita | empremta d'abans | empremta bona |
|---|---|---|
| `1Pe 5, 1-4` | `1PET\|1` | `1PET\|5` |
| `1Pe 1, 22-23` | `1PET\|1` | `1PET\|1` |
| `2 Co 12, 9b-10` | `2COR\|2` | `2COR\|12` |
| `1C 7, 32.34` | `1COR\|1` | `1COR\|7` |

Les dues primeres files són el cas que fa mal: **dues lectures diferents amb la mateixa
empremta**. La comparació les donava per iguals.

## Per què importa, amb el dia que ho va destapar

El 3 de setembre de 2026, memòria de sant Gregori el Gran, les dues lectures que es disputen
la casella de Vespres són:

- `1Pe 5, 1-4` — la del Comú de pastors, que és la que resa la pestanya del sant en castellà.
- `1Pe 1, 22-23` — la de la fèria del dijous, que és la que resa cpl-app.

Amb l'empremta trencada, **totes dues eren `1PET|1`**: si una casella hagués tingut l'una i
l'altra, la revisió hauria dit «mateixa cita» i el dia hauria sortit net.

## L'abast

Sobre l'índex castellà de saints-app (`lectura_breve_citas` + `salmos_citas`, 1.179 cites),
**225 comencen per un ordinal**. Repartides en 11 llibres, i el codi vell ajuntava tots els
capítols de cadascun en una sola empremta:

| llibre | capítols que confonia |
|---|---|
| 1 Corintis | 13 — 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 15 |
| 2 Corintis | 9 · 1 Pere 5 · 1 Joan 5 · 1 Tessalonicencs 4 · 1 Timoteu 4 |
| i 2Te, 1S, 1R, 2Pe, 2Tm | 2 o 3 cadascun |

**52 capítols** quedaven reduïts a 11 empremtes.

## La correcció

Es talla el nom del llibre amb **el mateix patró amb què `bookKey()` el reconeix** —un dígit
opcional més la paraula que el segueix— i el capítol es llegeix del que queda:

```js
const book = stem.match(/^(\d?\s*[^\d\s,]+)/);
const afterBook = (book ? stem.slice(book[0].length) : stem.replace(/^[^\d]*/, ''))
  .replace(/^[\s,.:;]+/, '');
const chapter = (afterBook.match(/^\d+/) || [null])[0];
```

De passada, els versets deixen de dur el nom del llibre enganxat: `1Pe 5, 1-4` donava
`verses: "Pe 5, 1-4"` i ara dona `"1-4"`.

## El que hi havia al costat, i que també s'ha mogut

`stripMarkup`, `bareReference`, `bookKey` i `fingerprint` vivien dins de `review/build-rows.js`,
que és un script que s'autoexecuta i no exporta res. La proposta del Comú necessitava les
mateixes respostes i s'havia fet la seva pròpia versió de joguina, que no sabia que `He` i `Hb`
són el mateix llibre —i per això la prova de la cita no li disparava mai (vegeu
[MIGRA-003](MIGRA-003.md)). Ara les quatre funcions són a `lib/citation-key.js` i les fan
servir totes dues.

## Efecte sobre el que ja estava revisat

El 3 de setembre de 2026 **no canvia**: segueix sent 51 camps i 0 divergències, perquè la
casella que es comparava per cita aquell dia era `Ap 11, 17-18` i l'Apocalipsi no du ordinal.
Les revisions anteriors no s'han tornat a passar; si alguna cobria un dia amb una lectura de
llibre numerat, el seu «cap divergència» d'aquella casella no està garantit.
