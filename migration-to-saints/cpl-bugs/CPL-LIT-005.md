# CPL-LIT-005 — La Mare de Déu de la Cinta no hi és quan l'1 de setembre cau en diumenge

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | cpl-app · calendari · celebracions de data variable (Tortosa) |
| **Gravetat** | Alta — la patrona de Tortosa desapareix aquell any, i a la ciutat el dia queda sense celebració |
| **Trobat** | 28 de setembre de 2026, fent la taula del calendari des de litcal (el dia on la posa la taula no és el que calcula l'app) |
| **Correcció** | **Codi**: `isMotherOfGodFromTheTibbon` a `src/services/celebrationIdentifierService.ts` |
| **Regressió** | `__tests__/liturgy/cintaDay.test.js` |

## Símptoma

La Mare de Déu de la Cinta, a Tortosa, és el **dissabte abans del primer diumenge de setembre**: memòria
a la diòcesi i solemnitat a la ciutat. Els anys en què l'1 de setembre cau en diumenge, aquest dissabte és
el 31 d'agost. La taula la hi posa bé, però l'app no la troba:

| 31 d'agost del 2024 | taula | cpl-app (incorrecte) | correcte |
|---|---|---|---|
| Tortosa, diòcesi | `M` | Sant Ramon Nonat, prevere | Mare de Déu de la Cinta |
| Tortosa, ciutat | `S` | cap celebració (fèria) | Mare de Déu de la Cinta |

Dins dels anys de la taula de l'app passa el **2019** i el **2024**. La propera vegada serà el **2030**, i
després el 2041, el 2047 i el 2052.

## La norma

La mateixa fila de l'app ho diu: a `santsMemories` (472) i a `santsSolemnitats` (77, 78) la Cinta no té data,
sinó la regla «Dissabte abans del primer diumenge de setembre». La taula `anyliturgic` l'aplica bé (el 31
d'agost del 2019 i del 2024 hi posa `M` a la diòcesi i `S` a la ciutat i a la catedral), i també litcal.

## Causa

És un **error de codi**. Les files de la Cinta no tenen data, i l'app la reconeix calculant el dia:
`isMotherOfGodFromTheTibbon` buscava el primer diumenge de setembre **a partir del dia 2**. Quan el primer
diumenge és l'1, trobava el segon (el 8) i posava la Cinta el dissabte 7. El 31 d'agost, doncs, no la
reconeixia: a la diòcesi buscava el sant del dia (`31-ago`, sant Ramon Nonat) i a la ciutat, amb la lletra
`S`, no trobava cap solemnitat del 31 d'agost i quedava en fèria.

## Correcció

El primer diumenge de setembre es busca a partir de l'1, i la Cinta és el dia abans. Els altres anys no
canvia res: el 2025 continua el 6 de setembre i el 2026 el 5.

### Verificació

`__tests__/liturgy/cintaDay.test.js`, amb els serveis reals de l'app i la BD que porta:

- el 31 d'agost del 2024 la diòcesi i la ciutat de Tortosa tenen la Cinta (sense la correcció, falla);
- el 7 de setembre del 2024 ja no la té;
- el 6 de setembre del 2025 i el 5 de setembre del 2026 la continuen tenint.

## Efecte sobre la migració

Cap: saints-app i litcal calculen la Cinta per regla (`nth-weekday-of-month` amb `offset: -1` a litcal).
