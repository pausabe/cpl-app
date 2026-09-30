# EPREX-008 i EPREX-009 — Himnes i salteri mal apuntats a l'índex

| | |
|---|---|
| **Estat** | Proposat. Missatge redactat el 30-9-2026, segon a en Fernando; l'envia en Pau |
| **Llengües** | Totes: és l'índex |
| **Trobat** | 30 de setembre de 2026, repassant les caselles retingudes amb un text molt majoritari |

## EPREX-008 · Tres himnes que no són del dia

| Dia | Què hi posa eprex | Què hi va |
|---|---|---|
| Santíssima Trinitat, Tèrcia, Sexta i Nona | Els himnes de Quaresma (`1172`, `1165`, `1207`: «Pastor que con tus silbos amorosos») | L'himne ordinari de cada hora: en llatí, «Nunc, Sancte, nobis Spiritus» a Tèrcia ([Liturgia Horarum](https://www.societaslaudis.org/fr/2026-05-31/hebdomada-ix-per-annum/sanctissimae-trinitatis-sollemnitas/liturgia-horarum/ad-tertiam/)); la CPL, «Veniu, oh Déu, Esperit Sant» |
| Sant Lluc, Vespres | L'himne de Vespres de durant l'any (`3751`, «Como una ofrenda de la tarde») | «Benditos son los pies de los que llegan», com sant Marc (`1014`) ([breviari, 18-X-2024](https://apps.idteologia.org/index.php?fecha=2024-10-18&r=liturgiaDeLasHoras%2Fespanola&rezo=visperas)) |
| Visitació, Vespres | L'himne de l'Ascensió (`3835`, «¿Y dejas, Pastor santo») | «Y salta el pequeño Juan» (`410`) ([breviari, 31-V-2024](https://apps.idteologia.org/index.php?fecha=2024-05-31&r=liturgiaDeLasHoras%2Fespanola&rezo=visperas)) |

## EPREX-009 · Els dimecres, dijous i divendres d'Advent III, amb el salteri de la setmana I

Advent III va amb la setmana III del salteri. A `advent_3_wednesday`, `advent_3_thursday` i
`advent_3_friday` la salmòdia és la de la setmana I a Laudes i Vespres, a Sexta i Nona els tres dies, i
a Tèrcia el divendres. El breviari castellà del 15-XII-2022 dona el salm 86, Is 40 i el salm 98
([Laudes](https://apps.idteologia.org/index.php?fecha=2022-12-15&r=liturgiaDeLasHoras%2Fespanola&rezo=laudes));
eprex, el 56, Jr 31 i el 47. Els nou camps de la salmòdia han de ser els de `ordinary_time_3_<dia>`.
Passa quan aquests dies cauen abans del 17 de desembre: 2021, 2022 i, el pròxim, 2027.

## Missatge per a en Fernando (Telegram, text pla)

> Hola Fernando, otra tanda del índice, también para todos los idiomas:
>
> 1. Santísima Trinidad, Tercia, Sexta y Nona: el himno apunta a las casillas de Cuaresma (1172, 1165 y
> 1207, «Pastor que con tus silbos amorosos»). Debería ser un himno de la Hora intermedia de domingo, como
> los de los domingos del tiempo ordinario. Es most_holy_trinity__ANY en all_tercia, all_sexta y all_nona.
>
> 2. San Lucas, Vísperas: sale el himno de Vísperas del tiempo ordinario (3751, «Como una ofrenda de la
> tarde»). El breviario da «Benditos son los pies de los que llegan», como San Marcos (1014). Es
> luke_evangelist__ANY en all_visperas.
>
> 3. Visitación, Vísperas: sale el himno de la Ascensión (3835, «¿Y dejas, Pastor santo»). El breviario da
> «Y salta el pequeño Juan» (410). Es visitation_of_mary__ANY en all_visperas.
>
> 4. Adviento III, miércoles, jueves y viernes: la salmodia es la de la semana I (Laudes, Vísperas, Sexta
> y Nona, y Tercia el viernes). Debería ser la de la semana III, los nueve campos de la salmodia como en
> ordinary_time_3_<día>. El 15-XII-2022, por ejemplo, el breviario da en Laudes el Salmo 86, Is 40 y el
> Salmo 98, y la app el 56, Jr 31 y el 47. Solo se ve cuando esos días caen antes del 17 de diciembre; la
> próxima vez, en 2027.
>
> Gracias!
