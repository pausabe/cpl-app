# MIGRA-016 — La sonda llegia hores que saints-app encara no havia carregat per al dia

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | Eines de migració · `migration-to-saints/app-id-probe.js` |
| **Gravetat** | **Alta**: la sonda és qui diu quina casella llegeix l'app, i el join escriu on diu la sonda |
| **Trobat** | 29 de setembre de 2026, la primera sonda després de portar `dev` a saints-app |
| **Correcció** | `PROBE` demana cada hora per a la data (`changeDay`) i l'espera, i la pàgina no té temps d'inactivitat |
| **Regressió** | Mostra de la sonda: l'11-3-2017 Laudes han de ser les del dissabte I de Quaresma (`himnos/93`), no les dels arcàngels (`himnos/502`) |

## El fet

Amb saints-app a `dev` del 28-9, la sonda deia que l'11-3-2017 (dissabte I de Quaresma) Laudes
llegeix l'himne dels arcàngels Miquel, Gabriel i Rafael i el Salm 62, quan l'índex de la mateixa
app diu `lent_1_saturday`. Els dies de 2017 que canviaven de casella eren 227, contra uns 95 a
cada un dels altres anys, i el join en treia 313 caselles en conflicte noves.

El 29 de setembre és la festa dels arcàngels: era el dia que l'app carrega en arrencar.

## La causa

`dev` va canviar com saints-app refresca les hores quan canvia la data (`useRefreshAllStores`,
«refine init load performance»):

- `setDate` només espera les hores que algú ha obert en aquesta sessió; la resta es carreguen
  d'una en una quan el navegador està inactiu (`requestIdleCallback`).
- `ensureHourLoaded` desduplica per hora, no per data: si una hora té una càrrega pendent d'un
  altre dia, torna aquella i no carrega la nova.

La sonda feia `setDate` i llegia `contentByDay` de cada store: moltes hores encara tenien el dia
anterior, i la primera, el d'avui.

## La correcció

- `PROBE` demana cada hora per a la data, una darrere l'altra, i n'espera la càrrega abans de
  llegir res (`s.changeDay(when)`).
- La pàgina de la sonda no té temps d'inactivitat (`requestIdleCallback` no fa res): cap càrrega
  en segon pla d'un dia anterior no pot arribar després i tornar a posar-lo al store.

Amb això, la sonda torna a donar el mateix que l'índex en els dies que no tenen cap particularitat,
i els 2017 deixen de destacar.

## Per a en Fernando

La desduplicació per hora sense data també afecta l'usuari: si canvia de dia mentre una hora encara
s'està carregant, aquella hora pot quedar amb el dia d'abans.
