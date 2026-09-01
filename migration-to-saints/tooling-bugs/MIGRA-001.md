# MIGRA-001 — El "control ferial" de Vísperas del join es el propio día ya renderizado

| | |
|---|---|
| **Estado** | Corregido |
| **Componente** | Herramienta de migración (`migration-to-saints/join-content.test.js`), no cpl-app ni saints-app |
| **Gravedad** | Alta — afecta a Vísperas de todos los días con memoria opcional/obligatoria (cientos de fechas en la ventana 2017–2026) |
| **Encontrado** | 1 de septiembre de 2026, investigando por qué el 7 de diciembre de 2026 aparecía con 12 campos de Vísperas "en conflicto" en el panel de migración |
| **Corrección** | Código: `migration-to-saints/join-content.test.js` (función `resolveHoursLiturgy`) |
| **Efecto en los datos** | Se ha vuelto a ejecutar el join completo (2017–2026, diócesis de Barcelona) y se ha reexportado a saints-app |

## Resumen para quien no vaya a leer el resto

La herramienta que traduce el contenido de cpl-app al catalán de saints-app escribía,
para muchos días con "memoria opcional" (santos que no siempre desplazan la feria), el
texto de Vísperas en la casilla equivocada. El síntoma visible era el caso del 7 de
diciembre: cpl-app reza correctamente las Primeras Vísperas de la Inmaculada Concepción
(la solemnidad del día siguiente, que tiene precedencia sobre la memoria de San Ambrosio),
pero la herramienta archivaba ese texto bajo la casilla de "San Ambrosio en feria",
mientras que la casilla que saints-app realmente lee para la Inmaculada Concepción se
llenaba con el texto de otro día completamente distinto ("Alegraos siempre en el Señor",
Flp 4,4-5, en vez de "A los que había escogido, Dios los predestinó...", Rm 8,29-30).

No es un error de cpl-app (su cálculo litúrgico es correcto, verificado contra una fuente
externa). Tampoco es un error de saints-app (su base de datos en español ya tiene el texto
correcto en esa casilla). Es un error de la herramienta de migración de este repositorio.

## Síntoma

Revisando el 7 de diciembre de 2026 con la skill de revisión día a día, 12 de los 26
campos de Vísperas salían "en conflicto", con la etiqueta "causa única: Sant Ambròs,
bisbe i doctor de l'Església". Comparando con una fuente externa independiente
(oficiodivino.com, Primeras Vísperas de la Inmaculada Concepción), el texto de cpl-app
para el 7 de diciembre era el correcto:

| Campo | cpl-app (2026-12-07) | Fuente externa (I Vísperas Inmaculada) | ¿Coincide? |
|---|---|---|---|
| Lectura breve | Rm 8, 29-30 — "A los que había escogido..." | Rm 8, 29-30 — "A los que había escogido..." | Sí |
| Responsorio breve | "Te ensalzaré, Señor, porque me has librado..." | "Te ensalzaré, Señor, porque me has librado..." | Sí |
| Preces | Enfermos, tristes, pecadores, familias, difuntos, por intercesión de María | Mismo esquema | Sí |

Pero la casilla que saints-app realmente lee ese día (medida con la sonda real de la
app, `app-cell-map.json`) — `lectura_breve_citas/3403`, `responsorios/14089-14094`,
`preces_contenido/4717-4721` — contenía, tanto en el catalán ya exportado a saints-app
como en la salida recién generada por el join, un texto distinto: Flp 4,4-5 ("Alegraos
siempre en el Señor"), un responsorio distinto, y preces sin ninguna mención a María.

La propia base de datos en **español** de saints-app (`commons/es/lectura_breve_citas.json`,
id 3403) tenía el texto **correcto** ("Rm 8, 29-30"). Es decir: el maestro en español está
bien, y el catalán generado por nuestra herramienta estaba mal — la herramienta es la
única responsable.

## Causa

`join-content.test.js` decide, para cada campo de cada día, en qué casilla numérica debe
escribir el texto de cpl-app. Cuando el día tiene un interruptor "memoria/feria" en
saints-app (ciclo `__MEMORY_FERIAL*`), la herramienta necesita saber si un campo concreto
pertenece a la casilla propia de la memoria o a la casilla de la feria del día. Para
decidirlo, resuelve el mismo día dos veces con los Servicios reales de cpl-app: una vez
tal cual (`hoursLiturgy`) y otra sin ninguna celebración (`ferial`), y compara campo a
campo (`memorial-ferial.js`, función `ferialFields`). Si un campo sale igual en ambas
resoluciones, se considera "tomado de la feria"; si sale distinto, se considera "propio".

El error estaba en cómo se obtenía esa segunda resolución ("ferial") para Vísperas:

```js
// ANTES (incorrecto)
const ferial = {
  Laudes: LaudesService.ObtainLaudes(todayMasters, ldi.Today, new Laudes(), settings),
  Vespers: hoursLiturgy.VespersOptions.VespersWithoutCelebration,
};
```

`hoursLiturgy.VespersOptions.VespersWithoutCelebration` **parece** una Vísperas sin
celebración, pero no lo es: es un objeto que `MergeVespersWithCelebration`
(`src/Services/Liturgy/VespersService.tsx`) modifica **en el sitio**
(`let vespers = withoutCelebrationVespers; ...; vespers.Anthem = ...`) para construir la
Vísperas final. Como JavaScript pasa objetos por referencia, en el momento en que
`join-content.test.js` lo lee, ese objeto **ya es** la Vísperas final renderizada —
exactamente el mismo objeto que `hoursLiturgy.Vespers`, no una versión sin celebración.

Consecuencia: al comparar "Vísperas renderizadas" contra "Vísperas ferial", en realidad se
comparaba el mismo objeto consigo mismo. Los 19 campos de Vísperas salían siempre
idénticos, así que `ferialFields` marcaba **siempre los 19 campos como "tomados de la
feria"**, en todos los días con interruptor memoria/feria — el algoritmo de
`memorial-ferial.js` nunca tenía ninguna posibilidad real de decir "este campo es
propio".

Este fallo concreto ya estaba diagnosticado y corregido en otra herramienta de este mismo
repositorio, `migration-to-saints/review/resolve-cpl-days.test.js` (usada por la skill de
revisión día a día), cuyo propio comentario en el código describe exactamente este
mecanismo. La corrección nunca se había trasladado al script que genera de verdad el
contenido que se exporta a saints-app (`join-content.test.js`).

### Por qué esto explica el caso del 7 de diciembre

Con el fallo, cualquier campo de Vísperas de un día con memoria (incluido el 7 de
diciembre, día de San Ambrosio) se archivaba siempre bajo la casilla "\_Ferial" medida por
la sonda de la app, nunca bajo su casilla propia ("own"). El 7 de diciembre, la casilla
propia es la de las Primeras Vísperas de la Inmaculada (`lectura_breve_citas/3403`, etc.):
como nunca recibía el texto correcto, esa casilla quedaba disponible para que otra fecha
—de otro día del calendario, con contenido genuinamente distinto ("Flp 4,4-5")— la
llenara sin que nadie detectara el conflicto, porque estadísticamente esa otra fecha era
unánime consigo misma.

## Corrección

Reemplazar la lectura del objeto mutado por una llamada nueva e independiente a
`VespersService.ObtainVespers`, tal como ya hacía `resolve-cpl-days.test.js`:

```js
// DESPUÉS (correcto)
const ferial = {
  Laudes: LaudesService.ObtainLaudes(todayMasters, ldi.Today, new Laudes(), settings),
  Vespers: VespersService.ObtainVespers(todayMasters, ldi.Today, settings),
};
```

### Verificación

Se ha vuelto a generar el manifiesto de fechas (`litcal/scripts/build-date-to-key-manifest.ts`,
2017-01-01–2026-12-30, calendario `diocese-barcelona`) y se ha vuelto a ejecutar el join
completo (`HOURS=Laudes,Vespers,Invitation,Celebration`) dos veces: una con el código
anterior (para confirmar que el fallo era reproducible, no un dato obsoleto) y otra con la
corrección aplicada.

**Antes de la corrección**, `lectura_breve_citas/3403` se escribía sin ningún conflicto
detectado (texto único: "Flp 4,4-5"), a pesar de que cpl-app da un texto distinto varios
días distintos del año para esa misma casilla — el fallo ocultaba el conflicto en vez de
señalarlo.

**Después de la corrección**, la misma casilla pasa correctamente a la cola de revisión,
con las dos variantes reales detectadas:

```
lectura_breve_citas / 3403 — 10 observaciones, 2 variantes:
  "Rm 8, 29.30"   (Primeras Vísperas de la Inmaculada Concepción)
  "Flp 4, 4-5"    (otra celebración que comparte la misma casilla)
```

Es decir, la corrección no obliga un valor por decreto: dijo la verdad que la herramienta
llevaba oculta, y deja la decisión de cuál de las dos variantes debe ganar (o si deben
separarse con un id nuevo) en la cola de revisión existente
(`migration-to-saints/review-queue.js`), igual que cualquier otro conflicto genuino.

**Efecto medido sobre el conjunto completo** (2017–2026, diócesis de Barcelona, todas las
Horas configuradas):

| | Antes | Después |
|---|---|---|
| ids pendientes de revisión (conflicto real o aparente) | 3.030 | 1.478 |

Casi la mitad de los conflictos registrados en la herramienta eran precisamente este
fallo: campos de Vísperas mal archivados por la comparación memoria/feria rota, que se
resuelven solos en cuanto se compara contra un control ferial de verdad independiente.

## Alcance de lo que NO corrige esto

- La casilla `lectura_breve_citas/3403` (y sus equivalentes de responsorio y preces) sigue
  **pendiente de decisión editorial**: hay que decidir si a esa casilla le corresponde
  únicamente el texto de la Inmaculada, y la otra celebración que la comparte necesita una
  casilla propia nueva. Eso es trabajo de la cola de revisión, no de este fix.
- Este fallo era específico de **Vísperas** (la rama de Laudes ya usaba una llamada fresca
  a `LaudesService.ObtainLaudes` para su control ferial, y no estaba afectada).
- No se ha tocado nada en `src/` de cpl-app ni en el código de saints-app: el fallo y la
  corrección viven enteramente en la herramienta de migración de este repositorio.

## Cómo reaplicar este cambio si hace falta

```sh
cd litcal
npx tsx scripts/build-date-to-key-manifest.ts \
  /Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts/all_laudes.json \
  2017-01-01 2026-12-30 \
  cpl-app/migration-to-saints/webui/run/date-to-key-manifest.json \
  diocese-barcelona

cd ../cpl-app
RUN_DIR=migration-to-saints/webui/run HOURS=Laudes,Vespers,Invitation,Celebration DIOCESE=Barcelona \
  npx jest migration-to-saints/join-content.test.js --silent
```

(O, más simple, el botón "Refrescar-ho tot" del panell de migración, que encadena los
mismos pasos.)
