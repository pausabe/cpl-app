# CPL-LIT-002 — La Immaculada no es trasllada quan el 8 de desembre cau en diumenge d'Advent

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | cpl-app · calendari · trasllat de solemnitats |
| **Gravetat** | Alta — dos dies sencers equivocats, i un diumenge d'Advent que desapareix |
| **Trobat** | 15 d'agost de 2026, investigant un conflicte del primer salm de Laudes al panell de migració |
| **Correcció** | **Dades**: `db-fixes/CPL-LIT-002.sql` sobre `src/Assets/db/cpl-app.db`, taula `anyliturgic` |
| **Regressió** | `__tests__/Services/ImmaculateConceptionTransfer.test.js` |

## Símptoma

Els anys en què el **8 de desembre cau en diumenge d'Advent**, cpl-app resa la solemnitat de la
Immaculada aquell diumenge i deixa el dilluns 9 com un dia qualsevol. Hauria de ser al revés.

| dia | cpl-app (incorrecte) | correcte |
|---|---|---|
| **8 de desembre (dg)** | Immaculada Concepció (solemnitat), Salm 62 | **Diumenge II d'Advent**, Salm 117 |
| **9 de desembre (dl)** | St Joan Dídac (memòria lliure), salmòdia ferial, Salm 41 | **Immaculada Concepció** (solemnitat), Salm 62 |

Són tres errors alhora:

1. Es resa una solemnitat en un diumenge que té precedència sobre ella.
2. **El diumenge II d'Advent desapareix** de l'ofici: aquell any no es resa enlloc.
3. El dia que hauria de portar la solemnitat porta una memòria lliure amb salmòdia de fèria.

Dins dels 10 anys que cobreix la base de dades passa el **2019** i el **2024**. La propera
vegada serà el **2030**.

## La norma

A la Taula de dies litúrgics, els **diumenges d'Advent, Quaresma i Pasqua** ocupen el primer
rang, per damunt de les solemnitats del Senyor, de la Mare de Déu i dels sants. Quan una
solemnitat hi coincideix, no se suprimeix: es **trasllada al dia lliure següent**. Per això,
els anys en què el 8 de desembre cau en diumenge, la Immaculada es resa el dia 9.

El diumenge també guanya a les Vespres: el vespre del dia 8 són les segones Vespres del
diumenge, no les primeres de la solemnitat traslladada.

## Causa

És un **forat de dades, no de codi**. I la prova és que la mateixa taula sap fer-ho: el
mecanisme de trasllat existeix, funciona, i s'aplica correctament a altres solemnitats.

`anyliturgic` té tres columnes per a això — `Mogut`, `diaMogut` i `diocesiMogut` — i
`DatabaseDataHelper.GetDateShortDatabaseCode()` les fa servir per anar a buscar els textos
propis sota la data d'origen. Comparació dins de la mateixa taula:

| dia | `DiadelaSetmana` | `BaD` | `diaMogut` | |
|---|---|---|---|---|
| 2023-03-19 | **Dg** de Quaresma | `-` | `-` | St Josep **buidat** del diumenge |
| 2023-03-20 | Dl | `S` | `19-mar` | …i **col·locat** al dilluns ✅ |
| 2024-03-25 | Dl de Setmana Santa | `-` | `-` | Anunciació buidada |
| 2024-04-08 | Dl de Pasqua | `S` | `25-mar` | …i col·locada ✅ |
| **2024-12-08** | **Dg d'Advent** | **`S`** | **`-`** | Immaculada **es queda al diumenge** ❌ |
| 2024-12-09 | Dl | `L` | `-` | només St Joan Dídac ❌ |

O sigui que no és un criteri pastoral ni un indult: el 8 de desembre està codificat com a
solemnitat fixa i ningú hi va aplicar la regla de precedència que sí que es va aplicar al 19
de març i al 25 de març.

No hi mancava contingut. Els textos propis de la Immaculada ja són a `santsSolemnitats` sota
la clau `08-dic`, i el codi els hi va a buscar sol quan la fila del dia 9 diu
`diaMogut = '08-dic'`.

## Correcció

Quatre files de `anyliturgic` (les del 8 i el 9 de desembre del 2019 i del 2024):

- **dia 8** → `Color` de `B` a `M`, i les 34 columnes de rang diocesà de `S` a `-`. Queda
  idèntica a qualsevol altre diumenge II d'Advent.
- **dia 9** → `Color` de `M` a `B`, les 34 columnes de rang de `L` a `S`, i
  `Mogut`/`diaMogut` a `08-dic` amb `diocesiMogut = '*'`.

Menorca (`MeD`/`MeV`/`MeC`) ja tenia `-` els dos dies i no es toca.

### Verificació

Amb la correcció aplicada, resolent els dies amb els Serveis reals de cpl-app:

- **2024-12-08** surt **byte a byte idèntic** a 2021-12-05 (un diumenge II d'Advent normal del
  mateix cicle C) en els 19 camps de Laudes i els 19 de Vespres.
- **2024-12-09** surt byte a byte idèntic a 2022-12-08 (una Immaculada normal), Laudes i Vespres.
- **2024-12-07** manté les primeres Vespres del diumenge, idèntiques a 2021-12-04.
- El 2019 es comporta igual, i els anys en què el dia 8 no és diumenge no canvien gens.

## Nota sobre com es reaplica

`src/Assets/db/cpl-app.db` **no és a git** (`.gitignore` hi té `*.db`) i la còpia bona ve del
Deployment website. Per tant aquest fitxer `.md` i el `.sql` que l'acompanya **són l'únic
registre del canvi**: una base de dades acabada de baixar no el portarà.

Per reaplicar-lo:

```sh
sqlite3 src/Assets/db/cpl-app.db < db-fixes/CPL-LIT-002.sql
npx jest __tests__/Services/ImmaculateConceptionTransfer.test.js
```

El `.sql` no fa servir els `id` de fila sinó l'estat incorrecte, així que és **idempotent** i
**no depèn de la versió**: corregeix els anys que trobi malament (el 2030 inclòs, quan hi
sigui), i no fa res si CPL ja ho ha arreglat a origen. El test és el detector: si falla, a
aquesta base de dades li falta el canvi.

Base sobre la qual s'ha aplicat: `_tables_log` = 12.528 registres (últim: 2025-10-29
09:04:47), sha256 `6eed8fe8…` abans i `fda34735…` després. **`_tables_log` no s'ha tocat**,
perquè el seu recompte és el que el wiki fa servir per comparar amb la versió publicada.

## Efecte secundari sobre la migració al saints-app

Els quatre dies aportaven text sota la clau d'una altra celebració: el 8 de desembre entrava
la Immaculada a les caselles del diumenge II d'Advent, i el dia 9 hi entrava una fèria a les
caselles de la Immaculada. Com que el join veia dos textos diferents per a la mateixa casella,
no n'escrivia cap i tots els dies que la comparteixen quedaven buits.

| | |
|---|---|
| caselles on apareixien aquestes 4 dates | 98 |
| observacions-dia reassignades a la variant correcta | 210 |
| **caselles que queden unànimes i es migren soles** | **45** |

Exemple del que es veia al panell abans: a `salmos_textos/64` (el Salm 62, compartit per 729
dies de 80 celebracions), la Immaculada sortia com a «varia segons l'any» perquè 8 dels seus
10 dies volien el Salm 62 i 2 en volien un altre. Aquells 2 eren el 2024-12-09 i el
2019-12-09.

Nota: `salmos_textos/64` continua bloquejada per altres motius independents d'aquest —
`ordinary_time_32_sunday` (9 dies), `holy_family` (8) i `barnabas_apostle` (7). Són casos a
part, encara pendents.
