---
name: revisio-dia
description: Analitza un dia concret camp a camp —les set hores de l'ofici i les lectures de la missa— de cpl-app contra saints-app (eprex) i respon al terminal per què aquell dia no és al 100%, de qui és la culpa de cada forat amb proves, quines accions concretes i quines decisions calen per arribar-hi. És el punt de partida per treballar un dia fins al 100%, no un informe. Sense data, el dia d'avui. Fes-la servir quan es demani avaluar o revisar un dia, comparar les dues apps, investigar per què un dia no surt bé, o buscar bugs litúrgics. Exemples "avalua el dia d'avui", "què passa el 2026-08-24", "per què el 8 de setembre no és al 100%".
---

# Revisió d'un dia: què el separa del 100%

Compara, camp a camp, què resa cpl-app i què resarà saints-app aquell dia; classifica cada
forat en un dels cinc veredictes; i respon **al terminal** amb una anàlisi per començar a
treballar: per què no és al 100%, de qui és la culpa, què cal fer i què cal decidir.

**El resultat és la resposta al fil, no un document.** Res d'artefactes, ni de publicar
`review.html`, ni de fitxers d'informe: en Pau hi seguirà treballant en aquest mateix fil, i
el que necessita és saber per on començar.

**Quin dia**: el que es demani; si no se'n diu cap, o es diu «avui», el d'avui (`date +%F`).
Si es demanen diversos dies, la mateixa anàlisi per a cadascun, i al final només el que tinguin
en comú (una acció que arregla tres dies val més que tres accions).

**Què cobreix**: l'Ofici de lectura, Laudes, Tèrcia, Sexta, Nona, Vespres, l'Invitatori i les
lectures de la missa — entre 130 i 145 camps per dia. Les Completes no hi entren: no passen per
l'índex compartit d'ids i es migren a part (PLAN §16). Els comentaris de la missa tampoc: queden
fora d'abast en català per decisió.

Les llistes de camps surten de `day-check.js` (`FIELDS`, `OFFICE_FIELDS`, `MASS_FIELDS`) i les
llegeixen tant el comparador com `build-rows.js`, **derivades, no copiades**: una hora nova hi
entra sola. Ho van ser fins al 8 de setembre de 2026, i mentrestant l'Ofici es revisava amb el
vocabulari de Laudes —11 dels seus 25 camps— i la missa no es revisava gens.

**Aquesta skill no corregeix res.** No toca `cpl-app.db`, no fa commits, no aplica
correccions: acaba amb l'anàlisi i s'espera. Aplicar-les ve després, quan en Pau triï per on
començar. Investigar i corregir són dues feines amb riscos diferents. L'única escriptura és
`run/` i, quan una investigació tanca un forat, la troballa nova a `review/findings.js` (amb
el seu `CLAIMS`), perquè la passada següent ja la conegui i no la torni a marcar com a
«sense investigar».

## Els cinc veredictes

| | | què se'n fa |
|---|---|---|
| **1** | error de cpl-app | acció: fix + test + dossier `CPL-LIT-NNN` |
| **2** | error de saints-app / eprex | acció: proposta amb els ids concrets (repo aliè) |
| **3** | error de les nostres eines | acció: fix + tornar a córrer el join |
| **4** | no és error | només s'informa |
| **5** | no ho sé | només s'informa, amb el que falta per decidir |

**El llistó per dir «error»**: fonts externes en 2-3 idiomes — però només per a la
**identitat** litúrgica del camp, no per a la seva redacció catalana; per a això, vegeu el
parany 7. Sense proves el veredicte és **5**, mai una conjectura. Val també la prova interna: si eprex ja té la casella bona per a
una celebració germana, això és prova sense sortir de les dades.

## Com córrer-la

```sh
make review DATES=2026-09-08
```

L'última passa és `day-gap.js`, que escriu en text pla **tot el que no és al 100%** del dia:
cada camp divergent amb la troballa que l'explica o `SENSE INVESTIGAR`, les caselles
retingudes agrupades pel conflicte que les reté (amb quants dies trencaria cada tria), les que
no tenen font, i les troballes del dia. És la matèria primera de la resposta, no la resposta:
no l'enganxis tal qual.

O pas a pas, si cal depurar:

```sh
# 1. cpl-app amb els seus serveis reals, a través de src/liturgy-export
DATES=… OUT=migration-to-saints/review/run/cpl-days.json \
  npx jest migration-to-saints/review/resolve-cpl-days.test.js --silent

# 2. cada camp, en català i en espanyol, amb la causa de cada casella retinguda
node migration-to-saints/review/build-rows.js

# 3. d'on es pot treure el que sembla no tenir font
node migration-to-saints/review/commons-proposal.js

# 4. la distància al 100%, en text
node migration-to-saints/review/day-gap.js 2026-09-08
```

`build-report.js` (`make review-html`) encara fa la pàgina per a escombrar molts dies d'un cop,
però aquesta skill no la fa servir ni la publica.

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

## Com es treballa el dia

1. Corre el pipeline i llegeix `day-gap.js`.
2. **Tota línia `SENSE INVESTIGAR` s'investiga abans de respondre**, amb C3 i perseguint la
   minoria fora del dia. Cada investigació acaba en un veredicte (i, si és 1-3, en una troballa
   a `findings.js`). Si n'hi ha massa per a una sola passada, digues quantes en queden i
   quines, no les amaguis dins d'una xifra.
3. Les **retingudes** no són divergències però sí forat de progrés: per a cada grup, digues
   quina tria l'allibera i què trencaria (`triar la majoritària trenca N de M dies`). Si la
   tria no és tècnica, és una decisió d'en Pau.
4. Torna a córrer `day-gap.js` si has afegit troballes, perquè les xifres de la resposta
   siguin les de després d'investigar.

## Forma de la resposta

Al terminal, en català, i **per causes, no per camps**: onze antífones que falten per un sol
override d'eprex són una causa, no onze línies. Sense taules de camps ni textos llargs; la
prova, en una frase i amb l'enllaç o l'id que la sosté.

1. **On som** — una línia: el dia i la celebració, contingut `X/Y (Z%)`, progrés `A/B (C%)`, i
   la distància al 100% en caselles.
2. **Per què no és al 100%** — una entrada per causa: quantes caselles, **el culpable**
   (veredicte 1-5), la prova en una frase, i l'estat (obert, corregit i pendent de
   reexportar, proposat i pendent d'enviar…).
3. **Accions per arribar-hi** — llista **ordenada per caselles que allibera respecte de
   l'esforç**. Cadascuna concreta: què es fa, on (fitxer, taula, repo), qui ho ha de fer
   (nosaltres; cpl-app → `CPL-LIT-NNN`; eprex → proposta), quantes caselles mou i de què
   depèn. Una acció que depèn d'una decisió ho diu.
4. **Decisions que et toquen** — cada una com a pregunta tancada, amb les opcions, la teva
   recomanació i què desbloqueja. Si ja té número (`D-00N` al registre), cita'l.
5. **El 100% real** — el que no s'hi arribarà mai i per què (veredicte 4, conflictes
   estructurals com els tres cicles de diumenge, D-001), perquè el sostre del dia quedi dit i
   no es persegueixi.
6. **Per on començaria** — una sola recomanació, i atura't aquí.

Els prompts de `fix-prompts.js` no s'enganxen a la resposta. Si en Pau vol portar una acció a
un fil nou, `node migration-to-saints/review/fix-prompts.js` els genera.

## Paranys

1. **El control ferial de Vespres ja és bo per a tothom** (MIGRA-013, 25-IX-2026). Es pren
   fresc dins de `src/liturgy-export/resolveDay.ts`, abans que `obtainHoursLiturgy` hi escrigui
   res, o sigui que `cpl-day.test.js` ja no inventa divergències a les memòries i
   `review/resolve-cpl-days.test.js` ja no en duu còpia: crida el mateix resolutor. Segueix sent
   el que has de fer servir —és el que sap les set hores i la missa—, però ara perquè és el que
   escriu el fitxer que la revisió llegeix, no per esquivar cap bug.
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
| `review/resolve-cpl-days.test.js` | cpl-app real; 43 línies sobre `lib/cpl-day-resolver.js` |
| `src/liturgy-export/` | el motor de cpl-app, tipat: l'única porta d'entrada (MIGRA-012) |
| `review/build-rows.js` | cada camp, ca + es, amb conflicte i causa |
| `review/commons-proposal.js` | `OficisComuns` → caselles sense font |
| `review/findings.js` | les troballes, com a dades, lligades al seu dia |
| `review/day-gap.js` | la distància al 100% d'un dia, en text: la base de la resposta |
| `review/fix-prompts.js` | una troballa → un prompt per enganxar (només si es demana) |
| `review/build-report.js` | la pàgina de molts dies (`make review-html`); aquí no s'usa |
| `day-check.js` · `day-compare.js` | les eines que ja hi havia; no les dupliquis |
| `cpl-bugs/CPL-LIT-*.md` | el model de dossier a seguir |

## Fonts externes que funcionen

- `apps.idteologia.org` — castellà, **per data exacta**. La més útil.
- `ebreviary.com` — anglès, PDF per celebració. Cal llegir el PDF, no el HTML.
- `chiesacattolica.it` — italià, dona el rang però no la salmòdia.
- `liturgiadeleshores.cat` — català, **només el dia en curs**. Rarament utilitzable.
- `divineoffice.org` respon 403; `liturgies.net` té URLs inestables.
