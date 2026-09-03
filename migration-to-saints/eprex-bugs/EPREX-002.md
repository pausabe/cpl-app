# EPREX-002 — El 31 de maig, saints-app resa a Vespres les I Vespres de l'Ascensió en comptes de l'ofici de la Visitació

| | |
|---|---|
| **Estat** | **Proposat** — pendent d'enviar |
| **Component** | saints-app · `day_specific_texts/all_visperas.json`, entrada `visitation_of_mary__ANY` |
| **Gravetat** | Alta — una festa del calendari general, i afecta **totes les llengües**, castellà inclòs |
| **Trobat** | 3 de setembre de 2026, investigant per què les tres caselles del 3r càntic de Vespres del dijous quedaven retingudes al join |
| **Verificat contra** | `origin/dev` a 3-09-2026, **després** del refactor de Primeres Vespres (PR #1694). El defecte hi és igual: l'entrada no ha canviat gens |
| **De qui és** | **d'eprex**, no de cpl-app ni de les nostres eines (veredicte 2) |
| **Correcció** | Cap encara. És repunteig d'ids; només dues antífones demanen contingut nou |

## Símptoma

A la Visitació de la Benaurada Verge Maria (31 de maig), les Vespres de saints-app són **les I
Vespres de l'Ascensió del Senyor**.

Això, des del PR #1694, ho diuen les dades mateixes. El refactor va treure el sufix `_1v` de
l'identificador i va passar les I Vespres a camps `*_PrimerasVisperas` dins de l'entrada de la
pròpia celebració. Doncs bé: **16 dels 20 camps de `visitation_of_mary__ANY` són, id per id,
els `*_PrimerasVisperas` de `ascension_of_the_lord__ANY`**.

```
ascension_of_the_lord__ANY                              visitation_of_mary__ANY
  himno_PrimerasVisperas                    3835          himno                    3835
  primer_salmo_cita_PrimerasVisperas       11031          primer_salmo_cita       11031
  primer_salmo_antifona_PrimerasVisperas   10271          primer_salmo_antifona   10271
  segundo_salmo_cita_PrimerasVisperas        152          segundo_salmo_cita        152
  tercer_salmo_cita_PrimerasVisperas       11030          tercer_salmo_cita       11030
  lectura_biblica_cita_PrimerasVisperas     3695          lectura_biblica_cita     3695
  cantico_evangelico_antifona_PrimerasVisperas 1443       cantico_evangelico_antifona 1443
                                                      … i 9 camps més, tots iguals
```

Els quatre que no coincideixen són `himno_latino`, `responsorios`, `preces_contenido` i
`oracion_final`. I dels quatre, el respons (`responsorios/15817`: «Dios asciende entre
aclamaciones. Aleluya») i els precs (`preces_contenido/6188`: «Oh Rey de la gloria… elevándola
hasta las alturas del cielo») **també són de l'Ascensió**, amb ids diferents. **L'única peça
pròpia de la festa és l'oració final** (`oraciones_finales/408`, «…el deseo de visitar a su
prima Isabel»).

| | eprex mostra (casella) | cpl-app resa |
|---|---|---|
| **Himne** | «¿Y dejas, Pastor santo…» · `himnos/3835` | el de la Visitació |
| **1r salm** | Salmo 112 · `salmos_citas/11031` | Salm 121 |
| **Ant. 1** | «Salí del Padre y he venido al mundo… Aleluya» · `salmos_antifonas/10271` | «Maria entrà a casa de Zacaries i saludà Elisabet» |
| **2n salm** | Salmo 116 · `salmos_citas/152` | Salm 126 |
| **Ant. 2** | «El Señor Jesús… subió al cielo. Aleluya» · `/10272` | «Així que he sentit la teva salutació, el nen ha saltat d'entusiasme…» |
| **Càntic** | Ap 11, 17-18; 12, 10b-12a · `salmos_citas/11030` | Ef 1, 3-10 |
| **Ant. 3** | «Nadie ha subido al cielo… Aleluya» · `/10273` | «Ets beneïda entre les dones i és beneït el fruit de les teves entranyes» |
| **Lectura breu** | Ef 2, 4-6 · `lectura_breve_citas/3695` | — |
| **Ant. Magníficat** | «Padre, he manifestado tu nombre… Aleluya» · `1443` | «Totes les generacions em diran benaurada…» |

## La prova

Quatre peces, i cap no demana discutir de litúrgia:

1. **La fitxa és, declaradament, la de les I Vespres de l'Ascensió** — el quadre de dalt. I la
   Visitació és una **festa**, que no en té, de I Vespres. Que hi caigui no s'explica per cap
   regla: cap dels 8 anys del manifest en què cpl-app celebra la festa és una Ascensió. El
   2018 va ser el 10 de maig, el 2019 el 30, el 2021 el 13.

2. **Les germanes marianes ja apunten a la casella bona.** A `dev`, l'Assumpció, la Immaculada,
   la Nativitat de Maria i la Mare de Déu dels Dolors fan servir totes quatre les mateixes tres
   caselles de salms —el Comú de la Mare de Déu— amb antífones pròpies de cadascuna:

   | | les quatre marianes | Visitació |
   |---|---|---|
   | `primer_salmo_cita` / `_texto` | `4577` / `4578` — Salm 121 | `11031` / `11032` — Salmo 112 |
   | `segundo_salmo_cita` / `_texto` | `3424` / `3425` — Salm 126 | `152` / `153` — Salmo 116 |
   | `tercer_salmo_cita` / `_texto` | `11042` / `11043` — Ef 1, 3-10 | `11030` / `11031` — Ap 11 |

   La Visitació és **l'única festa mariana** que no hi apunta. I la salmòdia bona és, salm per
   salm, la que cpl-app resa els sis anys en què observa la festa.

3. **Al·leluia fora de temps.** Les tres antífones acaben en «Aleluya». El 31 de maig de 2024,
   de 2022 i de 2021 ja era temps ordinari (Pentecosta va ser el 19 de maig, el 5 de juny i el
   23 de maig). Un Al·leluia allà no s'aguanta en cap edició.

4. **Les antífones bones ja hi són, i estan òrfenes.** A `commons/es/salmos_antifonas.json`:

   | id | text | referències als deu `all_*.json` de `dev` |
   |---|---|---|
   | `11021` | «María entró en casa de Zacarías y saludó a Isabel. Aleluya.» | **cap** |
   | `840` | «Bendita tú entre las mujeres, y bendito el fruto de tu vientre. Aleluya.» | **cap** |

   Són, literalment, la 1a i la 3a antífona de Vespres que cpl-app resa el 31 de maig. El
   contingut va entrar a la base i l'índex no hi va anar mai. **És la mateixa signatura que
   [EPREX-001](EPREX-001.md)**, on les tres antífones de Vespres de l'Ofici de Difunts
   (`10964`, `10965`, `10966`) també eren òrfenes.

## L'abast: només Vespres

Laudes del 31 de maig **és correcte i propi de la Visitació**, també a `dev`: himne «Y salta el
pequeño Juan en el seno de Isabel» (`himnos/410`), antífona 1a «María se puso en camino y fue
aprisa a la montaña» (`salmos_antifonas/1085`), lectura Jl 2, 27-3, 1 (`lectura_breve_citas/406`)
i antífona del Benedictus «Cuando Isabel oyó el saludo de María» (`cantico_evangelico_antifonas/347`).
El defecte és d'**una sola entrada** de `all_visperas.json`.

## La correcció proposada

A `all_visperas.json`, entrada `visitation_of_mary__ANY`:

| camp | ara (= I Vespres de l'Ascensió) | hauria de ser |
|---|---|---|
| `primer_salmo_cita` / `_texto` | `11031` / `11032` | `4577` / `4578` |
| `segundo_salmo_cita` / `_texto` | `152` / `153` | `3424` / `3425` |
| `tercer_salmo_cita` / `_texto` | `11030` / `11031` | `11042` / `11043` |
| `primer_salmo_antifona` | `10271` | `11021` (òrfena, ja hi és) |
| `segundo_salmo_antifona` | `10272` | **no s'ha trobat** — cal donar-la d'alta |
| `tercer_salmo_antifona` | `10273` | `840` (òrfena, ja hi és) |
| `cantico_evangelico_antifona` | `1443` | la pròpia de la Visitació — cal donar-la d'alta |
| `lectura_biblica_cita` / `lectura_biblica` | `3695` / `1185` | la del Comú de la Mare de Déu |
| `himno` | `3835` | el de la Visitació o el del Comú |

La segona antífona («Així que he sentit la teva salutació, el nen ha saltat d'entusiasme dins
les meves entranyes») i la del Magníficat («Totes les generacions em diran benaurada») no
consten a `commons/es` amb cap id lliure que hàgim sabut trobar: aquestes dues sí que demanen
contingut nou.

## Efecte a la migració

Desbloqueja les tres caselles del 3r càntic de Vespres del dijous —`salmos_citas/11030`,
`salmos_antifonas/9253`, `salmos_textos/11031`— que ara reté la minoria de sis 31 de maig contra
229 dies que hi volen el càntic d'Ap 11. Es veu al **3 de setembre de 2026** (memòria de sant
Gregori el Gran), però toca **235 dies** del manifest.

Igual que a EPREX-001: si es corregeix, cal **tornar a passar la sonda** (`app-id-probe.js`)
abans del join, perquè el mapa de caselles canvia.

## Com es reprodueix

```sh
make review DATES=2026-09-03        # les tres caselles retingudes surten a la troballa F11
node migration-to-saints/day-check.js 2026-09-03
```

I la prova principal, contra `dev`, sense sortir de les dades:

```sh
cd /Users/pau/projects/saints/saints-app
node -e "
const j = require('./src/store/db/day_specific_texts/all_visperas.json');
const vis = j['visitation_of_mary__ANY'], asc = j['ascension_of_the_lord__ANY'];
const same = Object.keys(vis).filter(k =>
  JSON.stringify(vis[k]) === JSON.stringify(asc[k + '_PrimerasVisperas']));
console.log(same.length + ' de ' + Object.keys(vis).length + ' camps són les I Vespres de l\\'Ascensió');
"
```

---

## El missatge per a en Fernando

Enviat el ___ de setembre de 2026. En castellà, com el d'EPREX-001.

> **Asunto: Vísperas del 31 de mayo (Visitación de la Virgen) — parece que sirven las I Vísperas de la Ascensión**
>
> Hola Fernando,
>
> Trabajando con el índice para el catalán nos hemos encontrado otra entrada que creemos que
> apunta a un oficio equivocado, y esta afecta también al castellano. Te la paso por si me
> equivoco y hay un criterio detrás que no conozco. Está mirado sobre `dev`, ya con el refactor
> de Primeras Vísperas (#1694) dentro.
>
> **`all_visperas.json`, entrada `visitation_of_mary__ANY`.** Desde que las I Vísperas viven en
> campos `*_PrimerasVisperas` dentro de la propia celebración, esto se ve solo: **16 de los 20
> campos de la Visitación son, id por id, los `*_PrimerasVisperas` de
> `ascension_of_the_lord__ANY`** — mismo himno (`3835`), mismos tres salmos (`11031` / `152` /
> `11030`) con sus antífonas (`10271`-`10273`), misma lectura breve (`3695`) y misma antífona del
> Magníficat (`1443`).
>
> De los cuatro campos restantes, el responsorio (`responsorios/15817`, «Dios asciende entre
> aclamaciones. Aleluya») y las preces (`preces_contenido/6188`, «Oh Rey de la gloria… elevándola
> hasta las alturas del cielo») también son de la Ascensión, con ids distintos. La **única pieza
> propia de la fiesta es la oración final** (`oraciones_finales/408`, «…el deseo de visitar a su
> prima Isabel»).
>
> Y la Visitación es una **fiesta**, que no tiene I Vísperas, así que no se me ocurre regla que
> lo explique.
>
> Lo que sale en pantalla el 31 de mayo, entonces:
>
> | | ahora | esperaríamos (Común de la Virgen) |
> |---|---|---|
> | 1.º salmo | Salmo 112 · `salmos_citas/11031` | Salmo 121 · `4577` |
> | 2.º salmo | Salmo 116 · `152` | Salmo 126 · `3424` |
> | Cántico | Ap 11, 17-18 · `11030` | **Ef 1, 3-10** · `11042` |
> | Antífonas | «Salí del Padre…», «…subió al cielo», «Nadie ha subido al cielo… Aleluya» · `10271`-`10273` | las propias de la Visitación |
> | Lectura breve | Ef 2, 4-6 · `3695` | la del Común de la Virgen |
> | Ant. Magníficat | «Padre, he manifestado tu nombre… Aleluya» · `1443` | la propia |
>
> **Tres cosas más, todas de vuestros propios datos:**
>
> 1. **Las hermanas marianas ya apuntan bien.** En `dev`, la Asunción, la Inmaculada, la
>    Natividad de María y la Virgen de los Dolores usan las cuatro `salmos_citas/4577` · `3424` ·
>    `11042` —Salmo 121, Salmo 126, Ef 1, 3-10— con antífonas propias de cada fiesta. La
>    Visitación es la única fiesta mariana que no lo hace.
> 2. **Aleluyas fuera de tiempo.** Las tres antífonas terminan en «Aleluya», y el 31 de mayo de
>    2021, 2022 y 2024 ya era tiempo ordinario (Pentecostés fue el 23 de mayo, el 5 de junio y el
>    19 de mayo).
> 3. **Las antífonas buenas ya están en la base, sin usar.** En `commons/es/salmos_antifonas.json`:
>    `11021` «María entró en casa de Zacarías y saludó a Isabel» y `840` «Bendita tú entre las
>    mujeres, y bendito el fruto de tu vientre». **Ninguna celebración las referencia** en los
>    diez `all_*.json`. Son, literalmente, la 1.ª y la 3.ª antífona de Vísperas de la Visitación.
>    Es el mismo patrón que las `10964`-`10966` del Oficio de Difuntos que te comenté el otro día.
>
> **Laudes del mismo día está bien** —himno «Y salta el pequeño Juan en el seno de Isabel»,
> antífona «María se puso en camino y fue aprisa a la montaña», lectura Jl 2, 27-3, 1—, o sea que
> el fallo es de una sola entrada, la de Vísperas.
>
> **Lo que haría falta** es repuntar ids, no crear contenido, salvo en dos casos:
>
> | campo | ahora | debería |
> |---|---|---|
> | `primer_salmo_cita` / `_texto` | `11031` / `11032` | `4577` / `4578` |
> | `segundo_salmo_cita` / `_texto` | `152` / `153` | `3424` / `3425` |
> | `tercer_salmo_cita` / `_texto` | `11030` / `11031` | `11042` / `11043` |
> | `primer_salmo_antifona` | `10271` | `11021` (ya existe, sin usar) |
> | `tercer_salmo_antifona` | `10273` | `840` (ya existe, sin usar) |
> | `segundo_salmo_antifona` | `10272` | no la hemos encontrado — haría falta darla de alta |
> | `cantico_evangelico_antifona` | `1443` | la propia de la Visitación — no la hemos encontrado |
> | `lectura_biblica_cita` / `lectura_biblica` | `3695` / `1185` | la del Común de la Virgen |
> | `himno` | `3835` | el de la Visitación o el del Común |
>
> Si hay un criterio que lo justifica, dímelo y lo cerramos: nos sirve igual, porque nos dirá qué
> esperar en el resto de fiestas que toman oficio propio.
>
> Un detalle nuestro, por si ayuda a priorizar: `salmos_citas/11030` es la casilla del cántico
> del **jueves** del salterio, compartida por 235 días. Al estar la Visitación apuntada ahí,
> nuestra migración al catalán no puede resolver esa casilla y arrastra tres celdas de todos esos
> días. Pero eso es problema nuestro; lo que te traigo es lo de arriba.
>
> Gracias,
> Pau
