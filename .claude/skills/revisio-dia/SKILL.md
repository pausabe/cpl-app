---
name: revisio-dia
description: Revisa dia a dia i camp a camp la Litúrgia de les Hores de cpl-app contra saints-app (eprex), diu de qui és la culpa de cada divergència amb proves, i deixa un prompt llest per aplicar cada correcció. Fes-la servir quan es demani revisar dies, comparar les dues apps, investigar per què un dia no surt bé, o buscar bugs litúrgics. Exemples "revisa del 20 al 24 d'agost", "què passa el 2026-08-24", "compara les dues apps aquesta setmana".
---

# Revisió dia a dia: cpl-app ↔ saints-app

Compara, per a cada dia i cada camp, què resa cpl-app i què resarà saints-app; classifica
cada diferència en un dels cinc veredictes; i deixa la feina preparada perquè algú altre
l'apliqui.

**Aquesta skill no escriu res fora del seu `run/`.** No toca `cpl-app.db`, no fa commits, no
aplica correccions. El que produeix és un informe i, per a cada correcció, un prompt per
enganxar en un fil nou. Aquesta és una decisió explícita: investigar i corregir són dues
feines amb riscos diferents.

## Els cinc veredictes

| | | què se'n fa |
|---|---|---|
| **1** | error de cpl-app | prompt: fix + test + dossier `CPL-LIT-NNN` |
| **2** | error de saints-app / eprex | prompt: proposta amb els ids concrets (repo aliè) |
| **3** | error de les nostres eines | prompt: fix + tornar a córrer el join |
| **4** | no és error | només s'informa |
| **5** | no ho sé | només s'informa, amb el que falta per decidir |

**El llistó per dir «error»**: fonts externes en 2-3 idiomes — però només per a la
**identitat** litúrgica del camp, no per a la seva redacció catalana; per a això, vegeu el
parany 7. Sense proves el veredicte és **5**, mai una conjectura. Val també la prova interna: si eprex ja té la casella bona per a
una celebració germana, això és prova sense sortir de les dades.

## Com córrer-la

```sh
make review DATES=2026-08-20,2026-08-21,2026-08-22,2026-08-23,2026-08-24
```

O pas a pas, si cal depurar:

```sh
# 1. cpl-app amb els seus Serveis reals (control ferial de Vespres CORREGIT — vegeu paranys)
DATES=… OUT=migration-to-saints/review/run/cpl-days.json \
  npx jest migration-to-saints/review/resolve-cpl-days.test.js --silent

# 2. cada camp, en català i en espanyol, amb la causa de cada casella retinguda
node migration-to-saints/review/build-rows.js

# 3. d'on es pot treure el que sembla no tenir font
node migration-to-saints/review/commons-proposal.js

# 4. l'informe + els prompts
node migration-to-saints/review/build-report.js
```

Després, publica `run/review.html` com a artifact i dona l'enllaç.

## Els tres canals de comparació

Quin canal s'aplica depèn de l'estat de la casella, i el canal decideix la força de la prova.

- **C1 · ca ↔ ca** — la casella catalana ja té text. Diff directe amb `lib/text-key.js`. Concloent.
- **C2 · cpl ↔ es** — el català encara és buit. Es compara la identitat litúrgica contra
  l'**espanyol de la mateixa casella**, que és la mateixa ranura de l'índex compartit i està
  complet. Detecta «salm equivocat» encara que el català no estigui fet.
- **C3 · forense** — per a tota casella retinguda: `conflictDetail()` diu qui la comparteix,
  quina variant vol aquest dia i qui es trencaria.

**C3 no és opcional.** És d'on han sortit totes les troballes reals. I la maniobra clau és
**perseguir la minoria fora dels dies demanats**: quan una celebració discrepa amb ella
mateixa segons l'any, aquelles dates són on hi ha el bug. El CPL-LIT-002 eren 2 dies de 729.

## Dos eixos, mai un sol número

- **Contingut** — resen el mateix les dues apps? Es calcula **amb** `fromFerial`.
- **Progrés** — quant del que es pot migrar s'ha migrat? Es calcula **sense** `fromFerial`,
  perquè la pàgina de saints-app obre per la pestanya del sant. Així quadra amb el panell.

El denominador del progrés **no és el total de caselles**: és `fetes + retingudes + per collir`.
Poca cobertura vol dir «encara no fet», no «trencat» — no s'ha de pintar de vermell.

## Forma de l'informe

Dia primer. Una línia de resum a dalt i prou; després els cinc dies, i res més pel mig. Cada
troballa viu **dins del dia** on es veu, amb les proves plegades darrere d'un `<details>`.
Els prompts van al final, perquè són el que es fa després de llegir, no mentre es llegeix.

## Paranys

1. **No facis servir `migration-to-saints/cpl-day.test.js`.** El seu control ferial de Vespres
   és el mateix objecte que les Vespres renderitzades (`MergeVespersWithCelebration` no en fa
   còpia), o sigui que marca els 19 camps com a ferials sempre i inventa divergències falses a
   **totes** les memòries. Fes servir `review/resolve-cpl-days.test.js`, que pren el control
   amb un `ObtainVespers()` fresc. Mentre F2 no s'apliqui, això és obligatori.
2. **`fromFerial` és imprescindible** per a la comparació de contingut a les memòries.
3. El manifest cobreix **2017-01-01 → 2026-12-30**, resolt contra `diocese-barcelona`.
4. Marques de l'espanyol a treure abans de comparar: `_cursiva_`, `$℣. $`.
5. Cites: comparar **llibre + capítol**, no els versets. «Salm 109» ≡ «Salmo 109, 1-5. 7»;
   «2C 12, 9b-10» ≡ «2 Co 12, 9b-10». Cal treure `Cf.` i el marcador `Càntic`.
6. Les antífones de diumenge duen **els tres cicles en una sola casella**; cpl-app en dona un
   per data. Conflicte estructural, no error de ningú.
7. **La concordança entre llengües no prova res sobre la redacció catalana.** El castellà,
   l'anglès i l'italià poden coincidir els tres i el català continuar tenint raó: són
   diferències d'edició (D-001, D-003). Per a dir que un **text** català és dolent, l'única
   prova és el **volum imprès** del CPL — que en Pau té. Per a dir que una **estructura** és
   dolenta (quin salm, quina setmana del salteri, quin ofici), les fonts externes sí que valen.

## On són les coses

| | |
|---|---|
| `review/resolve-cpl-days.test.js` | cpl-app real, amb el control ferial bo |
| `review/build-rows.js` | cada camp, ca + es, amb conflicte i causa |
| `review/commons-proposal.js` | `OficisComuns` → caselles sense font |
| `review/findings.js` | les troballes, com a dades, lligades al seu dia |
| `review/fix-prompts.js` | una troballa → un prompt per enganxar |
| `review/build-report.js` | l'informe |
| `day-check.js` · `day-compare.js` | les eines que ja hi havia; no les dupliquis |
| `cpl-bugs/CPL-LIT-*.md` | el model de dossier a seguir |

## Fonts externes que funcionen

- `apps.idteologia.org` — castellà, **per data exacta**. La més útil.
- `ebreviary.com` — anglès, PDF per celebració. Cal llegir el PDF, no el HTML.
- `chiesacattolica.it` — italià, dona el rang però no la salmòdia.
- `liturgiadeleshores.cat` — català, **només el dia en curs**. Rarament utilitzable.
- `divineoffice.org` respon 403; `liturgies.net` té URLs inestables.
