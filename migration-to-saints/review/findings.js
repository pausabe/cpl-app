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
    days: ['2026-09-17'],
    headline: 'Del 2 al 5 de gener saints-app resa el salteri de la setmana IV; toca la I',
    detail:
      'Els dies de Nadal anteriors a l’Epifania, saints-app substitueix els nou camps de salms ' +
      'pels de <code>ordinary_time_{setmana}_{dia}</code>. La setmana que hi posa és la IV.',
    table: {
      head: ['data', 'cpl-app', 'saints-app llegeix'],
      rows: [
        ['2025-01-02 (dijous)', 'Salm 56 · Jr 31, 10-14 · Salm 47 — setmana I', 'caselles del dijous de la setmana IV'],
        ['2019-01-03 (dijous)', 'Salm 56 · Jr 31, 10-14 · Salm 47 — setmana I', 'les mateixes que el 17-IX-2026'],
        ['2024-01-04 (dijous)', 'setmana I', 'setmana IV'],
      ],
    },
    why:
      'Les set dates de 2-5 de gener del manifest que cauen en dijous (2017-01-05, 2018-01-04, ' +
      '2019-01-03, 2020-01-02, 2023-01-05, 2024-01-04, 2025-01-02) llegeixen totes la mateixa ' +
      'casella que <code>ordinary_time_24_thursday</code>, és a dir la setmana IV, set anys ' +
      'diferents seguits. El salteri hi torna a la setmana I amb el diumenge de la Sagrada Família.',
    impact:
      '16 caselles d’aquest dia retingudes, de Laudes i de Vespres.',
    proof: [
      ['Castellà, data exacta', '<em>apps.idteologia.org</em> encapçala el 2 de gener del 2025 amb «2 de enero, jueves, <strong>1ª semana</strong>» i dona Salmo 56 · Jeremías 31, 10-14 · Salmo 47', 'https://apps.idteologia.org/index.php?fecha=2025-01-02&r=liturgiaDeLasHoras%2Fespanola&rezo=laudes'],
      ['cpl-app coincideix', 'Resolt amb els seus Serveis, 2019-01-03 dona <code>week=1, weekCycle=1</code> i la mateixa salmòdia', null],
      ['Sonda de l’app real', '<code>app-cell-map.json</code>, generat sondejant saints-app, no deduint-lo de l’índex', null],
    ],
    fix: {
      where: 'saints-app · laudesStore, llista specialDays',
      summary:
        'La setmana del salteri dels dies 2-5 de gener s’ha de comptar des del diumenge de la ' +
        'Sagrada Família (setmana I), no fixar-la a la IV.',
      note: 'Repositori aliè: proposta escrita amb les dates concretes, sense tocar-hi.',
      promptable: true,
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
      note: 'Cal regenerar els calendaris i tornar a córrer el manifest després.',
      promptable: true,
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

module.exports = { FINDINGS, VERDICTS, forDay, forDates, claimFor };
