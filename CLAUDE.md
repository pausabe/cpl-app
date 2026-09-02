# cpl-app — instruccions del projecte

## Tot canvi va al registre mestre

**[REGISTRE-DE-CANVIS.md](REGISTRE-DE-CANVIS.md) s'actualitza sempre, en el mateix torn que el
fix, abans de donar la feina per acabada.** No esperis que en Pau t'ho recordi: si has
corregit alguna cosa a cpl-app, a saints-app, a litcal o a les eines de migració, hi has
d'afegir l'entrada. El fitxer mateix explica què hi ha de dur cada fitxa.

Per què: en Pau ha de poder **justificar** cada canvi davant del client i **tornar a aplicar**
els de la base de dades, que es perden cada cop que es baixa `cpl-app.db`. Un fix sense entrada
al registre és un fix que d'aquí a tres mesos ningú sabrà d'on surt.

## La base de dades no és al git

`src/Assets/db/cpl-app.db` està gitignorada i ve del web de Deployment de CPL. Quan un error és
de dades:

- Es modifica la BD directament, però el registre del canvi és un `db-fixes/CPL-LIT-NNN.sql`
  **committejat**, que filtra per l'estat incorrecte i no per `id` de fila (idempotent i
  independent de la versió).
- Còpia de seguretat abans de tocar-la: no hi ha desfer.
- A la capçalera del `.sql`, el recompte de `_tables_log` i els sha256 d'abans i de després.
  **No afegir mai files a `_tables_log`**: el wiki de CPL en fa servir el recompte per comparar
  amb la versió publicada.
- El test de regressió és el **detector**: ha de fallar sobre una base sense el pedaç.

## Els errors de cpl-app es numeren

`CPL-LIT-NNN`, amb tres peces en un sol commit —fix, test de regressió i dossier a
`migration-to-saints/cpl-bugs/`— i el bloc de trailers `Cpl-Bug:` al final del missatge. Els de
les nostres eines van a `migration-to-saints/tooling-bugs/` i no es comuniquen al client.

## Paranys

- **No facis servir `migration-to-saints/cpl-day.test.js`**: el seu control ferial de Vespres
  encara està trencat (vegeu MIGRA-001) i inventa divergències a totes les memòries. Per a
  resoldre dies, `migration-to-saints/review/resolve-cpl-days.test.js`.
- `__tests__/Services/DatabaseUpdaterService.test.js` falla d'abans: importa un mòdul que no
  existeix (`DatabaseUpdaterService`; el fitxer real és `UpdaterService.tsx`). No és teu.
