# D-006 — La tornada de l'aclamació abans de l'evangeli: 14 línies que cpl-app no té

**Estat:** en part (4 de 14, el 30-9-2026). **Decideix:** en Pau, amb el Missal a la mà. **Bloqueja:** només aquest camp.
**Trobat:** 8 de setembre de 2026, fent la fase 4 de [FASES.md](../FASES.md).

## El fet

La casella `lecturas_referencia` del rol `ACCLAMATION` **no du la cita bíblica**: du la
**tornada** que es canta abans i després del verset —«Al·leluia, al·leluia, al·leluia»— i, en
temps de Quaresma, la fórmula que la substitueix.

cpl-app **no en té cap dada**. L'«Al·leluia. » és una constant escrita dins de la seva pantalla
(`MassLiturgyPrayerScreen.js:232`), i el que sí que té —`Hallelujah.Quote`, «2C 5,19»— és la
cita bíblica del verset, que és una altra cosa i que l'índex no desa enlloc.

El verset (`ACCLAMATION_texto` ← `Hallelujah.Hallelujah`) **sí que es migra** i no té cap
problema. El que falta és només la tornada.

## Quantes són

**Catorze ids** cobreixen l'any sencer:

| id | dies | castellà |
|---|---|---|
| 6000 | 675 | `_Aleluya, aleluya, aleluya._` |
| 6001 | 42 | `_Gloria y alabanza a ti, Cristo._` |
| 100 | 16 | `_Aleluya, aleluya, aleluya._` |
| 6004 | 13 | `_Gloria a ti, Señor, Hijo de Dios vivo._` |
| 152 | 3 | `Secuencia de Pascua (obligatoria el Domingo de Resurrección):  _Ofrezcan los cristianos_` |
| 6002 | 3 | `_Gloria a ti, Cristo, Sabiduría de Dios Padre._` |
| 6010 | 3 | `Puede decirse la secuencia:  _Lauda, Sion, Salvatorem._` |
| 1670 | 3 | `Antes del Evangelio se recita la Secuencia del Espíritu Santo: _Veni Sancte._` |
| 6005 | 2 | `_Alabanza y honor a ti, Señor Jesús._` |
| 929 | 1 | `_Aleluya, aleluya, aleluya._` |
| 6006 | 1 | `Cuaresma: _Alabanza y honor a ti, Señor Jesús._ T.P.: _Aleluya, aleluya, aleluya._` |
| 6003 | 1 | `_Gloria a ti, Cristo, Palabra de Dios._` |
| 110 | 1 | `_Aleluya, aleluya, aleluya._` |
| 6007 | 1 | `Antes del Evangelio se puede recitar la Secuencia «La Madre piadosa» (Stabat Mater)` |

Els guions baixos són el marcador de cursiva de saints-app i s'han de conservar: el component
parteix la casella pel `_`.

## Què cal

**Que en Pau ompli aquesta columna amb el Missal davant.** No les escric jo: la regla d'aquest
projecte és que **només el volum imprès decideix la redacció catalana**, i tres llengües
coincidint no és prova. Quatre de les catorze no són ni text litúrgic sinó **rúbriques** («Es
pot dir la seqüència…»), que segueixen la redacció del Missal català igualment.

| id | català |
|---|---|
| 6000 | `_Al·leluia, al·leluia, al·leluia._` (30-9) |
| 6001 | |
| 100 | `_Al·leluia, al·leluia, al·leluia._` (30-9) |
| 6004 | |
| 152 | |
| 6002 | |
| 6010 | |
| 1670 | |
| 6005 | |
| 929 | `_Al·leluia, al·leluia, al·leluia._` (30-9) |
| 6006 | |
| 6003 | |
| 110 | `_Al·leluia, al·leluia, al·leluia._` (30-9) |
| 6007 | |

Un cop omplerta, va a `static-translations/lecturas_referencia.ca.json` amb la forma
`{"6000": "…"}` i l'exportació la recull sola: el mecanisme ja hi és i és el mateix que fa
servir l'`oracion` de Completes i la invitació al Parenostre.

## Mentrestant

Les catorze caselles **queden buides**, i el verset de sota surt igualment. A la pantalla es
veurà el verset sense el «Al·leluia» de davant. És l'única cosa que falta de la missa un cop
feta la fase 4.

## 30 de setembre de 2026

En Pau va triar, per a les quatre que en castellà diuen «Aleluya, aleluya, aleluya», la fórmula que
la CPL ja fa servir com a antífona de les hores menors del temps de Pasqua: «Al·leluia, al·leluia,
al·leluia». Les altres deu esperen el llibre.
