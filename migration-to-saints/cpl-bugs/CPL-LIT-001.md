# CPL-LIT-001 — La salmòdia de Laudes del Dimecres de Cendra

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | cpl-app · Laudes · salmòdia |
| **Gravetat** | Alta — text litúrgic incorrecte, tots els anys, per a tots els usuaris |
| **Trobat** | 14 d'agost de 2026, comparant cpl-app amb saints-app (eprex) al panell de migració |
| **Correcció** | `src/Services/Liturgy/LiturgyMastersService.tsx`, funció `ObtainLaudesCommonPsalter` |
| **Regressió** | `__tests__/Services/AshWednesdayLaudesPsalmody.test.js` |

## Símptoma

A Laudes del Dimecres de Cendra, cpl-app mostra **el Salm 107** com a primer salm. Hi hauria
d'anar **el Salm 50** (el *Miserere*). No és un salm aïllat: tot el trio és equivocat.

| slot | cpl-app (incorrecte) | correcte |
|---|---|---|
| 1r | Salm 107 «El meu cor se sent segur» | **Salm 50** «Compadiu-vos de mi, Déu meu» |
| 2n | Càntic Is 61,10—62,5 | **Càntic Jr 14,17-21** |
| 3r | Salm 145 | **Salm 99** |

Passa **tots els anys**. Verificat als 10 anys que cobreix la base de dades: 2017-03-01,
2018-02-14, 2019-03-06, 2020-02-26, 2021-02-17, 2022-03-02, 2023-02-22, 2024-02-14,
2025-03-05 i 2026-02-18.

## Causa

La Quaresma comença a mitja setmana. Com que la setmana I del salteri queda reservada per al
diumenge I de Quaresma, els quatre dies previs es reparteixen entre les setmanes III i IV, i
**Laudes del Dimecres de Cendra pren la salmòdia penitencial del divendres de la setmana III**.
La resta del dia (Ofici de lectura, Vespres) i els tres dies següents sí que van amb la
setmana IV.

cpl-app no tenia aquesta excepció:

1. La taula `tempsQuaresmaCendra` de `cpl-app.db` — les 4 files del bloc de Cendra — **no té
   cap columna de salmòdia**. Porta lectures, responsoris, antífona de Zacaries, pregàries i
   oració final, però cap salm. Comparada amb `tempsQuaresmaTridu`, que sí que té
   `salm1Laudes`/`salm2Laudes`/`salm3Laudes`, es veu que és un forat de dades, no una decisió.
2. Sense res que ho sobreescrigui, `ObtainLaudesCommonPsalter` calculava la fila del salteri
   amb `id = (setmana - 1) * 7 + (dia + 1)`, que per a Cendra dona la fila 25 —
   **dimecres de la setmana IV**. La fila que tocava és la 20, divendres de la setmana III.

El text correcte ja era dins de `cpl-app.db`, en català, a `salteriComuLaudes` fila 20. No hi
mancava contingut: només hi mancava el camí.

## Abast exacte

cpl-app **sí** que força la setmana IV per al bloc de Cendra — el dijous, divendres i dissabte
següents surten correctes els 10 anys. L'error és d'un sol dia i d'una sola hora:

| dia | rúbrica | cpl-app abans |
|---|---|---|
| **Dimecres de Cendra, Laudes** | **divendres setmana III** | dimecres setmana IV ❌ |
| Dimecres de Cendra, Vespres | setmana IV | setmana IV ✅ |
| dijous / divendres / dissabte següents | setmana IV | setmana IV ✅ |

## Verificació externa

Tres fonts independents, en tres idiomes, coincideixen amb el trio Salm 50 / Jr 14,17-21 /
Salm 99 (numeració vulgata; en numeració hebrea, Ps 51 / Jr 14 / Ps 100):

- **Litúrgia de les Hores en anglès**, *Ash Wednesday — Morning Prayer*:
  Psalm 51 · Canticle Jeremiah 14:17-21 · Psalm 100.
  <https://www.liturgies.net/Liturgies/Catholic/loh/lent/ashwednesdaymp.htm>
- **Liturgia de las Horas en castellà, data exacta 2026-02-18** (*Miércoles de Ceniza*):
  Salmo 50 «Misericordia, Dios mío» · Cántico Jer 14,17-21 · Salmo 99 «Aclama al Señor,
  tierra entera».
  <https://apps.idteologia.org/index.php?fecha=2026-02-18&r=liturgiaDeLasHoras%2Fespanola&rezo=laudes>
- **La rúbrica explicada**: *«Para las Laudes y vísperas del miércoles: salmos de las Laudes
  de la III semana»*, amb el motiu (la Quaresma comença a mitja setmana i la setmana I es
  reserva per al diumenge I).
  <https://www.eltestigofiel.org/index.php?idu=pr_20105>

Contraverificació de les Vespres, que **no** canvien: la mateixa font, per al 2026-02-18,
etiqueta el dia «Miércoles de Ceniza (4ª semana)» i dona Salm 138 + Càntic Col 1,12-20 —
exactament el que cpl-app ja feia.
<https://apps.idteologia.org/index.php?fecha=2026-02-18&r=liturgiaDeLasHoras%2Fespanola&rezo=visperas>

Comprovació creuada del text català: `liturgiadeleshores.cat` només serveix el dia en curs, i
el 14 d'agost de 2026 tocava justament divendres de la setmana III. La salmòdia que dona
—«Compadiu-vos de mi, Déu meu» / «Que es fonguin en llàgrimes els meus ulls» / «Aclameu el
Senyor, arreu de la terra»— és paraula per paraula la fila 20 de `salteriComuLaudes`.

## Correcció

A `ObtainLaudesCommonPsalter`, seguint el patró que ja hi havia per a solemnitats, festes i la
Sagrada Família, s'hi afegeix l'excepció del Dimecres de Cendra: `weekCycle = 3`,
`dayNumber = 5` (divendres de la setmana III, fila 20).

El test de regressió cobreix els 10 Dimecres de Cendra i, com a control, el dijous següent
(que ha de continuar a la setmana IV) i el Divendres Sant (que arriba al mateix Salm 50 per un
camí diferent: el propi explícit de `tempsQuaresmaTridu`, divendres de la setmana II). Sense
la correcció, 10 dels 13 casos fallen; els 3 controls passen igualment.

## Efecte secundari sobre la migració al saints-app

Les 10 observacions incorrectes contaminaven caselles compartides amb desenes d'altres
celebracions, i les bloquejaven totes: com que cpl-app hi calculava dos textos diferents, el
join no podia escriure'n cap i els dies afectats sortien buits a l'app.

| casella | dies bloquejats |
|---|---|
| `salmos_textos/73` | 329 |
| `salmos_citas/74` · `salmos_textos/75` | 167 cadascuna |
| `salmos_citas/73` · `salmos_textos/74` | 88 cadascuna |
| `salmos_antifonas/71` · `/72` · `/73` | 65 cadascuna |

Amb la correcció, aquestes 8 caselles queden unànimes i es migren soles: **1.034
observacions-dia desbloquejades** (pendents del join: 3.044 → 3.036).

Nota: `preces_intro/1265` també discrepa el Dimecres de Cendra, però a **Vespres** i en el
text de les pregàries, no en la salmòdia. És un cas independent i continua pendent.
