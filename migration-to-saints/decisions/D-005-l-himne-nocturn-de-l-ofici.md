# D-005 — L'himne de l'Ofici de lectura: cpl-app en té dos, saints-app un de sol

**Estat:** obert. **Decideix:** en Pau (i, si cal, el CPL). **Bloqueja:** només aquest camp.
**Trobat:** 7 de setembre de 2026, fent la fase 3 de [FASES.md](../FASES.md).

Germà de la [D-004](D-004-l-himne-de-completes.md), i amb la mateixa forma: cpl-app fa una
distinció que la casella compartida amb es/it no sap representar. El que canvia és l'eix.

## El fet

L'Ofici de lectura es pot resar a qualsevol hora, i l'edició catalana en dona **dos himnes**
segons quan es resi:

```
src/Services/Liturgy/OfficeService.tsx:42
    const nowDate = new Date();
    const hour = nowDate.getHours();
    return hour < 6;          // IsDarkAnthem()
```

Abans de les sis del matí, `OfficeCommonPsalter.NightCatalanAnthem`; a partir de les sis,
`DayCatalanAnthem`. La taula `salteriComuOfici` en té **28 files** (4 setmanes del saltiri × 7
dies) i **les 28 tenen els dos himnes diferents**: 14 himnes de dia distints i 14 de nit.

`all_oficio.json` té **un sol camp `himno`**. Els dos no hi caben.

Fora del Temps Ordinari la qüestió no es planteja: el `switch` de `GetAnthem` substitueix
tots dos per l'himne de la temporada (Quaresma, Setmana Santa, Tridu, Pasqua, Advent i Nadal),
i en una celebració pròpia mana `celebrationOffice.Anthem`. La forquilla només és viva els
dies ferials del Temps Ordinari — que són, això sí, més de la meitat de l'any.

**No és cap bug de cpl-app** i no s'obre cap `CPL-LIT`: és el que mana l'OGLH 57, i el volum
imprès du els dos himnes.

## Què s'ha fet mentrestant

**S'escriu l'himne de dia.** I, perquè la tria no depengui de l'hora en què algú corri la
migració, el join fixa el rellotge a les dotze del migdia abans de resoldre cap data
(`beforeAll` de `join-content.test.js`). Sense això, un join llançat a les cinc de la matinada
hauria migrat catorze himnes nocturns sense que res ho digués.

Per què el de dia:

- És el que l'app mostra divuit hores de cada vint-i-quatre.
- És el que encapçala l'Ofici al volum imprès; el nocturn hi va com a alternativa.

**Conseqüència visible**: qui resi l'Ofici de lectura de matinada veurà a eprex l'himne de dia,
mentre que a cpl-app en veuria un altre. Cap altre camp de l'hora es veu afectat.

## Les opcions

| | Què implica |
|---|---|
| **a) Deixar-ho com està** | L'himne de dia sempre. Zero feina. La diferència només es nota abans de les sis del matí |
| **b) Demanar a eprex un segon camp** (`himno_nocturno`) | És la representació correcta i serviria per a es/it si algun dia el volen. Depèn de Fernando i toca l'índex compartit, que és el que menys ens convé tocar |
| **c) Amagar la distinció del tot** | Ja és el que passa. Només cal dir-ho al CPL perquè ho sàpiga |

**Recomanació: (a)**, i comunicar-ho. La distinció dia/nit és una comoditat de cpl-app que
l'edició de referència tampoc no fa a la web; obrir un camp nou a l'índex compartit per a
catorze himnes que es resen abans de les sis del matí no compensa el risc de tocar
`all_oficio.json`.
