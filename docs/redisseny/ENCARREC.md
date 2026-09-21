# Encàrrec: implementar el redisseny de cpl-app

Per a l'agent (o la persona) que programi el redisseny. Llegeix-ho sencer abans de tocar res.

Per arrencar una sessió nova de Claude Code en aquest directori:

> Implementa el redisseny de cpl-app. Llegeix `docs/redisseny/ENCARREC.md` a la branca `redisseny` i segueix-lo.
> Fes la fase 0 i atura't.

## L'objectiu

Implementar el disseny de [PROPOSTA.md](PROPOSTA.md), fase per fase, a la branca `redisseny`. El resultat surt a
la versió 9.0.0 de les botigues, amb l'Expo 57 que ja és a `master`.

En acabar cada fase: **atura't, informa i espera l'OK d'en Pau** abans de començar la següent.

## On és el disseny

- **Què i per què:** [PROPOSTA.md](PROPOSTA.md).
- **Com ha de quedar:** el llenç https://claude.ai/artifact/W3E84fehARAQq9F3tn18jc, pàgina «Disseny final». Ignora la
  pàgina «Exploració». Es llegeix amb l'eina Artifact (`action: "read"`, `path: "project/…"`). Cada pantalla és un
  fitxer `.dc.html`. Els colors, les mides i els textos exactes són al marcatge i al `renderVals()` de cada fitxer.
  - `project/IniciE2.dc.html`: l'inici, amb tots els casos. És la referència principal. Els props `dia` (festa,
    feria, diumenge, memoria, vespres, rams, dissabteSant, pasqua), `ara`, `avis`, `tema` i `amplada`/`alcada`
    en canvien l'estat. Els fitxers `Final*.dc.html` són embolcalls que en mostren un cas concret.
  - `project/Laudes.dc.html` (amb el full Aa), `Completes.dc.html`, `Evangeli.dc.html` i
    `FinalPrimeraLectura.dc.html`: pregària i lectures.
  - `project/Config.dc.html`: configuració.
- **Els textos litúrgics de les maquetes són reals**, però a l'app surten sempre de les dades; no copiïs cap text
  de les maquetes al codi.

### Colors

| Token | Clar | Fosc |
|---|---|---|
| Capçalera | `#006064` | `#006064` |
| Fons de l'inici | `#E7F2F1` | `#0E1413` |
| Fons de la pregària | `#FFFFFF` | `#0B0F0E` |
| Superfície (targetes, fitxes) | `#FFFFFF` | `#18201F` |
| Vora | `#D3E3E1` | `#2A3534` |
| Text | `#182322` | `#E6ECEB` |
| Text secundari | `#475756` | `#B3C0BE` |
| Text terciari | `#5A6B6A` | `#93A3A1` |
| Botó ple (hora d'ara, «Tanca») | `#007B80` | `#1F7F7B` |
| Text d'acció (enllaços, contorns) | `#00696D` | `#7FD1CC` |
| Rúbrica | `#B3261E` | `#F28B82` |

Colors litúrgics de la targeta del dia (punt · fons clar/fosc · accent clar/fosc):

| Codi | Nom | Punt | Fons | Accent |
|---|---|---|---|---|
| R | Vermell | `#C62828` | `#F8E7E5` / `#2A1917` | `#B3261E` / `#F28B82` |
| V | Verd | `#2E7D32` | `#E5F1E6` / `#16241A` | `#2E6B30` / `#8CC98F` |
| M | Morat | `#6A3D9A` | `#EFE8F4` / `#221B2B` | `#6A3D9A` / `#C9A7EB` |
| B | Blanc | `#FFFFFF` amb vora | `#F7F1E3` / `#26221A` | `#7A5F14` / `#E3C877` |

Lletra: la del sistema per a tot, i Literata (600) per a la data i el títol del dia i per als títols dels fulls.

## Regles

1. **No toquis `src/Services`, `src/Models`, la base de dades ni `GlobalViewFunctions.completeOracio`.** Si una
   pantalla necessita una dada que no hi és, pregunta.
2. **El text litúrgic no es canvia mai**, ni les majúscules ni la puntuació. Només en canvia la presentació.
3. **Treballa al mateix directori del repo.** No facis servir `git worktree` ni carpetes a part. Si hi ha canvis
   sense commit que no són teus, pregunta a en Pau abans de canviar de branca.
4. **No facis push, ni EAS update, ni builds de botiga**, si en Pau no ho diu.
5. **Commits en català**, amb el format del repo: `feat(redisseny): …`, `refactor(redisseny): …`,
   `test(maestro): …`. El cos explica el perquè.
6. **Dependències noves:** només `react-native-svg`, `expo-keep-awake` i la font Literata. Per a qualsevol altra,
   pregunta.
7. **Textos de la interfície en català**, com a les maquetes. Mantén o millora les etiquetes d'accessibilitat.
8. **Els tests golden de Jest no s'han de moure.** Si en canvia algun, és que has tocat lògica: desfés-ho.

## Fases

### Fase 0: preparar

1. `git checkout redisseny` i `git rebase master`. La branca només té documents.
2. Desa les captures de referència de l'abans: `make ui-tests-android` (i `make ui-tests-ios` si hi ha simulador).
3. `npx expo install react-native-svg expo-keep-awake`. Afegeix Literata (fitxers `.ttf` de Google Fonts, llicència
   OFL) a `src/Assets/fonts/` i carrega-la amb `expo-font` abans d'amagar la pantalla de càrrega.
4. `app.json`: `runtimeVersion` a `"9.0.0"`, si encara no hi és. Un valor fix, no una política (vegeu PROPOSTA.md,
   «Llançament»).
5. Recompila l'app de desenvolupament (`make run-android`), perquè hi ha mòduls natius nous.
6. `make tests` verd, i l'app s'obre com abans.

### Fase 1: fonaments, sense cap canvi visible

- `src/Theme/`: els colors de dalt, espais, mides de text (`convertTextSize` passa aquí) i un `ThemeProvider` a
  `NavigationController`. El provider llegeix `CurrentSettings.DarkModeEnabled` i s'actualitza quan canvia. El tema
  de React Navigation 7 en surt.
- Components a `src/Components/`: `Gap`, `SectionTitle`, `Rubric` (V. / R. / Ant.), `ChoiceChips`,
  `ContinueButton`, `Card`, `HourIcon` (amb `react-native-svg`) i `BottomSheet`.
- `GlobalViewFunctions.getStyle` llegeix del tema.
- Fet quan: Jest verd, Maestro verd i captures pràcticament iguals a les de la fase 0.

### Fase 2: guanys ràpids a la pregària

- Títol complet a la capçalera (`route.params.title` en lloc de `route.params.props.type`).
- Rúbrica `#B3261E` (fosc: `#F28B82`).
- La pantalla no s'apaga a `HoursLiturgyPrayerScreen` i `MassLiturgyPrayerScreen`. Són components de classe:
  `activateKeepAwakeAsync()` en muntar-se i `deactivateKeepAwake()` en desmuntar-se.

### Fase 3: pantalles de pregària i lectures

- Canvia els 423 `Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>` per `Gap`. Fes-ho hora per hora,
  començant per `HoursComponent.js`, la més curta, i compara captures abans i després de cada una.
- Títols de secció amb `SectionTitle`. Selectors amb `ChoiceChips`. «Començar amb l'invitatori» i «Continua amb…»
  amb `ContinueButton`.
- Botó Aa a la capçalera, amb el full de mida i mode fosc (maqueta `Laudes.dc.html`, prop `aa`).
- Lectures alineades a l'esquerra. Amplada màxima de lectura de 680 a la tauleta.

### Fase 4: el nou inici

Abans de començar, demana a en Pau les preguntes obertes de PROPOSTA.md.

- Nou inici a `HomeScreen.js`, segons `IniciE2.dc.html`. `HomeScreenController.tsx` conserva el que ja fa: canvi
  de dia, tornada de segon pla, avís de mitjanit, calendari i memòria lliure.
- La lògica que avui és en altres pantalles es mou a l'inici, sense canviar-la:
  - l'hora d'ara, de `HoursLiturgyButtonsComponent.js`;
  - el selector «Avui | Vespertina» i la clau que desa la tria, de `MassLiturgyMainScreen.js`;
  - els botons especials de Rams i de la Vetlla Pasqual, de `MassLiturgyMainScreen.js`;
  - el títol de les primeres vespres, de `HoursLiturgyButtonsComponent.js`.
- A Rams, la frase de la missa és la de la benedicció, que ja és a `MassLiturgyPrayerScreen.js` (`Render_Rams`).
  Treu-la a una funció compartida; no la copiïs.
- Full de la descripció del sant amb `BottomSheet`. Es tanca amb el botó enrere a Android.
- `ScrollView` amb `contentContainerStyle={{flexGrow: 1}}`: fitxes que creixen fins a un límit, i
  `maxFontSizeMultiplier` als rètols.
- `NavigationController`: fora les pestanyes. Queda un sol stack amb Inici, `LHDisplay`, `LDDisplay`, Configuració,
  Missatge i Donatiu. Esborra `HoursLiturgyPrayerMainScreen.js`, `MassLiturgyMainScreen.js` i
  `HoursLiturgyButtonsComponent.js` quan ja no es facin servir.
- Actualitza els fluxos de Maestro tal com diu PROPOSTA.md («Tests») i afegeix-hi els nous.

### Fase 5: configuració, avisos i mode fosc a tota l'app

- Configuració agrupada, segons `Config.dc.html`.
- Avís de mitjanit i calendari d'iOS amb el nou estil (maquetes `FinalMitjanit`, `FinalCalendari`). A Android, el
  selector del sistema.
- Avís de novetats, si en Pau hi diu que sí.
- Mode fosc a tota l'app, capçaleres incloses.

## Com comprovar cada fase

- `make tests` verd.
- `make ui-tests-android`, i `make ui-tests-ios` si hi ha simulador, verds.
- Captures de cada pantalla tocada, a l'emulador (`adb exec-out screencap -p > captura.png`), comparades amb la
  maqueta. Mira-les també:
  - en mode fosc;
  - amb la lletra del sistema gran (`adb shell settings put system font_scale 1.3`; torna-la a `1.0` en acabar);
  - en un dia especial. Amb el calendari de l'app, prova 26/09, 31/10 al vespre, 29/03, 4/04 i 5/04 del 2026.

## L'informe de cada fase

Curt:
- què ha canviat i en quins fitxers;
- el resultat dels tests;
- on són les captures;
- en què difereix de les maquetes, i per què;
- què cal decidir.
