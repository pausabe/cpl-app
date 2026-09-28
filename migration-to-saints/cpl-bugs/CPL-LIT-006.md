# CPL-LIT-006 — Els trasllats d'una sola diòcesi o d'un sol lloc no van bé

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | cpl-app · calendari · trasllats (`diaMogut`, `diocesiMogut`) |
| **Gravetat** | Alta — el dia del trasllat hi ha un sant equivocat, al lloc del trasllat o en tots els altres |
| **Trobat** | 28 de setembre de 2026, comparant la taula `anyliturgic` amb litcal; verificat amb Jest |
| **Correcció** | **Codi**: `src/services/databaseDataHelper.ts`, `databaseDataService.ts`, `liturgy/liturgyMastersService.ts` |
| **Regressió** | `__tests__/liturgy/movedCelebrations.test.js` i `__tests__/Services/databaseDataHelper.test.js` |

## Símptoma

Quan una celebració es trasllada només en una diòcesi (`diocesiMogut` amb les dues lletres, `To`) o només en un
lloc (`BaC`), l'app s'equivoca de sant:

| dia | lloc | taula | cpl-app (incorrecte) | correcte |
|---|---|---|---|---|
| 9-6-2018 | Barcelona, Girona | `M`, trasllat `08-jun` `To` | Sant Efrem (L) | Cor Immaculat de Maria (M) |
| 9-6-2018 | Tortosa | `F`, trasllat `08-jun` `To` | Dedicació, amb la missa de la fèria | Dedicació, amb la seva missa |
| 12-5-2025 | Lleida (diòcesi) | `M`, trasllat `11-may` `Ll` | Sants Nereu i Aquileu | Sant Anastasi |
| 4-5-2026 | Barcelona (catedral) | `S`, trasllat `3-may` `BaC` | Sants Felip i Jaume, com a solemnitat | Santa Creu |

Només els trasllats per a tothom (`*`) anaven bé a tot arreu. Del 2017 al 2026 la taula en té 8 d'una sola
diòcesi o d'un sol lloc; la taula que surt de litcal, fins al 2100, 111.

## Causa

És un **error de codi**. El trasllat del dia es feia servir a sis llocs del codi, i cadascun comparava
`diocesiMogut` amb una cosa diferent:

- la solemnitat del dia, amb el codi de dues lletres de la diòcesi (`Ba`): no hi entraven els d'un sol lloc (`BaC`);
- les memòries i les primeres vespres, amb el **nom** de la diòcesi (`Barcelona`): no hi entrava mai cap;
- la missa, amb el codi de tres lletres (`BaD`): no hi entraven els d'una diòcesi sencera (`Ba`);
- saber si el sant d'avui s'ha mogut a un altre dia, amb el de dues lletres;
- i la identificació de les celebracions de data coneguda (`checkCelebration`), **amb cap**: un trasllat de
  Tortosa feia que a Barcelona el 9 de juny del 2018 fos, per a l'app, el 8, i per això hi perdia el Cor
  Immaculat.

A més, la taula escriu de vegades el dia d'origen sense zero (`3-may`), i el santoral el té amb zero (`03-may`):
el 4 de maig del 2026 la catedral de Barcelona no hauria trobat la Santa Creu encara que el lloc hagués estat bé.

## Correcció

Una sola funció decideix si el trasllat és per al lloc de qui resa (`isTransferForPlace`): «*» per a tothom, les
dues lletres per a tota la diòcesi i el codi d'un lloc per a aquell lloc. El dia se'n calcula un sol cop, en
llegir la fila, i tota la resta de l'app fa servir el resultat: fora del lloc del trasllat, el dia és com
qualsevol altre. El dia d'origen es normalitza (`3-may` → `03-may`).

La taula que surt de litcal diu, a més, per a qui val el trasllat lloc per lloc a `Mogut` («Ba Gi Ll SF So Ta Te
To Ur Vi Andorra»), perquè `diocesiMogut` només pot dir un codi i ha de posar «*» també quan un trasllat és de
tot Catalunya però no de Mallorca ni de Menorca (Sant Jordi, Montserrat). L'app el llegeix quan hi és; si
`Mogut` és una nota com les d'abans («Terrasa 10-dic»), compta `diocesiMogut`.

De passada: `getDateFromShortDatabaseCode` no tornava cap data per al gener (el mes 0).

### Verificació

- `__tests__/liturgy/movedCelebrations.test.js`, amb els serveis reals de l'app i la BD que porta: els quatre
  casos de la taula de dalt (sense la correcció, fallen tots quatre).
- `__tests__/Services/databaseDataHelper.test.js`: per a qui és cada trasllat, i els codis dels dies.
- Les proves que recorren tots els dies del 2025 i del 2026 (els goldens) només canvien en sis dies, i només en
  la informació del dia traslladat dels llocs on el trasllat no és: no hi canvia ni l'ofici ni la missa.

## Efecte sobre la migració

Cap: a litcal cada calendari resol els seus trasllats.
