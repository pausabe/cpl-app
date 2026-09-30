# D-001 — El Comú a les memòries: `Categoria = '0000'` no és un error de cpl-app

| | |
|---|---|
| **Estat** | **Tancada** — no es toca res |
| **Component** | cpl-app · `santsMemories.Categoria` · Laudes i Vespres de les 527 memòries |
| **Veredicte** | **4 — no és error.** L'OGLH 235b permet expressament les dues opcions, i la que fa cpl-app és la de l'edició oficial catalana, la de la CPL (la web `liturgiadeleshores.cat`, que no és oficial, fa el mateix) |
| **Trobat** | 3 de setembre de 2026, revisant el dia amb la skill `revisio-dia` (memòria de sant Gregori el Gran) |
| **Correcció** | **Cap.** Ni codi, ni base de dades, ni `.sql` |
| **Regressió** | Cap. No hi ha res a detectar: el comportament actual és el bo |

## La pregunta

A la pestanya del sant de saints-app, un dia de memòria té una vintena de caselles catalanes
buides. El 3 de setembre de 2026 en són **20 de 57**: els responsoris breus i els precs de
Laudes i de Vespres.

El text hi és, en català, dins de `cpl-app.db`. El codi que l'aniria a buscar hi és. El que
falla és un punter. La pregunta era si aquest punter a zero és un forat de dades que s'hauria
d'omplir amb un `db-fixes/CPL-LIT-NNN.sql`.

## El mecanisme, en tres peces

**1 · La fila de la memòria diu «del Comú».** `santsMemories` id 344, sant Gregori el Gran:

```
Categoria           "0000"
citaLBLaudes        "-"      respBreuLaudes1/2/3   "-"      pregariesLaudes   "-"
citaLBVespres       "-"      respBreuVespres1/2/3  "-"      pregariesVespres  "-"
antZacaries         "El pastor eximi sant Gregori ens va donar el model i la regla…"  ← propi
antMaria            "El papa Gregori complia de fet el que ensenyava de paraula…"     ← propi
oraFi               "Oh Déu, vós teniu cura de molts pobles i els conduïu amb amor…"  ← propi
```

El guionet no vol dir «no hi ha text»: és la marca del llibre per a **«del Comú»**. I no és cas
únic — de les 527 memòries:

| camp | amb `-` | buit | amb text propi |
|---|---|---|---|
| `citaLBLaudes` · `lecturaBreuLaudes` | 508 | 1 | 18 |
| `respBreuLaudes1` | 509 | 1 | 17 |
| `pregariesLaudes` | 511 | 1 | 15 |
| `citaLBVespres` · `respBreuVespres1` | 510 | 1 | 16 |
| `pregariesVespres` | 513 | 1 | 13 |
| `antZacaries` | 373 | 1 | 153 |
| `antMaria` | 383 | 1 | 143 |
| `oraFi` | **0** | **0** | **527** |

**2 · El Comú hi és, en català.** `OficisComuns`, 48 files, una per Comú i temps litúrgic, amb
exactament aquests camps. `06cO — COMÚ DE PASTORS: PER UN PAPA`:

```
citaLBLaudes     "He 13, 7-9a"
respBreuLaudes   "Sobre teu, Jerusalem," / "He apostat sentinelles."
                 / "Ni de dia ni de nit no pararan de predicar el nom del Senyor."
citaLBVespres    "1Pe 5, 1-4"
respBreuVespres  "Ha estimat els germans" / "I prega molt pel poble."
                 / "Ha donat la vida pels seus germans."
```

**3 · El punter està a zero, i el codi el mira.**
[`LiturgyMastersService.tsx:745`](../../src/Services/Liturgy/LiturgyMastersService.tsx#L745):

```ts
async function ObtainCommonOffices(category : string) : Promise<CommonOffice>{
    if (category && category !== '0000') { … }   // ← amb les memòries, mai no hi entra
```

I el mecanisme **funciona**, perquè la taula germana el fa servir:

| taula | files | amb `Categoria = '0000'` |
|---|---|---|
| `santsSolemnitats` | 172 | **14** — la resta duen `02aO`, `06bO`, `03aP`… |
| `santsMemories` | **527** | **527, totes** |

Per això, a les memòries, cpl-app resa la fèria: no és que no trobi el Comú, és que no el
demana mai.

## La norma

**Ordenació General de la Litúrgia de les Hores, núm. 235 a)-d)**, «Les memòries que tenen lloc
en dies ordinaris», a l'Ofici de lectura, Laudes i Vespres — literal, de l'edició castellana:

> a) Los salmos, con sus antífonas, se tomarán de la feria correspondiente, a no ser que haya
> antífonas o salmos propios, lo que se indicará en cada lugar.
> b) La antífona del Invitatorio, el himno, la lectura breve, las antífonas del cántico de
> Zacarías y del cántico de María y las preces, **si son propios, se han de decir del santo;
> en caso contrario, se tomarán del Común o de la feria correspondiente.**
> c) La oración conclusiva se ha de decir del santo.
> d) En el Oficio de lectura, la lectura bíblica con su responsorio se ha de tomar de la feria
> correspondiente. […]

Això és el nus de tot el dossier: **«del Comú o de la fèria»**. La norma no imposa el Comú;
n'ofereix dues i deixa triar. No hi ha cap regla trencada que puguem assenyalar.

## Les fonts, el 3 de setembre de 2026

| | Lectura breu de Laudes | Responsori de Laudes | Precs | Ant. del Benedictus |
|---|---|---|---|---|
| **cpl-app** (català) | Rm 14, 17-19 · **fèria** | fèria | fèria | **propi de Gregori** |
| **liturgiadeleshores.cat** (català) | Rm 14, 17-19 · **fèria** | fèria | fèria | fèria |
| **apps.idteologia.org** (castellà) | Hb 13, 7-9a · **Comú** | Comú | Comú | propi de Gregori |
| **universalis.com** (anglès) | Heb 13, 7-9 · **Comú** | Comú | Comú | propi de Gregori |

I a Vespres, igual: cpl-app i la font catalana donen 1Pe 1, 22-23 i «El Senyor és el meu
pastor» (fèria); el castellà i l'anglès donen 1Pe 5, 1-4 i «Ha estimat els germans» (Comú).

La coincidència amb `liturgiadeleshores.cat` no és aproximada: els precs de Vespres de cpl-app
i els de la font catalana són **el mateix text, paraula per paraula**, les cinc peticions.

## Veredicte

**No és error de cpl-app.** Dues raons, i cadascuna sola ja bastaria:

1. L'OGLH 235b permet expressament la fèria.
2. La web catalana `liturgiadeleshores.cat`, que no és oficial, fa exactament el mateix que cpl-app, a Laudes i a Vespres.

El que hi ha aquí és una **diferència d'ús entre edicions**: la catalana resa la fèria a les
memòries, la castellana i l'anglesa prenen el Comú. Posar `Categoria` a les 527 files canviaria
el que resen els usuaris uns 250 dies l'any, en contra de l'ús català publicat i sense més
autoritat que la nostra. No es fa.

## El que sí que en surt

**1 · A les antífones, cpl-app és més correcte que la font de referència.** L'OGLH 235b diu que
si l'antífona del Benedictus o del Magníficat és **pròpia**, «se han de decir del santo» — hi és
obligatòria, no opcional. Sant Gregori en té de pròpies, i el castellà i l'anglès les duen.
cpl-app també. `liturgiadeleshores.cat` hi posa la ferial: al Benedictus imprimeix «Feu saber,
Senyor, al vostre poble que li ve la salvació», que és `salteriComuLaudes.antEvangelic` id 12 —
la del saltiri— i al Magníficat «El Senyor sacia i omple de béns els qui tenen fam i set de ser
justos». La font de referència, doncs, no és impecable, i això val a l'hora de pesar-la.

**2 · La pregunta que queda oberta no és de cpl-app, és de saints-app.** *(Resposta el 3 de
setembre de 2026: en Pau decideix que el català, dins de saints-app, tirarà del Comú com el
castellà. La pestanya del sant passa a tenir una regla única per a totes les llengües, i deixa
de ser un mirall de cada edició nacional. Queda per executar el que diu el punt 3 i la segona
font del join; i queda dit que uns 250 dies l'any el català obrirà per un ofici que la seva
pròpia edició no mana — lícit per l'OGLH 235b, però visible per a qui compari amb el breviari
català, i per això val la pena que consti per escrit.)* Que cpl-app resi la
fèria no diu res de què ha de mostrar la **pestanya del sant** de saints-app, que és una altra
superfície. En castellà aquella pestanya **ja mostra el Comú** avui: la casella
`responsorios/1460` diu «Sobre tus murallas, Jerusalén». Si la catalana ha de fer el mateix, el
que cal no és tocar la base de dades sinó que el join **culli `OficisComuns`** — que ara no ho
fa mai, perquè només registra el que cpl-app renderitza. Això omple 19 de les 20 caselles del
dia sense tocar ni una línia de cpl-app.

**3 · Si es culla, el Comú s'ha de triar per la cita, no pel títol.** L'heurística d'ara
(`commons-proposal.js`, `COMMON_BY_TITLE`) el dedueix del títol de la memòria, i amb sant
Gregori s'equivoca:

| | Comú triat | responsori de Laudes |
|---|---|---|
| l'eina proposa | `07aO` doctors | «L'Església proclama * La saviesa dels sants» |
| el castellà i l'anglès fan servir | `06cO` pastors/papa | «Sobre teu, Jerusalem * He apostat sentinelles» |

«…papa i **doctor de l'Església**» fa saltar la regla dels doctors abans que la del papa. I qui
té raó es decideix amb una prova que no depèn de la llengua: la cita de la lectura breu de la
casella germana castellana és **`Hb 13, 7-9a`** (Laudes) i **`1 P 5, 1-4`** (Vespres), que són
exactament `citaLBLaudes` i `citaLBVespres` de `06cO`, i no `Sa 7, 13-14` / `Jm 3, 17-18` dels
doctors. La regla ha de ser aquesta, no el títol.

## Dos fils que queden per estirar (veredicte 5, no són acusacions)

**L'oració de sant Gregori no diu el mateix a les dues fonts catalanes.**

| | |
|---|---|
| cpl-app (`santsMemories/344.oraFi`) | «Oh Déu, vós teniu cura **de molts pobles** i **els** conduïu amb amor; per la intercessió **de sant Gregori, papa**…» |
| liturgiadeleshores.cat | «Oh Déu, vós teniu cura **del vostre poble** i **el** conduïu amb amor; per la intercessió **del papa sant Gregori el Gran**…» |

El castellà («que cuidas de tu pueblo») i l'anglès («who care for your people») van amb la
segona, però el llatí de la col·lecta té `pópulis tuis` en **plural**, que va amb la primera.
Per a dir-hi res caldria l'edició típica llatina i l'edició catalana en paper. Queda obert.

**`salmos_antifonas/9253`: «Santíssim Nom de Jesús» al calendari però litcal no l'aplica.**
Surt com a causa d'una casella retinguda del 3 de setembre, però passa el 3 de gener. Caldria
mirar el calendari `catalonia` de litcal. Fora de l'abast d'aquest dossier.

## Com es reprodueix

```sh
make review DATES=2026-09-03            # 51 camps · 0 divergències
make day-check DATE=2026-09-03          # 24/57 amb text català · 13 conflictes · 20 sense dades
```

I les fonts consultades el 3 de setembre de 2026:

- <https://www.liturgiadeleshores.cat/laudes.php> i `vespres.php` — català. Només dona el dia
  en curs, i el 3 de setembre de 2026 **era** el dia en curs: per això, aquest cop, es va poder
  fer servir.
- <https://apps.idteologia.org/index.php?fecha=2026-09-03&r=liturgiaDeLasHoras%2Fespanola&rezo=laudes>
  (i `rezo=visperas`) — castellà, per data exacta.
- <https://universalis.com/20260903/lauds.htm> i `/vespers.htm` — anglès.
- <https://ldhoras.com/es/docs/institutio-ldhoras.html> — OGLH 235, text complet.
