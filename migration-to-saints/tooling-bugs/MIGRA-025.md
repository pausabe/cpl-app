# MIGRA-025 — La revisió d'un dia deia «triar la majoritària trenca N dies» amb el compte del text del dia

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | Eines de migració · `review/day-gap.js` (la revisió d'un dia, al terminal) |
| **Gravetat** | Baixa, però enganya a l'hora de decidir: a un dia que vol la variant minoritària, diu el contrari del que passa |
| **Trobat** | 6 d'octubre de 2026, revisant aquell dia (dimarts XXVII, Sant Bru) |
| **Correcció** | L'etiqueta diu de quin text surt el compte: el del dia, si el dia s'ha vist a la migració; el majoritari, només si no |
| **Regressió** | `review/day-gap.test.js`, 2 de 2; sense la correcció en falla 1 |

## El fet

Per a cada casella retinguda, `day-gap.js` escrivia `triar la majoritària trenca N de M dies`. La N surt
d'`impactFor()` (`day-check.js`), que compta els dies que sortirien malament **si s'hi posés el text que vol
aquest dia**; només quan el dia no s'ha vist a la migració compta des del text majoritari. El panell ja ho
deia bé («amb el text d'aquest dia, N dies sortirien malament»); el terminal, no.

El 6-10-2026 el salm responsorial de la missa (`lecturas_texto/885`, compartit amb el Naixement de sant Joan
Baptista) té dues variants: la de sant Joan, 10 dies, i la del dimarts XXVII dels anys parells, 5. La revisió
deia «triar la majoritària trenca 10 de 15 dies». És al revés: la majoritària trenca els 5 d'aquest dia, i
la d'aquest dia trencaria els 10 de sant Joan.

## La correcció

`heldImpact()` a `review/day-gap.js`: si el dia s'ha vist, `amb el text d'aquest dia, 5 de 15 dies bé i 10
malament`; si no, `triar la majoritària trenca N de M dies`, que llavors sí que és el que compta.

## Comprovat

`node migration-to-saints/review/day-gap.js 2026-10-06`: «amb el text d'aquest dia, 5 de 15 dies bé i 10
malament». Cap altra línia de la sortida canvia.
