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
| [MIGRA-002](#migra-002) | 2026-09-03 | eines | codi | No — va al git | — |
| [MIGRA-003](#migra-003) | 2026-09-03 | eines | codi | No — va al git | — |
| [EINA-comu](#eina-comu) | 2026-09-03 | eines | codi | No — va al git | — |
| [SA-04](#sa-04) | 2026-09-03 | saints-app | contingut | Es regenera | — |
| [EINA-espais](#eina-espais) | 2026-08-14 | eines | codi | No — va al git | `f2f68fc` |
| [EINA-diocesi](#eina-diocesi) | 2026-07-24 | eines | codi | No — va al git | `d849c7f` |
| [SA-01](#sa-01) | 2026-08-11 | saints-app | funcionalitat | No | `2d3772d5f` |
| [SA-02](#sa-02) | 2026-08-11 | saints-app | contingut | Es regenera | `abc5c1caf` |
| [SA-03](#sa-03) | 2026-09-01 | saints-app | contingut | Es regenera | `f28389733` |
| [LC-01…05](#litcal) | 2026-07-23 → 08-11 | litcal | codi | No | 5 commits |
| [EPREX-001](#eprex-001) | 2026-09-03 | saints-app | **proposat** | — pendent de resposta | — |
| [EPREX-002](#eprex-002) | 2026-09-03 | saints-app | **proposat** | — pendent d'enviar | — |
| [EPREX-003](#eprex-003) | 2026-09-04 | saints-app | **proposat** | — pendent d'enviar | — |
| [MIGRA-004](#migra-004) | 2026-09-03 | eines | codi | No — va al git | — |
| [SA-05](#sa-05) | 2026-09-03 | saints-app | contingut | Es regenera | — |
| [SA-06](#sa-06) | 2026-09-03 | saints-app | merge | No — va al git | `1a35a54a6` |
| [SA-07](#sa-07) | 2026-09-04 | saints-app | contingut | No — va al git | — |
| [SA-08](#sa-08) | 2026-09-04 | saints-app | **codi** | No — va al git | `dae46844b` |
| [SA-09](#sa-09) | 2026-09-04 | saints-app | **codi** | No — va al git | `8a80e393c` |
| [D-001](#d-001) | 2026-09-03 | cpl-app | **cap canvi** (qüestió tancada) | — | — |
| [D-002](#d-002) | 2026-09-03 | saints-app | **decisió** (qüestió tancada) | — | — |
| [D-003](#d-003) | 2026-09-04 | cpl-app | **cap canvi** (qüestió tancada) | — | — |

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

<a id="eina-comu"></a>
## EINA-comu

**El join agafa el Comú dels sants per a la pestanya del sant** · 3 de setembre de 2026

No és cap error: és **la decisió D-001 executada**. Els dies de memòria, cpl-app resa la fèria
i el seu text va a la casella ferial; la casella de la pestanya del sant es quedava sense
ningú que la pogués omplir, perquè cpl-app no demana mai el Comú. En castellà aquella pestanya
ja mostra el Comú, i s'ha decidit que el català hi faci igual. **El català de saints-app se
separa aquí de cpl-app a posta.**

| | |
|---|---|
| Decisió | [D-001](#d-001) · [dossier](migration-to-saints/decisions/D-001-el-comu-a-les-memories.md) |
| Codi | `migration-to-saints/lib/common-office.js` (nou) · `lib/memorial-ferial.js` (`cellsForMode`) · `join-content.test.js` (segona font) · `review/commons-proposal.js` i `review/build-report.js` |
| Test | `migration-to-saints/common-office.test.js` — 14 tests: **la direcció** (el text de cpl-app a la casella ferial i el Comú a la del sant, mai a l'inrevés), la tria del Comú, i **l'estació**, amb el respons pasqual que ha de dur Al·leluia |
| Com es tria el Comú | Per la **cita** de la casella castellana, que identifica la família, i el títol desempata dins seu ([MIGRA-003](#migra-003)) |
| Efecte | Passada sencera (3.250 dates): **11.188 caselles** observades del Comú en 754 hores de memòria. Ids resolts **6.087 → 7.266 (+1.179)**; pendents **771 → 813 (+42)** |
| D'on surt el +1.179 | **+989 del Comú** — sobretot `responsorios` i `preces_contenido`. Els altres **+190** no hi tenen res a veure: són `celebration_names` (+132) i `invitatorios` (+58), que la passada base no duia perquè es va córrer sense aquelles dues Hores. `himnos`, `oraciones_finales` i els tres `salmos_*` no es mouen gens, que és el que ha de passar: el Comú no els toca |
| Els 42 nous conflictes | Cap n'és un id que abans es resolgués. Són caselles que dues celebracions comparteixen volent Comuns diferents — p. ex. `cantico_evangelico_antifonas/1103`, que un prevere i un bisbe es reparteixen i on `antMaria` és l'únic camp que difereix entre `06aO` i `06b/c/dO`. El join els reté, que és el que ha de fer |
| Sense Comú inferit | 2 celebracions: Sant Francesc d'Assís (7 hores) i Naixement de sant Joan Baptista (2). Es queden com estaven |
| El 3-09-2026 | «sense dades» **20 → 1** (només `invitacion_padrenuestro/1111`, que el join no observa per a ningú). Camps amb text català **24/57 → 43/57 (42% → 75%)**. Contingut: segueix **0 divergències** |
| Exportat | Sí: **877 claus noves, 0 modificades** a `saints-app/.../commons/ca/` — vegeu [SA-04](#sa-04) |

### Dos defectes propis, trobats verificant l'exportació abans d'escriure-la

L'assaig d'exportació deia **63 claus que canviarien de valor**. Cap canvi de valor era
esperable —això havia de ser additiu— i mirar-les una a una va destapar dues coses:

**1 · `seasonSuffix()` estava trencat per a totes les estacions.** Provava `/PASQUA/`, `/LENT/`
i `/ADVENT/` contra els codis reals de `SpecificLiturgyTimeType`, que són `P_SETMANES`,
`Q_SETMANES`, `A_SETMANES`, `N_OCTAVA`… Cap no encaixava i **tot queia a temps ordinari**. Ve
heretat de `commons-proposal.js` i era inofensiu mentre només proposava sobre un dia
ordinari; deixa de ser-ho quan el join hi escriu. Es veia a `responsorios/2777` (10 de maig,
temps pasqual): hi posava el respons del Comú de pastors ordinari quan el castellà de la
mateixa casella acaba «Aleluya, aleluya». Corregit amb una taula dels codis de veritat, amb el
cas de `Q_DIUM_PASQUA` —el diumenge de Pasqua, arxivat sota el prefix de Quaresma— explícit.

**2 · El Comú no sempre és el que va a la casella del sant.** L'índex castellà, en alguns dies
de Pasqua, apunta els precs de la memòria a la casella **de l'estació**, la mateixa que fa
servir la fèria (`preces_intro/1218`, «Oremos a Cristo, que resucitado de entre los muertos…»,
24 hores-dia). Hi ha un primer filtre —no escriure quan en castellà les dues pestanyes diuen
el mateix, 13 casos— però no ho enxampa tot: `preces_contenido/9519-9523` són els precs
eucarístics del dijous i el castellà els conserva.

Per això el Comú és **additiu i prou**: pot omplir una casella buida, mai canviar-ne una que
ja tingui text català. La regla habitual del join —guanya el nostre, que ha passat el
«totes les observacions coincideixen»— no val aquí, perquè cpl-app no renderitza mai aquestes
caselles i el Comú és l'única veu de la sala. Les **49 caselles on discrepa** queden a
`output/export-common-held.json` amb el text conservat i el que proposava el Comú, per
mirar-les una a una. N'hi ha de les dues menes: `responsorios/2789` és una **correcció de
veritat** (el castellà diu «Que todos los pueblos proclamen la sabiduría de los santos» i el
català desat deia «Sobre teu, Jerusalem»), i `preces_contenido/9519` seria un **error**.

**La revisió no ho compta com a divergència, i no per casualitat**: l'eix de contingut compara
cpl-app contra la casella on va el seu text, que és la ferial (`fromFerial`), i el Comú va a
la del sant, que aquell eix no mira mai. L'informe ara ho diu en veu alta a cada dia de
memòria en lloc de callar-ho.

## MIGRA-002

**L'empremta de cites llegia l'ordinal del llibre com si fos el capítol** · 3 de setembre de 2026

`fingerprint()`, que contesta «les dues apps citen la mateixa lectura?», treia el capítol
esborrant el que hi hagués abans de la primera xifra. Amb un llibre que comença per ordinal no
esborra res, i el capítol que en surt és l'ordinal: `1Pe 5, 1-4` i `1Pe 1, 22-23` donaven totes
dues `1PET|1`. **Un detector que no detectava**: dues lectures diferents comparaven iguals i el
dia sortia net.

| | |
|---|---|
| Dossier | [migration-to-saints/tooling-bugs/MIGRA-002.md](migration-to-saints/tooling-bugs/MIGRA-002.md) |
| Fix | `migration-to-saints/lib/citation-key.js` — el nom del llibre es talla amb el mateix patró amb què `bookKey()` el reconeix |
| Test | `migration-to-saints/citation-key.test.js` — sense el pedaç en cauen 3 de 7 |
| Abast | 225 de les 1.179 cites de l'índex castellà comencen per ordinal; **52 capítols** de 11 llibres quedaven reduïts a 11 empremtes (13 de 1 Corintis, 9 de 2 Corintis, 5 de 1 Pere…) |
| De passada | `stripMarkup`, `bareReference`, `bookKey` i `fingerprint` surten de `review/build-rows.js` —que s'autoexecuta i no exportava res— cap a `lib/citation-key.js`, i ara les comparteixen la revisió i la proposta del Comú |
| Efecte | El 3-09-2026 no canvia (la casella comparada per cita era `Ap 11`, sense ordinal). Les revisions anteriors **no** s'han tornat a passar |

## MIGRA-003

**La proposta del Comú triava el Comú pel títol i desquadrava les llistes** · 3 de setembre de 2026

Dos errors a `commons-proposal.js`, tots dos visibles el mateix dia. Amb sant Gregori «papa i
**doctor** de l'Església», l'heurística del títol agafava el Comú de doctors quan la casella
castellana germana diu, amb la cita, que és el de pastors — i els 10 responsoris del dia
sortien mal proposats. I la posició dins d'una llista es comptava en lloc de llegir-se, de
manera que una casella ja plena al mig feia lliscar totes les de darrere: a la 6/6 del
responsori hi anava a parar el «Glòria al Pare» de la 5/6.

| | |
|---|---|
| Dossier | [migration-to-saints/tooling-bugs/MIGRA-003.md](migration-to-saints/tooling-bugs/MIGRA-003.md) |
| Fix | `migration-to-saints/review/commons-proposal.js` — `pickCommonRow()`: la cita tria la família del Comú i el títol desempata dins seu; i cada casella agafa la seva posició del camp `index` |
| Depèn de | [MIGRA-002](#migra-002): amb la comparació de cites pròpia que hi havia, `He` (ca) i `Hb` (es) no eren el mateix llibre i la prova no disparava mai |
| Prova | Les 10 caselles de responsori del 3-09-2026 encaixen una a una amb el castellà, i el Comú triat passa de `07aO` a `06cO` |
| Efecte | La proposta del dia passa de 19 caselles amb el Comú equivocat a 19 amb el bo. No s'ha aplicat res a saints-app |

<a id="migra-004"></a>
## MIGRA-004

**A les memòries d'ofici propi, el text ferial de cpl-app s'arxiva a la casella del Comú** · 3 de setembre de 2026 · **obert**

| | |
|---|---|
| Component | `migration-to-saints/lib/memorial-ferial.js` · `hasSwitch()` |
| Gravetat | Mitjana. No escriu res de dolent —les caselles queden retingudes, no mal omplertes— però les reté per sempre |
| Estat | **Corregit** el 3 de setembre de 2026, el mateix dia que es va trobar |
| Decisió que l'empara | [D-002](#d-002) · [dossier](migration-to-saints/decisions/D-002-el-comu-als-oficis-propis.md) |
| Símptoma | `hasSwitch()` només reconeix els cicles `MEMORY_FERIAL1` i `MEMORY_FERIAL2`. Les celebracions amb cicle `MEMORY_PROPER` no hi entren, i com que allà saints-app no té pestanya ferial (`LaudesPage.vue:576`, `cycle !== "MEMORY_PROPER"`), `cellPair()` retorna `[own, null]` i el text ferial de cpl-app va a parar a la casella del sant, on hi viu el Comú |
| Quantes són | **6** a `dev`: Agnès, Àngels Custodis, Martí de Tours, Mare de Déu dels Dolors, Mare de Déu del Roser, Martiri de sant Joan Baptista. Eren 7: Basili i Gregori Nazianzè —l'exemple amb què es va trobar— **els va reclassificar eprex a `MEMORY_FERIAL2`**, cosa que no es va veure fins a portar `dev` ([SA-06](#sa-06)) |
| Prova | `lectura_breve_citas/66` i `/3355` les comparteixen el 2 de gener (Basili i Gregori Nazianzè) i el 3 de setembre (Gregori el Gran). Totes dues són del Comú de pastors, i el castellà de les dues caselles diu exactament `Hb 13, 7-9a` i `1 P 5, 1-4` — o sigui que l'índex d'eprex és correcte. Qui hi posa `Is 49, 8-9` i `Col 1, 13-15` (la fèria de Nadal) som nosaltres, i les 9 i 8 dates que discrepen són **tots 2 de gener** |
| Fix | `lib/memorial-ferial.js` → `isProperOnly()` · `lib/common-office.js` → `commonOverrides()` · `join-content.test.js`, on el Comú passa **abans** que `observeHour` i el que es queda decideix què no s'observa |
| La guarda | El Comú només es queda un camp si la cita de la lectura breu **castellana** nomena la seva família (`pickedBy` = `citation` o `title+citation`). Si el castellà hi dugués la lectura de la fèria, cap família no encaixaria i el dia es quedaria com estava. I només els set camps del pou: **els salms i l'himne no s'hi toquen** |
| Test | `migration-to-saints/common-office.test.js` — 6 tests nous (20 en total). Detector comprovat: treure la guarda de la cita fa caure «no pren res si la cita castellana no nomena cap Comú» |
| Efecte | Mesurat sobre l'índex de `dev` amb la sonda refeta, corrent el join amb el pedaç i sense: ids resolts **7.179 → 7.188**, pendents **791 → 782**. Comú observat: 10.793 → **10.896** caselles, en 729 → **745** hores. Els **9 ids** són tots `preces_contenido` de **sant Martí de Tours** (`2264`-`2267` a Laudes, `7273`-`7277` a Vespres) |
| Compte | Els guanys grossos del dia —el 3-09 passa de 43/57 a **53/57** i de 13 conflictes a **3**— són sobretot de [SA-06](#sa-06) i de la sonda refeta, **no** d'aquest fix |
| Exportat | Sí — vegeu [SA-05](#sa-05) |

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

# Propostes a eprex (pendents)

Troballes que són **error de saints-app/eprex**, no nostres. No les apliquem: es proposen, i
qui decideix és eprex. Van a `migration-to-saints/eprex-bugs/`.

<a id="eprex-001"></a>
## EPREX-001

**El 2 de novembre, saints-app resa el diumenge en comptes de l'Ofici de Difunts** · 3 de setembre de 2026

A la Commemoració de tots els fidels difunts, la fitxa de saints-app dona la salmòdia del
Diumenge XXXI del temps ordinari, amb antífones acabades en «Aleluya» — a Laudes i a Vespres.
La fitxa és idèntica a la del diumenge en 16 dels 20 camps: es va clonar d'allà. Afecta
**totes les llengües**, castellà inclòs.

| | |
|---|---|
| Dossier | [migration-to-saints/eprex-bugs/EPREX-001.md](migration-to-saints/eprex-bugs/EPREX-001.md) |
| Estat | **Enviat a en Fernando el 3-09-2026, pendent de resposta** |
| Fix | Cap encara. És repunteig d'ids a `all_visperas.json` i `all_laudes.json`; no cal contingut nou |
| Prova | La fitxa és una còpia del diumenge · el 2026-11-02 és dilluns i tampoc és la fèria · el botó d'Ofici de Difunts de la mateixa app ja porta el text bo · les antífones `10964`/`10965`/`10966` són òrfenes |
| Efecte a la migració | Desbloquejaria `salmos_citas/11025` i companyia. Però ens obrirà un conflicte nou a `salmos_antifonas/906` — vegeu el dossier |

Quan respongui: si diu que sí, cal **tornar a passar la sonda** abans del join, perquè el join
escriu on la sonda mesura, no on ho diu l'índex.

<a id="eprex-002"></a>
## EPREX-002

**El 31 de maig, saints-app resa a Vespres l'ofici de l'Ascensió en comptes del de la Visitació** · 3 de setembre de 2026

L'entrada `visitation_of_mary__ANY` de `all_visperas.json` és idèntica a
`ascension_of_the_lord_1v__ANY` —les I Vespres de l'Ascensió— en **16 dels 20 camps**, i el
respons i els precs dels que resten també són de l'Ascensió amb ids diferents. L'única peça
pròpia de la festa és l'oració final. Afecta **totes les llengües**, castellà inclòs. Laudes del
mateix dia és correcte: el defecte és d'una sola entrada.

| | |
|---|---|
| Dossier | [migration-to-saints/eprex-bugs/EPREX-002.md](migration-to-saints/eprex-bugs/EPREX-002.md) |
| Estat | **Proposat, pendent d'enviar.** El missatge per a en Fernando és al final del dossier, en castellà |
| Fix | Repunteig d'ids a `all_visperas.json`, entrada `visitation_of_mary__ANY`. Dues antífones sí que demanen contingut nou |
| Prova | La fitxa és una còpia de les I Vespres de l'Ascensió (16/20 camps idèntics), i cap dels 8 anys no és una Ascensió · l'Assumpció i el Roser ja apunten al Comú de la Mare de Déu (`4577`/`3424`/`11042`) i la Visitació és l'única mariana que no · Al·leluia en temps ordinari (31-05 de 2021, 2022 i 2024) · les antífones bones `11021` i `840` són **òrfenes**, com les `10964`-`10966` d'EPREX-001 |
| Efecte a la migració | Desbloqueja `salmos_citas/11030`, `salmos_antifonas/9253` i `salmos_textos/11031` — 235 dies del manifest. Es veu el 3-09-2026 |

Com a EPREX-001: si s'accepta, cal **tornar a passar la sonda** abans del join.

<a id="eprex-003"></a>
## EPREX-003

**Sants Innocents porta a Vespres la salmòdia de les I Vespres** · 4 de setembre de 2026

`holy_innocents_martyrs__ANY` duu `primer_salmo_cita = 11031` (Salm 112) i `segundo_salmo_cita =
155` (Salm 147) — la parella de **I Vespres**. Les seves dues germanes de l'octava, sant Esteve i
sant Joan, duen `11025` (Salm 109) i `54` (Salm 129). Afecta **totes les llengües**.

| | |
|---|---|
| Estat | **Proposat, pendent d'enviar** |
| Entrada | `holy_innocents_martyrs__ANY` (i el seu bessó `christmas_octave_day_4__ANY`, que és el mateix dia i té el mateix contingut) |
| Fix | `primer_salmo_cita`/`_texto` `11031`/`11032` → **`11025`/`11026`** · `segundo_salmo_cita`/`_texto` `155`/`156` → **`54`/`55`** · `tercer_salmo_cita`/`_texto` `11042`/`11043` → **`11072`/`11073`** |
| Prova interna | Sant Esteve (26-XII) i sant Joan (27-XII), les dues festes germanes de la mateixa octava i del mateix rang, porten `11025`+`54`+`11072`. Sants Innocents és l'única de les tres que no |
| Per què només es veu alguns anys | Quan el 29 de desembre és la Sagrada Família, la tarda del 28 **sí** que són I Vespres i la fitxa encerta —cpl-app hi dona Salm 112 · Salm 147 el 2024. Els anys en què el 29 és fèria de l'octava (2021, 2022, 2023, 2026) toquen les II Vespres de la festa i cpl-app dona Salm 109 · Salm 129 |
| Efecte a la migració | És **l'únic** que reté ara `salmos_citas/155` i `salmos_textos/156`: 176 dies hi volen el Salm 147 i 7 el Salm 129. Desbloquejant-ho, el **4-IX-2026 arriba al 100%** |

**El 31 de desembre NO s'ha de tocar.** `christmas_octave_day_7__ANY` duu la mateixa parella
`11031`+`155`, però allà és **correcta**: és la vigília de Santa Maria Mare de Déu i toquen I
Vespres. cpl-app hi dona Salm 112 · Salm 147, igual que l'app, tots els anys del manifest.

Mateixa forma que [EPREX-001](#eprex-001) i [EPREX-002](#eprex-002): una fitxa amb el contingut
d'un altre ofici. Com sempre, si s'accepta cal **tornar a passar la sonda** abans del join.

# Qüestions tancades sense canvi

Preguntes que semblaven un error i, investigades a fons, **no ho eren**. Hi són perquè el cost
de tornar-les a obrir d'aquí a tres mesos és més alt que el d'aquestes deu línies. Van a
`migration-to-saints/decisions/`.

<a id="d-001"></a>
## D-001

**El Comú a les memòries: `Categoria = '0000'` no és un error de cpl-app** · 3 de setembre de 2026

Les 527 files de `santsMemories` tenen `Categoria = '0000'`, i 508 diuen `-` («del Comú») a la
lectura breu, el responsori i els precs. Com que
[`LiturgyMastersService.tsx:745`](src/Services/Liturgy/LiturgyMastersService.tsx#L745) descarta
el `'0000'`, cpl-app no va mai a `OficisComuns` i resa la fèria. Semblava un forat de dades de
508 files. **No ho és.**

| | |
|---|---|
| Dossier | [migration-to-saints/decisions/D-001-el-comu-a-les-memories.md](migration-to-saints/decisions/D-001-el-comu-a-les-memories.md) |
| Veredicte | **4 — no és error.** Cap canvi a cpl-app ni a la base de dades |
| Prova | **OGLH 235b**: la lectura breu, les antífones i els precs, si no són propis, «se tomarán **del Común o de la feria correspondiente**» — les dues opcions són lícites · i `liturgiadeleshores.cat`, la font catalana oficial, resa **la fèria** el 3-09-2026, amb els precs de Vespres iguals als de cpl-app paraula per paraula |
| Per contrast | El castellà (`idteologia`) i l'anglès (`universalis`) sí que prenen el Comú. És una **diferència d'ús entre edicions**, no un error de ningú |
| Efecte a la migració | Les ~19 caselles buides per dia de memòria **no** es desbloquegen tocant la base de dades. Si s'han d'omplir, és fent que el join culli `OficisComuns` per a la pestanya del sant de saints-app — decisió de saints-app, no de cpl-app |

De passada en van sortir dues coses. Que **cpl-app és més correcte que la font de referència**
a les antífones del Benedictus i del Magníficat: l'OGLH 235b les fa obligatòries si són
pròpies, sant Gregori en té, i `liturgiadeleshores.cat` hi posa les del saltiri. I que, si mai
es culla el Comú, **s'ha de triar per la cita de la casella castellana i no pel títol** de la
memòria: amb sant Gregori, «papa i doctor» fa que l'heurística del títol agafi el Comú de
doctors quan la cita (`Hb 13, 7-9a`) diu que és el de pastors.

<a id="d-002"></a>
## D-002

**Als set dies d'ofici propi, el català de saints-app resa el Comú i perd la fèria** · 3 de setembre de 2026

Set memòries —Agnès, Basili i Gregori Nazianzè, els Àngels de la Guarda, Martí de Tours, la
Mare de Déu dels Dolors, la Mare de Déu del Roser i el Martiri de sant Joan Baptista— tenen
cicle `MEMORY_PROPER` i **no duen pestanya ferial**: la casella del sant i la de la fèria són
la mateixa. Allà el Comú i el text ferial de cpl-app no es reparteixen res, competeixen, i la
casella es quedava buida en català.

| | |
|---|---|
| Dossier | [migration-to-saints/decisions/D-002-el-comu-als-oficis-propis.md](migration-to-saints/decisions/D-002-el-comu-als-oficis-propis.md) |
| Decidit | En Pau, el 3-09-2026: **el català imita el criteri litúrgic d'eprex**; cpl-app no es toca |
| Conseqüència que consta | Aquells set dies l'usuari català de saints-app **no podrà arribar a l'ofici ferial de cap manera**. Qui el vulgui l'ha de resar a cpl-app |
| Per què és lícit | OGLH 235b, «del Comú **o** de la fèria». És el que ja fa el castellà avui |
| Límits | Només els set camps del pou del Comú —**els salms i l'himne no s'hi toquen** (OGLH 235a)— i només si la cita castellana nomena la família del Comú |
| Codi | [MIGRA-004](#migra-004) · exportació [SA-05](#sa-05) |

Va en la mateixa direcció que la [D-001](#d-001), però sense xarxa: allà la fèria era a un toc
de distància, i aquí no hi és.


<a id="d-003"></a>
## D-003

**L'antífona del càntic Ap 15 dels divendres: el català diu el vers 3a i les altres llengües el
3b — i el català és correcte** · 4 de setembre de 2026

Revisant el 4 de setembre (divendres, setmana II del salteri), l'antífona 3 de Vespres, davant
del càntic `Ap 15, 3-4`, va semblar un error de cpl-app. Diu «Les vostres obres són grans i
admirables, oh Rei de tots els pobles» — **Ap 15, 3a**, el primer hemistiqui del càntic mateix —
i el castellà, l'anglès i l'italià hi porten tots tres el **3b**. **No és un error.**

| | |
|---|---|
| Veredicte | **4 — no és error.** Cap canvi a cpl-app ni a la base de dades |
| Prova | **El volum imprès.** En Pau ho ha comprovat al **volum III** de la Litúrgia de les Hores del CPL: Salteri, setmana II, divendres, Vespres, l'antífona 3 diu paraula per paraula el que diu l'app. I la setmana IV (Salm 144 I i II) també |
| Per contrast | Castellà «Justos y verdaderos son tus caminos, ¡oh Rey de los siglos!» · anglès «King of all the ages, your ways are perfect and true» · italià «Giuste e vere sono le tue vie, o Re delle genti». És una **diferència d'edició**, no un error de ningú — el mateix cas que [D-001](#d-001) |
| Efecte a la migració | Cap. Les 75 dates de `salmos_antifonas/9340` i `/9256` es desbloquegen soles quan es corregeixi la **F8** (`migration-to-saints/review/findings.js`; encara sense fitxa aquí): el conflicte no el causa el text, sinó que el 3 i el 4 de gener —salteri de la **setmana I**— cauen a la casella de les setmanes II/IV |

**El que va fallar en la investigació.** El llistó de la revisió és «fonts externes en 2-3
idiomes», i aquí **tres llengües coincidien i el català continuava tenint raó**. Hi havia dos
indicis que semblaven prova interna i no ho eren: que cpl-app encerta les setmanes I i III (que
és cert, però només vol dir que allà les edicions coincideixen), i que l'antífona sembla un
retall del cos del càntic de la mateixa fila (que és una coincidència de la traducció, no una
petjada de transcripció). **Per a la redacció d'un text català, la concordança entre llengües no
és prova de res**: només ho és el volum imprès. Apuntat al parany 7 de la skill `revisio-dia`.


# Canvis a saints-app

Repositori `Saints-App/saints-app`. Aquí no hi hem corregit cap error litúrgic: el que hi hem
fet és **posar-hi el català**.

<a id="sa-01"></a>
### SA-01 · El català com a idioma seleccionable · 2026-08-11
`2d3772d5f` — [GitHub](https://github.com/Saints-App/saints-app/commit/2d3772d5f712bcb28c1f190cb037ca1778ee5b04) · 6 fitxers

<a id="sa-02"></a>
### SA-02 · Primera exportació dels textos catalans (`commons/ca`) · 2026-08-11
`abc5c1caf` — [GitHub](https://github.com/Saints-App/saints-app/commit/abc5c1cafbda8f9ec31bfe42cd01cb412081fd7f) · 14 fitxers, 5.016 línies

<a id="sa-04"></a>
### SA-04 · El Comú dels sants, en català, a la pestanya del sant · 2026-09-03
Sense committejar encara. **877 claus noves, 0 modificades** a `commons/ca/`: `preces_contenido`
+424, `responsorios` +421, `cantico_evangelico_antifonas` +18, `lectura_breve_*` +5 cadascun,
`preces_intro`/`preces_respuesta` +2. Generat per [EINA-comu](#eina-comu); escrit amb
`node migration-to-saints/export-to-saints-app.js`. **El català se separa aquí de cpl-app a
posta** — decisió [D-001](#d-001).

<a id="sa-05"></a>
### SA-05 · Reexportació sobre l'índex de `dev` · 2026-09-03
Sense committejar encara, i **damunt de la mateixa feina sense committejar de [SA-04](#sa-04)**.
**25 claus noves, 1 actualitzada**: `himnos` +13, `salmos_citas` +3, `salmos_antifonas` +2,
`salmos_textos` +2, i +1 a `cantico_evangelico_antifonas`, `lectura_breve_citas`,
`lectura_breve_textos`, `preces_intro` i `preces_respuesta`.

L'única «actualitzada» és `salmos_textos/3424`, i **és només de blancs**: `textKey()` diu que és
el mateix text. Ha canviat el representant perquè, amb la sonda refeta, les observacions són unes
altres.

Recull el merge de [SA-06](#sa-06), la sonda refeta i [MIGRA-004](#migra-004). Els sis dies
d'ofici propi **perden l'ofici ferial** dins de saints-app, que és el que diu la decisió
[D-002](#d-002).

<a id="sa-06"></a>
### SA-06 · `dev` entra a la branca catalana · 2026-09-03
`1a35a54a6` — merge de `origin/dev` (100 commits) a `catalan-language-support-dev`. HEAD d'abans:
`53a1c84a2`, per si cal desfer.

**Per què calia.** La branca anava 100 commits enrere i l'índex s'havia mogut molt: **30 claus
`_1v` fora**, **31 entrades de Laudes i 35 de Vespres amb una casella base repuntada**, i 8
passades `chore(texts)` d'eprex. La sonda (`app-cell-map.json`) era del **12 d'agost**: el join
escriu on la sonda diu que l'app llegeix, o sigui que estàvem escrivint contra un índex vell.

| | |
|---|---|
| El canvi gros | PR #1694 (`1582-fix-1v`): les Primeres Vespres deixen de ser una clau `<celebració>_1v__ANY` i passen a camps `*_PrimerasVisperas` dins de l'entrada de la celebració |
| Ens afecta el codi? | **No.** Cap eina nostra no depèn de `_1v`, i el manifest de litcal en té zero |
| Conflicte | Un: `LanguageSelectionModal.vue`, que nosaltres havíem tocat a [SA-01](#sa-01) i `dev` esborra. Resolt **a favor de `dev`**: el substitueix `OnboardingLanguageStep.vue`, que recorre `AVAILABLE_LANGUAGES`, i el català hi és perquè `constants/languages.ts` s'ha fusionat sense conflicte. SA-01 sobreviu al refactor sense tocar res |
| Cura | L'override local `"@saints-app/litcal": "file:../litcal"` es va desar a l'stash abans del merge i recuperar després. `textsBaseVersion` passa a `20260901-200603` |
| Conseqüència | Cal **tornar a passar la sonda i el join**, i tornar a mesurar [MIGRA-004](#migra-004) |

**El que això va canviar de la feina del mateix dia:** a `dev`, `basil_the_great_and_gregory_nazianzen_bishops`
ja **no és `MEMORY_PROPER`** sinó `MEMORY_FERIAL2` — eprex l'ha reclassificat. El 2 de gener,
doncs, ja té pestanya ferial. MIGRA-004 segueix fent falta (queden **6** celebracions
`MEMORY_PROPER`, no 7), però l'exemple amb què es va trobar ja no val i els números s'han de
refer.

<a id="sa-09"></a>
### SA-09 · Les I Vespres desplaçaven dies que les superen · 2026-09-04

`8a80e393c` — `visperasStore` passava a I Vespres **sempre que l'endemà era solemnitat**, sense
mirar el rang del dia d'avui:

```js
changeTo1v.value = liturgicalDayTomorrow?.rank === "SOLEMNITY" || …
```

L'OGLH 61: quan coincideixen les II Vespres del dia i les I Vespres de l'endemà, es resen les
del dia de **rang més alt**. Els diumenges d'Advent, Quaresma i Pasqua (`PRIVILEGED_SUNDAY_2`)
van per davant de les solemnitats generals (`GENERAL_SOLEMNITY_3`).

| | |
|---|---|
| Fix | `src/utils/firstVespers.ts` compara la precedència amb `PRECEDENCE_ORDER` de litcal en comptes del rang a pèl. Els tres casos especials que hi havia a mà (Sagrada Família, IV d'Advent, II després de Nadal) es mantenen com a dies que **tenen** I Vespres; el que s'hi afegeix és que l'endemà superi avui de debò |
| Test | `tests/unit/utils/firstVespers.spec.ts`, 7 tests. **És detector**: treient la comparació de precedència, en fallen 2 |
| Abast | **94 dates** del manifest |

**Prova externa**, dues dates del cas que es va veure primer:

- **7-XII-2025**, diumenge II d'Advent, vigília de la Immaculada → *Salmo 109 · Salmo 113 ·
  Ap 19, 1-7*, les II Vespres del diumenge. L'app hi resava *Salmo 112 · Salmo 147*, les I
  Vespres de la solemnitat.
  <https://apps.idteologia.org/index.php?fecha=2025-12-07&r=liturgiaDeLasHoras%2Fespanola&rezo=visperas>
- **24-III-2019**, diumenge III de Quaresma, vigília de l'Anunciació → *Salmo 109 · Salmo 110 ·
  1 Pe 2, 21b-24*.
  <https://apps.idteologia.org/index.php?fecha=2019-03-24&r=liturgiaDeLasHoras%2Fespanola&rezo=visperas>

**Cura: el canvi és més ample del que semblava.** Les dues dates externes només cobreixen 9 de
les 94. Les altres 85 són l'octava de Pasqua (50), solemnitat contra solemnitat com Tots Sants i
els Fidels Difunts (11), el Tridu (20) i l'Epifania contra el Baptisme (2) — casos on els dos
dies **empaten** en precedència i, per tant, es resen les II Vespres del dia. Verificat amb la
prova interna forta: resondejades les 94 dates i contrastats els salms 1 i 2 de Vespres contra
cpl-app, **de 160/188 coincidències es passa a 188/188, zero divergències**.

| | abans | després |
|---|---|---|
| Vespres de les 94 dates, contra cpl-app | 160 de 188 | **188 de 188** |
| Caselles retingudes al join | 674 | **600** (−74, cap de nova) |
| Exportació | — | +58 claus, 0 actualitzades |

<a id="sa-08"></a>
### SA-08 · Del 2 al 5 de gener el salteri anava una setmana enrere · 2026-09-04

`dae46844b` — la troballa **F8** de la revisió, corregida. Advent (17-24 de desembre) i temps de
Nadal (2-5 de gener) no tenen salmòdia pròpia: prenen la del dia corresponent del salteri, que
l'índex desa sota ids `ordinary_time_{setmana}_{dia}`. En construir aquest id, els **sis stores**
—Laudes, Vespres, Ofici de lectura, Tèrcia, Sexta i Nona— hi afegien 3 a la setmana dins del
temps de Nadal:

```js
if (seasons.includes("CHRISTMAS_TIME")) weekNumber = weekNumber + 3
```

| | |
|---|---|
| Què era | Un pedaç per a un error de romcal que reportava la setmana una de menys |
| Per què fallava | `+3` és `−1` en **mòdul 4**: restava una setmana sencera. I romcal ja no té aquell error, o sigui que el pedaç havia passat a ser el bug |
| Abast | **29 de les 40 dates** de 2-5 de gener del manifest, a **totes les hores** i en **totes les llengües**. Les 11 restants no és que estiguessin bé: són els 6 divendres (el Salm 50 és igual les quatre setmanes) i els 5 diumenges |
| Fix | La lògica, que era la mateixa copiada sis vegades —que és com el pedaç s'hi va propagar—, viu ara a `src/utils/psalterWeek.ts`. Els sis stores hi criden `ordinaryTimeIdFor()` |
| Test | `tests/unit/utils/psalterWeek.spec.ts`, 9 tests. **És detector**: tornant a posar el `+3`, en fallen 6 |

**Prova**, tres fonts independents:

- **romcal no s'equivoca.** `lit.resolveDay()` sobre `diocese-barcelona`: `liturgy.psalterWeek`
  coincideix amb la salmòdia de cpl-app a **40 de 40** dates. Zero discrepàncies.
- **Castellà, data exacta.** El 5-I-2026, dilluns, Laudes obre amb el *Salmo 41* «Como busca la
  cierva corrientes de agua» — setmana II. L'app hi resava el Salmo 5, de la setmana I.
  <https://apps.idteologia.org/index.php?fecha=2026-01-05&r=liturgiaDeLasHoras%2Fespanola&rezo=laudes>
- **L'altre grup d'anys.** El 2-I-2025 s'encapçala «2 de enero, jueves, **1ª semana**»; l'app hi
  resava la IV.

**Cura amb la regressió no evident.** En treure el bloc, `dayIndex` deixava d'existir a Laudes i
Vespres, on el feia servir el bloc de les antífones pròpies del 17 al 23 de desembre, més avall
dins del mateix `if`. Ho va agafar l'eslint; ara es declara al bloc que el necessita. Els 10
tests que fallen a la suite de saints-app ja fallaven abans (`findOfficeDeceased`,
`bible-parallels-integrity`, `calendarLanguageRestrictions`) i no toquen cap store.

**Sonda i join, refets el mateix dia.** Les caselles que l'app llegeix del 2 al 5 de gener
canvien de lloc, o sigui que calia tornar-hi. Com que el `+3` només s'aplicava dins de
`CHRISTMAS_TIME`, els dies d'Advent (17-24 de desembre) no s'havien mogut i **només calia
resondejar les 40 dates de 2-5 de gener**: tretes del mapa, el mode `--range` les torna a fer i
deixa les altres 3.611 quietes. 40 dates, 0 errors, `commons/ca` restaurat.

| | abans | després |
|---|---|---|
| 1r salm de Laudes, sonda contra cpl-app | 11 de 40 | **40 de 40** |
| Caselles retingudes al join | 766 | **674** (−92, cap de nova) |
| Exportació a `commons/ca` | — | +55 claus noves, 0 actualitzades (`salmos_antifonas` +19, `salmos_citas` +19, `salmos_textos` +17) |
| 4-IX-2026 | 95% · 3 retingudes | **96% · 2** — la casella de Vespres `salmos_antifonas/9340` s'ha resolt |
| 17-IX-2026 | — | **95% · 3** — les que queden són les de [EPREX-002](#eprex-002) i `preces_respuesta/77` |

<a id="sa-07"></a>
### SA-07 · La invitació al Parenostre, en català · 2026-09-04

`commons/ca/invitacion_padrenuestro.json` passa de **26 entrades a 51**. Les 26 que hi havia
cobrien les caselles de Laudes; faltaven totes les de Vespres. Amb les 25 noves, les **51
caselles en ús** queden cobertes i els **6.324 oficis** del manifest tenen la invitació en
català.

| | |
|---|---|
| Fitxer | `src/store/db/day_specific_texts/commons/ca/invitacion_padrenuestro.json` (branca `catalan-language-support-dev`) |
| Font | **Traducció del castellà**, com les 26 que ja hi havia. Reutilitza les fórmules ja fixades al fitxer: `ens atrevim a dir`, `ens va ensenyar el Senyor`, `acudim`, `amb confiança` |
| Efecte mesurat | El 4-IX-2026 puja de **93% a 95%** i `missing` passa d'1 a 0. Les 3 caselles que hi queden són de la **F8** (`review/findings.js`), no d'aquí |
| Es regenera? | **No.** Aquest fitxer es manté a mà: el join no observa mai aquesta taula |

**Per què no surt de cpl-app**, que sí que té el text i complet. cpl-app duu la invitació al
final del camp `pregaries` —811 files, totes a l'últim renglò, zero excepcions— però en té
**234 de diferents**, i l'índex de saints-app només té **53 caselles**. Comprovat: 14 dies que
comparteixen la casella `invitacion_padrenuestro/1098` porten **13 invitacions catalanes
diferents** a cpl-app. No hi caben. Per això el join la deixa expressament de banda
(`lib/cpl-day-resolver.js:91`, `lib/common-office.js:155`).

**El peatge, acceptat conscientment.** L'edició castellana reaprofita ~53 invitacions per a tot
l'any; la catalana en canvia gairebé cada dia. O sigui que a saints-app la invitació **no serà
la que el volum català porta aquell dia**. És el mateix tipus de diferència que [D-001](#d-001)
i [D-003](#d-003), però aquí escollida per nosaltres: és l'única cosa que cap a l'índex. Si
algun dia es vol el text autèntic, cal que eprex admeti la invitació per dia — canvi de model,
com la proposta de I Vespres de [F5](#eprex-002).

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
