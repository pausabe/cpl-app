# Redisseny de l'app: proposta

Estat: **proposta, sense codi**. Preparada el 21/09/2026 sobre `master` (9911954), abans de l'actualització d'Expo.

Maquetes, pantalla per pantalla (com és ara i com podria ser):
https://claude.ai/artifact/W3E84fehARAQq9F3tn18jc. L'enllaç és privat: per ensenyar-lo al CPL, primer s'ha de compartir des del menú de la pàgina.

## La idea

La mateixa app, més clara. Res canvia de lloc, el text litúrgic no es toca, i tot el que es pot tocar
té aspecte de botó. Molts usuaris són gent gran que fa anys que la fan servir cada dia: el redisseny no els ha
d'obligar a tornar-la a aprendre.

## Principis

1. **Res canvia de lloc.** Tres pestanyes en el mateix ordre i amb les mateixes icones; el calendari a
   l'esquerra i la configuració a la dreta; el mateix color de capçalera (`#006064`).
2. **El text litúrgic no es toca.** Ni el contingut ni l'ordre. No es toca res de `src/Services`,
   `src/Models` ni la base de dades.
3. **El vermell de les rúbriques es queda**, com als llibres. Només es fa més llegible.
4. **Tot el que es pot tocar sembla un botó** i fa com a mínim 44–48 px d'alt.
5. **La mida de text per defecte no canvia** (21 px, la mida 3).
6. **Per fases i via OTA.** Cada fase és un canvi petit que es pot publicar sol, amb setmanes entremig.

## Què he trobat

| Problema | On | Detall |
|---|---|---|
| Les pestanyes no tenen nom | `NavigationController.tsx` (`tabBarShowLabel: false`) | La icona de marcador per a les Hores no s'endevina. |
| Els dies blancs, les dades del dia gairebé no es llegeixen | `HomeScreen.js`, `liturgicPaint` | El color litúrgic pinta el text: blanc (B) sobre turquesa. Passa a tot el temps de Pasqua i de Nadal i a moltes festes. Captura del 15/09 a les maquetes. |
| L'inici no porta a pregar | `HomeScreen.js` | Missatge i Donatiu, amb icones de 75 px, ocupen el centre. Per resar cal endevinar la pestanya. |
| El vermell de les rúbriques no arriba al contrast mínim | `GlobalViewFunctions.getStyle` (`accentColor = 'red'`) | `#FF0000` sobre blanc fa 4,0:1, per sota del 4,5:1 recomanat per a text normal. |
| Selectors i enllaços amb aspecte de text gris petit | `HIDDEN_PRAYER_BUTTON`, `PRAYER_TAB_BUTTON` | «Començar amb l'invitatori», «Continua amb el Salm», Salm 94/99/66/23, Ant. 1–4: gris, mida −3, sense forma de botó. |
| Per canviar la mida del text cal sortir de la pregària | `SettingsScreen.js` | Només s'arriba a la configuració des de l'inici. |
| El mode fosc només s'aplica a la pregària | `getStyle('CONTAINER')` | Inici, llistes i configuració queden sempre clars: de nit, l'app enlluerna en entrar i sortir de la pregària. |
| Espais irregulars | 6 fitxers de `src/Views` | 423 salts fets amb `Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>`. Deixen forats desiguals després de cada títol de secció. |
| Títol incomplet | `NavigationController.tsx:274` | La capçalera fa servir `props.type` («Ofici») i no el `title` que ja es passa («Ofici de lectura»). |
| La pantalla s'apaga mentre reses | — | No es fa servir `expo-keep-awake`. |
| Dades tècniques a la vista de tothom | `SettingsScreen.js` | EAS channel, updateId, precedència, esquema de color. |
| «Lloc» no s'explica | `SettingsComponentAdapter.js` | Diòcesi / Ciutat / Catedral, sense cap pista del que canvia. |
| Tauleta | `app.json` (`supportsTablet: true`) | El text ocupa tota l'amplada: a l'iPad les línies són massa llargues. |

## La proposta

### Capçalera i pestanyes

- Les pestanyes porten nom: **Inici · Hores · Missa**. Les icones són les d'ara. Les etiquetes
  d'accessibilitat també («Inici», «Litúrgia de les hores», «Missa»).
- La pestanya activa, amb una pastilla clara darrere la icona.
- Títol complet a les pantalles de pregària: `route.params.title` en lloc de `route.params.props.type`.

### Inici

- La mateixa estructura de dalt a baix: lloc, data, dades del dia, celebració, Missatge i Donatiu.
- La data, en paraules i més gran: «Dilluns, 21 de setembre de 2026».
- Les tres línies de sempre («Dilluns de la setmana XXV - Any A», «Temps - Durant l'any», «Litúrgia de
  les Hores - Setmana I»), amb els valors en negreta en lloc de pintats de color.
- El color litúrgic, a part: un punt del color i el nom («Color litúrgic: vermell»). El dia blanc es
  llegeix igual que els altres.
- La celebració, en una targeta amb l'etiqueta a dins («FESTA») i la fletxa si té descripció.
- **Opcional:** un botó «Ara és l'hora de Laudes», amb les mateixes franges que ja fa servir la llista
  d'hores. Porta a pregar amb un sol toc.
- Missatge i Donatiu lliure, més discrets: dos botons amb icona i text, a baix.
- Fons: llis (verd blavós molt clar) o la textura d'ara. Es poden comparar a les maquetes.

### Llistes: Hores i Missa

- La mateixa llista, en el mateix ordre.
- Cada fila és un botó sencer de 72 px. A les Hores, amb una pista breu de quan es resa («Matí»,
  «Migdia», «Abans d'anar a dormir»). A la Missa, amb la cita de cada lectura.
- L'hora actual porta l'etiqueta «Ara», no només negreta.
- A dalt, el dia i la celebració. Si s'ha canviat de dia amb el calendari, es veu de quin dia és el que
  obres.
- Es mantenen el títol vermell de les primeres vespres i el selector «Avui | Vespertina» (aquest, com a
  selector de dues opcions).

### Pantalles de pregària i lectures

- Mateix text, mateixa mida per defecte.
- Vermell de rúbrica `#B3261E` (6,6:1); en mode fosc, `#F28B82`.
- Espais regulars: un component `Gap` en lloc dels 423 salts de línia buits.
- Títols de secció (HIMNE, SALMÒDIA…) en vermell, una mica més petits i espaiats, amb el divisor de
  sempre.
- Selectors (salm invitatori, antífona de la Mare de Déu, Evangeli normal o alternatiu) com a pastilles
  de 44 px, amb l'opció triada marcada.
- «Començar amb l'invitatori» i «Continua amb…», botons visibles amb el mateix text i al mateix lloc.
- **Botó Aa** a la capçalera: obre un full amb A− / A+ i el mode fosc. Desa a la mateixa configuració que
  ara (`SettingsService.setSettingTextSize`, `setSettingDarkMode`).
- La pantalla no s'apaga mentre la pregària és oberta (`useKeepAwake` a `HoursLiturgyPrayerScreen` i
  `MassLiturgyPrayerScreen`).
- Lectures de la missa alineades a l'esquerra (ara es justifiquen a iOS).
- Amplada màxima de lectura d'uns 680 px a la tauleta.
- **Opcional:** lletra amb serifa (Literata) com a opció de configuració. Està a les maquetes per
  comparar-la; per defecte, la lletra del sistema, com ara.

### Configuració

- Les mateixes sis opcions, agrupades: **Lectura** (mida del text, mode fosc, himnes en llatí),
  **Calendari** (diòcesi, lloc), **Missa** (vídeo de llengua de signes).
- Mida del text amb una frase real de mostra («V. Obriu-me els llavis, Senyor.») en lloc de «Aa».
- Mode fosc amb tres botons (Automàtic / Activat / Desactivat) en lloc d'un desplegable.
- Sota «Lloc», una línia: «Algunes celebracions canvien segons on reses, com la dedicació de la
  catedral.»
- Es queden a la vista el text d'aprovació, la versió de l'app i la versió de la base de dades. La resta
  de dades tècniques, darrere els 10 tocs que ja obren els registres.

### Detalls

- Avís de mitjanit («Vols la litúrgia d'ahir?»): botons amb el color de l'app, més grans, amb la data en
  paraules.
- Calendari d'iOS: els botons Cancel·la / Avui / Canvia amb el color de l'app en lloc del blau d'iOS.
- Mode fosc a tota l'app, capçaleres i pestanyes incloses.
- **Opcional:** després de l'actualització, una targeta a l'inici que es tanca amb un toc: «Hem renovat
  l'aspecte de l'app. Tot és al mateix lloc.»

## Què no es toca

- `src/Services`, `src/Models`, la base de dades, `GlobalViewFunctions.completeOracio` i la resta de
  lògica que decideix el text.
- L'ordre de les pestanyes, les icones, el color de marca, el lloc dels botons.
- Els textos que busquen els tests de Maestro, sempre que es pugui (vegeu Tests).

## Pla d'implementació

Quan acabis el que tens a mitges i l'actualització d'Expo sigui a `master`, es fa `rebase` d'aquesta
branca i es comença. Cada fase és una PR i una actualització EAS: primer al canal de test i després a
producció, amb dues o tres setmanes entremig perquè ningú rebi tots els canvis de cop.

**Fase 1: fonaments, sense cap canvi visible.**
- `src/Theme/`: colors clar i fosc, espais, mides de text (`convertTextSize` passa aquí) i un
  `ThemeProvider` a `NavigationController` que llegeix `CurrentSettings.DarkModeEnabled` i s'actualitza
  quan canvia. El tema de React Navigation (`DefaultTheme` / `DarkTheme`) en surt.
- Components compartits a `src/Components/`: `Gap`, `SectionTitle`, `Rubric` (V. / R. / Ant.),
  `ChoiceChips`, `ContinueButton`, `ListRow`, `Card`.
- `GlobalViewFunctions.getStyle` llegeix del tema.
- Criteri de fet: tests de Jest verds i captures de Maestro pràcticament iguals a les d'abans.

**Fase 2: guanys ràpids.** Noms a les pestanyes, títol complet, vermell `#B3261E`, keep-awake, color
litúrgic de l'inici com a punt. Són canvis petits i molt visibles.

**Fase 3: pantalles de pregària i lectures.** Espais (`Gap`), títols de secció, selectors, botons de
continuar, botó Aa, amplada màxima. Es fa per hores, començant per `HoursComponent.js`, la més curta.

**Fase 4: inici i llistes.**

**Fase 5: configuració, avisos i mode fosc a tota l'app.**

### Dependències

- No cal cap llibreria nova. `expo-keep-awake` i `expo-font` ja són a `node_modules` com a dependències
  d'`expo`. Convé afegir-los explícitament amb `npx expo install` abans de la build del nou SDK, perquè
  quedin segur dins el binari i les fases es puguin publicar per OTA.
- Si es tria la lletra amb serifa, el fitxer de Literata es carrega amb `expo-font`.
- Aprofitant l'actualització d'Expo: aquestes dependències no s'importen enlloc de `src/` ni d'`App.js`
  i es podrien treure: `native-base`, `react-native-paper`, `@react-navigation/material-bottom-tabs`,
  `@react-navigation/drawer`, `@react-navigation/native-stack`, `@react-native-community/masked-view`.

### Tests

- Els tests golden de Jest no s'han de moure: no es toca la lògica litúrgica.
- Maestro. Es mantenen: «Barcelona (Diòcesi)», «Litúrgia de les Hores - Setmana …», «Missatge»,
  «Donatiu lliure», les etiquetes d'accessibilitat de pestanyes i capçalera, els noms de les hores, «HIMNE»,
  «ORACIÓ», «Antífona final de la Mare de Déu», «Primera lectura», «Evangeli», «Diòcesi», «Versió de la base
  de dades: …» i els valors dels selectors («Barcelona», «Girona», «Automàtic», «Activat»).
- Maestro. Canviarien: la data de l'inici (`05-calendari.yaml` busca `.* - 15/[0-9]{2}/[0-9]{4}`) i el
  comentari de `04-configuracio.yaml` que diu que l'inici té un fons fix.
- Abans de la fase 1, desar les captures de `maestro test .maestro/` com a referència de l'abans.

## Preguntes obertes

1. **Fons de l'inici:** llis o la textura d'ara?
2. **Botó «Ara és l'hora de…» a l'inici:** sí o no?
3. **Lletra amb serifa** com a opció: val la pena?
4. **«Mode obscur» → «Mode fosc»?** «Fosc» és el terme habitual en català.
5. **Franges de l'hora destacada.** Ara: Laudes 6–8 h, Tèrcia 9–11, Sexta 12–14, Nona 15–17,
   Vespres 18–23, Completes 0–1, i l'Ofici mai (`HoursLiturgyButtonsComponent.js`). Completes només es
   destaca després de mitjanit: potser hauria de ser a partir de les 22 h?
6. **Lectures justificades a iOS:** passar-les a l'esquerra com a Android?
7. **Avís de novetats** després de l'actualització: sí o no?
