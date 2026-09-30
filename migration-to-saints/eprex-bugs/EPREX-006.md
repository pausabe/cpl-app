# EPREX-006 i EPREX-007 — Les hores menors de les solemnitats

| | |
|---|---|
| **Estat** | EPREX-006: **acceptat com a limitació, no es corregeix** (D-015). EPREX-007: **corregit** per en Fernando a saints-admin el 30-9-2026 |
| **Llengües** | Totes: és l'índex (`all_tercia/sexta/nona.json`) |
| **Trobat** | 30 de setembre de 2026, revisant les celebracions que la D-012 va deixar per mirar una per una |
| **Revisió** | Troballes F32 (EPREX-006) i F33 (EPREX-007) |

## EPREX-006 · Una solemnitat en diumenge

IGLH 82: a les hores menors d'una solemnitat, tres salms de la salmòdia complementària, «vel celebratio
sollemnitatis occurrat die dominica, quo in casu sumuntur psalmi de dominica hebdomadæ I»
([text llatí](https://breviar.sk/la/docs/smernice_lh.htm)). L'índex té una sola entrada `__ANY` per a cada
solemnitat i hi posa sempre els graduals. cpl-app hi diu el salm 117, com el diumenge I.

Els del diumenge I, a eprex: `3351/3352`, `3352/3353`, `3353/3354` (Salmo 117 I, II i III, les tres hores,
com `advent_1_sunday__ANY`). Les antífones continuen sent les pròpies.

Diumenges: Tots Sants 2020 i **2026**, sant Joan 2018 i 2029, sant Pere i sant Pau 2025 i 2031, sant Jaume
2021, 2027 i 2032, l'Assumpció 2021, 2027 i 2032.

## EPREX-007 · Dues caselles mal apuntades

- `all_sexta.json` `annunciation_of_the_lord__ANY`: `segundo_salmo_cita` 12004 (Salmo 122, la del primer) sobre
  `segundo_salmo_texto` 12005 (el 123). Ha de ser 12005.
- `all_tercia.json` `mary_mother_of_god__ANY`: `tercer_salmo` 3419/3420 (Salmo 128). Els altres dos són els
  graduals de Tèrcia (12001, 12002). Ha de ser 12003/12003 (Salmo 121).

## Missatge per a en Fernando (Telegram, text pla)

> Hola Fernando,
>
> Revisando las Horas menores de las solemnidades nos han salido tres cosas del índice. Afectan a todos los
> idiomas, no solo al catalán. La primera corre prisa.
>
> 1. Solemnidad en domingo. En Tercia, Sexta y Nona de una solemnidad van tres salmos de la salmodia
> complementaria, pero si cae en domingo van los del domingo de la semana I (Ordenación general, n. 82). La
> app pone siempre los graduales, porque cada solemnidad tiene una sola entrada __ANY. El próximo caso es
> Todos los Santos, este 1 de noviembre, que es domingo. Luego Santiago y la Asunción en 2027, San Juan en
> 2029 y San Pedro y San Pablo en 2031.
> Ese día, en las tres horas, deberían salir los salmos del domingo I: 3351/3352, 3352/3353 y 3353/3354
> (Salmo 117 I, II y III, como advent_1_sunday__ANY), con las antífonas propias de la fiesta. Las entradas
> son all_saints, nativity_of_john_the_baptist, peter_and_paul_apostles, james_apostle y
> assumption_of_the_blessed_virgin_mary en all_tercia, all_sexta y all_nona.
>
> 2. Anunciación, Sexta: el segundo salmo lleva la cita del Salmo 122 (12004, la misma del primero) sobre el
> texto del 123 (12005). La cita debería ser 12005. Es annunciation_of_the_lord__ANY en all_sexta.
>
> 3. Santa María, Madre de Dios, Tercia: el tercer salmo es el 128 (3419/3420), y los otros dos son los
> graduales de Tercia (12001 y 12002). Debería ser 12003/12003, el Salmo 121. Es mary_mother_of_god__ANY en
> all_tercia.
>
> Las casillas del 2 y el 3 ya existen, no hace falta contenido nuevo. ¿Te lo miras y me dices?
>
> Gracias!

## Resposta d'en Fernando (30-9-2026)

> Solemnidad en domingo, no está implementado cambiar la salmodia complementaria para horas intermedias.
> ¿Crees que vale la pena meterse en ese lío?
>
> corregida sexta de Anunciación del Señor
>
> corregida tercia de Sta María Madre de Dios

L'EPREX-007 queda fet a l'origen i arriba a saints-app amb la pròxima exportació. L'EPREX-006 no: eprex no
té cap regla que canviï la salmòdia d'una solemnitat quan cau en diumenge, i per a cinc dies en cinc anys
(Tots Sants 2026, sant Jaume i l'Assumpció 2027, sant Joan 2029, sant Pere i sant Pau 2031) en Pau i en
Fernando acorden no fer-la. Vegeu la D-015 al registre.

Resposta que li torna en Pau:

> De acuerdo, no merece la pena para cinco días en cinco años. Lo dejamos como limitación conocida.
> Gracias por lo de la Anunciación y Santa María!
