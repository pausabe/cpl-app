# MIGRA-023 — El primer dia de cada passada de la sonda sortia amb la celebració del dia que corria

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | Eines de migració · `app-id-probe.js` (`PROBE`) |
| **Gravetat** | Baixa: només l'etiqueta (`litcalId`) del primer dia de cada passada, no les caselles |
| **Trobat** | 2 d'octubre de 2026, tornant a sondejar els dies de l'Anunciació per treure la còpia de la D-013 |
| **Correcció** | Si en tornar de `setDate` la data seleccionada no és la demanada, la sonda la torna a demanar; i si al final encara no ho és, el dia es registra com a error |
| **Regressió** | Cap test automàtic: la sonda condueix saints-app en un Chrome. Comprovat a mà (sota) |

## El fet

`output/app-cell-map.json`, refet sencer el 30-9-2026, deia que l'1 de gener de 2017 era
`michael_gabriel_and_raphael_archangels`. El 2-10, sondejant només el 25-3-2026, va tornar
`holy_guardian_angels`: la celebració del 2 d'octubre, el dia que corria la sonda. Les caselles, en canvi,
eren les bones (Sexta de l'Anunciació, `12004`/`12005`/`12006`).

## Per què

En arrencar, saints-app crida el seu propi `setDate(avui)`. Si comença després del `setDate` de la sonda,
canvia `currentDate` a avui mentre el de la sonda encara espera, i `setDate` descarta un resultat la data
del qual ja no és la seleccionada (la guarda «A newer setDate() call may have changed currentDate…» de
`dateStore.ts`). El de la sonda es llença i `romcalDay` es queda amb el d'avui. Les hores surten bé perquè
la sonda demana cada hora a mà amb `changeDay`; l'etiqueta del dia, no.

Només li passa al primer dia de cada passada: als següents, saints-app ja ha acabat d'arrencar. A la passada
sencera del 30-9 va ser l'1-1-2017.

## La correcció

A `PROBE`, després de `setDate(when)`: fins a cinc reintents mentre `dateStore.currentDate` no sigui `when`.
Abans de llegir `romcalId`, si la data seleccionada encara no és la demanada, el dia llança un error i queda
registrat així al mapa, en comptes de sortir amb l'etiqueta d'un altre dia.

## Comprovat

| | |
|---|---|
| Abans | `--range 2026-03-25..2026-03-25 --fresh` → `holy_guardian_angels`, caselles bones |
| Després | La mateixa ordre → `annunciation_of_the_lord`, caselles bones; `commons/ca` de saints-app restaurat (git net) |
| L'1-1-2017 | Tornat a sondejar el 2-10: `mary_mother_of_god` |
