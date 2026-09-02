# Registre de canvis de la migració al català

Aquest fitxer és **el mestre**: tot canvi que hàgim fet a cpl-app, a saints-app o a les eines
durant la migració hi té una entrada. Serveix per a tres coses que no fa cap altre fitxer del
repositori:

1. **Justificar-los davant del client** — què estava malament, com se sap, i amb quina prova.
2. **Tornar-los a aplicar** — sobretot els de la base de dades, que **es perden** cada vegada
   que et baixes `cpl-app.db` del web de Deployment.
3. **Trobar-los** sense repassar l'historial a mà.

Els dossiers llargs viuen a `migration-to-saints/cpl-bugs/` (errors de cpl-app) i
`migration-to-saints/tooling-bugs/` (errors de les nostres eines). Aquí hi ha la fitxa curta i
els enllaços.

Tots els commits d'aquest fitxer són a `origin`: cpl-app a la branca `catalan-migration`,
saints-app i litcal a les seves. Els enllaços de GitHub funcionen.

---

## Taula mestra

| ID | Data | On | Tipus | Cal reaplicar-ho? | Commit |
|---|---|---|---|---|---|
| [CPL-LIT-001](#cpl-lit-001) | 2026-08-14 | cpl-app | codi | No — va al git | `cdc8c79` |
| [CPL-LIT-002](#cpl-lit-002) | 2026-08-15 | cpl-app | **dades (BD)** | **Sí** | `6726622` |
| [CPL-LIT-003](#cpl-lit-003) | 2026-09-02 | cpl-app | **dades (BD)** | **Sí** | `9f472d8` |
| [MIGRA-001](#migra-001) | 2026-09-01 | eines | codi | No — va al git | `a3e4d52` |
| [EINA-espais](#eina-espais) | 2026-08-14 | eines | codi | No — va al git | `f2f68fc` |
| [EINA-diocesi](#eina-diocesi) | 2026-07-24 | eines | codi | No — va al git | `d849c7f` |
| [SA-01](#sa-01) | 2026-08-11 | saints-app | funcionalitat | No | `2d3772d5f` |
| [SA-02](#sa-02) | 2026-08-11 | saints-app | contingut | Es regenera | `abc5c1caf` |
| [SA-03](#sa-03) | 2026-09-01 | saints-app | contingut | Es regenera | `f28389733` |
| [LC-01…05](#litcal) | 2026-07-23 → 08-11 | litcal | codi | No | 5 commits |

**Errors de cpl-app trobats fins ara: 3.** Dos són de dades i un de codi. Per llistar-los des
del git en qualsevol moment:

```sh
git log --grep='^Cpl-Bug:' --format='%(trailers:key=Cpl-Bug,valueonly,separator=%x20)|%h|%as|%s'
```

---

## El que s'ha de reaplicar sobre una base de dades acabada de baixar

`src/Assets/db/cpl-app.db` **està gitignorada** i ve del web de Deployment. Els fixos de dades
no hi són quan te la baixes de nou. Aquests dos fitxers `.sql` **són l'únic registre** del que
s'hi va canviar:

```sh
# 1. Còpia de seguretat: no hi ha desfer.
cp src/Assets/db/cpl-app.db /tmp/cpl-app.db.backup

# 2. Els dos fixos, en ordre. Són idempotents: si CPL ja ho ha arreglat a origen, no fan res.
sqlite3 src/Assets/db/cpl-app.db < db-fixes/CPL-LIT-002.sql
sqlite3 src/Assets/db/cpl-app.db < db-fixes/CPL-LIT-003.sql

# 3. Els detectors. Si fallen, a la base li falta el fix.
npx jest __tests__/Services/ImmaculateConceptionTransfer.test.js
npx jest __tests__/Services/Psalm66PointingMark.test.js

# 4. Si has tocat la base, el join ha de tornar a córrer.
HOURS=Laudes,Vespers npx jest migration-to-saints/join-content.test.js --silent
```

Cap dels dos `.sql` filtra per `id` de fila: filtren per **l'estat incorrecte**, i per això
funcionen sobre qualsevol versió de la base i es poden executar dues vegades sense fer mal.

Per saber sobre quina versió s'han aplicat, cada `.sql` porta a la capçalera el recompte de
`_tables_log` i el sha256 d'abans i de després. **`_tables_log` no s'ha tocat mai**: el seu
recompte és el que el wiki de CPL fa servir per comparar amb la versió publicada.

---

# Errors de cpl-app

## CPL-LIT-001

**La salmòdia de Laudes del Dimecres de Cendra** · 14 d'agost de 2026

A Laudes del Dimecres de Cendra cpl-app resava el Salm 107; hi va el Salm 50, el *Miserere*, i
tot el trio era equivocat. La Quaresma comença a mitja setmana i Laudes d'aquell dia pren la
salmòdia penitencial **del divendres de la setmana III**; cpl-app calculava dimecres de la
setmana IV. Passava **tots els anys**, verificat als 10 que cobreix la base.

| | |
|---|---|
| Dossier | [migration-to-saints/cpl-bugs/CPL-LIT-001.md](migration-to-saints/cpl-bugs/CPL-LIT-001.md) |
| Commit | `cdc8c79` — [GitHub](https://github.com/pausabe/cpl-app/commit/cdc8c799942f25059e83cb7195ec76be6367314d) |
| Fix | Codi: `src/Services/Liturgy/LiturgyMastersService.tsx`, `ObtainLaudesCommonPsalter` |
| Test | [`__tests__/Services/AshWednesdayLaudesPsalmody.test.js`](__tests__/Services/AshWednesdayLaudesPsalmody.test.js) |
| Reaplicar | **No** — és codi, va al git |
| Prova | Tres fonts en tres idiomes (anglès, castellà per data exacta, i la rúbrica explicada), més la contraverificació que les Vespres **no** canvien |
| Efecte a la migració | 8 caselles desbloquejades, **1.034 observacions-dia** |

## CPL-LIT-002

**La Immaculada no es trasllada quan el 8 de desembre cau en diumenge d'Advent** · 15 d'agost de 2026

Els anys en què el 8 de desembre cau en diumenge, cpl-app resava la solemnitat aquell diumenge
—que té precedència sobre ella— i deixava el dilluns 9 com un dia qualsevol. Tres errors
alhora, i el més greu és que **el diumenge II d'Advent desapareixia** de l'ofici. Dins dels 10
anys de la base passa el **2019** i el **2024**; la propera vegada serà el **2030**.

| | |
|---|---|
| Dossier | [migration-to-saints/cpl-bugs/CPL-LIT-002.md](migration-to-saints/cpl-bugs/CPL-LIT-002.md) |
| Commit | `6726622` — [GitHub](https://github.com/pausabe/cpl-app/commit/67266222dbc633f340034370993e77045db3f301) |
| Fix | **Dades**: [`db-fixes/CPL-LIT-002.sql`](db-fixes/CPL-LIT-002.sql), taula `anyliturgic`, 4 files |
| Test | [`__tests__/Services/ImmaculateConceptionTransfer.test.js`](__tests__/Services/ImmaculateConceptionTransfer.test.js) |
| Reaplicar | **Sí, sobre cada base nova** |
| BD | `_tables_log` = 12.528 · sha256 `6eed8fe8…` → `fda34735…` |
| Prova | La mateixa taula ja sap fer el trasllat i l'aplica bé a sant Josep (2023) i a l'Anunciació (2024): no és un criteri pastoral, és un forat |
| Efecte a la migració | 98 caselles contestades, 210 observacions reassignades, **45 caselles queden unànimes** |

## CPL-LIT-003

**Al Salm 66 li falta l'asterisc de mediació a l'últim vers, fora de Laudes** · 2 de setembre de 2026

El Salm 66 és a la base tres vegades com a salmòdia puntuada, i a dues els faltava l'asterisc
al vers «La terra ha donat el seu fruit,»: la de **Vespres** del dimecres de la setmana II i la
de l'**Ofici de lectura** de les Témpores d'acció de gràcies. Qui resa Vespres veu una estrofa
sense la pausa que la mateixa estrofa sí que duu al matí.

| | |
|---|---|
| Dossier | [migration-to-saints/cpl-bugs/CPL-LIT-003.md](migration-to-saints/cpl-bugs/CPL-LIT-003.md) |
| Commit | `9f472d8` — [GitHub](https://github.com/pausabe/cpl-app/commit/9f472d83e01d22e1bff64e1890ab630489c06e73) |
| Fix | **Dades**: [`db-fixes/CPL-LIT-003.sql`](db-fixes/CPL-LIT-003.sql), `salteriComuVespres/12.salm2` i `santsMemories/377.Salm2Ofici` |
| Test | [`__tests__/Services/Psalm66PointingMark.test.js`](__tests__/Services/Psalm66PointingMark.test.js) |
| Reaplicar | **Sí, sobre cada base nova** |
| BD | `_tables_log` = 12.528 · sha256 `fda34735…` → `38842ab0…` (ja porta CPL-LIT-002 aplicat) |
| Prova | **Interna**: les edicions en línia despullen la puntuació i no poden dir-hi res. La còpia germana de Laudes duu la marca, i un cop normalitzats els espais és **l'única** diferència entre les dues |
| Efecte a la migració | Cap casella nova migrada. `salmos_textos/144` passa de **26 grups acusats a 1**, i 17 grups desapareixen de l'informe |

---

# Errors de les nostres eines

Aquests **no** es comuniquen a CPL: són nostres. Però convé tenir-los traçats igual, perquè
tots tres van fer semblar que cpl-app estava malament quan no ho estava.

## MIGRA-001

**El «control ferial» de Vespres del join era el dia ja renderitzat** · 1 de setembre de 2026

`MergeVespersWithCelebration` no fa còpia de l'objecte, o sigui que el join comparava les
Vespres amb elles mateixes: marcava els 19 camps com a ferials sempre i arxivava el text de
Vespres a la casella equivocada a **tots** els dies amb memòria. Es va veure al 7 de desembre
de 2026, on cpl-app resa bé les I Vespres de la Immaculada i l'eina ho arxivava sota sant
Ambròs.

| | |
|---|---|
| Dossier | [migration-to-saints/tooling-bugs/MIGRA-001.md](migration-to-saints/tooling-bugs/MIGRA-001.md) (en castellà) |
| Commit | `a3e4d52` — [GitHub](https://github.com/pausabe/cpl-app/commit/a3e4d524cf9cbfac560755ec3a8299091dd86132) |
| Fix | `migration-to-saints/join-content.test.js`, `resolveHoursLiturgy` |
| Efecte | **ids pendents 3.030 → 1.478.** Gairebé la meitat dels conflictes registrats eren aquest error |
| Conseqüència fora | Va obligar a reexportar el contingut a saints-app: [SA-03](#sa-03) |

**Pendent**: `migration-to-saints/cpl-day.test.js` encara té el control ferial trencat. Per
això la skill `revisio-dia` fa servir `review/resolve-cpl-days.test.js` i no aquell.

## EINA-espais

**El join inventava conflictes a partir d'un text escrit de dues maneres** · 14 d'agost de 2026

cpl-app guarda el mateix text moltes vegades i les còpies no són idèntiques byte a byte —un
espai de més, tres espais abans de l'`*` en lloc de quatre. El join les agrupava per la cadena
crua i les llegia com cpl-app contradient-se. Les «4 variants» del Salm 50 eren **3 còpies del
mateix text** més el Salm 56.

| | |
|---|---|
| Explicació | [PLAN.md §12](migration-to-saints/PLAN.md) — «Conflictes fantasma» |
| Commit | `f2f68fc` — [GitHub](https://github.com/pausabe/cpl-app/commit/f2f68fc62a6e4bc591e3e5dc25f210596af97b56) |
| Fix | `migration-to-saints/lib/text-key.js` — només col·lapsa blancs; els salts de línia i les marques `†`/`*` sobreviuen, perquè són contingut |
| Efecte | **173 variants fantasma** fora, 16 caselles migrades (969 observacions), cap text existent modificat |

> Aquesta és la peça que va fer que [CPL-LIT-003](#cpl-lit-003) fos diagnosticable: un cop els
> espais no compten, l'única diferència que quedava era l'asterisc, i aquell sí que era real.

## EINA-diocesi

**Les dates es resolien contra el calendari 'spain' i no contra el de la diòcesi** · 24 de juliol de 2026

| | |
|---|---|
| Commit | `d849c7f` — [GitHub](https://github.com/pausabe/cpl-app/commit/d849c7f92f56425bcc726f737e030d06eacf6a3b) |
| Fix | `migration-to-saints/join-content.test.js` |
| Efecte | Tot el contingut de `commons-ca/` es va tornar a generar |

---

# Canvis a saints-app

Repositori `Saints-App/saints-app`. Aquí no hi hem corregit cap error litúrgic: el que hi hem
fet és **posar-hi el català**.

<a id="sa-01"></a>
### SA-01 · El català com a idioma seleccionable · 2026-08-11
`2d3772d5f` — [GitHub](https://github.com/Saints-App/saints-app/commit/2d3772d5f712bcb28c1f190cb037ca1778ee5b04) · 6 fitxers

<a id="sa-02"></a>
### SA-02 · Primera exportació dels textos catalans (`commons/ca`) · 2026-08-11
`abc5c1caf` — [GitHub](https://github.com/Saints-App/saints-app/commit/abc5c1cafbda8f9ec31bfe42cd01cb412081fd7f) · 14 fitxers, 5.016 línies

<a id="sa-03"></a>
### SA-03 · Reexportació de Vespres després de MIGRA-001 · 2026-09-01
`f28389733` — [GitHub](https://github.com/Saints-App/saints-app/commit/f28389733b8cdcf7997dd687682ab62d1c30d669) · 12 fitxers, 1.412 línies

Contingut generat: **no s'edita a mà**. Es torna a treure corrent el join i exportant.

<a id="litcal"></a>
# Canvis a litcal

Repositori `Saints-App/litcal`. La capa de calendari català i per diòcesis, generada des de
`cpl-app.db`.

| Commit | Data | Què |
|---|---|---|
| [`1a0e690`](https://github.com/Saints-App/litcal/commit/1a0e69078da15256f165f4232d96d7be7beb07ff) | 2026-07-23 | Capa de Catalunya + per diòcesi, generada des de `cpl-app.db` |
| [`9d61678`](https://github.com/Saints-App/litcal/commit/9d61678b646e6d51a03cd6f8eb32977a61d3e985) | 2026-07-23 | Sortida `--json` a `build-catalan-calendars.ts` |
| [`4193222`](https://github.com/Saints-App/litcal/commit/4193222297d1dd9c085d8db0c73c01757a2edaba) | 2026-07-23 | Falsos positius al filtre de col·lisions del calendari català |
| [`c436894`](https://github.com/Saints-App/litcal/commit/c436894453aff47f4e7f8b86482e2bd52e63a286) | 2026-07-23 | `build-date-to-key-manifest.ts` per al join |
| [`da37ea3`](https://github.com/Saints-App/litcal/commit/da37ea315f87c653ba06517a50829462c6f3b033) | 2026-08-11 | El rang de dates es construeix en UTC |

---

# Com s'hi afegeix una entrada

Cada cop que es corregeixi alguna cosa, **abans de donar la feina per acabada**:

1. Afegir la fila a la [taula mestra](#taula-mestra).
2. Afegir la fitxa a la secció que toqui, amb: què passava en una frase que el client entengui,
   dossier, commit (sha curt + URL de GitHub), fitxer del fix, test, **si cal reaplicar-ho**, i
   l'efecte mesurat sobre la migració.
3. Si toca la base de dades: el `.sql` a `db-fixes/`, i els sha256 d'abans i de després a la
   fitxa i a la capçalera del `.sql`.
4. Si el fix obliga a reexportar a saints-app, enllaçar-hi el commit d'allà.

La numeració: `CPL-LIT-NNN` per als errors de cpl-app (van a l'informe del client),
`MIGRA-NNN` per als de les eines amb dossier propi, i `EINA-<paraula>` per als canvis d'eina
que s'expliquen a `PLAN.md` i no tenen dossier.
