# CPL-LIT-003 — Al Salm 66 li falta l'asterisc de mediació a l'últim vers, fora de Laudes

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | cpl-app · Vespres i Ofici de lectura · text del salm |
| **Gravetat** | Baixa per a qui resa (una marca de pausa que falta) — alta per a la migració |
| **Trobat** | 2 de setembre de 2026, revisant el dia amb la skill `revisio-dia` (fèria del dimecres de la setmana 22) |
| **Correcció** | **Dades**: `db-fixes/CPL-LIT-003.sql` sobre `src/Assets/db/cpl-app.db`, taules `salteriComuVespres` i `santsMemories` |
| **Regressió** | `__tests__/Services/Psalm66PointingMark.test.js` |

## Símptoma

El Salm 66 està guardat **tres vegades** com a salmòdia puntuada. A dues d'elles, l'últim
vers ha perdut l'asterisc de mediació:

| còpia | on es resa | el vers |
|---|---|---|
| `salteriComuLaudes/17.salm3` | Laudes, dimecres setmana II | `La terra ha donat el seu fruit,    *` ✅ |
| `salteriComuVespres/12.salm2` | **Vespres**, dimecres setmana II | `La terra ha donat el seu fruit,` ❌ |
| `santsMemories/377.Salm2Ofici` | **Ofici de lectura**, Témpores d'acció de gràcies (05-oct) | `La terra ha donat el seu fruit,` ❌ |

A la pantalla, l'usuari que resa Vespres veu una estrofa sense la marca que li diu on fer la
pausa, mentre que al matí la mateixa estrofa del mateix salm sí que la duu.

## La prova

És **interna i concloent**, i no cal sortir de la base de dades:

1. A la fila de Vespres, aquest és l'**únic** primer hemistiqui sense marca. Els altres sis
   —línies 1, 3, 6, 9, 11, 14 i 19— la duen tots.
2. La còpia de Laudes del **mateix salm, a la mateixa edició**, la duu, amb quatre espais al
   davant, igual que la resta de marques del fitxer.
3. Un cop normalitzats els espais amb `lib/text-key.js`, aquest asterisc és **l'única**
   diferència entre les dues còpies: 645 caràcters contra 640, i les altres tres diferències
   són tres espais contra quatre.

Les fonts externes no serveixen aquí, i val la pena deixar-ho dit: les edicions en línia
**despullen la puntuació**. Comprovat el 2026-09-02 a `apps.idteologia.org` (castellà, Vespres
del dia): imprimeix «La tierra ha dado su fruto, / nos bendice el Señor, nuestro Dios» sense
cap asterisc en tot el salm, o sigui que ni el confirma ni el desmenteix.
`liturgiadeleshores.cat` només serveix el dia en curs i no en dona el text pla. Per a una
qüestió tipogràfica com aquesta, la còpia germana dins de la mateixa base **és** la font.

## Què NO s'ha tocat

El Salm 66 també hi és **sense puntuar**, quatre vegades més: `LDdiumenges/102`, `/482`,
`LDSantoral/45` i `diversos/36`. Aquestes no tenen cap `*` enlloc perquè són el **salm
responsorial de la missa** (amb les `R.` de la resposta) i un text devocional, no la salmòdia
de l'ofici. Han de quedar-se com estan.

Per això el `.sql` va **per taula i columna**, no amb un `LIKE` global — i el test hi té tres
casos de control que fixen que aquestes còpies continuen sense marques.

## Efecte sobre la migració al saints-app

Aquí és on el bug feia mal de veritat. Les tres còpies puntuades alimenten **la mateixa
casella d'eprex**, `salmos_textos/144` (el text del Salm 66, compartida per 50 celebracions).
Com que el join agrupa les observacions per `textKey()` i l'asterisc sobreviu la
normalització —hi ha de sobreviure: la puntuació és contingut—, cpl-app semblava dir dues
coses diferents per a la mateixa casella:

| variant | observacions | on |
|---|---|---|
| amb asterisc | 81 | totes de **Laudes** |
| sense asterisc | 63 | totes de **Vespres** |

El join no podia escriure'n cap. I com que el diagnòstic atribueix cada variant minoritària a
les celebracions dels seus dies, **acusava 26 grups** —sant Francesc d'Assís, santa Llúcia,
sant Antoni abat, sant Jeroni, santa Teresa de l'Infant Jesús…— d'un desacord que no era seu:
l'únic que tenien en comú era resar Vespres.

Resultat de tornar a córrer el join (`HOURS=Laudes,Vespers`, finestra 2017—2026, Barcelona):

| | abans | després |
|---|---|---|
| variants de `salmos_textos/144` | 5 | **4** (les dues del Salm 66 en són una, amb 144 observacions) |
| grups acusats per `salmos_textos/144` | 26 | **1** |
| grups amb alguna acusació, en total | 243 | **226** (−17) |
| variants pendents, en total | 2.035 | 2.034 |

Els 17 grups que desapareixen de l'informe **no tenien cap altra casella en conflicte**: la
seva única culpa era aquest asterisc. El grup `ferial|ordinary_time_22_wednesday`, que era el
que ho va destapar («cap celebració pel mig: el text de la fèria varia per si sol», 5 dies
contestats de 7), també s'ha esvaït.

La casella `salmos_textos/144` **continua pendent**, i això és correcte: li queda un
desacord real i d'un sol origen, **sant Bernabé apòstol** (11 de juny), que és el cas
memòria-contra-fèria conegut. Al panell del dia 2026-09-02, la línia de culpa del 2n salm de
Vespres passa d'una llista de 18 celebracions a una de sola. La cobertura del dia no es mou
(47/58): el que canvia és que ara la pregunta que queda és una de sola i de veritat.

## Com es reaplica

`src/Assets/db/cpl-app.db` **no és al git** (`.gitignore`) i ve del web de Deployment. Per
tant aquest fitxer `.md` i el `.sql` que l'acompanya **són l'únic registre del canvi**: una
base de dades acabada de baixar no el portarà.

```sh
sqlite3 src/Assets/db/cpl-app.db < db-fixes/CPL-LIT-003.sql
npx jest __tests__/Services/Psalm66PointingMark.test.js
```

El `.sql` no fa servir els `id` de fila sinó l'estat incorrecte (el vers seguit de salt de
línia, dins d'una fila que ja té alguna marca), així que és **idempotent** i **no depèn de la
versió**: un cop la marca hi és, ja no coincideix amb res, i no fa res si CPL ja ho ha
arreglat a origen. El test és el detector: si falla, a aquesta base de dades li falta el
canvi. Verificat que sense el `.sql` fallen 5 dels 16 casos i que els controls passen igual.

Base sobre la qual s'ha aplicat: `_tables_log` = 12.528 registres (últim: 2025-10-29
09:04:47), sha256 `fda34735…` abans i `38842ab0…` després. **`_tables_log` no s'ha tocat**,
perquè el seu recompte és el que el wiki fa servir per comparar amb la versió publicada.
El sha256 d'abans ja porta [CPL-LIT-002](CPL-LIT-002.md) aplicat: els dos `.sql` s'apliquen
en ordre sobre la base baixada de CPL.

## Per a l'informe al client

Dos textos de la mateixa edició catalana de la Litúrgia de les Hores, carregats a la base de
dades de l'app, difereixen en una marca de puntuació: la còpia del Salm 66 de Laudes duu
l'asterisc de mediació al vers «La terra ha donat el seu fruit» i la de Vespres no. La de
l'Ofici de lectura de les Témpores d'acció de gràcies tampoc. Sembla una badada de
transcripció d'una sola fila, no un criteri.
