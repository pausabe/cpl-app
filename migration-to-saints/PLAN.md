# Migració de contingut català: cpl-app → saints-app (+ litcal)

Estat: **infraestructura provada, pilot de Laudes en curs.** Aquest document és la
font de veritat de com funciona la migració, què està construït, i què queda pendent.
Res d'això s'ha escrit encara ni a `saints-app` ni a `litcal` — de moment tot viu
sota `cpl-app/migration-to-saints/` i només llegeix `cpl-app.db` en mode read-only.

## 1. El problema

- `saints-app` ja suporta `es`/`it`. Vol afegir `ca`.
- `saints-app` té dos tipus de contingut:
  - **literals / generic_texts**: text fix, independent del dia litúrgic (botons, oracions
    fixes...). Fàcil: traducció directa.
  - **day_specific_texts**: contingut que depèn del dia litúrgic (himnes, salms, lectures,
    responsoris... per a Ofici/Laudes/Vespres/Hora intermèdia/Invitatori).
- `cpl-app` calcula el dia litúrgic a partir d'una data natural i una diòcesi/lloc escollits
  per l'usuari, i ja té tot el contingut en català a la seva base SQLite (`cpl-app.db`).
- L'enfocament de cpl-app (calcular dia → contingut) és l'invers de saints-app (litcal
  ja dona la clau del dia → JSON pre-indexat), calen dos ponts diferents:
  1. **Contingut** (aquest PLAN, secció 3-5): omplir `commons/ca/*.json` de saints-app.
  2. **Calendari** (secció 6): saints-app/litcal no coneixen cap festa pròpia catalana
     (diòcesi, patronatges...) — cal generar-les com a calendaris litcal nous.

## 2. Descobriment clau: l'índex de saints-app ja és compartit entre idiomes

`saints-app/src/store/db/day_specific_texts/all_{oficio,laudes,visperas,tercia,sexta,nona,
invitatorios,lectures,celebrations}.json` són **un sol fitxer, no un per idioma**. Cada
entrada té clau `{litcal_id}__{CICLE}` (p.ex. `"advent_1_friday__ANY"`) i valors que són
**IDs numèrics** cap a `day_specific_texts/commons/{lang}/*.json` (aquests sí que són un
fitxer per idioma). Els mateixos IDs numèrics s'usen a `commons/es` i `commons/it` per al
mateix dia/camp — és a dir, **no cal recalcular què toca cada dia**: ja està decidit i és
compartit. Només cal omplir `commons/ca/*.json` amb el text català per als **mateixos IDs
numèrics** que ja usen `es`/`it`.

Això elimina de soca-rel el problema que vam trobar al pipeline previ es→it de `saints-db`
(IDs autoincrementals sense ordre estable → cada regeneració desordenava IDs existents,
amb un commit que va haver de tocar TOTS els `all_*.json` per arreglar-ho). Aquí no hi ha
IDs nous a inventar per al contingut ja indexat: sempre escrivim a la clau que ja fixen
es/it.

## 3. Estratègia de "join": la data real com a pivot

Per a cada data real d dins la finestra disponible:
1. Preguntem a **litcal** (`resolveDay`) quin id+cicle li tocaria a `d` amb el calendari
   `spain` (el mateix que ja usa `es`) → p.ex. `ordinary_time_16_thursday`.
2. Amb aquest id, mirem `all_laudes.json` (ja existent, no el toquem) → quins IDs numèrics
   calen per a himne/salms/lectura/etc. aquell dia.
3. Per a la MATEIXA data real `d`, executem la lògica **real** de cpl-app (no una
   reimplementació) i n'obtenim el text català de cada camp.
4. Escrivim aquell text a `commons/ca/<taula>.json[aquell_ID_numèric]`.

Validat empíricament: per **2026-07-23**, cpl-app resol `Week=16, Dj (dijous)`; litcal
resol `ordinary_time_16_thursday` — el mateix número de setmana amb un any de diferència
de font, per a la mateixa data real. Bona confirmació que el pivot "data real" és sòlid.

## 4. Habilitador tècnic provat: reutilitzar els Services reals de cpl-app en Node

**No cal reimplementar l'algorisme de cpl-app** (és intricat: taules de precedència,
~30 casos hardcoded de dies especials, càlculs relatius a Pentecosta...). Tota la lògica
passa per un sol punt d'accés a BD: `DatabaseManagerService.executeQueryAsync(query)`.
Ja existia un test al repo (`__tests__/Services/DatabaseUpdaterService.test.js`) que fa
`jest.mock('.../DatabaseManagerService', ...)` — confirma que es pot substituir aquest
punt per una connexió SQLite real sense tocar cap fitxer de `src/`.

**Provat i funcionant**: `migration-to-saints/laudes.extract.test.js`
- Fa servir `node:sqlite` (mòdul natiu de Node ≥ 22, ja disponible, sense dependències noves).
- Mocka `DatabaseManagerService` (BD real) i `SettingsService` (evita la cadena
  `AsyncStorage`/RN que no cal per extreure contingut).
- Reconstrueix, fora de `DataService.tsx` (que sí importa `react-native`/`expo-asset` i
  per tant no es pot importar directament en Node), exactament la mateixa seqüència que
  `DataService.ReloadAllData` fa servir: `ObtainLiturgySpecificDayInformation` →
  `SpecialCelebrationService.ObtainSpecialCelebration` → `ObtainLiturgyMasters` (avui i
  demà) → `ObtainHoursLiturgy`.
- **Resultat real**: per 2026-07-22 (Santa Brígida, patrona d'Europa, Festivitat),
  2026-02-11 (Santa Eulàlia, diòcesi de Barcelona, Memòria) i Pasqua 2026, s'obté el
  `Laudes` complet en català correcte (himne, 3 salms amb antífones, lectura breu,
  responsori breu, cántic evangèlic, pregàries, oració final) — veure
  `migration-to-saints/output/raw/laudes-sample.json`.

Idempotència garantida: com que sempre escrivim a l'ID numèric que ja fixen es/it (secció 3),
tornar a córrer l'extracció amb un `cpl-app.db` una mica diferent només canvia el text
si el contingut de cpl realment ha canviat per a aquell dia — no reordena ni trenca res
existent.

## 5. Mapatge de camps Laudes (cpl ↔ saints-app) — 3 punts oberts

Comparant `hoursLiturgy.Laudes` (cpl, `Models/HoursLiturgy/Laudes` + `CommonParts`) amb
`all_laudes.json` (saints-app), el mapatge és gairebé directe:

| saints-app (`all_laudes.json`) | cpl (`Laudes`) |
|---|---|
| `himno` / `himno_latino` | `Anthem` (cal córrer la resolució 2 cops: `settings.UseLatin=false/true`) |
| `primer/segundo/tercer_salmo_{cita,antifona,texto}` | `First/Second/ThirdPsalm.{Title,Antiphon,Psalm}` |
| `lectura_biblica_cita` / `lectura_biblica` | `ShortReading.{Quote,ShortReading}` |
| `cantico_evangelico_antifona` | `EvangelicalAntiphon` |
| `oracion_final` | `FinalPrayer` |

Els 3 punts s'han **resolt empíricament** comparant el mateix dia exacte a ES i a cpl
(santa Brígida, 23 de juliol 2026 — `bridget_of_sweden_religious__ANY` a `all_laudes.json`,
verificat amb litcal `resolveDay('2026-07-23', {calendarId:'spain'})`). Byte-a-byte:
`lectura_biblica_cita`/`lectura_biblica` d'ES (ids 100/101) van resultar viure a
`lectura_breve_citas.json`/`lectura_breve_textos.json` (no a `lecturas_referencia`/
`lecturas_texto`, que són per a l'Ofici) — `lectura_breve_citas["100"]` = **"Rm 12, 1-2"**,
exactament la cita que cpl dona (`ShortReading.Quote`).

1. **Responsori curt (6 IDs a ES, 3 camps a cpl)** — confirmat amb `responsorios[4322..4327]`
   d'ES (tema "Dios la socorre al despuntar la aurora", Sl 46,6) vs `ShortResponsory` de
   cpl per al mateix dia. Patró de generació confirmat:
   ```
   [0] ℣. {FirstPart} * {SecondPart}
   [1] ℟. {FirstPart} {SecondPart}
   [2] ℣. {ThirdPart}
   [3] ℟. {SecondPart}
   [4] ℣. Glòria al Pare, i al Fill, i a l'Esperit Sant.   (fix, no ve de cpl per dia)
   [5] ℟. {FirstPart} {SecondPart}
   ```
   Quan `HasSpecialAntiphon=true` (p.ex. Pasqua), tot el bloc de 6 es col·lapsa — cpl
   substitueix per `SpecialAntiphon`; a ES això correspon a una entrada amb cicle
   `__SPECIAL` diferent, no s'expandeix com a 6.
2. **`Prayers` (bloc únic a cpl) → `preces_intro`/`preces_respuesta`/`preces_contenido[]`
   (3 camps a ES)** — confirmat amb el mateix dia: el bloc de cpl té exactament l'estructura
   `intro\nrefrany\n\n(petició,\n—\ttancament\n\n)×N\nfrase-Parenostre`. Parser determinista:
   1r paràgraf sense l'última línia = `preces_intro`; última línia del 1r paràgraf =
   `preces_respuesta` (el refrany, apareix un sol cop); paràgrafs del mig, cadascun partit
   per `—\t` en (petició, tancament) = `preces_contenido[i]`; últim paràgraf = la frase
   que introdueix el Parenostre.
3. **`invitacion_padrenuestro`**: confirmat que ES recicla poques fórmules genèriques
   (id 61 reutilitzat en molts dies diferents) mentre cpl en genera una de **pròpia cada
   dia** (última línia del bloc `Prayers`, més rica). Decisió presa: com que és contingut
   genuí que ES no té, se li assignen **IDs nous** (no reutilitzables dels d'ES), derivats
   determinísticament del hash del text normalitzat (`"ca_" + sha1(text).slice(0,10)`) —
   no d'un comptador d'execució, per mantenir-ho idempotent entre execucions.

**Detall de format addicional descobert**: el text d'ES no és pla del tot — porta marques
lleugeres (`_..._ ` = cursiva, `$...$` = variant/nota inline, `℣./℟.` ja com a caràcters
Unicode literals). El text de cpl és pla. Cal una petita passada de "maquillatge" en
generar `commons/ca/*` perquè el renderitzador de saints-app el mostri igual que es/it.

## 6. Calendaris litúrgics catalans nous (litcal)

> **Superat el 28 i el 29 de setembre de 2026.** La capa catalana ja no surt d'aquest generador:
> es va refer a litcal com a model (branca `catalan-calendars`, PR #25), amb ciutat i catedral, els
> ids de romcal per als sants universals i regles amb anys, perquè la taula `anyliturgic` de
> cpl-app en surti (cpl-cloud, procés X). El generador i les etapes 1 i 2 del panell es van treure
> el 29-9: vegeu [EINA-calendari](../REGISTRE-DE-CANVIS.md#eina-calendari). El que ve a continuació
> és la història de com es va fer la primera capa.

Descobert després del pilot inicial: cpl-app permet triar diòcesi/lloc (Diòcesi/Ciutat/
Catedral × 12 diòcesis + Andorra = 37 codis, `DatabaseEnums.DioceseCode`), i això ha de
traduir-se en **calendaris litcal nous** — avui `spain.json` només té festes d'àmbit
espanyol, zero contingut català/diocesà (confirmat: cap referència a Montserrat,
Tarragona-diòcesi, etc. ni a litcal ni al calendari Romcal de Spain del qual beu).

**Script construït**: `migration-to-saints/generate-catalan-calendars.js`
- Llegeix `santsSolemnitats` (té `Cat`=S/F i `Precedencia` propis, no cal creuar dades) i
  `santsMemories` (sense rang propi — cal creuar amb la columna de diòcesi corresponent
  d'`anyliturgic` per saber si és M/L/V) per als codis `Diocesis IN ('-', 'XxD', 'Andorra')`
  — **abast d'aquesta primera passada: només nivell Diòcesi i el genèric compartit; es
  deixen fora Catedral/Ciutat** (saints-app/litcal encara no tenen cap dimensió de "lloc
  de pregària", només "calendari"; una capa catedral-only seria una extensió clara i
  separada, p.ex. `diocese-barcelona-cathedral.json`).
- `Diocesis='-'` → `catalonia.json` (parent: `spain`). `Diocesis='XxD'` → un fitxer per
  diòcesi (parent: `catalonia`). Andorra → parent `diocese-urgell`, seguint la mateixa
  regla que ja aplica cpl-app en temps d'execució ("Andorra hereta el calendari d'Urgell
  excepte la seva pròpia festa patronal").
- IDs de celebració derivats de forma determinista del nom català normalitzat (no de
  l'`id` de fila ni de l'ordre d'execució) — estables entre execucions encara que
  `cpl-app.db` canviï lleugerament, evitant l'error del pipeline `saints-db` antic.
- Rànquing cpl → litcal (`Rank`/`Precedence`), validat contra les cadenes literals reals
  de `litcal/src/domain/enums.ts` (hi ha un bug conegut i confirmat al propi litcal: el
  valor "8d" té la paraula `PROPER_SOLEMNITY__` en lloc de `PROPER_FEAST__` — còpia
  literal, no una suposició meva).
- Autovalidació abans d'escriure res (rank/precedence vàlids, dates 1-31, sense duplicar
  id dins un mateix fitxer).

**Correcció important trobada en fer el pas 2 (`litcal/scripts/build-catalan-calendars.ts`)**:
la primera versió (`--dry-run`, 232 regles a `catalonia.json`) estava malament de base.
La majoria d'aquestes 232 files amb `Diocesis='-'` **no són contingut propi de Catalunya**
— són el calendari romà universal (Anunciació, Assumpció, Immaculada, sants apòstols...)
que cpl-app també guarda en català perquè el necessita igualment (cap columna de
`cpl-app.db` distingeix "propi de la regió" de "universal, també en català"). Escriure-ho
tal qual hauria creat celebracions duplicades competint amb les que litcal ja té via
Romcal. **Verificat resolent els 365 dies de 2026 amb `calendarId:'spain'`** (la mateixa
cadena que ja usa `es`) i comparant contra els candidats: 384 de 533 candidats totals ja
tenien una celebració existent aquell dia — descartats.

**Fet i escrit a `litcal/src/data/calendars/`** (procés de 2 fases):
1. `cpl-app/migration-to-saints/generate-catalan-calendars.js` — genera candidats crus
   (com abans).
2. `litcal/scripts/build-catalan-calendars.ts <dir-candidats> [--write]` — resol
   `spain` dia a dia (any representatiu 2026), descarta els candidats que ja existeixen,
   i **promou a `catalonia.json`** qualsevol celebració repetida en ≥3 fitxers de diòcesi
   (llindar heurístic, revisable).

**Dues correccions més trobades i aplicades** (totes al mateix
`litcal/scripts/build-catalan-calendars.ts`, veure el commit `Fix false positives in the
Catalan calendar collision filter` a la branca `catalan-calendars`):
1. El filtre comparava contra **un sol any**, així que festes **mòbils** (relatives a
   Pentecosta, com "Nostre Senyor Jesucrist, Summe i Etern Sacerdot") que aquell any
   concret queien coincidint amb un sant fix de cpl-app feien descartar el candidat per
   error. Ara es comprova 3 anys seguits i només compta com a "existeix de veritat" si
   el MATEIX id hi surt el MATEIX dia en els 3.
2. Dues memòries opcionals poden conviure perfectament el mateix dia (és normal, tria el
   celebrant) i un candidat que **superi en rang** el que ja hi ha (p.ex. una Solemnitat
   patronal per sobre d'una Festa universal) no és un duplicat — litcal ja ordena per
   precedència. Ara només es descarta si l'existent té rang ≥ al candidat.
3. Un fitxer de diòcesi sense celebracions pròpies (Andorra) s'havia de SEGUIR escrivint
   (encara que buit) perquè el seu `parent: diocese-urgell` quedi registrat — si no,
   l'herència es trencava en silenci.

**Resultat final escrit**: **180 celebracions noves a `catalonia.json`** (Montserrat,
Núria...) **+ 1-18 per diòcesi** (Meritxell d'Andorra ara surt correctament per sobre de
la Nativitat universal, Santa Eulàlia només a Barcelona/Sant Feliu/Terrassa, Sant
Josepmaria Escrivà recuperat, dedicacions de catedrals, sants locals...). Verificat amb
`resolveDay` real per a Montserrat, Eulàlia, Meritxell i l'herència d'Andorra→Urgell.
`npm run generate-loaders` executat — els 13 calendaris nous ja són carregables.

**Limitació coneguda, conservadora (no perillosa, però incompleta)**: el filtre actual
descarta un candidat si **qualsevol** celebració ja existeix aquell dia, encara que sigui
una de diferent sant (dues memòries opcionals poden conviure perfectament el mateix dia
en dret litúrgic — no és un duplicat). Això ha fet fora alguns sants catalans genuïns
perquè coincidien en data amb una festa mòbil que en l'any 2026 concret queia allà (p.ex.
"Sant Just, bisbe" 28-maig, descartat perquè "Nostre Senyor Jesucrist, Summe i Etern
Sacerdot" —festa mòbil relativa a Pentecosta— hi va caure aquell any concret) o amb un
altre sant fix genuïnament diferent (p.ex. "Sant Josepmaria Escrivà" 26-juny vs. "Pelagi
de Còrdova, màrtir"). La llista completa de descartats (amb l'id existent que "xoca") es
guarda a `cpl-app/migration-to-saints/dropped-needs-content-reconciliation.json` —
requereix una revisió humana ràpida (algú que conegui els sants pot distingir "és el
mateix sant" de "coincidència de data" en segons) abans de decidir quins recuperar.

## 6b. Join de contingut de Laudes fet — i un problema real de qualitat trobat

Fet i provat (`litcal/scripts/build-date-to-key-manifest.ts` + `cpl-app/migration-to-saints/join-laudes.test.js`,
exposats al panell web com a passos 5): per 2024-01-01—2026-12-30 (1086 dies vàlids), s'ha
extret contingut real per a totes les taules de Laudes (himnos, salms, lectura breu,
responsoris, precs, oració final). `invitacion_padrenuestro` s'ha resolt a banda: com que
ES només recicla 26 fórmules genèriques (no és contingut per dia), s'han traduït a mà a
`migration-to-saints/static-translations/invitacion_padrenuestro.ca.json` en lloc de
forçar la frase única de cpl en una casella compartida amb altres dies.

**Trobat, confirmat, NO és un bug de l'script**: 5.435 conflictes (un mateix ID numèric
d'ES rebent contingut català diferent segons la data). Verificat amb un cas concret:
`mary_mother_of_god__ANY` (1 de gener) i `bridget_of_sweden_religious__ANY` (23 de juliol)
tots dos apunten als IDs 63/64/65 de `salmos_citas`/`salmos_textos` — ES hi té el mateix
contingut fix per a tots dos dies (Salm 62 / Càntic Dn 3,57-88 / Salm 149, el salteri
festiu habitual), i cpl-app ho calcula bé per al 23 de juliol però per l'1 de gener calcula
un salteri diferent (Salm 117 / Càntic Dn 3,52-57 / Salm 150) — probablement perquè el
Gener 1 cau dins l'Octava de Nadal i la branca `ChristmasOctave` de `LaudesService.tsx`
tria un salteri propi de l'octava en lloc del salteri festiu genèric que ES assumeix per
a les solemnitats. És a dir: **per a alguns dies (previsiblement concentrats a l'entorn
de Nadal/Setmana Santa/Pasqua, on `LaudesService` té moltes branques especials per
temporada), cpl-app i ES discrepen genuïnament sobre quin salteri toca**, no és un error
d'aparellament d'IDs.

**Política de resolució (decidit)**: en lloc de "primer valor vist guanya + avisa", ara es
recullen TOTES les observacions de cada ID abans de decidir res. Si totes les dates que
fan servir un mateix ID estan d'acord, s'escriu. Si n'hi ha alguna que discrepa, l'ID es
deixa **totalment fora** de `commons/ca` (no s'escriu cap dels dos valors) i es reporta a
`migration-to-saints/output/join-pending-review.json` amb totes les variants trobades i
quants dies en depenen. Com que l'ID és compartit entre totes les dates que l'usen, no hi
ha manera d'triar "el bo" sense revisió humana sense arriscar-se a equivocar-se per a les
altres dates que comparteixen la mateixa casella — de moment aquests dies simplement
sortiran buits a l'app (el mateix "no trobat" que ja passa amb qualsevol ID no traduït).

Amb la finestra 2024-01-01—2026-12-30: **1.162 IDs pendents** de ~5.700 (la resta,
resolts i escrits a `migration-to-saints/output/commons-ca/*.json`, encara no copiats a
`saints-app`). Exemple real (ID 63 de `salmos_citas`, 218 dies l'usen): 208 coincideixen
en "Salm 62, 2-9" i uns 10 discrepen clarament (6 al voltant de Nadal amb "Salm 117", i
uns quants casos aïllats amb altres salms) — el panell web (targeta 5, amb selector de
rang de dates) mostra aquest desglossament per a cada ID pendent.

**Bug real trobat i corregit (gràcies a una pregunta de l'usuari)**: el migrador resolia
sempre amb `calendarId: 'spain'` — el mateix que ES/IT — sense tenir en compte els
calendaris nous de Catalunya/diòcesi que ja existien a `litcal` des de la secció 6. Això
volia dir que dies genuïnament propis d'una diòcesi (p.ex. Santa Eulàlia a Barcelona,
12 de febrer) `litcal` els veia com un dia ferial qualsevol ("dijous normal de la 5a
setmana"), mentre que cpl-app (configurat per a aquesta mateixa diòcesi) sí que donava
el contingut propi d'Eulàlia — i el script els arxivava sota la casella ferial genèrica,
compartida per molts altres dijous sense cap relació. Corregit fent que el manifest es
resolgui amb el `calendarId` de la diòcesi corresponent (`diocese-barcelona`, etc. — nou
selector de diòcesi al panell), mapat des del nom de diòcesi de cpl-app. Amb això,
Eulàlia/Montserrat ara resolen al SEU propi id de litcal, que no existeix a
`all_laudes.json`/`all_visperas.json`, així que simplement se salten (no s'exporten,
tampoc contaminen res) fins que es decideixi encunyar-los ids propis.

Resultat mesurat (Barcelona, 2024-01-01—2026-12-30): de 3.086 a **2.667 pendents**, de
5.364 a **5.712 resolts**. Verificat que cap clau ja exportada abans quedés "contaminada"
(cap de les claus que ja hi havia a `saints-app` és ara pendent) abans de re-exportar.

**Segon patró trobat, diferent del de Nadal (revisant els pendents amb el migrador
Laudes+Vespres)**: bona part dels pendents NO són "cpl-app s'equivoca un dia concret" —
són dies `__MEMORY_FERIAL1`/`__MEMORY_FERIAL2` (memòria opcional sense textos propis,
p.ex. `anthony_of_egypt_abbot__MEMORY_FERIAL1`, `isidore_the_farmer__MEMORY_FERIAL1`).
Per aquests dies, ES reutilitza deliberadament un **conjunt petit i genèric** de lectures
breus/salms "comuns" (el mateix ID 100 de `lectura_breve_citas` = "Rm 12, 1-2" per a
Brígida de Suècia I per a sant Antoni Abat, per exemple), mentre que **cpl-app dona una
lectura pròpia i diferent per a cada sant** encara que ES el tracti com "ferial genèric".
No és que un dels dos vagi errat — són dues decisions editorials diferents (ES: contingut
comú i reciclat per a memòries sense pròpies; cpl: contingut propi per a cada sant). Cal
decidir si per a `ca` volem seguir el conveni d'ES (menys feina, es podria traduir el
petit conjunt de "comuns" a mà, com s'ha fet amb `invitacion_padrenuestro`) o aprofitar
que cpl dona contingut més ric i encunyar IDs nous per a aquests casos. Pendent de
decidir — de moment el migrador els deixa igualment en blanc/pendents, correcte i segur
per continuar.

## 6c. Classificació mesurada dels 2.667 pendents (corregeix la hipòtesi de 6b)

Els pendents s'han classificat creuant `output/join-pending-review.json` amb
`webui/run/date-to-key-manifest.json` (quina clau litcal té cada data). El resultat
**no confirma** la lectura de 6b, que atribuïa el gruix al patró `MEMORY_FERIAL`:

| Grup | Què passa | Pendents |
|---|---|---|
| **B** | ES fa servir la MATEIXA casella per a celebracions **diferents**; cpl dona text propi a cadascuna | **853 (32%)** |
| **A** | Una sola clau litcal: la MATEIXA festa dona text diferent segons la data concreta | **1.814 (68%)** |

El grup B és una decisió editorial real i ja es pot decidir. Exemple extrem:
`preces_intro` id **1** el comparteixen **73 dies** amb **35 textos catalans diferents**
(ES hi posa una introducció genèrica del comú de pastors; cpl en dona una de pròpia per
sant). Igual `salmos_citas` id **11033**: ES l'usa per al càntic dels dissabtes (Fl 2,6-11,
83 dies) i cpl hi posa a més Ef 1,3-10, Ap 4,11, Ap 15,3-4... segons la festa.

**El grup A no és diagnosticable amb la finestra de 3 anys**, i aquest és el descobriment
important. Es va provar de correlacionar les variants amb el cicle dominical A/B/C: 1.708
casos hi "encaixaven"... però és un artefacte. Amb 2024-2026, **cada any cau en un cicle
diferent** (2024=B, 2025=C, 2026=A), així que qualsevol clau vista un cop l'any queda
"explicada" pel cicle sense cap poder discriminant. Exigint que 2+ observacions del mateix
cicle coincideixin, només **4** casos queden confirmats de debò. La resta és soroll: no es
pot distingir el cicle A/B/C del dia de la setmana (saltiri ferial de 4 setmanes) ni de res
més. Cas confirmat de veritat, com a prova que el mecanisme existeix:
`cantico_evangelico_antifonas` id 101 (Sagrada Família), on 2023-12-31 i 2026-12-27 —tots
dos cicle B— donen la MATEIXA antífona, i els cicles C i A en donen una de diferent
cadascun.

**Correcció** (una versió anterior d'aquesta secció deia que saints-app no té dimensió de
cicle — és fals, veure secció 9): el model **sí** que la té a tot arreu. El que passa és que
`all_laudes.json`/`all_visperas.json` només fan servir els valors `ANY`/`MEMORY_*`/`SPECIAL`,
mentre que `all_lectures.json` ja fa servir `YEAR_A`/`YEAR_B`/`YEAR_C` i `ODD`/`EVEN` per a
exactament aquest problema. No és una limitació del model: és que les dades d'ES per a les
Hores no distingeixen cicle.

**Conseqüència pràctica**: ampliar la finestra a **2017-2026** (`cpl-app.db` els té tots,
10 anys, amb `anyliturgic.anyABC` per any) no és només "més cobertura" — és l'única manera
de partir aquests 1.814 en "depèn del cicle A/B/C" vs. "depèn d'una altra cosa". Per això
el panell ja hi ve per defecte.

## 7. Pendent (per ordre recomanat)

> **El full de ruta viu és [FASES.md](FASES.md)**, amb caselles per marcar, l'estat de cada
> fase i la bitàcola de qui hi ha treballat. Aquesta secció és la llista original del pilot;
> per a saber què toca ara, mira FASES.

1. **Córrer el migrador amb la finestra completa 2017-2026** i tornar a classificar el
   grup A de la secció 6c. Fins que això no estigui fet, qualsevol decisió sobre aquests
   1.814 pendents es pren a cegues.
2. Un cop hi hagi criteri per als conflictes: escriure el resultat final a
   `saints-app/src/store/db/day_specific_texts/commons/ca/*.json` (còpia directa dels
   fitxers a `migration-to-saints/output/commons-ca/*.json` un cop nets de conflictes) +
   copiar `commons/es/himnos_latinos.json` tal qual a `commons/ca/` (el llatí no depèn de
   l'idioma de l'app, no cal extreure'l de cpl-app) + copiar
   `static-translations/invitacion_padrenuestro.ca.json` a
   `commons/ca/invitacion_padrenuestro.json`.
3. ~~Afegir `ca` a `saints-app`~~ — **fet**: `src/constants/languages.ts`,
   `src/config/calendarLanguageRestrictions.ts` (`ca` a `spain` + entrada pròpia per
   `catalonia`/cada diòcesi), `LanguageSelectionModal.vue` + `FlagCaIcon.vue`, branca
   `catalan-language-support` a saints-app. Seleccionar `ca` avui mostra text de
   "no trobat" gairebé a tot arreu fins que el pas 2 escrigui contingut real.
4. Publicar `litcal` amb els calendaris catalans (branca `catalan-calendars`, actualment
   `2.4.4` al `main` remot; els calendaris nous viuen sense publicar) i actualitzar
   `saints-app`'s `package.json` (`"@saints-app/litcal": "2.4.5"` → la versió nova) —
   sense això, `catalonia`/`diocese-*` no existeixen encara per a `saints-app` encara que
   el codi ja hi faci referència.
5. Repetir el join (script ja genèric, només cal canviar `all_laudes.json` per
   `all_oficio.json`/`all_visperas.json`/etc. i el mapatge de camps corresponent) per a
   la resta d'hores (Ofici, Vespres, Hora intermèdia, Invitatori, Completes) i per a
   `generic_texts/ca/*` (literals — aquests no surten de cpl-app.db, cal traduir-los
   a banda, com s'ha fet amb `invitacion_padrenuestro`).

## 8. Com re-córrer el que ja existeix

```bash
cd cpl-app
make run-panel                                             # panell a http://localhost:4848
make run-panel PORT=4849                                   # ...en un altre port
make stop-panel                                            # aturar-lo
make day-check DATE=2026-08-12                             # l'informe d'un dia, per terminal
npx jest migration-to-saints/laudes.extract.test.js        # extracció de mostra (Laudes)
node migration-to-saints/missing-celebrations.js           # per què discrepen els dies: la celebració
```

### Refrescar-ho tot des del panell (targeta de dalt)

La targeta **Refrescar** encadena els passos en l'ordre correcte i mostra el progrés en
viu (SSE), perquè un eprex local vegi l'últim estat sense publicar res:

- **Compilar litcal**: `generate-loaders` → `npm run build` → deixar el `dist/` nou a
  l'abast de saints-app. Els calendaris catalans ja no s'hi generen (29-9-2026): són a
  litcal i el panell només els compila.
- **Regenerar eprex ca**: manifest de dates → join del contingut → escriure a
  `saints-app/.../commons/ca/`. Aquest és el llarg (finestra de 10 anys).
- **Refrescar-ho tot**: els dos seguits.

**Casella "eprex llegeix litcal de local"**: canvia `@saints-app/litcal` de la versió
publicada a `file:../litcal` a `saints-app/package.json` i executa `bun install`; recorda
la versió anterior per poder-ho desfer des del mateix lloc. Dos detalls comprovats:

1. bun materialitza la dependència `file:` com una **còpia, no un symlink**, així que
   recompilar litcal no arriba sol a saints-app — per això el pas final del refresc copia
   `litcal/dist` dins `node_modules`. Sense la casella activada **no toca `node_modules`**.
2. `bun install` **no es limita** a la dependència que canviem: re-resol transitives
   (`webidl-conversions` 3.0.1 → 6.1.0, afegeix `tsx`...), o sigui que `bun.lock` **no
   torna sol** a l'estat original en desactivar la casella. El panell avisa i llista els
   fitxers tocats; per netejar-ho, `git checkout -- bun.lock` a saints-app.

Tot idempotent: es pot córrer tantes vegades com calgui contra un `cpl-app.db` diferent;
cap dels dos scripts assumeix cap estat previ ni identificadors de fila estables.

## 8a. Inspector de dia: "aquest dia concret, sortirà bé?"

El percentatge global diu com va la migració, però no si el dia que estàs mirant a l'app
hauria de sortir sencer. `migration-to-saints/day-check.js` recorre el mateix camí que fa
l'app — data → id de litcal → clau de l'índex → ids numèrics de cada camp → el fitxer
`commons/ca` que l'app llegeix de veritat — i etiqueta cada camp amb un de quatre estats:

| Estat | Significa |
|---|---|
| `ok` | L'app mostrarà text català aquí |
| `conflict` | Deixat fora expressament: les dates que comparteixen l'id no s'entenen. Diu **la causa** (del paquet de revisió) i la **decisió** si n'hi ha |
| `missing` | Ni text ni conflicte registrat: el join no va observar mai cap valor per a aquell id |
| `notInAppYet` | Calculat a `output/commons-ca` però encara no exportat a saints-app |

Un dia és **100%** només si tots els camps de totes les Hores tenen text a `commons/ca`.

```bash
node migration-to-saints/day-check.js 2026-07-23
```

A la targeta **Inspector de dia** del panell això es veu com un **calendari mensual**: cada
dia pintat per trams (100% / ≥70% / ≥40% / >0% / 0% / fora de l'índex compartit / fora del
rang migrat) amb el seu percentatge, fletxes per moure's de mes, i el global del mes a
dalt. Clicant un dia s'obre el detall camp a camp de sota. Trams en lloc de degradat
perquè un color que pots anomenar s'escaneja millor que una tonalitat que has de comparar
amb la del costat. `checkMonth()` construeix el context un sol cop (~220 ms per mes sencer)
en lloc de rellegir l'informe de pendents 31 vegades.

Exemples reals (finestra 2017-2026,
Barcelona, Laudes+Vespres):

- **2026-07-23** (Brígida de Suècia): 32% — 18 camps amb text, 38 conflictes, 1 sense
  dades. Els salms 63/64/65 surten com "casella compartida per 80 celebracions".
- **2026-01-01** (Santa Maria, Mare de Déu): 74%.
- **2026-02-12** (Santa Eulàlia): veredicte `unknown` — resol a
  `santa_eulalia_verge_i_martir`, id propi del calendari català nou, que **no existeix**
  a `all_laudes.json`. És el cas descrit a la secció 6b: se salta, no contamina res, i
  quedarà així fins que es decideixi encunyar-li ids propis.

L'informe indica sempre amb quina finestra i diòcesi es va fer l'última migració
(`webui/run/last-run.json`), perquè la resposta no s'interpreti contra un manifest vell.

### Per què un dia que es veu bé a cpl surt com a "conflicte"

Dir "7 variants, 72 dies" explica que la casella està disputada però no **qui** la disputa,
i porta a la conclusió equivocada quan el dia que mires és dels que estan d'acord. La
pregunta útil és sempre la concreta: *si omplíssim aquesta casella amb el text que vol
aquest dia, quins altres dies mostrarien un text que no els toca?* Això ho respon
`conflictDetail()` (`/api/conflict-detail`), que es carrega en obrir una fila en conflicte
de la taula de camps, i el resum del qual («amb el text d'aquest dia, N dies de M sortirien
malament») ja surt a la columna **Per què** sense haver d'obrir res.

La clau és **agrupar per id de litcal, no per data**: en una llista plana de variants les
dues causes possibles són indistingibles, i volen respostes diferents.

- **Celebracions diferents compartint casella** (grup B de 6c) — cada una vol el seu text.
- **Una celebració que es contradiu a si mateixa** segons l'any (grup A) — no hi ha cap
  "text bo" per triar.

Exemples reals del 12-08-2026 (`ordinary_time_19_wednesday`), que a l'app es veu correcte:

| Casella | Comparteixen | Si hi posem el text d'aquest dia |
|---|---|---|
| `himnos/94` | 40 dies, 8 celebracions | 39 bé, **1 malament**: només `2022-10-05` vol un himne diferent |
| `salmos_citas/35` | 72 dies, 12 celebracions | 64 bé, **8 malament**: 6 són els 18 de desembre — un fals conflicte del propi migrador, veure 8c — i `ordinary_time_27_wednesday` discrepa un sol any |

O sigui: `himnos/94` està bloquejat per **un únic dia** de 40.

El panell mostra també **el text que ES té en aquell mateix id** (`commons/es/<taula>.json`),
que és el que l'app imprimeix ara mateix en castellà. Sense això el panell diu "aquests
textos no s'entenen" però no "ES va triar aquest, i això deixa malament aquells altres".

## 8c. Bug real del migrador: l'app no llegeix sempre la casella que diu l'índex

Trobat perseguint un conflicte concret que a l'app **no existeix** (l'usuari veia el mateix
salm a cpl i a eprex el 18-12-2026, però el panell el donava com a conflicte).

`saints-app/src/store/stores/divineOffice/laudes/laudesStore.ts` (`specialDays`, ~línia 113)
té una **excepció**: per a `advent_december_17..24` i `christmas_time_january_2..5` (+
`basil_the_great_and_gregory_nazianzen_bishops`) **no** agafa els salms de l'entrada del dia.
Construeix `ordinary_time_{setmana de saltiri}_{dia de la setmana}` a partir del dia real i
en substitueix els 9 camps de salms (cita/antífona/text × 3); per al 17–23 de desembre les
antífones venen a més d'uns ids fixos per dia de la setmana (`1364, 563, 1652, 884, 104,
815`), i el 24 d'uns altres (`770/771/772`). `visperasStore.ts` fa exactament el mateix
(excepte si són Primeres Vespres, `_1v`).

O sigui: el saltiri del 17 al 24 de desembre va **per dia de la setmana**, i tant cpl-app com
eprex ho fan bé. Comprovat amb els serveis reals de cpl-app (Barcelona, Laudes) contra la
casella que l'app llegeix de veritat:

| 18 de desembre | Dia | cpl-app | Casella real de l'app | Text a ES |
|---|---|---|---|---|
| 2026, 2020 | divendres | Salm 50 | `ordinary_time_3_friday` → 72 | Salmo 50 ✓ |
| 2025 | dijous | Salm 86 | `ordinary_time_3_thursday` → 366 | Salmo 86 ✓ |
| 2024, 2019 | dimecres | Salm 85 | `ordinary_time_3_wednesday` → 35 | Salmo 85 ✓ |
| 2021 | dissabte | Salm 118, 145-152 | `ordinary_time_3_saturday` → 150 | Salmo 118, 145-152 ✓ |

**Coincideixen tots quatre.** El conflicte de l'id 35 era fabricat pel migrador, que arxiva
els sis 18 de desembre a `advent_december_18__ANY` → id 35 (que en realitat és la casella
del **dimecres**) perquè llegeix l'índex directament en lloc de reproduir el camí de lectura
de l'app.

Mesurat a la finestra 2017-2026: **103 dates afectades**, **111 caselles de salms
contaminades**, de les quals **51 quedarien resoltes** només filant-les bé.

Corol·lari: la hipòtesi de 6b sobre l'"Octava de Nadal" es dissol en part — el 2 al 5 de
gener són d'aquesta llista. L'exemple de l'1 de gener (`mary_mother_of_god`) **no** hi és, o
sigui que aquell segueix sent una discrepància genuïna.

**Lliçó general**: `all_*.json` diu quina casella toca *per defecte*, però els stores hi
tenen excepcions hardcoded. Qualsevol cosa que aparelli dates amb ids ha de mirar l'store,
no només l'índex.

## 8d. La sonda: que sigui l'app qui digui quina casella fa servir

La conclusió de 8c no és "arreglar aquesta excepció" sinó "deixar de deduir-la". Reproduir
la lògica dels stores al migrador és el mateix error un pas més tard: la propera excepció
tornarà a passar desapercebuda. `migration-to-saints/app-id-probe.js` inverteix la
pregunta i la hi fa a l'app:

1. Escriu uns `commons/ca/*.json` **sentinella**, on el text de cada entrada és la seva
   pròpia adreça (`«salmos_citas/72»`), amb còpia de seguretat dels originals.
2. Obre l'eprex real (vite + Chrome headless), en català i amb la diòcesi de la migració.
3. Per a cada data, crida `dateStore.setDate()` — el mateix que fa la UI — i llegeix
   `contentByDay` dels stores de Laudes i Vespres.
4. El que hi surt **és** la casella que l'app ha triat, resolta pel seu propi codi. Tota
   excepció (present o futura) hi entra sola.
5. Restaura els fitxers originals (també amb `--restore` si una execució peta a mig fer).

```bash
node migration-to-saints/app-id-probe.js 2026-08-12,2026-12-18
```

Cost mesurat: ~0,6 s per data un cop arrencat (10 dates en 12 s), o sigui ~35-40 min per a
la finestra sencera de 10 anys — el mateix ordre que el join.

### Què va trobar la primera passada (8 dates)

De 282 camps comparats: **243 coincideixen** amb el que el migrador creia i **39 no**.

| Cas | Camps | Què passa |
|---|---|---|
| 18-12-2026, 18-12-2024, 02-01-2026 | 37 | L'excepció de `specialDays` de 8c, confirmada des de l'app: el 18-12-2026 dona `salmos_citas/72` i l'antífona `salmos_antifonas/104` — un dels ids hardcoded, el de divendres |
| Sta. Eulàlia (12-02-2026) | 2 | Sense entrada a l'índex |

I dues coses que no buscàvem:

**a) Què vol dir `-1` (corregit).** No és "res": és **"agafa-ho de la part ordinària"**. Un
dia civil pot tenir dues dates litúrgiques alhora — la celebració i la fèria de sota — i la
celebració només mana en els camps que té propis; la resta cau a la fèria. L'índex té `-1`
en 63 claus de Laudes i 67 de Vespres (gairebé totes `__MEMORY_FERIAL*`), i l'app hi posa el
contingut de `liturgicalDay.weekday.id` (camps `*_Ferial`) o, als dies especials de 8c, el
de `ordinary_time_{setmana}_{dia}` (Vespres del 18-12: `-1` a l'índex → `salmos_citas/80`).

Per tant **no hi ha contingut perdut a l'exportació**: aquelles caselles ferials ja les omple
el dia ferial corresponent. El que sí que queda sense registrar és el text **propi** que
cpl-app dona per a aquell sant, que és exactament la pregunta editorial de 10.2 — ara, això
sí, amb la casella exacta a la mà per si es decideix encunyar-ne ids nous.

### Resultat de la passada sencera (3.651 dates, 2017-2026)

`output/app-cell-map.json` — el mapa autoritatiu, generat en ~11 minuts, 0 errors.
**135.720 caselles comparades: 130.847 (96,4%) coincideixen** amb el que el migrador
creia. Les 4.873 restants:

| Tipus | Caselles | Què vol dir |
|---|---|---|
| **Mal arxivades** | **3.261** (274 dates) | El migrador apunta a una casella que l'app no llegeix aquell dia. Aquesta és la classe que fabrica conflictes |
| El migrador tenia `-1` | 1.012 | L'app hi posa el contingut de la part ordinària; el migrador no observava res |
| El migrador no tenia el camp | 600 | Camps que l'índex no dona i l'app sí resol |
| L'app no en té i el migrador sí | 0 | — |

Causes de les 274 dates mal arxivades: **103** són l'excepció `specialDays` de 8c, **10**
són Dijous Sant (el manifest resol `thursday_of_the_lords_supper` i l'app `holy_thursday`,
perquè `LitcalDataProvider` tria la celebració amb una regla pròpia — descarta les memòries
opcionals i després aplica un mapa `CELEBRATION_OVERRIDE` — mentre que el manifest agafa
`celebrations[0]`), i la resta són casos escampats (Tots Sants, Dissabte Sant, memòries amb
`__MEMORY_FERIAL`...).

**Efecte estimat sobre els conflictes actuals** (creuant el mapa amb
`join-pending-review.json`, sense re-córrer el join encara): dels **3.667** ids en
conflicte, **688 quedarien resolts** només descartant observacions mal arxivades, **484**
seguirien en conflicte però amb menys variants, i **49** resulten ser caselles que cap dia
de la finestra fa servir realment.

### Reconnectat i re-corregut (fet)

`join-content.test.js` i `day-check.js` ja llegeixen `output/app-cell-map.json`: per a cada
data i hora, si el mapa mesurat la cobreix, les caselles surten d'allà; si no (Invitatori i
nom de celebració, que viuen en altres stores i encara no es sonden), es fa servir l'índex
com abans. Quan el mapa diu `__noEntry` no s'observa res, en lloc d'atribuir el text de cpl
a una casella que ningú llegeix. Cada execució informa de quantes hores han vingut de cada
font.

Resultat del join tornat a córrer (mateixa finestra i diòcesi):

| | Abans | Després |
|---|---|---|
| ids en conflicte | 3.667 | **3.060** |
| ids resolts | — | 5.684 |

746 conflictes es van resoldre i en van aparèixer **139 de nous** — i aquests són bona
notícia: són caselles que abans no s'observaven (camps a `-1`, dies especials mal
arxivats) i que ara plantegen una pregunta de veritat. Exemple: `himnos/3743` el
comparteixen el 28 i el 29 de juny (vigília i festa de Sant Pere i Sant Pau) amb 9 dies
cadascun i dos himnes diferents.

El cas que va destapar tot això, vist des del panell:

```
salmos_citas/35   abans: 7 textos · 72 dies · 8 sortirien malament
                  ara:   2 textos · 69 dies · 1 sortiria malament (2022-10-05)
```

L'`advent_december_18` continua sortint a la taula, però ara com a **"coincideix"**: els
anys en què el 18 cau en dimecres l'app sí que fa servir aquesta casella, i hi està d'acord.

**b) Bug real a saints-app (no corregit, avisar l'equip).** Quan un dia no té entrada a
`all_laudes.json`, `laudesStore` registra ERR-004 i fa `return` **sense netejar
`contentByDay`**: l'app es queda mostrant els textos del dia anterior. Verificat amb la
sonda — els 19 camps de Santa Eulàlia (12-02-2026) eren idènticament els de Pasqua
(05-04-2026), el dia consultat just abans. És a dir, quan es publiqui el calendari català,
Eulàlia i companyia **no** mostraran un error: mostraran en silenci els textos del dia que
estiguessis mirant abans. La sonda ho detecta llegint `loadingState`/`errorCode` en lloc
de fiar-se del contingut.

### El patró que va destapar la subtaula: els outliers d'un sol dia són memòries

Mirant qui són aquests dies solitaris, no estan repartits a l'atzar — es concentren en unes
poques **dates de calendari** que es repeteixen any rere any amb un id de litcal diferent
cada cop (perquè el dia de la setmana canvia):

| Data | Vegades que és l'únic outlier d'una casella | Què hi ha a `cpl-app.db` |
|---|---|---|
| 23 de juny | 52 | Sants Joan Fisher i Tomàs More (Barcelona) |
| 5 d'octubre | 50 per any (2018, 2021, 2022, 2023…) | Témpores d'acció de gràcies i de petició |
| 24 d'abril | ~41 | Sant Fidel de Sigmaringen / Sant Pere Ermengol (Tarragona) |
| 1 de maig | 38 | Sant Josep obrer |
| 17 de gener | 30 | Sant Antoni, abat |
| 21 de juny | 30 | Sant Lluís Gonzaga |
| 1 d'octubre | 30 | Santa Teresa de l'Infant Jesús |

És **exactament el patró de la secció 10.2**, però amb la clau ferial normal en lloc d'una
`__MEMORY_FERIAL`: litcal resol aquell dia com una fèria qualsevol, ES hi té el text ferial,
i cpl-app hi dona el text propi del sant. Com que cada any la memòria cau en un dia de la
setmana diferent, contamina una casella ferial **diferent cada any**, i n'hi ha prou amb una
observació per bloquejar-la.

Mesurat: **1.152 dels 3.667 ids en conflicte (31%)** tenen totes les variants minoritàries
amb **una sola observació** i una majoria de ≥3 dies. Si es decideix seguir el conveni d'ES
per a les memòries opcionals (la pregunta ja plantejada a 6b), aquests 1.152 es desbloquegen
sols, sense encunyar cap id nou.

## 8e. Per què un dia és diferent: diagnòstic contra el calendari

Fins ara el panell sabia dir *que* una casella està en conflicte i *quins* dies hi
discrepen, però no *per què*. Perseguint un cas concret (12-08-2026, 1r salm de Laudes: 68
dies d'acord i un de sol que no, el 05-10-2022) va resultar que la causa era estructural i
no editorial: **cpl-app hi celebra les "Témpores d'acció de gràcies i de petició"**
(`santsMemories` id 377, `dia='05-oct'`, memòria obligatòria amb ofici propi complet —
Laudes amb Salm 50, Càntic Is 45, Salm 99), i **litcal no en sap res**: ni `spain.json` ni
`catalonia.json` tenien cap regla per al 5 d'octubre, o sigui que el dia es resol com a
fèria i l'ofici propi s'escriu dins la casella de la fèria.

I no és cosa d'un any: com que el 5 d'octubre cau en dia de la setmana diferent cada any,
**cada any embruta un joc de caselles diferent** (52 el 2020-2023 i 2026, 51 el 2018, 30
els dissabtes 2019/2024, cap el 2025 perquè va ser diumenge). **241 de les 3.060 caselles
en conflicte (7,9%) queden netes només resolent aquest dia.**

### La causa arrel: un any representatiu no descriu el calendari

`generate-catalan-calendars.js` creuava `santsMemories` amb `anyliturgic` **usant un sol
any** (`--year`, per defecte 2025) per saber el rang M/L/V. Però `anyliturgic` és un
almanac *per any*: una memòria que aquell any queia en diumenge o sota una solemnitat hi
consta com a `-`. El 5 d'octubre de 2025 va ser diumenge → fila saltada amb un warning →
la celebració no arribava mai a litcal.

Mesurat: **75 memòries úniques se saltaven i 53 tenien rang documentat en algun altre any**
— entre elles Sant Vicenç Ferrer, Sant Ambròs, Sant Joan de la Creu, Sant Tomàs Becket,
Sant Cugat (tres diòcesis) i Sant Ramon Nonat (deu). Corregit: ara es recorren els 10 anys
i es queda el **rang més alt observat** (un any suprimit no diu res del rang propi de la
celebració, només de què la va superar). `catalonia.json` passa de 180 a **269 regles**.

### Les tres formes que pren el problema

`missing-celebrations.js` creua la sonda de celebracions amb l'informe de conflictes i
classifica cada grup de dies discrepants:

| Veredicte | Què vol dir | Grups |
|---|---|---|
| `missing` | cpl-app celebra una cosa que litcal no coneix → **cal afegir-la al calendari** | 14 |
| `not-applied` | ja és al calendari però litcal no l'aplica: memòria lliure, o cpl la trasllada (Sant Jordi fora del 23-abr) | 66 |
| `mismatch` | tots dos celebren, però coses diferents — trasllat o precedència (Immaculada, Naixement de sant Joan) | 121 |
| `ferial-drift` | cap celebració pel mig: el text de la fèria varia per si sol (saltiri, cicle) | 206 |

Les tres més grosses de `missing`: Témpores (241 caselles només seves), Memòria de Santa
Maria en dissabte (25 — i no és de data fixa, o sigui que el generador no la pot produir),
Sant Cugat (11, recuperada per la correcció de l'any representatiu).

### Com es fa servir

```
npx jest migration-to-saints/celebration-probe.test.js --silent   # què celebra cpl cada dia (~18 s)
node migration-to-saints/missing-celebrations.js                  # creua-ho amb els conflictes
node migration-to-saints/day-check.js 2026-08-12                  # el dia, ja amb diagnòstic
```

El panell ho fa sol: hi ha un pas nou al migrador (*"Diagnosticar els conflictes contra el
calendari"*) que corre les dues coses després del join, i l'inspector de dia obre amb un
bloc que separa les dues preguntes que és fàcil confondre — **què celebra aquest dia** (i si
litcal hi està d'acord) i **qui té la culpa que li faltin camps**, que gairebé mai és el
mateix. Per al 12-08-2026: "51 camps, 44 només per això → Témpores d'acció de gràcies i de
petició — litcal no coneix aquesta celebració".

### El cost que queda per decidir

Afegir la celebració a litcal és només la meitat. `all_celebrations.json` de saints-app (610
claus) **no té cap entrada per a les Témpores** — es/it tampoc les celebren. Seria el primer
cas de la migració on cal **encunyar claus i ids numèrics nous a l'índex compartit** en lloc
d'omplir caselles ja fixades per es/it, que és precisament el que la secció 2 evitava.

## 8b. La cua de revisió: el 20% que no s'automatitza, empaquetat

**Decisió presa: de moment NO s'encunyen ids nous.** Quan cpl-app té més diversitat que ES
(secció 6c, grup B), aquests casos no es forcen ni es descarten: s'empaqueten perquè es
puguin decidir més endavant amb calma.

`migration-to-saints/review-queue.js` converteix el bolcat cru de conflictes en un backlog
revisable. La idea: **2.667 ids en conflicte no són 2.667 problemes independents**. Un id
està en conflicte per una causa que també afecta els seus veïns. Agrupats per aquesta
causa, queden **488 paquets**:

| Causa | Paquets | ids que cobreixen |
|---|---|---|
| `feast` — una festa concreta on cpl i ES no s'entenen | 185 | 1.814 |
| `shared` — una casella que ES recicla entre celebracions diferents | 281 | 602 |
| `psalter` — el saltiri de 4 setmanes del Temps Ordinari | 16 | 242 |
| `ordinary-weekday` — Temps Ordinari amb setmanes barrejades | 6 | 9 |

El paquet `psalter` surt d'un patró verificat: les claus en conflicte són sempre
`ordinary_time_{11,15,19,23,27,31,7}_monday` — totes **≡ 3 (mod 4)**. ES té una sola
casella per al dilluns de la setmana 3 del saltiri i cpl-app dona text propi a cada
setmana del calendari. Això és **una** pregunta, no set.

Els paquets més grans: *Immaculada Concepció* (34 ids), *saltiri dilluns setmana 3*
(31 ids), *Advent 2n diumenge* (26 ids), *saltiri dissabte setmana 2* (25 ids).

### Decisions possibles

| Valor | Significa |
|---|---|
| `pending` | Sense revisar (per defecte) |
| `park` | **Necessita ids nous — ho decidiré més endavant** |
| `follow-es` | Seguir el conveni d'ES: un sol text compartit |
| `cpl-wrong` | cpl-app s'equivoca aquí, ES té raó |
| `ignore` | Irrellevant, deixar en blanc per sempre |

Es guarden a `migration-to-saints/review-decisions.json` — fitxer normal, versionable i
editable a mà — i **sobreviuen a tornar a córrer el migrador**. Cada decisió porta el
`fingerprint` del contingut en conflicte del seu paquet; si el contingut canvia (p.ex. en
passar de 3 a 10 anys de finestra), el paquet surt marcat com a **desactualitzat** en lloc
de mantenir en silenci una resposta que ja no correspon.

Es fa servir des de la **targeta 7** del panell (filtres per causa i per estat, barra de
progrés, i el detall de cada id amb totes les variants), o per línia d'ordres:

```bash
node migration-to-saints/review-queue.js     # resum del backlog
```

**Nota**: les 185 festes del grup `feast` són precisament les que la secció 6c diu que no
es poden diagnosticar amb 3 anys. Convé córrer la finestra 2017-2026 **abans** de posar-se
a revisar-les una a una, perquè moltes canviaran de causa o desapareixeran.

## 9. El model real: saints-admin és la font de veritat, no els JSON

Fins aquí aquest pla tractava `saints-app/src/store/db/**.json` com si fossin l'origen de
les dades. **No ho són**: són un *export*. L'origen és la base de dades de `saints-admin`
(Supabase). Això canvia on s'han d'escriure les coses, i valida les dues intuïcions que
hi havia sobre el model.

> Llegit del checkout local de `../saints-admin`, que està **1.040 commits enrere** de
> `origin/main`: el `git pull` es va aturar perquè hi ha canvis locals sense committejar
> (`.env` esborrat, `AGENTS.md`, `ci/deploy_*.sh`, `DeploysWebs.tsx`...). No s'ha tocat res.
> Les migracions llegides arriben fins al 2026-06-23; el que hagi canviat després no hi surt.

### 9.1 Contingut: master + i18n (confirma la intuïció "mateix id, mateix text traduït")

```
mst_hymns(id)                          -- identitat compartida, NOMÉS un id
cnt_hymns_i18n(master_id, language_code, content)   -- PK (master_id, language_code)
```

Cada família de contingut té aquest parell (`mst_psalm_texts` + `cnt_psalm_texts_i18n`,
`mst_responsories` + `cnt_responsories_i18n`, ~20 parells). La taula master **no té cap
columna de text**: existeix només per donar un id estable que l'estructura pugui
referenciar. Afegir català = inserir files amb `language_code='ca'` per als **mateixos
`master_id`**. És exactament el que fa el pipeline d'aquest repo, però escrivint el JSON
final en lloc de la BD.

Corol·lari sobre el grup B de la secció 6c: quan ES fa servir un sol `master_id` per a 73
dies i cpl-app hi té 35 textos diferents, **no és un problema de traducció** — és que la
BD afirma "aquests 73 dies comparteixen el mateix text" i en català això resulta no ser
cert. Per tenir-los diferenciats caldria crear `master_id` nous i canviar les files de
`str_lauds` que hi apunten, i això afecta es/it perquè l'estructura és compartida.

### 9.2 Estructura: té `cycle_code` a totes les hores

```
str_lauds(date_code, cycle_code, hymn_id, first_psalm_ref_id, ..., final_prayer_id)
str_vespers / str_office / str_terce / str_sext / str_none / str_mass_readings   -- igual
str_lauds_intercessions(lauds_date_code, lauds_cycle_code, intercession_id)      -- N:M
str_lauds_responsories(lauds_date_code, lauds_cycle_code, responsory_id)         -- N:M
```

`cycle_code` és columna de primera classe a **totes** les taules d'hores, i
`src/constants/mappingDefaults.ts` la mapeja al camp `cycle` del JSON exportat — que és
el sufix `__ANY`, `__YEAR_A`... de les claus dels `all_*.json`. O sigui: el sufix de
cicle no és un detall del fitxer, és una columna del model.

A l'app, `src/utils/structureHelpers.ts` té dues funcions:

- `findInStructure(structure, id, cycles)` — **conscient del cicle**, prova una llista
  ordenada. Només la fan servir les lectures (`lecturesStore` passa
  `["ANY", "MEMORY", ODD|EVEN, sundayCycle]`).
- `findInStructureById(structure, id)` — agafa **la primera** clau amb aquell prefix,
  ignorant el cicle. La fan servir Laudes, Vespres, Ofici, Tèrcia, Sexta, Nona, Invitatori.

Per tant, la infraestructura per resoldre contingut per cicle **ja existeix i ja està en
producció** per a les lectures. Diferenciar Laudes/Vespres per cicle A/B/C seria: files
`str_lauds` amb `cycle_code='YEAR_A'`... i canviar `findInStructureById` per
`findInStructure` al store. No és un concepte nou a inventar.

### 9.3 Calendaris: hi ha un pipeline oficial que aquest pla s'està saltant

```
cfg_liturgical_calendars(code, parent_id, calendar_type: universal|country|diocese|religious_family)
cfg_calendar_rules(calendar_id, action: ADD|REPLACE|SUPPRESS|TRANSFER, celebration_id, rank, date_rule...)
```

I segons `saints-admin/docs/litcal-release-pipeline.md`:

```
admin clica "Release" → edge fn export-calendar-rules → PR `cal:` a litcal
   → merge manual → CI publica @saints-app/litcal → PRs automàtics de bump a admin i app
```

**Els 13 calendaris catalans de la secció 6 estan escrits a mà a
`litcal/src/data/calendars/*.json`, saltant-se aquest circuit.** `cfg_liturgical_calendars`
ja té `calendar_type='diocese'` i jerarquia via `parent_id`, que és exactament el que
modelen (`catalonia` amb parent `spain`, cada diòcesi amb parent `catalonia`). El lloc
correcte a llarg termini és `cfg_calendar_rules`, i deixar que el pipeline generi el JSON.
Mentre no es faci, qualsevol release fet des de l'admin pot sobreescriure'ls.

### 9.4 El percentatge de migració ja està definit a la BD

```sql
mon_language_coverage(language_code, liturgical_type, total_ids, completed_ids, percentage)
recompute_language_coverage(p_language)
```

La definició oficial de "cobert", que convé adoptar en lloc d'inventar-ne una:

- **Univers**: les celebracions actives de `mon_litcal_catalog` (`archived_at IS NULL`).
- **Tipus**: `Invitatorio, Laudes, Oficio, Tercia, Sexta, Nona, Visperas, Lecturas de la Misa`.
- **Cobert**: una celebració compta només si (a) existeix la fila a `str_*` i (b) **tots**
  els camps referenciats tenen contingut en aquell idioma (`pct >= 100` a
  `compute_celebration_completion`). Una celebració del catàleg sense fila d'estructura
  compta com a NO coberta.
- Hi ha `get_missing_celebration_ids(lang, type)` per llistar què falta.

O sigui: el "% de migració al català" no és un número a inventar en aquest repo — és
`recompute_language_coverage('ca')` un cop les dades siguin a la BD. Els idiomes vius són
a `cfg_languages`.

### 9.5 Conseqüència per a aquest pla

L'estratègia actual (escriure JSON directament a `saints-app` i `litcal`) és **vàlida per
provar-ho en local i veure-ho a l'app**, que és el que es vol ara. Però no és el camí
d'entrada definitiu: perquè el català sigui un idioma de debò cal acabar a
`cnt_*_i18n` amb `language_code='ca'` i a `cfg_calendar_rules`, via saints-admin. El JSON
d'aquest repo hauria de veure's com un *staging* que després s'importa, no com el destí.

## 10. El bloquejador que amagava tota la resta: `invitatorios.json`

Trobat executant l'app de debò (Chrome headless via CDP contra el `vite` de `saints-app`,
idioma `ca`, rellotge congelat al 15-08-2026 — Assumpció, ~70% de camps ja migrats):
Laudes i Vespres sortien **completament en blanc**, no parcialment. Captura i DOM: el
`div.page` només contenia el botó de TTS; `document.body.textContent` buit. El mateix
recorregut amb `es` donava 37 KB d'HTML i el text sencer, o sigui que no era artefacte
del headless.

Causa, a `saints-app`:

```
src/views/divineOffices/LaudesPage.vue:4    <Content v-if="data && invitatoryData">
src/views/divineOffices/VisperasPage.vue:4  <Content v-if="data && invitatoryData">
src/views/divineOffices/OfficePage.vue:4    <Content v-if="data && invitatoryData">
```

Les tres pàgines es renderitzen **només si l'Invitatori ha carregat**. Com que
`day_specific_texts/commons/ca/invitatorios.json` no existia, `invitatoryStore.
changeDayInvitatorios` peta (ERR-003), `invitatoryData` queda a `null` i la pàgina
sencera desapareix — **independentment de quant contingut de Laudes/Vespres s'hagi
migrat**. És a dir: el % de cobertura per dia no prediu si la pàgina es veu; hi ha una
dependència dura i sense fallback sobre una taula que el pilot no cobria.

Lliçó per a la resta de la migració: abans de mesurar cobertura d'una Hora, comprovar
quines taules bloquegen el `v-if` de la seva pàgina. `IntermediateHourPage.vue` només
demana `data`, per això Tèrcia/Sexta/Nona no pateixen això.

### 10.1 Dues fonts noves al pipeline de join

`join-content.test.js` ara accepta observadors per "hora" (`HOURS_CONFIG[h].observe` i
`dataKey`), perquè no tot el que cal té la forma de camps d'una Hora. Afegits:

- **`Invitation`** → `all_invitatorios.json` (entrada `{ val: <id> }`, un sol camp) →
  `commons/ca/invitatorios.json` des de `hoursLiturgy.Invitation.InvitationAntiphon`.
  **50 antífones resoltes de 81, 23 pendents.** Desbloqueja Laudes, Vespres i Ofici.
- **`Celebration`** → `all_celebrations.json` (clau = id de litcal sense sufix `__CICLE`)
  → `commons/ca/celebration_names.json` des de
  `hoursLiturgy.TodayCelebrationInformation.Title`. **131 noms resolts, 2 pendents.**

### 10.2 Trampa trobada als noms de celebració (i per què se'n descarten les fèries)

La primera passada donava 215 noms "resolts", però 84 eren **incorrectes**: per a un id
ferial com `ordinary_time_1_wednesday`, ES hi guarda el nom del dia ("Miércoles de la 1ª
semana del Tiempo Ordinario"), mentre que el `Title` de cpl-app per a aquella data dona
la **memòria opcional** que hi cau ("Sant Hilari, bisbe i doctor de l'Església"). Escriure
això clavaria el nom d'un sant concret a TOTES les recurrències d'aquell dia de la
setmana. La política d'acord unànime **no ho detecta**, perquè és consistentment erroni,
no inconsistent (ids 10/11/13/14 → tots "Sant Eulogi de Còrdova"; 19/20 → "Sant Hilari").

Per això `HOURS_CONFIG.Celebration.isFerialKey` descarta els ids estacionals/ferials i
només s'escriuen celebracions pròpies (sants i festes amb nom). Els dies ferials seguiran
mostrant el nom en anglès fins que es decideixi d'on treure'ls (generar-los a partir dels
literals de `generic_texts/ca`, com fa la pròpia app per a la segona línia, sembla el
camí natural — no de cpl-app).

### 10.3 Fuita d'idioma detectada a saints-app (NO corregida)

`DateAndLiturgicalDay.vue:57` concatena la paraula `" salterio"` hardcodejada, i per tant
en català la segona línia surt com "SETMANA III SALTERIO". No es pot arreglar tocant
només fitxers de `ca`: la paraula viu dins d'un component compartit pels tres idiomes,
així que qualsevol correcció implica el component i una clau nova als tres
`generic_texts/*/literals.json` (ja hi ha `ofThePsalter` = "del salterio"/"del saltiri",
però amb l'article, que no encaixa aquí). Es deixa pendent de decidir a part.

### 10.4 Què queda obert després d'això

- Els dies **ferials** (p.ex. 12-08-2026) ja pinten l'estructura de la pàgina, però el
  contingut segueix majoritàriament buit: és el problema de la política de conflictes
  (secció 6b), no del bloquejador d'aquesta secció.
- `db/dailySaints/ca/dailySaints.json` no existeix → la targeta "Sant del dia" mostra
  "error" (`saintsStore.setSaintOfTheDay` falla amb l'import dinàmic).
- `commons/ca/` encara no té `oficio_*`, `lecturas_*`, `comentarios_*` → Ofici, Lectures
  i comentaris continuen fora de servei en català (fora de l'abast del pilot Laudes+Vespres).

## 11. El comparador de dia: llegir el dia a les dues apps sense el mòbil

Fins ara, per saber com quedava un dia calia obrir cpl-app i eprex al telèfon i baixar-los
en paral·lel. L'Inspector de dia ja deia *si* un camp tindrà text i *per què* no en té; el
que faltava era el text de l'altre costat, el de cpl-app, per poder-los llegir junts.

És una targeta pròpia del panell (`#daycompare`, `/api/day-compare`), no un afegit de
l'Inspector: l'Inspector respon "sortirà bé?", i això respon "com queda?". Mostra, camp a
camp i en ordre de lectura:

- **cpl-app**: resolt en viu contra `cpl-app.db` amb els *Services* de cpl-app
  (`cpl-day.test.js` + `lib/cpl-day-resolver.js`). És Jest pel mateix motiu que el join:
  els *Services* necessiten els mocks d'RN/expo del preset `jest-expo`, i la seva única
  costura amb la BD és `DatabaseManagerService`.
- **saints-app**: la casella mesurada (`app-cell-map.json`, índex com a suplent) llegida de
  `commons/<idioma>`, via `checkDay` — la mateixa resposta que dona l'Inspector, sense
  segona opinió sobre quina casella toca.

### 11.1 Els dos costats es trien per separat

Cada columna té els seus controls, i no comparteixen selector:

| costat | què es tria | què vol dir |
| --- | --- | --- |
| cpl-app | diòcesi + lloc (Diòcesi/Ciutat/Catedral) | de quina diòcesi resa cpl-app |
| saints-app | calendari litcal + idioma (`ca`/`es`/`it`) | com resol el dia saints-app i de quin `commons/` llegeix |

Apuntar-los al mateix lloc (`Barcelona` + `diocese-barcelona` + `ca`) respon *"sortirà bé
aquest dia?"*. Creuar-los respon altres preguntes reals: com queda el dia en castellà, o
què celebra una diòcesi que una altra no. Per això el calendari **segueix** la diòcesi
mentre no el toquis, i es deslliga en quant el tries a mà.

Perquè això funcioni calien dues coses:

- `checkDay` accepta `litcalId` i `language`. El manifest de la migració només resol dates
  per a **un** calendari; per a qualsevol altre, `lib/litcal-day.js` crida l'script de
  litcal (`build-date-to-key-manifest.ts`) per a un rang d'un sol dia — el mateix camí de
  codi que la migració, o sigui que mai poden discrepar — i ho desa a
  `output/raw/litcal-days/<calendari>.json`.
- El **mapa mesurat només val si és del mateix dia litúrgic**: la sonda va córrer l'app
  amb un calendari concret, i si el calendari que preguntes celebra una altra cosa aquell
  dia, les caselles mesurades són d'algú altre. En aquest cas `checkDay` cau a l'índex.

Només `ca` és objectiu de migració: en `es`/`it` un camp buit no és feina pendent sinó un
forat de l'app tal com es publica, i el panell ho avisa perquè no es llegeixi igual.

Tres coses que fan que les dues columnes es corresponguin amb el que es veu a la pantalla:

- Quan `commons/ca` no té l'id, **saints-app no cau al castellà**: `TextService` retorna
  literalment `id N not found in <taula>`, i això és el que es mostra a la columna.
- Un camp amb `-1` a l'índex (`ferial`) **no és un forat**: aquell dia no té text propi
  allà i el pren del saltiri/la fèria. Es marca i es plega, no es compta com a mancança.
  (`checkDay` ho reporta a `hours[].noProperText`.)
- Els camps idèntics es pinten **una sola vegada**: si les dues apps diuen el mateix no hi
  ha res a comparar, i llegir-ho dues vegades és justament la feina que l'eina treu.

La capçalera compara també el **títol de la celebració** de cada costat: quan no coincideix,
la resta de diferències del dia acostumen a venir d'aquí.

Cost: ~3 s el primer cop (arrencar Jest), instantani després — el dia resolt es desa a
`output/raw/cpl-days/<diòcesi>-<lloc>/<data>.json` i només es recalcula si `cpl-app.db` és
més nou (o amb el botó "Recalcular cpl-app").

### 11.2 De l'inspector al comparador: les dates del conflicte són clicables

El detall d'un conflicte diu "si hi escrivim el text d'aquest dia, aquests N dies mostraran
un text que no els toca" i llista les dates. Això és una **afirmació**, i l'única manera de
comprovar-la és llegir aquell dia a les dues apps. Ara cada data és un botó: porta la data
**i la casella** al comparador, hi executa la lectura i hi deixa la fila enfocada.

El salt aterra **en castellà**, i el calendari **no es toca**. Els dos selectors no són el
mateix eix, i confondre'ls és un error real:

- L'**idioma** només tria de quin `commons/<idioma>` es llegeix: la casella és la mateixa.
- El **calendari** decideix a quin `litcalId` resol la data i, per tant, **quina casella**
  es llegeix. El 12-02-2026 amb `diocese-barcelona` és `santa_eulalia_verge_i_martir` i amb
  `spain` és `ordinary_time_5_thursday`: forçar `spain` per "llegir-ho en castellà" et
  respondria sobre un altre dia.

Va en castellà perquè és la pregunta que s'està fent: la casella està en conflicte, o sigui
que **en català és buida** i tots dos dies mostrarien no-res. El castellà en té **un** text,
el mateix per a tots els dies que la comparteixen, i llegir-lo al costat del que hi vol
cpl-app aquell dia concret és el que et diu si els dos dies són la mateixa cosa o no.

Si el calendari es canvia a mà i la casella enfocada desapareix de la lectura, el panell ho
diu (quin `litcalId` ha resolt i per què), en comptes de respondre en silenci sobre un altre
dia.

La comparació de **títols** només es fa quan l'idioma és `ca`. Entre idiomes, "Sant Maximilià
Maria Kolbe" i "San Maximiliano Kolbe" són el mateix sant, i marcar-ho com a desacord faria
saltar l'avís a totes les lectures en castellà (`verdict: 'notComparable'`).

Amb això es distingeixen a ull els dos casos que abans es confonien:

- `salmos_citas/189` el 14-08-2017 → cpl-app "Salm 83, Amor al temple del Senyor" i
  saints-app "Salmo 83: Añoranza del templo". Idiomes diferents, **mateix concepte**: bé.
- `himnos/840` llegit en `es` els dos dies dona **el mateix** text ("La noche, el caos, el
  terror…"), perquè una casella té un sol text. cpl-app, en canvi, hi vol "Reflex del Pare
  gloriós" el 2017 i "Llum eternal de tots els cels" el 2026. **Dos himnes per a una
  casella**: el conflicte és real i com a molt un dels dos hi pot anar.

Detall d'implementació que va costar una estona: els xips de data i les files del comparador
feien servir el mateix atribut (`data-dcmp-cell`), i com que els xips van abans al document,
l'enfocament aterrava sempre al xip. Les files ara duen `data-dcmp-row-cell` i les consultes
van qualificades per classe.

### 11.3 El que amagava el `-1`: els camps `_Ferial` (bug real del comparador i de l'inspector)

Llegint el 14-08-2026 va sortir que a partir de l'himne només hi havia una columna. La causa
no era de pintura: `-1` **no** vol dir "aquest dia no té text aquí i s'acaba la història".

`laudesStore` carrega **dues** entrades per dia — la del sant i la de la fèria
(`liturgicalDay.weekday.id`) — i desa la segona als camps `<camp>_Ferial`. `LaudesPage.vue`
(`getPsalmElement`) llegeix els `_Ferial` sempre que el sant no hi té text propi. O sigui
que en una memòria **els salms de la pantalla són els de la fèria**, i el `-1` de l'entrada
del sant és un punter, no un buit.

La sonda ja ho mesurava (`app-cell-map.json` té les 19 claus `_Ferial`); `day-check` era qui
les ignorava. Ara:

- Si la casella base és `-1` i n'hi ha una de `_Ferial`, es fa servir aquesta i el camp es
  marca `fromFerial`.
- Si les dues existeixen i difereixen (l'interruptor memòria/fèria de la pàgina), la segona
  viatja com a `ferialAlt`.
- Sense sonda no hi ha manera de saber amb quina fèria s'aparella el dia, i llavors sí que
  només es pot dir "sense text propi" (`noProperText`).

**Això canvia números de l'inspector, i a la baixa**: el 14-08 passa del 42% al 35%, i
l'agost del 2026 del 39% al 36%. No és una regressió, és que abans no comptàvem 9 caselles
per dia de memòria que l'app sí que llegeix — i que en català **estan buides**: el 14-08,
`salmos_citas/72`, `salmos_antifonas/71`, `salmos_textos/73`… surten totes com a
`id N not found`. Els salms d'una memòria no es veuen en català.

### 11.4 Sospita gran que surt d'aquí: el join escriu text ferial a caselles de sant

El comparador marca 14 camps del 14-08 com a *"coincideixen en mode fèria"*: el text que
cpl-app dona per aquell dia és **idèntic** al de la casella ferial de l'app (himne 72,
precs 3, responsoris 1745-1750…), no al de la casella pròpia del sant (840, 31, 1225…) —
que és on el join l'escriu.

Té sentit litúrgic: en una memòria l'ofici és el de la fèria amb l'oració pròpia del sant
(i, efectivament, `oraciones_finales/272` sí que quadra i surt "igual"). Si es confirma,
la conseqüència és forta: **cada memòria estaria rebent, any rere any, el text ferial del
dia de la setmana que li toqui** — text diferent cada any — a la mateixa casella. Això
generaria conflictes garantits, i podria explicar bona part de la massa de conflictes de la
secció 6b.

És una hipòtesi, no un fet: es comprova mirant si les variants dels ids en conflicte de dies
de memòria es corresponen amb els textos ferials de dies de la setmana diferents. No s'ha
tocat res del join.

Primer intent de comprovació, amb el resultat honest: `himnos/840` (Kolbe) rep dos himnes
diferents el 2017 i el 2026, o sigui que el conflicte és real. El 2026 el text de cpl-app
**és** el de la casella ferial (`himnos/72`). El 2017 no es pot dir, perquè la casella
ferial d'aquell dia (`himnos/192`) també està en conflicte i no té text amb què comparar —
no és un "no", és un "no ho sabem". Fer-ho bé demana comparar contra el text que cpl-app
dona per al dia ferial corresponent, no contra el que hi ha migrat.

### 11.5 Primera troballa de l'eina: Santa Eulàlia surt a tot Catalunya

Comparant **Girona + `diocese-girona` + ca** el 12-02-2026, cpl-app no hi celebra res
(fèria) i litcal hi diu `santa_eulalia_verge_i_martir`. L'origen no és el comparador:

- `webui/run/candidates/` (el que **calcula** aquest repo) posa Eulàlia només a
  `diocese-barcelona`; ni a `catalonia.json` ni a `diocese-girona.json`.
- `litcal/src/data/calendars/catalonia.json` (el que hi ha **escrit** a litcal) sí que la
  té — i totes les diòcesis catalanes hereten de `catalonia`, o sigui que se la mengen
  totes.

(Compte de no confondre-la amb `santa_eulalia_de_merida_verge_i_martir`, del 10 de febrer,
que sí que és de tot Catalunya.) Queda pendent de mirar si és una passada antiga de
l'etapa 2 que va quedar escrita, o una promoció indeguda de diocesà a general.

## 12. Conflictes fantasma: el join comparava els textos amb els espais inclosos

Trobat inspeccionant `salmos_textos/73` el 2022-04-15 (Divendres Sant). El panell deia que
la casella té **4 variants** i que, si s'hi escrivia el text d'aquest dia, **21 dies de 329
sortirien malament** — Cendra (10), Divendres Sant (10) i el 24 de desembre (1). Però anant
a llegir el dia a les dues apps, tant cpl-app com saints-app hi mostren el **Salm 50**, el
mateix que el text majoritari. El "es trencaria" era fals.

**Causa**: `observe()` a `join-content.test.js` agrupava les observacions per la cadena
crua (`Map(value -> tags)`). cpl-app guarda el mateix text moltes vegades a la seva DB i
les còpies no són idèntiques byte a byte: un espai de més abans del salt de línia, tres
espais abans de l'`*` en lloc de quatre. Les 4 variants del Salm 50 eren, de fet, **3
còpies del mateix text** més el Salm 56:

| variant | dies | diferència respecte de la 0 |
|---|---|---|
| 0 | 308 | — |
| 2 | 10 | `purifiqueu-me dels pecats.··\n` (dos espais finals) |
| 3 | 1 | `he pecat,···*` (tres espais en lloc de quatre) |
| 1 | 10 | text realment diferent (Salm 56 — Cendra) |

La conseqüència anava en dues direccions: caselles unànimes es retenien com a "en
conflicte" i no es migraven, i l'anàlisi d'impacte acusava de trencar-se dies que volen
exactament el mateix text.

**Correcció**: `lib/text-key.js` — una clau de comparació que ignora els blancs
(runs d'espais/tabs, blancs al final de línia, línies en blanc de més) i **no** toca res
més: els salts de línia i els marcadors `*`/`†`, que sí que són significatius, es
conserven. `observe()` agrupa per aquesta clau i guarda les grafies crues que ha vist; el
que s'escriu a `commons/ca` continua sent una sortida crua de cpl-app, byte a byte (la
grafia més freqüent del grup, per no jugar-se-la a l'ordre d'observació entre execucions).
Pinçat a `text-key.test.js` per les dues bandes: què ha de col·lapsar i què no.

**Resultat de re-córrer el join** (finestra 2017—2026, Laudes+Vespres+Invitatori+Celebració):

- **173 variants fantasma** desaparegudes de `join-pending-review.json` (13.480 → 13.307).
- **16 caselles** passen de conflicte a migrades (969 observacions-dia), entre elles
  `salmos_textos/11090` (196 dies) i tres responsoris de 106 dies cadascun.
- **Cap text existent no ha canviat**: 16 claus noves a `commons-ca`, 0 modificades, 0
  eliminades.
- `salmos_textos/73` queda amb **2 variants** i l'impacte real: 319 dies d'acord, 10 que es
  trencarien, **1 sola celebració** (Cendra, que sí que vol el Salm 56). Divendres Sant i
  el 24 de desembre ara consten com a `same`.

Els 3.044 pendents que queden són, doncs, discrepàncies de text de veritat.

## 13. Conflictes fantasma (2): el join comparava dos oficis diferents

Sortí d'una lectura del 14-08-2026 (sant Maximilià Kolbe): a cpl-app la lectura breu de
Laudes és **2C 12, 9b-10**, a eprex **2 Co 1, 3-5**, i el panell donava el dia com a 35%
amb 23 conflictes i el diagnòstic *«litcal i cpl-app no celebren el mateix aquest dia
(trasllat o precedència)»*. Cap de les dues coses era certa: les dues apps celebren Kolbe,
i les dues diuen el mateix. Estaven obertes per pestanyes diferents.

### 13.1 El fet: eprex duu dos oficis aquell dia, cpl-app només un

En una memòria que conserva la salmòdia de la fèria, saints-app carrega **dos** oficis i els
posa darrere d'un selector segmentat (`views/divineOffices/LaudesPage.vue`, `dualOption`):
el propi de la memòria i el de la fèria. Els seus *stores* els guarden com `<camp>` i
`<camp>_Ferial`, i la pàgina obre per la memòria. Només passa als cicles `MEMORY_FERIAL1`
i `MEMORY_FERIAL2` (60 claus de 494 a `all_laudes.json`); a `__ANY` no hi ha cap selector.

cpl-app no té aquest selector. En una memòria resa l'ofici de la fèria i només en substitueix
el que la fila de `santsMemories` li dona, que per a la majoria és poca cosa: de les **527**
memòries, 18 porten lectura breu pròpia, 35 himne, 17 responsori i 15 pregàries — però les
527 porten oració pròpia i 153 antífona del Benedictus. Mai va a buscar el comú: **les 527
files tenen `Categoria = '0000'`**, i `ObtainCommonOffices` retorna un ofici buit per a aquest
valor, o sigui que les branques `CommonOffices` de `CelebrationHoursLiturgyService` són codi
mort per a les memòries (per a solemnitats i festes sí que salten: aquelles taules tenen
categories reals).

**No és un forat, és la mateixa opció.** L'OGLH 235b diu que en una memòria l'himne, la
lectura breu, el responsori i les pregàries es prenen «del comú **o** de la fèria» quan no són
propis, i la web catalana `liturgiadeleshores.cat` (no oficial: l'edició oficial és la de la CPL) serveix
exactament el mateix que cpl-app: comprovat el 14-08-2026, lectura breu 2C 12, 9b-10 i responsori ferial.
No hi ha cap bug de cpl-app aquí — no s'obre cap `CPL-LIT-NNN`.

### 13.2 La conseqüència: el join escrivia text ferial dins del comú

Com que el join agafava la casella de la memòria, el text ferial de cpl-app anava a parar a
la casella del Comú de màrtirs, on discrepava de totes les altres dates que la comparteixen
(`lectura_breve_citas/96`: 141 observacions, 37 variants) i es descartava per sempre. Mesurat
el 14-08-2026: **2 de 16** camps de Laudes coincidien amb la columna memòria, **15 de 16** amb
la de fèria.

### 13.3 La regla, i per què no es pot decidir pel nom del camp

Un primer intent redirigia per nom de camp, amb una llista d'excepcions (`oracion_final`,
`cantico_evangelico_antifona`). Va embrutar `lectura_breve_citas/68`: 62 dates d'acord amb la
lectura del dia de la setmana i **6 intruses** — Mare de Déu dels Dolors, del Pilar, del Roser,
l'Exaltació de la Santa Creu i la Dedicació del Laterà, totes dies on cpl-app sí que té text
propi.

La pregunta s'ha de fer **per valor**, i qui la respon és cpl-app: es resol el mateix dia un
segon cop amb la celebració buida (`LaudesService.ObtainLaudes(masters, dia, new Laudes(),
settings)` — el camí de codi real, o sigui que estacions, setmanes del salteri i els dies
especials es comporten com a la pantalla). Un camp que surt igual de les dues maneres el va
prendre de la fèria, i aquella és la seva casella. Per a Vespres no cal ni la segona crida:
`VespersOptions.VespersWithoutCelebration` ja està calculat.

Amb una porta al davant: **només si el dia té el selector** (`__MEMORY_FERIAL*`). Sense
aquesta comprovació, una festa —que pren la salmòdia del diumenge de la setmana I per rang, no
pel seu text— «coincideix» amb la fèria i hi enviava els seus salms: sant Miquel i la
Presentació trencaven `salmos_citas/72`, on 411 dates estaven d'acord amb el Salm 50.

Tot plegat viu a `lib/memorial-ferial.js`, que fan servir el join, l'inspector i el
comparador, perquè no puguin discrepar.

### 13.4 Un segon fantasma pel camí: la casella `-1`

`observe()` descartava `id === -1` (l'índex dient «aquí no tinc text, pren-lo de l'altra
pestanya»). Però des que existeix el mapa mesurat l'id arriba com a **cadena** `"-1"`, i la
comparació amb el número deixava passar tots aquests camps: s'acumulaven sota una casella
literalment anomenada `-1`, on textos de dies sense cap relació es declaraven un conflicte
enorme (`salmos_citas/-1`: 2.751 observacions, 120 variants). Vuit taules en tenien una.

### 13.5 Resultat de re-córrer el join (finestra 2017—2026)

| | abans | després |
|---|---|---|
| caselles en conflicte | 3.030 | **2.167** (−863, −28%) |
| observacions-dia afectades | 89.404 | 90.014 (+610) |
| caselles fantasma `-1` | 8 | **0** |
| textos escrits a `commons-ca` | 5.714 | 5.396 (−318) |

Les observacions es mantenen: no s'inventen conflictes, es col·loquen on toca. Els **−318
textos** s'han desglossat un per un i no se n'ha perdut cap de bo:

- **~140 caselles ja no s'observen**: són les de la memòria (les 1225-1230 de Kolbe i
  companyia), on abans s'hi escrivia text ferial. Eren escriptures **incorrectes**.
- **~50 són vigílies de solemnitat**, un desacord real i independent que fins ara quedava
  tapat (§13.6).
- **0 sense explicació.**

I una guanyada que ho resumeix tot: `lectura_breve_citas/96`, el Comú de màrtirs, **ara
s'omple sol** amb «2C 1, 3-5». Les memòries ja no hi aboquen la fèria, i les *festes* de
màrtirs —on cpl-app sí que renderitza el comú— hi queden unànimes.

El 14-08-2026 passa de 2/16 a **21/21** camps iguals a Laudes. L'antífona del Benedictus i
l'oració final han anat soles a la casella de la memòria, sense cap llista escrita a mà.

### 13.6 El que ha destapat: les vigílies de solemnitat

`lectura_breve_citas/3357` ara té 57 dates dient «Jm 1, 2-4» i 2 dient «Rm 8, 29-30»: són el
14 d'agost de 2020 i de 2026, on cpl-app dona les **I Vespres de l'Assumpció** (l'endemà) i
saints-app les II Vespres de Kolbe. És una classe de desacord pròpia, estructural, i queda
oberta.

### 13.7 On es nota, i on no

- **El comparador** (`/api/day-compare`) llegeix la pestanya que resa cpl-app. És qui respon
  «estan d'acord?», i ara respon que sí quan ho estan.
- **L'inspector** (`/api/day-check`) segueix mirant la casella de la memòria quan se'l crida
  sol, perquè respon una altra pregunta —«què veurà qui obri l'app?»— i l'app obre per la
  memòria. Sense el costat de cpl-app no pot saber quins camps són ferials, i sense saber-ho
  no redirigeix res, que és sempre la direcció segura.
- **El veredicte** té una causa nova, `memorial`, i ja no acusa un trasllat que no existeix.
  98 grups hi cauen.

## 14. Conflictes fantasma (3): un asterisc perdut acusava 26 celebracions

Sortí de la revisió del **2026-09-02** amb la skill `revisio-dia`. El dia era net —52 camps,
0 divergències— però la forense C3 marcava el grup `ferial|ordinary_time_22_wednesday` com a
*«cap celebració pel mig: el text de la fèria varia per si sol»*, 5 dies contestats de 7, una
sola casella acusada: `salmos_textos/144`.

La maniobra de sempre —perseguir la minoria fora dels dies demanats— va donar de seguida que
cpl-app resa **el mateix text** els 10 dimecres de la setmana 22 del manifest, byte per byte.
No era la fèria la que variava.

### 14.1 El fet: la mateixa casella, alimentada per dues files diferents

Les etiquetes de les dues variants es partien net per hores:

| variant | observacions | hora |
|---|---|---|
| v0 | 81 | **totes Laudes** |
| v1 | 63 | **totes Vespres** |

Les vistes prèvies eren idèntiques. La diferència era més enllà del tall: a la fila de
Vespres, el vers «La terra ha donat el seu fruit,» **havia perdut l'asterisc de mediació**,
que la fila de Laudes del mateix salm sí que duu. Tres espais contra quatre, la resta, i
`lib/text-key.js` ja els col·lapsa des de la secció 12. L'asterisc no: la puntuació és
contingut i hi ha de sobreviure.

És un bug de dades de cpl-app, obert com a [CPL-LIT-003](cpl-bugs/CPL-LIT-003.md) i corregit
a `db-fixes/CPL-LIT-003.sql`. Afectava dues files: `salteriComuVespres/12.salm2` i
`santsMemories/377.Salm2Ofici` (Ofici de lectura de les Témpores d'acció de gràcies). Les
quatre còpies **sense** puntuar del mateix salm —el responsorial de la missa, a `LDdiumenges`,
`LDSantoral` i `diversos`— no es toquen: no tenen cap marca enlloc, i és així com han de ser.

### 14.2 La conseqüència: el diagnòstic acusava qui passava per allà

El model de culpa atribueix cada variant minoritària a les celebracions dels dies que la
porten. Com que la variant minoritària eren **totes les Vespres**, `salmos_textos/144`
acusava **26 grups** —sant Francesc d'Assís, santa Llúcia, sant Antoni abat, sant Jeroni,
santa Teresa de l'Infant Jesús, sant Gregori el Gran…— d'un desacord que no era seu. L'únic
que tenien en comú era resar Vespres.

Val la pena tenir-ho present com a classe: **una casella compartida per moltes celebracions
converteix un error d'una sola fila en una acusació massiva**, i la llista llarga de culpables
n'és el símptoma, no la causa. Quan el panell dona 18 noms per a un camp, la primera hipòtesi
ha de ser que el culpable és un de sol i no hi surt.

### 14.3 Resultat de re-córrer el join (finestra 2017—2026)

| | abans | després |
|---|---|---|
| variants de `salmos_textos/144` | 5 | **4** (81 + 63 → una de 144) |
| grups acusats per aquella casella | 26 | **1** |
| grups amb alguna acusació | 243 | **226** (−17) |
| caselles en conflicte | 771 | 771 |
| `commons-ca/` | — | cap fitxer canviat |

Els 17 grups que desapareixen no tenien cap altra casella en conflicte. El grup
`ferial|ordinary_time_22_wednesday` s'esvaeix i el dia passa de `ferial-drift` a `ok`.

Que les caselles en conflicte no baixin **és el resultat correcte**: a `salmos_textos/144` hi
queda un desacord de veritat, i ara amb un sol nom al davant, **sant Bernabé apòstol** (11 de
juny), el cas memòria-contra-fèria ja conegut. El guany no és de cobertura sinó de senyal: la
línia de culpa del 2n salm de Vespres del 2026-09-02 passa d'una llista de 18 celebracions a
una de sola.

## 15. Tèrcia, Sexta i Nona: la mateixa hora tres vegades, amb tres trampes

Primera ampliació més enllà del pilot (fase 1 de [FASES.md](FASES.md)). `all_tercia.json`,
`all_sexta.json` i `all_nona.json` tenen **15 camps, tots subconjunt dels 20 de Laudes**, i
**no estrenen cap taula**: van a `himnos`, `salmos_*`, `lectura_breve_*`, `responsorios` i
`oraciones_finales`, les mateixes que ja gestionàvem. Per això el join, la sonda, l'inspector
i el comparador s'han pogut estendre sense inventar-hi res.

Resultat: dels **2.622 ids** que demanen, el català passa del **2,1% al 81,9%**. Cap text ja
publicat no canvia; l'exportació és purament additiva (2.150 claus noves, 0 actualitzades).

### 15.1 Les tres diferències del model de cpl-app

Viuen totes a `lib/cpl-day-resolver.js` i el join les crida des d'allà, **no en té còpia**:
el flattener del comparador i `observeHour` han de respondre igual o tornem al problema del
§14 amb una altra cara.

1. **On són.** `SpecificHour` penja de `hoursLiturgy.Hours.{ThirdHour,SixthHour,NinthHour}`,
   no de l'arrel → `hourDataOf()`.
2. **El responsori és un parell**, no sis línies: `CommonParts.Responsory` té `Versicle` i
   `Response`, i l'índex hi guarda exactament **2 ids** (`℣.` i `℟.`) — verificat contra
   `es/responsorios` 10415/10416 d'`advent_1_friday__ANY`. → `responsoryParts()`.
3. **Una sola antífona per a tota l'hora.** En una celebració, cpl-app posa
   `HasMultipleAntiphons: false` i omple `UniqueAntiphon`, **i deixa les antífones per salm
   plenes a sota** amb les del saltiri. Aquelles no es veuen a la pantalla. L'índex ho modela
   igual: 173 de les 495 entrades d'`all_tercia.json` duen `primer_salmo_antifona` i **-1** a
   les altres dues. Llegir `FirstPsalm.Antiphon` sense mirar la bandera hauria escrit a
   `commons/ca` text que l'app no mostra mai. → `psalmAntiphons()`.

El control ferial és `ObtainHours(masters, dia, new Hours(), settings)` — el mateix camí que
ja s'usa per a Laudes, o sigui que estacions i setmanes del saltiri es comporten com a la
pantalla.

### 15.2 Aquí NO hi ha pestanya de memòria/fèria

La trampa que hauria fet més mal si s'hagués copiat de Laudes. `terciaStore.ts` (i els seus
dos bessons) **substitueix el registre sencer** per la fèria quan el cicle és `MEMORY_FERIAL`
—«Override with ferial if MEMORY_FERIAL»— en lloc de dur dos oficis darrere d'un selector, i
**no escriu cap camp `<camp>_Ferial`**. O sigui:

- la casella mesurada ja és la bona i **no s'ha de redirigir** (`memorial-ferial.js` fora);
- no hi ha segona pestanya per a omplir amb el Comú (`lib/common-office.js` només modela
  Laudes i Vespres, i cridar-lo aquí hauria estat un error silenciós).

Al `HOURS_CONFIG` això és `dualOffice: false`. També hi ha una diferència pròpia a l'store:
per a `FEAST`/`SPECIAL` pren els salms **i les antífones** de la fèria, i es queda la lectura
breu i l'oració del propi. La sonda ho recull sense que calgui escriure-ho enlloc.

### 15.3 Control abans de tocar res

Re-córrer **només Laudes+Vespres** amb el mapa nou de cinc hores: **0 textos canviats, 0
caselles perdudes**. Sense això no es pot saber si el que puja a la cobertura ve de les hores
noves o d'haver mogut alguna cosa que ja anava bé.

Les **33** caselles que deixen d'escriure's passen totes a conflicte registrat: són caselles
que les cinc hores **comparteixen** i sobre les quals discrepen (p.ex.
`lectura_breve_textos/79`, 83 dies, la minoria d'un sol dia de Tèrcia). Desacords de veritat.

### 15.4 El que la sonda ha destapat de passada

El patró del §8c —l'app no llegeix sempre la casella que diu l'índex— **també hi és a les
hores intermèdies**. El 18 de desembre, `all_tercia.json` dona `-1` als tres salms i l'app
llegeix `salmos_citas/3381-3383` (Salm 21 en tres parts). Un migrador que hagués confiat en
l'índex hauria arxivat el text del 18-XII sota una casella buida, tres vegades per dia.

## 16. Completes: l'hora que no passa per l'índex

Fase 2 de [FASES.md](FASES.md). Les Completes **no viuen a `day_specific_texts`**:
`complineStore.ts` fa `import('@/store/db/compline/{idioma}/{dia}.json')` — **set fitxers per
idioma**, un per dia de la setmana (diumenge = 1 … dissabte = 7). No hi ha espai d'ids
compartits, i per tant **no hi ha caselles disputades, ni cua de revisió, ni sonda**: és
l'única hora que es resol amb una extracció directa i una còpia de fitxers.

Per això no entra al recompte de cobertura del panell, que va per ids de `day_specific_texts`.

### 16.1 Els dos models coincideixen, saltiri inclòs

Verificat amb els *Services* reals sobre una setmana ordinària sense cap solemnitat
(2026-09-06..12), que és la condició per a veure el saltiri propi de cada dia:

| fitxer | dia | saltiri (cpl-app) | `es` |
|---|---|---|---|
| 1 | dg (després de les II Vespres) | Sl 90 | Sl 90 ✓ |
| 2 | dl | Sl 85 | Sl 85 ✓ |
| 3 | dt | Sl 142, 1-11 | Sl 142, 1-11 ✓ |
| 4 | dc | Sl 30, 2-6 **+ Sl 129** | dos salms ✓ |
| 5 | dj | Sl 15 | Sl 15 ✓ |
| 6 | dv | Sl 87 | Sl 87 ✓ |
| 7 | ds (= dg després de les I Vespres) | Sl 4 **+ Sl 133** | dos salms ✓ |

I coincideixen **també en la regla de la vigília**: el divendres 14 d'agost de 2026 cpl-app ja
dona el saltiri de diumenge-I-Vespres perquè l'endemà és l'Assumpció; saints-app fa el mateix a
`dayWhenSpecialDays`. Cap dels dos ho ha d'aprendre de l'altre.

El responsori segueix **el mateix patró de sis línies** que Laudes i Vespres, o sigui que
`responsoryParts()` de `lib/cpl-day-resolver.js` el produeix sense tocar-hi res. Comprovat
contra `es`: `℣. {First} * {Second}` / `℟. {First} {Second}` / `℣. {Third}` / `℟. {Second}` /
`℣. Glòria al Pare…` / `℟. {First} {Second}`.

### 16.2 D'on surt cada camp

| camp | font |
|---|---|
| `himno` | cpl-app — **però veure 16.3** |
| `primer/segundo_salmo_{cita,antifona,texto}` | `NightPrayer.{First,Second}Psalm`. El segon només si `HasMultiplePsalms`; si `UseOnlyFirstPsalmAntiphon`, la segona antífona va buida, com a la pantalla |
| `lectura_biblica_cita` / `lectura_biblica` | `ShortReading` |
| `responsorio` | `responsoryParts(NightPrayer)` en temps ordinari |
| `responsorio_pascua` | el mateix, resolt en una fèria de Pasqua (2026-04-20) |
| `antifona_inalbis` | `ShortResponsory.SpecialAntiphon` de l'octava de Pasqua (2026-04-08) |
| `antifona_triduo` | `ShortResponsory.SpecialAntiphon` del Dissabte Sant (2026-04-04), que és la forma llarga, com a `es` |
| `cantico_evangelico_antifona` | `EvangelicalAntiphon` |
| `final` | `"Preguem:\n"` + `FinalPrayer` (a `es`, «Oremos:» és la primera línia del mateix camp, no un camp propi) |
| `himno_latino`, `idd`, `slug` | **còpia d'`es`** — el llatí no depèn de l'idioma de l'app |
| `oracion` (la capçalera del fitxer) | traduït a mà: `static-translations/compline_oracion.ca.json` |

Els tres camps de temporada són **iguals als set fitxers** (comprovat: a `es` tenen un sol
valor distint cadascun), així que una data representativa per a cada un és suficient.

### 16.3 L'única discrepància, i és de model: l'himne

cpl-app té **dos** himnes de Completes —`Various.NightPrayerCatalan{First,Second}OptionAnthem`,
triats per **temporada** a `NightPrayerService.GetAnthem()`— i saints-app en vol **set**, un per
**dia de la setmana**. `salteriComuCompletes` no té cap columna d'himne: els set dies comparteixen
el de la temporada. Verificat resolent la setmana sencera: els set dies donen «Oh Crist, el dia i
l'esplendor», mentre que `es` en té set de diferents.

No és un bug de cpl-app —és la tria editorial de l'edició catalana— i no s'obre cap `CPL-LIT`.
De moment s'escriu l'himne del Temps Ordinari als set fitxers, perquè és el que cpl-app resa i
perquè deixar el camp buit era pitjor (la lliçó del §10). La conseqüència visible és que en
català es veurà el mateix himne cada nit. Decisió oberta a
[decisions/D-004](decisions/D-004-l-himne-de-completes.md); la sortida recomanada és transcriure
els set himnes del volum imprès a `static-translations/compline_himno.ca.json`, que
`compline.extract.test.js` ja llegiria amb el mateix patró que fa servir per a `oracion`.

### 16.4 Com es re-corre

```bash
npx jest migration-to-saints/compline.extract.test.js     # escriu output/compline-ca/{1..7}.json
node migration-to-saints/export-to-saints-app.js          # ...i les copia a saints-app
```

`export-to-saints-app.js` les copia **senceres** en lloc de fusionar-les, com fa amb
`commons/ca`: aquí no hi ha espai d'ids compartits i per tant no hi ha res al destí que pugui
ser feina d'algú altre.

---

## 17. L'Ofici de lectura: la meitat de l'hora no s'ha de migrar

Fase 3 de [FASES.md](FASES.md). És l'hora més gran de totes —sola, demana **14.534** ids
contra els 8.925 de Laudes+Vespres— i la primera conclusió de la fase va ser que **la meitat
no s'ha de tocar**.

### 17.1 `_a`, `_i`, `_p`: el cicle bienal que el català no té

Cada camp de lectura d'`all_oficio.json` hi és tres vegades: `lectura_biblica_texto_a`,
`…_i`, `…_p`. Què són no es podia deduir del nom, i importava molt, perquè són 7.691 dels
14.534 ids. Comprovat per dues bandes, no suposat:

- **Pel codi.** `useOfficeFirstLecture.ts` tria `_a` quan el selector val `READING_ORDINARY`
  (que és el valor per defecte) i `_i` o `_p` segons `dateStore.isEvenYear`. O sigui: `_a` és
  el **cicle anual** i `_i`/`_p` el **bienal opcional**, any senar i any parell.
- **Per les dades.** cpl-app dona **la mateixa lectura** a les cinc ocurrències
  d'`ordinary_time_19_wednesday` de la finestra (2017, 2020, 2023, 2025, 2026 — anys parells i
  senars barrejats): «4, 1-7», que és exactament el que diu `_a` («Miq 4, 1-7»), mentre que
  `_i` diu «2 Re 6, 24-25.32-» i `_p` «Za 10, 3-11, 3». cpl-app té **un sol cicle**.

I el bienal **no fa cap falta**: `src/services/LanguageFeatures.ts` diu
`biennialReadings: ["es", "it"]`. El català no hi és, el selector no apareix mai, i l'app
llegeix sempre `_a`. Els 7.691 ids de `_i`/`_p` no els obre ningú.

**L'abast baixa de 14.534 a 6.843 ids** — l'ordre de magnitud de Laudes+Vespres, no el doble.

> **Dependència a recordar.** Si algun dia s'afegeix `ca` a `biennialReadings`, aquelles
> caselles sortiran **buides**. La condició està escrita a `OFFICE_FIELDS` de `day-check.js` i
> a `FIELD_TABLE` del join: cap dels dos coneix els sufixos `_i`/`_p`, i no és per descuit.

### 17.2 El mapatge

Tres taules que no fa servir cap altra hora —`oficio_citas`, `oficio_titulos`,
`oficio_textos`— i, per la resta, les mateixes de sempre.

| camp de l'índex | cpl-app |
|---|---|
| `himno` | `Office.Anthem` (però veure 17.4) |
| `primer/segundo/tercer_salmo_{cita,antifona,texto}` | `Office.{First,Second,Third}Psalm.{Title,Antiphon,Psalm}` |
| `responsorio1` | `Office.Responsory` — parella versicle/resposta |
| `lectura_biblica_{cita,titulo,texto}_a` | `Office.FirstReading.{Reference+Quote, Title, Reading}` |
| `responsorio2_a` | `Office.FirstReading.Responsory` |
| `lectura_patristica_{cita,titulo,texto}_a` | `Office.SecondReading.{Reference+Quote, Title, Reading}` |
| `responsorio3_a` | `Office.SecondReading.Responsory` |
| `oracion_final` | `Office.FinalPrayer` |
| `himno_latino`, `*_i`, `*_p` | **cap** |

`Office.FourthPsalm` surt buit els dies normals i els tres pericopis de l'índex encaixen amb
els tres de cpl-app. El Te Deum (`TeDeumInformation.Anthem`) **no és un camp per dia**: viu
fora d'`all_oficio.json`, i `officeStore` només n'exposa el booleà `showTeDeum`.

### 17.3 Les dues formes que no es podien simplificar

Totes dues tenen detector propi a `office-fields.test.js`, perquè totes dues fallen **en
silenci**: la pàgina segueix pintant, només que amb una línia menys.

**La cita du dues línies dins d'una casella, separades per un `$` literal.**
`OfficeFirstLecture.vue` i `OfficeSecondLecture.vue` pinten `split("$")[0]` com a paràgraf
propi i `split("$")[1]` en estil `reference-bible` al costat del títol. `es` hi posa «Del libro
del profeta Miqueas `$`Miq 4, 1-7 `$`». cpl-app ja té les dues meitats separades —`Reference` i
`Quote`— o sigui que el separador s'hi insereix al mig i prou.

**On talla cpl-app no és on talla `es`**, i és igual de coherent: per a la lectura patrística
`es` posa l'autor sol abans del `$` i l'obra després («San Agustín de Hipona `$`De los
comentarios sobre los salmos (Salmo 47, 7: CCL 38, 543-545) `$`»), mentre que cpl-app posa
«Dels comentaris de sant Agustí, bisbe, als Salms» abans i el locus «(Salm 47, 7: CCL 38,
543-545…)» després. El tall de cpl-app és el que imprimeixen els volums catalans, i és el que
es migra.

**El responsori de cada lectura són TRES ids**, no dos ni sis:

```
[0]  " "                                  ← un blanc; 912 de les 920 entrades d'es el tenen,
                                            i cap component no el pinta
[1]  ℟. {FirstPart} * {SecondPart}
[2]  ℣. {ThirdPart} * {SecondPart}
```

Comprovat camp per camp contra el 12 d'agost de 2026, on `es/responsorios` 12507-12509 diuen
exactament això. Els signes són els que els components imposen de totes maneres
(`OfficeFirstLecture.vue` reescriu el d'`[1]` a ℟ i el d'`[2]` a ℣), o sigui que s'escriuen ja
com es veuran. **No és la mateixa forma** que el responsori breu de Laudes i Vespres (sis
línies) ni que el de les hores intermèdies (dues): té helper propi,
`readingResponsoryParts()`, al costat de `responsoryParts()` i amb un comentari que diu per què
són dos.

### 17.4 L'himne canvia segons l'hora del rellotge

`OfficeService.IsDarkAnthem()` fa `new Date().getHours() < 6` —**l'únic `new Date()` de tot
`src/Services`**— i abans de les sis del matí dona un himne diferent. La taula
`salteriComuOfici` té 28 files i **les 28 tenen els dos himnes diferents**.

L'índex compartit té **un sol camp `himno`**. Perquè quin dels dos es migra no depengui de
l'hora en què algú corri el join, el join **fixa el rellotge a les dotze del migdia** abans de
resoldre cap data (`beforeAll` de `join-content.test.js`, amb `doNotFake` a tots els temporitzadors:
falsejar-los penjaria la corrimenta). Sense això, un join llançat de matinada hauria migrat
catorze himnes nocturns sense que res ho digués.

Decisió oberta: [decisions/D-005](decisions/D-005-l-himne-nocturn-de-l-ofici.md).

### 17.5 El dia de memòria: `officeStore` no té dues pestanyes, en té una de reescrita

A `all_oficio.json` una entrada `__MEMORY` porta `-1` a la salmòdia, a la lectura bíblica i als
responsoris 1 i 2, i només du de propi l'himne, la lectura patrística, el responsori 3 i
l'oració final. Qui omple els `-1` és el mateix `officeStore`: quan `cycle === "MEMORY"`
(el sufix de la clau, que `findInStructureById` enganxa al registre) **substitueix** aquells
camps pels de l'entrada del dia de la setmana.

És el mateix patró de `terciaStore` i no el de `laudesStore`: no hi ha bessons `<camp>_Ferial`
ni cap selector a la pantalla. Per això l'Ofici va amb **`dualOffice: false`** al `HOURS_CONFIG`
del join — la casella mesurada ja és la bona i no s'ha de redirigir enlloc, i tampoc no hi ha
segona pestanya per al Comú dels sants.

Res d'això es dedueix: la sonda ho mesura. El 13 de juny de 2026 (memòria de la Mare de Déu
dissabtina) l'índex diu `-1` a onze camps i la sonda troba que l'app hi llegeix
`salmos_citas/10`, `oficio_citas/100`… — les caselles de la fèria, tal com el `store` les ha
reescrites. És exactament el cas pel qual existeix la sonda (§8d).

### 17.6 Com es re-corre

```bash
cd /Users/pau/projects/saints/saints-app && npm run serve          # cal per a la sonda
node migration-to-saints/app-id-probe.js --range 2017-01-01..2026-12-30 --fresh
npx jest migration-to-saints/join-content.test.js --silent          # Office hi va per defecte
node migration-to-saints/export-to-saints-app.js
```

L'exportació no necessita res de nou: `export-to-saints-app.js` copia **tots** els fitxers
d'`output/commons-ca`, o sigui que `oficio_citas.json`, `oficio_titulos.json` i
`oficio_textos.json` hi entren sols.

---

## 18. La missa: la descoberta

Fase 4 de [FASES.md](FASES.md). Aquesta secció és **només la descoberta**: què hi ha a cada
banda, com encaixen i les tres coses que no encaixen. La implementació encara no s'ha fet.

L'abast, comptat: **4.502 ids** — 2.383 de `lecturas_referencia` i 2.233 de `lecturas_texto`,
menys els 1.082 dels comentaris, que **queden fora d'abast en català** per decisió d'en Pau.

| grup de rols | ids |
|---|---|
| Nucli (`FIRSTLECTURE`, `PSALM`, `SECONDLECTURE`, `ACCLAMATION`, `GOSPEL`) | 4.097 |
| `CELEBRATION_*` — la missa pròpia de la celebració | 369 |
| Vigília Pasqual (`SECOND…SEVENTHPSALM`, `THIRD…EIGHTHLECTURE`) | 36 |
| `ALTERNATIVE_*` i `SHORT_*` — cpl-app no els modela | 114 (probablement no migrables) |
| `COMMENT` / `comentarios` | 1.082 — **fora d'abast** |

### 18.1 Dues caselles per lectura, i totes dues duen més d'una cosa

`lecturesStore` no torna un objecte per camp com les altres hores: torna un **array de
`Lecture`**, un per rol, amb `title` (= `lecturas_referencia`) i `body` (= `lecturas_texto`).
La sonda haurà de convertir-lo a un mapa `{ROL}_ref` / `{ROL}_texto` abans de res.

I la casella de referència **no és només la cita**. `formatTitleLectures()` la parteix pel `_`
(o, si no n'hi ha, pels `:`) i pinta `[0]` com a cita i `[1]` com a subtítol:

```
"Ez 9, 17; 10, 18-22: _La marca en la frente de los que se lamentan…_"
 └─ cita ──────────────┘ └─ subtítol, entre guions baixos ──────────┘
```

cpl-app ja té les dues meitats separades: `MassReading.Quote` i `MassReading.Comment`. O sigui
que **la referència es compon igual que la cita de l'Ofici** (§17.3): `{Quote}: _{Comment}_`.
El `Title` de cpl-app («Lectura de la profecia d'Ezequiel») **no hi va**: l'índex no li té
casella, i saints-app el genera ell mateix del literal del rol.

### 18.2 El salm: tres desajustos petits d'un sol camp

**(a) `isPsalm()` no sap català.** `src/utils/formatters/formatTextLecture.ts`:

```ts
export const isPsalm = (title: string): boolean =>
  ["Sal", "Lectura Sálmica", "Lettura Salmica"].some((k) => title.startsWith(k))
```

Castellà i italià, i prou. Amb una referència catalana («Sl 112,…») el salm cau per la branca
que **no** és la seva: en lloc de pintar la cita i, sota, `℟. {resposta}`, pinta
`cita • subtítol`. És un forat de llengua exactament de la mateixa forma que el
`biennialReadings` de la fase 3, i **es tanca amb una línia**: afegir `"Sl"` a la llista. Va
com a proposta a eprex.

**(b) cpl-app no posa el nom del llibre.** `MassPsalm.Quote` és «112,1-2.3-4.5-6 (R.: 4b)»,
sense cap «Sl» al davant — perquè la pantalla de cpl-app ja escriu «Salm responsorial» abans
(`MassLiturgyPrayerScreen.js:120`). Cal prefixar-hi `Sl ` en migrar.

**(c) La resposta viu en llocs diferents.** A `es`, la resposta del salm és el subtítol de la
referència i **el cos del salm no la duu**: de 918 salms, **un de sol** té línies `R.`. A
cpl-app és al revés — la resposta va **dins** del cos, repetida després de cada estrofa, que
és com la imprimeix el volum català i com la pinta cpl-app.

`formatTextLecture()` ja converteix `R.` en `℟` al cos, o sigui que **copiar el cos de cpl-app
tal com és, es pinta bé**. La decisió recomanada és aquesta: referència = `Sl {Quote}` i prou,
cos sencer de cpl-app. **Zero cirurgia sobre el text litúrgic**; l'única diferència amb `es`
és que la resposta no surt també a la capçalera, perquè ja surt on toca.

### 18.3 L'aclamació: la tornada no és cap dada de cpl-app

`ACCLAMATION.ref` **no és la cita bíblica**: és la tornada. Dels 747 dies, 685 diuen
«_Aleluya, aleluya, aleluya._», i la resta són les vuit variants de temporada («Gloria y
alabanza a ti, Cristo», «Alabanza y honor a ti, Señor Jesús»…). Només **9 valors distints**.

cpl-app no en té cap dada: l'«Al·leluia. » és una constant dins de la seva pantalla
(`MassLiturgyPrayerScreen.js:232`), i el que té a `Hallelujah.Quote` és la cita bíblica
(«2C 5,19»), que és una altra cosa.

O sigui que `ACCLAMATION.texto` surt de `Hallelujah.Hallelujah` sense problema, però la
tornada s'ha de **traduir a mà** contra el Missal — nou línies, la mateixa forma que
`static-translations/compline_oracion.ca.json` de la fase 2.

### 18.4 La Vigília Pasqual: cada app la penja d'un dia diferent

cpl-app la resol **al Dissabte Sant** —`ObtainMassLiturgy` desvia a `GetEasterEve()` quan
l'endemà és Pasqua— i les set lectures, els set salms i l'epístola hi són **escrites a dins
del codi**, en català, a `MassLiturgyService.tsx:128` i següents.

saints-app la penja de **`easter_sunday__YEAR_x`**, no de `holy_saturday__ANY` (que només duu
`GOSPEL`). I la mateixa entrada duu **les dues misses alhora**:

| | rols | contingut |
|---|---|---|
| Vigília | `FIRSTLECTURE`…`EIGHTHLECTURE`, `PSALM`…`SEVENTHPSALM`, `GOSPEL` | Gn 1, Gn 22, Ex 14, Is 54, Is 55, Ba 3, Ez 36, Rm 6 |
| Missa del dia | `CELEBRATION_*` | Fets 10, Sl 117, Col 3, Jo 20 |

O sigui que el join, per a omplir les caselles de Pasqua, ha de resoldre **dos dies**: el
dissabte per als rols plans i el diumenge per als `CELEBRATION_*`. És el simètric de les
I Vespres (§0/MIGRA-006), i com allà, el que no es pot deduir de l'índex ho dirà la sonda.

`CELEBRATION_*` vol dir el mateix a tot arreu: **la missa pròpia de la celebració**, al costat
de la ferial. `lecturesStore` les fusiona (`mergeMemoryAndFerialLectures`) i la pàgina ensenya
les dues.

### 18.5 La missa vespertina anticipada no té casella

cpl-app calcula una segona missa per als dissabtes i les vigílies de festa
(`MassLiturgy.Vespers`, decidida a `DecideIfHasVespers()`). `all_lectures.json` **té una sola
entrada per dia** i cap camp anàleg als `*_PrimerasVisperas` de les Vespres. Sense casella, no
es migra: filar-hi el text de l'endemà seria repetir la F6.

### 18.6 El que no cal tocar

`all_lectures.json` és **l'únic índex de saints-app que ja fa servir cicles de debò**
(`YEAR_A`/`B`/`C`, `ODD`/`EVEN`), i `lecturesStore` els tria amb `findInStructure(id,
["ANY", "MEMORY", parell ? "EVEN" : "ODD", cicle dominical])`. El problema del grup A del
§6c —no saber si un text varia pel cicle o per una altra cosa— **aquí no existeix**.

### 18.7 La implementació: qui decideix on va cada lectura és la cita

El problema real de la missa no és la forma dels camps: és que **cpl-app ofereix fins a tres
misses per a una data i saints-app hi té fins a dues columnes**, i cap dels dos índexs diu
quina va on.

Les tres candidates que el join té a mà per a cada dia:

| | què és |
|---|---|
| `rendered` | el que cpl-app resa aquell dia: la missa de la celebració si n'hi ha, la ferial si no |
| `ferial` | la del dia de la setmana, demanada a part (`GetNormalDaysMassLiturgy`, per temps, dia, setmana i cicle) |
| `eve` | la que cpl-app va resoldre **ahir**. Només encaixa el diumenge de Pasqua, que du la Vigília als rols plans (18.4) |

I les dues columnes: els rols plans i els `CELEBRATION_*`.

**La regla és llegir-ho de la cita que ja hi ha a la casella.** Una lectura de la missa sempre
en du una, `es` ja la té escrita, i `fingerprint()` (lib/citation-key.js) compara com
l'escriuen les dues llengües. Per a cada casella, doncs: agafa la cita castellana, compara-la
amb la de les tres candidates i escriu la que coincideix. **Si no en coincideix cap, no
s'escriu res.**

Per què no una regla del tipus «el que és propi va a `CELEBRATION_*`»: **els sants Pere i Pau**.
La seva entrada du la **missa de la vigília** als rols plans (Fets 3) i la **del dia** als
`CELEBRATION_*` (Fets 12). Una regla basada en «propi o ferial» hauria posat la missa del dia
a les caselles de la vigília **cada any**, i el control d'unanimitat no ho hauria vist mai,
perquè hauria estat malament de manera consistent. La cita ho resol sol: `ACTS|12 ≠ ACTS|3`.

Dues coses van caldre a `lib/citation-key.js` perquè això funcionés, totes dues amb prova al
detector: `Sl` i `Sal` a la llista d'àlies dels salms, i treure l'etiqueta «Lectura Sálmica»
—que va en una línia pròpia sobre la cita— abans de mirar res, perquè si no `splitHeading` la
pren per la referència i torna una cita sense llibre ni capítol.

### 18.8 Els tres forats que queden, i per què

| | cobertura | per què |
|---|---|---|
| Nucli (1a, salm, 2a, evangeli) | **74-92%** | la resta són conflictes registrats: cpl-app té la mateixa lectura escrita dues vegades amb diferències petites («Mc 1,21b-28» / «Mc 1,21-28», «t'hauràs guanyat el germà» / «el teu germà») |
| Tornada de l'aclamació | **0%** | no és cap dada de cpl-app. 14 ids per a tot l'any, [D-006](decisions/D-006-la-tornada-de-l-aclamacio.md) |
| `CELEBRATION_*` | **22-40%** | els dies de memòria cpl-app resa la missa **ferial**, com mana el Missal, i no té res per a la columna del sant. És la [D-001](decisions/D-001-el-comu-a-les-memories.md) altre cop, ara a la missa |
| Vigília Pasqual | **~0%** | **[EPREX-004](eprex-bugs/EPREX-004.md)**: l'app no llegeix cap casella el diumenge de Pasqua, o sigui que no n'hi ha cap on escriure. Es desbloqueja sol quan es corregeixi |

Els números, mesurats a `saints-app` el 8 de setembre de 2026:

| | abans | després |
|---|---|---|
| Missa | 0 / 4.386 | **3.483 / 4.386 (79,4%)** |
| L'índex compartit sencer | 16.128 / 22.132 (72,9%) | **19.611 / 22.132 (88,6%)** |
| Univers de `commons/es` | 28,4% | **34,3%** |

La missa **no comparteix cap taula amb les hores** (`lecturas_referencia` i `lecturas_texto`
són seves i de ningú més), o sigui que l'exportació va ser **purament additiva**: 3.483
caselles noves, 0 perdudes, 0 amb el text canviat.
