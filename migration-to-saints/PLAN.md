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

## 7. Pendent (per ordre recomanat)

1. **Investigar la divergència Nadal/Pasqua/Setmana Santa** (secció 6b) — revisar quines
   branques de `LaudesService.tsx` (i les seves germanes Vespres/Ofici/Hores) trien un
   salteri diferent del que ES assumeix per a solemnitats/octaves, i decidir per cada
   cas si cpl-app té raó (i llavors caldria corregir/documentar que ES ho tenia diferent)
   o si cal preferir sempre el patró d'ES quan hi hagi conflicte per a aquestes
   categories concretes de contingut "comú reutilitzat".
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
npx jest migration-to-saints/laudes.extract.test.js        # extracció de mostra (Laudes)
node migration-to-saints/generate-catalan-calendars.js --dry-run   # calendaris (revisió)
node migration-to-saints/generate-catalan-calendars.js             # calendaris (escriu a litcal)
```

Tot idempotent: es pot córrer tantes vegades com calgui contra un `cpl-app.db` diferent;
cap dels dos scripts assumeix cap estat previ ni identificadors de fila estables.
