# EPREX-001 — El 2 de novembre, saints-app resa el diumenge en comptes de l'Ofici de Difunts

| | |
|---|---|
| **Estat** | **Proposat** — enviat a en Fernando el 3 de setembre de 2026, pendent de resposta |
| **Component** | saints-app · `day_specific_texts/all_visperas.json` i `all_laudes.json` |
| **Gravetat** | Alta — un dia gran, i afecta **totes** les llengües de l'app, castellà inclòs |
| **Trobat** | 2-3 de setembre de 2026, investigant per què `salmos_citas/11025` quedava retinguda al join |
| **De qui és** | **d'eprex**, no de cpl-app ni de les nostres eines (veredicte 2) |
| **Correcció** | Cap encara. És repunteig d'ids: no cal contingut nou |

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

## Dos serrells que són NOSTRES, no d'eprex

Deliberadament fora del missatge a en Fernando: són conseqüències per a la migració catalana.

1. **La tercera antífona de Laudes no diu el mateix a les dues edicions.** El castellà porta
   «Alabaré al Señor mientras viva» (Sl 145, 2a) i el català «Beneiré el vostre nom per
   sempre». No és cap error: cada edició va triar-ne una. Però vol dir que la casella `247` no
   quadrarà pel canal C2.
2. **`salmos_antifonas/906` ja té text català i no és el del 2 de novembre.** Ara diu «Senyor,
   deslliureu-me de la terra dels morts», heretat del dissabte d'Advent i del Dissabte Sant,
   que la comparteixen; el 2 de novembre cpl-app diu «Guardeu-me, Senyor, del poder de la
   mort». Si eprex hi reapunta els Difunts, **el join veurà dos textos i retindrà la casella**.
   Arreglar-ho per al castellà ens obrirà un conflicte nou al català. No és motiu per no
   fer-ho, però cal saber-ho.

## Què cal fer quan en Fernando respongui

- **Si diu que sí**: preparar el canvi als dos `all_*.json`, i **tornar a passar la sonda**
  (`app-id-probe.js` / `celebration-probe.test.js`) abans del join — el join escriu on la sonda
  diu que l'app llegeix, no on ho diu l'índex. Després, re-córrer el join.
- **Si diu que hi ha un criteri** que ho justifica: tancar aquest dossier com a **veredicte 4**
  (no és error) i deixar-hi escrit quin és el criteri, que serà útil per a la resta de
  celebracions que prenen ofici propi.
