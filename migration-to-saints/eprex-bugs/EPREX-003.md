# EPREX-003 · Sants Innocents porta a Vespres la salmòdia de les I Vespres

**Trobat:** 4 de setembre de 2026, revisant el 4-IX-2026.
**Estat:** proposat, pendent d'enviar.
**Afecta:** totes les llengües.

## Què passa

A `all_visperas.json`, `holy_innocents_martyrs__ANY` duu Salm 112 · Salm 147 · Ef 1, 3-10 —la
salmòdia d'unes **I Vespres**— on toquen les II Vespres de la festa: Salm 109 · Salm 129 ·
Col 1, 12-20.

| camp | ara | hauria de ser |
|---|---|---|
| `primer_salmo_cita` / `_texto` | `11031` / `11032` — Salm 112 | `11025` / `11026` — Salm 109 |
| `segundo_salmo_cita` / `_texto` | `155` / `156` — Salm 147 | `54` / `55` — Salm 129 |
| `tercer_salmo_cita` / `_texto` | `11042` / `11043` — Ef 1, 3-10 | `11072` / `11073` — Col 1, 12-20 |

`christmas_octave_day_4__ANY` és el mateix dia amb contingut idèntic; si s'usa en algun
calendari, necessita el mateix canvi.

## Prova

**Interna, la decisiva.** Les tres festes de l'octava tenen el mateix rang i dues coincideixen:

| | 1r | 2n | 3r |
|---|---|---|---|
| sant Esteve (26-XII) | `11025` | `54` | `11072` |
| sant Joan (27-XII) | `11025` | `54` | `11072` |
| **Sants Innocents (28-XII)** | `11031` | `155` | `11042` |

**Per què no salta tots els anys.** Quan el 29 de desembre és la Sagrada Família, la tarda del 28
sí que són I Vespres i la fitxa encerta: el 2024 cpl-app hi dona Salm 112 · Salm 147, igual que
l'app. Els anys en què el 29 és fèria de l'octava —2021, 2022, 2023 i 2026— toquen les II
Vespres i cpl-app dona Salm 109 · Salm 129. L'entrada només contempla el primer cas.

## El 31 de desembre NO és el mateix cas

`christmas_octave_day_7__ANY` duu la mateixa parella `11031`+`155` i **és correcta**: és la
vigília de Santa Maria Mare de Déu i sí que toquen I Vespres. cpl-app hi dona Salm 112 · Salm 147
els deu anys del manifest. Comprovat abans d'enviar res — la primera versió d'aquesta proposta
demanava canviar-lo i hauria estat un error.

## Efecte a la migració

És l'únic que reté ara `salmos_citas/155` i `salmos_textos/156`, la casella del 3r salm de Laudes
dels divendres ordinaris: 176 dies hi volen el Salm 147 i 7 el Salm 129. Desbloquejant-ho, el
**4-IX-2026 arriba al 100%**. Si s'accepta, cal tornar a passar la sonda abans del join.

## Missatge per a en Fernando (Telegram, text pla)

> Hola Fernando,
>
> Migrando al catalán nos ha salido algo que creo que está mal, y afecta a todos los idiomas, no
> solo al nuestro.
>
> Son las Vísperas del 28 de diciembre, Santos Inocentes. Ahora dan Salmo 112, Salmo 147 y el
> cántico de Ef 1,3-10, que es la salmodia de unas Primeras Vísperas. Creo que debería ser Salmo
> 109, Salmo 129 y Col 1,12-20, que es justo lo que llevan San Esteban el 26 y San Juan el 27,
> las otras dos fiestas de la misma octava.
>
> En ids, la entrada holy_innocents_martyrs__ANY: 11031 → 11025, 155 → 54 y 11042 → 11072, con
> sus _texto. Son casillas que ya existen, no hace falta contenido nuevo.
>
> Dos avisos. Solo se nota los años en que el 29 no cae la Sagrada Familia. Y el 31 de diciembre
> lleva esa misma pareja de salmos pero ahí sí está bien, porque es víspera de Santa María Madre
> de Dios: ese no lo toquéis.
>
> ¿Puedes mirarte ese día con cariño y me dices?
>
> Gracias!
