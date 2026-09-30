# MIGRA-021 — El join escrivia un salm unànime encara que no fos el de la casella

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | Eines de migració · `lib/held-resolution.js` (`anotherPsalm`) · `join-content.test.js` |
| **Gravetat** | Baixa en extensió, alta en el que es veu: a Tèrcia de tres solemnitats, el català deia el salm 124 on el castellà diu el 121 |
| **Trobat** | 30 de setembre de 2026, revisant les hores menors de les solemnitats (troballes F31-F33) |
| **Correcció** | Una casella de salm que cpl-app diu sempre igual, però que no és el salm que el castellà de la casella anomena, queda retinguda com una discrepància |
| **Regressió** | `held-resolution.test.js`, «a psalm cpl-app always says, in another psalm's cell» |

## El fet

A les hores menors de les solemnitats, cpl-app diu els salms 122, 123 i 124 a Tèrcia, Sexta i Nona: la
base de dades de la CPL només en guarda un grup per a les tres hores. És lícit (IGLH 82, troballa F31). A
l'Anunciació, la Immaculada i l'1 de gener, l'índex d'eprex dona a cada hora el seu grup i fa servir
caselles pròpies (`salmos_citas/12001`–`12009`). La tercera de Tèrcia, `12003`, és el salm 121.

cpl-app hi va dir el 124 els 20 dies que hi va passar el join, sempre igual. El join només retenia una
casella quan cpl-app s'hi contradeia, i aquí no s'hi contradeia: la va escriure. El català de Tèrcia
mostrava el salm 124, amb la seva cita, on el castellà mostra el 121.

## Per què no es va veure

La [D-012](../../REGISTRE-DE-CANVIS.md#d-012) comprova amb la cita castellana les caselles de salm
**retingudes**. Les unànimes no passaven per aquell control. Mirat tot el català el 30-9-2026, només
aquesta casella (cita i text) nomenava un altre salm que el castellà.

## La correcció

`anotherPsalm()` fa servir la mateixa prova que la D-012: la cita, contra la castellana de la casella; el
text, segons com quadrava la cita de cpl-app cada dia que es va dir. Si és un altre salm, la casella va a
`join-pending-review.json` amb `reason: 'anotherPsalm'` i no s'escriu.

L'exportació no esborra res, i la `12003` es va treure de saints-app a mà (SA-22). Queda buida fins que
s'hi posi el salm 121 de la CPL.
