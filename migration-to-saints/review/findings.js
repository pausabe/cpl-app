// The findings of one review run, as data.
//
// Each finding belongs to the days it shows up on, so the report can hang it under the day
// instead of in a wall at the top: the way the day-by-day view is read is "is there
// something red on the 20th? — ah, this — right", and a finding that lives away from its
// day breaks that.
//
// `verdict` is the taxonomy the review is built on:
//   1 cpl-app · 2 saints-app/eprex · 3 our migration tooling · 4 not an error · 5 don't know
//
// `fix` describes what would resolve it. Nothing here is ever applied: the review is
// read-only, and `fix-prompts.js` turns these into instructions to run in another session.

const FINDINGS = [
  {
    id: 'F1',
    verdict: 2,
    days: ['2026-08-24'],
    hours: ['Vespers'],
    headline: 'Les Vespres són l’ofici del dissabte al vespre, no el de la festa',
    detail:
      'De les 26 caselles de Vespres, 25 porten les I Vespres del diumenge. Només l’oració ' +
      'final és pròpia de l’apòstol. 13 són literalment les mateixes caselles que fa servir ' +
      'el 22 d’agost, un dissabte ordinari.',
    table: {
      head: ['camp', 'cpl-app', 'saints-app'],
      rows: [
        ['1r salm', 'Salm 115', 'Salm 140, 1-9 · salmos_citas/11052'],
        ['2n salm', 'Salm 125', 'Salm 141 · salmos_citas/11053'],
        ['Càntic', 'Ef 1, 3-10', 'Fl 2, 6-11 · salmos_citas/11033'],
        ['Lectura breu', 'Ef 4, 11-13', 'Rm 11, 33-36 · lectura_breve_citas/3382'],
        ['Ant. Magníficat', '«Quan el món renaixerà…»', '«El Hijo del hombre ha subido…» · 2057'],
      ],
    },
    why:
      'La casella la comparteixen 127 dies i cpl-app hi aporta dos textos. El Salm 115 els ' +
      'anys 2017, 2018, 2020-2023 i 2026; el Salm 140 el 2019 i el 2024 — els dos anys en què ' +
      'el 24 d’agost va caure en <strong>dissabte</strong>, quan les I Vespres del diumenge ' +
      'desplacen legítimament les II Vespres de la festa. cpl-app encerta els 9 anys; ' +
      'saints-app té una sola entrada i hi ha desat la variant del dissabte.',
    proof: [
      ['Castellà, data exacta', 'Salmo 115 · Salmo 125 · Ef 1,3-10 · lectura Ef 4,11-13 — idèntic a cpl-app', 'https://apps.idteologia.org/index.php?fecha=2026-08-24&r=liturgiaDeLasHoras%2Fespanola&rezo=visperas'],
      ['Anglès, Comú d’apòstols', 'Ps 116:10-19 «Thanksgiving in the Temple» · Ps 126 · Eph 1:3-10 «God our Savior»', 'https://www.ebreviary.com/'],
      ['Prova interna', 'Tomàs, Jaume, Marc i Simó i Judes ja apunten a la casella bona (4760); Bartomeu, Mateu, Andreu i Lluc no', null],
    ],
    fix: {
      where: 'eprex · all_visperas.json',
      summary: 'Repuntar les Vespres de bartholomew_apostle__ANY al Comú d’apòstols, que ja existeix.',
      table: {
        head: ['camp', 'ara', 'hauria de ser'],
        rows: [
          ['primer_salmo_cita', '11052', '4760'],
          ['segundo_salmo_cita', '11053', '3423'],
          ['tercer_salmo_cita', '11033', '11042'],
          ['lectura_biblica_cita', '3382', '3416'],
          ['cantico_evangelico_antifona', '2057', '1419'],
        ],
      },
      note: 'matthew_apostle i luke_evangelist tenen el mateix problema; andrew_apostle només als salms.',
      promptable: true,
    },
  },
  {
    id: 'F2',
    verdict: 3,
    days: ['2026-08-20', '2026-08-21', '2026-08-22', '2026-09-17'],
    hours: ['Vespers'],
    headline: 'El control «Vespres sense celebració» és l’objecte de les Vespres renderitzades',
    detail:
      'Per saber quins camps vénen de la fèria, les eines resolen el dia un segon cop sense ' +
      'la celebració. A Vespres aquest control és el <em>mateix objecte</em> que l’ofici ' +
      'renderitzat, o sigui que la comparació és contra si mateixa i tots els camps surten ferials.',
    why:
      '<code>MergeVespersWithCelebration()</code> comença amb <code>let vespers = ' +
      'withoutCelebrationVespers</code> — sense còpia — i hi escriu la celebració a dins. ' +
      'Comprovat: <code>hoursLiturgy.Vespers === VespersOptions.VespersWithoutCelebration</code> ' +
      'retorna <code>true</code> a la memòria, a la festa i al diumenge. Per a l’app és ' +
      'inofensiu; per a la migració no.',
    impact:
      'El join arxiva l’oració final i l’antífona del Magníficat de cada memòria a la casella ' +
      'de la fèria: 9 col·lectes de sant dins <code>oraciones_finales/3798</code> i 9 antífones ' +
      'dins <code>cantico_evangelico_antifonas/1179</code>.',
    proof: [
      ['Senyal degenerat', '<code>ferialFields.Vespers</code> val 19/19 als cinc dies, sigui quin sigui. A Laudes varia: 16 / 18 / 12 / 19 / 3', null],
      ['Fix validat', 'Amb un <code>ObtainVespers()</code> fresc: 19→16 (Bernat), 19→18 (Pius X), 19→19 (diumenge), 19→4 (festa)', null],
    ],
    fix: {
      where: 'migration-to-saints/lib/cpl-day-resolver.js · join-content.test.js',
      summary: 'Prendre el control amb una crida fresca, com ja es fa a Laudes.',
      diff: `const ferial = {
    Laudes: LaudesService.ObtainLaudes(todayMasters, ldi.Today, new Laudes(), settings),
-   Vespers: hoursLiturgy.VespersOptions.VespersWithoutCelebration,
+   Vespers: VespersService.ObtainVespers(todayMasters, ldi.Today, settings),
};`,
      note: 'Cal tornar a córrer el join després.',
      promptable: true,
    },
  },
  {
    id: 'F3',
    verdict: 5,
    days: ['2026-08-22', '2026-08-23'],
    headline: 'Les antífones del càntic evangèlic del diumenge duen els tres cicles en una casella',
    detail:
      'A saints-app una casella d’antífona de diumenge conté els anys A, B i C alhora ' +
      '(<code>$ Año A: $… $Año B: $…</code>). cpl-app en desa un per data. El model no ho pot ' +
      'expressar, i per això la casella queda bloquejada. No és error de cap de les dues apps.',
    why:
      'Dins de l’any A, que és el del 2026, les dues apps no nomenen els mateixos versets: ' +
      'a I Vespres cpl-app dona Mt 16,16 i saints-app Is 22,22; a Laudes, Mt 16,18 contra ' +
      'Mt 16,16. A II Vespres coincideixen (Mt 16,19), cosa que descarta un desplaçament ' +
      'sistemàtic. <strong>No tinc prova de quina és la bona</strong> — ' +
      '<code>liturgiadeleshores.cat</code> només serveix el dia en curs.',
    fix: {
      where: '—',
      summary: 'Res a corregir. Cal decidir si eprex parteix la casella per cicle, o si aquestes antífones es tradueixen a part.',
      note: 'La qüestió dels versets de l’any A queda oberta i necessita el llibre català.',
      promptable: false,
    },
  },
  {
    id: 'F4',
    verdict: 3,
    days: ['2026-08-20', '2026-08-21', '2026-08-22'],
    headline: 'El join no cull `OficisComuns`: 59 caselles semblen sense font i no ho són',
    detail:
      'Les caselles «sense dades» de les memòries no són irrecuperables. El text català és a ' +
      '<code>cpl-app.db</code>, a la taula <code>OficisComuns</code> — 48 files amb els 10 ' +
      'Comuns per estació litúrgica. El join no hi arriba perquè només enregistra el que ' +
      'cpl-app <em>renderitza</em>, i a les memòries cpl-app resa la fèria.',
    why:
      'Les 527 files de <code>santsMemories</code> tenen <code>Categoria = "0000"</code>, i ' +
      '<code>ObtainCommonOffices</code> retorna un ofici buit per a aquest valor. Això no és un ' +
      'error de cpl-app: és una decisió editorial que l’OGLH 235b permet. Però el contingut hi és.',
    proof: [
      ['La cita quadra', 'La pestanya de sant Bernat demana <code>lectura_breve_citas/114</code>, «Sb 7, 13-14» en espanyol. El Comú de doctors (<code>07aO</code>) hi té «Sa 7, 13-14»', null],
      ['I el text també', '«L’Església proclama * La saviesa dels sants» ≡ «Que todos los pueblos proclamen * la sabiduría de los santos»', null],
      ['Cobertura mesurada', '22/24 (Bernat · Comú de doctors), 21/24 (Pius X · Comú de pastors, papa), 16/18 (Mare de Déu Reina · Comú de la Mare de Déu)', null],
    ],
    fix: {
      where: 'migration-to-saints/join-content.test.js',
      summary:
        'Afegir OficisComuns com a segona font del join per a les caselles de la pestanya del ' +
        'sant. El comú es dedueix del títol de la memòria i es verifica per la cita.',
      note:
        'El que la cita no confirmi s’ha de deixar marcat per revisar: dins d’un mateix grup ' +
        '(06a prevere / 06b bisbe / 06c papa) la cita de la lectura breu és la mateixa.',
      promptable: true,
    },
  },
  {
    id: 'F5',
    verdict: 2,
    days: ['2026-09-17'],
    hours: ['Vespers'],
    headline: 'saints-app no té I Vespres: la vigília de cada solemnitat resa l’ofici de la fèria',
    detail:
      'La tarda anterior a una solemnitat, cpl-app resa les I Vespres de la solemnitat — com ' +
      'mana l’OGLH 61. saints-app resa les Vespres del dia que acaba. No és que triï malament: ' +
      '<strong>no té cap casella on posar-les</strong>.',
    table: {
      head: ['vigília', 'cpl-app resa', 'saints-app llegeix'],
      rows: [
        ['28-VI-2018 (st. Pere i st. Pau)', 'Salm 116 · Salm 147 · Rm 1, 1-2.7', 'Salm 143-I · salmos_citas/152'],
        ['24-XII (10 anys seguits)', 'I Vespres de Nadal', 'Vespres de fèria d’Advent · ant. 1'],
        ['25-XII (per comparar)', '—', 'salmos_citas/11025 · ant. 1129'],
      ],
    },
    why:
      'L’índex de saints-app té una sola entrada per celebració (<code>peter_and_paul_apostles__ANY</code>, ' +
      '<code>nativity_of_the_lord__ANY</code>): els 494 sufixos són <code>ANY</code>, ' +
      '<code>MEMORY_*</code> i <code>SPECIAL</code>, i cap no distingeix I de II Vespres. Sondejada ' +
      'l’app real amb <code>app-id-probe.js</code>, els deu 24 de desembre del manifest apunten a ' +
      'la salmòdia ferial del dia de la setmana que toqui (<code>11040</code>, <code>11058</code>, ' +
      '<code>11256</code>, <code>11026</code>, <code>11052</code>, <code>11208</code>…) i cap no ' +
      'apunta mai a les caselles de Nadal. Els deu 28 de juny donen sempre <code>salmos_citas/152</code>.',
    impact:
      'Cada vigília de solemnitat de l’any. I, de retruc, és l’origen de <strong>F6</strong>, que ' +
      'reté les 25 caselles de Vespres d’aquest dia.',
    proof: [
      ['Antífona decisiva', 'El 28-VI-2018 cpl-app dona al Magníficat «Els gloriosos Apòstols de Crist, que tant s’estimaven durant la vida, no es van separar tampoc en la mort» — <em>Gloriosi principes terrae</em>, I Vespres de sant Pere i sant Pau. No hi ha lectura alternativa.', null],
      ['Salmòdia', 'Salm 116 (117) · Salm 147 · càntic = I Vespres del Comú d’apòstols. La lectura breu Rm 1, 1-2.7 hi va lligada.', null],
      ['Prova interna', 'A <code>app-cell-map.json</code>, 24-XII i 25-XII no comparteixen cap casella de Vespres cap any: la vigília sempre cau al costat ferial.', null],
    ],
    fix: {
      where: 'eprex · índex de day_specific_texts',
      summary:
        'Cal una ranura de I Vespres per a les solemnitats i festes que en tenen (un sufix nou, ' +
        'tipus <code>__VESPERS1</code>, o una entrada pròpia de vigília) i que el resolutor la ' +
        'triï la tarda anterior.',
      note:
        'És un canvi de model, no de dades: fins que no hi sigui, el join no pot col·locar les I ' +
        'Vespres enlloc — vegeu F6 per al pedaç del nostre costat.',
      promptable: true,
    },
  },
  {
    id: 'F6',
    verdict: 3,
    days: ['2026-09-17'],
    hours: ['Vespers'],
    headline: 'El join arxiva les I Vespres de l’endemà a la casella ferial del dia que acaba',
    detail:
      'Com que saints-app no té on posar-les (F5), el join arxiva les I Vespres que cpl-app resa ' +
      'la vigília sota la clau del <em>dia que acaba</em>. La casella ferial es queda amb dos ' +
      'textos incompatibles i es reté — per a tots els altres dies que la comparteixen ' +
      'legítimament.',
    table: {
      head: ['casella', 'majoria', 'minoria arxivada', 've de'],
      rows: [
        ['salmos_citas/11256', 'Salm 143-I (60 dies)', 'Salm 116', '2018-06-28'],
        ['lectura_breve_citas/3431', 'Col 1, 23 (43 dies)', 'Rm 1, 1-2.7', '2018-06-28'],
        ['salmos_citas/11257', 'Salm 143-II (69 dies)', 'Salm 147', '2018-06-28 · 2020-12-24 · 2026-12-24'],
      ],
    },
    why:
      'El join sap que resoldre el dia D arriba fins a D+1 (<code>join-content.test.js:403</code>: ' +
      '«D’s first Vespers needs D+1»), però etiqueta el resultat amb la clau de D igualment. Cap ' +
      'fitxer del pipeline conté cap noció de <em>primeres vespres</em>.',
    impact:
      'Les <strong>25 caselles de Vespres</strong> d’aquest dia — l’hora sencera — estan retingudes ' +
      'per una sola data, el 28-VI-2018. Sis més ho estan pel 24 de desembre. La casella ' +
      '<code>salmos_citas/11256</code> la comparteixen 60 dates: una vigília mal arxivada les bloqueja totes.',
    proof: [
      ['Comptat', 'De les 51 caselles en conflicte del dia, 25 tenen el 28-VI-2018 com a única minoria i 6 el 24-XII.', null],
      ['cpl-app hi encerta', 'A 2018-06-28 cpl-app dona Laudes de sant Ireneu (ant. «Ireneu, que vol dir home de pau…») i Vespres de sant Pere i sant Pau. Les dues coses són correctes.', null],
      ['Culpa mal atribuïda', 'L’eina imputa aquestes caselles a «Sant Ireneu — cpl-app només resa la fèria». Ni és Ireneu ni és la fèria: són les I Vespres de l’endemà.', null],
    ],
    fix: {
      where: 'migration-to-saints/join-content.test.js',
      summary:
        'Detectar que el dia D+1 té I Vespres (solemnitat, festa del Senyor o diumenge) i, en ' +
        'aquest cas, no arxivar les Vespres de D a la casella de D.',
      note:
        'Mentre eprex no tingui ranura (F5), n’hi ha prou de deixar-les fora del recompte de ' +
        'variants: el que desbloqueja les altres dates no és desar-les, és no embrutar la casella. ' +
        'Cal tornar a córrer el join i comparar els pendents abans/després.',
      promptable: true,
    },
  },
  {
    id: 'F7',
    verdict: 2,
    days: ['2026-09-17'],
    hours: ['Laudes'],
    headline: 'El Naixement de sant Joan Baptista desapareix del calendari els anys 2017 i 2022',
    detail:
      'Al manifest 2017-2026 resolt contra <code>diocese-barcelona</code>, la solemnitat del ' +
      'Naixement de sant Joan Baptista surt vuit anys i en falta dos. No es trasllada: ' +
      's’esvaeix.',
    table: {
      head: ['any', 'litcal hi diu', 'hauria de ser'],
      rows: [
        ['2017-06-24', 'immaculate_heart_of_mary (memòria obligatòria)', 'Naixement de sant Joan Baptista (solemnitat)'],
        ['2022-06-24', 'most_sacred_heart_of_jesus ✔', 'correcte — el Sagrat Cor té preferència'],
        ['2022-06-23', 'ordinary_time_12_thursday (fèria)', 'Naixement de sant Joan Baptista, traslladat'],
      ],
    },
    why:
      'El 2017 una <em>memòria obligatòria</em> desplaça una <em>solemnitat</em>, cosa que la taula ' +
      'de dies litúrgics no permet en cap cas. El 2022 el Sagrat Cor sí que guanya el 24 de juny ' +
      '(solemnitat del Senyor), però una solemnitat impedida es <strong>trasllada</strong>, no ' +
      's’omet: cpl-app la posa al dijous 23, i litcal no la posa enlloc.',
    impact:
      '24 de les 51 caselles d’aquest dia — pràcticament totes les de Laudes — estan retingudes ' +
      'perquè el join arxiva el Laudes del 23-VI-2022 (Ml 3, 23-24; ant. «Zacaries digué aquestes ' +
      'paraules profètiques…») a la casella ferial del dijous de la setmana IV.',
    proof: [
      ['Castellà, data exacta', '<em>aciprensa.com</em> dona 24-VI-2017 = «Natividad de San Juan Bautista (Solemnidad)», i 23-VI-2022 igual', 'https://www.aciprensa.com/calendario/calendario.php?dia=24&mes=6&ano=2017'],
      ['Anglès, data exacta', '<em>catholicculture.org</em> dona 24-VI-2017 = «Solemnity of the Birth of St. John the Baptist»; el 23-VI-2022, «Solemnity of the Nativity of St. John the Baptist»', 'https://www.catholicculture.org/culture/liturgicalyear/calendar/day.cfm?date=2017-06-24'],
      ['Italià', 'Diòcesis italianes (Pàdua, Lodi) van publicar <em>disposizioni</em> per a la coincidència del 2022: la solemnitat es mou, no es suprimeix', 'https://www.diocesi.lodi.it/disposizioni-data-la-coincidenza-della-solennita-della-nativita-di-san-giovanni-battista-con-quella-del-sacro-cuore-di-gesu/'],
      ['Prova interna', 'litcal la col·loca bé els altres vuit anys (2018-2021, 2023-2026): la regla hi és, falla només quan el 24 de juny està ocupat', null],
    ],
    fix: {
      where: 'litcal · resolutor de precedència',
      summary:
        'Una solemnitat impedida s’ha de traslladar al dia lliure més proper, i cap memòria no pot ' +
        'desplaçar-la. Cal revisar els dos casos: memòria contra solemnitat (2017) i trasllat per ' +
        'solemnitat del Senyor (2022 → 23 de juny, com fa cpl-app i com dona el calendari castellà).',
      note:
        'Repositori aliè: deixar la proposta escrita amb les dates i els ids concrets, no tocar-hi.',
      promptable: true,
    },
  },
  {
    id: 'F8',
    verdict: 2,
    days: ['2026-09-17', '2026-09-04'],
    headline: 'Del 2 al 5 de gener saints-app resa el salteri una setmana enrere',
    resolved: 'SA-08, corregit el 4 de setembre de 2026 (saints-app dae46844b)',
    detail:
      'Els dies de Nadal anteriors a l’Epifania, saints-app substitueix els nou camps de salms ' +
      'pels de <code>ordinary_time_{setmana}_{dia}</code>. La setmana que hi posa és sempre ' +
      '<strong>la de romcal menys una</strong>.',
    table: {
      head: ['data', 'romcal i cpl-app', 'saints-app resa', ''],
      rows: [
        ['2026-01-05 (dilluns)', 'setmana II · Salm 41', 'setmana I · Salm 5 · <code>salmos_citas/156</code>', '✗'],
        ['2025-01-02 (dijous)', 'setmana I · Salm 56', 'setmana IV · Salm 142 · <code>salmos_citas/43</code>', '✗'],
        ['2018-01-02 (dimarts)', 'setmana I · Salm 23', 'setmana IV · Salm 100 · <code>salmos_citas/96</code>', '✗'],
        ['2017-01-03 (dimarts)', 'setmana II · Salm 42', 'setmana I · Salm 23 · <code>salmos_citas/111</code>', '✗'],
      ],
    },
    why:
      'La causa és un pedaç per a un error de romcal que <strong>ja no existeix</strong>: ' +
      '<code>weekNumber = weekNumber + 3</code> sota <code>seasons.includes("CHRISTMAS_TIME")</code>. ' +
      'En mòdul 4, <code>+3</code> és <code>−1</code>: resta una setmana sencera. El comentari del ' +
      'codi ho diu tot —«needed due to ROMCAL ERROR reading week numbers in Christmas»—, però ' +
      'consultat litcal directament, <code>liturgy.psalterWeek</code> dona la setmana bona a les ' +
      '<strong>40 dates</strong> de 2-5 de gener del manifest. El pedaç arregla un error inexistent ' +
      'i en crea un.',
    impact:
      '<strong>29 de les 40 dates</strong> de 2-5 de gener. Les 11 que se salven no és que ' +
      'estiguin bé: són els 6 divendres (el Salm 50 és el mateix les quatre setmanes) i els 5 ' +
      'diumenges. I no és només Laudes: el mateix <code>+3</code> és a <strong>sis stores</strong> ' +
      '—Laudes, Vespres, Ofici de lectura, Tèrcia, Sexta i Nona—, o sigui totes les hores i ' +
      '<strong>totes les llengües</strong>. De retruc, és qui reté les 3 caselles del 4-IX-2026: ' +
      'el 3 i el 4 de gener cauen a la casella dels divendres de les setmanes II/IV quan són de ' +
      'la setmana I.',
    proof: [
      ['Castellà, data exacta', 'El 5-I-2026, dilluns, Laudes obre amb el <strong>Salmo 41</strong> «Como busca la cierva corrientes de agua» — setmana II, que és el que diu cpl-app i no el que resa saints-app', 'https://apps.idteologia.org/index.php?fecha=2026-01-05&r=liturgiaDeLasHoras%2Fespanola&rezo=laudes'],
      ['Castellà, l’altre grup', 'El 2-I-2025 s’encapçala «2 de enero, jueves, <strong>1ª semana</strong>» — i saints-app hi resa la IV', 'https://apps.idteologia.org/index.php?fecha=2025-01-02&r=liturgiaDeLasHoras%2Fespanola&rezo=laudes'],
      ['romcal no s’equivoca', '<code>lit.resolveDay()</code> sobre <code>diocese-barcelona</code>: <code>liturgy.psalterWeek</code> coincideix amb la salmòdia de cpl-app a <strong>40 de 40</strong> dates. Zero discrepàncies', null],
      ['El codi', '<code>laudesStore.ts:149</code>, <code>visperasStore.ts:149</code>, <code>officeStore.ts:276</code>, <code>terciaStore.ts:137</code>, <code>sextaStore.ts:137</code>, <code>nonaStore.ts:137</code>', null],
    ],
    fix: {
      where: 'saints-app · els sis stores de divineOffice',
      summary:
        'Treure el bloc <code>if (seasons.includes("CHRISTMAS_TIME")) weekNumber = weekNumber + 3</code> ' +
        'i fer servir la setmana que dona romcal tal com ve. Cal un test de regressió sobre les 40 ' +
        'dates de 2-5 de gener.',
      note:
        'Repositori aliè, i el canvi afecta <strong>totes les llengües</strong>, no només el català: ' +
        'canvia què resen els usuaris castellans del 2 al 5 de gener a totes les hores. ' +
        '<strong>Conseqüència per a nosaltres:</strong> si s’aplica, les caselles d’aquests dies ' +
        'canvien, o sigui que cal <strong>tornar a passar la sonda i el join</strong> abans de ' +
        'mesurar res.',
      note2:
        '<strong>Ja fet</strong> (SA-08, 4-09-2026): la lògica viu a <code>src/utils/psalterWeek.ts</code> i els sis stores hi criden <code>ordinaryTimeIdFor()</code>. Test detector a <code>tests/unit/utils/psalterWeek.spec.ts</code> — amb el <code>+3</code> tornat a posar, en fallen 6 de 9. Sonda i join <strong>ja refets</strong>: 40 dates resondejades, el 1r salm de Laudes passa de coincidir amb cpl-app en 11 de 40 a <strong>40 de 40</strong>, i les caselles retingudes del join baixen de 766 a <strong>674</strong> sense cap de nova.',
      promptable: false,
    },
  },
  {
    id: 'F9',
    verdict: 3,
    days: ['2026-09-17'],
    headline: 'L’eina diu «litcal no l’aplica» d’una memòria lliure que litcal sí que té',
    detail:
      'D’aquest dia l’informe diu: «cpl-app hi celebra sant Robert Bel·larmino — litcal hi diu ' +
      'fèria simple — la celebració ja és al calendari, però litcal no l’aplica en aquestes dates». ' +
      'Llegit així sembla un defecte, i no ho és: és <strong>exactament</strong> el que ha de passar ' +
      'amb una memòria lliure.',
    why:
      'L’eina ja té l’etiqueta bona — «saints-app ofereix memòria i fèria» — però només la fa servir ' +
      'quan el rang és <code>MEMORIAL</code>. Amb <code>OPTIONAL_MEMORIAL</code> cau al calaix ' +
      '<code>not-applied</code>. A sobre, diu que Bel·larmino és a <code>diocese-vic</code>, quan és ' +
      'a <code>catalonia.json</code> el 17 de setembre (el 18 és el de Vic, desplaçat per la ' +
      'Dedicació de la Catedral): reporta el primer calendari que troba, no el que aplica.',
    impact:
      'Cap sobre les dades. Costa temps: obliga a anar a obrir els calendaris per descartar un ' +
      'error que no existeix, a cada memòria lliure de l’any.',
    proof: [
      ['El calendari el té', '<code>catalonia.json</code> · 9/17 · <code>sant_robert_bellarmino_bisbe_i_doctor_de_l_esglesia</code> · OPTIONAL_MEMORIAL, i també santa Hildegarda de Bingen', null],
      ['I el trasllat de Vic és correcte', 'A <code>santsMemories</code>, dioc <code>ViD</code> mou Bel·larmino i Hildegarda al 18 perquè el 17 hi ha la Dedicació de la Catedral de Vic. cpl-app hi encerta.', null],
    ],
    fix: {
      where: 'migration-to-saints/day-check.js · lib/memorial-ferial.js',
      summary:
        'Tractar <code>OPTIONAL_MEMORIAL</code> com el cas «memòria i fèria», i buscar la celebració ' +
        'al calendari que s’ha aplicat al dia, no al primer que la conté.',
      promptable: true,
    },
  },
  {
    id: 'F10',
    verdict: 3,
    resolved: 'MIGRA-005, corregit el 4 de setembre de 2026',
    days: ['2026-09-17'],
    headline: '19 celebracions dels calendaris catalans surten amb rang i precedència contradictoris',
    detail:
      'El generador escriu <code>rank</code> i <code>precedence</code> per separat i en 19 casos ' +
      'no diuen el mateix: memòries obligatòries emeses amb <code>rank: "SOLEMNITY"</code>.',
    table: {
      head: ['calendari', 'celebració', 'rank', 'precedence'],
      rows: [
        ['catalonia', 'sant_justi_martir (1-VI)', 'SOLEMNITY', 'GENERAL_MEMORIAL_10'],
        ['catalonia', 'sant_ciril_d_alexandria… (27-VI)', 'SOLEMNITY', 'GENERAL_MEMORIAL_10'],
        ['catalonia', 'sants_joan_fisher…_tomas_more… (22-VI)', 'SOLEMNITY', 'GENERAL_MEMORIAL_10'],
        ['catalonia', 'dedicacio_de_les_basiliques… (18-XI)', 'FEAST', 'GENERAL_MEMORIAL_10'],
        ['diocese-tortosa', 'naixement_de_la_benaurada_verge_maria', 'SOLEMNITY', 'GENERAL_FEAST_7'],
      ],
    },
    why:
      'Auditats els 20 calendaris: 15 desajustos a <code>catalonia.json</code> i un a Lleida, ' +
      'Tarragona, Tortosa i Vic. cpl-app les té totes com a memòries. Els dies que en resulten ' +
      'surten al manifest amb <code>allXKey: null</code> — 2022-06-22, 2022-06-27, 2026-09-19 — ' +
      'és a dir, dies que saints-app no sap què resar.',
    impact:
      'En aquest dia només es veu de reüll (sant Justí surt al blame d’una casella), però són ' +
      'dies sencers sense text repartits per l’any.',
    proof: [
      ['Auditoria completa', '<code>rank</code> contra família de <code>precedence</code> sobre els 20 calendaris de <code>litcal/src/data/calendars</code>: 19 desajustos', null],
      ['Símptoma visible', '2026-09-19 → <code>sant_gener_bisbe_i_martir</code> amb <code>allXKey: null</code>, quan a Barcelona el 19 és santa Maria de Cervelló i sant Gener és el 18', null],
    ],
    fix: {
      where: 'migration-to-saints/generate-catalan-calendars.js',
      summary:
        'Derivar <code>rank</code> i <code>precedence</code> d’una sola decisió, i afegir una ' +
        'asserció que falli si les dues no són de la mateixa família.',
      note:
        '<strong>Ja fet</strong> (MIGRA-005, 4-09-2026): <code>classifySolemnitat()</code> i ' +
        '<code>classifyMemory()</code> retornen rank i precedence junts, el lookup de memòries ' +
        'només llegeix V/L/M, i la validació avorta si les dues famílies no coincideixen. ' +
        'Contradiccions <strong>19 → 0</strong> sobre 622 celebracions, i les dates del manifest sense ' +
        '<code>allXKey</code> passen de <strong>431 a 347</strong>.',
      promptable: false,
    },
  },
  {
    id: 'F11',
    verdict: 2,
    days: ['2026-09-03'],
    hours: ['Vespers'],
    headline: 'La Visitació resa les I Vespres de l’Ascensió, i per això reté el càntic del dijous',
    detail:
      'Des del refactor de Primeres Vespres (PR #1694), que va treure el sufix <code>_1v</code> ' +
      'de l’identificador i les va passar a camps <code>*_PrimerasVisperas</code> dins de la ' +
      'celebració, això es llegeix directament: <strong>16 dels 20 camps de ' +
      '<code>visitation_of_mary__ANY</code> són, id per id, els <code>*_PrimerasVisperas</code> ' +
      'de <code>ascension_of_the_lord__ANY</code></strong>. Dels quatre que resten, el respons i ' +
      'els precs també són de l’Ascensió amb ids diferents; l’única peça pròpia de la festa és ' +
      'l’oració final. I la Visitació és una <em>festa</em>, que no en té, de I Vespres. Es veu ' +
      'el 3 de setembre perquè el càntic de l’Ascensió i el del dijous del saltiri comparteixen ' +
      'casella. Verificat contra <code>origin/dev</code>: l’entrada no ha canviat gens.',
    table: {
      head: ['camp', 'cpl-app (31 de maig)', 'saints-app'],
      rows: [
        ['1r salm', 'Salm 121', 'Salmo 112 · salmos_citas/11031'],
        ['Ant. 1', '«Maria entrà a casa de Zacaries i saludà Elisabet»', '«Salí del Padre y he venido al mundo… » · salmos_antifonas/10271'],
        ['2n salm', 'Salm 126', 'Salmo 116 · salmos_citas/152'],
        ['Ant. 2', '«…el nen ha saltat d’entusiasme dins les meves entranyes»', '«El Señor Jesús… subió al cielo» · salmos_antifonas/10272'],
        ['Càntic', 'Ef 1, 3-10', 'Ap 11, 17-18; 12, 10b-12a · salmos_citas/11030'],
        ['Ant. 3', '«Ets beneïda entre les dones…»', '«Nadie ha subido al cielo…» · salmos_antifonas/10273'],
        ['Lectura breu', '—', 'Ef 2, 4-6 · lectura_breve_citas/3695'],
        ['Ant. Magníficat', '«Totes les generacions em diran benaurada…»', '«Padre, he manifestado tu nombre… Aleluya» · 1443'],
        ['Himne', '—', '«¿Y dejas, Pastor santo…» · himnos/3835'],
      ],
    },
    why:
      'La casella <code>salmos_citas/11030</code> la comparteixen 235 dies: 229 hi volen el ' +
      'càntic d’Ap 11, 17-18 —el del dijous— i 6 hi volen Ef 1, 3-10. Els 6 són exactament els ' +
      '31 de maig en què cpl-app celebra la Visitació. Mentre això no es reparteixi, les tres ' +
      'caselles del 3r càntic de les Vespres del 3 de setembre (<code>11030</code>, ' +
      '<code>9253</code>, <code>salmos_textos/11031</code>) queden retingudes per a sempre: ' +
      'cpl-app hi aporta dos textos i el join no pot triar.',
    proof: [
      ['Prova interna · la casella bona ja existeix', 'A <code>dev</code>, l’Assumpció, la Immaculada, la Nativitat de Maria i la Mare de Déu dels Dolors apunten <strong>totes quatre</strong> les Vespres a <code>salmos_citas/4577</code> (Salm 121), <code>3424</code> (Salm 126) i <code>11042</code> (Ef 1, 3-10) —el Comú de la Mare de Déu— amb antífones pròpies de cadascuna. La Visitació és l’única festa mariana que no hi apunta.', null],
      ['Prova interna · de qui és la còpia', 'Ho diu l’entrada de l’Ascensió: <code>himno_PrimerasVisperas</code> 3835, <code>primer_salmo_cita_PrimerasVisperas</code> 11031, <code>segundo_salmo_cita_PrimerasVisperas</code> 152, <code>tercer_salmo_cita_PrimerasVisperas</code> 11030, <code>lectura_biblica_cita_PrimerasVisperas</code> 3695, <code>cantico_evangelico_antifona_PrimerasVisperas</code> 1443 — tots ells els camps homònims de la Visitació. I cap dels 8 anys del manifest no és una Ascensió: el 2018 va ser el 10 de maig, el 2019 el 30, el 2021 el 13.', null],
      ['Prova interna · Al·leluia fora de lloc', 'Les tres antífones de saints-app acaben en «Aleluya». El 31 de maig de 2024 ja era temps ordinari (Pentecosta, el 19 de maig), i el 31 de maig de 2022 i de 2021 també.', null],
      ['Prova interna · les antífones bones són òrfenes', '<code>salmos_antifonas/11021</code> «María entró en casa de Zacarías y saludó a Isabel» i <code>/840</code> «Bendita tú entre las mujeres, y bendito el fruto de tu vientre» existeixen a <code>commons/es</code> i <strong>no les referencia cap celebració</strong> dels deu <code>all_*.json</code>. Són, literalment, les antífones 1a i 3a que cpl-app resa el 31 de maig. La mateixa signatura que <a href="migration-to-saints/eprex-bugs/EPREX-001.md">EPREX-001</a>.', null],
      ['cpl-app, els 6 anys', 'Salm 121 · Salm 126 · Ef 1, 3-10, amb les antífones pròpies de la Visitació. No varia cap any.', null],
    ],
    fix: {
      where: 'eprex · all_visperas.json, entrada visitation_of_mary__ANY',
      summary:
        'Repuntar les Vespres de la Visitació al Comú de la Mare de Déu, que ja existeix i que ' +
        'l’Assumpció i el Roser ja fan servir. Les antífones han de ser les pròpies de la ' +
        'Visitació, no les de cap altra festa mariana.',
      table: {
        head: ['camp', 'ara (= I Vespres de l’Ascensió)', 'hauria de ser'],
        rows: [
          ['primer_salmo_cita / _texto', '11031 / 11032', '4577 / 4578'],
          ['segundo_salmo_cita / _texto', '152 / 153', '3424 / 3425'],
          ['tercer_salmo_cita / _texto', '11030 / 11031', '11042 / 11043'],
          ['salmos_antifonas 1-3', '10271-10273 (Ascensió)', '11021 · ? · 840 — les 1a i 3a ja hi són, òrfenes; la 2a («…el nen ha saltat d’entusiasme…») no s’ha trobat'],
          ['cantico_evangelico_antifona', '1443 (Ascensió)', 'pròpia de la Visitació'],
          ['lectura_biblica_cita', '3695 (Ef 2, 4-6)', 'la del Comú de la Mare de Déu'],
          ['himno', '3835 (Ascensió)', 'el de la Visitació o el del Comú'],
        ],
      },
      note:
        'Només les Vespres. Laudes del 31 de maig és correcte i propi de la Visitació — himne ' +
        '«Y salta el pequeño Juan en el seno de Isabel», antífona «María se puso en camino», ' +
        'lectura Jl 2, 27-3, 1—, o sigui que el defecte és d’una sola entrada. Un cop repuntada, ' +
        'les tres caselles retingudes del 3 de setembre es resolen soles.',
      promptable: true,
    },
  },
  {
    id: 'F12',
    verdict: 3,
    days: ['2026-09-03'],
    hours: ['Laudes', 'Vespers'],
    headline: 'A les memòries d’ofici propi, el text ferial de cpl-app s’arxiva a la casella del Comú',
    resolved: 'MIGRA-004, corregit el 3 de setembre de 2026',
    detail:
      'La regla de <code>lib/memorial-ferial.js</code> —el text que cpl-app pren de la fèria va ' +
      'a la casella ferial, i el Comú a la del sant— està tancada darrere de ' +
      '<code>hasSwitch()</code>, que només reconeix els cicles <code>MEMORY_FERIAL1</code> i ' +
      '<code>MEMORY_FERIAL2</code>. Les 7 celebracions amb cicle <code>MEMORY_PROPER</code> no ' +
      'hi entren: com que allà saints-app no té pestanya ferial, <code>cellPair()</code> retorna ' +
      '<code>[own, null]</code> i el text ferial de cpl-app acaba a la casella del sant, on el ' +
      'Comú ja hi és. És exactament el que la capçalera del fitxer avisa que no s’ha de fer.',
    table: {
      head: ['casella', 'què hi ha en castellà', 'què hi posa el 2 de gener', 'què hi posa el 3 de setembre'],
      rows: [
        ['lectura_breve_citas/66 (Laudes)', 'Hb 13, 7-9a', 'Is 49, 8-9 — fèria de Nadal (9 dates)', 'He 13, 7-9a — Comú de pastors (158 dates)'],
        ['lectura_breve_citas/3355 (Vespres)', '1 P 5, 1-4', 'Col 1, 13-15 — fèria de Nadal (8 dates)', '1Pe 5, 1-4 — Comú de pastors (106 dates)'],
      ],
    },
    why:
      'El 2 de gener, sants Basili el Gran i Gregori Nazianzè, la fila de <code>santsMemories</code> ' +
      'du <code>Categoria = "0000"</code> i <code>citaLBLaudes = "-"</code>, igual que sant ' +
      'Gregori el Gran: cpl-app resa la lectura de la fèria de Nadal. Però el cicle és ' +
      '<code>MEMORY_PROPER</code>, no <code>MEMORY_FERIAL1</code>, i el join no redirigeix. Les ' +
      'dues memòries són del Comú de pastors —bisbes i papa comparteixen lectura breu a ' +
      '<code>OficisComuns</code>: Hb 13, 7-9a i 1Pe 5, 1-4 per a 06a, 06b, 06c i 06d— i per això ' +
      'saints-app les fa compartir casella, correctament. La col·lisió no és de l’índex: és ' +
      'nostra. Reté 4 de les 13 caselles del 3 de setembre.',
    proof: [
      ['El cicle', '<code>all_laudes.json</code>: 494 claus, 7 amb <code>MEMORY_PROPER</code> — Agnès, Basili i Gregori Nazianzè, Àngels Custodis, Martí de Tours, Mare de Déu dels Dolors, Mare de Déu del Roser, Martiri de sant Joan Baptista.', null],
      ['Que no hi ha pestanya ferial', '<code>LaudesPage.vue:576</code> — <code>if (dateStore.isTodayMemory && data.value.cycle !== "MEMORY_PROPER") value = data.value[`${field}_Ferial`]</code>. Amb <code>MEMORY_PROPER</code> no hi ha <code>_Ferial</code> on posar-ho.', null],
      ['Que el Comú és el bo', '<code>OficisComuns</code>, les 15 files 06* (prevere, bisbe, papa, diversos) porten totes <code>citaLBLaudes = "He 13, 7-9a"</code> i <code>citaLBVespres = "1Pe 5, 1-4"</code>. El castellà de <code>lectura_breve_citas/66</code> i <code>/3355</code> diu exactament això.', null],
      ['La minoria, perseguida', 'Les 9 dates que discrepen a <code>/66</code> són tots 2 de gener (2017-2026, menys el 2022); les 8 de <code>/3355</code>, també.', null],
    ],
    fix: {
      where: 'migration-to-saints/lib/memorial-ferial.js · lib/common-office.js · join-content.test.js',
      summary:
        'Quan el dia no té pestanya ferial i el camp és <code>fromFerial</code>, <strong>descartar ' +
        'l’observació</strong> en comptes d’arxivar-la a la casella del sant, i deixar que el Comú ' +
        'ompli aquella casella com ja fa als dies <code>MEMORY_FERIAL*</code>. No n’hi ha prou ' +
        'd’eixamplar la regexp de <code>hasSwitch()</code>: allà no hi ha cap casella ferial on ' +
        'redirigir el text.',
      note:
        '<strong>Ja fet</strong> (MIGRA-004, 3-09-2026): <code>isProperOnly()</code> a ' +
        '<code>lib/memorial-ferial.js</code> i <code>commonOverrides()</code> a ' +
        '<code>lib/common-office.js</code>, amb 6 tests nous a <code>common-office.test.js</code>. ' +
        'El Comú només es queda el camp si la cita castellana nomena la seva família, i llavors ' +
        'el text ferial de cpl-app no s’observa. Mesurat sobre l’índex de <code>dev</code> amb la ' +
        'sonda refeta: ids resolts 7.179 → 7.188, pendents 791 → 782 — els 9 són ' +
        '<code>preces_contenido</code> de sant Martí de Tours. El 2 de gener, que era l’exemple ' +
        'amb què es va trobar, ja no hi entra: eprex l’ha reclassificat a ' +
        '<code>MEMORY_FERIAL2</code>, o sigui que en queden 6 i no 7. Decisió: ' +
        'decisions/D-002-el-comu-als-oficis-propis.md.',
      promptable: false,
    },
  },
  {
    id: 'F13',
    verdict: 4,
    days: ['2026-09-04'],
    hours: ['Vespers'],
    headline:
      'L’antífona catalana del càntic Ap 15 diu el vers 3a i les altres llengües el 3b — i la catalana és bona',
    resolved: 'D-003, tancada el 4 de setembre de 2026 amb el volum imprès',
    detail:
      'Divendres, Vespres, càntic <code>Ap 15, 3-4</code>. cpl-app hi posa d’antífona ' +
      '«Les vostres obres són grans i admirables, oh Rei de tots els pobles» — que és ' +
      '<strong>Ap 15, 3a</strong>, el primer hemistiqui del càntic mateix — i el castellà, ' +
      'l’anglès i l’italià hi porten tots tres el <strong>3b</strong>. Semblava un error de ' +
      'cpl-app. <strong>No ho és:</strong> el volum imprès del CPL diu exactament el que diu l’app.',
    table: {
      head: ['setmana del salteri', 'cpl-app i volum imprès (ant3)', 'castellà / anglès / italià'],
      rows: [
        ['I i III', 'Tots els pobles, Senyor, vindran a fer-vos homenatge', '«All nations will come and worship before you, O Lord» — coincideixen'],
        ['II i IV', 'Les vostres obres són grans i admirables, oh Rei de tots els pobles', '«Justos y verdaderos son tus caminos, ¡oh Rey de los siglos!» — <strong>difereixen</strong>'],
      ],
    },
    why:
      'Diferència d’edició, com la <strong>D-001</strong>. El català tria Ap 15, 3a on les altres ' +
      'trien el 3b; a les setmanes I i III totes les edicions coincideixen, i per això allà no ' +
      'es veu res.',
    impact:
      'Cap sobre les dades. Les 75 dates de <code>salmos_antifonas/9340</code> i <code>/9256</code> ' +
      'segueixen retingudes, però <strong>no per aquest text</strong>: el conflicte el causa ' +
      '<strong>F8</strong> —el 3 i el 4 de gener són salteri de la setmana I i cauen a la casella ' +
      'de les setmanes II/IV—, i es resolen soles quan es corregeixi.',
    proof: [
      ['El volum imprès', 'Litúrgia de les Hores del CPL, <strong>volum III</strong>: Salteri, setmana II, divendres, Vespres — l’antífona 3 diu paraula per paraula la de l’app. La setmana IV (Salm 144 I i II) també. Comprovat per en Pau el 4-IX-2026', null],
      ['Les altres llengües, per contrast', 'Castellà, data exacta del 4-IX-2026: «Justos y verdaderos son tus caminos, ¡oh Rey de los siglos!»', 'https://apps.idteologia.org/index.php?fecha=2026-09-04&r=liturgiaDeLasHoras%2Fespanola&rezo=visperas'],
      ['Anglès', 'Ant. 3 «King of all the ages, your ways are perfect and true»', 'https://www.liturgies.net/Liturgies/Catholic/loh/week2fridayep.htm'],
      ['El text bo no és a la BD', 'Escombrada de totes les antífones que fan parella amb el càntic Ap 15 a tota la base: 15 textos, i només 2 són del salteri (les setmanes I/III i les II/IV). La BD guarda <strong>una sola antífona per fila</strong>, sense còpia redundant — o sigui que no hi havia manera de resoldre-ho sense el llibre', null],
    ],
    fix: {
      where: '—',
      summary:
        'Cap canvi. Queda registrada perquè no es torni a obrir: vegeu <strong>D-003</strong> al ' +
        'registre de canvis.',
      note:
        'Lliçó per a la revisió: <strong>per a la redacció d’un text català, la concordança entre ' +
        'llengües no és prova de res</strong> — tres llengües coincidien i el català tenia raó. ' +
        'Només el volum imprès ho decideix. Els dos indicis que semblaven prova interna —que ' +
        'cpl-app encerta les setmanes I i III, i que l’antífona sembla un retall del cos del càntic ' +
        'de la mateixa fila— no ho eren.',
      promptable: false,
    },
  },
  {
    id: 'F14',
    verdict: 2,
    days: ['2026-09-04'],
    hours: ['Laudes'],
    headline: 'Sants Innocents porta a Vespres la salmòdia de les I Vespres',
    detail:
      'La casella <code>salmos_citas/155</code> (Salm 147) la comparteixen els divendres ' +
      'ordinaris a Laudes i <code>holy_innocents_martyrs__ANY</code> a Vespres, que els anys en ' +
      'què el 29 de desembre no és la Sagrada Família hi vol el Salm 129. Una casella només pot ' +
      'dur un text, o sigui que el join no hi escriu res — <strong>i és l’únic que impedeix que ' +
      'el 4 de setembre arribi al 100%</strong>.',
    table: {
      head: ['festa de l’octava', '1r salm', '2n salm', '3r', ''],
      rows: [
        ['sant Esteve (26-XII)', '11025 · Salm 109', '54 · Salm 129', '11072', '✅'],
        ['sant Joan (27-XII)', '11025 · Salm 109', '54 · Salm 129', '11072', '✅'],
        ['<strong>Sants Innocents (28-XII)</strong>', '11031 · Salm 112', '<strong>155 · Salm 147</strong>', '11042', '❌ és la de I Vespres'],
      ],
    },
    why:
      'Les tres festes de la mateixa octava tenen el mateix rang i dues porten ' +
      '<code>11025</code>+<code>54</code>. Només es veu alguns anys: quan el 29 de desembre és la ' +
      'Sagrada Família, la tarda del 28 <strong>sí</strong> que són I Vespres i la fitxa encerta ' +
      '—cpl-app hi dona Salm 112 · Salm 147 el 2024. Però això només passa <strong>2 anys de cada ' +
      '10</strong>: falla el 2017, 2018, 2020, 2021, 2022, 2023 i 2026, on el 29 és fèria de ' +
      'l’octava i toquen les II Vespres (Salm 109 · Salm 129). El 2025 no s’aplica, perquè el 28 ' +
      'mateix és la Sagrada Família.',
    impact:
      '7 dies retenen <code>salmos_citas/155</code> i <code>salmos_textos/156</code>, que 176 ' +
      'dies volen. Desbloquejant-ho, el 4-IX-2026 passa de 96% a <strong>100%</strong>.',
    proof: [
      ['Prova interna', 'Sant Esteve i sant Joan, les germanes de la mateixa octava, porten <code>11025</code>+<code>54</code>+<code>11072</code>; Sants Innocents és l’única que no', null],
      ['cpl-app, els dos casos', '2024-12-28 (el 29 és la Sagrada Família): Salm 112 · Salm 147, i l’app hi encerta. 2021, 2022, 2023 i 2026: Salm 109 · Salm 129, i l’app hi falla', null],
      ['El 31 de desembre NO és el mateix cas', '<code>christmas_octave_day_7__ANY</code> duu la mateixa parella i allà és correcta: és la vigília de Santa Maria Mare de Déu. cpl-app hi dona Salm 112 · Salm 147 tots els anys', null],
    ],
    fix: {
      where: 'eprex · all_visperas.json',
      summary:
        'Repuntar <code>holy_innocents_martyrs__ANY</code> (i el seu bessó ' +
        '<code>christmas_octave_day_4__ANY</code>) a la salmòdia de les II Vespres de l’octava.',
      table: {
        head: ['camp', 'ara', 'hauria de ser'],
        rows: [
          ['primer_salmo_cita / _texto', '11031 / 11032 (Salm 112)', '11025 / 11026 (Salm 109)'],
          ['segundo_salmo_cita / _texto', '155 / 156 (Salm 147)', '54 / 55 (Salm 129)'],
          ['tercer_salmo_cita / _texto', '11042 / 11043 (Ef 1, 3-10)', '11072 / 11073 (Col 1, 12-20)'],
        ],
      },
      note: 'Repositori aliè: proposta escrita amb els ids concrets (EPREX-003). El 31 de desembre no s’hi toca. Si s’accepta, cal tornar a passar la sonda abans del join.',
      promptable: true,
    },
  },
  {
    id: 'F15',
    verdict: 3,
    resolved: 'EINA-calendari, el 29 de setembre de 2026: la capa catalana refeta a litcal porta l’id de romcal per als sants universals. Les dates del manifest sense clau passen de 238 a 176',
    days: ['2026-09-04'],
    headline: 'El generador emet duplicats catalans de celebracions que romcal ja té',
    detail:
      'De <code>santsMemories</code> i <code>santsSolemnitats</code>, el generador crea un id a ' +
      'partir del nom català —<code>santa_caterina_de_siena_verge_i_doctora_de_l_esglesia_patrona_d_europa</code>— ' +
      'quan romcal ja porta aquella mateixa celebració amb el seu id ' +
      '(<code>catherine_of_siena_virgin</code>). Quan el duplicat guanya el dia, l’índex de ' +
      'saints-app no hi té entrada, el dia perd la clau i <strong>el join aparella el text de ' +
      'cpl-app amb la casella d’una altra celebració</strong>.',
    table: {
      head: ['data', 'romcal hi té', 'el nostre calendari hi posa'],
      rows: [
        ['29-IV', '<code>catherine_of_siena_virgin</code>', '<code>santa_caterina_de_siena_verge_i_doctora…</code>'],
        ['25-VII', '<code>james_apostle</code>', '<code>sant_jaume_apostol_patro_d_espanya</code>'],
        ['15-V', '<code>isidore_the_farmer</code>', '<code>sant_isidre_llaurador</code>'],
        ['11-VII', '<code>benedict_of_nursia_abbot</code>', '<code>sant_benet_abat_patro_d_europa</code>'],
      ],
    },
    why:
      'El generador sempre els ha emès; el que els va fer visibles és la <strong>MIGRA-005</strong>. ' +
      'Abans sortien amb rang i precedència contradictoris i litcal no els sabia col·locar, o sigui ' +
      'que no guanyaven cap dia. En donar-los un rang coherent, <strong>117 dates</strong> passen a ' +
      'resoldre-s’hi. La F10 estava tapant això.',
    impact:
      'Mesurat amb l’índex de <code>dev</code> ja fusionat: les dates del manifest sense ' +
      '<code>allXKey</code> passen de <strong>239</strong> (calendaris del git) a <strong>347</strong> ' +
      '(regenerats). Els calendaris regenerats es van revertir per això (litcal <code>91f2e17</code>). ' +
      '<strong>Correcció:</strong> les 15 caselles sobreescrites que es van veure primer aquí ' +
      '<strong>no són d’aquesta troballa</strong> — surten igual amb els calendaris del git. Són la ' +
      '<strong>F16</strong>.',
    proof: [
      ['Les 117, comptades', 'Comparant el manifest d’abans amb el de després: 320 dates canvien de <code>litcalId</code> i 117 passen a un slug català nostre', null],
      ['Les 15 regressions', 'A totes, el valor <em>anterior</em> coincideix amb la casella castellana i el nou no. Exemple: <code>salmos_antifonas/9998</code>, es «Con amor eterno nos ha amado Dios», abans «Oh amor etern de Déu!», ara «Déu envià un home, que es deia Joan»', null],
      ['No és la MIGRA-005', 'El fix del rang és correcte i es queda; el que fa és destapar aquests duplicats. Amb els calendaris del git, el manifest té 239 dates sense clau, el millor dels tres estats mesurats', null],
    ],
    fix: {
      where: 'migration-to-saints/generate-catalan-calendars.js',
      summary:
        'Que el generador no emeti una celebració quan romcal ja en té una d’equivalent per a ' +
        'aquella data i calendari — o que hi emeti l’id de romcal en comptes del seu propi slug, ' +
        'perquè les rectificacions catalanes s’hi apliquin a sobre en comptes de duplicar-la.',
      note:
        'Fins que no es faci, <strong>no regeneris els calendaris</strong>: els del git són millors ' +
        'que els que en surten. Vegeu l’avís a MIGRA-005.',
      promptable: true,
    },
  },
  {
    id: 'F16',
    verdict: 3,
    days: ['2026-09-04'],
    headline: 'El join escriu una observació minoritària en comptes de retenir la casella',
    detail:
      'La regla que fa segur tot el join —«un id només s’escriu si <strong>totes</strong> les ' +
      'observacions coincideixen»— no s’aplica en algun camí. A <code>salmos_antifonas/9998</code>, ' +
      '9 dates donen el text del Sagrat Cor i 1 el de sant Joan Baptista, i el join hi escriu ' +
      '<strong>la d’1</strong>. La casella no surt ni tan sols a <code>join-pending-review.json</code>.',
    table: {
      head: ['data', 'què hi dona cpl-app a Vespres', ''],
      rows: [
        ['2017-06-22, 2018-06-07, 2019-06-27, 2020-06-18, 2021-06-10, 2023-06-15, 2024-06-06, 2025-06-26, 2026-06-11', '«Oh amor etern de Déu! Crist, enlairat de la terra…» — Sagrat Cor', '9 ✅'],
        ['2022-06-23', '«Déu envià un home, que es deia Joan» — Baptista', '1 ❌ i és la que s’escriu'],
      ],
    },
    why:
      'Les 10 són <strong>dijous al vespre, vigília del Sagrat Cor</strong>, que sempre cau en ' +
      'divendres; l’app hi llegeix les I Vespres del Sagrat Cor, i això és correcte. El 2022 el 24 de ' +
      'juny era alhora el Sagrat Cor i la Nativitat del Baptista, i cpl-app hi resa les I Vespres del ' +
      'Baptista — també defensable. El que no ho és: que d’aquesta discrepància en surti una escriptura ' +
      'i no una retenció.',
    impact:
      '<strong>15 caselles sobreescrites, totes 15 regressions</strong>, verificades una per una ' +
      'contra el castellà: <code>lectura_breve_citas/3604</code>, <code>lectura_breve_textos/3605</code>, ' +
      '<code>preces_contenido/6455-6459</code>, <code>responsorios/16131-16136</code> i ' +
      '<code>salmos_antifonas/9998-10000</code> — totes del Sagrat Cor, totes rebent text del Baptista. ' +
      'A la mateixa exportació n’hi ha 7 de bones, o sigui que no es pot descartar l’exportació sencera: ' +
      'cal arreglar això i tornar-la a fer.',
    proof: [
      ['Les 10 observacions, comptades', 'Resoltes les 10 dates amb <code>resolve-cpl-days</code>: 9 donen el text del Sagrat Cor i 1 el del Baptista', null],
      ['El join no la reté', '<code>salmos_antifonas/9998</code> no és a <code>join-pending-review.json</code> i sí a <code>output/commons-ca</code>, amb el text de la minoria', null],
      ['No és dels calendaris', 'Surt igual amb els calendaris regenerats i amb els del git, o sigui que no és la F15', null],
    ],
    fix: {
      where: 'migration-to-saints/join-content.test.js',
      summary:
        'Trobar per què aquestes observacions no arriben a la comprovació d’acord. La sospita és el ' +
        'camí de <code>fromFerial</code> / <code>entryFromCells</code> de la línia 605 i següents: si a ' +
        'les 9 dates el camp es classifica com a ferial i es redirigeix a la casella 1, només queda ' +
        'l’observació del 2022 i llavors «totes coincideixen» és cert per vacuïtat.',
      note:
        '<strong>Fins que no estigui, no exportis.</strong> L’exportació d’aquesta sessió es va revertir ' +
        'dues vegades per això.',
      promptable: true,
    },
  },
  {
    id: 'F17',
    verdict: 3,
    days: ['2026-09-08'],
    headline: 'La revisió comparava les citacions de salm en cru — 5 divergències inventades',
    detail:
      'cpl-app guarda la referència i la línia descriptiva en dues columnes, i les taules pròpies '
      + 'deixen la línia fora; saints-app té una sola casella i el join hi escriu la grafia més '
      + 'completa. Cada dia amb salmòdia pròpia llegia, doncs, «Salm 23 / Entrada del Senyor al '
      + 'santuari» al costat del «Salm 23» pelat, i ho comptava com a divergència.',
    why:
      'El canal C2 comparava les citacions per empremta —llibre i capítol— des del primer dia. El '
      + '<strong>C1</strong>, el que s’aplica quan la casella catalana ja té text, les comparava byte '
      + 'a byte, tot i que ja calculava <code>fpCa</code> i ja importava <code>splitHeading</code> '
      + 'sense fer servir mai cap dels dos.',
    impact:
      'El 8-IX passa de 18 divergències a <strong>13</strong>. Sobre vuit festes del 2026, de 122 a '
      + '<strong>79</strong>: un 35 % del que la revisió donava per divergent no ho era.',
    proof: [
      ['La decisió que ho origina', 'lib/citation-headings.js — «keep one heading, the fullest one» (Pau, 14-VIII-2026)', null],
      ['Les 43 caselles excusades', 'Totes tenen la primera línia idèntica als dos costats; cap no ha calgut mirar-la a mà', null],
    ],
    fix: {
      where: 'migration-to-saints/review/build-rows.js',
      summary:
        'APLICAT. Al C1, una citació que difereix només en la línia descriptiva és '
        + '<code>sameRefHeading</code>. S’excusa únicament que la línia falti en un costat: dues '
        + 'descripcions diferents per a una referència segueixen sent visibles.',
      note: 'Registre: MIGRA-011.',
      promptable: false,
    },
  },
  {
    id: 'F18',
    verdict: 3,
    days: ['2026-09-08'],
    hours: ['Office'],
    headline: 'L’Ofici resa el salm 23 i el 86 amb un asterisc de menys cadascun',
    detail:
      'A <code>salmos_textos/112</code> falta el <code>*</code> de «És el Senyor, valent i poderós,» i '
      + 'a <code>salmos_textos/367</code> el de «El Senyor va escrivint al registre dels pobles:». '
      + 'Tota la resta dels dos salms és idèntica a cpl-app.',
    why:
      'Cap de les dues caselles no és a l’exportació d’avui: el join les <strong>reté</strong>, perquè '
      + 'les 52 celebracions que se les reparteixen no s’hi posen d’acord. Hi són perquè una passada '
      + 'antiga les va publicar, i <code>export-to-saints-app.js</code> és additiu — «never used to '
      + 'blank the destination»— i no esborra mai el que ja no avala. El text publicat és el de la '
      + '<strong>Mare de Déu del Toro</strong> (8 de maig, Menorca, <code>santsSolemnitats</code> fila '
      + '147), la variant minoritària.',
    impact:
      '<strong>521 caselles</strong> de saints-app ja no les produeix l’exportació d’avui; de les '
      + '<strong>349</strong> que el join declara en conflicte, 265 duen la variant majoritària, '
      + '<strong>68 una de minoritària</strong> i <strong>16 no coincideixen amb cap variant '
      + 'coneguda</strong> — la mateixa família que els quatre precs de MIGRA-008.',
    table: {
      head: ['', 'caselles'],
      rows: [
        ['publicades que l’exportació d’avui ja no produeix', '521'],
        ['…que el join declara ara en conflicte', '349'],
        ['…amb la variant majoritària (l’atzar va sortir bé)', '265'],
        ['…amb una variant minoritària', '68'],
        ['…que no coincideixen amb cap variant coneguda', '16'],
      ],
    },
    proof: [
      ['Retingudes avui', '112 i 367 són a join-pending-review.json i no a output/commons-ca', null],
      ['D’on ve el text publicat', 'Idèntic byte a byte al de l’exportació del commit 5668ed5', null],
      ['L’exportació no esborra', 'export-to-saints-app.js:75 — «if (!(k in dest))»; cap camí d’esborrat', null],
    ],
    fix: {
      where: 'migration-to-saints/export-to-saints-app.js · decisió D-007',
      summary:
        'La sortida no és tècnica: esborrar-les vol dir canviar text dolent per «[ERR-001] Element no '
        + 'trobat». Tres opcions al registre (D-007); la del mig és esborrar les 84 minoritàries i '
        + 'desconegudes i deixar les 265 majoritàries.',
      note: 'Passi el que passi, l’exportació hauria de reportar les òrfenes com ja fa amb les del Comú.',
      promptable: true,
    },
  },
  {
    id: 'F19',
    verdict: 1,
    days: ['2026-09-08'],
    headline: 'A la Mare de Déu del Toro li falten dos asteriscs a l’Ofici',
    detail:
      'La fila 147 de <code>santsSolemnitats</code> (8 de maig, Menorca, Comú de la Mare de Déu en '
      + 'temps pasqual) és l’única de les 23 que duen aquests salms a l’Ofici a què falta el marcador '
      + 'de mitja estrofa, i li falta <strong>als dos</strong>.',
    table: {
      head: ['columna', 'files amb el salm', 'amb <code>*</code>', 'sense'],
      rows: [
        ['salm1Ofici — Salm 23', '23', '22', '<strong>santsSolemnitats#147</strong>'],
        ['salm3Ofici — Salm 86', '23', '22', '<strong>santsSolemnitats#147</strong>'],
      ],
    },
    why:
      'És una errata de dades, no una variant d’edició: el <code>*</code> és el marcador de cesura del '
      + 'vers, i les altres 22 còpies del mateix salm a la mateixa columna el duen. No és una qüestió '
      + 'de redacció catalana —no toca cap paraula— i per tant no cal el volum imprès per a dir-ho.',
    impact:
      'A cpl-app es veu el 8 de maig a Menorca. A saints-app s’ha vist a tot arreu, perquè aquesta '
      + 'fila és la que va guanyar les caselles compartides (F18).',
    proof: [
      ['Recompte intern', '22 de 23 files amb l’asterisc, a les dues columnes, la mateixa fila fora', null],
      ['La resta del salm quadra', 'Els altres 8 asteriscs i els 2 creuets de la fila 147 hi són', null],
    ],
    fix: {
      where: 'src/assets/db/cpl-app.db · santsSolemnitats',
      summary:
        'Afegir «    *» al final de «És el Senyor, valent i poderós,» de salm1Ofici i de «El Senyor va '
        + 'escrivint al registre dels pobles:» de salm3Ofici, filtrant per l’estat incorrecte i no per id.',
      note: 'Va amb db-fixes/CPL-LIT-NNN.sql, test de regressió i dossier, segons el CLAUDE.md.',
      promptable: true,
    },
  },
  {
    id: 'F20',
    verdict: 2,
    days: ['2026-09-08'],
    hours: ['Tercia', 'Sexta', 'Nona'],
    headline: 'Les hores menors de la festa resen les antífones de la fèria',
    detail:
      'cpl-app diu una antífona pròpia per hora —«Avui és el Naixement de santa Maria Verge…» a '
      + 'Tèrcia— i saints-app en diu tres, les del salteri corrent («Qui estima ha complert tota la '
      + 'Llei»). Nou caselles: tres que difereixen i sis que només són a l’app.',
    why:
      'És l’EPREX-005, ja dossieritzat: <code>terciaStore.ts</code> i els seus bessons substitueixen, '
      + 'en una festa, els nou camps de la salmòdia pels de la fèria — i s’enduen també l’antífona '
      + 'pròpia que l’índex duu per a aquell dia. El 8-IX <code>all_tercia.json</code> diu '
      + '<code>primer_salmo_antifona: 4811</code> i <code>-1</code> a les altres dues, que és '
      + 'exactament el que resa cpl-app. La 4811 no l’obre ningú.',
    impact: '513 dies de la finestra 2017-2026 fan això, en totes les llengües.',
    proof: [
      ['Dossier', 'eprex-bugs/EPREX-005.md — proposat, pendent d’enviar', null],
      ['L’índex ja hi és', 'all_tercia.json du una sola antífona per a aquest dia, com mana l’OGLH', null],
    ],
    fix: {
      where: 'eprex · terciaStore.ts, sextaStore.ts, nonaStore.ts',
      summary: 'Override: antífones de la fèria només si la festa du primer_salmo_antifona = -1; si du id, es respecten. '
        + 'Dades (saints-admin): -1,-1,-1 a les 16 festes que hi tenen desades antífones d’una fèria concreta.',
      note: 'NO n’hi ha prou de treure les tres línies: 16 de les 37 entrades FEAST/SPECIAL guarden les antífones '
        + 'd’una fèria congelada i quedarien desaparellades dels salms. OGLH 232: a les festes les antífones són de la '
        + 'fèria tret que el llibre n’indiqui de pròpies (la Liturgia Horarum sí que en dona per al 8-IX i el 14-IX). '
        + 'Repo aliè: es proposa, no s’aplica.',
      promptable: true,
    },
  },
  {
    id: 'F21',
    verdict: 4,
    days: ['2026-09-08'],
    hours: ['Mass'],
    headline: 'La primera lectura: el Missal n’ofereix dues i cadascú en tria una',
    detail:
      'cpl-app dona <strong>Rm 8,28-30</strong> («Déu estima els qui coneixia d’abans que '
      + 'existissin») i eprex <strong>Mi 5,1-4a</strong> («Fins que la mare haurà tingut un fill»). '
      + 'Les dues són al Missal per al Naixement de la Mare de Déu.',
    why:
      'No és error de ningú: és una tria d’edició, com la D-001 i la D-003. Es deixa constar perquè '
      + 'el lector de les dues apps veurà lectures diferents, i perquè no s’ha de tornar a investigar.',
    proof: [
      ['Castellà, data exacta', 'apps.idteologia.org dona Mi 5, 1-4 — el mateix que eprex', 'https://apps.idteologia.org/index.php?fecha=2026-09-08&r=misa'],
      ['Ja anotat', 'Commit f31d6d2: «El Missal ofereix les dues per a aquell dia»', null],
    ],
    fix: null,
  },
  {
    id: 'F22',
    verdict: 2,
    days: ['2026-09-14'],
    hours: ['Tercia', 'Sexta', 'Nona'],
    headline: 'La Santa Creu no és marcada com a festa a les hores menors i resa uns salms fixos',
    detail:
      'cpl-app resa a les tres hores la salmòdia del dia corrent (dilluns IV: Salm 118,129-136 · '
      + 'Salm 81 · Salm 119). saints-app resa el Salm 118,121-128 i el Salm 33 I-II a Tèrcia i Sexta '
      + '(dissabte III) i el Salm 118,113-120, 78 i 79 a Nona (dijous III), cada any igual. '
      + 'Onze caselles diferents i vuit de retingudes.',
    why:
      '<code>terciaStore.ts</code> i els seus bessons substitueixen els salms pels de la fèria quan '
      + 'la clau acaba en <code>__FEAST</code>. A <code>all_tercia/sexta/nona.json</code> hi ha 33 festes '
      + 'amb aquesta clau (Transfiguració, Naixement de la Mare de Déu, els apòstols…), però la Santa Creu '
      + 'hi és com a <code>exaltation_of_the_holy_cross__ANY</code>. Amb <code>__ANY</code> no se substitueix '
      + 'res i surten els ids que l’entrada duu desats. Entre les claus <code>__ANY</code> que no són '
      + 'de temps litúrgic, és l’única festa del calendari general: la resta són solemnitats.',
    impact:
      'Els 10 anys de la finestra. Els salms fixos no poden encertar mai els dos dies alhora: Tèrcia i Nona '
      + 'porten dies del salteri diferents.',
    proof: [
      ['Prova interna', '33 festes del mateix índex duen __FEAST; la fèria ordinary_time_24_monday (salmos_citas 3453-3455) és exactament Salm 118,129-136 · 81 · 119, el que resa cpl-app', null],
      ['cpl-app', 'salteriComuHora id 23 (setmana IV, dilluns) = Salm 118,129-136 · Salm 81 · Salm 119', null],
      ['Norma', 'OGLH 134: «a l’hora intermèdia de les festes, els salms són del dia corrent»; OGLH 232: salms i antífones de la fèria, tret que el llibre n’indiqui de pròpies', 'https://www.liturgyoffice.org.uk/Resources/Rites/GILH.pdf'],
      ['Liturgia Horarum (llatí), data exacta', 'Ad Tertiam 14-IX-2026: una antífona pròpia «Salva nos, Christe salvator, per virtutem crucis» · Ps 118,129-136 · Ps 81 · Ps 119 · He 5,7-9 — idèntic a cpl-app', 'https://www.societaslaudis.org/fr/2026-09-14/hebdomada-xxiv-per-annum/in-exaltatione-sanctae-crucis-festum/liturgia-horarum/ad-tertiam/'],
    ],
    fix: {
      where: 'eprex · all_tercia.json, all_sexta.json, all_nona.json',
      summary: 'Canviar la clau exaltation_of_the_holy_cross__ANY per exaltation_of_the_holy_cross__FEAST a les tres hores.',
      note: 'Mentre l’EPREX-005 (F20) no es corregeixi, el mateix override s’endurà les antífones pròpies 5690, '
        + '6064 i 6616, que avui coincideixen. Convé proposar els dos canvis junts. Repo aliè: es proposa, no s’aplica.',
      promptable: true,
    },
  },
  {
    id: 'F23',
    verdict: 1,
    days: ['2026-09-14', '2025-09-14'],
    hours: ['Office'],
    headline: 'La lectura patrística de la Santa Creu diu «atraure» quan la festa cau en diumenge',
    detail:
      'La casella oficio_textos/455 és retinguda perquè cpl-app en dona dues versions: 9 anys amb '
      + '«Quan seré enlairat, atrauré tothom cap a mi» i el 2025-09-14, un diumenge, amb «atraure».',
    why:
      'En diumenge cpl-app pren l’ofici de <code>diesespecials</code> (id 10, <code>lectura2</code>) i no '
      + 'de <code>santsSolemnitats</code>. La fila de diesespecials és l’única de la base amb «atraure»: és '
      + 'la cita de Jn 12,32, en futur. Les altres còpies del mateix passatge duen l’accent.',
    proof: [
      ['Prova interna', 'santsSolemnitats (ids 91 i 141) i la resta de còpies de la base diuen «atrauré»; només diesespecials/10 no', null],
      ['Volum imprès', 'Per confirmar al volum IV (14 de setembre), segons el parany 7', null],
    ],
    fix: {
      where: 'cpl-app.db · diesespecials id 10, lectura2',
      summary: '«atraure tothom» → «atrauré tothom», amb db-fixes/CPL-LIT-NNN.sql que filtri pel text.',
      note: 'Allibera la casella oficio_textos/455 sense trencar cap dia.',
      promptable: true,
    },
  },
  {
    id: 'F24',
    verdict: 4,
    days: ['2026-09-14'],
    hours: ['Mass'],
    headline: 'La primera lectura: Nm 21 o Fl 2, i cadascú en tria una',
    detail:
      'cpl-app llegeix <strong>Fl 2,6-11</strong> i eprex <strong>Nm 21,4b-9</strong>, amb el mateix '
      + 'salm (Sl 77) i el mateix evangeli (Jo 3,13-17).',
    why:
      'El Leccionari dona totes dues lectures a la festa. Si no cau en diumenge, se’n llegeix una sola. '
      + 'La mateixa casella de cita d’eprex ho diu: «Si la fiesta cae en domingo, la Opción 2 se toma como '
      + 'segunda lectura». Hi ha una rúbrica al lloc de la cita. No és error de ningú, com la F21.',
    proof: [
      ['eprex', 'lecturas_referencia/25 (es) = la rúbrica de l’opció 2; lecturas_texto/33 = Nm 21', null],
    ],
    fix: null,
  },
  {
    id: 'F25',
    verdict: 3,
    days: ['2026-09-25'],
    hours: ['Mass'],
    headline: 'La taula de llibres bíblics no coneix «Ecles», i el mateix capítol surt com a llibre diferent',
    detail:
      'La primera lectura del divendres de la setmana 25: cpl-app diu <strong>Ecle 3,1-11</strong> i '
      + 'eprex <strong>Ecles 3, 1-11</strong> — el mateix llibre, el mateix capítol i els mateixos '
      + 'versets. La revisió ho marca com a <code>diffRef</code>, «llibre o capítol diferent».',
    why:
      '<code>lib/citation-key.js</code> té l’àlies <code>ecle</code> a <code>ECCL</code> però no '
      + '<code>ecles</code>, la forma castellana, i la taula de prefixos de reserva tampoc no cobreix '
      + 'l’Eclesiastès. El castellà cau a <code>ANON</code>: <code>ECCL|3</code> contra '
      + '<code>ANON|3</code>. Comprovat cridant <code>fingerprint()</code> amb les dues cadenes.',
    impact:
      'No és només aquest dia. De les 2.933 cites castellanes, 631 no resolen el llibre; tret dels '
      + 'incipits patrístics («San», «Benedicto»), unes 113 són Escriptura de debò: <code>Eclo</code> '
      + '(29), <code>1 Sam</code> (20), <code>2 Sam</code> (15), <code>Si</code> (7), <code>Jon</code> '
      + '(6), <code>Jc</code> (5), <code>Jos</code> (5), <code>Ecles</code> (4), <code>1/2 Cro</code> '
      + '(6), <code>1/2 Mac</code> (6), <code>Ne</code>, <code>Esd</code>, <code>Rt</code>, '
      + '<code>Ct</code>. En català en falten 21: <code>Jt</code>, <code>1M</code>, <code>2M</code>, '
      + '<code>Esd</code>, <code>Rt</code>, <code>Ct</code>, <code>Ne</code>. I el forat va en els dos '
      + 'sentits: quan totes dues bandes cauen a <code>ANON</code> amb el mateix número, la comparació '
      + 'és cega — <code>Jt 2,11-19</code> contra <code>Jc 2, 11-19</code> (Jutges) compara igual per '
      + 'accident, i són 21 caselles així.',
    proof: [
      ['Prova interna', 'fingerprint(\'Ecle 3,1-11\') = ECCL|3 · fingerprint(\'Ecles 3, 1-11\') = ANON|3', null],
      ['Prova interna', 'BOOK_ALIASES.ECCL = [coh, ecle, eclesiastès, eclesiastés]; cap forma amb -s', null],
    ],
    fix: {
      where: 'migration-to-saints/lib/citation-key.js · BOOK_ALIASES',
      summary:
        'Corregit: BOOK_ALIASES completa i el test «knows every book the two editions name», que '
        + 'sense el pedaç fa caure 22 dels 31 casos.',
      note: 'MIGRA-015, 25-IX-2026. Queda tornar a passar el join i l’exportació perquè les 87 '
        + 'lectures arribin a saints-app.',
      promptable: false,
    },
  },
  {
    id: 'F26',
    verdict: 3,
    days: ['2026-09-30', '2026-08-28', '2026-09-03', '2026-09-16'],
    hours: ['Mass'],
    headline: 'A les memòries sense lectures pròpies, la revisió posava la missa ferial de cpl-app a la columna del sant',
    resolved: 'MIGRA-019, corregit el 30 de setembre de 2026',
    detail:
      'Sant Jeroni: cpl-app llegeix <strong>Jb 9 · Sl 87 · Lc 9,57-62</strong>, la missa del dimecres XXVI '
      + '(any II), i la revisió ho comparava amb la columna <code>CELEBRATION_*</code> de saints-app '
      + '(2 Tm 3,14-17 · Sl 118 · Mt 13,47-52). Tres divergències de cita que no ho eren: la columna '
      + 'ferial de saints-app diu exactament el que resa cpl-app, 8 caselles de 8.',
    why:
      '<code>massColumns()</code> copiava <code>rendered</code> a <code>CELEBRATION_*</code> sempre que l’entrada '
      + 'de l’índex té dues columnes i hi ha missa ferial, sense mirar si <code>rendered</code> <em>és</em> la '
      + 'ferial. cpl-app només té missa pròpia per a 20 memòries de <code>LDSantoral</code> (Bernabé, Marta, '
      + 'els Àngels de la Guarda…); a la resta resa la fèria i les dues candidates són la mateixa. Així no '
      + 's’activava mai el cas que <code>build-rows.js</code> ja preveu (<code>expectedNoSource</code>).',
    impact:
      'Cada memòria sense missa pròpia sortia amb 3-5 divergències falses a la missa: el 28-VIII, el 3-IX, '
      + 'el 16-IX i el 30-IX de 2026, entre d’altres. El join no passa per aquí.',
    proof: [
      ['Prova interna', 'run/review-rows.json del 30-IX: FIRSTLECTURE, PSALM, ACCLAMATION i GOSPEL iguals en C1; els CELEBRATION_* duien el mateix text de cpl-app', null],
      ['cpl-app', 'LDSantoral: 20 files amb Categoria M, cap de sant Jeroni', null],
      ['El cas bo', 'Els Àngels de la Guarda, 2-X-2026, amb missa pròpia a cpl-app: les caselles CELEBRATION_ coincideixen', null],
    ],
    fix: {
      where: 'migration-to-saints/lib/mass-columns.js · massColumns()',
      summary: 'Corregit: si totes les cites de <code>rendered</code> són les de la ferial, torna només la ferial.',
      note: 'Test a mass-fields.test.js («the two columns of a memorial»); sense el pedaç falla el de sant Jeroni.',
      promptable: false,
    },
  },
  {
    id: 'F27',
    verdict: 3,
    days: ['2026-09-30'],
    hours: ['Vespers'],
    resolved: 'MIGRA-020, decisió d’en Pau (opció a), 30 de setembre de 2026',
    headline: 'Les pregàries de Vespres del dimecres II: el llatí en té cinc amb una alternativa, el castellà en fa sis, i el join hi posa les cinc de la CPL per ordre',
    detail:
      'cpl-app en resa cinc. La quarta del llatí té una alternativa marcada «vel»: «Ærem nobis… largire '
      + 'propitium» <em>o bé</em> «Ab omnibus noxis libera nos… super domus nostras». La CPL en dona la '
      + 'primera; el castellà (i liturgiadeleshores.cat) imprimeixen les dues seguides, com si fossin sis. '
      + 'saints-app té sis caselles i el join les omple per posició: la dels difunts va a '
      + '<code>preces_contenido/9573</code>, que és l’alternativa («Líbranos, Señor, de todo peligro»), i la '
      + '<code>9574</code>, que és la dels difunts, queda sense català.',
    why:
      'La CPL no s’equivoca: fa el que fa el llatí. L’error és nostre, d’aparellar per posició dues llistes '
      + 'de mida diferent.',
    impact:
      '56 dies de la finestra 2017-2026: tots els dimecres de la setmana II del salteri durant l’any, memòries '
      + 'incloses. A saints-app, quan <code>commons/ca</code> no té l’id, <code>TextService</code> no cau al '
      + 'castellà i les Vespres mostren literalment «id 9574 not found in preces_contenido».',
    proof: [
      ['Llatí, data exacta', 'Liturgia Horarum, Vespres del 2-IX-2026: cinc pregàries; després de «Ærem nobis», «vel: Ab ómnibus noxis líbera nos»', 'https://www.societaslaudis.org/fr/2026-09-02/hebdomada-xxii-per-annum/de-ea/liturgia-horarum/ad-vesperas/'],
      ['Castellà', 'preces_contenido/9569-9574: sis, la cinquena «Líbranos, Señor, de todo peligro, y bendice nuestros hogares»', null],
      ['cpl-app', 'salteriComuVespres id 12: cinc, la quarta «Concediu-nos el bon temps»; cap taula no conté «qualsevol perill»', null],
      ['Volum imprès', 'Si hi ha un «o bé» després de la quarta pregària, el text català de l’alternativa és de la CPL', null],
    ],
    fix: {
      where: 'migration-to-saints/lib/preces-alignment.js · join-content.test.js · day-compare.js',
      summary: 'Corregit: la dels difunts va a 9574 i la 9573 (l’alternativa) queda sense català, com va '
        + 'decidir en Pau. Cal que saints-app amagui la casella buida en lloc de mostrar «id not found».',
      note: 'No és cap CPL-LIT. liturgiadeleshores.cat no és cap font oficial: l’edició oficial és la CPL.',
      promptable: false,
    },
  },
  {
    id: 'F28',
    verdict: 3,
    days: ['2026-09-30', '2026-06-24', '2026-12-24', '2026-10-07', '2026-11-10', '2025-11-04', '2022-08-26', '2020-05-26', '2019-09-03'],
    hours: ['Mass'],
    headline: 'El join triava les lectures de la missa pel capítol, i en va exportar nou amb el text d’una altra missa',
    resolved: 'MIGRA-018, corregit el 30 de setembre de 2026',
    detail:
      'El join es quedava amb el <code>token</code> de <code>fingerprint()</code> —llibre i capítol— i agafava '
      + 'la primera candidata que hi encaixava. Quan la missa ferial, la del dia en una vigília o la d’ahir '
      + 'llegeixen el mateix capítol que la casella, hi anava la que no és.',
    table: {
      head: ['celebració', 'caselles', 'castellà', 'català que hi havia', 'dies'],
      rows: [
        ['Vigília de sant Joan Baptista, evangeli i aclamació', '703 · 883 · 6058', 'Lc 1, 5-17', 'Lc 1,57-66.80, la del dia', '10'],
        ['Vigília de Nadal, salm', '927 · 1163', 'Sal 88, 4-5.16-17.27.29', 'Sl 88,2-3.4-5.27 i 29, la del matí', '8'],
        ['La Mare de Déu del Roser, salm', '328 · 408', 'Lc 1, 46-55 (Magníficat)', 'Lc 1,69-75 (Benedictus), una fèria', '9'],
        ['Comú de màrtirs (Àgata, Kolbe), salm', '444 · 553', 'Sal 30, 3cd-4.6.8ab.16bc-17', 'Sl 30,20-24, una fèria', '17'],
        ['Sant Lleó el Gran, salm', '1619 · 998', 'Sal 36, 3-6.30-31', 'Sl 36,3-4.18 i 23.27 i 29, la fèria', '2'],
        ['Sant Felip Neri, evangeli', '1790', 'Jn 17, 20-26', 'Jo 17,1-11a, la fèria', '1'],
        ['Santa Teresa de Jesús Jornet, evangeli', '283 · 350', 'Mt 25, 31-40', 'Mt 25,1-13, la fèria', '1'],
        ['Sant Carles Borromeu, 1a lectura', '1946 · 2426', 'Rm 12, 3-13', 'Rm 12,5-16a, la fèria', '1'],
        ['Sant Gregori el Gran, salm', '964', 'Sal 95, 1-3.7-8a.10', 'Sl 95,1 i 3.4-5.11-13, la missa d’ahir', '8'],
      ],
    },
    why:
      'Comparar llibre i capítol és bo per a dir que dues cites són la mateixa lectura escrita diferent '
      + '(«Salm 109» i «Salmo 109, 1-5. 7»), però no per a triar entre dues lectures del mateix capítol. El '
      + 'PLAN §18.7 ho va resoldre per a sant Pere i sant Pau perquè allà el capítol canvia (ACTS|12 ≠ ACTS|3).',
    impact:
      'El 30-IX: la variant minoritària que retenia <code>lecturas_texto/368</code>, el salm de sant Jeroni, era '
      + 'el salm ferial de sant Alfons del 2022-08-01. Corregit, la 368 s’allibera, i amb ella 7 cites i 7 textos més.',
    proof: [
      ['Prova interna', 'fingerprint(\'Sal 118, 29.43…\').token = fingerprint(\'Sal 118, 9-14\').token = PS|118; el tokenFull difereix', null],
      ['saints-app', 'commons/ca: lecturas_referencia/703 deia «Lc 1,57-66.80» on el castellà diu «Lc 1, 5-17»', null],
    ],
    fix: {
      where: 'lib/citation-key.js · readingMatch() · join-content.test.js · observeMass()',
      summary: 'Corregit: tria pels versets, cada lectura de cpl-app va a la casella del dia on encaixa millor, i '
        + 'la missa d’ahir només compta si hi encaixa sencera. Les 17 caselles dolentes, fora de saints-app (SA-18).',
      note: 'Contra el join d’abans: cap lectura bona perduda (la Vigília Pasqual i els dies de després de '
        + 'l’Epifania es mantenen).',
      promptable: false,
    },
  },
  {
    id: 'F29',
    verdict: 3,
    days: ['2026-09-30'],
    hours: ['Office'],
    headline: 'L’Ofici no té pestanya ferial, i el join arxiva l’himne ferial de cpl-app a la casella del sant',
    detail:
      '<code>himnos/959</code> és l’himne de l’Ofici de sant Jeroni i només el fa servir ell. El castellà hi '
      + 'diu «Estate, Señor, conmigo». cpl-app hi resa l’himne ferial, i el join en recull sis de diferents en '
      + 'nou anys, un per dia de la setmana: 2017 i 2023 (dissabte), 2019 i 2024 (dilluns), 2020 i 2026 '
      + '(dimecres)… La casella queda retinguda i cap variant no és la bona.',
    why:
      'La regla del MIGRA-004 (F12) aparta el text ferial de la casella del sant a Laudes i Vespres, que '
      + 'tenen pestanya ferial (<code>HOURS_WITH_A_FERIAL_TAB</code>). L’Ofici no en té, o sigui que '
      + '<code>fromFerial</code> no s’hi calcula i l’himne ferial s’observa a la casella del sant.',
    impact:
      '56 caselles de l’Ofici retingudes amb una sola clau de memòria (45 himnes, 8 responsoris, 3 de la lectura), '
      + '470 observacions. No s’exporta res de dolent, però compten com a retingudes quan són sense font.',
    proof: [
      ['Prova interna', 'join-pending-review.json, himnos/959: les sis variants van per dia de la setmana, mai per any', null],
    ],
    fix: {
      where: 'migration-to-saints/lib/memorial-ferial.js · lib/cpl-day-resolver.js · join-content.test.js',
      summary: 'Calcular <code>fromFerial</code> també per a l’Ofici i, com fa <code>isProperOnly()</code>, '
        + 'descartar l’observació si no hi ha casella ferial on posar-la.',
      note: 'Aclareix el progrés, no el mou: la casella passa de retinguda a sense font, tret que el Comú n’hi doni una.',
      promptable: true,
    },
  },
];

const VERDICTS = {
  1: { label: 'cpl-app', cls: 'v1' },
  2: { label: 'saints-app / eprex', cls: 'v2' },
  3: { label: 'les nostres eines', cls: 'v3' },
  4: { label: 'no és error', cls: 'v4' },
  5: { label: 'no ho sé', cls: 'v5' },
};

// Which investigated finding accounts for a given row, if any.
//
// Two kinds of divergence reach this: the ones the comparison detects on its own (a citation
// naming different scripture, or two Catalan texts that differ), and the ones that only a
// reading of the prose reveals. The first kind is found mechanically by the report; the
// second only exists because someone judged it, so it has to be claimed here explicitly.
//
// A row that is divergent but claimed by nobody is NOT hidden — the report surfaces it as
// "encara sense investigar", which is the to-do list for the session.
const CLAIMS = {
  F1: (date, row) => date === '2026-08-24' && row.hour === 'Vespers' && row.key !== 'oracion_final',
  F3: (date, row) => row.key === 'cantico_evangelico_antifona'
    && ['2457', '2458', '2459'].includes(String(row.id)),
  // Nomes l'antifona: la resta de la salmodia d'aquestes Vespres quadra amb el castella.
  F13: (date, row) => row.hour === 'Vespers' && row.key === 'tercer_salmo_antifona'
    && ['9340', '9256'].includes(String(row.id)),
  // Les dues caselles que un export antic va congelar amb la variant sense asterisc.
  F18: (date, row) => date === '2026-09-08' && row.hour === 'Office'
    && ['112', '367'].includes(String(row.id)),
  // Les tres antifones de les hores menors, a les tres hores: EPREX-005.
  F20: (date, row) => date === '2026-09-08'
    && ['Tercia', 'Sexta', 'Nona'].includes(row.hour)
    && ['3412', '3413', '3414'].includes(String(row.id)),
  F21: (date, row) => date === '2026-09-08' && row.hour === 'Mass'
    && String(row.key).startsWith('FIRSTLECTURE'),
  // Els salms de les hores menors: la clau __ANY que hauria de ser __FEAST.
  F22: (date, row) => date === '2026-09-14'
    && ['Tercia', 'Sexta', 'Nona'].includes(row.hour)
    && /^(primer|segundo|tercer)_salmo_(cita|texto)$/.test(row.key),
  F24: (date, row) => date === '2026-09-14' && row.hour === 'Mass'
    && String(row.key).startsWith('FIRSTLECTURE'),
  // Only the rows the comparison already flags: the prose ones were never counted.
  F26: (date, row) => row.hour === 'Mass' && String(row.key).startsWith('CELEBRATION_')
    && ['diff', 'diffRef'].includes(row.match),
};

function claimFor(date, row) {
  for (const f of FINDINGS) {
    const c = CLAIMS[f.id];
    if (c && f.days.includes(date) && c(date, row)) return f.id;
  }
  return null;
}

function forDay(date) {
  return FINDINGS.filter((f) => f.days.includes(date));
}

// The findings that touch any of the dates in this run — so a review of another range does
// not print prompts for days it never looked at.
function forDates(dates) {
  const set = new Set(dates);
  return FINDINGS.filter((f) => f.days.some((d) => set.has(d)));
}

// A row is divergent when the comparison says so — a Catalan cell that differs, or a
// citation naming different scripture — or when an investigated finding claims it, which is
// how the prose divergences (only visible to a reader) get counted.
//
// Divergence and explanation are separate on purpose: a divergent row with no finding is the
// session's to-do list, and must never be silently dropped.
function isDivergent(date, row) {
  if (row.match === 'diff' || row.match === 'diffRef') return true;
  // The app shows a line cpl-app does not pray that day. Not a text disagreement — there is
  // no cpl-app text to compare — but a difference the reader sees, so it counts. Excused only
  // where cpl-app was structurally never going to have a value (see build-rows.js).
  if (isOnlyApp(row)) return true;
  return claimFor(date, row) !== null;
}

// An `onlyApp` row has no cpl-app text to put beside the Catalan one, so calling it
// "divergeix" without saying why reads as a mistake in the data rather than as what it is.
const isOnlyApp = (row) => row.match === 'onlyApp' && !row.expectedNoSource;

module.exports = { FINDINGS, VERDICTS, forDay, forDates, claimFor, isDivergent, isOnlyApp };
