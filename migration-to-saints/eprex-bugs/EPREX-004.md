# EPREX-004 · El diumenge de Pasqua no mostra cap lectura de la missa

**Trobat:** 8 de setembre de 2026, fent la descoberta de la fase 4.
**Estat:** proposat, pendent d'enviar.
**Afecta:** **totes les llengües** — és un bug de castellà i italià, no del català.
**Gravetat:** la pàgina de lectures queda **buida** el dia més important de l'any.

## Què passa

El 5 d'abril de 2026 —o qualsevol diumenge de Pasqua— la pàgina de lectures de la missa no
mostra res. No dona error: `loadingState` val `"loaded"`, `errorCode` és `null` i
`contentByDay` és un **array buit**.

Comprovat amb l'app real en **castellà**, l'idioma publicat:

```
--- es 2026-04-05        { "n": 0, "state": "loaded", "err": null, "roles": [] }
--- es 2026-04-04        { "n": 1, ... }   ← Dissabte Sant, bé
--- es 2026-08-12        { "n": 5, ... }   ← una fèria qualsevol, bé
```

## Per què

`all_lectures.json` té **quatre** entrades per al diumenge de Pasqua:

| clau | lectures |
|---|---|
| `easter_sunday__ANY` | **0** |
| `easter_sunday__YEAR_A` | 24 |
| `easter_sunday__YEAR_B` | 22 |
| `easter_sunday__YEAR_C` | 22 |

I `lecturesStore.ts` demana els cicles **en aquest ordre**:

```ts
const cycleOrder = [
  "ANY",
  "MEMORY",
  isEvenYear ? "EVEN" : "ODD",
  dayCalendar?.cycles.sundayCycle,
].filter(Boolean)
```

`findInStructure()` torna **la primera clau que existeix**, i `structure[key]` és cert per a un
objecte encara que sigui buit:

```ts
if (structure[key]) {
  return { ...structure[key], cycle }
}
```

O sigui que `easter_sunday__ANY` guanya sempre, i les 22-24 lectures dels tres cicles no
s'arriben a llegir mai. `lectureSelected.lecturas` és `{}`, `lecturePromises` queda buit i la
pàgina es pinta sense res.

## Quantes entrades tenen aquesta forma

Set entrades d'`all_lectures.json` no duen cap lectura. **Només una fa mal**:

| clau | germans | tapa res? |
|---|---|---|
| `easter_sunday__ANY` | `YEAR_A`=24, `YEAR_B`=22, `YEAR_C`=22 | **Sí** — `ANY` va primer |
| `advent_2_wednesday__EVEN` | `ANY`=5 | No — `ANY` va abans que `EVEN` |
| `advent_3_monday__EVEN` | `ANY`=5 | No |
| `easter_time_2_monday__EVEN` | `ANY`=5 | No |
| `our_lady_of_fatima__ANY` | cap | No — no hi ha res a tapar |
| `our_lady_of_lourdes__ANY` | cap | No |
| `thursday_of_the_lords_supper__ANY` | cap | No |

Les tres `__EVEN` buides són dades mortes: no fan mal, però tampoc no serveixen.

## Com es podria arreglar

| | què implica |
|---|---|
| **a) Treure `easter_sunday__ANY`** de `all_lectures.json` | Un canvi de dades, mínim. Deixa el forat obert si demà torna a aparèixer una entrada buida |
| **b) Que `findInStructure` no accepti una entrada sense contingut** | Tres línies a `structureHelpers.ts`. Tanca la classe de bug sencera, no aquest cas |

Suggeriment: **(b)**, i de passada (a) per netejar les quatre entrades buides que tapen o
podrien tapar un germà.

```ts
// structureHelpers.ts
for (const cycle of cycles) {
  const entry = structure[buildStructureKey(id, cycle)]
  if (entry && Object.keys(entry.lecturas ?? entry).length) {
    return { ...entry, cycle }
  }
}
```

## Com es reprodueix

```bash
cd /Users/pau/projects/saints/saints-app && npm run serve
node <scratchpad>/verify-lectures.js es 2026-04-05
```

O, a l'app: idioma castellà, anar al 5 d'abril de 2026, pestanya de lectures de la missa.
