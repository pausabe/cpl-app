# MIGRA-024 — `make tests` escrivia la sortida de la migració amb la base de dades sense fixos

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | Eines de migració · `Makefile` (`tests`, `tests-fast`, `checks`) · `celebration-probe.test.js` · `laudes.extract.test.js` |
| **Gravetat** | Mitjana: no es veu enlloc fins que algú fa commit de `output/` després d'un `make tests` |
| **Trobat** | 2 d'octubre de 2026, tancant l'EPREX-007 (la sortida del join havia canviat després de `make tests`) |
| **Correcció** | Les execucions de Jest del `Makefile` donen als tests un `OUT_DIR` temporal, i tots els tests que escriuen a `output/` el respecten |
| **Regressió** | `out-dir.test.js`: les tres receptes passen `OUT_DIR=`, i cap test que escrigui a `output/` per defecte deixa de mirar-lo. Falla sense el fix (4 de 4) |

## El fet

La sortida de la migració (`migration-to-saints/output/`: el join, les celebracions de cpl-app, les
Completes, la mostra de Laudes) és al git i es fa amb la còpia de la base de dades que porta els dos fixos
(`make db-fixed`, `CPL_DB=…`). `make tests` executa tots els `*.test.js`, i quatre d'ells són passos del
pipeline que escriuen aquesta sortida. Els executava sobre la base de dades **in situ**, sense fixos, i
escrivia damunt de la bona.

El 2-10, després d'un `make tests`, el join tenia 133 claus menys i 1.146 pendents en lloc de 1.023, i
`cpl-celebrations.json` tornava a posar la Immaculada el diumenge 8-12-2019, que el fix CPL-LIT-003 passa
al dilluns. Es va refer amb la còpia abans del commit.

## La correcció

- `Makefile`: `JEST_OUT` (a `$TMPDIR/cpl-jest-out`), i `OUT_DIR=$(JEST_OUT)` davant de `npx jest` a
  `tests`, `tests-fast` i `checks` (`checks-ci` passa per `tests-fast`).
- `celebration-probe.test.js` i `laudes.extract.test.js` respecten `OUT_DIR`, com ja feien el join i les
  Completes.
- `first-vespers.test.js` ja llançava el join amb el seu propi `OUT_DIR`; no canvia.

El pipeline de debò (el panell, o el join a mà amb `CPL_DB`) no posa `OUT_DIR` i continua escrivint a
`output/`.

## Comprovat

`make tests`: 977 tests i els dos detectors de dades passen; `git status migration-to-saints/output` net, i
els fitxers dels tests són a `$TMPDIR/cpl-jest-out`.
