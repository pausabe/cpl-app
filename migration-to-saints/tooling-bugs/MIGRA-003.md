# MIGRA-003 — La proposta del Comú triava el Comú pel títol i desquadrava les llistes

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | Eines de migració · `migration-to-saints/review/commons-proposal.js` |
| **Gravetat** | Mitjana mentre la proposta només s'informa; **alta** si s'aplica, perquè escriuria text del Comú equivocat a la pestanya del sant |
| **Trobat** | 3 de setembre de 2026, comparant les 19 propostes del dia amb la casella castellana germana |
| **Correcció** | `review/commons-proposal.js` — `pickCommonRow()` nova, i la posició de cada casella surt del camp `index` |
| **Regressió** | Cap test propi: es comprova contra la casella castellana, que és una font independent. Vegeu «Com es verifica» |

## Dos errors, i tots dos es veien el mateix dia

### 1 · El Comú es deduïa del títol de la memòria

`COMMON_BY_TITLE` recorre una llista de patrons i es queda amb el primer que encaixa, amb els
doctors abans que el papa. Sant Gregori el Gran és «papa **i doctor de l'Església**», i per
això la proposta agafava el `07aO — COMÚ DE DOCTORS`.

No és el que fa l'app. La casella germana castellana, que és la mateixa ranura de l'índex
compartit i està plena, du la lectura breu **`Hb 13, 7-9a`** a Laudes i **`1 P 5, 1-4`** a
Vespres: les del Comú de pastors. Les dels doctors són `Sa 7, 13-14` i `Jm 3, 17-18`.

Amb el Comú equivocat, els **10 responsoris** del dia sortien mal proposats:

| | responsori de Laudes |
|---|---|
| proposava (`07aO`) | «℣. L'Església proclama * La saviesa dels sants» |
| l'app en castellà | «℣. Sobre tus murallas, Jerusalén, * he colocado centinelas» |
| hauria de proposar (`06cO`) | «℣. Sobre teu, Jerusalem, * He apostat sentinelles» |

Els **9 precs** sortien bé per casualitat: al llibre català, el Comú de doctors remet als
precs del de pastors, i `pregariesLaudes` i `pregariesVespres` són idèntiques a `06aO`, `06bO`,
`06cO`, `06dO` i `07aO`.

**Correcció.** La cita mana i el títol desempata. La cita de la casella castellana identifica
la **família** —`06aO`, `06bO`, `06cO` i `06dO` comparteixen `He 13, 7-9a`, que és el que la
distingeix del `07aO`— i després es torna a recórrer `COMMON_BY_TITLE` **limitada als codis de
la família**: «doctor» ja no hi és, li toca a «papa», i en surt `06cO`. Si cap de les dues
Hores no dona cita, decideix el títol tot sol, com abans. La sortida diu amb què s'ha triat:

```
2026-09-03  19/20 cobertes  06cO COMÚ DE PASTORS: PER UN PAPA
            · pel Comú de la cita, no pel títol (el títol deia «Comú de doctors de l'Església»)
```

Perquè això funcionés calia primer [MIGRA-002](MIGRA-002.md): la comparació de cites d'aquest
fitxer era una versió pròpia que no sabia que `He` (català) i `Hb` (castellà) són Hebreus, i la
prova no disparava mai. Ara fa servir `lib/citation-key.js`, la mateixa que la revisió.

### 2 · La posició dins d'una llista es comptava, no es llegia

Les llistes —6 caselles de responsori, 4 o 5 de precs— s'omplien amb un comptador que avançava
una posició per cada casella **que faltava**. Quan una casella del mig ja està plena, no és a
la llista de les que falten, i tot el que ve després llisca un lloc.

El responsori de Laudes del dia n'és el cas exacte: la 5/6 (`responsorios/1464`, el «Glòria al
Pare») ja hi era. Les que faltaven eren 1, 2, 3, 4 i **6**, i el comptador donava a la 6/6 el
contingut de la 5a posició:

| casella | proposava | l'app en castellà hi té |
|---|---|---|
| `responsorios/1465` (6/6) | «℣. Glòria al Pare, i al Fill…» | «℟. Sobre tus murallas, Jerusalén, he colocado centinelas» |

**Correcció.** Cada casella agafa la posició que ocupa de veritat, que `day-check` ja dona al
camp `index`. El comptador desapareix.

## Com es verifica

No cal creure's res: es compara la proposta catalana amb la casella castellana del mateix id,
que ve d'una altra banda.

```sh
DATES=2026-09-03 node migration-to-saints/review/build-rows.js
node migration-to-saints/review/commons-proposal.js
```

Amb el pedaç, les 10 caselles de responsori del 3 de setembre encaixen una a una amb el
castellà —inclosa la 6/6, que ara du la repetició del respons i no el «Glòria al Pare»— i el
Comú triat és `06cO` i no `07aO`.
