# Redisseny de l'app: proposta

Estat: **triada, sense codi**. Preparada el 21/09/2026 sobre `master` (9911954), abans de l'actualització a Expo 57.

Maquetes: https://claude.ai/artifact/W3E84fehARAQq9F3tn18jc. **La triada és la fila «El tauler a fons»**, a dalt
de tot. Les altres files són el camí fins aquí: la primera proposta pantalla per pantalla i les variants que s'han
descartat. L'enllaç és privat: per ensenyar-lo al CPL, primer s'ha de compartir des del menú de la pàgina.

## La idea

Tot el que es fa servir cada dia, en una sola pantalla d'inici: el dia litúrgic, les set hores amb la d'ara
marcada i les lectures de la missa. Un toc i ja reses. El text litúrgic no es toca, i tot el que es pot tocar
té aspecte de botó. Molts usuaris són gent gran que fa anys que fan servir l'app cada dia, i el canvi ha de ser
fàcil d'entendre al primer cop d'ull.

## Principis

1. **Tot el de cada dia, a l'inici i a un toc.** Les hores i les lectures ja no s'amaguen darrere de pestanyes.
2. **El que no cal moure no es mou.** El calendari a l'esquerra, la configuració a la dreta, el mateix color de
   capçalera (`#006064`) i els mateixos noms de les hores i de les lectures.
3. **El text litúrgic no es toca.** Ni el contingut ni l'ordre. No es toca res de `src/Services`, `src/Models`
   ni la base de dades.
4. **El vermell de les rúbriques es queda**, com als llibres. Només es fa més llegible.
5. **Tot el que es pot tocar sembla un botó** i fa com a mínim 44–48 px d'alt.
6. **La mida de text per defecte no canvia** (21 px, la mida 3).
7. **Per fases i via OTA.** Cada fase es pot publicar sola, amb setmanes entremig.

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

## La proposta triada: el tauler

### Inici: tot en una pantalla

De dalt a baix, sota la capçalera de sempre (calendari · CPL · configuració):

1. **La targeta del dia**, amb el fons del color litúrgic molt suau i un punt amb el nom del color:
   - Colors: vermell (R), verd (V), morat (M) i blanc (B). El blanc es fa amb un fons marfil i text daurat fosc, per
     llegir-se bé.
   - Hi surt el lloc («Barcelona (Diòcesi)») i la data en paraules («Dilluns, 21 de setembre»).
   - Si hi ha celebració, el tipus («FESTA») i el títol. Si és fèria, «Dimarts de la setmana XXV».
   - Una línia amb la setmana, l'any i la setmana del salteri.
   - La data i el títol van en Literata; la resta, amb la lletra del sistema.
   - Si el dia té descripció, a sota de tot surt «Llegeix-ne més». Vegeu la secció següent.
2. **Litúrgia de les Hores:** les set hores en fitxes, en tres files (Ofici de lectura · Laudes / Tèrcia · Sexta ·
   Nona / Vespres · Completes).
   - Cada fitxa porta una icona: un arc amb el sol a cada lloc. A Laudes surt, a Sexta és a dalt, a Vespres es
     pon. Completes és la lluna i l'Ofici, el llibre.
   - L'hora d'ara, plena de color i amb l'etiqueta «Ara». Es fan servir les mateixes franges d'hora que ara (vegeu
     les preguntes obertes).
   - Cada fitxa obre la pantalla de pregària de sempre (`LHDisplay`).
3. **Missa:**
   - La frase de l'Evangeli d'avui, en cursiva, amb la cita (`Gospel.Comment` i `Gospel.Quote`).
   - A sota, un botó per lectura: Primera lectura, Salm, Segona lectura (només si n'hi ha) i Evangeli. Cada botó
     obre la pantalla de lectures de sempre (`LDDisplay`) en aquell punt.
4. **Missatge i Donatiu lliure**, a baix de tot i discrets. Fan el mateix que ara.

Les pestanyes desapareixen: l'inici ja ho té tot. Les pantalles Litúrgia de les Hores i Missa (les llistes)
deixen de caldre. Les pantalles de pregària i de lectures es queden.

Totes les dades ja es carreguen en obrir l'app (`CurrentLiturgyDayInformation`, `CurrentCelebrationInformation`,
`CurrentSettings`, `CurrentMassLiturgy`, `CurrentHoursLiturgy`). No cal cap servei nou.

### La descripció del sant: un full que puja

La base de dades té 499 descripcions (`infoMemoria`). Fan de 106 a 1.076 caràcters, amb una mitjana de 407.

- La targeta del dia es pot tocar i porta «Llegeix-ne més».
- En tocar-la, puja un full de baix amb el tipus, el títol, el text i un botó «Tanca» ben gran. També es tanca
  tocant fora del full, i amb el botó enrere a Android.
- La pantalla de sota no es mou. Si el text és llarg, el full fa scroll per dins; ocupa com a màxim el 80 % de
  l'alçada.

Substitueix el que fa ara l'inici, que en tocar el títol amaga Missatge i Donatiu i hi posa el text.

### Mides de pantalla i lletra gran

- L'inici és un `ScrollView` que només fa scroll quan no hi cap tot (`contentContainerStyle={{flexGrow: 1}}`).
- Si sobra espai, les fitxes de les hores es fan més altes, fins a un límit. Així no queden forats en els mòbils
  grans.
- Mòbil petit (375×667): el dia i les hores es veuen sense moure res; la missa comença a baix.
- Lletra del sistema gran: el text creix i les fitxes tenen alçada mínima, no fixa. Als rètols de botons i
  fitxes, `maxFontSizeMultiplier` (per exemple 1,5), perquè la graella no es desfaci. Al text de la pregària, cap
  límit.
- Tauleta: una columna centrada d'amplada màxima 560. El full de la descripció també surt centrat.

### Pantalles de pregària i lectures

- Mateix text, mateixa mida per defecte.
- Vermell de rúbrica `#B3261E` (6,6:1); en mode fosc, `#F28B82`.
- Espais regulars: un component `Gap` en lloc dels 423 salts de línia buits.
- Títols de secció (HIMNE, SALMÒDIA…) en vermell, una mica més petits i espaiats, amb el divisor de sempre.
- Selectors (salm invitatori, antífona de la Mare de Déu, Evangeli normal o alternatiu) com a pastilles de 44 px,
  amb l'opció triada marcada.
- «Començar amb l'invitatori» i «Continua amb…», botons visibles amb el mateix text i al mateix lloc.
- **Botó Aa** a la capçalera: obre un full amb A− / A+ i el mode fosc. Desa a la mateixa configuració que ara
  (`SettingsService.setSettingTextSize`, `setSettingDarkMode`).
- La pantalla no s'apaga mentre la pregària és oberta (`useKeepAwake` a `HoursLiturgyPrayerScreen` i
  `MassLiturgyPrayerScreen`).
- Títol complet a la capçalera (`route.params.title` en lloc de `route.params.props.type`).
- Lectures de la missa alineades a l'esquerra (ara es justifiquen a iOS).
- Amplada màxima de lectura d'uns 680 px a la tauleta.
- **Opcional:** Literata també per al text de la pregària, com a opció de configuració. Per defecte, la lletra
  del sistema.

### Configuració

- Les mateixes sis opcions, agrupades: **Lectura** (mida del text, mode fosc, himnes en llatí),
  **Calendari** (diòcesi, lloc), **Missa** (vídeo de llengua de signes).
- Mida del text amb una frase real de mostra («V. Obriu-me els llavis, Senyor.») en lloc de «Aa».
- Mode fosc amb tres botons (Automàtic / Activat / Desactivat) en lloc d'un desplegable.
- Sota «Lloc», una línia: «Algunes celebracions canvien segons on reses, com la dedicació de la catedral.»
- Es queden a la vista el text d'aprovació, la versió de l'app i la versió de la base de dades. La resta de dades
  tècniques, darrere els 10 tocs que ja obren els registres.

### Detalls

- Avís de mitjanit («Vols la litúrgia d'ahir?»): botons amb el color de l'app, més grans, amb la data en paraules.
- Calendari d'iOS: els botons Cancel·la / Avui / Canvia amb el color de l'app en lloc del blau d'iOS.
- Mode fosc a tota l'app, capçaleres incloses.
- **Opcional:** després de l'actualització, una targeta a l'inici que es tanca amb un toc: «Ara ho tens tot a
  l'inici: les hores i les lectures de la missa.»

## Falta dissenyar abans de programar l'inici

Són casos que existeixen avui i que les maquetes no mostren:

1. **Memòria lliure.** Ara, a l'inici, un interruptor activa la memòria. Al tauler hauria d'anar dins la targeta
   del dia, en una fila pròpia i amb text, no només l'interruptor.
2. **Primeres vespres.** Ara, sota «Vespres» surt en vermell el títol de la solemnitat de demà. Al tauler, a la
   fitxa de Vespres.
3. **Missa vespertina.** El selector «Avui | Vespertina», dins el bloc de la missa, els dies que n'hi ha.
4. **Dies especials de la missa.** Diumenge de Rams («Benedicció dels Rams») i Vetlla Pasqual («Lectures i
   salms» i «Evangeli»).
5. **Diumenge de Pasqua.** Ara no es mostra el títol de les vespres i les Laudes comencen amb l'invitatori.
   Comprovar que el tauler ho respecta.

## Què no es toca

- `src/Services`, `src/Models`, la base de dades, `GlobalViewFunctions.completeOracio` i la resta de lògica que
  decideix el text.
- El lloc del calendari i de la configuració, el color de marca, els noms de les hores i de les lectures.

## Pla d'implementació

Quan acabis el que tens a mitges i l'actualització a Expo 57 sigui a `master`, es fa `rebase` d'aquesta branca i
es comença. Cada fase és una PR i una actualització EAS: primer al canal de test i després a producció, amb
setmanes entremig.

**Abans: la build d'Expo 57.** Hi han d'entrar els mòduls natius que farà servir el redisseny, perquè totes les
fases es puguin publicar per OTA:
- `react-native-svg`, per a les icones de les hores. Ara no és al projecte.
- `expo-font`, amb el fitxer de Literata. La llicència és OFL i es pot incloure a l'app.
- `expo-keep-awake`.

`expo-font` i `expo-keep-awake` ja són a `node_modules` com a dependències d'`expo`, però convé afegir-los
explícitament amb `npx expo install`.

**Fase 1: fonaments, sense cap canvi visible.**
- `src/Theme/`: colors clar i fosc (colors litúrgics inclosos), espais, mides de text (`convertTextSize` passa
  aquí) i un `ThemeProvider` a `NavigationController`. El provider llegeix `CurrentSettings.DarkModeEnabled` i
  s'actualitza quan canvia. El tema de React Navigation (`DefaultTheme` / `DarkTheme`) en surt.
- Components compartits a `src/Components/`: `Gap`, `SectionTitle`, `Rubric` (V. / R. / Ant.), `ChoiceChips`,
  `ContinueButton`, `Card`, `HourIcon`, `BottomSheet`.
- `GlobalViewFunctions.getStyle` llegeix del tema.
- Criteri de fet: tests de Jest verds i captures de Maestro pràcticament iguals a les d'abans.

**Fase 2: guanys ràpids a la pregària.** Títol complet, vermell `#B3261E`, keep-awake. Són canvis petits i no
mouen res de lloc.

**Fase 3: pantalles de pregària i lectures.** Espais (`Gap`), títols de secció, selectors, botons de continuar,
botó Aa i amplada màxima. Es fa hora per hora, començant per `HoursComponent.js`, la més curta.

**Fase 4: el nou inici.** El tauler, el full de la descripció, el comportament amb mides i lletra gran, i els
casos de la secció «Falta dissenyar». Les pestanyes marxen en aquesta fase. És el canvi més visible i va amb
l'avís de novetats.

**Fase 5: configuració, avisos i mode fosc a tota l'app.**

### Dependències

- Noves: `react-native-svg` (mòdul natiu, suportat per Expo) i el fitxer de font de Literata.
- Aprofitant l'actualització d'Expo: aquestes dependències no s'importen enlloc de `src/` ni d'`App.js` i es
  podrien treure: `native-base`, `react-native-paper`, `@react-navigation/material-bottom-tabs`,
  `@react-navigation/drawer`, `@react-navigation/native-stack`, `@react-native-community/masked-view`. Quan
  marxin les pestanyes, també `@react-navigation/bottom-tabs`.

### Tests

- Els tests golden de Jest no s'han de moure: no es toca la lògica litúrgica.
- Maestro. Les fitxes porten el nom de l'hora com a text, així que `tapOn: Laudes` continua funcionant. Canvia:
  - `02-hores`, `04-configuracio` i `05-calendari` toquen la pestanya «Litúrgia de les hores»: s'ha de treure,
    perquè les hores ja són a l'inici.
  - `03-missa` toca la pestanya «Missa»: s'ha de treure. Toca «Evangeli» directament.
  - `01-arrencada` busca «Litúrgia de les Hores - Setmana.*»: passa a buscar la línia nova del salteri.
  - `05-calendari` busca la data en format `.* - 15/[0-9]{2}/[0-9]{4}`: passa a la data en paraules.
  - `04-configuracio` diu en un comentari que l'inici té un fons fix: amb el mode fosc a tota l'app, ja no.
- Nous: tocar la targeta del dia obre el full de la descripció i «Tanca» el tanca; una hora s'obre des de l'inici.
- Abans de la fase 1, desar les captures de `maestro test .maestro/` com a referència de l'abans.

## Preguntes obertes

1. **Pestanyes:** es treuen de cop a la fase 4, o es deixen unes quantes versions per a qui hi està acostumat?
2. **«Mode obscur» → «Mode fosc»?** «Fosc» és el terme habitual en català.
3. **Franges de l'hora destacada.** Ara: Laudes 6–8 h, Tèrcia 9–11, Sexta 12–14, Nona 15–17, Vespres 18–23,
   Completes 0–1, i l'Ofici mai (`HoursLiturgyButtonsComponent.js`). Completes només es destaca després de
   mitjanit: potser hauria de ser a partir de les 22 h?
4. **Lectures justificades a iOS:** passar-les a l'esquerra com a Android?
5. **Avís de novetats** després de l'actualització: sí o no?
