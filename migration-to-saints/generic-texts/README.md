# `generic_texts/ca/*` per a saints-app

Cobreix el pas 5 del [PLAN.md](../PLAN.md): els literals catalans que **no surten de
`cpl-app.db`** i que calia produir a banda.

## Per què existia el problema

`saints-app` declara `ca` com a idioma suportat (`src/constants/languages.ts`) però no
tenia `src/store/db/generic_texts/ca/`. Com que `loadJson` **no té cap fallback
d'idioma**, això provocava dues coses:

1. `preloadGenericTables()` llançava i, com que `initApp()` es crida sense `.catch()`
   (`src/main.ts`), s'avortava tota la resta de la inicialització: `dateStore`, el watch
   d'idioma, el first-run, notificacions, `userProfileService`, inbox.
2. `calendarCatalogService` filtra els calendaris de litcal pels que tenen clau
   `calendar_*` en algun `literals.json`. Amb només `es`/`it` hi havia 7 claus de
   calendari, i els 14 calendaris catalans quedaven ocults (`7/21`).

## Estat actual: 100% traduït

- `literals.json` — **1.531/1.531 fulles** en català (0 pendents, 30-9-2026).
- `prayers.json` — **76/76 cossos** en català (0 pendents).
- `invitatoryPsalms.json` i `permitedShortWords.json` — complets.
- Tots els calendaris de litcal que es poden triar en català (Espanya, Catalunya, les 12
  diòcesis, Andorra i les 22 ciutats i catedrals) tenen la seva clau `calendar_*`.

Verificat: paritat exacta de claus amb `es/`, JSON vàlid, cap pregària amb cos
idèntic al castellà per descuit.

## Com es regenera

```bash
cd cpl-app
python3 migration-to-saints/generic-texts/build_invitatory.py   # salms invitatoris
python3 migration-to-saints/generic-texts/build_literals.py     # literals + calendaris
python3 migration-to-saints/generic-texts/build_prayers.py      # devocionari
```

Escriuen directament a `saints-app/src/store/db/generic_texts/ca/`. Per escriure en una altra
còpia (un worktree), `build_literals.py` accepta `SAINTS_APP=<directori de saints-app>`.

A saints-app, `tests/unit/catalanLiterals.spec.ts` falla quan el castellà té una clau que el català
no té: llavors toca afegir-ne la traducció a un lot i tornar a córrer l'script.

`build_literals.py` mergeix tots els `ca-literals-ui*.json` del directori (cada un és
un lot de traducció amb claus en ruta de punts, p. ex. `lent.itinerary.day_20_feb`).
`build_prayers.py` fa el mateix amb `ca-prayers-bodies*.json` (id numèric → HTML).
Per corregir una traducció, edita el lot corresponent i torna a executar l'script.

## Origen de cada text

| Fitxer | Origen |
|---|---|
| `invitatoryPsalms.json` | 100% text oficial català de `cpl-app.db`, taula `diversos` (ids 1/35/36/37) |
| `permitedShortWords.json` | llista pròpia del català (escrita a mà, no és una traducció) |
| `literals.json` | traducció; els noms de diòcesi segueixen `DioceseName` de cpl-app |
| `prayers.json` | 10 cossos oficials de `diversos`, 4 canònics (Glòria, Credos, Ave Maria), 62 traduïts |

**Regla de fons**: cap clau no pot faltar mai. Si en el futur s'afegeix contingut nou a
`es/` sense equivalent `ca/`, es queda temporalment amb el valor castellà en lloc de
petar, i `build_literals.py`/`build_prayers.py` ho reporten a `pending-literals.json` /
`pending-prayers.json`.

## ⚠️ Revisió recomanada abans de publicar

Aquesta traducció l'ha feta un agent d'IA en una sola sessió, no un traductor litúrgic
professional ni un parlant nadiu revisant-la. La UI i el contingut devocional curt
(pregàries breus, textos d'ajuda, preguntes freqüents) tenen un risc baix. Però una part
important és **text litúrgic llarg i formal** —Ofici de difunts, Via Crucis/Via Lucis,
itineraris de Quaresma i Pasqua, i sobretot pregàries clàssiques com el *Pange Lingua*,
l'*Adoro te devote*, el *Stabat Mater* o les *Quinze Oracions de Santa Brígida*— que
en molts casos **ja tenen una traducció catalana oficial o consagrada per l'ús** (breviari
català, himnari litúrgic). La d'aquest lot és una traducció pròpia feta amb cura, no la
versió oficial, i pot no coincidir-hi paraula per paraula. Abans de publicar-ho a
producció, val la pena que algú amb criteri litúrgic en català ho revisi, especialment:

- Els himnes clàssics de `prayers.json` (301, 305, 402, 404, 510, i les XV Oracions 795).
- Els textos de l'Ofici de difunts (`od_*`) i la lectura bíblica de l'homilia antiga del
  Dissabte Sant (`lent.itinerary.holyWeek_saturday_text`) — són traduccions pròpies de
  passatges bíblics i patrístics, no la Bíblia Catalana Interconfessional ni el Breviari
  oficial.

## Fora d'abast

`bible/ca/`, `catecismo/ca/`, `novena/ca/` i `dailySaints/ca/` no existeixen. Des del 30-9-2026
aquestes funcions estan apagades en català (`LanguageFeatures.ts`, registre SA-25). El devocionari
sí que es veu des de l'1-10 (SA-29): té `prayers.json`, encara sense revisar.
