# Redisseny de l'app: proposta

Estat: **decidida, sense codi**. Preparada el 21/09/2026.

Maquetes: https://claude.ai/artifact/W3E84fehARAQq9F3tn18jc. **El disseny decidit és a la pàgina «Disseny final»**,
que és la que s'obre per defecte. La pàgina «Exploració» guarda el camí fins aquí: la primera proposta i les
variants descartades. L'enllaç és privat: per ensenyar-lo al CPL, primer s'ha de compartir des del menú de la
pàgina.

Per programar-ho: [ENCARREC.md](ENCARREC.md).

## La idea

Tot el que es fa servir cada dia, en una sola pantalla d'inici: el dia litúrgic, les set hores amb la d'ara
marcada i les lectures de la missa. Un toc i ja reses. El text litúrgic no es toca, i tot el que es pot tocar
té aspecte de botó. Molts usuaris són gent gran que fa anys que fan servir l'app cada dia, i el canvi ha de ser
fàcil d'entendre al primer cop d'ull.

## Llançament

- **El redisseny va a la versió 9.0.0 de les botigues**, la de l'Expo 57, que ja és a `master` (build 90, canal
  `production_90`). Només el veurà qui actualitzi l'app. Qui es quedi a la 8 continua amb l'aspecte d'ara.
- **`runtimeVersion`: canviar-lo a `"9.0.0"` a `app.json` abans de compilar la 9.0.0.** Ara és `"1.0.0"`, el mateix
  que a la 8. Els canals ja separen les dues versions, però amb el mateix `runtimeVersion` n'hi hauria prou amb
  publicar per error al canal de la 8 (`production_89`) perquè els mòbils de la 8 rebessin codi de l'Expo 57 i
  petessin. Amb un `runtimeVersion` diferent, això no pot passar.
  Ha de ser un valor fix, no la política `appVersion`. Les OTA pugen la versió (9.0.1, 9.0.2…), i amb `appVersion`
  cada OTA tindria un runtime nou que no coincidiria amb el de cap mòbil. Només es torna a canviar quan una build
  de botiga porti canvis natius, i llavors pren el número d'aquella versió (per exemple, `"9.1.0"`).
- Les correccions per a qui es quedi a la 8 es publiquen per OTA al canal `production_89`. S'han de fer des del
  codi de la 8.0.4, és a dir, des d'una branca que surti de `9911954`, el darrer commit abans de l'Expo 52
  (`2e78fbf`).
- Les fases del pla són etapes de feina: cadascuna és una PR a la branca `redisseny`. Totes surten juntes, en un
  sol llançament.

## Principis

1. **Tot el de cada dia, a l'inici i a un toc.** Les hores i les lectures ja no s'amaguen darrere de pestanyes.
2. **El que no cal moure no es mou.** El calendari a l'esquerra, la configuració a la dreta, el mateix color de
   capçalera (`#006064`) i els mateixos noms de les hores i de les lectures.
3. **El text litúrgic no es toca.** Ni el contingut ni l'ordre. No es toca res de `src/Services`, `src/Models`
   ni la base de dades.
4. **El vermell de les rúbriques es queda**, com als llibres. Només es fa més llegible.
5. **Tot el que es pot tocar sembla un botó** i fa com a mínim 44–48 px d'alt.
6. **La mida de text per defecte no canvia** (21 px, la mida 3).

## Què he trobat

| Problema | On | Detall |
|---|---|---|
| Les pestanyes no tenen nom | `NavigationController.tsx` (`tabBarShowLabel: false`) | La icona de marcador per a les Hores no s'endevina. |
| Els dies blancs, les dades del dia gairebé no es llegeixen | `HomeScreen.js`, `liturgicPaint` | El color litúrgic pinta el text: blanc (B) sobre turquesa. Passa a tot el temps de Pasqua i de Nadal i a moltes festes. |
| L'inici no porta a pregar | `HomeScreen.js` | Missatge i Donatiu, amb icones de 75 px, ocupen el centre. Per resar cal endevinar la pestanya. |
| El vermell de les rúbriques no arriba al contrast mínim | `GlobalViewFunctions.getStyle` (`accentColor = 'red'`) | `#FF0000` sobre blanc fa 4,0:1, per sota del 4,5:1 recomanat per a text normal. |
| Selectors i enllaços amb aspecte de text gris petit | `HIDDEN_PRAYER_BUTTON`, `PRAYER_TAB_BUTTON` | «Començar amb l'invitatori», «Continua amb el Salm», Salm 94/99/66/23, Ant. 1–4: gris, mida −3, sense forma de botó. |
| Per canviar la mida del text cal sortir de la pregària | `SettingsScreen.js` | Només s'arriba a la configuració des de l'inici. |
| El mode fosc només s'aplica a la pregària | `getStyle('CONTAINER')` | Inici, llistes i configuració queden sempre clars: de nit, l'app enlluerna en entrar i sortir de la pregària. |
| Espais irregulars | 6 fitxers de `src/Views` | 423 salts fets amb `Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>`. Deixen forats desiguals després de cada títol de secció. |
| Títol incomplet | `NavigationController.tsx` | La capçalera fa servir `props.type` («Ofici») i no el `title` que ja es passa («Ofici de lectura»). |
| La pantalla s'apaga mentre reses | — | No es fa servir `expo-keep-awake`. |
| Dades tècniques a la vista de tothom | `SettingsScreen.js` | EAS channel, updateId, precedència, esquema de color. |
| «Lloc» no s'explica | `SettingsComponentAdapter.js` | Diòcesi / Ciutat / Catedral, sense cap pista del que canvia. |
| Tauleta | `app.json` (`supportsTablet: true`) | El text ocupa tota l'amplada: a l'iPad les línies són massa llargues. |

## El disseny decidit

### Inici: el tauler

De dalt a baix, sota la capçalera de sempre (calendari · CPL · configuració):

1. **La targeta del dia**, amb el fons del color litúrgic molt suau i un punt amb el nom del color:
   - Colors: vermell (R), verd (V), morat (M) i blanc (B). El blanc es fa amb un fons marfil i text daurat fosc, per
     llegir-se bé.
   - Hi surt el lloc («Barcelona (Diòcesi)») i la data en paraules («Dilluns, 21 de setembre»).
   - Si hi ha celebració, el tipus («FESTA») i el títol. Si és fèria, «Dimarts de la setmana XXV».
   - Una línia amb la setmana, l'any i la setmana del salteri.
   - La data i el títol van en Literata; la resta, amb la lletra del sistema.
   - Si el dia té descripció, al peu surt el botó «Llegeix-ne més».
2. **Litúrgia de les Hores:** les set hores en fitxes, en tres files (Ofici de lectura · Laudes / Tèrcia · Sexta ·
   Nona / Vespres · Completes).
   - Cada fitxa porta una icona: un arc amb el sol a cada lloc. A Laudes surt, a Sexta és a dalt, a Vespres es
     pon. Completes és la lluna i l'Ofici, el llibre.
   - L'hora d'ara, plena de color i amb l'etiqueta «Ara». Es fan servir les mateixes franges d'hora que ara.
   - Cada fitxa obre la pantalla de pregària de sempre (`LHDisplay`).
3. **Missa:**
   - La frase de l'Evangeli, en cursiva, amb la cita (`Gospel.Comment` i `Gospel.Quote`).
   - A sota, un botó per lectura: Primera lectura, Salm, Segona lectura (només si n'hi ha) i Evangeli. Cada botó
     obre la pantalla de lectures de sempre (`LDDisplay`) en aquell punt.
4. **Missatge i Donatiu lliure**, a baix de tot i discrets. Fan el mateix que ara.

Les pestanyes desapareixen: l'inici ja ho té tot. Les pantalles Litúrgia de les Hores i Missa (les llistes)
deixen de caldre. Les pantalles de pregària i de lectures es queden. En tornar enrere des d'una pregària, es va a
l'inici.

Totes les dades ja es carreguen en obrir l'app (`CurrentLiturgyDayInformation`, `CurrentCelebrationInformation`,
`CurrentSettings`, `CurrentMassLiturgy`, `CurrentHoursLiturgy`). No cal cap servei nou.

### Casos especials

Tots dissenyats a la fila 2 de la pàgina final, amb dades reals:

- **Memòria lliure** (26/09, Sants Cosme i Damià). Dins la targeta hi ha una fila «Celebrar la memòria» amb un
  interruptor i una línia que explica què passa. Apagat: el títol queda en gris i es resa la fèria. És la mateixa
  lògica d'ara (`HandleOnSwitchFreePrayerPressed`). Els dissabtes amb la memòria de Santa Maria (`V`), igual.
- **Primeres vespres** (31/10, vigília de Tots Sants). El títol de la solemnitat surt sota «Vespres», dins la
  fitxa (`CurrentHoursLiturgy.Vespers.Title`). El Diumenge de Pasqua no surt, com ara.
- **Missa vespertina** (31/10). Un selector «Avui | Vespertina» a sobre del bloc de missa, amb el títol de la
  celebració sota «Vespertina». A partir de les 18 h surt triada Vespertina, com ara (`afternoon_hour`), i la
  tria es recorda durant el dia.
- **Diumenge de Rams** (29/03). Un botó «Benedicció dels Rams» a sobre de les lectures. La Passió no té frase a
  la base de dades (`EvangeliCita` = `-`), i per això el bloc mostra la de la benedicció («Beneït el qui ve en nom
  del Senyor», Mt 21,1-11, la mateixa que ja fa servir `MassLiturgyPrayerScreen`).
- **Dissabte Sant** (4/04). El bloc es diu «Vetlla Pasqual» i té dos botons: «Lectures i salms» i «Evangeli». La
  frase és la de l'Evangeli de la Vetlla (Mt 28,1-10 l'any A).
- **Diumenge de Pasqua** (5/04). Color blanc. Les Laudes comencen amb l'invitatori, com ara.

### La descripció del sant: un full que puja

La base de dades té 499 descripcions (`infoMemoria`). Fan de 106 a 1.076 caràcters, amb una mitjana de 407.

- En tocar «Llegeix-ne més», puja un full de baix amb el tipus, el títol, el text i un botó «Tanca» ben gran.
  També es tanca tocant fora del full, i amb el botó enrere a Android.
- La pantalla de sota no es mou. Si el text és llarg, el full fa scroll per dins; ocupa com a màxim el 80 % de
  l'alçada.

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
- La pantalla no s'apaga mentre la pregària és oberta (`expo-keep-awake` a `HoursLiturgyPrayerScreen` i
  `MassLiturgyPrayerScreen`).
- Títol complet a la capçalera (`route.params.title` en lloc de `route.params.props.type`).
- Lectures de la missa alineades a l'esquerra (ara es justifiquen a iOS).
- Amplada màxima de lectura d'uns 680 px a la tauleta.

### Configuració

- Les mateixes sis opcions, agrupades: **Lectura** (mida del text, mode fosc, himnes en llatí),
  **Calendari** (diòcesi, lloc), **Missa** (vídeo de llengua de signes).
- Mida del text amb una frase real de mostra («V. Obriu-me els llavis, Senyor.») en lloc de «Aa».
- «Mode fosc» (no «Mode obscur»), amb tres botons (Automàtic / Activat / Desactivat) en lloc d'un desplegable.
- Sota «Lloc», una línia: «Algunes celebracions canvien segons on reses, com la dedicació de la catedral.»
- Es queden a la vista el text d'aprovació, la versió de l'app i la versió de la base de dades. La resta de dades
  tècniques, darrere els 10 tocs que ja obren els registres.

### Avisos

- **Mitjanit** (de 0 a 3 h, `late_prayer`): una targeta al mig amb dos botons grans, «Sí, la d'ahir» i «No, la
  d'avui», cadascun amb la data en paraules. Els textos són els d'ara.
- **Calendari** a iOS: el mateix selector en línia, amb els botons Cancel·la / Avui / Canvia amb el color de
  l'app. A Android es fa servir el selector del sistema.
- **Novetats** (opcional): el primer cop que s'obre la 9.0.0, un full que diu «Ara ho tens tot a l'inici: les
  hores i les lectures de la missa són aquí mateix» amb un botó «D'acord».
- Mode fosc a tota l'app, capçaleres incloses.

## Què no es toca

- `src/Services`, `src/Models`, la base de dades, `GlobalViewFunctions.completeOracio` i la resta de lògica que
  decideix el text.
- El lloc del calendari i de la configuració, el color de marca, els noms de les hores i de les lectures.

## Pla d'implementació

Es fa a la branca `redisseny`, posada al dia sobre `master`, que ja té l'Expo 57. Cada fase és una PR i es revisa
a l'emulador abans de passar a la següent. El detall per a qui ho programi és a [ENCARREC.md](ENCARREC.md).

**Fase 0: preparar.** `git rebase master` a `redisseny`; aquesta branca només té documents i no hi haurà
conflictes. `npx expo install react-native-svg expo-keep-awake`, i el fitxer de Literata (llicència OFL) carregat
amb `expo-font`, que ja és a les dependències. `runtimeVersion` a `"9.0.0"`.

**Fase 1: fonaments, sense cap canvi visible.**
- `src/Theme/`: colors clar i fosc (colors litúrgics inclosos), espais, mides de text (`convertTextSize` passa
  aquí) i un `ThemeProvider` a `NavigationController`. El provider llegeix `CurrentSettings.DarkModeEnabled` i
  s'actualitza quan canvia. El tema de React Navigation 7 en surt.
- Components compartits a `src/Components/`: `Gap`, `SectionTitle`, `Rubric` (V. / R. / Ant.), `ChoiceChips`,
  `ContinueButton`, `Card`, `HourIcon`, `BottomSheet`.
- `GlobalViewFunctions.getStyle` llegeix del tema.
- Criteri de fet: tests de Jest verds i captures de Maestro pràcticament iguals a les d'abans.

**Fase 2: guanys ràpids a la pregària.** Títol complet, vermell `#B3261E`, keep-awake.

**Fase 3: pantalles de pregària i lectures.** Espais (`Gap`), títols de secció, selectors, botons de continuar,
botó Aa i amplada màxima. Es fa hora per hora, començant per `HoursComponent.js`, la més curta.

**Fase 4: el nou inici.** El tauler, els casos especials, el full de la descripció, el comportament amb mides i
lletra gran, i treure les pestanyes.

**Fase 5: configuració, avisos i mode fosc a tota l'app.**

### Dependències

- Noves: `react-native-svg` i `expo-keep-awake` (mòduls natius d'Expo; entren a la build de la 9.0.0) i el fitxer
  de font de Literata.
- Aquestes dependències no s'importen enlloc i es poden treure si encara hi són: `native-base`,
  `react-native-paper`, `@react-navigation/material-bottom-tabs`, `@react-navigation/drawer`,
  `@react-navigation/native-stack`, `@react-native-community/masked-view`. Quan marxin les pestanyes, també
  `@react-navigation/bottom-tabs`.

### Tests

- Els tests golden de Jest no s'han de moure: no es toca la lògica litúrgica.
- Maestro. Les fitxes porten el nom de l'hora com a text, així que `tapOn: Laudes` continua funcionant. Canvia:
  - `02-hores`, `04-configuracio` i `05-calendari` toquen la pestanya «Litúrgia de les hores»: s'ha de treure,
    perquè les hores ja són a l'inici.
  - `03-missa` toca la pestanya «Missa»: s'ha de treure. Toca «Evangeli» directament.
  - `01-arrencada` busca «Litúrgia de les Hores - Setmana.*»: passa a buscar la línia nova del salteri.
  - `05-calendari` busca la data en format `.* - 15/[0-9]{2}/[0-9]{4}`: passa a la data en paraules.
  - `04-configuracio` diu en un comentari que l'inici té un fons fix: amb el mode fosc a tota l'app, ja no.
- Nous: «Llegeix-ne més» obre el full i «Tanca» el tanca; una hora s'obre des de l'inici; l'interruptor de la
  memòria lliure; el selector «Avui | Vespertina».
- Abans de la fase 1, desar les captures de `make ui-tests` com a referència de l'abans.

## Preguntes obertes

1. **Pestanyes.** El pla és treure-les a la 9.0.0, amb l'avís de novetats. L'alternativa és deixar-les a la 9.0.0
   i treure-les en una OTA de la 9.x.
2. **Avís de novetats:** sí o no?
3. **Franges de l'hora destacada.** Ara: Laudes 6–8 h, Tèrcia 9–11, Sexta 12–14, Nona 15–17, Vespres 18–23,
   Completes 0–1, i l'Ofici mai (`HoursLiturgyButtonsComponent.js`). Completes només es destaca després de
   mitjanit: potser hauria de ser a partir de les 22 h?
4. **Lectures justificades a iOS:** passar-les a l'esquerra com a Android?
