# MIGRA-017 — El join aparellava els responsoris per posició encara que l'app no en mostrés sis

| | |
|---|---|
| **Estat** | Corregit |
| **Component** | Eines de migració · `migration-to-saints/join-content.test.js` |
| **Gravetat** | **Alta**: escrivia a saints-app línies de responsori a la casella del costat |
| **Trobat** | 29 de setembre de 2026, repassant contra el castellà les 34 caselles que l'exportació canviava |
| **Correcció** | Aparellar per posició fins a la primera casella que l'app repeteix, i gens si l'app en mostra menys |
| **Regressió** | Els valors esperats, al castellà de cada casella: `responsorios/18666` és `℣. En que os amáis unos a otros.` |

## El fet

L'exportació canviava sis caselles de responsori que ja eren bones. A `responsorios/18666` hi
anava `℟. Si sou deixebles meus.`, i el castellà hi diu `℣. En que os amáis unos a otros.`: cada
línia havia anat a parar a la casella del costat.

Amb saints-app a `dev` del 28-9, les Vespres del 24 de juliol (I Vespres de sant Jaume) mostren
el responsori breu amb set caselles, una de repetida:

```
18664, 18665, 18665, 18666, 18667, 18668, 18669
```

i les del 25 de juliol, amb cinc (en falta una). El join les aparellava per posició amb les sis
línies de cpl-app, i a partir de la casella repetida tot anava corregut.

## La correcció

Es pot aparellar per posició fins a la primera casella que l'app mostra dues vegades, i gens quan
l'app en mostra menys que cpl-app, perquè llavors no se sap on és el forat:

| dia | l'app | s'aparellen |
|---|---|---|
| 24 de juliol | set, la segona dues vegades | les dues primeres |
| 25 de juliol | cinc | cap |
| 30 de novembre (sant Andreu) | sis, la del Glòria (`13`) dues vegades al final | les cinc primeres |
| 12 d'octubre (hores menors) | quatre, per a dues de cpl-app | les dues primeres |

Comparat amb aparellar-ho tot: només deixen d'escriure's les caselles corregudes de sant Jaume, i
se n'escriuen dues de noves que ara ningú no contradiu (`13` i `18665`), totes dues iguals al
castellà.

## Per a en Fernando

Si la sonda llegeix el que es veu, el responsori de les Vespres de sant Jaume surt amb una línia
repetida (el 24) i amb una de menys (el 25), en totes les llengües.
