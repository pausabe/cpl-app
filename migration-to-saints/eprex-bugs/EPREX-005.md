# EPREX-005 · A les hores intermèdies, una festa perd la seva antífona pròpia

**Trobat:** 8 de setembre de 2026, mirant per què el 8-IX la Tèrcia mostrava un error.
**Estat:** enviat el 14-9-2026, acceptat a mitges. En lloc del `-1`, en Fernando va fer el tipus FEAST2 (codi al #1749, 25-9); ja ho són la Santa Cruz, els Arcàngels i sis festes més. **En queden 4** (revisat el 5-10-2026, vegeu el final), per a la 3.30: targeta T5.
**Afecta:** totes les llengües. El recompte inicial de **513 dies** era massa: comptava com a pròpies antífones que no ho són (vegeu el final).

## Què passa

`terciaStore.ts` (i els seus bessons de Sexta i Nona) tenen aquest bloc:

```ts
// Partial override for FEAST or SPECIAL:
// psalms but not short reading nor final prayer
if ((resultSelected.cycle === "FEAST" || resultSelected.cycle === "SPECIAL")
    && liturgicalDay?.weekday?.id) {
  const ferial = findInStructureById(AllCollection, liturgicalDay.weekday.id)
  if (ferial) {
    baseRecord = { ...baseRecord,
      primer_salmo_antifona: ferial.primer_salmo_antifona,   // ← també l'antífona
      primer_salmo_cita: ferial.primer_salmo_cita,
      … els nou camps de la salmòdia …
    }
  }
}
```

Substituir **els salms** per la fèria és correcte i és el que fa també cpl-app. El que sobra és
que s'hi enduu **les antífones**, i amb elles l'antífona pròpia de la celebració que l'índex duu
escrita expressament per a aquell dia.

## L'exemple

**8 de setembre de 2026, Naixement de la Benaurada Verge Maria (festa).**

`all_tercia.json` en diu:

```json
"nativity_of_the_blessed_virgin_mary__FEAST": {
  "primer_salmo_antifona": 4811,
  "segundo_salmo_antifona": -1,
  "tercer_salmo_antifona": -1,
  …
}
```

És a dir: **una sola antífona**, la 4811, per als tres salms — que és exactament el que mana
l'OGLH per a una festa, i exactament el que resa cpl-app («Avui és el Naixement de santa Maria
Verge; ella, amb la seva santedat, ennobleix totes les Esglésies»).

Però la sonda mesura que l'app llegeix `salmos_antifonas/3412`, `/3413` i `/3414`: **les tres
de la fèria**. La 4811 no l'obre ningú.

| | l'índex de la festa | el que l'app llegeix |
|---|---|---|
| 1a antífona | `4811` (pròpia) | `3412` (fèria) |
| 2a antífona | `-1` | `3413` (fèria) |
| 3a antífona | `-1` | `3414` (fèria) |
| salms | `3363/3364/3365` | `3372/3373/3374` (fèria) — **correcte** |

## Quantes vegades

**513 dies** de la finestra de deu anys tenen entrada amb una sola antífona pròpia i acaben
mostrant-ne tres de ferials. Són gairebé totes les festes i memòries amb ofici propi.

## Per què ens importa a nosaltres

Perquè la migració fa el que li diu la sonda: si l'app llegeix la casella de la fèria, hi posa
el que resa cpl-app aquell dia — que és l'antífona **de la festa**. Resultat: 26 caselles
d'antífona compartides per desenes de dies ordinaris rebien text de celebració, no es posaven
mai d'acord i quedaven retingudes. I una casella retinguda **no surt en blanc**: surt com

```
Ant. 1.  [ERR-001] Element no trobat. Informeu-ne aquí
```

Ho hem corregit al nostre costat —el join ja no observa aquelles antífones, perquè no tenen
casella on anar (vegeu MIGRA-009)— i amb això **6.297 caselles de 1.954 dies** han deixat de
mostrar l'error. Però la causa segueix aquí.

## Com es podria arreglar

Treure les tres línies de l'antífona de l'override, i deixar-hi només els salms:

```ts
baseRecord = { ...baseRecord,
  primer_salmo_cita: ferial.primer_salmo_cita,
  primer_salmo_texto: ferial.primer_salmo_texto,
  segundo_salmo_cita: ferial.segundo_salmo_cita,
  segundo_salmo_texto: ferial.segundo_salmo_texto,
  tercer_salmo_cita: ferial.tercer_salmo_cita,
  tercer_salmo_texto: ferial.tercer_salmo_texto,
}
```

Amb el `-1` a les antífones 2 i 3, la pàgina ja sap pintar-ne una de sola: 239 de les 495
entrades d'`all_tercia.json` tenen aquesta forma.

## Com es reprodueix

Idioma qualsevol, **8 de setembre de 2026**, Tèrcia. L'antífona que surt és
la del dimarts de la setmana III del saltiri, no la del Naixement de la Mare de Déu.

## Revisió del 5-10-2026

Arran del [CPL-LIT-007](../cpl-bugs/CPL-LIT-007.md) (cpl-app posava a les hores menors de les festes l'antífona del
comú; la CPL va demanar la de la fèria), s'ha tornat a mirar `origin/dev`. De les 27 entrades FEAST de
`all_tercia.json`:

| Entrades | Què duen a l'índex | Amb FEAST (la fèria) |
|---|---|---|
| Conversió de sant Pau (Sexta i Nona), Jesucrist gran sacerdot, Transfiguració, Naixement de la Mare de Déu | una antífona pròpia (p. ex. 4533, «Jesús apareció transfigurado…») | **la perden**: han de passar a FEAST2 |
| Maties, Marc, Caterina de Siena, Isidor, Felip i Jaume | la 3360, «Aleluya, aleluya, aleluya» | la mateixa: la fèria pasqual també hi diu la 3360 |
| Presentació, Tomàs | `-1` a les tres hores | res a perdre |
| Les altres setze | antífones del saltiri | les del dia: correcte (OGLH 232) |

Les quatre que la perden són les mateixes que la base de la CPL té com a pròpies (`antMenorTercia`), a més de la Santa
Creu, els Arcàngels i els dies de l'octava de Nadal, que ja són FEAST2. Pròxims dies: 25-1-2027 (Conversió de sant
Pau), 20-5-2027 (Jesucrist gran sacerdot), 6-8-2027 (Transfiguració) i 8-9-2027 (Naixement de la Mare de Déu).
