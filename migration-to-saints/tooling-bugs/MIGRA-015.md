# MIGRA-015 — La taula de llibres bíblics no coneixia mig Antic Testament, i el join de la missa se n'anava en blanc

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | Eines de migració · `migration-to-saints/lib/citation-key.js` |
| **Gravetat** | **Alta**: no és només soroll a la revisió, és **contingut que no es migra**. 87 cites i els seus textos |
| **Trobat** | 25 de setembre de 2026, revisant el dia (divendres de la setmana 25) amb `make review` |
| **Correcció** | `BOOK_ALIASES` completa: 22 llibres nous o amb formes noves |
| **Regressió** | `citation-key.test.js` → «knows every book the two editions name (MIGRA-015)». Sense el pedaç, **22 dels 31 tests cauen** |

## El fet

La primera lectura de la missa del 25 de setembre de 2026 és l'Eclesiastès 3,1-11. Les dues
bandes l'escriuen així:

| | |
|---|---|
| cpl-app | `Ecle 3,1-11: Tot el que desitgem sota el cel té el seu moment` |
| eprex (es) | `Ecles 3, 1-11: Cada cosa tiene su momento bajo el cielo.` |

Mateix llibre, mateix capítol, mateixos versets. `BOOK_ALIASES.ECCL` tenia `ecle` però **no
`ecles`**, i la taula de prefixos de reserva no cobreix l'Eclesiastès, o sigui que el castellà
queia a `ANON`:

```js
fingerprint('Ecle 3,1-11').token   // 'ECCL|3'
fingerprint('Ecles 3, 1-11').token // 'ANON|3'
```

## Per què costa caselles, i no només soroll

El join de la missa **empelta per la cita** — està escrit a `join-content.test.js`: «a cell
whose citation matches none of them is left alone». Si el llibre no es reconeix, cpl-app i la
casella no s'aparellen mai i la casella **no es migra**. `lecturas_referencia/486` i
`lecturas_texto/607` no són ni al `join-pending-review.json`: no és que es rebutgessin, és que
ningú no les va saber col·locar.

A tot el corpus, **87 cites d'Escriptura** amb el llibre no reconegut i encara sense català,
cadascuna amb el seu text al costat:

| forma | llibre | cites |
|---|---|---|
| `Eclo` | Eclesiàstic (Sirácida) | 29 |
| `1 Sam` | 1r de Samuel | 20 |
| `2 Sam` | 2n de Samuel | 15 |
| `Jon` · `Jc` · `Jos` | Jonàs · Jutges · Josuè | 16 |
| `Ecles` · `1/2 Cro` · `1/2 Mac` | Eclesiastès · Cròniques · Macabeus | 16 |
| `Ne` · `Esd` · `Rt` · `Ct` · `Lev` · `Dan` · `Nah` · `Sab` · `Jds` · `Heb` | la resta | la resta |

## I la cara lletja: comparacions cegues

Quan **totes dues** bandes cauen a `ANON`, el token es redueix al capítol i dues lectures
diferents comparen **iguals**. N'hi havia 21, i la pitjor és aquesta:

| | |
|---|---|
| català | `Jt 2,11-19` — Jutges (en català, «Jt» és **Jutges**, no Judit) |
| castellà | `Jc 2, 11-19` — Jueces |

Aquestes dues **sí que són el mateix** i sortien iguals per sort. Però amb el mateix mecanisme
`Jt 2` (Jutges) i `Jdt 2` (Judit) també sortien iguals, i això és una divergència real que la
revisió hauria dit «cap problema».

## La correcció

`BOOK_ALIASES` completa amb els llibres que hi faltaven —Jutges, Rut, Esdres, Nehemies,
Macabeus, Càntic dels Càntics, Jonàs, Abdies, Nahum— i amb les formes que faltaven dels que ja
hi eren (`ecles`, `eclo`, `1sam`, `2sam`, `1cro`, `2cro`, `jos`, `lev`, `dan`, `sab`, `heb`,
`jds`, `habacuc`…).

**Una forma que expressament NO s'hi ha posat: `si`.** El castellà escriu el Siràcida `Eclo`, i
els set `Si …` del corpus són el començament d'una **rúbrica** («Si la fiesta cae en domingo, la
Opción 2 se toma como segunda lectura»). Posar-hi `si` convertiria rúbriques en cites. Hi ha un
test que ho guarda.

## Com es verifica

Que no ha canviat res del que ja anava bé, contra les 4 taules de cites de les dues llengües:

```
sense canvi 9.836 · llibre nou reconegut 160 · llibre CANVIAT 0
```

I que el test és un detector de debò:

```sh
git stash -- migration-to-saints/lib/citation-key.js
npx jest migration-to-saints/citation-key.test.js   # 22 de 31 cauen
git stash pop
```

## Queda obert

- `1 Tt 1, 1-9` (`lecturas_referencia/526`, es) és **Titus 1,1-9** amb un «1» de més al davant:
  Titus només té una carta. No s'ha mapat a posta — és un error d'eprex, no una abreviatura.
- Les caselles que són **rúbriques amb una cita a la segona línia** («O bien, más breve: \n Gn
  1, 1.26-31») segueixen sense empeltar-se: `bareReference()` només mira la primera línia. És
  una altra feina, i no és aquesta.
