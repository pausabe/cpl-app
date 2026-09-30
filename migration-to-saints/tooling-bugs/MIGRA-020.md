# MIGRA-020 — Les pregàries de Vespres del dimecres II anaven una casella corregudes

| | |
|---|---|
| **Estat** | Corregit, per decisió d'en Pau (30-9-2026, opció a) |
| **Component** | Eines de migració · `lib/preces-alignment.js` (nou) · `join-content.test.js` · `day-compare.js` · `review/day-gap.js` |
| **Gravetat** | Mitjana: a saints-app en català, la pregària dels difunts era al lloc d'una altra i l'última sortia buida |
| **Trobat** | 30 de setembre de 2026, revisant sant Jeroni |
| **Correcció** | Les pregàries d'aquesta llista es col·loquen segons la decisió, no per posició |
| **Regressió** | `preces-alignment.test.js`: la CPL en té cinc, i la dels difunts va a la 9574 i res a la 9573 |

## El fet

Al llatí (Liturgia Horarum, dimecres II, Vespres) hi ha **cinc** pregàries, i la quarta té dues opcions
marcades amb «vel»: el bon temps per a les collites, **o bé** «Ab omnibus noxis libera nos… et copiosam
benedictionem super domus nostras effunde». La CPL en dona cinc, amb la primera opció, i és correcte. El
castellà imprimeix les dues opcions seguides, i l'índex de saints-app hi té **sis** caselles
(`preces_contenido/9569`–`9574`), la cinquena l'alternativa («Líbranos, Señor, de todo peligro»).

El join aparellava per posició, i la pregària dels difunts de la CPL anava a la 9573 (l'alternativa); la
9574, que és la dels difunts, quedava sense català. Passa els 56 dimecres de la setmana II del salteri
durant l'any, a la finestra 2017-2026.

Primer es va marcar com a error de cpl-app, perquè `liturgiadeleshores.cat` en té sis. Aquella web no és
oficial i imprimeix com el castellà; el llatí va dir que la CPL tenia raó. No hi ha CPL-LIT.

## La decisió i la correcció

En Pau va triar l'opció **a**: la casella de l'alternativa queda sense català, i el català mostra les cinc
de la CPL. Cal que saints-app amagui la casella que falta en lloc de mostrar «id 9573 not found» (proposat
a en Fernando).

`lib/preces-alignment.js` guarda, **una per una**, les llistes decidides així: quina pregària de la CPL va a
cada casella. Totes les altres continuen per posició. El join i el comparador de la revisió el fan servir
tots dos, perquè la revisió no prengui la decisió per una divergència, i `day-gap.js` compta la casella com a
«buida per decisió» en una sola línia, no com un forat.

Hi ha 16 llistes de pregàries més amb caselles a mitges a la finestra; no s'han tocat. Cadascuna s'ha de
mirar pel seu compte.
