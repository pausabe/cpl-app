# EPREX-001 — El 2 de novembre, saints-app resa el diumenge en comptes de l'Ofici de Difunts

| | |
|---|---|
| **Estat** | **Salmòdia APLICADA per eprex** el 5-09-2026. 2a ronda **aplicada** al #1731 (9-9): lectura breu i himne bé. L'oració final (`207`) és **bona en català**; queda una pregunta del castellà, que el mateix dia hi té dues oracions diferents: **per enviar** des del 2-10 |
| **Component** | saints-app · `day_specific_texts/all_visperas.json` i `all_laudes.json` |
| **Gravetat** | Alta — un dia gran, i afecta **totes** les llengües de l'app, castellà inclòs |
| **Trobat** | 2-3 de setembre de 2026, investigant per què `salmos_citas/11025` quedava retinguda al join |
| **De qui és** | **d'eprex**, no de cpl-app ni de les nostres eines (veredicte 2) |
| **Correcció** | `43a319267` (`chore(texts): update 20260905-160710`), entrat per la PR #1726 de staging-texts, mergejada per en Fernando a `39410aa43`. Arribat a la nostra branca amb `cf9cab58a` |

## Símptoma

A la Commemoració de tots els fidels difunts (2 de novembre), saints-app dona la salmòdia
**del Diumenge XXXI del temps ordinari**, amb antífones que acaben en «Aleluya».

| | eprex mostra | hauria de ser (Ofici de Difunts) |
|---|---|---|
| **Vespres** 1r | Salmo 109 · ant. «…Aleluya» | Salmo 120 |
| **Vespres** 2n | Salmo 110 · ant. «…Aleluya» | Salmo 129 |
| **Vespres** càntic | Ap 19 · ant. «…Aleluya» | Flp 2, 6-11 |
| **Laudes** 1r | Salmo 92 · ant. «…Aleluya» | Salmo 50 |
| **Laudes** càntic | Daniel 3, 57-88 | Isaïes 38, 10-14.17-20 |
| **Laudes** 2n | Salmo 148 · ant. «…Aleluya» | Salmo 145 |

## La prova

Quatre peces, i cap no demana discutir de litúrgia:

1. **La fitxa és una còpia.** `commemoration_of_all_the_faithful_departed__ANY` és **idèntica**
   a `ordinary_time_31_sunday__ANY` en **16 dels 20 camps**, tant a Vespres com a Laudes. Només
   canvien `himno_latino`, `responsorios`, `cantico_evangelico_antifona` i `preces_contenido`.
   Els tres salms, l'himne, la lectura breu i **l'oració final** vénen tal qual del diumenge.
2. **No és ni la fèria.** El 2026-11-02 és **dilluns**; la fèria seria
   `ordinary_time_31_monday__ANY` (Salmo 122, Salmo 123, Ef 1,3-10), que eprex té ben posada.
   El que mostra no és ni l'Ofici de Difunts ni el dia: és el diumenge veí.
3. **La mateixa app ja porta el text bo.** El botó d'Ofici de Difunts
   (`oficio_difuntos.json`, `src/utils/findOfficeDeceased/`) dona exactament Salmo 120 / 129 /
   Flp 2 a Vespres i Salmo 50 / Is 38 / Salmo 145 a Laudes — **el mateix que resa cpl-app**
   aquells dies, antífona per antífona. Aquell botó es mostra **tots els dies de l'any**
   (`settingsStore.showOfficeDeceased`, per defecte actiu): és una eina devocional, no el camí
   cap a l'ofici del 2 de novembre.
4. **Les antífones són òrfenes.** `salmos_antifonas/10964`, `/10965` i `/10966` —les tres de
   Vespres de l'Ofici de Difunts— existeixen a `commons/es/` i **no les fa servir cap
   celebració**: zero referències als deu `all_*.json`. Igual la `1778` de Laudes. Van entrar
   amb el llibre i ningú les va connectar.

**Per què va passar, probablement**: el 2025-11-02 va caure justament en el Diumenge XXXI, i la
fitxa es va clonar d'allà. Però la Commemoració té precedència sobre un diumenge del temps
ordinari, així que ni aquell any era correcte.

**Fonts externes**: [oficiodivino.com](https://www.oficiodivino.com/visp2no.htm) (castellà) dona
Salmo 120 / 129 / Flp 2 per a les Vespres del 2 de novembre;
[apps.idteologia.org del 2025-11-02](https://apps.idteologia.org/index.php?fecha=2025-11-02&r=liturgiaDeLasHoras%2Fespanola&rezo=visperas)
els mateixos tres; i [Office of the Dead](https://en.wikipedia.org/wiki/Office_of_the_Dead)
(anglès) diu que l'Ofici de Difunts **és** l'ofici propi d'aquell dia.

## El cablejat proposat

No cal crear contingut: tots els ids existeixen ja.

**Vespres** (`all_visperas.json`)

| slot | cita | antífona | text |
|---|---|---|---|
| 1r · Salmo 120 | `4576` | `10964` | `4577` |
| 2n · Salmo 129 | `54` | `10965` | `55` |
| càntic · Flp 2, 6-11 | `11033` | `10966` | `11034` |

**Laudes** (`all_laudes.json`)

| slot | cita | antífona | text |
|---|---|---|---|
| 1r · Salmo 50 | `72` | `1778` | `73` |
| càntic · Is 38, 10-14.17-20 | `85` | `906` | `86` |
| 2n · Salmo 145 | `248` | `247` | `249` |

**No verificat**: l'himne, la lectura breu i l'oració final també vénen del diumenge. No s'ha
mirat si existeixen ids propis. Va inclòs al missatge com a pregunta oberta.

## Resultat: verificat el 7 de setembre de 2026

En Fernando ens va donar la raó i el canvi és a `all_visperas.json` i `all_laudes.json`. He
comprovat els 18 ids un per un: **són exactament els proposats**, els nou de cada hora.

La sonda es va tornar a passar (07-09 a les 08:35) **després** del merge (08:28) i el join a
continuació (08:36), o sigui que el pipeline ja treballa sobre el cablejat bo. Comprovat que la
sonda mesura `salmos_citas/4576, /54, /11033` a Vespres i `/72, /85, /248` a Laudes.

### Què ha entrat sol al català

Les **tres antífones òrfenes de Vespres** —`10964`, `10965`, `10966`— ja tenen text català: en
el moment que una celebració hi ha apuntat, el join les ha observades i omplert. Igual el primer
salm de Vespres sencer (`4576`/`4577`), el primer de Laudes (`72`/`1778`/`73`) i la cita i el
text del càntic d'Isaïes (`85`/`86`).

### Els dos conflictes que havíem previst: tots dos confirmats

| casella | | |
|---|---|---|
| `salmos_antifonas/906` | Dissabte Sant (10 dies) diu *«Senyor, deslliureu-me de la terra dels morts»* | Difunts (10 dies) diu *«Guardeu-me, Senyor, del poder de la mort»* |
| `salmos_antifonas/247` | 20 celebracions (60 dies) diuen *«Lloaré el meu Déu tota la vida»* | Difunts (10 dies) diu *«Beneiré el vostre nom per sempre»* |

La `906` és un **empat exacte, 10 contra 10**. Cap de les dues no és «la minoria».

**No decidim quina redacció és la bona**: això només ho diu el volum imprès (vegeu la memòria
`liturgia-hores-volums-font-del-text-catala`). El que sí que se sap és que **una casella no pot
servir les dues**, o sigui que això és una petició nova a eprex d'un id propi, del mateix tipus
que aquesta.

### Sis caselles més retingudes que NO són culpa d'aquest canvi

`salmos_citas/54`+`/textos/55`, `/citas/11033`+`/textos/11034`, `/citas/248`+`/textos/249`.
A totes sis el 2 de novembre cau **dins la variant majoritària**; qui discrepa és la Mare de Déu
del Pilar, la Conversió de sant Pau, santa Joaquima i Anna i el dijous de la setmana 12. Treure
el 2 de novembre no en resoldria cap: són conflictes independents i anteriors.

## 2a ronda: el que encara ve del diumenge

**Enviada a en Fernando el 7 de setembre de 2026. Aplicada al #1731 (9-9-2026)**: lectura breu `3601`,
himne `1064` (el mateix text que el `3970`) i oració final `207` («Oh Dios, que resucitaste a tu Hijo…»),
que no és la `1761` que li vam proposar. Revisat el 2-10: vegeu [L'oració final](#loració-final-revisada-el-2-doctubre-de-2026).

El que segueix és l'estat del 7-9, abans de la correcció.

La pregunta 3 del missatge —himne, lectura breu i oració final— **no s'ha tocat**. Les fitxes
de Laudes i Vespres continuen compartint **7 camps** amb el Diumenge XXXI: `himno`,
`lectura_biblica_cita`, `lectura_biblica`, `preces_intro`, `preces_respuesta`,
`invitacion_padrenuestro` i `oracion_final`.

| camp | eprex mostra el 2-XI | cpl-app i el botó d'Ofici de Difunts | id que ja existeix |
|---|---|---|---|
| lectura breu | `3496` = 1 P 1, 3-5 (del diumenge) | **1 Co 15, 55-57** *«¿Dónde está, muerte, tu victoria?»* | `lectura_breve_citas/3601` + `textos/3602` — **òrfenes** |
| oració final | `209` = *«Señor de poder y de misericordia…»* (del diumenge) | **«Escucha, Señor, nuestras súplicas, para que, al confesar la resurrección…»** | `oraciones_finales/1761` |
| himne | `3865` = *«¿Qué ves en la noche…»* (compartit amb 8 diumenges) | *«Tú, Señor, que asumiste la existencia…»* | `himnos/3970` |

**L'argument més fort per a la 2a ronda**: `oraciones_finales/1761` **ja la fa servir la fitxa
dels Difunts a Sexta i a Nona**. O sigui que l'app ja sap quina és l'oració d'aquell dia a les
hores menors, i a Laudes i Vespres continua posant-hi la del diumenge. No cal discutir de
litúrgia: n'hi ha prou amb ensenyar-los la seva pròpia incoherència.

## L'oració final: revisada el 2 d'octubre de 2026

La pregunta «la `207` o la `1761`?» estava mal plantejada. El número és bo; el que no quadra és el
**text castellà** de la `207`, que en Fernando va crear el 9-9 (`43cd3c858`, exportació del #1731: abans
la `207` no tenia castellà).

| llengua | `207` (Ofici, Laudes, Vespres) | `1761` (Tèrcia, Sexta, Nona) |
|---|---|---|
| castellà | «Oh Dios, que resucitaste a tu Hijo para que, venciendo la muerte, entrara en tu reino…» | «Escucha, Señor, nuestras súplicas, para que, al confesar la resurrección de Jesucristo…» |
| italià | «Ascolta, o Dio, la preghiera che la comunità dei credenti…», conclusió llarga | **la mateixa oració**, conclusió curta |
| català | «Escolteu benvolent, Senyor, aquestes pregàries…» = cpl-app (`diesespecials` 34: Ofici, Laudes i Vespres) | sense text encara |

1. **En català no hi ha res a fer**: la `207` ja diu el que resa la CPL, i el volum imprès català no hi
   aporta res.
2. **En castellà, el mateix dia té dues oracions finals.** Un dia té una sola oració a totes les hores, i a
   l'italià la `207` i la `1761` són la mateixa. El text castellà de la `207` sembla la col·lecta d'una altra
   de les misses de difunts. Quin text va el decideix el volum IV en castellà, que té en Fernando: és una
   pregunta per a ell, no una correcció nostra (vegeu la memòria `saints-app-follows-eprex-not-cpl-app`).
3. **De passada, i no és d'eprex**: la `1761` no té català perquè el 2 de novembre és al grup de dies en què
   litcal i cpl-app no celebren el mateix (`missing-celebrations.json` del 29-9: 21 caselles retingudes,
   els 10 anys). És feina de la migració, a part d'aquesta fitxa.

Missatge, a la targeta [14 del tauler](https://trello.com/c/qrkMH74e), columna «Por enviar».

## Precedent que deixa aquest cas

1. **El patró de la fitxa clonada.** Val la pena buscar-ne més: comparar cada fitxa amb la del
   diumenge veí i mirar quantes en són quasi idèntiques.
2. **Els ids orfes són el rastre.** Quan un text hi és i no l'apunta ningú, algú es va deixar
   el cablejat. Ha passat dues vegades al mateix dia (les antífones, i ara la lectura).
3. **Arreglar el castellà obre conflictes al català.** Les caselles `906` i `247` no existien
   com a problema fins que la fitxa va apuntar bé. És el preu correcte, però cal comptar-lo.
