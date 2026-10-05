# EPREX-008 i EPREX-009 — Himnes i salteri mal apuntats a l'índex

| | |
|---|---|
| **Estat** | Proposat. Missatge redactat el 30-9-2026, segon a en Fernando; l'envia en Pau. El 2-10 no surt al xat de Telegram i a `dev` tot continua igual |
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
Passa quan aquests dies cauen abans del 17 de desembre: 2021, 2022, **2026** (només el dimecres 16) i 2027
(el 15 i el 16). El 16-12-2026 no sortia a la llista perquè al calendari català és sant Josep Manyanet; en
castellà i a la resta és `advent_3_wednesday` i surt amb la setmana I (comprovat a `origin/dev` el 5-10-2026).

## Missatge per a en Fernando (Telegram, text pla)

> **5-10-2026:** aquest missatge no consta enviat i ja no és el que s'enviarà. Al tauler de Trello s'ha partit
> en un tema per targeta (Trinitat, sant Lluc, Advent III; l'himne de la Visitació va amb l'EPREX-002), cadascun
> amb el dia i l'hora, què surt, el possible problema i la pregunta.

Refet dues vegades el 30-9 a petició d'en Pau: amb dates exactes, i cada punt diu quin és el problema, què
creiem que hi hauria d'anar i acaba amb una pregunta.

> Hola Fernando, otra tanda de cosas del índice que nos han salido comparando con el catalán. Afectan a
> todos los idiomas:
>
> 1. La Trinidad sale con el himno de Cuaresma en la Hora intermedia. El domingo 31 de mayo de 2026, en
> Tercia, Sexta y Nona, apuntaba a 1172, 1165 y 1207 («Pastor que con tus silbos amorosos»), que son los
> himnos de Cuaresma. ¿No debería llevar el himno de domingo, como los domingos del tiempo ordinario? En
> latín ese día va el himno ordinario de cada hora. Es most_holy_trinity__ANY en all_tercia, all_sexta y
> all_nona, y la próxima vez es el 23 de mayo de 2027.
>
> 2. San Lucas sale con el himno de Vísperas de un día cualquiera del tiempo ordinario. El viernes 18 de
> octubre de 2024 salió «Como una ofrenda de la tarde» (3751). ¿No debería ser «Benditos son los pies de
> los que llegan», como en San Marcos (1014)? Es el que da el breviario ese día. Es luke_evangelist__ANY en
> all_visperas; la próxima vez, el 18 de octubre de 2027.
>
> 3. La Visitación sale con el himno de Vísperas de la Ascensión. El viernes 31 de mayo de 2024 salió «¿Y
> dejas, Pastor santo» (3835). ¿No debería ser «Y salta el pequeño Juan» (410), que es el que da el
> breviario ese día? Es visitation_of_mary__ANY en all_visperas; la próxima vez, el 31 de mayo de 2027.
>
> 4. Los días de la semana III de Adviento salen con los salmos de la semana I. El jueves 15 de diciembre
> de 2022, en Laudes, salieron el Salmo 56, Jr 31 y el Salmo 47. ¿No deberían ser los de la semana III, el
> Salmo 86, Is 40 y el Salmo 98, que son los que da el breviario ese día? Pasa de miércoles a viernes, en
> Laudes, Vísperas, Sexta y Nona (y el viernes también en Tercia): advent_3_wednesday, advent_3_thursday y
> advent_3_friday. Solo se nota cuando caen antes del 17 de diciembre, como el 15 de diciembre de 2021 y de
> 2022; la próxima vez, el 15 y el 16 de diciembre de 2027.
>
> ¿Lo ves igual?
>
> Gracias!
