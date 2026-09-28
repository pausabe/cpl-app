# Ideas: cinco funcionalidades para cpl-app

Estado: ideas, nada decidido (28-9-2026). Parten de `master` (71dd2a5) con la rama `typescript-refactor`
encima.

| # | Idea | Dónde | Esfuerzo | Depende de |
| - | ---- | ----- | -------- | ---------- |
| 1 | Recordatorios por hora | app | pequeño-medio | 2 |
| 2 | Enlaces directos a cada hora | app | pequeño | — |
| 3 | Widget | app (nativo) | grande | 2 |
| 4 | «He trobat un error» | app + cpl-cloud | medio | — |
| 5 | «Resant amb tu» | app + cpl-cloud | medio-pequeño | — |

**Orden recomendado: 2 → 1 → 4 → 5 → 3.** La 2 es pequeña y es la base de la 1 y la 3. La 1 es la que
más ayuda a rezar cada día. La 3 va al final porque la parte de iOS obliga a añadir un target y a
cambiar la firma y el flujo de publicar.

## Lo que vale para las cinco

- **Todo sale por las tiendas**, porque no hay actualizaciones OTA. Como pronto irían a la 9.1.0 (la
  segunda cifra es para cosas nuevas), después de la 9.0.0.
- **`ios/` y `android/` no están en el repo**: los genera `expo prebuild`. Todo lo nativo entra con
  config plugins (como [plugins/withIosSceneLifecycle.js](../plugins/withIosSceneLifecycle.js)) o con
  librerías que traen el suyo.
- **Los usuarios son mayores.** Todo es opcional y viene apagado. No cambia nada de lo que ya conocen:
  el inicio y las oraciones se quedan como están.
- **El texto litúrgico no se toca.**
- **Privacidad.** Lo que no sale del móvil (1, 2 y 3) no cambia nada. Lo que llega a cpl-cloud (4 y 5)
  vuelve a dejar atrasada la política de la CPL. Antes de publicar hay que darles el texto nuevo y
  poner al día la ficha de datos de Google Play y la de Apple.
- **Las copias de prueba (`IS_TEST_BUILD`) no envían nada**, igual que con el informe de uso.
- **Capas.** Solo `controllers/liturgyStore` lee `DataService`, y lo vigila
  [\_\_tests\_\_/architecture/layers.test.js](../__tests__/architecture/layers.test.js).
- **Verificación.** Con Jest. En el móvil lo prueba Pau.

---

## 1. Recordatorios por hora

**Qué.** Un grupo nuevo en Configuración, «Recordatoris», con una fila por hora: un interruptor y una
hora. Todo viene apagado. Al tocar el aviso se abre esa hora (idea 2).

Horas que se proponen al activar cada una, dentro de las franjas de «Ara» (`currentHour` en
[src/view-models/hours.ts](../src/view-models/hours.ts)):

| Hora | Franja de «Ara» | Propuesta |
| ---- | --------------- | --------- |
| Ofici de lectura | ninguna | 7:00 |
| Laudes | 6–8 h | 7:30 |
| Tèrcia | 9–11 h | 10:00 |
| Sexta | 12–14 h | 13:00 |
| Nona | 15–17 h | 16:00 |
| Vespres | 18–23 h | 19:30 |
| Completes | 0–1 h | 22:30 |

**Cómo.**

- **`expo-notifications`, solo con avisos locales.** No hacen falta servidor, token ni push.
- **Un aviso diario que se repite por cada hora activada** (trigger `DAILY`). Como mucho son 7, lejos del
  límite de 64 avisos pendientes de iOS, y siguen sonando aunque la app no se abra en semanas.
- **El texto del aviso es fijo**, sin el santo del día: un aviso que se repite no puede cambiar de texto
  cada día. Poner el santo obligaría a programar días sueltos por adelantado y a abrir la app para
  rellenarlos, y en una primera versión no vale la pena.
- **El permiso se pide al activar el primer recordatorio**, nunca al abrir la app. Si se deniega, el
  interruptor vuelve a apagado y se ofrece «Obre la configuració del telèfon», como ya hace la
  ubicación en [SettingsScreen.tsx](../src/views/settings/SettingsScreen.tsx).
- **Se guarda con `SettingsService`**, todo como texto, como hasta ahora: una clave por hora, con `''`
  si está apagado o `'07:30'`.
- **Al abrir la app y al cambiar un recordatorio**, se cancelan los nuestros y se vuelven a programar a
  partir de lo guardado. Así la operación es idempotente y se recupera sola en un móvil restaurado desde
  una copia o después de reinstalar.
- **Android.**
  - Comprobar que la librería no pide `SCHEDULE_EXACT_ALARM`, que Google Play restringe. Que el aviso
    llegue unos minutos tarde no importa.
  - El permiso `POST_NOTIFICATIONS` (Android 13+) lo añade la propia librería.
  - Hace falta un canal «Recordatoris» con el nombre en catalán.
- **Completes después de medianoche.** El aviso solo dice qué hora es. El día lo decide la app con la
  regla de siempre: el aviso de medianoche, de 0 a 3 h (`GlobalKeys.late_prayer`).

**Por decidir.**

- Las horas propuestas.
- El texto del aviso, por ejemplo «Laudes» / «Toca per començar a resar».
- Si entra el Ofici, que no tiene franja.

**Pruebas (Jest)**, con `expo-notifications` simulado:

- activar una hora programa un aviso;
- apagarla lo cancela;
- cambiar la hora lo reprograma;
- al abrir la app se reconstruye lo mismo;
- si se deniega el permiso, el interruptor queda apagado.

**Esfuerzo.** Pequeño-medio. Añade un módulo nativo, así que necesita versión de tienda.

---

## 2. Enlaces directos a cada hora

**Qué.** Direcciones que abren la app directamente en una pantalla: `…://hora/laudes` … `…://hora/completes`,
y `…://avui` para el inicio. Nadie las ve, pero son la base de la 1 y la 3. Más adelante también
permitirían los accesos rápidos del icono (mantenerlo pulsado y elegir Laudes, Vespres o Completes) y
Siri/Atajos.

**Cómo.**

- **`scheme` en [app.json](../app.json)**, que ahora no tiene ninguno. Tiene que ser único: si dos apps
  reclaman el mismo, iOS elige una cualquiera. `cpl` es demasiado corto; mejor `litcat` o `cplapp`.
- **Un handler propio en lugar de la configuración `linking` de React Navigation.** La pantalla de una
  hora necesita los mismos parámetros que el toque del inicio (`onOpenHour` en
  [HomeScreenController.tsx](../src/controllers/HomeScreenController.tsx): `type`, `title` y `subtitle`
  con las primeras Vísperas). Además, solo puede abrirse cuando el día ya está cargado. El handler hace
  esto:
  1. escucha la URL: `Linking.getInitialURL` si la app arranca desde cero, y el evento `url` si ya estaba
     abierta;
  2. espera a que `LiturgyStore.isLoaded()`, y recarga si el día cargado ya no es hoy (la lógica de
     `lastRefreshDate` que ya existe);
  3. construye la ficha con `buildHours` y navega como `onOpenHour`. Una URL desconocida se queda en el
     inicio.
- **Entre las 0 y las 3 h** sale primero el aviso de medianoche, como ahora, y el enlace abre la hora
  después de la elección.
- **Misa**: el mismo sistema, con `model.mass.params`.

**Por decidir.**

- El nombre del scheme.
- Si un enlace a Completes de madrugada salta el aviso de medianoche o no.

**Pruebas (Jest).**

- Arrancar desde cero con la URL lleva a `LHDisplay` con los parámetros correctos.
- Una URL con la app abierta.
- Una URL desconocida.
- Una URL que llega antes de que el día esté cargado.
- El día ha cambiado desde la última apertura.

**Esfuerzo.** Pequeño. El scheme es configuración nativa, así que va en la misma versión que la 1.

---

## 3. Widget

**Qué.** Un widget para la pantalla de inicio de iOS y Android:

- **Pequeño**: la fecha y la celebración del día, sobre el color litúrgico, como la tarjeta del día.
- **Mediano**: además, la hora de ahora («Ara: Laudes») como un botón que abre esa hora (idea 2).
- Tocar en cualquier otra parte abre el inicio.

**El problema de fondo.** El widget no puede ejecutar el motor litúrgico: en iOS es SwiftUI (WidgetKit)
y no ejecuta JavaScript. Por eso la app calcula los días siguientes y los deja en un almacén compartido,
y el widget solo los lee. Lo hace cada vez que se abre y cada vez que se cambia la diócesis o el lugar.

- **Por día se guarda:** la fecha, el título de la celebración, el color (`R`/`V`/`M`/`B`) y el tipo
  (Solemnitat…). La hora de ahora la calcula el widget con el reloj, con las mismas franjas que
  `currentHour`.
- **Unos 14 días.** El color y el tiempo litúrgico salen de una fila de `anyliturgic`, que es barato
  (ver `DayInput` en [dayCard.ts](../src/view-models/dayCard.ts)). El título necesita buscar la
  celebración: cuesta más que eso, pero bastante menos que `reloadAllData`. Hay que medirlo y hacerlo
  después de pintar el inicio, sin bloquear nada.
- **Si pasan los 14 días sin abrir la app, o se acaba `anyliturgic`**, el widget muestra solo la fecha y
  la hora, sin celebración ni color. Nunca un error.

**iOS.**

- **Un target de extensión** que tiene que generar `prebuild`. `@bacons/apple-targets` es la forma
  habitual de hacerlo con Expo.
- **Un App Group compartido** (`group.cpl.cpl`) y una forma de escribir en él desde JS.
- **Lo caro no es el código, es la firma.** Hacen falta:
  - otro bundle id (`cpl.cpl.widget`);
  - otro perfil de aprovisionamiento, con el App Group;
  - cambios en [patchIosSigning.mjs](../scripts/patchIosSigning.mjs) y en los secretos del flujo de
    publicar ([publishing.md](publishing.md));
  - cambios en `make ios-device`, que instala `cpl.cpl.dev` (su widget sería `cpl.cpl.dev.widget`).

**Android.** `react-native-android-widget` trae su plugin de Expo. El widget se dibuja con JSX desde una
tarea JS en segundo plano, que puede leer lo que guardó la app. No hace falta ninguna firma nueva.

**Accesibilidad y modo oscuro.**

- Etiquetas en catalán.
- El texto respeta el tamaño del sistema.
- El color litúrgico con el mismo contraste que la tarjeta del día (el rojo oscurecido de la 9.0.0).

**Por decidir.**

- Qué tamaños.
- Si empezar por Android (más barato) o por iOS (el que prueba Pau).

**Pruebas (Jest).**

- La función que construye los 14 días, que es pura (días → entradas), comparada con los goldens.
- El JSX del widget de Android.
- La parte Swift queda fuera de Jest: la prueba Pau en el móvil.

**Esfuerzo.** Grande, casi todo en la parte de iOS: el target, la firma y el flujo de publicar.

---

## 4. «He trobat un error»

**Qué.** Al pie de cada oración (horas y misa), un enlace discreto: «Has vist un error en aquest text?».
Abre una hoja (`BottomSheet`) que:

- dice claramente qué se va a enviar: el día, la hora, la diócesis, el lugar y la revisión de los textos;
- deja elegir la parte con los títulos de sección que ya pinta
  [hourBlocks.tsx](../src/views/hours-liturgy/hourBlocks.tsx): Himne, Salmòdia, Lectura, Responsori,
  Preces, Oració o «Una altra»;
- tiene un campo opcional, «Què hi has vist?», de 500 caracteres como máximo;
- tiene un botón «Envia». Después dice «Gràcies. Ho revisarà la CPL.»

El usuario no recibe respuesta. Quien la quiera puede escribir a cpl@cpl.es.

**Qué se envía.**

- el día que se muestra y la hora (o la lectura de la misa);
- la diócesis y el lugar;
- las opciones que cambian el texto: himnos en latín sí o no, el salmo invitatorio y la antífona mariana;
- la publicación de la BD, la versión de la app y la plataforma;
- la parte elegida y el comentario.

No se envía ningún identificador del móvil, porque no hace falta. Con esto, desde cpl-admin se puede
reproducir exactamente la pantalla.

**Servidor (cpl-cloud).**

- **`POST /v1/reports` en cpl-api**, con la clave de la app como el resto de rutas. Acepta solo una
  lista cerrada de campos, recorta el comentario y rechaza todo lo demás.
- **Migración `0008`**: una tabla `reports` con un estado: nou, revisat, corregit a la publicació N, no
  és un error.
- **Contra el abuso**, porque la clave de la app no es un secreto: un límite por minuto con el Rate
  Limiting de Workers, sin guardar la IP, y un tope diario.
- **Una pestaña «Errors» en cpl-admin**, con la lista, el filtro por estado y el cambio de estado.
- **Aviso por el Telegram** que ya avisa de las publicaciones (`notifyPublication`): uno por informe o
  un resumen diario.

**Con lo que ya hay.**

- Si un informe confirmado es un error de código, se convierte en un CPL-LIT-NNN y sigue la convención
  de commits (trailer `Cpl-Bug`).
- Si es un error de texto, lo corrige el editor en cpl-admin, sale en la publicación siguiente y el
  informe queda como «corregit a la publicació N».

**Sin conexión.** El informe se guarda y se envía en la apertura siguiente, como las aperturas del
informe de uso.

**Privacidad.** El comentario es texto libre, así que alguien puede escribir su nombre o su correo.

- Como ayuda, «No cal que hi posis cap dada teva».
- Un plazo de borrado (un año, o al cerrar el informe).
- Que la política de la CPL lo diga.

**Por decidir.**

- Si el enlace va solo al pie o también se puede mantener pulsado un párrafo. `PrayerFlow` junta los
  párrafos, así que marcar el bloque exacto es más difícil: primero, al pie.
- El plazo de conservación.
- Quién de la CPL lo revisa.

**Esfuerzo.** Medio: la app, la API, la migración, la pestaña de cpl-admin y la política.

---

## 5. «Resant amb tu»

**Qué.** Una línea discreta en la pantalla de una hora: «En l'última mitja hora, 37 persones han resat
Laudes.»

- Solo aparece si hay al menos 5 personas. Mostrar «1 persona» sería decirle a alguien que está solo, o
  dejar deducir quién es.
- Se puede apagar en Configuración.
- «Ara mateix» no sería verdad, porque se cuentan aperturas, no a quien está rezando en este momento.

**Cómo, en la app.**

- Si se abre una hora y se sigue en ella 30 segundos, la app envía `POST /v1/praying` con
  `{ hour: "laudes" }` y nada más, sin identificador. Lo hace una sola vez por hora y día litúrgico
  (con una marca local), para que abrir y cerrar no cuente dos veces.
- El número lo pide con `GET /v1/praying?hour=laudes` al abrir la pantalla. Sin conexión no muestra
  nada.

**Cómo, en el servidor.**

- **D1**: una tabla `praying` con la franja de 5 minutos, la hora y la cuenta. Cada aviso es un
  `UPSERT`, y el `GET` suma las franjas de la última media hora.
- **Limpieza**: se borran las franjas de más de un día. Antes se puede guardar el total por día y hora,
  para una gráfica en cpl-admin de qué horas se rezan y cuándo, siempre agregado.
- **Coste**: miles de usuarios por pocas horas al día son del orden de 10.000 escrituras diarias, y el
  plan gratuito de D1 da 100.000. El `GET` se guarda 60 segundos en la caché del borde para no leer D1
  en cada apertura.
- Durable Objects o Analytics Engine serían más precisos o más baratos a gran escala, pero no hacen
  falta.

**Privacidad.** Sin identificador y agregado, no es un dato de nadie. Aun así es un dato nuevo que sale
del móvil, así que la política de la CPL tiene que mencionarlo.

**Por decidir.**

- La redacción exacta.
- El umbral.
- Dónde va: solo en la pantalla de la hora, o también en el inicio, al lado de «Ara».
- Nada por diócesis: los números serían demasiado pequeños.

**Esfuerzo.** Medio-pequeño.
