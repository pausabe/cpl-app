# D-002 — Als set dies d'ofici propi, el català de saints-app resa el Comú i perd la fèria

| | |
|---|---|
| **Estat** | **Tancada** — decidit per en Pau el 3 de setembre de 2026 |
| **Component** | saints-app · pestanya única de les 7 memòries amb cicle `MEMORY_PROPER` |
| **Veredicte** | No és error de ningú: és una **tria**, i va en la mateixa direcció que la [D-001](D-001-el-comu-a-les-memories.md) |
| **Correcció** | A les eines, no a cpl-app: [MIGRA-004](../../REGISTRE-DE-CANVIS.md#migra-004) |
| **cpl-app** | **No es toca.** Ni codi, ni base de dades, ni `.sql` |

## La pregunta

La D-001 va decidir que, els dies de memòria, la **pestanya del sant** de saints-app tiraria del
Comú en català com ja fa en castellà, encara que cpl-app resi la fèria. Allò es podia dir sense
angoixa perquè aquells dies l'app ensenya **dues pestanyes**: qui vulgui la fèria la té a un toc.

Sis celebracions no en tenen dues. El seu cicle a l'índex és `MEMORY_PROPER`, i
`saints-app/src/views/divineOffices/LaudesPage.vue:576` —`isTodayMemory && cycle !==
"MEMORY_PROPER"` és la condició que va a buscar el bessó `_Ferial`— no els dona cap segona
pestanya:

> santa Agnès · els sants Àngels de la Guarda · **sant Martí de Tours** ·
> la Mare de Déu dels Dolors · la Mare de Déu del Roser · el Martiri de sant Joan Baptista

*(Aquesta llista es va escriure amb set noms. Sants Basili el Gran i Gregori Nazianzè hi eren, i
eren l'exemple amb què es va trobar el problema; en portar `dev` a la branca el mateix dia
—[SA-06](../../REGISTRE-DE-CANVIS.md#sa-06)— es va veure que **eprex ja els havia reclassificat a
`MEMORY_FERIAL2`**. El 2 de gener, doncs, ja té pestanya ferial i no entra en aquesta decisió.)*

Allà la casella del sant i la de la fèria **són la mateixa casella**. O sigui que el Comú i el
text ferial de cpl-app no es reparteixen la feina: competeixen per una sola ranura, i només un
dels dos hi pot ser.

## Què hi havia, i per què no s'aguantava

Res. Les dues fonts hi escrivien i el join no podia triar, o sigui que la casella quedava
**buida en català per sempre**. L'exemple amb què es va trobar, `lectura_breve_citas/66` el 2 de
gener —abans que eprex reclassifiqués aquell dia—, ho ensenya bé:

| | |
|---|---|
| **el castellà de la casella** | `Hb 13, 7-9a` — «Acordaos de vuestros dirigentes, que os anunciaron la palabra de Dios…» |
| **el que hi posava el 3 de setembre** (158 dates) | `He 13, 7-9a` — «Feu memòria dels qui us van guiar i us van anunciar la paraula de Déu…» |
| **el que hi posava el 2 de gener** (9 dates) | `Is 49, 8-9` — «Et destino a ser aliança del poble…», la lectura de la **fèria de Nadal** |

Dos textos, una casella, conflicte etern. I fixem-nos que el 3 de setembre hi posava,
literalment, el mateix que el castellà.

## La decisió

**El català imita el criteri litúrgic d'eprex.** Aquells set dies, la casella se la queda el
**Comú**, i el text ferial que cpl-app renderitza **no s'observa**. Conseqüència que consta per
escrit perquè és visible i no té marxa enrere dins de l'app:

> Els set dies, l'usuari català de saints-app **no podrà arribar a l'ofici ferial de cap
> manera**. Veurà el mateix que l'usuari castellà. Qui vulgui la fèria l'ha de resar a cpl-app,
> que no canvia.

És lícit per l'OGLH 235b («del Comú **o** de la fèria»), i és el que ja fa el castellà avui. El
que hi perdem és el mirall de l'edició catalana; el que hi guanyem és una regla única per a
totes les llengües de l'app —el mateix bescanvi que ja es va acceptar a la D-001, ara sense
xarxa.

## Els dos límits que ho fan segur

**1 · Només els camps que el Comú cobreix.** El pou de `poolByField()` són set: la cita i el
text de la lectura breu, els sis trossos del responsori, l'antífona del càntic evangèlic i els
tres de precs. **Els salms i l'himne no s'hi toquen**, i han de no tocar-s'hi: l'OGLH 235a diu
que la salmòdia és sempre de la fèria, i el Comú no en porta. El 2 de gener, 17 dels 20 camps
de cada hora vénen de la fèria; només 6 canvien de mà.

**2 · Només amb prova, i la prova és la cita castellana.** El Comú es queda el camp si
`pickedBy` diu `citation` o `title+citation` — o sigui, si la cita de la lectura breu que hi ha
a la casella castellana **nomena la família del Comú**. Si el castellà hi dugués la lectura de
la fèria (`Is 49, 8-9`), voldria dir que eprex apunta aquell dia a la casella del dia i no a la
del Comú, cap família encaixaria, `pickedBy` cauria a `title` i **no s'hi escriu res**: el dia
es queda exactament com abans. Vegeu `commonOverrides()` a `lib/common-office.js`.

Per això dels 7 dies n'hi ha un, els **Àngels de la Guarda**, on no es toca res: no se li
infereix cap Comú.

## Què ha canviat, mesurat

Mesurat **sobre l'índex de `dev` i la sonda refeta el 3-09-2026**, corrent el join amb el pedaç
i sense, perquè el número no barregi aquesta decisió amb l'efecte del merge:

| | sense el pedaç | amb el pedaç |
|---|---|---|
| ids resolts, passada sencera | 7.179 | **7.188** |
| ids pendents | 791 | **782** |
| caselles del Comú observades | 10.793 en 729 hores | **10.896 en 745 hores** |

Els **9 ids** que se'n desbloquegen són tots `preces_contenido`, i tots de **sant Martí de Tours**:
`2264`-`2267` a Laudes i `7273`-`7277` a Vespres, els precs del Comú de pastors. Cap id que abans
es resolgués no s'ha perdut.

De les sis celebracions, als **Àngels de la Guarda** no se'ls infereix cap Comú, o sigui que
allà no es toca res. I a les altres quatre el Comú ja coincidia amb el que hi havia o la cita
castellana no el nomenava, que és la guarda funcionant.

**Compte a no atribuir-li de més.** El 3 de setembre passa de 43/57 a **53/57 (93%)** i de 13
conflictes a **3**, i el 2 de gener de 22/57 a **46/57 (81%)**; però això és sobretot del merge
de `dev` i de la sonda refeta, no d'aquesta decisió.

## El que queda dit i no fet

Els salms del 2 de gener segueixen en conflicte i **no tenen res a veure amb això**:
`salmos_citas/155` diu que el text que cpl-app hi posa aquell dia només coincideix amb 6 de 196
dates. És un altre fil, del dia 2 de gener, i demana la seva pròpia revisió.

## Com es reprodueix

```sh
npx jest migration-to-saints/common-office.test.js     # 20 tests, 6 d'aquesta decisió
npx jest migration-to-saints/join-content.test.js      # passada sencera
node migration-to-saints/export-to-saints-app.js --dry-run
node migration-to-saints/day-check.js 2026-11-11       # sant Martí de Tours, el dia que se'n beneficia
```

I per veure'n l'efecte aïllat, fer que `isProperOnly()` retorni `false`, tornar a córrer el join
i comparar els totals.
