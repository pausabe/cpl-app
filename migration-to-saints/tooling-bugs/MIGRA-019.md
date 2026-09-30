# MIGRA-019 — La revisió comparava la missa ferial de cpl-app amb les lectures del sant

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | Eines de migració · `migration-to-saints/lib/mass-columns.js` (`massColumns`) |
| **Gravetat** | Baixa per a l'app, que no en llegeix res; **alta per a la revisió**, que marcava com a divergència el que no ho era |
| **Trobat** | 30 de setembre de 2026, revisant sant Jeroni: tres «divergències» a la missa |
| **Correcció** | Si la missa que resa cpl-app és la ferial, no posar-la també a la columna del sant |
| **Regressió** | `mass-fields.test.js`, «the two columns of a memorial»: sant Jeroni (cap missa pròpia a cpl-app) i els Àngels de la Guarda (sí que en té); sense la correcció falla el primer |

## El fet

El 30 de setembre la revisió deia que la missa de sant Jeroni no coincidia: cpl-app llegia Jb 9, el
Sl 87 i Lc 9,57-62, i saints-app 2 Tm 3,14-17, el Sl 118 i Mt 13,47-52. No era veritat. cpl-app llegeix
la missa del dimecres XXVI, que és el que el Missal prefereix a les memòries sense lectures pròpies, i
la columna ferial de saints-app diu exactament això, 8 caselles de 8. La revisió també posava la missa
ferial a la columna del sant, i allà la comparava amb les lectures de sant Jeroni.

`massColumns()` copiava la missa que resa cpl-app a `CELEBRATION_*` sempre que l'entrada de l'índex
té dues columnes, sense mirar si aquella missa **era** la ferial. `LDSantoral` només té lectures per a
20 memòries (sant Bernabé, santa Marta, els Àngels de la Guarda…); a la resta, les dues candidates són
la mateixa missa.

Passava a totes les memòries sense missa pròpia: 3 a 5 divergències falses per dia (el 28-VIII, el
3-IX, el 16-IX i el 30-IX de 2026, entre d'altres). El join no n'estava afectat: no passa per
`massColumns()`, tria per la cita (vegeu la MIGRA-018).

## La correcció

Si totes les cites de la missa que resa cpl-app són les de la ferial, `massColumns()` torna només la
ferial. Sense cap clau `CELEBRATION_*`, `build-rows.js` ja llegeix aquella columna com «cpl-app no hi
té res, i és correcte» (D-001), que era el cas que tenia previst i no s'activava mai.

El 30-IX passa de 130/133 a 130/130 camps coincidents.
