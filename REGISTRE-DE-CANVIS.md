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

Els commits de cpl-app són a `origin`, a la branca `catalan-migration` (pujada el 29-9-2026), i
els seus enllaços de GitHub funcionen; els de litcal, a `catalan-calendars`. Els de saints-app, a la
branca `catalan-language-support-dev` de `Saints-App/saints-app`, pujada per primer cop el 30-9-2026
(fins a `fdbcaaaf5`).

---

## Taula mestra

| ID | Data | On | Tipus | Cal reaplicar-ho? | Commit |
|---|---|---|---|---|---|
| [APP-001](#app-001) | 2026-09-21 | cpl-app | **actualització** (Expo 51 → 57) | No — va al git | branca `upgrade-expo-57`, local |
| [CPL-LIT-001](#cpl-lit-001) | 2026-08-14 | cpl-app | codi | No — va al git | `cdc8c79`; a `master`, `2514944` |
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
| [EPREX-001](#eprex-001) | 2026-09-03 | saints-app | **acceptat i aplicat** | Salmòdia feta; 2a ronda pendent | `43a319267` |
| [EPREX-002](#eprex-002) | 2026-09-03 | saints-app | **proposat** | — pendent d'enviar | — |
| [EPREX-003](#eprex-003) | 2026-09-04 | saints-app | **proposat** | — pendent d'enviar | — |
| [EPREX-004](#eprex-004) | 2026-09-08 | saints-app | **proposat** | — pendent d'enviar | — |
| [MIGRA-004](#migra-004) | 2026-09-03 | eines | codi | No — va al git | — |
| [MIGRA-005](#migra-005) | 2026-09-04 | eines | codi | No — va al git | — |
| [MIGRA-006](#migra-006) | 2026-09-07 | eines | codi | No — va al git | `5ab407c` |
| [SA-05](#sa-05) | 2026-09-03 | saints-app | contingut | Es regenera | — |
| [SA-06](#sa-06) | 2026-09-03 | saints-app | merge | No — va al git | `1a35a54a6` |
| [SA-07](#sa-07) | 2026-09-04 | saints-app | contingut | No — va al git | — |
| [SA-08](#sa-08) | 2026-09-04 | saints-app | **codi** | No — va al git | `dae46844b` |
| [SA-09](#sa-09) | 2026-09-04 | saints-app | **codi** | No — va al git | `8a80e393c` |
| [SA-10](#sa-10) | 2026-09-07 | saints-app | contingut | Es regenera | — |
| [EINA-hores](#eina-hores) | 2026-09-07 | eines | codi | No — va al git | `273a947` |
| [SA-11](#sa-11) | 2026-09-07 | saints-app | contingut | Es regenera | — |
| [EINA-completes](#eina-completes) | 2026-09-07 | eines | codi | No — va al git | `0c31f83` |
| [SA-12](#sa-12) | 2026-09-07 | saints-app | contingut | Es regenera | — |
| [D-004](#d-004) | 2026-09-07 | — | **decisió oberta** | — decideix en Pau | — |
| [EINA-ofici](#eina-ofici) | 2026-09-07 | eines | codi | No — va al git | — |
| [SA-13](#sa-13) | 2026-09-07 | saints-app | contingut | Es regenera | — |
| [D-005](#d-005) | 2026-09-07 | — | **decisió oberta** | — decideix en Pau | — |
| [EINA-missa](#eina-missa) | 2026-09-08 | eines | codi | No — va al git | — |
| [SA-14](#sa-14) | 2026-09-08 | saints-app | contingut | Es regenera | — |
| [D-006](#d-006) | 2026-09-08 | saints-app | **decisió en part** (4 de 14, el 30-9) | Es regenera: `static-translations/lecturas_referencia.ca.json` | saints-app `d66683b08` |
| [MIGRA-007](#migra-007) | 2026-09-08 | eines | codi | No — va al git | — |
| [MIGRA-008](#migra-008) | 2026-09-08 | eines | codi | No — va al git | — |
| [MIGRA-009](#migra-009) | 2026-09-08 | eines | codi | No — va al git | — |
| [MIGRA-010](#migra-010) | 2026-09-08 | eines | codi | No — va al git | — |
| [MIGRA-011](#migra-011) | 2026-09-08 | eines | codi | No — va al git | — |
| [D-007](#d-007) | 2026-09-08 | — | **decisió oberta** | — decideix en Pau | — |
| [EPREX-005](#eprex-005) | 2026-09-08 | saints-app | **proposat** | — pendent d'enviar | — |
| [SA-15](#sa-15) | 2026-09-08 | saints-app | contingut | Es regenera | — |
| [EINA-revisio-dia](#eina-revisio-dia) | 2026-09-14 | eines | codi | No — va al git | — |
| [MIGRA-012](#migra-012) | 2026-09-25 | eines + cpl-app | codi | No — va al git | — |
| [CPL-LIT-001b](#cpl-lit-001b) | 2026-09-25 | cpl-app | codi (**recaiguda**) | No — va al git | — |
| [MIGRA-013](#migra-013) | 2026-09-25 | eines | codi | No — va al git | — |
| [MIGRA-014](#migra-014) | 2026-09-25 | eines | **dades (BD)** | Ja és dins del `.sql` | — |
| [EINA-mes](#eina-mes) | 2026-09-25 | eines | codi | No — va al git | — |
| [EINA-anada-i-tornada](#eina-anada-i-tornada) | 2026-09-25 | eines | codi | No — va al git | — |
| [MIGRA-015](#migra-015) | 2026-09-25 | eines | codi | No — va al git | — |
| [CPL-LIT-005](#cpl-lit-005) | 2026-09-28 | cpl-app | codi | No — va al git | `1bd79cc`, branca `litcal-sweep`, local |
| [CPL-LIT-006](#cpl-lit-006) | 2026-09-28 | cpl-app | codi | No — va al git | `1ea6f96`, branca `litcal-sweep`, local |
| [CPL-LIT-001c](#cpl-lit-001c) | 2026-09-29 | cpl-app | codi (**recaiguda**, aturada a la fusió) | No — va al git | `50eed05` |
| [EINA-calendari](#eina-calendari) | 2026-09-29 | eines | codi | No — va al git | `3193fb5`, `2a66094` |
| [EINA-db-fixed](#eina-db-fixed) | 2026-09-29 | eines | codi | No — va al git | `1dbfce3`, `38a2547` |
| [SA-16](#sa-16) | 2026-09-29 | saints-app | **codi** | No — va al git | `f1cc32d42`, `4709adfe4` |
| [MIGRA-016](#migra-016) | 2026-09-29 | eines | codi | No — va al git | `02d5724` |
| [MIGRA-017](#migra-017) | 2026-09-29 | eines | codi | No — va al git | `d3322a2` |
| [SA-17](#sa-17) | 2026-09-29 | saints-app | contingut | Es regenera | `1c6b0af4d` |
| [MIGRA-018](#migra-018) | 2026-09-30 | eines | codi | No — va al git | `15b1375` |
| [MIGRA-019](#migra-019) | 2026-09-30 | eines | codi | No — va al git | `7fdbea0` |
| [SA-18](#sa-18) | 2026-09-30 | saints-app | contingut | Es regenera, **però les 17 caselles esborrades cal esborrar-les a mà** si es torna a partir d'una còpia vella | `56fbbcd54` |
| [MIGRA-020](#migra-020) | 2026-09-30 | eines | codi (**decisió d'en Pau**) | No — va al git | `7ded8b1` |
| [SA-19](#sa-19) | 2026-09-30 | saints-app | contingut | Es regenera, **però la 9573 cal esborrar-la a mà** si es torna a partir d'una còpia vella | `26767fa24` |
| [D-001](#d-001) | 2026-09-03 | cpl-app | **cap canvi** (qüestió tancada) | — | — |
| [D-002](#d-002) | 2026-09-03 | saints-app | **decisió** (qüestió tancada) | — | — |
| [D-003](#d-003) | 2026-09-04 | cpl-app | **cap canvi** (qüestió tancada) | — | — |
| [D-008](#d-008) | 2026-09-29 | cpl-app | **cap canvi** (qüestió tancada) | — | — |
| [D-009](#d-009) | 2026-09-30 | saints-app | **decisió** (un sol cas) | Es regenera: `static-translations/himnos.ca.json` | `a346ca8db` |
| [D-010](#d-010) | 2026-09-30 | eines + saints-app | **decisió** (17 caselles, una per una) + codi | Es regenera: `decided-cells.json` | `48f9ac4` · saints-app `f07309896` |
| [D-011](#d-011) | 2026-09-30 | saints-app | **decisió** (un sol cas) | Es regenera: `static-translations/lecturas_*.ca.json` | saints-app `8bbcfd124` |
| [SA-20](#sa-20) | 2026-09-30 | saints-app | **codi** | No — va al git | `6899c5077` |
| [D-012](#d-012) | 2026-09-30 | eines | **decisió** (dues regles, fetes codi) | No — va al git | el que afegeix la fitxa · saints-app `fdbcaaaf5` |
| [SA-21](#sa-21) | 2026-09-30 | saints-app | contingut | Es regenera | `fdbcaaaf5` |

**Errors de cpl-app trobats fins ara: 5.** Dos són de dades i tres de codi. Per llistar-los des
del git en qualsevol moment:

```sh
git log --grep='^Cpl-Bug:' --format='%(trailers:key=Cpl-Bug,valueonly,separator=%x20)|%h|%as|%s'
```

---

## El que s'ha de reaplicar sobre una base de dades acabada de baixar

> **Des del 29 de setembre de 2026, els fixos no es tornen a posar a la base del lloc** fins al
> final de la migració, per decisió d'en Pau. La migració corre sobre una còpia que en porta tots
> dos: `make db-fixed` i, després, `CPL_DB=migration-to-saints/output/cpl-app.fixed.db`. Vegeu
> [EINA-db-fixed](#eina-db-fixed). La recepta de sota és per al dia que es posin per sempre.

`src/assets/db/cpl-app.db` **està gitignorada** i ve del web de Deployment. Els fixos de dades
no hi són quan te la baixes de nou. Aquests dos fitxers `.sql` **són l'únic registre** del que
s'hi va canviar:

```sh
# 1. Còpia de seguretat: no hi ha desfer.
cp src/assets/db/cpl-app.db /tmp/cpl-app.db.backup

# 2. Els dos fixos, en ordre. Són idempotents: si CPL ja ho ha arreglat a origen, no fan res.
sqlite3 src/assets/db/cpl-app.db < db-fixes/CPL-LIT-002.sql
sqlite3 src/assets/db/cpl-app.db < db-fixes/CPL-LIT-003.sql

# 3. Els detectors. Si fallen, a la base li falta el fix.
npx jest __tests__/services/ImmaculateConceptionTransfer.test.js
npx jest __tests__/services/Psalm66PointingMark.test.js

# 4. Si has tocat la base, el join ha de tornar a córrer.
HOURS=Laudes,Vespers npx jest migration-to-saints/join-content.test.js --silent
```

Cap dels dos `.sql` filtra per `id` de fila: filtren per **l'estat incorrecte**, i per això
funcionen sobre qualsevol versió de la base i es poden executar dues vegades sense fer mal.

Per saber sobre quina versió s'han aplicat, cada `.sql` porta a la capçalera el recompte de
`_tables_log` i el sha256 d'abans i de després. **`_tables_log` no s'ha tocat mai**: el seu
recompte és el que el wiki de CPL fa servir per comparar amb la versió publicada.

### Última reaplicació: 25 de setembre de 2026, sobre la **v5**

| | |
|---|---|
| Base | `src/assets/db/cpl-app.db`, v5, `compat s0-99bd7d6becceebc9`, 15.968.256 bytes |
| sha256 abans | `7235a715d1d46f6864e0739bf4247fd5bb50090d012246b9a3d7c19005a8dab9` |
| sha256 després | `9bec0208514b2602f550f15072f9953e675df4da8c8b19059197b5fbc9cc1c8e` |
| `_tables_log` | **12.615 abans i 12.615 després** (últim registre: `santsMemories/529`, 2026-09-02 07:10:44) |
| Detectors | `ImmaculateConceptionTransfer` i `Psalm66PointingMark`, tots dos en verd |

**Els quatre goldens estan gravats contra la v5 SENSE els fixos** (`databaseSha256:
7235a715…`). Es van tornar a gravar el 29 de setembre, amb el CPL-LIT-001 ja a `master`, i només
hi van canviar els dos Dimecres de Cendra (5-3-2025 i 18-2-2026): la salmòdia de Laudes, i
l'invitatori de qui té triat el Salm 99, que aquell dia passa al 94. O sigui que ara donen per bo
el Dimecres de Cendra, però encara la Immaculada del dia que no toca i el Salm 66 sense asterisc.
Amb els fixos a la base del lloc, els quatre peten amb *«was made from another cpl-app.db»*, que
és el guardià fent la seva feina i no cap regressió. Regravar-los contra una base amb els fixos
demana repassar l'app a mà abans (`UPDATE_GOLDEN=1`), i això només ho pot fer en Pau.

Els dos fixos hi faltaven: la base es va tornar a baixar el 25 de setembre i se'ls va endur, que
és exactament el que aquesta secció existeix per a evitar. El CPL-LIT-003 **afegia dues files a
`_tables_log`** en reaplicar-se i ara se les treu tot sol — vegeu [MIGRA-014](#migra-014).

---

# Errors de cpl-app

## APP-001

**L'app no apareixia a la Play Store als mòbils nous: actualització a Expo 57** · 21 de setembre de 2026

El client va avisar que alguns usuaris no trobaven l'app. Les captures (un Redmi A7 Pro amb
Android 16) mostraven «*s'ha creat per a una versió anterior d'Android*»: Google Play amaga
l'app als mòbils amb un Android més nou que el `targetSdk` de l'app, i el binari publicat (89,
de novembre de 2024, Expo SDK 51) apuntava a l'API 34. Només es publicaven OTA, que no canvien
el binari. A més, `master` no compilava: `expo-splash-screen ^0.29` era de l'SDK 52.

L'actualització s'ha fet SDK per SDK (51 → 57), amb una bateria de tests escrita **abans** de
tocar cap llibreria per demostrar que l'app continua fent el mateix.

| | |
|---|---|
| Branca | `upgrade-expo-57`, que surt de `master` (no porta res de la migració) |
| Resultat | Versió 9.0.0 (90): Expo SDK 57, React Native 0.86, React 19.2, Nova Arquitectura, React Navigation 7. `targetSdk 36`, `minSdk 24` |
| Conseqüència | Deixen de rebre actualitzacions els mòbils amb Android 6 (el mínim passa a Android 7) i els iPhones que no poden passar d'iOS 16.4 |
| Tests de Jest | 383, `make tests`: golden de la litúrgia (68 dies × 5 configuracions, text a text), tots els dies de 2025 i 2026, l'app sencera navegant, serveis. La litúrgia ha sortit **idèntica** a cada salt |
| Tests de Maestro | 6 fluxos, `make ui-tests`. SDK 57: passen a Android 16, normal i amb pàgines de 16 KB. iOS 26 validat fins a l'SDK 53; per compilar l'SDK 57 en local cal Xcode 26.4+ (el Mac en té la 26.0). A EAS no afecta |
| Fixes de l'app trobats pel camí | Accessibilitat: VoiceOver llegia el glif de les icones («`U+ED31` Missatge») i no podia arribar al calendari d'iOS; les pestanyes i la capçalera no tenien nom. Tres regressions visuals de la pantalla de vora a vora, corregides abans de publicar |
| Reaplicar | **No** — és codi, va al git |

**Pendent de fer fora del repositori** (en Pau): `eas channel:create` per als canals `_90`,
`eas build --platform all --profile production`, pujar-ho a les botigues i «Update Production
Repository» a la web de Deployment. El servidor de Deployment publica les OTA i l'SDK 57 hi
demana Node 22.13 o superior i un `eas-cli` recent (pas 11 del wiki).

**Trobat, no corregit** (no depèn de l'actualització):

- **La base de dades s'acaba el 31-12-2026.** Els dies 30 i 31 de desembre l'app ja falla (li
  cal el dia de demà) i l'1 de gener no obrirà. Cal que CPL publiqui el 2027 abans. El test
  `DatabaseCoverage` es posarà vermell quan faltin menys de 45 dies.
- **Dilluns a Dijous Sant de 2026**: Laudes, Vespres i l'Ofici surten sense l'antífona
  evangèlica, les pregàries ni l'oració final. Altres forats d'un sol dia: Sexta i Nona de
  Pentecosta sense himne, i el 3 de desembre sense segona lectura de missa. Pendent de revisar
  com a possibles CPL-LIT.

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
| Fix | Codi: `src/services/liturgy/liturgyMastersService.ts`, `obtainLaudesCommonPsalter` |
| Test | [`__tests__/services/AshWednesdayLaudesPsalmody.test.js`](__tests__/services/AshWednesdayLaudesPsalmody.test.js) |
| Reaplicar | **No** — és codi, va al git |
| Prova | Tres fonts en tres idiomes (anglès, castellà per data exacta, i la rúbrica explicada), més la contraverificació que les Vespres **no** canvien |
| Efecte a la migració | 8 caselles desbloquejades, **1.034 observacions-dia** |

> **Va tornar el 25 de setembre de 2026.** Vegeu [CPL-LIT-001b](#cpl-lit-001b).

> **A `master` des del 29 de setembre de 2026** (`2514944`): fins llavors el fix només era en
> aquesta branca, i l'app publicada resava el Salm 107. El test viu a `__tests__/services/` i carrega
> el dia com l'app (`__tests__/helpers/liturgyDay`), sense les eines de la migració.

<a id="cpl-lit-001b"></a>
## CPL-LIT-001b

**El fix del Dimecres de Cendra es va perdre al refactor de `master`** · 25 de setembre de 2026

El bloc de vint línies que el `cdc8c79` va posar a `ObtainLaudesCommonPsalter` **no és al codi
refactoritzat**. El `refactor: the code, in English` i el `properties in camelCase` de `master`
van reescriure `liturgyMastersService` i el bloc no va arribar a l'altra banda. Els 10 Dimecres
de Cendra de la finestra tornaven a resar el Salm 107 a Laudes.

Com s'ha vist —i val la pena, perquè no va ser el detector qui va avisar primer:

1. El join va deixar d'escriure **9 caselles** que sí que escrivia el 8 de setembre:
   `salmos_antifonas/71-73`, `salmos_citas/72-74` i `salmos_textos/73-75`, tota la salmòdia d'una
   hora.
2. A la cua hi eren les nou, amb **dues variants** cadascuna, i la minoritària feia **10
   observacions** exactes, sempre les mateixes dates: 2017-03-01 … 2026-02-18. Deu Dimecres de
   Cendra.
3. La variant minoritària era «Salm 107 · Lloança del Senyor i petició de socors», que és
   literalment el text del CPL-LIT-001.

El detector `AshWednesdayLaudesPsalmody.test.js` **sí que ho veia** —10 dels seus 13 casos
fallaven—, però estava caigut per les rutes velles (`src/Services/…`) des de la fusió, o sigui
que ningú no el llegia. Doble lliçó: el detector va complir i el `make tests` en vermell el
tapava.

| | |
|---|---|
| Fix | El mateix bloc, amb els noms nous: `checkCelebration(Celebration.AshWednesday, …)` → `weekCycle = 3`, `dayNumber = 5` |
| On | [`src/services/liturgy/liturgyMastersService.ts`](src/services/liturgy/liturgyMastersService.ts), `obtainLaudesCommonPsalter` |
| Test | El mateix de sempre, ara en verd: 13/13 |
| Reaplicar | **No** — és codi, va al git |
| Efecte | Les 9 caselles tornen a resoldre's per unanimitat |

**El que això vol dir per al futur**: un fix de codi de cpl-app no està segur només perquè sigui
al git. Els dos detectors de dades (`ImmaculateConceptionTransfer`, `Psalm66PointingMark`) i
aquest són l'única xarxa, i **han de córrer en verd sempre**, perquè una fusió gran és
exactament quan un `CPL-LIT` es perd.

## CPL-LIT-001c

**La fusió de `master` del 29 de setembre deixava el Dimecres de Cendra cridant un nom que ja no existeix** · 29 de setembre de 2026

En fusionar `master` a `catalan-migration` (el calendari de litcal, el CPL-LIT-005 i el 006, i el
refactor a TypeScript estricte), git va conservar el bloc del CPL-LIT-001 dins
`obtainLaudesCommonPsalter` sense cap conflicte, però cridant `CelebrationIdentifier.checkCelebration`:
un àlies d'importació que el refactor de `master` va treure. El fitxer ara només importa
`CelebrationIdentifierService`, i git no ho veu perquè ningú no toca aquella línia.

Aquesta vegada no hauria estat una pèrdua silenciosa com la del [CPL-LIT-001b](#cpl-lit-001b),
sinó una de més gran: la línia s'avalua a tots els dies que calculen el salteri de Laudes (tots
menys el Tridu i l'octava de Pasqua), i hi llança un `ReferenceError`.

| | |
|---|---|
| Com s'ha vist | Llegint el bloc després de la fusió. `make types` també l'atura: `TS2552: Cannot find name 'CelebrationIdentifier'` |
| Comprovat | Amb la línia tal com la va deixar git, el detector `AshWednesdayLaudesPsalmody` cau en 11 dels 13 casos, també «the Thursday after keeps Thursday of week IV», que no és cap Dimecres de Cendra |
| Fix | `CelebrationIdentifierService.checkCelebration(Celebration.AshWednesday, …)`, com la resta del fitxer |
| Test | El detector, 13/13 |
| Commit | `50eed05`, el de la fusió |
| Reaplicar | **No** — és codi, va al git |

La mateixa fusió, a les eines: `Settings.textSize` és text a `master` («From 1 to 10, stored as
text»), i [`src/liturgy-export/settings.ts`](src/liturgy-export/settings.ts) hi posa `'3'`. No
canvia res del que s'exporta: és la mida de la lletra.

**La fusió no mou cap text de la migració.** Amb la v5 més els dos `db-fixes`, les sortides
`commons-ca/` del join surten idèntiques a les del git. L'única diferència és de calendari, i és
bona: el 9-6-2018 a Barcelona surt el Cor Immaculat en lloc de sant Efrem, que és el
[CPL-LIT-006](#cpl-lit-006) arribant de `master`.

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
| Test | [`__tests__/services/ImmaculateConceptionTransfer.test.js`](__tests__/services/ImmaculateConceptionTransfer.test.js) |
| Reaplicar | **Sí, sobre cada base nova** |
| BD | `_tables_log` = 12.528 · sha256 `6eed8fe8…` → `fda34735…` |
| Prova | La mateixa taula ja sap fer el trasllat i l'aplica bé a sant Josep (2023) i a l'Anunciació (2024): no és un criteri pastoral, és un forat |
| Efecte a la migració | 98 caselles contestades, 210 observacions reassignades, **45 caselles queden unànimes** |

> Quan es publiqui la taula `anyliturgic` que surt de litcal (el procés X de cpl-cloud), el trasllat ja hi serà
> i el `.sql` no hi trobarà res a canviar: es podrà deixar d'aplicar.

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
| Test | [`__tests__/services/Psalm66PointingMark.test.js`](__tests__/services/Psalm66PointingMark.test.js) |
| Reaplicar | **Sí, sobre cada base nova** |
| BD | `_tables_log` = 12.528 · sha256 `fda34735…` → `38842ab0…` (ja porta CPL-LIT-002 aplicat) |
| Prova | **Interna**: les edicions en línia despullen la puntuació i no poden dir-hi res. La còpia germana de Laudes duu la marca, i un cop normalitzats els espais és **l'única** diferència entre les dues |
| Efecte a la migració | Cap casella nova migrada. `salmos_textos/144` passa de **26 grups acusats a 1**, i 17 grups desapareixen de l'informe |

<a id="cpl-lit-005"></a>
## CPL-LIT-005

**La Mare de Déu de la Cinta no hi és quan l'1 de setembre cau en diumenge** · 28 de setembre de 2026

La Cinta, a Tortosa, és el dissabte abans del primer diumenge de setembre: memòria a la diòcesi i solemnitat a la
ciutat. Les seves files no tenen data, i l'app calculava el dia buscant el primer diumenge a partir del dia 2: quan
l'1 és diumenge, la posava el 7. El 31 d'agost del 2019 i del 2024, on la té la taula, la diòcesi tenia sant Ramon
Nonat i la ciutat cap celebració. La propera vegada serà el 2030.

| | |
|---|---|
| Dossier | [migration-to-saints/cpl-bugs/CPL-LIT-005.md](migration-to-saints/cpl-bugs/CPL-LIT-005.md) |
| Commit | `1bd79cc` — branca `litcal-sweep`, local |
| Fix | Codi: `src/services/celebrationIdentifierService.ts`, `isMotherOfGodFromTheTibbon` |
| Test | `__tests__/liturgy/cintaDay.test.js` |
| Reaplicar | **No** — és codi, va al git |
| Prova | **Interna**: les files de la Cinta porten la regla («Dissabte abans del primer diumenge de setembre») i la taula `anyliturgic` l'aplica bé; litcal també |
| Efecte a la migració | Cap: litcal calcula la Cinta per regla |

<a id="cpl-lit-006"></a>
## CPL-LIT-006

**Els trasllats d'una sola diòcesi o d'un sol lloc no van bé** · 28 de setembre de 2026

Quan una celebració es trasllada només en una diòcesi (`diocesiMogut` = `To`) o només en un lloc (`BaC`), l'app
s'equivocava de sant. El trasllat es feia servir a sis llocs del codi, i cadascun comparava `diocesiMogut` amb una
cosa diferent (les dues lletres de la diòcesi, el nom, les tres lletres o res). El 9 de juny del 2018 Barcelona i
Girona perdien el Cor Immaculat per un trasllat de Tortosa; el 12 de maig del 2025 Lleida perdia sant Anastasi; el
4 de maig del 2026 la catedral de Barcelona tenia sant Felip i sant Jaume en lloc de la Santa Creu. Només anaven bé
els trasllats per a tothom (`*`).

| | |
|---|---|
| Dossier | [migration-to-saints/cpl-bugs/CPL-LIT-006.md](migration-to-saints/cpl-bugs/CPL-LIT-006.md) |
| Commit | `1ea6f96` — branca `litcal-sweep`, local |
| Fix | Codi: `src/services/databaseDataHelper.ts` (`isTransferForPlace`), `databaseDataService.ts` i `liturgy/liturgyMastersService.ts` |
| Test | `__tests__/liturgy/movedCelebrations.test.js` i `__tests__/services/databaseDataHelper.test.js` |
| Reaplicar | **No** — és codi, va al git. Quan arribi a `master`, cal `make golden`: sis dies canvien, només en la informació del dia traslladat |
| Prova | Els serveis de l'app amb la BD que porta (els quatre casos), i l'escombrada de Jest de tots els dies i llocs del 2017 al 2100 amb la taula que surt de litcal: cap trasllat no hi falla |
| Efecte a la migració | Cap: a litcal cada calendari resol els seus trasllats |

La taula que surt de litcal diu, a més, per a qui val cada trasllat lloc per lloc a `Mogut` («Ba Gi Ll SF So Ta
Te To Ur Vi Andorra» per a Sant Jordi, que no es trasllada a Mallorca ni a Menorca), i l'app ho llegeix; les
versions d'abans continuen llegint `diocesiMogut`.

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
<a id="migra-006"></a>
## MIGRA-006 — **TANCAT**

**El join saltava les I Vespres i escrivia una observació solitària** · 7 de setembre de 2026

La fitxa oberta deia que la regla «un id només s'escriu si **totes** les observacions
coincideixen» no s'aplicava en algun camí. S'aplicava sempre: el que fallava és que a la
casella hi arribava **una sola observació**, i «totes coincideixen» és cert per vacuïtat.

### La causa (no és la que sospitàvem)

La hipòtesi de la fitxa apuntava a `fromFerial`/`entryFromCells`. No hi era. La causa és el
salt de Vespres de `join-content.test.js`:

```js
if (hour === 'Vespers' && vespersFromTomorrow) { continue; }   // abans
```

Escrit sobre la **F5**, que llegint l'índex va concloure que saints-app no té cap casella per
a les I Vespres. **Ja en té**: des del PR #1694 l'índex duu camps `<camp>_PrimerasVisperas`
dins de l'entrada de la pròpia celebració — 74 entrades, tots els diumenges i les solemnitats
grans. `salmos_antifonas/9998` **és** el `primer_salmo_antifona_PrimerasVisperas` del Sagrat Cor.

Resolent les 10 vigílies amb els *Services* reals (`Barcelona`, `Diòcesi`):

| | precedència d'avui | de demà | `vespersComeFromTomorrow` |
|---|---|---|---|
| 9 vigílies (2017, 2018, 2019, 2020, 2021, 2023, 2024, 2025, 2026) | 10-13 | 3 | **cert** → saltades |
| 2022-06-23 | **3** (Naixement del Baptista, traslladat) | 3 | **fals** → observada |

El 2022 el Baptista i el Sagrat Cor cauen el mateix 24 de juny; cpl-app trasllada el Baptista
al 23 i li resa les II Vespres. Amb precedències iguals la funció cau a la branca del desempat
i retorna fals. Nou observacions descartades, una de sola supervivent, i el join l'escriu.

### El fix

Preguntar-ho a l'app en lloc de deduir-ho (el mateix principi de PLAN §8d). L'identitat és
exacta, no heurística:

> l'himne mesurat per la sonda == `himno_PrimerasVisperas` de l'endemà
> → l'app hi mostra les I Vespres de demà, i el text de cpl-app hi va.

**428 vespres** de la finestra compleixen la identitat i ara s'observen; **837** no, i el salt
s'hi manté (allà l'app resa el seu propi ofici i escriure-hi seria la F6). De passada,
`applicableHours` gatejava per l'índex encara havent-hi casella mesurada: 20 dates de la
finestra hi queien, 10 d'elles Dijous Sant.

### Efecte mesurat (finestra 2017-2026, Laudes+Vespres, mateixa configuració a banda i banda)

| | abans | després |
|---|---|---|
| caselles escrites | 7.211 | **7.456** (+245) |
| caselles en conflicte | 602 | **909** (+307) |
| text semàntic canviat | — | **0** (4 canvis només d'espais + 1 títol de salm més complet) |
| de les 15 regressions de la fitxa | escrites | **15 retingudes** |

Les 228 caselles que deixen d'escriure's **passen totes a conflicte registrat**; cap no
desapareix en silenci.

### El que ha destapat: 52 caselles de I Vespres publicades amb el text d'un altre dia

L'exportació no era només «refer-la». Com que aquestes caselles no s'observaven mai, s'havien
omplert amb el text de qualsevol altra data que hi arribés. Verificat contra el castellà, una
per una:

| casella | el castellà hi diu | el català hi tenia | ara |
|---|---|---|---|
| `salmos_antifonas/10397` (I V. del Baptisme) | «Juan bautizaba en el desierto» | «El Rei de la pau ha estat glorificat» | «Joan en el desert predicava un baptisme de conversió» |
| `responsorios/15511` (I V. del Baptista) | «Preparad el camino del Señor» | «Els va donar el pa del cel, Al·leluia» | «Obriu una ruta al Senyor» |
| `preces_contenido/5932-5936` (I V. del Baptista) | precs del Baptista | precs de l'eucaristia | precs del Baptista |
| `salmos_antifonas/10118-10120` (I V. del Baptista) | Elisabet, Zacaries, Joan | Melquisedec, el calze, el camí | Elisabet, Zacaries, Joan |

Totes 52 són camps `*_PrimerasVisperas` (o la seva bessona `_1v`): Baptisme del Senyor,
Naixement de sant Joan Baptista, Immaculada, santa Caterina de Siena. **Exportades.**

### Peces

| | |
|---|---|
| Fix | `migration-to-saints/join-content.test.js` — `appShowsTomorrowsVespers()` + el gat de `applicableHours` |
| Detector | `migration-to-saints/first-vespers.test.js` — corre el join real sobre les 10 vigílies i exigeix que la casella quedi **retinguda** amb les 10 observacions. Comprovat que **falla sense el pedaç** |
| Extra | El join accepta `OUT_DIR`, perquè una passada parcial no trepitgi la sortida bona dels 10 anys |
| Exportació | Refeta: 98 claus noves, 56 actualitzades (52 correccions de I Vespres + 4 d'espais) |

### Conseqüència per a la F5

**La F5 ja no és certa tal com està escrita** («saints-app no té I Vespres»). Ho era abans del
PR #1694. No s'ha enviat mai a en Fernando i **no s'ha d'enviar**: cal reescriure-la o
retirar-la abans, o li proposaríem una cosa que ja té feta.

<a id="migra-005"></a>
## MIGRA-005

**El generador de calendaris emetia memòries com a solemnitats** · 4 de setembre de 2026

És la **F10**, i la causa era més fina del que deia la fitxa. `generate-catalan-calendars.js`
treia el `rank` i la `precedence` de dues decisions separades:

- `memoryRank()` retorna **el rang més alt observat** a `anyliturgic` per a aquella data, i
  aquell rang pot ser `'S'` o `'F'` — que és el de la celebració que **va suprimir** la memòria
  aquell any, no el de la memòria. El comentari del fitxer ja ho diu: «a suppressed year says
  nothing about the celebration's own rank — only about what outranked it that year».
- `precedenceForMemory()` només contemplava `M`, `L` i `V`. Amb `'S'` queia al calaix de les
  memòries i retornava `PROPER_MEMORIAL_11B`.

Resultat: `rank: "SOLEMNITY"` amb `precedence: "PROPER_MEMORIAL_11B"`. Dies que litcal no sap
col·locar i que el manifest escriu amb `allXKey: null`.

| | |
|---|---|
| Fix | `classifySolemnitat()` i `classifyMemory()` retornen **rank i precedence junts**, o sigui que un cridador no en pot agafar un de cada banda. El lookup de memòries només llegeix `V`/`L`/`M` |
| Asserció | La validació prèvia a escriure ara **avorta** si el `rank` i la `precedence` d'una celebració són de famílies diferents. És el detector: sense el fix, no escriuria res |
| Cura | Restringir el lookup deixava caure 13 celebracions (dates de Quaresma, sempre suprimides). Una fila de `santsMemories` **és** una memòria: si l'almanac no ho diu, es queda com a `OPTIONAL_MEMORIAL` amb avís, que no desplaça res. Perdre-les era el mal que la capçalera del fitxer ja avisa —va costar el 8% dels conflictes del join |

| | contradiccions | regles | saltades |
|---|---|---|---|
| Al git, abans | 19 de 340 | 596 | 41 |
| Regenerat sense el fix (4-IX, matí) | **94** | — | — |
| **Amb el fix** | **0 de 622** | 583 | 54 |

**Un camí que es va provar i es va desfer.** Restringir el lookup a `V`/`L`/`M` deixa fora 13
files més, i la primera reacció va ser mantenir-les com a `OPTIONAL_MEMORIAL` en comptes de
perdre-les —la capçalera del fitxer avisa que deixar-ne caure va costar el 8% dels conflictes del
join. Mesurat, **el manifest surt idèntic amb i sense**: 0 dates amb un `litcalId` diferent, 0
amb clau diferent. Aquelles celebracions no guanyen mai cap dia, i unes quantes són **duplicats
catalans de celebracions que litcal ja té** amb el seu id de romcal —
`santa_caterina_de_siena_verge_i_doctora_de_l_esglesia_patrona_d_europa` contra
`catherine_of_siena_virgin`. O sigui que saltar-les, com feia el codi original, és el correcte.

> ### ⚠️ El fix és bo, però **NO regeneris els calendaris amb ell** fins que no es resolgui això
>
> Regenerats i mesurats, **117 dates passen a resoldre's a un id català nostre** que duplica una
> celebració que romcal ja té: `santa_caterina_de_siena_verge_i_doctora_de_l_esglesia_patrona_d_europa`
> contra `catherine_of_siena_virgin`, `sant_jaume_apostol_patro_d_espanya` contra `james_apostle`,
> i així 117. L'índex de saints-app no té entrada per a aquests ids, o sigui que el dia **perd la
> clau** i el join aparella el text de cpl-app amb la casella d'una altra celebració.
>
> **El generador sempre els ha emès.** El que fa aquest fix és donar-los un rang coherent i, per
> tant, **fer-los guanyar dies que abans no podien guanyar** — abans sortien amb rang i precedència
> contradictoris i litcal no els sabia col·locar. O sigui que la F10 estava tapant això.
>
> Mesurat sobre les dates sense `allXKey` al manifest, amb l'índex de `dev` ja fusionat:
>
> | calendaris | dates sense clau |
> |---|---|
> | Els del git (sense regenerar) | **239** |
> | Regenerats amb el fix | 347 |
>
> I l'exportació que en va sortir tenia **15 caselles sobreescrites i les 15 eren regressions**,
> totes verificades contra el castellà: textos de sant Joan Baptista entrant a caselles del Sagrat
> Cor. Per això els calendaris regenerats es van revertir (litcal `91f2e17`).
>
> **El que falta abans de poder-los regenerar:** que el generador no emeti una celebració catalana
> quan romcal ja en té una d'equivalent, o que emeti l'id de romcal en comptes del seu propi slug.
> És una troballa nova, no la F10.


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

**El 2 de novembre, saints-app resava el diumenge en comptes de l'Ofici de Difunts** · proposat el 3-09-2026, **aplicat per eprex el 5-09-2026**

A la Commemoració de tots els fidels difunts, la fitxa de saints-app donava la salmòdia del
Diumenge XXXI del temps ordinari, amb antífones acabades en «Aleluya», a Laudes i a Vespres.
Era una còpia de la fitxa del diumenge. Afectava **totes les llengües**, castellà inclòs.

| | |
|---|---|
| Dossier | [migration-to-saints/eprex-bugs/EPREX-001.md](migration-to-saints/eprex-bugs/EPREX-001.md) |
| Estat | **Salmòdia aplicada.** En Fernando ens va donar la raó; entrat per la PR #1726 de staging-texts |
| Commits | saints-app `43a319267` (textos) → `39410aa43` (merge d'en Fernando) → `cf9cab58a` (a la nostra branca) |
| Verificat | 7-09-2026: els **18 ids** són exactament els proposats. Sonda repassada a les 08:35 i join a les 08:36, tots dos **després** del merge de les 08:28 |
| Efecte al català | Les tres antífones òrfenes de Vespres (`10964`/`10965`/`10966`) ja tenen text, i també el 1r salm de Vespres, el 1r de Laudes i el càntic d'Isaïes |
| Preu | **Dos conflictes nous**, tots dos previstos: `salmos_antifonas/906` (empat 10-10 amb el Dissabte Sant) i `/247` (60 contra 10). Volen id propi; quina redacció catalana és la bona només ho diu el volum imprès |
| **Pendent** | **2a ronda enviada el 7-09-2026, pendent de resposta**: himne, lectura breu i oració final encara vénen del diumenge. Els ids ja existeixen (`3601`/`3602`, `1761`, `3970`) i `1761` **ja la fa servir la mateixa fitxa a Sexta i Nona** |

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
| Dossier | [migration-to-saints/eprex-bugs/EPREX-003.md](migration-to-saints/eprex-bugs/EPREX-003.md) |
| Estat | **Proposat, pendent d'enviar.** El missatge per a en Fernando és al final del dossier, en castellà i en text pla per a Telegram |
| Entrada | `holy_innocents_martyrs__ANY` (i el seu bessó `christmas_octave_day_4__ANY`, que és el mateix dia i té el mateix contingut) |
| Fix | `primer_salmo_cita`/`_texto` `11031`/`11032` → **`11025`/`11026`** · `segundo_salmo_cita`/`_texto` `155`/`156` → **`54`/`55`** · `tercer_salmo_cita`/`_texto` `11042`/`11043` → **`11072`/`11073`** |
| Prova interna | Sant Esteve (26-XII) i sant Joan (27-XII), les dues festes germanes de la mateixa octava i del mateix rang, porten `11025`+`54`+`11072`. Sants Innocents és l'única de les tres que no |
| Quins anys falla | **7 dels 10** del manifest: 2017, 2018, 2020, 2021, 2022, 2023 i 2026. Encerta el 2019 i el 2024, els dos anys en què el 29 és la Sagrada Família i sí que toquen I Vespres. El 2025 no s'aplica: el 28 mateix és la Sagrada Família |
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

<a id="sa-10"></a>
## SA-10

**52 caselles de I Vespres corregides a `commons/ca`** · 7 de setembre de 2026

Exportació refeta després de [MIGRA-006](#migra-006): **98 claus noves i 56 actualitzades**. De
les 56, quatre són només espais i una és un títol de salm més complet (`salmos_citas/4577`,
«Salm 121» → «Salm 121\nPelegrinatge a la ciutat santa»); **les altres 52 duien el text d'un
altre dia**.

Són totes camps `*_PrimerasVisperas` — Baptisme del Senyor, Naixement de sant Joan Baptista,
Immaculada, santa Caterina de Siena. Com que el join no observava mai aquestes caselles, s'hi
havia quedat el text de qualsevol altra data que hi arribés. Verificades una per una contra el
castellà del mateix id abans d'escriure-les.

Es regenera amb `npx jest migration-to-saints/join-content.test.js` +
`node migration-to-saints/export-to-saints-app.js`.

<a id="eina-hores"></a>
## EINA-hores

**El pipeline aprèn Tèrcia, Sexta i Nona** · 7 de setembre de 2026

Fase 1 de [FASES.md](migration-to-saints/FASES.md). Les tres hores intermèdies **no estrenen
cap taula** de `commons/ca` — van a les mateixes que Laudes i Vespres — i els seus 15 camps
són subconjunt dels 20 de Laudes, així que el join, la sonda (`app-id-probe.js`),
l'inspector (`day-check.js`) i el comparador s'han estès sense inventar-hi res.

Les tres diferències del model de cpl-app viuen a `lib/cpl-day-resolver.js`, en dues funcions
que **el join també crida** perquè no puguin divergir (`psalmAntiphons`, `responsoryParts`):

| | |
|---|---|
| On són | `SpecificHour` penja de `hoursLiturgy.Hours`, no de l'arrel |
| Responsori | Parell versicle/resposta = **2 ids** a l'índex, no sis línies |
| Antífona | En una celebració, **una de sola** per a tota l'hora (`HasMultipleAntiphons: false`), i les per-salm que el model encara duu **no es veuen a la pantalla** |

I una trampa que hauria fet mal si s'hagués copiat de Laudes: **aquí no hi ha pestanya
memòria/fèria**. `terciaStore.ts` substitueix el registre sencer per la fèria en un
`MEMORY_FERIAL` i no escriu cap camp `_Ferial`, o sigui que la casella mesurada ja és la bona
i no s'ha de redirigir — ni hi ha segona pestanya per al Comú. Al `HOURS_CONFIG`,
`dualOffice: false`. Detall complet a [PLAN §15](migration-to-saints/PLAN.md).

**Control**: re-córrer només Laudes+Vespres amb el mapa nou de 5 hores dona **0 textos
canviats i 0 caselles perdudes**.

| | abans | després |
|---|---|---|
| Tèrcia+Sexta+Nona, dels 2.622 ids que demanen | 56 (2,1%) | **2.147 (81,9%)** |
| caselles escrites pel join | 7.639 | **9.756** |
| caselles en conflicte | 932 | **1.313** |

Es regenera amb `node migration-to-saints/app-id-probe.js --range 2017-01-01..2026-12-30
--fresh` + `npx jest migration-to-saints/join-content.test.js`.

<a id="sa-11"></a>
## SA-11

**2.150 caselles noves a `commons/ca`: Tèrcia, Sexta i Nona** · 7 de setembre de 2026

Exportació de la fase 1. **2.150 claus noves i 0 actualitzades** — purament additiva: cap
text ja publicat no canvia. Les 5 hores passen a **89,1%** dels ids que l'índex els demana, i
el català al **17,9%** de l'univers sencer de `commons/es`.

L'inspector de dia ara compta **102 camps per dia** en lloc de 57.

**Cua**: 33 caselles compartides entre hores han passat a conflicte i el join ja no les
escriu, però l'exportació **fusiona i no esborra**, o sigui que a `saints-app` hi queda el
text que hi tenien. És text que el pipeline actual ja no justifica — cal decidir si es treu.

<a id="eina-completes"></a>
## EINA-completes

**Extractor de Completes** · 7 de setembre de 2026

Fase 2 de [FASES.md](migration-to-saints/FASES.md). Les Completes **no passen per
`day_specific_texts`**: saints-app les té com a **set fitxers per idioma**, un per dia de la
setmana. Sense espai d'ids compartits no hi ha caselles disputades, ni cua de revisió, ni
sonda — per això és l'única hora amb extractor propi
(`migration-to-saints/compline.extract.test.js`) i còpia directa de fitxers.

Els dos models **coincideixen 1:1** als set fitxers, saltiri inclòs (Sl 90 / 85 / 142,1-11 /
30,2-6 + 129 / 15 / 87 / 4 + 133) **i en la regla de la vigília de solemnitat** — cpl-app la
resol sol i saints-app a `dayWhenSpecialDays`. El responsori segueix el mateix patró de sis
línies que Laudes, o sigui que `responsoryParts()` ja el produeix. Detall a
[PLAN §16](migration-to-saints/PLAN.md).

També s'ha estès `export-to-saints-app.js`, que ara copia `output/compline-ca/` a
`saints-app/src/store/db/compline/ca/`. Còpia, no fusió: aquí no hi ha res al destí que pugui
ser feina d'algú altre.

<a id="sa-12"></a>
## SA-12

**Completes en català: 7 fitxers, 114 camps** · 7 de setembre de 2026

`compline/ca/{1..7}.json`, amb la **mateixa forma exacta** que el castellà (16/15/15/18/16/15/19
camps). Verificat contra l'app real (Chrome headless, `selectedLanguage=ca`): capçalera, himne,
salm, antífona, lectura breu, responsori i oració final surten tots en català.

Amb això són **6 de les 7 hores** en català. Falta l'Ofici de lectura (fase 3).

Es regenera amb `npx jest migration-to-saints/compline.extract.test.js` +
`node migration-to-saints/export-to-saints-app.js`.

<a id="d-004"></a>
## D-004 — **OBERTA**

**L'himne de Completes: cpl-app en té dos, saints-app en vol set** · 7 de setembre de 2026

cpl-app tria l'himne de Completes per **temporada** (`NightPrayerCatalan{First,Second}Option
Anthem`, a `NightPrayerService.GetAnthem()`); saints-app en té un per **dia de la setmana**.
`salteriComuCompletes` no té cap columna d'himne. Resolent una setmana sencera, els set dies
donen el mateix himne; el castellà en té set de diferents.

**No és un bug de cpl-app** —és la tria editorial de l'edició catalana— i no s'obre cap
`CPL-LIT`. Mentrestant s'escriu l'himne del Temps Ordinari als set fitxers: és el que cpl-app
resa i deixar la casella buida era pitjor. **Conseqüència visible**: en català es veurà el
mateix himne cada nit.

La sortida recomanada és transcriure els set himnes del volum imprès a
`static-translations/compline_himno.ca.json`. Dossier:
[decisions/D-004](migration-to-saints/decisions/D-004-l-himne-de-completes.md).

<a id="migra-008"></a>
## MIGRA-008

**El panell exportava per una còpia vella que trepitjava text publicat** · 8 de setembre de 2026

`export-to-saints-app.js` es va extreure de `webui/server.js` al setembre precisament perquè
es pogués publicar sense fer refer tot el pipeline al panell. La seva pròpia capçalera diu
«ara el panell requereix això». **No ho feia**: `server.js` es va quedar amb la còpia antiga a
dins i era aquella la que corria quan algú premia «calcular i exportar».

I la còpia havia divergit. Li faltaven dues coses:

- **La protecció de les caselles del Comú.** L'exportació bona no toca una casella que ja té
  text quan qui la vol omplir és el Comú dels sants, i ho reporta a `export-common-held.json`.
  La còpia del panell feia `dest[k] = v` a seques.
- **Les Completes**, que la còpia no copiava.

Es va veure perquè el 8 de setembre a les 08:38 una exportació feta des del panell va canviar
**quatre precs ja publicats** (`preces_contenido` 1968-1971) del Nadal al Comú de Pastors, i va
deixar `celebration_names.json` i `invitatorios.json` buits a `output/` — perquè el panell no
els posa mai a la llista d'hores. Restaurat i re-exportat per la via bona, que les reté.

Dos canvis: `server.js` ara **requereix** l'exportació de debò i s'ha esborrat la còpia; i la
llista d'hores del panell hi afegeix sempre l'Invitatori i el nom de la celebració, que no
tenen casella a la interfície i no són hores que ningú vulgui saltar-se.

<a id="migra-009"></a>
## MIGRA-009

**El join posava l'antífona d'una festa a la casella d'un dia ferial** · 8 de setembre de 2026

Conseqüència de l'[EPREX-005](#eprex-005). A les hores intermèdies, en una festa,
`terciaStore` substitueix la salmòdia sencera per la de la fèria — **antífones incloses**— i
llença l'antífona pròpia que l'índex duu per a aquell dia. La sonda ho mesura correctament: la
casella que l'app llegeix és la de la fèria. I el join, fent el que li toca, hi escrivia el que
resa cpl-app aquell dia, que és l'antífona **de la festa**.

Resultat: 26 caselles compartides per desenes de dies ordinaris rebien text de celebració, no
es posaven d'acord mai i quedaven retingudes. `salmos_antifonas/3412`: 11 variants, «2 de 174
dies bé». I una casella retinguda **no surt en blanc a l'app**, surt com
`[ERR-001] Element no trobat. Informeu-ne aquí`.

El fix segueix la regla de sempre (F6, MIGRA-006): **si el text no té casella pròpia, no
s'observa**. El join ara, per a Tèrcia, Sexta i Nona, comprova dues coses abans d'escriure una
antífona:

1. que la casella mesurada sigui **la que diu l'índex** — si no, el `store` l'ha redirigida;
2. i, si ho ha fet, que l'antífona que dona cpl-app **no sigui la de la fèria** — preguntat com
   sempre, resolent el dia sense celebració i comparant.

Si les dues es compleixen, l'antífona és pròpia i la casella és d'un altre dia: no s'escriu.
**491 antífones** deixen d'observar-se en tota la finestra.

| | abans | després |
|---|---|---|
| `salmos_antifonas` resoltes | 1.067 | **1.083** |
| caselles en conflicte (totes les taules) | 1.998 | **1.976** |
| caselles que deixen de mostrar `[ERR-001]` | — | **6.297, en 1.954 dies** |

<a id="migra-010"></a>
## MIGRA-010

**El comparador del panell no sabia què és l'Ofici ni la missa** · 8 de setembre de 2026

Trobat perquè en Pau va dir: «he clicat a llegir el dia i em surt tot això de només a
saints-app, és normal?». **No ho era.**

El panell resolia la banda de cpl-app amb **`cpl-day.test.js`** —el fitxer que el
[CLAUDE.md](CLAUDE.md) diu explícitament de no fer servir, pel control ferial de Vespres
trencat (MIGRA-001)— i aquell fitxer **no va aprendre mai** ni l'Ofici de lectura ni la missa:
la seva llista d'hores és `'Laudes,Vespers'`. Amb la banda de cpl-app buida, el comparador
etiquetava **els 33 camps** de l'Ofici i de la missa com a «només a saints-app», que és
precisament el contrari del que passa: cpl-app hi té l'ofici sencer.

Tres coses:

- El panell crida ara **`review/resolve-cpl-days.test.js`**, que és el que mana el CLAUDE.md i
  el que ja sap les set hores i la missa. Mateix contracte d'entorn (`DATES`, `OUT`, `DIOCESE`,
  `PRAYING_PLACE`), o sigui que és un canvi d'una línia.
- **La cau es va quedar amb dies resolts per l'antic.** La prova d'obsolescència era «és més
  nova la `cpl-app.db`?», que cap canvi de codi no fa saltar; ara també exigeix que el dia
  desat porti `hours.Office` i `hours.Mass`, igual que ja exigia `ferialFields`. Els 19 dies
  en cau s'han esborrat.
- I una tercera, del mateix fil: **el comparador triava malament la columna de la missa.**
  Deduïa «si cpl-app resa alguna cosa pròpia, va a `CELEBRATION_*`», i això posava la missa
  ferial al costat de les lectures pròpies del Naixement de la Mare de Déu i reportava els set
  camps com a divergents. Qui ho decideix és **l'índex**: una entrada amb rols `CELEBRATION_*`
  du dues misses, una sense en du una de sola. El join no ho endevinava —hi va per la cita
  (PLAN §18.7)— i ara el comparador tampoc.

El 8-IX-2026, abans i després:

| hora | abans | després |
|---|---|---|
| Ofici de lectura | 0 coincideixen · **25 «només a saints-app»** | **20 coincideixen** · 5 difereixen · 0 |
| Missa | 0 coincideixen · 7 difereixen | **5 coincideixen** · 2 difereixen |

Les 2 que queden a la missa són una divergència de debò: cpl-app dona **Rm 8,28-30** de primera
lectura i eprex **Mi 5,1-4a**. El Missal ofereix les dues per a aquell dia.

<a id="migra-011"></a>
## MIGRA-011

**La revisió comparava les citacions de salm en cru** · 8 de setembre de 2026

Trobat revisant el 8-IX-2026: **5 dels 18** camps que la revisió donava per divergents eren el
mateix salm dit de dues maneres.

cpl-app guarda la referència i la seva línia descriptiva en **dues columnes** —`titolSalm1Ofici`
du «Salm 23» i prou— i les taules pròpies deixen la línia fora. saints-app té **una sola
casella**, i el join hi escriu la grafia més completa: és la decisió del 14 d'agost de 2026,
escrita a [`lib/citation-headings.js`](migration-to-saints/lib/citation-headings.js). Per tant,
cada dia amb salmòdia pròpia l'app llegeix «Salm 23 / Entrada del Senyor al santuari» al costat
del «Salm 23» pelat de cpl-app.

El canal **C2** comparava les citacions per empremta —llibre i capítol, com mana el paranys 5 de
la revisió— des del primer dia. El **C1**, que és el que s'aplica quan la casella catalana ja té
text, les comparava byte a byte, tot i que ja calculava `fpCa` i ja importava `splitHeading`
sense arribar a fer servir cap dels dos.

Ara, al C1, una citació que difereix **només** en la línia descriptiva és `sameRefHeading` i no
compta com a divergència. S'excusa únicament que la línia **falti** en un costat: dues
descripcions diferents per a una mateixa referència segueixen sent visibles, perquè l'únic cas
del corpus és una errata de la BD (`diesespecials` fila 27, «Que tol l'univers»).

| dies mesurats | divergències abans | després |
|---|---|---|
| 8-IX-2026 | 18 | **13** |
| 8 festes de 2026 | 122 | **79** |

Les **43** caselles excusades en aquests vuit dies tenen totes la primera línia idèntica als dos
costats; cap no ha calgut mirar-la a mà.

<a id="eina-revisio-dia"></a>
## EINA-revisio-dia

**La revisió d'un dia respon al terminal, no amb una pàgina** · 14 de setembre de 2026

La skill `revisio-dia` acabava publicant `run/review.html` com a artifact. Per a l'ús real
—agafar **un dia** i treballar-lo fins al 100%— la pàgina no servia: el que cal és saber per què
no hi és, de qui és la culpa, quines accions i quines decisions falten, i continuar en el mateix
fil.

- **Nou** [`review/day-gap.js`](migration-to-saints/review/day-gap.js): escriu en text pla tot
  el que separa el dia del 100% —cada camp divergent amb la seva troballa o `SENSE INVESTIGAR`,
  les retingudes agrupades pel conflicte que les reté i quants dies trencaria cada tria, les que
  no tenen font, i les troballes del dia.
- `isDivergent` i `isOnlyApp` passen de `build-report.js` a
  [`review/findings.js`](migration-to-saints/review/findings.js), perquè la pàgina i el text
  comptin el mateix. Comprovat: `review.html` surt **idèntic byte a byte** abans i després.
- `make review` acaba amb `day-gap.js`; la pàgina queda a `make review-html`.
- [SKILL.md](.claude/skills/revisio-dia/SKILL.md): sense data revisa el dia d'avui, investiga
  tot el que surti `SENSE INVESTIGAR` abans de respondre, i respon per causes (on som · per què
  no és al 100% · accions ordenades per caselles alliberades · decisions · el sostre real · per
  on començar). Cap artifact.

<a id="migra-012"></a>
## MIGRA-012

**El refactor de `master` va trencar la migració en silenci, i ara no podrà** · 25 de setembre de 2026

En fusionar `master` a `catalan-migration` la migració va deixar de funcionar: **7 de les 11
suites** queien i les 4 que aguantaven eren les de text pur. La causa no era subtil —`master`
duia `refactor: the code, in English`, `properties in camelCase` i `naming-standards`, 312
fitxers de `src` (+23.700/−17.200)— però **la manera de trencar-se sí que ho era**:

| | |
|---|---|
| Les que petaven | `src/Models/HoursLiturgy/` → `src/models/hours-liturgy/`. Es veuen de seguida |
| Les **silencioses** | `ObtainHours` → `obtainHours`, `.Today` → `.today`, `.Anthem` → `.anthem`. No llancen res: llegeixen `undefined` i escriurien caselles buides damunt de text bo |

I res no ho vigilava: [eslint.config.js](eslint.config.js) **ignora `migration-to-saints/`**, i
en ser JS pla `make types` no hi entra (`allowJs` sense `checkJs` el carrega però no el
comprova). Els únics detectors eren els tests de la carpeta, i se'n van assabentar en fusionar.

**La correcció no és renombrar: és moure la costura on el compilador la llegeix.**

- **Nou [`src/liturgy-export/`](src/liturgy-export)**, dins de l'app i en TypeScript: `settings.ts`
  (els ajustos, sense AsyncStorage), `resolveDay.ts` (el dia, els bessons ferials i les dues
  meitats de la missa) i `indexFields.ts` (el vocabulari de l'índex de saints-app: `himno`,
  `primer_salmo_texto`, `FIRSTLECTURE_ref`…). `index.ts` és l'única porta: `resolveDayFields()`.
- **Nou [`src/services/liturgy/liturgyDayInformationService.ts`](src/services/liturgy/liturgyDayInformationService.ts)**:
  `obtainLiturgyDayInformation` i `isSpecialChristmas` eren privats dins de `dataService` i la
  migració en duia **tres còpies** («copied verbatim from DataService.tsx, it isn't exported»).
  Ara hi ha una definició i el `dataService` la crida igual que la migració.
- [`migration-to-saints/lib/cpl-day-resolver.js`](migration-to-saints/lib/cpl-day-resolver.js)
  passa de 520 línies a ~90: és el pont, i el que hi queda és el que és de la migració i no de
  cpl-app (la comparació ferial i les dues columnes de la missa, a `lib/mass-columns.js`).
- **Les tres còpies de la resolució, fora.** `join-content.test.js`, `laudes.extract.test.js` i
  `celebration-probe.test.js` en tenien una cadascuna, amb el seu `buildSettings` i el seu
  `isSpecialChristmas`. I les **8 còpies del mock de la base de dades** passen a fer servir
  [`__tests__/helpers/mockDatabaseManager.js`](__tests__/helpers/mockDatabaseManager.js), que ja
  existia i que el manté l'app.
- **Fora també** el `expandResponsory` i el `GLORIA_PATRI_SHORT` de `join-content.test.js`: codi
  mort, i una tercera còpia de la regla del responsori de sis línies.
- **El directori era `src/services/Liturgy` al disc i `src/services/liturgy` al git** —un canvi de
  caixa que no va arrelar en un sistema de fitxers que no distingeix majúscules— i generava 14
  errors `TS1261`. Corregit al disc.

**La prova que el guardià és de debò**: amb `role('firstReading', 'readingRenamed')` o amb
`hourData.anthemRenamed`, `npx tsc --noEmit` cau amb `TS2345` i `TS2339`. Abans d'això,
`make types` ja fallava amb **61 errors** de caixa i ningú no se n'havia adonat; ara en fa 0.

### Que no ha canviat res, comprovat

| control | resultat |
|---|---|
| Els 370 tests de litúrgia de l'app (goldens inclosos) | idèntics |
| `review/run/cpl-days.json` del 14-IX, contra el committejat | **tots els valors idèntics**; només canvia l'ordre de les claus de `ferialFields` |
| La sonda de celebracions, 3.650 dates contra el committejat | 6 dates diferents, **totes de la BD v5**: la Setmana Santa de 2026, sant Vicenç que passa de lliure a memòria i santa Teresa de Calcuta, que abans no hi era. Ho diu el propi `anyliturgic` |
| El join sencer | 62 segons; les caselles, vegeu [CPL-LIT-001b](#cpl-lit-001b) i [MIGRA-013](#migra-013) |

**Queda obert**: `observeHour` del join encara llegeix el model camp a camp en paral·lel a
`extractHourFields`, que és la mateixa feina dues vegades. Ara les dues són al mateix
vocabulari i cauen juntes si una es trenca, però val la pena unificar-les.

<a id="migra-013"></a>
## MIGRA-013

**MIGRA-001 tancat a l’arrel: un sol resolutor de dies, i cap parany** · 25 de setembre de 2026

El [MIGRA-001](#migra-001) deia que `mergeVespersWithCelebration` escriu **dins** de l'objecte
«sense celebració» (`let vespers = withoutCelebrationVespers`, [vespersService.ts:42](src/services/liturgy/vespersService.ts)),
o sigui que `hoursLiturgy.vespersOptions.vespersWithoutCelebration` **no és** el control ferial:
és les Vespres renderitzades. Qui el llegia marcava els 19 camps de Vespres com a ferials i
inventava una divergència a **cada memòria**.

Mai no es va corregir a l'origen. Es va treballar al voltant: `join-content.test.js` en duia el
control bo a la seva còpia, `review/resolve-cpl-days.test.js` es va escriure **sencer** per
tenir-lo, i l'[AGENTS.md](AGENTS.md) i la skill `revisio-dia` prohibien fer servir
`cpl-day.test.js`. Tres fitxers i dues regles escrites per sortejar vint línies.

Ara el control es pren **una vegada**, fresc, dins de `resolveFerial()` de
[`src/liturgy-export/resolveDay.ts`](src/liturgy-export/resolveDay.ts), i **abans**
d'`obtainHoursLiturgy`, que és quan res no hi ha escrit encara cap celebració:

```ts
vespers: obtainVespers(masters, liturgyDayInformation.today, settings),
```

Conseqüències:

- `review/resolve-cpl-days.test.js` passa de **200 línies a 43** i no té cap còpia. Surt
  **idèntic** al committejat, valor per valor.
- `cpl-day.test.js` deixa de ser un parany, i la prohibició de l'[AGENTS.md](AGENTS.md) i de la
  skill `revisio-dia` **s'ha retirat**: era un avís que havia passat a ser fals, i un avís fals
  envia el proper agent pel camí equivocat. Al seu lloc hi ha tres paranys que sí que hi són
  (la porta única a `src/liturgy-export`, que un `CPL-LIT` de codi es pot perdre en una fusió, i
  que una base acabada de baixar no duu cap fix de dades). En Pau ho pot desfer si no li quadra.
- **Els camps ferials només es marquen a Laudes i Vespres**, que són les dues úniques hores amb
  pestanya de memòria/fèria. `cpl-day.test.js` els marcava a les hores intermèdies també, i
  `resolve-cpl-days.test.js` no: ara la regla és una, amb el perquè al costat.
- `resolve-cpl-days.test.js` **se salta** quan no se li donen dates, en lloc de deixar
  `make tests` en vermell perquè ningú li ha demanat cap dia.

<a id="migra-014"></a>
## MIGRA-014

**El CPL-LIT-003 delatava el pedaç al `_tables_log`** · 25 de setembre de 2026

En reaplicar `db-fixes/CPL-LIT-003.sql` sobre la base v5, `_tables_log` va passar de **12.615 a
12.617**. `salteriComuVespres` i `santsMemories` duen un disparador `log_update_*` que insereix
una fila per cada `UPDATE`, i l'[AGENTS.md](AGENTS.md) és explícit: **mai no s'hi afegeixen
files**, perquè el seu recompte és el que la wiki del CPL compara amb la versió publicada. Amb
dues files de més, el pedaç es delata i sembla que la base no és la que diu que és.

El `.sql` no ho netejava: qui el va aplicar el 2 de setembre ho devia fer a mà, i el fitxer
—que és **l'únic registre** del canvi— no ho deia enlloc. El CPL-LIT-002 no ho necessita perquè
`anyliturgic` no té disparador.

Ara el fitxer porta un pas 5 que treu les seves pròpies files i torna enrere el
`sqlite_sequence` (o el proper registre de debò salta dos números), i un pas 6 que imprimeix el
recompte per a poder-lo comparar. Filtra per data i per fila, **no per id**, com la resta del
fitxer. Comprovat: executat dues vegades seguides, el **sha256 de la base no es mou**
(`9bec0208…`) i el recompte es queda a 12.615.

<a id="eina-mes"></a>
## MIGRA-015

**La taula de llibres bíblics no coneixia mig Antic Testament** · 25 de setembre de 2026

Revisant el 25 de setembre, la primera lectura de la missa sortia com a divergència: cpl-app diu
`Ecle 3,1-11` i eprex `Ecles 3, 1-11`. És **el mateix** — Eclesiastès 3,1-11 — però
`BOOK_ALIASES` de [`lib/citation-key.js`](migration-to-saints/lib/citation-key.js) tenia `ecle` i
no `ecles`, i el castellà queia a `ANON`.

No és soroll de revisió, **és contingut que no es migra**: el join de la missa empelta cada
lectura a la seva casella **per la cita**, i el que no s'aparella es queda en blanc.
`lecturas_referencia/486` i `lecturas_texto/607` no eren ni al `join-pending-review.json`. A tot
el corpus, **87 cites** amb el llibre no reconegut i encara sense català —`Eclo` (29), `1 Sam`
(20), `2 Sam` (15), `Jon`, `Jc`, `Jos`, `Ecles`, `1/2 Cro`, `1/2 Mac`, `Ne`, `Esd`, `Rt`, `Ct`—
cadascuna amb el seu text al costat.

I falla en els dos sentits. Quan totes dues bandes cauen a `ANON` el token es redueix al capítol
i dues lectures diferents comparen **iguals**: `Jt 2` (Jutges, que en català s'abrevia `Jt`) i
`Jdt 2` (Judit) sortien iguals. N'hi havia **21** de comparacions cegues així.

La taula ara té els llibres que hi faltaven i les formes castellanes que hi faltaven. **`si` no
s'hi ha posat a posta**: el castellà escriu el Siràcida `Eclo`, i els set `Si …` del corpus són
el començament d'una rúbrica.

| control | resultat |
|---|---|
| Les 4 taules de cites, ca + es, abans i després | 9.836 sense canvi · **160 llibres nous reconeguts** · **0 canviats** |
| El test és un detector | sense el pedaç, **22 dels 31** de `citation-key.test.js` cauen |
| `make tests` | les 4 suites de goldens cauen per la BD nova (esperat); cap més |

Dossier: [tooling-bugs/MIGRA-015](migration-to-saints/tooling-bugs/MIGRA-015.md).

**Queda pendent**: tornar a passar el join i l'exportació perquè les 87 lectures arribin a
saints-app. I `1 Tt 1, 1-9` (`lecturas_referencia/526`) és **Titus** amb un «1» de més al
davant: error d'eprex, no abreviatura, i per això no s'ha mapat.

## MIGRA-016

**La sonda llegia hores que saints-app encara no havia carregat per al dia** · 29 de setembre de 2026

Amb saints-app a `dev`, `setDate` només espera les hores que algú ha obert i la resta les carrega
quan el navegador no fa res; a més, una hora amb una càrrega pendent d'un altre dia torna aquella
i no la nova. La sonda llegia els stores just després de `setDate`, i l'11-3-2017 Laudes li
sortien les dels arcàngels (el 29 de setembre, el dia en què arrenca l'app). El 2017 tenia 227
dies amb caselles mogudes, contra uns 95 als altres anys, i el join en treia 313 conflictes nous.

| | |
|---|---|
| Correcció | `PROBE` demana cada hora per a la data i n'espera la càrrega; la pàgina no té temps d'inactivitat |
| Dossier | [tooling-bugs/MIGRA-016](migration-to-saints/tooling-bugs/MIGRA-016.md) |
| Commit | `02d5724` |
| Per a en Fernando | La desduplicació per hora sense data també pot deixar una hora amb el dia d'abans si l'usuari canvia de data mentre carrega |

## MIGRA-017

**El join aparellava els responsoris per posició encara que l'app no en mostrés sis** · 29 de setembre de 2026

Les Vespres de sant Jaume, amb saints-app a `dev`, mostren el responsori amb set caselles (una de
repetida) el 24 de juliol i amb cinc el 25. El join hi aparellava les sis línies de cpl-app per
posició, i l'exportació anava a canviar sis caselles bones per les del costat
(`responsorios/18666` passava a dir `℟. Si sou deixebles meus.`; el castellà hi diu
`℣. En que os amáis unos a otros.`).

| | |
|---|---|
| Correcció | Per posició fins a la primera casella que l'app repeteix; gens si l'app en mostra menys que cpl-app |
| Comprovat | Contra aparellar-ho tot, només deixen d'escriure's les caselles corregudes de sant Jaume; sant Andreu (el Glòria dues vegades al final) i el Pilar (quatre caselles per a dues línies) es queden com eren |
| Dossier | [tooling-bugs/MIGRA-017](migration-to-saints/tooling-bugs/MIGRA-017.md) |
| Commit | `d3322a2` |

## EINA-mes

**El mes diu per què cada dia no és al 100%, no només quant li falta** · 25 de setembre de 2026

El calendari del panell ja hi era i ja donava el % de cada dia. El que no deia és **per què**, que
és amb el que comença cada sessió de feina: calia obrir el dia per saber-ho.

`checkDay` ja calculava `blameSummary` —de quina celebració és la culpa, camp a camp—, o sigui que
no calia cap càlcul nou: només **pujar-lo al mes**.

- **`monthCause()`** a [day-check.js](migration-to-saints/day-check.js): la causa que desbloquejaria
  més camps **pel seu compte** (`soleFields`), perquè una causa compartida amb d'altres no mou res
  fins que aquelles també es resolguin. Si no hi ha cap culpable, la forma del forat és la resposta:
  caselles retingudes (algú altre hi discrepa) i caselles sense cap valor observat demanen feines
  oposades i no se sumen mai.
- **`checkMonth` retorna `causes`**, les del mes senceres i ordenades pels dies que toquen. Una acció
  que arregla sis dies val més que sis accions, i una graella de trenta caselles és exactament el que
  ho amaga.
- **Al panell**: la causa surt a cada cel·la (retallada a dues línies), sencera al *tooltip* amb què
  hi celebra cpl-app, i la llista de causes del mes sota el calendari.
- **Al terminal**, tres ordres que responen a les tres preguntes reals i llegeixen **la mateixa**
  sortida ja generada —ni base de dades, ni join—, o sigui que els números no poden discrepar:

  | | | |
  |---|---|---|
  | `make progress` | com anem, tota la finestra | ~25 s |
  | `make month [YM=2026-09]` | aquell mes, dia a dia | <1 s |
  | `make day-check [DATE=…]` | aquell dia, camp a camp (avui, si no en dius cap) | <1 s |

  `make progress` acaba amb **les celebracions que retenen més dies de tota la finestra**, que és
  la llista per on val la pena començar: cada una es paga una vegada i es cobra a tots els seus
  dies. La Sagrada Família, ella sola, en toca **299**.

Setembre de 2026, tal com queda: **80%**, 0 dies complets de 30, i **19 causes** per a tot el mes.
Les tres primeres (els arcàngels, santa Teresa Beneta de la Creu i la Commemoració dels fidels
difunts) toquen 7 dies entre totes tres.

I la finestra sencera, que fins ara no es podia demanar d'una ordre: **78%** (353.789 de 453.859
camps), molt estable any per any (77-78% els deu), i **0 dies sencers de 3.651**. Aquest segon
número és el que encara no s'ha mogut gens, i el que val la pena mirar: cap matí, en deu anys, es
pot obrir eprex i llegir-ho tot en català.

<a id="eina-anada-i-tornada"></a>
## EINA-anada-i-tornada

**La migració es valida sola, en el vocabulari de cpl-app** · 25 de setembre de 2026

`~/projects/personal/cpl-db-es` es va escriure per a fer la base castellana de cpl-app a partir dels
textos de saints-app. Però accepta `LANG_CODE`, i el català és **l'idioma que la migració hi va
posar**, o sigui que tornar-lo a treure tanca un cercle:

```
cpl-app.db → el join → saints-app/commons/ca → cpl-db-es → cpl-app-ca.db → comparar
```

Una casella que torna diferent és una casella que la migració va col·locar malament, **dita en les
taules i les files de cpl-app** — sense espai d'ids compartits, sense percentatges — que és el
vocabulari en què estan els volums impresos i l'únic en què en Pau pot dir «això no és així».

`src/check.js` només comparava **presència** (plena/buida). Ara, amb `ca`, compara també el **text**:

```sh
cd ~/projects/personal/cpl-db-es
LANG_CODE=ca make db && LANG_CODE=ca make check
```

| | |
|---|---|
| Caselles que aquesta base omple i la catalana deixa buides | **0** — l'invariant que ja hi havia, intacte |
| Caselles que la catalana omple i saints-app no té | **8.054** — el forat que queda de la migració, en taules de cpl-app |
| Caselles que tornen amb un text diferent | **1.370** — la cua de feina |

S'exclouen `_publication` i `_tables_log` (no són litúrgia) i les **transformacions volgudes**, que
es declaren amb el lloc on es van decidir: avui només el prefix `Sl ` del salm responsorial (PLAN
§18.3) — 568 caselles que abans sortien com a diferència i són la regla funcionant.

Les diferències es presenten **agrupades per taula i columna**, perquè una regla que falla escriu
cinc-centes caselles i continua sent una sola cosa a arreglar. La primera passada ja retroba sola
tres qüestions obertes —la [D-005](#d-005) (`salteriComuOfici.himneNitCat`: torna l'himne de dia on
cpl-app té el nocturn), la P-14 (`diesespecials.titolSalm1Ofici`: «Salm 23» contra «Salm 23 ·
Entrada del Senyor al santuari») i el llatí copiat d'`es`— i n'ensenya una que no estava anotada:
**els precs d'Advent tornen començant per una petició en lloc de per la introducció**
(`tempsAdventSetmanes.pregariesLaudes`, 19 caselles). Sense classificar encara.

**El que no fa**: no veu quina casella llegeix l'app (això és la sonda), ni els conflictes retinguts,
ni el salteri que el generador dedueix per majoria. No substitueix `day-check.js`; mesuren coses
diferents i les vols totes dues.

<a id="eprex-005"></a>
## EINA-calendari

**La migració pren el calendari de litcal i ja no el genera** · 29 de setembre de 2026

Des del 28 de setembre, la capa catalana de litcal és un model fet a partir de la taula
`anyliturgic` (branca `catalan-calendars`, PR #25): ciutat i catedral, els ids de romcal per als
sants universals, regles amb anys. D'aquesta capa en surt ara la taula de cpl-app (cpl-cloud,
procés X). Les eines de la migració, en canvi, encara la generaven de `cpl-app.db` amb pèrdues
(§6 del PLAN), i el botó «Refrescar-ho tot» del panell la reescrivia a `litcal/src/data/calendars/`.

| | |
|---|---|
| Panell | Fora l'etapa 1 (`generate-catalan-calendars.js`), la 2 (`build-catalan-calendars.ts --write`, de litcal) i l'informe de sants descartats. «Compilar litcal» fa el que cal: el carregador, el `dist/` i la còpia a saints-app. Les targetes, de l'1 al 5 |
| Generador | `generate-catalan-calendars.js`, esborrat. Sense arguments escrivia directament a litcal |
| Quina celebració coneix litcal | [`missing-celebrations.js`](migration-to-saints/missing-celebrations.js) ho treu de `cpl-cloud/calendar/data/celebrations.json`, el del procés X: el nom de l'app → l'id de litcal, l'origen i els llocs. Abans ho buscava pel `catalanName` de les regles o per l'slug del nom, que la capa nova ja no fa servir |
| Efecte, amb el manifest del 14-9 | «Falten a litcal»: d'1 a 0 (santa Maria en dissabte ja hi és). La resta de veredictes, igual. Ja no proposa cap id: una celebració que falti s'afegeix a litcal a mà |
| Commits | `3193fb5` (panell), `2a66094` (`celebrations.json`) |
| Reaplicar | **No** — és codi, va al git |

**Queda a litcal** `scripts/build-catalan-calendars.ts`, que ja no crida ningú. És de la branca
`catalan-calendars` (PR #25), i s'ha de treure allà.

## EINA-db-fixed

**La migració llegeix una còpia amb els fixos, i la base del lloc queda com es publica** · 29 de setembre de 2026

Els dos `db-fixes` es perden cada cop que es torna a baixar la base (el 25 i el 28 de setembre), i
posar-los a la del lloc té un preu: els goldens de `master` s'hi graven sense (el sha256 ja no hi
quadra) i `make proposal` en treu els textos. En Pau, el 29-9: es faran permanents al final; fins
llavors, que la migració no en depengui.

| | |
|---|---|
| `make db-fixed` | Copia la base del lloc a `migration-to-saints/output/cpl-app.fixed.db` (ignorada), hi aplica els dos `.sql` i hi passa els dos detectors |
| `CPL_DB` | La variable que ja llegia el mock dels tests, ara també a totes les lectures directes de la migració ([`lib/cpl-db-path.js`](migration-to-saints/lib/cpl-db-path.js)): el join, el Comú, la revisió, el panell i els dos detectors |
| Comprovat | Amb `CPL_DB` a la còpia, el join surt com el del git (`commons-ca/` idèntic), llevat del 9-6-2018 del [CPL-LIT-006](#cpl-lit-006). Amb la base publicada, retindria unes 80 caselles de la Immaculada i l'Advent (el [CPL-LIT-002](#cpl-lit-002)) |
| `FROM` | `make db-fixed FROM=../cpl-cloud/calendar/out/cpl-app.db` fa la còpia de la base del procés X, amb el calendari tret de litcal. Per a Barcelona 2017–2026 el join en surt amb els mateixos textos: el calendari que movia caselles era el de saints-app |
| `make checks` i `make tests` | Hi passen els dos detectors de dades sobre la còpia (la fan), i la resta de tests sobre la base del lloc. Si no, cap `push` de la branca no passaria el hook: contra la base publicada només poden fallar |
| Commit | `1dbfce3`, `38a2547` (`FROM`), el del `make checks` |
| Reaplicar | **No** — és codi, va al git |

## EPREX-005

**A les hores intermèdies, una festa perd la seva antífona pròpia** · 8 de setembre de 2026

`terciaStore.ts` i els seus bessons substitueixen, en una festa, els nou camps de la salmòdia
pels de la fèria. Els salms, bé —cpl-app fa igual—; les **antífones**, no: s'endú també
l'antífona pròpia que l'índex duu per a aquell dia.

El 8-IX-2026 (Naixement de la Mare de Déu) `all_tercia.json` diu
`primer_salmo_antifona: 4811` i `-1` a les altres dues —una sola antífona, com mana l'OGLH i
com resa cpl-app— i l'app llegeix les tres de la fèria. La 4811 no l'obre ningú. **513 dies**
de la finestra fan això.

Es tanca traient tres línies de l'override. Dossier:
[eprex-bugs/EPREX-005](migration-to-saints/eprex-bugs/EPREX-005.md).

<a id="sa-15"></a>
## SA-15

**83 antífones noves i 6.297 errors visibles menys** · 8 de setembre de 2026

Re-exportació després de MIGRA-009. **83 caselles d'antífona** que estaven retingudes per culpa
del text de festa passen a tenir el text ferial que els pertoca, i amb elles **6.297 caselles de
1.954 dies** deixen de mostrar `[ERR-001] Element no trobat` a la pantalla.

Verificat a l'app real: el 8-IX-2026 la Tèrcia passa de
`Ant. 1. [ERR-001] Element no trobat` a `Ant. 1. Qui estima ha complert tota la Llei.`

També s'hi han restaurat els quatre precs que l'exportació del panell havia trepitjat
([MIGRA-008](#migra-008)).

## SA-16

**dev portat a la branca catalana, i les I Vespres de demà per precedència** · 29 de setembre de 2026

`catalan-language-support-dev` anava 61 commits enrere de `dev` (textos del 28-9, el refactor de
les Vespres, la FEAST2 a les hores menors). Quatre conflictes: tres d'imports a les hores menors, i
les Vespres. `dev` decidia les I Vespres pels camps de l'índex (l'entrada de demà en té i la
d'avui no); la SA-09, per la precedència. Tots els diumenges porten camps d'I Vespres i cap festa
no en porta, o sigui que els camps sols no diuen qui cedeix:

| vigília | amb la regla de `dev` | amb la precedència |
|---|---|---|
| 7-12-2025, diumenge II d'Advent → Immaculada | II Vespres del diumenge ✓ | les mateixes ✓ |
| 14-8-2022, diumenge XX → Assumpció | II Vespres del diumenge ✗ | I Vespres de l'Assumpció ✓ |
| 24-12-2023, diumenge IV d'Advent → Nadal | II Vespres del diumenge ✗ | I Vespres de Nadal ✓ |
| 14-9-2019, dissabte, Exaltació de la Santa Creu | I Vespres del diumenge ✗ | les de la festa del Senyor ✓ |

Ara hi ha una sola regla, `prayFirstVespersOfTomorrow` (`utils/firstVespers`): les I Vespres de
demà si en té i si demà supera avui (OGLH 61). `dateStore` en duia una còpia per a la capçalera de
la pàgina i fa servir la mateixa. El cas del dissabte el va trobar la sonda: la primera versió de
la fusió deixava cedir sempre un dia sense camps d'I Vespres.

| | |
|---|---|
| Commits | `f1cc32d42` (la fusió), `4709adfe4` (la precedència sola, i `dateStore`) |
| Test | `firstVespers.spec.ts`, 8 de 8; sense la precedència, en fallen 3. La resta de vitest, els mateixos 10 errors d'abans de la fusió |
| Comprovat a l'app | La sonda llegeix les I Vespres de l'Assumpció el 14-8-2022, les del diumenge el 7-12-2025 i les de Nadal el 24-12-2023 |
| De rebot | El detector de la [MIGRA-006](#migra-006) comptava amb la disputa del 23-6-2022; ara les dues apps hi resen les Vespres del Baptista, i el test comprova que les nou vigílies escriuen la casella (`f5abb4c`) |

## SA-17

**Reexportació amb el calendari català de litcal i els textos de dev: 493 caselles noves** · 29 de setembre de 2026

Litcal a `catalan-calendars` (la capa catalana refeta, [EINA-calendari](#eina-calendari)),
saints-app amb la [SA-16](#sa-16), la sonda de la [MIGRA-016](#migra-016) i el join de la
[MIGRA-017](#migra-017), sobre la base v5 amb els dos `db-fixes` ([EINA-db-fixed](#eina-db-fixed)).
Finestra 2017–2026, Barcelona.

| | caselles en conflicte | ids resolts |
|---|---|---|
| Abans (litcal del 14-9) | 1.886 | 19.375 |
| Litcal nou | 1.829 | 19.526 |
| Litcal nou + `dev` + les correccions | **1.677** | **19.724** |

A saints-app: **493 caselles noves** (99 referències i 98 textos de lectures de la missa —les de
la [MIGRA-015](#migra-015)—, 93 responsoris, 45 antífones…) i **28 de canviades**, repassades
contra el castellà de cada casella: 8 que ara sí que en són la traducció (les antífones de la
Immaculada 9395–9397 duien les d'Advent), 5 correccions de la CPL a la publicació 5, 7 només
d'espais i 8 de les Vespres de després de l'Epifania, que no ho són ni abans ni ara (l'edició
catalana hi va per data, la castellana per dia de la setmana: per revisar). Completes no canvia
de contingut i no s'ha tocat.

`make progress`: el **80%** dels camps de la finestra (371.748 de 464.428).

<a id="migra-018"></a>
## MIGRA-018

**El join triava les lectures de la missa pel capítol, i en va exportar nou amb el text d'una altra missa** · 30 de setembre de 2026

A la missa, el join decideix quina lectura de cpl-app va a cada casella per la cita que el
castellà ja hi té (PLAN §18.7). Però comparava només **llibre i capítol**, i guanyava la primera
candidata que hi encaixava. Resultat, a saints-app en català, cada any:

- la **vigília de sant Joan Baptista** (24-VI) llegia l'evangeli de la missa del dia (Lc 1,57-66
  en lloc de Lc 1,5-17), i també la seva aclamació;
- la **vigília de Nadal** (24-XII), el salm de la missa del matí;
- la **Mare de Déu del Roser** (7-X), el Benedictus en lloc del Magníficat com a salm;
- el **Comú de màrtirs** (santa Àgata, sant Maximilià Kolbe), **sant Lleó el Gran**, **sant Felip
  Neri**, **santa Teresa Jornet**, **sant Carles Borromeu** i **sant Gregori el Gran**, una lectura
  de la fèria d'un any concret.

| | |
|---|---|
| Correcció | `readingMatch()` a `lib/citation-key.js` gradua pels versets; cada lectura de cpl-app va a la casella del dia on encaixa millor; la missa d'ahir només compta si hi encaixa sencera |
| Comprovat | Contra el join d'abans, amb la mateixa base i sonda: deixen de sortir les 9 cites i 8 textos dolents, surten 7 cites i 8 textos bons que retenien, i no es perd cap lectura bona (la Vigília Pasqual i els dies de després de l'Epifania es mantenen) |
| Test | `citation-key.test.js`, «readingMatch», amb les vuit parelles exportades; sense la correcció en fallen 12 de 43. `make tests`: 945 i els 22 dels detectors, tots bé |
| Dossier | [tooling-bugs/MIGRA-018](migration-to-saints/tooling-bugs/MIGRA-018.md) |
| Commit | `15b1375` |

<a id="migra-019"></a>
## MIGRA-019

**La revisió comparava la missa ferial de cpl-app amb les lectures del sant** · 30 de setembre de 2026

El dia de sant Jeroni la revisió deia que la missa no coincidia (Jb 9 contra 2 Tm 3). No era
veritat: cpl-app resa la missa del dia de la setmana, com prefereix el Missal a les memòries sense
lectures pròpies, i la columna ferial de saints-app diu el mateix. La revisió posava aquella missa
també a la columna del sant. Passava a totes les memòries sense missa pròpia, amb 3-5 divergències
falses cada dia. No toca l'app ni el join; sí el que arribava a en Pau.

| | |
|---|---|
| Correcció | `massColumns()` torna només la columna ferial quan la missa que resa cpl-app és la ferial |
| Test | `mass-fields.test.js`, «the two columns of a memorial» (sant Jeroni i els Àngels de la Guarda); sense la correcció falla el primer |
| Efecte | El 30-IX, de 130/133 a 132/132 |
| Dossier | [tooling-bugs/MIGRA-019](migration-to-saints/tooling-bugs/MIGRA-019.md) |
| Commit | `7fdbea0` |

<a id="sa-18"></a>
## SA-18

**Fora nou lectures de la missa que duien el text d'una altra, i quinze de noves** · 30 de setembre de 2026

Reexportació després de la [MIGRA-018](#migra-018). L'exportació només afegeix o canvia claus: les
17 caselles dolentes que el join ja no produeix s'han tret **a mà** de `commons/ca`.

| | |
|---|---|
| Esborrades | `lecturas_referencia` 283, 328, 444, 703, 927, 964, 1619, 1790, 1946 · `lecturas_texto` 350, 408, 553, 883, 998, 1163, 2426, 6058 |
| Noves | `lecturas_referencia` 297, 988, 1531, 1559, 1640, 1845, 4342 · `lecturas_texto` 88, 368, 473, 1225, 1918, 2057, 2302, 6173, totes iguals al castellà |
| No tocat | Completes: l'exportació en reescriu els set fitxers, però només hi canvia l'ordre de les claus; desfet, com a la [SA-17](#sa-17) |
| Commit | `56fbbcd54` (saints-app, branca `catalan-language-support-dev`) |

<a id="migra-020"></a>
## MIGRA-020

**Les pregàries de Vespres del dimecres II anaven una casella corregudes** · 30 de setembre de 2026

Al llatí, el dimecres II a Vespres hi ha **cinc** pregàries, i la quarta té dues opcions («vel»): el bon
temps per a les collites, **o bé** que el Senyor ens alliberi de tot perill i beneeixi les nostres cases.
La CPL en dona cinc, amb la primera opció: **és correcte**. El castellà imprimeix les dues opcions
seguides i l'índex de saints-app hi té sis caselles. El join les aparellava per posició, i la pregària
dels difunts anava a la casella de l'alternativa. Es va prendre primer per un error de cpl-app, perquè
`liturgiadeleshores.cat` en té sis; aquella web no és oficial i imprimeix com el castellà. No hi ha CPL-LIT.

| | |
|---|---|
| Decisió | En Pau, 30-9-2026: la casella de l'alternativa (`preces_contenido/9573`) queda sense català; el català mostra les cinc de la CPL |
| Correcció | `lib/preces-alignment.js`: les llistes decidides, **una per una**, i quina pregària va a cada casella; totes les altres, per posició. El fan servir el join i el comparador de la revisió |
| Test | `preces-alignment.test.js` |
| Per a en Fernando | Les hores mostren «id … not found» quan falta un text; cal amagar-lo, com ja fa la missa |
| Dossier | [tooling-bugs/MIGRA-020](migration-to-saints/tooling-bugs/MIGRA-020.md) |
| Commit | `7ded8b1` |

<a id="sa-19"></a>
## SA-19

**La pregària dels difunts dels dimecres II, a la seva casella** · 30 de setembre de 2026

Reexportació després de la [MIGRA-020](#migra-020): `preces_contenido/9574` passa a tenir la pregària dels
difunts, i la `9573` s'ha esborrat **a mà** (l'exportació no esborra). 56 dies de la finestra.

| | |
|---|---|
| Commit | `26767fa24` (saints-app, branca `catalan-language-support-dev`) |

<a id="sa-20"></a>
## SA-20

**Una pregària que un idioma no té, ja no surt com «id … not found»** · 30 de setembre de 2026

Quan a un idioma li falta un text, saints-app en mostrava el marcador tècnic («id 9573 not found in
preces_contenido»). A la missa ja l'amagava; a les hores, no. En Pau, responsable del programari, el
30-9: a les pregàries no és cap error (un idioma en pot tenir menys que un altre, com a la
[MIGRA-020](#migra-020)) i no s'ha de veure; **a la resta de textos sí**: si falla un salm s'ha de
veure, perquè ens ho reportin.

| | |
|---|---|
| Codi | `src/utils/missingText.ts` (nou): `withoutMissingPreces()`, aplicat a les pregàries de Laudes i Vespres, també a la pestanya ferial; `isMissingTextPlaceholder` s'hi trasllada i `TextService` el continua exportant |
| Test | `tests/unit/utils/missingText.spec.ts`, 3 de 3. La resta de vitest, les mateixes 10 fallades d'abans (findOfficeDeceased, bible-parallels, calendari); `tsc` sense errors |
| Commit | `6899c5077` (branca `catalan-language-support-dev`) |

<a id="migra-007"></a>
## MIGRA-007

**La revisió llegia totes les hores amb el vocabulari de Laudes** · 8 de setembre de 2026

Trobat perquè en Pau va preguntar si el panell i la skill contemplaven ja totes les oracions.
**No**: el pipeline de revisió va quedar enrere a les fases 3 i 4 i ningú no ho havia comprovat.

`day-compare.js` recorria **`dayCheck.FIELDS`** —la llista de Laudes— per a **cada** hora:

```js
const FIELD_ORDER = dayCheck.FIELDS.map((f) => f.key);   // sempre la de Laudes
for (const key of FIELD_ORDER) { … }
```

De manera que de l'**Ofici de lectura** només se'n revisaven **11 dels 25 camps** (els salms i
l'oració final, que comparteixen nom amb Laudes) i **de la missa, cap**: els seus rols no
comparteixen cap nom de camp amb ningú. I `review/build-rows.js` hi tenia a sobre un
`IN_SCOPE` escrit a mà amb els 17 camps de Laudes i Vespres.

Totes dues llistes són ara **derivades** de `FIELDS` + `OFFICE_FIELDS` + `MASS_FIELDS`, o sigui
que una hora nova hi entra sola. Els números d'una revisió de dos dies:

| | abans | després |
|---|---|---|
| camps revisats | 206 | **256** |
| hores a l'informe | 6 | **7 + Invitatori** |

I un efecte de segon ordre que calia arreglar alhora: amb la missa dins, cada memòria reportava
3-5 **divergències falses**. `match` comparava el text català contra un `cpl` **buit** i en deia
`diff`, quan el que passa és que els dies de memòria cpl-app resa la missa ferial —com mana el
Missal— i no té res per a la columna del sant. Ara aquest cas és `onlyApp` i no compta com a
divergència. Del 16 de setembre de 2026: 3 divergències → **cap**.

De passada, `build-rows.js` tenia **quatre bytes NUL en cru** com a separadors de clau, cosa que
el feia invisible al `grep` i el marcava com a binari. Substituïts per l'escapada `\u0000`:
mateix valor en execució, fitxer llegible per les eines.

També s'ha actualitzat `.claude/skills/revisio-dia/SKILL.md`, que deia que revisava «la Litúrgia
de les Hores» i ara diu què cobreix de debò i d'on surten les llistes de camps.

<a id="eina-missa"></a>
## EINA-missa

**El pipeline aprèn la missa** · 8 de setembre de 2026

Fase 4 de [FASES.md](migration-to-saints/FASES.md). 4.386 ids un cop trets els **1.082 dels
comentaris**, que queden fora d'abast en català per decisió d'en Pau, i els `ALTERNATIVE_*` i
`SHORT_*`, que cpl-app no modela.

**El problema no era la forma dels camps: era que cpl-app ofereix fins a tres misses per a una
data i saints-app hi té dues columnes**, i cap dels dos índexs diu quina va on.

| candidata | què és |
|---|---|
| `rendered` | el que cpl-app resa: la missa de la celebració si n'hi ha, la ferial si no |
| `ferial` | la del dia de la setmana, demanada a part (`GetNormalDaysMassLiturgy`) |
| `eve` | la que cpl-app va resoldre **ahir**. Només encaixa el diumenge de Pasqua, que du la **Vigília** als rols plans mentre cpl-app la resol al Dissabte Sant |

**La regla és llegir-ho de la cita que ja hi ha a la casella.** Una lectura de la missa sempre
en du una, `es` ja la té escrita i `fingerprint()` compara com l'escriuen les dues llengües. Si
no coincideix cap candidata, no s'escriu res.

Per què no una regla del tipus «el que és propi va a `CELEBRATION_*`»: **els sants Pere i Pau**
duen la missa de la **vigília** als rols plans (Fets 3) i la **del dia** als `CELEBRATION_*`
(Fets 12). Aquella regla hauria posat la missa del dia a les caselles de la vigília **cada any**,
i el control d'unanimitat no ho hauria vist mai, perquè hauria estat malament de manera
consistent.

Altres decisions de mapatge, totes amb prova a `mass-fields.test.js`:

- La **referència** du dues coses dins d'una casella, separades per un `_` que el component
  parteix: `{Quote}: _{Comment}_`, la mateixa partició que cpl-app ja té. El `Title` no hi va —
  l'índex no li té casella.
- El **salm** no en du, de subtítol: a `es` la resposta és el subtítol i el cos no la duu (917 de
  918), i a cpl-app va **dins** del cos, repetida després de cada estrofa, que és com ho imprimeix
  el volum. `formatTextLecture()` ja converteix `R.` en `℟`, o sigui que copiar el cos tal com és
  es pinta bé. **Zero cirurgia sobre el text litúrgic.**
- cpl-app deixa el nom del llibre fora del salm («112,1-2…») perquè la seva pantalla escriu «Salm
  responsorial» abans: se li prefixa `Sl `, però **només si la cita comença amb número**, mai a un
  càntic que fa de salm, cosa que la Vigília Pasqual fa dues vegades.

**Control**: re-córrer les 6 hores d'abans amb el mapa nou de 7 dona **15.857 caselles idèntiques
byte a byte**. I com que la missa **no comparteix cap taula amb les hores**, el join va sortir
purament additiu.

| | abans | després |
|---|---|---|
| Missa, dels 4.386 ids | 0 (0%) | **3.483 (79,4%)** |
| L'índex compartit sencer | 16.128/22.132 (72,9%) | **19.611/22.132 (88,6%)** |
| Caselles en conflicte | 1.614 | **1.998** |

Detall a [PLAN §18](migration-to-saints/PLAN.md).

<a id="sa-14"></a>
## SA-14

**3.483 caselles noves a `commons/ca`: les lectures de la missa** · 8 de setembre de 2026

Exportació de la fase 4. **3.483 claus noves i 0 actualitzades** — la missa té les seves dues
taules (`lecturas_referencia`, `lecturas_texto`) i no comparteix cap id amb les hores, o sigui
que **res del que ja hi havia publicat no es toca**.

Verificat a l'app real en català: el 12-VIII, el 16-IX i el 15-VIII de 2026 surten la primera
lectura, el salm, la segona i l'evangeli.

Tres forats coneguts, tots amb causa:

| | cobertura | per què |
|---|---|---|
| Nucli (1a, salm, 2a, evangeli) | 74-92% | conflictes registrats: cpl-app té la mateixa lectura escrita dues vegades amb diferències petites (`Mc 1,21b-28` / `Mc 1,21-28`) |
| Tornada de l'aclamació | 0% | no és cap dada de cpl-app — [D-006](#d-006) |
| `CELEBRATION_*` | 22-40% | els dies de memòria cpl-app resa la missa **ferial**, com mana el Missal. És la [D-001](#d-001) a la missa |
| Vigília Pasqual | ~0% | [EPREX-004](#eprex-004): l'app no llegeix cap casella el diumenge de Pasqua |

<a id="d-006"></a>
## D-006 — **EN PART** (4 de 14)

**La tornada de l'aclamació: 14 línies que cpl-app no té** · 8 de setembre de 2026

La casella `lecturas_referencia` del rol `ACCLAMATION` no du la cita bíblica: du la **tornada**
(«Al·leluia, al·leluia, al·leluia» i les fórmules que la substitueixen en Quaresma). cpl-app no
en té cap dada — és una constant dins de la seva pantalla— i el que sí que té, `Hallelujah.Quote`,
és la cita del verset, que és una altra cosa.

El verset (`ACCLAMATION_texto`) **sí que es migra**. El que falta són **14 ids** per a tot l'any,
i **no els escric jo**: la regla d'aquest projecte és que només el volum imprès decideix la
redacció catalana, i ja va costar un `CPL-LIT` retirat. Hi ha una taula per omplir al dossier;
un cop plena va a `static-translations/lecturas_referencia.ca.json` i l'exportació la recull sola.

Dossier: [decisions/D-006](migration-to-saints/decisions/D-006-la-tornada-de-l-aclamacio.md).

**30-9-2026, en Pau (la seva opció b):** les quatre caselles que en castellà diuen «Aleluya, aleluya,
aleluya» porten «Al·leluia, al·leluia, al·leluia», la fórmula que la CPL ja fa servir com a antífona
de les hores menors del temps de Pasqua: `6000` (tot l'any fora de Quaresma), `100`, `929` (24-XII) i
`110` (Nadal). Les altres deu —les fórmules de Quaresma, les seqüències i la `6006` de l'Anunciació,
que barreja Quaresma i Pasqua— esperen el llibre. La revisió ja no compta aquesta casella com a
divergència: cpl-app no la té per disseny. Commit saints-app `d66683b08`; a cpl-app, el mateix commit que
aquesta nota.

<a id="eprex-004"></a>
## EPREX-004

**El diumenge de Pasqua no mostra cap lectura de la missa** · 8 de setembre de 2026

Trobat fent la descoberta de la fase 4, abans d'escriure cap casella catalana. **No és un bug
del català**: passa igual en castellà, que és l'idioma publicat.

`all_lectures.json` té quatre entrades per al diumenge de Pasqua — `__ANY` amb **0** lectures i
`__YEAR_A/B/C` amb 22-24 cadascuna— i `lecturesStore` demana els cicles en l'ordre
`["ANY", "MEMORY", parell ? "EVEN" : "ODD", cicle]`. `findInStructure()` torna la primera clau
que **existeix**, i un objecte buit és cert, o sigui que `easter_sunday__ANY` guanya sempre i
les lectures dels tres cicles no s'arriben a llegir mai.

Comprovat a l'app real en castellà: el 5-IV-2026 `contentByDay` és un **array buit**, amb
`loadingState: "loaded"` i `errorCode: null` — la pàgina es pinta sense res i sense dir per què.

De les set entrades sense lectures que hi ha a l'índex, **només aquesta en tapa una altra**;
les tres `__EVEN` buides queden darrere del seu germà `__ANY` i són dades mortes.

Dossier: [eprex-bugs/EPREX-004](migration-to-saints/eprex-bugs/EPREX-004.md). La sortida
recomanada és que `findInStructure` no accepti una entrada sense contingut —tres línies a
`structureHelpers.ts`, que tanca la classe de bug sencera— i de passada netejar les entrades
buides.

<a id="eina-ofici"></a>
## EINA-ofici

**El pipeline aprèn l'Ofici de lectura** · 7 de setembre de 2026

Fase 3 de [FASES.md](migration-to-saints/FASES.md). L'hora més gran de totes —sola demanava
**14.534** ids contra els 8.925 de Laudes+Vespres— i la primera conclusió va ser que **la
meitat no s'ha de tocar**.

**`_a` és el cicle anual de lectures i `_i`/`_p` el bienal opcional.** Provat per dues bandes:
`useOfficeFirstLecture.ts` tria `_a` per al valor per defecte del selector i `_i`/`_p` segons
`dateStore.isEvenYear`; i cpl-app dona **la mateixa lectura** a les cinc ocurrències
d'`ordinary_time_19_wednesday` de la finestra, anys parells i senars barrejats. I el bienal
**no fa falta**: `LanguageFeatures.biennialReadings` és `["es", "it"]`, el català no hi és, el
selector no apareix i l'app llegeix sempre `_a`. **L'abast baixa de 14.534 a 6.843 ids.**

Tres taules noves (`oficio_citas`, `oficio_titulos`, `oficio_textos`) i dues formes que **no es
podien simplificar**, totes dues amb detector propi a `office-fields.test.js` perquè totes dues
fallarien **en silenci** —la pàgina segueix pintant, amb una línia menys:

| | |
|---|---|
| La cita | Du **dues línies dins d'una casella**, separades per un `$` literal: els components pinten `split("$")[0]` com a paràgraf i `split("$")[1]` en estil `reference-bible`. cpl-app ja té les dues meitats (`Reference`, `Quote`); **on talla no és on talla `es`**, i és igual de coherent |
| El responsori de cada lectura | **Tres** ids, no dos ni sis: un blanc, `℟. {First} * {Second}`, `℣. {Third} * {Second}`. Helper propi (`readingResponsoryParts`), perquè el de Laudes en fa sis i el de les hores intermèdies dos |

I una trampa que no era al pla: **l'himne canviava segons l'hora del rellotge**.
`OfficeService.IsDarkAnthem()` fa `new Date().getHours() < 6` —l'únic `new Date()` de tot
`src/Services`— i les 28 files de `salteriComuOfici` tenen l'himne de dia i el de nit
**diferents**. Un join llançat de matinada hauria migrat catorze himnes nocturns sense que res
ho digués. Ara el join **fixa el rellotge a migdia** abans de resoldre cap data. Decisió oberta:
[D-005](#d-005).

Al `HOURS_CONFIG`, `dualOffice: false`: `officeStore` **reescriu** el registre a les memòries
(`cycle === "MEMORY"` substitueix salmòdia, lectura bíblica i responsoris 1 i 2 pels de la
fèria) en lloc d'oferir dues pestanyes — com `terciaStore` i **no** com `laudesStore`. Llegit
del `store`, i després mesurat per la sonda. Detall a
[PLAN §17](migration-to-saints/PLAN.md).

**Control**: re-córrer les 5 hores d'abans amb el mapa nou de 6 hores dona **9.756 caselles
idèntiques byte a byte** — 0 afegides, 0 perdudes, 0 amb text canviat.

| | abans | després |
|---|---|---|
| Ofici de lectura, dels 6.843 ids del cicle anual | 304 (4,4%) | **6.432 (94,0%)** |
| caselles escrites pel join | 9.756 | **15.857** |
| caselles en conflicte | 1.313 | **1.614** |

Es regenera amb `node migration-to-saints/app-id-probe.js --range 2017-01-01..2026-12-30
--fresh` + `npx jest migration-to-saints/join-content.test.js`.

> **Nota d'operació.** Fent aquesta fase es va trobar **una sonda penjada des del 4 de
> setembre** (tres dies) amb el seu Chrome encara ocupant el port 9444: la sonda nova estava
> conduint aquell navegador en lloc del seu, perquè comparteixen port i `--user-data-dir`.
> Mort el procés vell i el Chrome orfe, i rearrencada neta amb `commons/ca` verificat intacte.
> Si una sonda no acaba, **comprova que no en queda cap de viva** abans de tornar-la a llançar.

<a id="sa-13"></a>
## SA-13

**6.128 caselles noves a `commons/ca`: l'Ofici de lectura** · 7 de setembre de 2026

Exportació de la fase 3. **6.128 claus noves i 5 actualitzades**, i les 5 **només d'espais**
(amb més observacions, `representative()` tria una altra grafia igual de vàlida) — verificades
una per una: **cap canvi semàntic al text ja publicat**.

Tres fitxers nous: `oficio_citas.json` (871), `oficio_titulos.json` (869), `oficio_textos.json`
(865).

| | abans | després |
|---|---|---|
| Ofici de lectura | 304/6.843 (4,4%) | **6.432/6.843 (94,0%)** |
| Les 6 hores de l'índex, juntes | 10.000/17.746 (56,4%) | **16.128/17.746 (90,9%)** |
| Univers sencer de `commons/es` | 10.490/58.537 (17,9%) | **16.618/58.537 (28,4%)** |

Amb això són **les 7 hores** en català. L'inspector de dia compta ara **127 camps per dia** en
lloc de 102.

Verificat a l'app real (Chrome headless, `selectedLanguage=ca`): el 12 d'agost de 2026 l'Ofici
surt sencer en català, i el 16 de setembre —memòria dels sants Corneli i Cebrià— surt amb la
**salmòdia i la lectura bíblica de la fèria** i la **lectura patrística i l'oració pròpies del
sant**, que és exactament el que fa la reescriptura `MEMORY` d'`officeStore`.

**Cua**: **27 caselles** compartides entre hores han passat a conflicte i el join ja no les
escriu, però l'exportació **fusiona i no esborra**, o sigui que a `saints-app` hi queda el text
que hi tenien. Sumades a les 33 de la fase 1 són **60** que el pipeline actual ja no justifica.
Cal decidir si es treuen (P-8 de FASES.md).

Dos casos que val la pena conèixer, tots dos conflictes ben fundats i correctament retinguts:

- **`himnos/425`** el comparteixen les **Vespres del Martiri de sant Joan Baptista (29-VIII)** i
  l'**Ofici de la Nativitat del mateix sant (24-VI)**. En castellà una sola peça serveix per als
  dos; en català cpl-app en té una de pròpia per a cada un.
- **`oficio_citas/598`**: `second_sunday_after_christmas__ANY` **reutilitza a posta** la lectura
  del 4 de gener, caigui el diumenge on caigui, mentre cpl-app dona la lectura contínua del dia
  real. Diferència real entre les dues apps, un diumenge l'any (P-10).

<a id="d-005"></a>
## D-005 — **OBERTA**

**L'himne de l'Ofici de lectura: cpl-app en té dos, saints-app un de sol** · 7 de setembre de 2026

Germana de la [D-004](#d-004), amb la mateixa forma i un altre eix. L'Ofici es pot resar a
qualsevol hora i l'edició catalana en dona **dos himnes**: abans de les sis del matí el nocturn,
a partir de les sis el diürn (`OfficeService.IsDarkAnthem()`). Les **28 files** de
`salteriComuOfici` tenen els dos diferents. `all_oficio.json` té **un sol camp `himno`**.

Fora del Temps Ordinari la qüestió no es planteja: el `switch` de `GetAnthem` substitueix tots
dos per l'himne de la temporada, i en una celebració pròpia mana el de la celebració.

**No és cap bug de cpl-app** —ho mana l'OGLH 57 i el volum imprès du els dos— i no s'obre cap
`CPL-LIT`. Mentrestant s'escriu **l'himne de dia**, que és el que l'app mostra divuit hores de
cada vint-i-quatre, i el join **fixa el rellotge a migdia** perquè la tria no depengui de quan
es corre. **Conseqüència visible**: qui resi l'Ofici de matinada veurà a eprex l'himne de dia.

Dossier: [decisions/D-005](migration-to-saints/decisions/D-005-l-himne-nocturn-de-l-ofici.md).

<a id="d-007"></a>
## D-007 — **OBERTA**

**521 caselles publicades que el join d'avui ja no avala** · 8 de setembre de 2026

[`export-to-saints-app.js`](migration-to-saints/export-to-saints-app.js) és additiu per disseny:
omple una casella buida, actualitza una que ja té text, i **mai no n'esborra cap** («never used
to blank the destination»). Serveix per a no perdre feina. Però quan el join **retira** una
casella —perquè ha après que està en conflicte— la que s'hi va publicar en una passada anterior,
i més descuidada, s'hi queda per sempre.

Comparant `commons/ca` de saints-app amb l'exportació committejada d'avui:

| | |
|---|---|
| caselles publicades que l'exportació d'avui ja no produeix | **521** |
| …de les quals el join declara ara **en conflicte** | **349** |
| …que duen la variant **majoritària** (l'atzar va sortir bé) | 265 |
| …que duen una variant **minoritària** | **68** |
| …que no coincideixen amb **cap** variant coneguda | **16** |

Com es veu en un dia: el 8-IX l'Ofici de lectura resa el salm 23 i el 86 amb **un `*` de menys
cadascun**. Les caselles `salmos_textos/112` i `/367` es van publicar en una passada antiga amb
el text de la **Mare de Déu del Toro** (8 de maig, Menorca, `santsSolemnitats` fila 147),
l'única de les 25 còpies d'aquell salm a la BD a què falten els asteriscs.

Les **16** que no coincideixen amb cap variant coneguda són de la mateixa família que els quatre
precs de [MIGRA-008](#migra-008), que van passar del Nadal al Comú de Pastors sense que ningú no
ho veiés.

**La decisió no és tècnica.** Esborrar-les vol dir que aquells dies passin a mostrar «[ERR-001]
Element no trobat» —canviar text dolent per text absent—, i això ho ha de dir en Pau:

1. **Deixar-les** i documentar-ho. Cost: text possiblement d'una altra celebració, i invisible.
2. **Esborrar les 349 en conflicte.** Cost: `[ERR-001]` on ara hi ha text que sovint és bo.
3. **Esborrar-ne 84** —les minoritàries i les desconegudes— i deixar les 265 majoritàries. Treu
   el risc real i no toca cap casella on l'atzar va sortir bé.

Sigui quina sigui la sortida, l'exportació hauria de **reportar** les òrfenes, com ja fa amb les
del Comú a `export-common-held.json`: avui no se saben si no es comparen els dos arbres a mà.

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
| Prova | **OGLH 235b**: la lectura breu, les antífones i els precs, si no són propis, «se tomarán **del Común o de la feria correspondiente**» — les dues opcions són lícites · i `liturgiadeleshores.cat` —una web catalana, no oficial: l'edició oficial és la de la CPL— resa **la fèria** el 3-09-2026, amb els precs de Vespres iguals als de cpl-app paraula per paraula |
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


## D-008

**La Mare de l'Església del 2017 no s'arregla** · 29 de setembre de 2026

cpl-app la dona el 5-6-2017, un any abans del decret que la va instituir (2018). No ve de la
taula, que el procés X ja genera bé, sinó del codi, que la posa cada dilluns de Pentecosta. Des
del 2018 és correcte, i ningú no resarà el 2017. En Pau, el 29-9: no és rellevant d'arreglar.

| | |
|---|---|
| Què costa | A la migració, 16 caselles de sant Bonifaci (5 de juny) queden retingudes perquè el 2017 hi discrepa: `responsorios/5243–5248` i `19057–19062`, les antífones `899` i `1995`, `oraciones_finales/98` i l'Ofici `315` |
| Si algun dia calen | Es resol a la migració, sense tocar cpl-app: treure el 2017-06-05 del join, o una decisió de revisió |

<a id="d-009"></a>
## D-009

**L'himne de l'Ofici de sant Jeroni: el del Comú de doctors de la CPL** · 30 de setembre de 2026

A l'Ofici, saints-app no té pestanya ferial: els dies de memòria mostra l'himne del sant. La CPL, en
una memòria, resa el del dia de la setmana (OGLH 235b: «del Comú o de la fèria», les dues coses són
lícites), o sigui que cpl-app no en dona mai cap per a aquella casella, i en català sortia «id 959 not
found in himnos». No és culpa de ningú: són dues opcions lícites que no encaixen en una casella
compartida, i omplir-la és feina de la migració.

En Pau, el 30-9: **per a aquest cas concret, i no com a norma general**, l'himne de l'Ofici del Comú de
doctors de l'edició catalana (`OficisComuns` 07aO), «Oh sol etern, que amb vostra llum».

| | |
|---|---|
| On | `migration-to-saints/static-translations/himnos.ca.json`, clau `959` |
| Commit | saints-app `a346ca8db`; a cpl-app, el mateix commit que aquesta fitxa |
| Queden | 44 sants de memòria més amb la mateixa situació a l'Ofici; cadascun es decidirà pel seu compte |

<a id="d-010"></a>
## D-010

**Quan la norma permet les dues coses, mana eprex; i les primeres 17 caselles decidides així** · 30 de setembre de 2026

En Pau, el 30-9: si la norma permet fer una cosa o una altra i cpl-app en fa una i eprex l'altra,
**no hi ha cap problema: mana eprex**. I si al català li falta el text del que mostra eprex, se li
pregunta d'on es treu; no ho tria ningú més.

Les caselles retingudes no es podien alliberar: la cua de revisió desava decisions que cap pas no
llegia. Ara `migration-to-saints/decided-cells.json` les llista **una per una** (`taula/id` → el dia
el text del qual s'hi posa, i per què), i el join les escriu.

| | |
|---|---|
| Les primeres 17 | Les retingudes del 30-IX: el saltiri del dimecres II a Tèrcia, Sexta i Nona (lectura, cita i responsori), l'antífona i els himnes de les hores menors, i el càntic de Col 1 de les Vespres del dimecres |
| Per què | Els dies que hi discrepen (els Àngels de la Guarda, sant Bernabé, santa Teresa Beneta de la Creu, uns dies de gener) saints-app hi mostra el saltiri i cpl-app hi resa una cosa pròpia; totes dues són lícites (OGLH 232 i 236, i el llibre) |
| Efecte | El join escriu aquestes 17 i res més; el 30-IX passa a 135 de 135 caselles assolibles |
| Commits | cpl-app `48f9ac4` · saints-app `f07309896` |

<a id="d-011"></a>
## D-011

**La missa pròpia de sant Jeroni, amb les lectures de la CPL retallades** · 30 de setembre de 2026

A la pestanya del sant, saints-app mostra la missa pròpia de sant Jeroni: 2 Tm 3,14-17, Sl 118,9-14 i
Mt 13,47-52. cpl-app no la té, perquè en una memòria resa la del dia, però sí aquelles lectures més
llargues. Aplicant la [D-010](#d-010) (mana eprex, i si falta el català se li pregunta la font), en Pau
va triar retallar-les: «tira de l'opció b, no passa res».

| | |
|---|---|
| 2 Tm 3,14-17 | El primer paràgraf de 2Tm 3,14–4,2 (diumenge XXIX, C), que acaba al verset 17; el segon comença a 4,1 |
| Mt 13,47-52 | Mt 13,47-53 (dijous XVII) sense l'última frase, que és el verset 53 |
| Sl 118,9-14 | El text ja hi era; la cita, la mateixa que té sant Alfons (`lecturas_referencia/297`) |
| On | `static-translations/lecturas_referencia.ca.json` (599, 600, 601) i `lecturas_texto.ca.json` (750, 752); només les fa servir sant Jeroni |
| Commit | saints-app `8bbcfd124`; a cpl-app, el mateix commit que aquesta fitxa |

<a id="d-012"></a>
## D-012

**Les caselles retingudes que tenen resposta: el salm que diu el castellà, i les còpies d'un mateix text** · 30 de setembre de 2026

Un sol dia que discrepa retenia una casella per a tots els dies que la fan servir. El salm 118 (Teth) de
Tèrcia i Sexta el comparteixen uns 400 dies: cpl-app hi resa el salm 118 en 390, i els 2 de novembre el
salm 69 de l'Ofici de difunts. Per aquell dia l'any, la casella era buida els 400. El 95% del que faltava
per migrar eren caselles retingudes així, i els salms en feien el 43%.

En Pau, el 30-9, dues regles:

| | |
|---|---|
| **El salm que diu el castellà** | Si la casella és un salm o la seva cita, el castellà de la mateixa casella diu quin salm és («Salmo 118,65-72»). Hi va la variant catalana que és aquell salm, comprovada per la cita: llibre, capítol, part (I, II, III) i versets. Una cita que no hi quadra no hi va mai, encara que sigui la majoritària; si cap no hi quadra, o n'hi quadren dues de diferents, la casella segueix retinguda. Aplica la [D-010](#d-010): la casella és el que eprex diu que és, i el castellà ja hi mostra aquest salm tots aquests dies |
| **Còpies d'un mateix text** | Si totes les variants són el mateix text amb una coma, unes cometes, un accent, un salt de línia o, en la prosa, una paraula de cada cinquanta de diferència, hi va la més repetida. És la regla que en Pau va donar el 25-9 («no direm que és error de cpl; importem el majoritari»), que fins ara només s'aplicava als espais. No compten com a còpia: l'«al·leluia» de més (és l'antífona de Pasqua), el ℟/℣ canviat d'un responsori, ni cap signe d'una cita («Is 12,2-3.4» i «Is 12,2.3-4» són altres versets). Un empat queda retingut: no hi ha «la més repetida» |
| El que **no** decideix | Els dies en què cpl-app resa **un altre salm** no se'n diu res: surten a la revisió com a divergència, i es miren **un per un**. Són 34 celebracions, i són les que més dies retenien: Fidels Difunts, les solemnitats a les hores menors (Tots Sants, sant Joan, sant Pere i sant Pau, sant Jaume, l'Assumpció, sant Josep, el Sagrat Cor, Santa Maria Mare de Déu, l'Anunciació), els Sants Innocents, la Sagrada Família, sant Bernabé, sant Basili i sant Gregori, el Baptisme, les Vespres dels apòstols (conversió de sant Pau, sant Felip i sant Jaume, Càtedra de sant Pere, sant Andreu) i unes quantes fèries de desembre i gener |
| Codi | `lib/held-resolution.js` (nou): `resolveHeld`, `psalmScore`, `lightVariant`. El join el crida per a cada casella retinguda sense decisió; per als textos dels salms hi porta, de cada dia, com quadrava la cita de cpl-app amb la castellana de la mateixa ranura. La revisió (`build-rows.js`, `match: 'sameLight'`) i el panell (`day-compare.js`) fan servir el mateix `lightVariant`, perquè els dies de la còpia minoritària no surtin com a divergència |
| Rastre | `output/join-held-resolved.json`: cada casella escrita així, amb quina regla, què s'hi ha posat i què hi deien els altres dies (les paraules que canvien, o les dates on cpl-app resa un altre salm) |
| Test | `held-resolution.test.js`, 19 casos |
| Efecte | 178 caselles de salms i 195 de còpies, fora de la cua. La migració passa del **81% al 91%** (376.888 → 422.591 de 464.428 textos-dia) i de 2 a 28 dies sencers. El 30-IX continua al 100% |
| Commit | el mateix commit que aquesta fitxa · saints-app `fdbcaaaf5` ([SA-21](#sa-21)) |

<a id="sa-21"></a>
## SA-21

**Els salms i les còpies de la D-012, a saints-app** · 30 de setembre de 2026

Reexportació després de la [D-012](#d-012): 324 claus noves i 13 canviades. De les canviades, 12 són la
mateixa cita amb la línia de descripció, o el mateix text amb espais, puntuació o una paraula de
diferència (la còpia més repetida). La que no:
`salmos_citas/3498` deia «Salm 109» d'una exportació antiga, i el castellà de la casella és «Salmo 118,
105-112»; ara diu «Salm 118, 105-112 / XIV (Nun)».

| | |
|---|---|
| Commit | `fdbcaaaf5` (saints-app, branca `catalan-language-support-dev`) |

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
