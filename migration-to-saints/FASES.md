# Fases de la migració al català — full de ruta viu

**Aquest fitxer es marca a mesura que s'avança.** És el full de ruta; el
[PLAN.md](PLAN.md) és la font de veritat de *com funciona* el que ja està construït i el
[REGISTRE-DE-CANVIS.md](../REGISTRE-DE-CANVIS.md) és el mestre de *què s'ha canviat i per
què*. Els tres es llegeixen junts i cap no substitueix els altres.

Està escrit perquè el pugui reprendre **un agent que no hi era**: cada fase diu què s'ha de
tocar, com se sap que està feta, i què queda obert. Si t'hi poses, llegeix primer les regles
de sota i el [CLAUDE.md](../CLAUDE.md) de l'arrel.

---

## Estat d'un cop d'ull

| Fase | Què és | Estat |
|---|---|---|
| **0** | Tancar MIGRA-006 abans d'obrir res més | ✅ **feta** (7-IX-2026) — l'exportació ja no està bloquejada |
| **1** | Tèrcia, Sexta i Nona | ✅ **feta** (7-IX-2026) — 5 de les 7 hores migrades |
| **2** | Completes | ✅ **feta** (7-IX-2026) — 6 de les 7 hores; queda [D-004](decisions/D-004-l-himne-de-completes.md) |
| **3** | Ofici de lectura | ⬜ no començada |
| **4** | Missa (lectures) | ⬜ no començada |
| **—** | Comentaris de la missa | ⛔ **fora d'abast** (decisió, veure sota) |

Cobertura mesurada el **7 de setembre de 2026** (finestra 2017-2026, Barcelona), **després de
la fase 1**, per a comparar-hi les represes futures:

| | |
|---|---|
| Les **5 hores** (Laudes, Tèrcia, Sexta, Nona, Vespres) — ids que l'índex demana | 11.483 |
| ...escrits a `commons/ca` | **10.228 (89,1%)** |
| ...caselles en conflicte al join | **1.313** |
| Univers sencer de `commons/es` | 58.537 ids · català al **17,9%** |
| Completes | **7/7 fitxers**, 114 camps (fora del recompte d'ids: no passa per `day_specific_texts`) |
| Dies de mostra (102 camps, 5 hores) | 12-08 **96%** · 14-08 **86%** · 30-11 **69%** |

Reproduir-ho:

```sh
node migration-to-saints/day-check.js 2026-08-12
make run-panel                                    # el panell, a http://localhost:4848
```

---

## Regles per a qui hi treballi

1. **Tot canvi va al registre mestre**, al mateix torn. Ho diu el
   [CLAUDE.md](../CLAUDE.md) i no és negociable: un fix sense fitxa és un fix que d'aquí a
   tres mesos ningú sabrà d'on surt.
2. **Un error de cpl-app és un `CPL-LIT-NNN`** amb tres peces en un sol commit (fix, test de
   regressió, dossier a `cpl-bugs/`) i el trailer `Cpl-Bug:`. Els de les nostres eines van a
   `tooling-bugs/` i no es comuniquen al client.
3. **El test de regressió és el detector**: ha de fallar sobre la base sense el pedaç. Si no
   falla, no és un detector, és un acompanyament.
4. **No facis servir `cpl-day.test.js`** (control ferial de Vespres trencat, MIGRA-001). Per
   a resoldre dies, `review/resolve-cpl-days.test.js`.
5. **Abans de mesurar la cobertura d'una hora nova, mira quines taules bloquegen el `v-if`
   de la seva pàgina.** És la lliçó de PLAN §10: Laudes, Vespres i Ofici no es pinten si
   l'Invitatori no ha carregat, i el % per dia no ho prediu.
6. **Que sigui l'app qui digui quina casella fa servir**, no l'índex (PLAN §8c/§8d). Qualsevol
   hora nova ha d'entrar a la sonda abans de fiar-se dels seus números.
7. **Marca la casella d'aquest fitxer quan acabis un punt**, i actualitza la taula d'estat i
   les xifres de dalt si canvien.

---

## Fase 0 — Tancar MIGRA-006 · ⬜

**Bloqueja totes les altres fases.** No és una preferència d'ordre: aquell bug *escriu text
equivocat sense registrar cap conflicte*, o sigui que el detector que tenim no el veu. Obrir
quatre hores més multiplica per quatre una escriptura silenciosament dolenta.

Els fets, de la fitxa [MIGRA-006](../REGISTRE-DE-CANVIS.md#migra-006): 22 caselles
actualitzades a l'exportació i **15 són regressions** (Sagrat Cor rebent text del Baptista),
i la casella `salmos_antifonas/9998` **no apareix ni a `join-pending-review.json`**.

- [x] Confirmar o descartar la hipòtesi del `fromFerial`/`entryFromCells` — **descartada**.
      La causa era el salt de Vespres, escrit sobre la F5 («saints-app no té I Vespres»), que
      va deixar de ser certa amb el PR #1694: l'índex duu camps `*_PrimerasVisperas`
- [x] Test de regressió que falli sense el fix — `migration-to-saints/first-vespers.test.js`,
      comprovat per les dues bandes
- [x] Fix + fitxa `MIGRA-006` tancada al registre
- [x] Re-córrer el join i verificar les 15 regressions — **totes 15 retingudes**, 0 canvis
      semàntics de text, i les 228 caselles que deixen d'escriure's passen totes a conflicte
      registrat
- [x] Re-exportar a `saints-app` — i va destapar **52 caselles de I Vespres publicades amb el
      text d'un altre dia**, ara corregides ([SA-10](../REGISTRE-DE-CANVIS.md#sa-10))

**Fet.** L'exportació està desbloquejada.

**Ha quedat obert:** la **F5** de `review/findings.js` afirma que saints-app no té I Vespres, i
ja no és cert. No s'ha enviat mai a en Fernando; s'ha de reescriure o retirar **abans**
d'enviar-la, o li proposaríem una cosa que ja té feta.

---

## Fase 1 — Tèrcia, Sexta i Nona · ⬜

**Per què primer.** És l'ampliació més barata que existeix i, alhora, la prova que la
generalització del join aguanta abans d'apostar-hi fort. `all_tercia.json` té **15 camps,
tots subconjunt dels 20 de Laudes**, i **no estrena cap taula**: van a `himnos`,
`salmos_*`, `lectura_breve_*`, `responsorios` i `oraciones_finales`, les mateixes que ja
gestionem.

Mesurat: **2.622 ids demanats**, dels quals només ~75 ja estan escrits. O sigui que és
**additiu**: gairebé no pot reobrir cap casella tancada del pilot.

| taula | ids que demanen T+S+N | ja a `ca` |
|---|---|---|
| responsorios | 1.180 | 0 |
| lectura_breve_citas | 442 | 0 |
| lectura_breve_textos | 285 | 10 |
| oraciones_finales | 225 | 3 |
| salmos_antifonas | 190 | 4 |
| salmos_citas / salmos_textos | 116 / 116 | 20 / 17 |
| himnos | 67 | 0 |

### Què s'ha de tocar

- [x] **`lib/cpl-day-resolver.js`** — les tres diferències del model de cpl-app viuen aquí, en
      dues funcions que el join **també** crida (`psalmAntiphons`, `responsoryParts`), perquè
      no puguin divergir del flattener:
      - `SpecificHour` penja de `hoursLiturgy.Hours`, no de l'arrel → `hourDataOf()`;
      - el responsori és un parell versicle/resposta (2 ids a l'índex), no sis línies;
      - a una celebració, **una sola antífona** cobreix els tres salms
        (`HasMultipleAntiphons: false` + `UniqueAntiphon`), i les antífones per salm que el
        model encara duu **no són el que es veu a la pantalla**.
      - control ferial: `ObtainHours(masters, dia, new Hours(), settings)`, el mateix camí
        que ja s'usa per a Laudes.
- [x] **`join-content.test.js`** — tres entrades a `HOURS_CONFIG` i a `HOURS_TO_RUN`
- [x] **`app-id-probe.js`** — els stores `Tercia`/`Sexta`/`Nona`. `useRefreshAllStores` ja els
      instancia a cada `setDate()`, i les sentinelles cobreixen totes les taules d'es, o sigui
      que no calia res més
- [x] **`day-check.js`** — `HOUR_FILES` i `ALL_HOURS`, en ordre de resada
      (Laudes · Tèrcia · Sexta · Nona · Vespres)
- [x] **`review/build-report.js`** i **`review/resolve-cpl-days.test.js`**
- [x] **Sense pestanya memòria/fèria** (`dualOffice: false`). Aquí `all_tercia.json` **no**
      es comporta com Laudes: l'store *substitueix el registre sencer* per la fèria
      (`terciaStore.ts`, «Override with ferial if MEMORY_FERIAL») en lloc de dur-ne dos
      darrere d'un selector, i no escriu cap camp `<camp>_Ferial`. La casella mesurada ja és
      la bona i no s'ha de redirigir; tampoc no hi ha segona pestanya per a omplir amb el
      Comú (`lib/common-office.js` només modela Laudes i Vespres)
- [x] Re-córrer sonda + join sencers i apuntar els números nous a la taula d'estat

**Fet.** L'inspector dona un % per a les cinc hores (102 camps per dia en lloc de 57) i la
sonda cobreix els cinc stores.

### Resultat mesurat

| | abans | després |
|---|---|---|
| Tèrcia+Sexta+Nona — dels 2.622 ids que demanen | 56 (2,1%) | **2.147 (81,9%)** |
| caselles escrites pel join | 7.639 | **9.756** (+2.117) |
| caselles en conflicte | 932 | **1.313** (+381) |
| **text ja publicat que canvia** | — | **0** |
| exportació | — | **2.150 claus noves, 0 actualitzades** |

Control abans de res: re-córrer Laudes+Vespres amb el mapa de 5 hores dona **0 textos
canviats i 0 caselles perdudes**. La fase no ha tocat res del que ja estava fet.

Les **33** caselles que deixen d'escriure's passen totes a conflicte registrat: són caselles
que Laudes/Vespres i les hores intermèdies **comparteixen** i sobre les quals discrepen
(p.ex. `lectura_breve_textos/79`, 83 dies). Desacords de veritat, no pèrdues.

**Cua**: aquestes 33 mantenen a `saints-app` el text que hi tenien (l'exportació fusiona, no
esborra). És text que ja no podem justificar amb el pipeline actual — decidir si es treu.

---

## Fase 2 — Completes · ⬜

**L'hora més barata del taulell, i no sortia al PLAN.** Les Completes **no passen per
`day_specific_texts`**: `complineStore.ts` fa
`import('@/store/db/compline/{idioma}/{diaDeLaSetmana}.json')` — **set fitxers per idioma**,
~31 KB en total per a `es`. Ni litcal, ni caselles compartides, ni conflictes possibles.

A cpl-app la font és `salteriComuCompletes` (9 files, 15 columnes: `ant1`, `titol1`, `salm1`,
`gloria1`, `dosSalms`, `ant2`…, `versetLB`, `lecturaBreu`, `oraFi`) i el model és
`src/Models/HoursLiturgy/NightPrayer.tsx`, que a més té l'himne, el responsori breu,
l'antífona evangèlica, l'acte penitencial i les cinc antífones finals de la Mare de Déu.

Val la pena fer-la aquí perquè és **la que et dona un dia complet de veritat a l'app**, que
és el que fa canviar la conversa amb en Fernando.

- [x] Comparar camp a camp `compline/es/{1..7}.json` amb `NightPrayer` i documentar el mapatge
      → [PLAN §16](PLAN.md). Els dos models **coincideixen 1:1** en els set fitxers, saltiri
      inclòs (Sl 90 / 85 / 142,1-11 / 30,2-6 + 129 / 15 / 87 / 4 + 133), i **també en la regla
      de la vigília de solemnitat** (cpl-app la resol sol, saints-app a `dayWhenSpecialDays`)
- [x] Decidir què es fa amb el que cpl-app té i `es` no, o a l'inrevés → hi ha **una**
      discrepància i és de model, no de text: [D-004](decisions/D-004-l-himne-de-completes.md)
- [x] Generar `compline/ca/{1..7}.json` — `migration-to-saints/compline.extract.test.js`
- [x] Obrir la `ComplinePage` en català i verificar-la — fet contra l'app real (Chrome
      headless + `selectedLanguage=ca`): capçalera, himne, salm, antífona, lectura breu,
      responsori i oració final surten tots en català
- [x] Fitxa al registre mestre ([EINA-completes](../REGISTRE-DE-CANVIS.md#eina-completes),
      [SA-12](../REGISTRE-DE-CANVIS.md#sa-12))

**Fet.** Les Completes es llegeixen senceres en català a l'app.

### El que ha sortit

Cap conflicte, com estava previst: **7 fitxers, 114 camps**, mateixa forma exacta que el
castellà (16/15/15/18/16/15/19 camps). No hi ha espai d'ids compartits, o sigui que no hi ha
res a retenir ni a revisar.

D'on surt cada cosa:

| | font |
|---|---|
| Salms, antífones, lectura breu, responsori, antífona del càntic, oració final | cpl-app, resolt amb els seus *Services* sobre una setmana ordinària neta (2026-09-06..12) |
| `responsorio_pascua`, `antifona_inalbis`, `antifona_triduo` | cpl-app en dates representatives (feria de Pasqua, octava, Dissabte Sant). Els tres són iguals als set fitxers, com a `es` |
| `himno_latino`, `idd`, `slug` | còpia d'`es` — el llatí no depèn de l'idioma de l'app |
| `oracion` (la capçalera) | traduït a mà, `static-translations/compline_oracion.ca.json` |

**L'única cosa oberta és [D-004](decisions/D-004-l-himne-de-completes.md)**: cpl-app té **2**
himnes de Completes (per temporada) i saints-app en vol **7** (per dia de la setmana).
`salteriComuCompletes` no té cap columna d'himne. De moment s'escriu el del Temps Ordinari als
set fitxers —és el que cpl-app resa i evita deixar la casella buida—, però en català es veurà
el mateix himne cada nit mentre es/it en mostren set. La sortida recomanada és transcriure'ls
del volum imprès; és decisió d'en Pau.

**Compte:** aquesta fase **no** entra al càlcul de cobertura del panell, que va per ids de
`day_specific_texts`. Si es vol que hi surti, s'ha de decidir a part com es compta.

---

## Fase 3 — Ofici de lectura · ⬜

**Fase pròpia, sense encavalcar-la amb res.** Ella sola és **1,6× tot el pilot**: 14.534 ids
demanats contra els 8.925 de Laudes+Vespres, dominats per `responsorios` (6.988) i les tres
taules noves `oficio_citas` / `oficio_textos` / `oficio_titulos` (2.175 cadascuna, totes a 0%).

La font a cpl-app hi és sencera: `tempsOrdinariOfici` (238 files: `referencia1/cita1/titol1/
lectura1` bíblica + `referencia2/cita2/titol2/lectura2` patrística, cada una amb el seu
responsori de tres parts), i les columnes `*Ofici` de `santsMemories` i `santsSolemnitats`.

### El pas de descoberta va primer

- [ ] **Què és el sufix `_a` / `_i` / `_p`.** Els camps de `all_oficio.json` van amb aquests
      tres sufixos i **255 de 495 claus tenen els tres valors diferents** — o sigui que no és
      «un és el genèric i els altres dos la variant». cpl-app té `paroimpar` I/II (dos anys),
      no tres. **Fins que això no se sàpiga, no es pot mapar res.** Provable comparant, per a
      una clau concreta, què dona `commons/es` a cadascun dels tres contra el que cpl-app dona
      els anys parells i senars.
- [ ] **El quart salm.** `Office` de cpl-app té `FirstPsalm`…`FourthPsalm`; l'índex només en
      té tres. Decidir què se'n fa i deixar-ho escrit.
- [ ] **Els responsoris.** `ReadingOfTheOffice` porta el seu propi `ShortResponsory` per
      lectura; l'índex té `responsorio1` i `responsorio2_{a,i,p}` / `responsorio3_{a,i,p}`.
      Confirmar l'aparellament abans d'escriure.
- [ ] **El Te Deum** (`TeDeumInformation`) — mirar si l'índex el contempla o si viu als
      `generic_texts`.

### Després

- [ ] Mapatge de camps documentat al PLAN, com el §5 de Laudes
- [ ] `HOURS_CONFIG` + sonda (`defineStore("Office")`, `contentByDay`) + inspector + comparador
- [ ] Join, classificació dels conflictes nous, i números a la taula d'estat

**Fet quan:** l'Ofici té % a l'inspector i els seus conflictes són a la cua de revisió.

---

## Fase 4 — Missa: les lectures · ⬜

**Última, i com a decisió separada.** Tècnicament és fer-ho; el que la frena no és el codi.

La font hi és sencera i és millor del que semblava: `LDdiumenges` (**674 files** — diumenges
amb `Cicle` A/B/C **i fèries** amb `paroimpar` I/II, 209 de cada) i `LDSantoral` (249), amb
primera lectura, salm, segona, al·leluia i evangeli, cada un amb cita, títol i **text sencer**
en català. El model és `src/Models/MassLiturgy.tsx`.

I `all_lectures.json` és **l'únic índex de saints-app que ja fa servir cicles de debò**
(`YEAR_A`/`YEAR_B`/`YEAR_C` i `ODD`/`EVEN`) — o sigui que aquí el problema del grup A de
PLAN §6c no existeix: el cicle és explícit. Rols: `FIRSTLECTURE`, `PSALM`, `SECONDLECTURE`,
`ACCLAMATION`, `GOSPEL`, més els `CELEBRATION_*` i `ALTERNATIVE_*`. Ids: ~2.882 de
`lecturas_referencia` i ~2.683 de `lecturas_texto`.

- [x] ~~Preguntar al client pels drets del leccionari~~ — **resolt**: l'editorial CPL en té els
      drets i proporciona el contingut a la BD. La fase no està bloquejada per aquí.
- [ ] Mapatge de rols (`FIRSTLECTURE`/`PSALM`/… ↔ `Lectura1`/`Salm`/`Evangeli`…) i de cicles
      (`Cicle` A/B/C ↔ `YEAR_*`, `paroimpar` I/II ↔ `ODD`/`EVEN`)
- [ ] Decidir què es fa amb la Vetlla Pasqual (cpl-app hi té set lectures i set salms
      hardcodejats a `MassLiturgyService.tsx`, i l'índex té `THIRDLECTURE`…`EIGHTHLECTURE`)
- [ ] Sonda, join, cobertura

**Fet quan:** les lectures de la missa es llegeixen en català i el client ha dit que sí.

---

## Fora d'abast — Els comentaris de la missa · ⛔

**Decidit el 7 de setembre de 2026: queda fora del català, de moment.**

Els 4.145 refs de `comentarios_contenido` / `comentarios_referencias` / `comentarios_fuentes`
**no són contingut litúrgic i no tenen cap origen a `cpl-app.db`**. Són comentaris editorials
de tercers que eprex té llicenciats en castellà: Dominicos.org, Opus Dei, Evangeli.net,
vídeos de Mons. Munilla i del P. Higueras.

El camp `Comment` de `MassReading` a cpl-app **no és això**: és l'epígraf de la lectura («Déu
veié tot el que havia fet, i era bo de debò»), que va a `Lectura1Cita`. No hi ha res a migrar.

Aconseguir-los en català seria una **adquisició de contingut**, no una migració, i és d'en
Fernando i del client. Si algun dia es reobre, el punt de partida és que Evangeli.net és
català d'origen — però això no ho decidim nosaltres.

---

## Preguntes obertes

| # | Pregunta | Per a qui | Bloqueja |
|---|---|---|---|
| ~~P-1~~ | ~~Drets del leccionari català~~ — **resolta el 7-IX-2026**: l'editorial CPL en té els drets i és qui proporciona tot el contingut a `cpl-app.db`. No bloqueja la fase 4 | — | — |
| P-2 | Què és el sufix `_a`/`_i`/`_p` de `all_oficio.json` | descoberta tècnica | Fase 3 |
| P-7 | La **F5** (`review/findings.js`) diu que saints-app no té I Vespres. Va deixar de ser cert amb el PR #1694 (camps `*_PrimerasVisperas`). Reescriure-la o retirar-la abans d'enviar-la | nostre | enviar la F5 |
| P-3 | Els noms dels dies ferials segueixen sortint en anglès (PLAN §10.2): d'on es generen | decisió | — |
| P-4 | `dailySaints/ca/` no existeix → la targeta «Sant del dia» peta | decisió d'abast | — |
| P-5 | La fuita `" salterio"` de `DateAndLiturgicalDay.vue:57` (PLAN §10.3) | saints-app | — |
| P-6 | Els 602 conflictes vius: seguir el conveni d'ES o encunyar ids nous (PLAN §8b) | editorial | — |

---

## Bitàcola

Una línia per sessió, la més nova a dalt. Serveix perquè el proper agent sàpiga on es va
quedar l'anterior sense haver de llegir el git.

| Data | Qui | Què s'ha fet |
|---|---|---|
| 2026-09-07 | Claude | **Fase 2 feta.** Completes en català (7 fitxers), verificada a l'app real. Oberta la D-004: cpl-app té 2 himnes de Completes i saints-app en vol 7 |
| 2026-09-07 | Claude | **Fase 1 feta.** Tèrcia, Sexta i Nona migrades: del 2,1% al 81,9% dels seus ids. 0 canvis al text ja publicat. Sonda i join re-correguts sobre els 10 anys, exportat |
| 2026-09-07 | Claude | **Fase 0 feta.** MIGRA-006 diagnosticat (no era la hipòtesi de la fitxa), corregit, amb detector. Join i exportació refets: 52 caselles de I Vespres corregides a saints-app. Obert: reescriure la F5 |
| 2026-09-07 | Claude | Anàlisi d'abast i creació d'aquest fitxer. Cap canvi de codi ni de dades |
