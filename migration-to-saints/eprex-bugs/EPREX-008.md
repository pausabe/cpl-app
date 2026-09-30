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

Refet el 30-9 a petició d'en Pau: amb dates exactes i acabant amb una pregunta, sense donar per fet que és
un error.

> Hola Fernando, otra tanda de cosas del índice que nos han salido comparando con el catalán. Afectan a
> todos los idiomas. Te las paso por si son errores, aunque igual se nos escapa algo:
>
> 1. Santísima Trinidad (domingo 31 de mayo de 2026; la próxima, el 23 de mayo de 2027). En Tercia, Sexta
> y Nona el himno apunta a las casillas de Cuaresma: 1172, 1165 y 1207, «Pastor que con tus silbos
> amorosos». En latín ese día va el himno ordinario de cada hora («Nunc, Sancte, nobis Spiritus» en
> Tercia). Es most_holy_trinity__ANY en all_tercia, all_sexta y all_nona.
>
> 2. San Lucas, Vísperas (viernes 18 de octubre de 2024, por ejemplo; la próxima, el lunes 18 de octubre de
> 2027). Sale «Como una ofrenda de la tarde» (3751), que es el de Vísperas del tiempo ordinario. El
> breviario de ese día da «Benditos son los pies de los que llegan», como San Marcos (1014). Es
> luke_evangelist__ANY en all_visperas.
>
> 3. Visitación, Vísperas (viernes 31 de mayo de 2024; la próxima, el lunes 31 de mayo de 2027). Sale «¿Y
> dejas, Pastor santo» (3835), que es el de la Ascensión. El breviario da «Y salta el pequeño Juan» (410).
> Es visitation_of_mary__ANY en all_visperas.
>
> 4. Adviento III, de miércoles a viernes cuando caen antes del 17 de diciembre (el miércoles 15 de
> diciembre de 2021 y el jueves 15 de diciembre de 2022; la próxima, el 15 y el 16 de diciembre de 2027).
> La salmodia sale de la semana I: el jueves 15 de diciembre de 2022, en Laudes, Salmo 56, Jr 31 y Salmo
> 47, y el breviario de ese día da la semana III, Salmo 86, Is 40 y Salmo 98. Pasa en Laudes, Vísperas,
> Sexta y Nona, y el viernes también en Tercia: advent_3_wednesday, advent_3_thursday y advent_3_friday.
>
> ¿Te cuadra que sean cosas del índice, o hay algo que no estamos viendo?
>
> Gracias!
