# CPL-LIT-007 — A les hores menors de les festes, l'antífona del comú en lloc de la de la fèria

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | cpl-app · Tèrcia, Sexta i Nona de les festes dels sants |
| **Gravetat** | Mitjana — el text és d'una altra celebració, no hi falta res; unes 25 festes l'any per a tothom i unes 20 de locals |
| **Trobat** | 27 de novembre de 2025: la CPL ho va enviar en un full de càlcul amb quatre festes d'exemple. Verificat amb Jest el 5 d'octubre de 2026 |
| **Correcció** | **Codi**: `src/services/liturgy/celebrationHoursLiturgyService.ts` (`fillMinorHours`, `getSaintsSolemnitiesHoursLiturgy`) |
| **Regressió** | `__tests__/liturgy/feastMinorHours.test.js` |

## Símptoma

En una festa (no en una solemnitat) que no té antífones pròpies per a les hores menors, l'app posava a Tèrcia,
Sexta i Nona les antífones del comú de la festa. Les quatre festes del full de la CPL:

| dia | lloc | festa | cpl-app (incorrecte) | correcte |
|---|---|---|---|---|
| 27-11-2025 | Mallorca | Beat Ramon Llull | «El Senyor el (la) va posar en un combat difícil…», «El Senyor li donà la corona merescuda…», «Sortien a sembrar tot plorant…» | les dels salms del dijous: «M'estimo més, Senyor, la llei dels vostres llavis…», «Confio en Déu…», «El vostre amor, Senyor, arriba fins al cel» |
| 9-3-2026 | Barcelona (catedral) | Sant Pacià | «Pare, jo els he enviat al món…», «Qui us acull a vosaltres…», «Nosaltres treballem en l'obra de Déu…» | les de Quaresma: «Aquests són dies de penediment…», «Diu el Senyor: No desitjo la mort del pecador…», «Pel poder que Déu ens dóna…» |
| 14-5-2025 | tothom | Sant Maties | «Aneu, prediqueu la Bona Nova del Regne…, al·leluia», «Jo seré amb vosaltres…», «Sofrint amb constància…» | «Al·leluia, al·leluia, al·leluia» |
| 10-12-2025 | Terrassa (diòcesi) | Dedicació de la Catedral | «El temple del Senyor és sagrat…», «La santedat, Senyor…», «Aquesta és la casa del Senyor…» | les d'Advent: «Els profetes van predir…», «L'àngel Gabriel va saludar Maria…», «Respongué Maria…» |

## Causa

És un **error de codi**. Les festes i les solemnitats dels sants passen per la mateixa funció, i a les hores
menors totes dues agafaven del comú el que el sant no té: la lectura breu, el responsori i **l'antífona**. A les
solemnitats és correcte; a les festes, l'antífona no ho és.

L'OGLH 232 ho diu així: a la Hora intermèdia de les festes, «psalmi cum suis antiphonis dicuntur de feria, nisi ad
Horam mediam ratio peculiaris vel traditio requirat, ut antiphona propria dicatur, quod suo loco indicabitur.
Lectio brevis et oratio conclusiva sunt propriæ». O sigui: els salms del dia **amb les seves antífones**, llevat
que el llibre doni una antífona pròpia a la festa mateixa; la lectura breu i l'oració, de la festa.

La base de dades ja fa aquesta distinció: les festes que tenen antífona pròpia a les hores menors la duen a
`antMenorTercia`, `antMenorSexta` i `antMenorNona` (la Conversió de sant Pau, la Transfiguració, el Naixement de la
Mare de Déu, l'Exaltació de la Santa Creu, la Mercè, els Arcàngels, Jesucrist gran sacerdot i els dies de l'octava
de Nadal), i les altres hi tenen «-».

## Abast

Les festes sense antífona pròpia que tenen comú amb antífones d'hores menors (les altres ja sortien bé):

- **Per a tothom**: Ciril i Metodi (14-2), Marc (25-4), Isidor (26-4), Caterina de Siena (29-4), Felip i Jaume (3-5),
  Maties (14-5), Visitació (31-5), Tomàs (3-7), Benet (11-7), Maria Magdalena (22-7), Brígida (23-7), Teresa Beneta
  de la Creu (9-8), Llorenç (10-8), Bartomeu (24-8), Mateu (21-9), Pilar (12-10), Teresa de Jesús (15-10), Lluc
  (18-10), Simó i Judes (28-10), Dedicació del Laterà (9-11), Andreu (30-11).
- **Locals**: Fructuós (21-1, totes les diòcesis catalanes), les dedicacions de les catedrals a la seva diòcesi
  (Tortosa, Menorca, Sant Feliu, Lleida, Tarragona, Vic, Girona, Mallorca, Urgell, Solsona, Barcelona, Terrassa),
  Feliu (1-8) i Narcís (29-10) a Girona, Mateu (22-9) a Girona, Oleguer (6-3), Pacià (9-3), Felip i Jaume (4-5) i
  Sever (6-11) a la catedral de Barcelona, i Catalina Thomàs (28-7), la Mare de Déu de Lluc (12-9) i Ramon Llull
  (27-11) a Mallorca.

Quan cauen en diumenge no es celebren i no hi ha res a canviar. Els propers dies afectats: 12-10-2026 (Pilar),
15-10 (Teresa de Jesús), 23-10 (Dedicació d'Urgell), 28-10 (Simó i Judes), 29-10 (Narcís, Girona), 6-11 (Sever,
catedral de Barcelona), 9-11 (Laterà), 10-11 (Dedicació de Solsona), 18-11 (Dedicació de Barcelona), 27-11 (Ramon
Llull, Mallorca), 30-11 (Andreu) i 10-12 (Dedicació de Terrassa).

## Correcció

A les festes dels sants, l'antífona de Tèrcia, Sexta i Nona és la pròpia si la festa en té; si no, no se'n posa
cap i les hores fan servir la de la fèria, com qualsevol dia (`hoursService`): en temps ordinari, una antífona per
a cada salm del dia; a Advent, Quaresma i Pasqua, la del temps. Les solemnitats continuen agafant-la del comú, i la
lectura breu i el responsori de les festes també.

### Verificació

- La norma: OGLH 232, text llatí a <https://breviar.sk/la/docs/smernice_lh.htm> (paràgraf 232).
- La CPL mateixa, al full de càlcul del 27-11-2025: per a cada festa, la primera fila és el que sortia a l'app i
  la segona, el que hi ha de sortir; la segona fila és, paraula per paraula, el que l'app resa aquell dia sense la
  festa.
- `__tests__/liturgy/feastMinorHours.test.js`, amb els serveis reals de l'app i la BD que porta: les quatre festes
  de la CPL (sense la correcció, fallen totes quatre), una festa amb antífona pròpia (la Santa Creu, que la
  conserva) i una solemnitat (la Dedicació a la catedral de Terrassa, que conserva la del comú).
- Les proves que recorren tots els dies del 2025 i del 2026 (els goldens) canvien en 31 dies, tots festes de la
  llista de dalt, i només en les antífones de Tèrcia, Sexta i Nona.

## Efecte sobre la migració

A les hores menors d'aquestes festes, cpl-app diu ara el mateix que l'app de saints-app llegeix (la fèria): les
caselles que el join es deixava d'observar per aquest motiu (MIGRA-009) ja no hi entren en conflicte.

I toca l'[EPREX-005](../eprex-bugs/EPREX-005.md): allà es va demanar que la festa no perdés la seva antífona a les
hores menors, per a 513 dies («gairebé totes les festes i memòries amb ofici propi»). Segons l'OGLH 232 i la CPL,
només l'han de conservar les festes que tenen antífona **pròpia**; les que l'agafarien del comú, i les memòries
(OGLH 236: «nihil fit de Sancto, sed totum de feria»), hi han de tenir la de la fèria.

## Pendent, a part

A la catedral de Terrassa, el 10-12 és solemnitat: l'antífona del comú hi és correcta, però els salms surten de la
fèria (el Salm 118) i no dels graduals, com mana l'OGLH 229 i com fan les solemnitats de tothom. No és d'aquest
error; cal mirar-ho amb el volum.
