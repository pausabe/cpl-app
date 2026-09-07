# D-004 — L'himne de Completes: cpl-app en té dos, saints-app en vol set

**Estat:** obert. **Decideix:** en Pau (i, si cal, el CPL). **Bloqueja:** només aquest camp.
**Trobat:** 7 de setembre de 2026, fent la fase 2 de [FASES.md](../FASES.md).

## El fet

Els dos models no comparteixen eix, i cap dels dos és un error:

| | eix | quants |
|---|---|---|
| **cpl-app** | **temporada** | **2** — `Various.NightPrayerCatalanFirstOptionAnthem` i `…SecondOptionAnthem`, triats a `NightPrayerService.GetAnthem()` (Quaresma 1/3/5, Advent i Octava de Nadal → el primer; la resta → el segon) |
| **saints-app** | **dia de la setmana** | **7** — un `himno` a cada `compline/{lang}/{1..7}.json`, sense cap dimensió de temporada |

`salteriComuCompletes` **no té cap columna d'himne**: els set dies comparteixen l'himne de la
temporada. Verificat resolent una setmana ordinària sencera (2026-09-06..12) amb els Services
reals: els set dies donen «Oh Crist, el dia i l'esplendor». El castellà, en canvi, en té set de
diferents («Gracias, porque al fin del día», «De la vida en la arena»…).

**No és un bug de cpl-app** i no s'obre cap `CPL-LIT`: és una tria editorial de l'edició
catalana, que resa un himne per temps litúrgic.

## Què s'ha fet mentrestant

S'escriu l'himne de cpl-app (el del Temps Ordinari) **als set fitxers**. Motius:

- És el que cpl-app resa de veritat, o sigui que no és fals.
- Deixar el camp buit era pitjor: la lliçó de [PLAN §10](../PLAN.md) és que una taula que
  falta pot buidar la pàgina sencera, i aquí no hi ha cap altre lloc d'on caigui.

**Conseqüència visible**: en català, Completes mostrarà **el mateix himne cada nit de l'any**,
mentre que en castellà i italià en mostra un de diferent cada dia. És l'únic camp dels 15 on
passa; tota la resta (salms, antífones, lectura breu, responsori, antífones de temporada,
oració final) surt bé i és pròpia de cada dia.

## Les opcions

| | Què implica |
|---|---|
| **a) Deixar-ho com està** | Un himne tot l'any. Zero feina. La diferència amb es/it es veu a simple vista |
| **b) Els set himnes del volum imprès** | La `Litúrgia de les Hores` catalana sí que en duu un per dia. No són a `cpl-app.db`: caldria transcriure'ls a mà a `static-translations/`. És l'opció que dona el mateix que es/it |
| **c) Portar l'eix de temporada a saints-app** | Modelar la temporada als fitxers de Completes. És un canvi d'estructura a eprex i afecta les tres llengües; no el podem decidir nosaltres |

**Recomanació: (b).** És l'única que dona a l'usuari català el que ja tenen el castellà i
l'italià, la font és de fitar (el volum imprès mana sobre la redacció catalana), i és feina
acotada: set himnes, un sol cop, i no els torna a moure ningú.

## Com es desfà

Els set himnes anirien a `migration-to-saints/static-translations/compline_himno.ca.json`
amb la mateixa clau `1..7`, i `compline.extract.test.js` els llegiria en lloc de
`np.Anthem` — el mateix patró que ja fa servir per a `oracion`.
