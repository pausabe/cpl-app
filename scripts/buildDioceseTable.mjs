// Builds src/data/dioceseCentroids.json: every municipality the app can be opened in, with where
// it is and which diocese it belongs to.
//
//   node scripts/buildDioceseTable.mjs
//
// Where each part comes from:
//
//   Municipalities and their position   Wikidata. The point is the town centre, not the centroid
//                                       of the municipal area, which is what we want: people are
//                                       in the town, not in the middle of the fields. The INE
//                                       code comes with it, and its first two digits are the
//                                       province, which is what tells two municipalities of the
//                                       same name apart.
//   Which diocese each one belongs to   The Spanish Episcopal Conference, which publishes one
//                                       page of municipalities per diocese. It is the authority
//                                       on this, and it says it municipality by municipality,
//                                       which is more than any diocese publishes about itself.
//
// This was worked out by hand at first, from what each diocese says about its own territory and
// from seven diocesan parish directories. That reading agreed with this source on 903 of the 909
// municipalities it had settled, and the six it got wrong were all on a diocesan border. It is
// gone now: one authority, said plainly, beats seven read carefully.
//
// A municipality whose diocese is not settled goes in with diocese null. The app then knows where
// somebody is and knows it cannot name their diocese, which is the honest answer; if it were left
// out of the table altogether, the nearest municipality would be one over the border and the app
// would answer with confidence and be wrong.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/dioceseCentroids.json');
const WIKIDATA = 'https://query.wikidata.org/sparql';
const CONFERENCE = 'https://www.conferenciaepiscopal.es/municipios-de-la-diocesis-de-';

// The page for each diocese, by the slug the Conference uses. Only the ones the app knows: it
// publishes the rest of Spain the same way.
const PAGES = {
  Barcelona: 'barcelona',
  Girona: 'girona',
  Lleida: 'lleida',
  Mallorca: 'mallorca',
  Menorca: 'menorca',
  'Sant Feliu de Llobregat': 'san-feliu-de-llobregat',
  Solsona: 'solsona',
  Tarragona: 'tarragona',
  Terrassa: 'terrassa',
  Tortosa: 'tortosa',
  Urgell: 'urgell',
  Vic: 'vic',
};

// The names the Conference writes differently from Wikidata: some are what the municipality was
// called before it was renamed, some are just another spelling.
const OTHER_NAMES = {
  Cabacés: 'Cabassers',
  Capmany: 'Campmany',
  'Ciutadella de Menorca': 'Ciutadella',
  Forallac: 'Vulpellac, Fonteta i Peratallada',
  Lladó: 'Lledó',
  Massanes: 'Maçanes',
  Rialp: 'Rialb',
  Torrelavit: 'Terrassola i Lavit',
  // The five of Castelló the Conference writes in Spanish
  'Cervera del Maestre': 'Cervera del Maestrat',
  'Olocau del Rey': 'Olocau del Rei',
  'San Rafael del Río': 'Sant Rafel del Riu',
  'Santa Magdalena de Pulpis': 'Santa Magdalena de Polpís',
  'Zorita del Maestrazgo': 'Sorita',
};

// Andorra is in the diocese of Urgell and the Conference lists it there, as a single line for the
// whole country. The app has always kept it apart, because it has celebrations of its own, so the
// seven parishes are named here and that line is skipped.
const ANDORRA = new Set([
  'Andorra la Vella',
  'Canillo',
  'Encamp',
  'Escaldes i Engordany',
  'Massana',
  'Ordino',
  'Sant Julià de Lòria',
]);

// Outside what the app carries. Castelló is not here: the diocese of Tortosa reaches into the
// Baix Maestrat and the Ports, and those municipalities belong to a diocese the app has, so they
// go in the table like any other. The rest of the province does not, and is dropped further down.
const BEYOND_THE_TABLE = new Set(['Teruel', 'Terol', 'Andorra']);

const PROVINCES = { '08': 'Barcelona', 12: 'Castelló', 17: 'Girona', 25: 'Lleida', 43: 'Tarragona' };

// How the Conference writes the province of Castelló, in either language
const CASTELLO = new Set(['Castellón/Castelló', 'Castelló', 'Castellón']);

// --- Reading names ----------------------------------------------------------------------------

// Catalan names carry their article, and the Conference moves it to the end: "Albi, L'" for what
// Wikidata calls "l'Albi". Taking it off either end leaves the same name. The written-out ones
// need a space after them, or "Escala" would come out as "cala".
const ARTICLE_AT_THE_END = /,\s*(?:l['’]|la|les|els|el|es|sa|ses|sos)\s*$/i;
const ARTICLE_AT_THE_START = /^(?:l['’]|(?:la|les|els|el|es|sa|ses|sos)\s+)/i;

function bareName(name) {
  return name.replace(ARTICLE_AT_THE_END, '').replace(ARTICLE_AT_THE_START, '').trim();
}

function asKey(name) {
  return bareName(name)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

// --- Wikidata ---------------------------------------------------------------------------------

async function ask(query) {
  const response = await fetch(`${WIKIDATA}?query=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/sparql-results+json', 'User-Agent': 'cpl-app diocese table' },
  });
  if (!response.ok) {
    throw new Error(`Wikidata answered ${response.status}`);
  }
  return (await response.json()).results.bindings;
}

const CATALAN_MUNICIPALITIES = `
SELECT ?item ?name ?lat ?lon ?comarca ?ine WHERE {
  ?item wdt:P31 wd:Q33146843 .
  ?item p:P625/psv:P625 ?c .
  ?c wikibase:geoLatitude ?lat . ?c wikibase:geoLongitude ?lon .
  ?item rdfs:label ?name . FILTER(lang(?name) = "ca")
  OPTIONAL { ?item wdt:P772 ?ine . }
  OPTIONAL {
    ?item wdt:P131 ?com . ?com wdt:P31 wd:Q937876 .
    ?com rdfs:label ?comarca . FILTER(lang(?comarca) = "ca")
  }
}`;

// Q8828 Mallorca, Q52636 Menorca. Some municipalities hang off a mountain range or a comarca
// first, so the chain has to be followed rather than read one step up.
const ISLAND_MUNICIPALITIES = `
SELECT ?item ?name ?lat ?lon ?comarca WHERE {
  VALUES (?island ?comarca) { (wd:Q8828 "Mallorca") (wd:Q52636 "Menorca") }
  ?item wdt:P31 wd:Q2074737 .
  ?item wdt:P131+ ?island .
  ?item p:P625/psv:P625 ?c .
  ?c wikibase:geoLatitude ?lat . ?c wikibase:geoLongitude ?lon .
  ?item rdfs:label ?name . FILTER(lang(?name) = "ca")
}`;

// The province of Castelló, where the diocese of Tortosa reaches. The whole province comes back
// and the ones no diocese of the app claims are dropped afterwards.
const CASTELLO_MUNICIPALITIES = `
SELECT ?item ?name ?lat ?lon ?ine ("Castelló" AS ?comarca) WHERE {
  ?item wdt:P31 wd:Q2074737 ; wdt:P772 ?ine .
  FILTER(STRSTARTS(?ine, "12"))
  ?item p:P625/psv:P625 ?c .
  ?c wikibase:geoLatitude ?lat . ?c wikibase:geoLongitude ?lon .
  ?item rdfs:label ?name . FILTER(lang(?name) = "ca")
}`;

// Q24279, the seven parishes of Andorra
const ANDORRAN_PARISHES = `
SELECT ?item ?name ?lat ?lon ("Andorra" AS ?comarca) WHERE {
  ?item wdt:P31 wd:Q24279 .
  ?item p:P625/psv:P625 ?c .
  ?c wikibase:geoLatitude ?lat . ?c wikibase:geoLongitude ?lon .
  ?item rdfs:label ?name . FILTER(lang(?name) = "ca")
}`;

// One row per municipality: the same one comes back once per label the query matched.
function collect(bindings) {
  const byItem = new Map();
  for (const row of bindings) {
    const existing = byItem.get(row.item.value);
    if (existing) {
      if (!existing.comarca && row.comarca) existing.comarca = row.comarca.value;
      continue;
    }
    byItem.set(row.item.value, {
      name: row.name.value,
      latitude: Number(row.lat.value),
      longitude: Number(row.lon.value),
      comarca: row.comarca ? row.comarca.value : '',
      province: row.ine ? PROVINCES[row.ine.value.slice(0, 2)] : undefined,
    });
  }
  return [...byItem.values()];
}

// --- The Episcopal Conference -------------------------------------------------------------------

// Each page is one table of two columns, the municipality and the province it stands in.
async function municipalitiesOf(slug) {
  const response = await fetch(`${CONFERENCE}${slug}/`, { headers: { 'User-Agent': 'cpl-app diocese table' } });
  if (!response.ok) {
    throw new Error(`The Conference answered ${response.status} for ${slug}`);
  }
  const page = await response.text();
  const read = (cell) =>
    cell
      .replace(/<[^>]+>/g, '')
      .replace(/&#8217;|&#8216;/g, '’')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .trim();
  const municipalities = [...page.matchAll(/<tr>\s*<td>(?:<em>)?(.*?)(?:<\/em>)?<\/td>\s*<td>(.*?)<\/td>/gs)]
    .map(([, name, province]) => ({ name: read(name), province: read(province) }))
    .filter(({ name }) => name && !/^municipi?o?$/i.test(name));
  if (municipalities.length < 5) {
    throw new Error(`No table of municipalities found for ${slug}`);
  }
  return municipalities;
}

async function main() {
  const municipalities = [
    ...collect(await ask(CATALAN_MUNICIPALITIES)),
    ...collect(await ask(ISLAND_MUNICIPALITIES)),
    ...collect(await ask(CASTELLO_MUNICIPALITIES)),
    ...collect(await ask(ANDORRAN_PARISHES)),
  ];
  const byKey = new Map();
  for (const municipality of municipalities) {
    const key = asKey(municipality.name);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(municipality);
  }

  // A name the Conference gives can also be a municipality of that name somewhere else: there is
  // a Corçà in the Baix Empordà and another inside Àger, four provinces away. The province says
  // which one is meant. For the islands and Andorra there is no INE code here and no second one
  // to confuse it with.
  function find(name, province) {
    const asked = CASTELLO.has(province) ? 'Castelló' : province;
    // The Conference gives some names of Castelló in both languages: "Peníscola/Peñíscola"
    const wanted = OTHER_NAMES[name] ?? name.split('/')[0].trim();
    const candidates = byKey.get(asKey(wanted)) ?? [];
    return candidates.find((one) => one.province === undefined || one.province === asked) ?? null;
  }

  const claims = new Map();
  const unmatched = [];
  for (const [diocese, slug] of Object.entries(PAGES)) {
    for (const { name, province } of await municipalitiesOf(slug)) {
      if (BEYOND_THE_TABLE.has(province)) continue;
      const municipality = find(name, province);
      if (!municipality) {
        unmatched.push(`${name} (${province}), in ${diocese}`);
        continue;
      }
      // Keyed by the municipality itself and not by its name: there is a Cabanes and a Figueres
      // in the Alt Empordà and another of each in Castelló, and by name they would be one row.
      if (!claims.has(municipality)) claims.set(municipality, new Set());
      claims.get(municipality).add(diocese);
    }
  }
  if (unmatched.length > 0) {
    throw new Error(`The Conference names municipalities this table does not have:\n  ${unmatched.join('\n  ')}`);
  }

  // Esplugues de Llobregat and Sant Joan Despí are on the page of the Archdiocese of Barcelona
  // and on the page of the Bisbat de Sant Feliu de Llobregat, both of them. It is not a mistake
  // on anybody's part: the parish directories of the two dioceses show the border running
  // through both towns. Esplugues has Sant Antoni de Pàdua on the Barcelona side and Santa Maria
  // Magdalena and Sant Mateu on the Sant Feliu one; Sant Joan Despí has one parish each way.
  //
  // A table of municipalities cannot say which diocese a point in either of them falls in, since
  // that depends on the street. Leaving them without an answer is the answer.
  const contested = [...claims].filter(([, dioceses]) => dioceses.size > 1).map(([one]) => one.name);

  // The rest of the province of Castelló belongs to Sogorb-Castelló and to València, which the
  // app does not have. They were only fetched so that the ones of Tortosa could be picked out.
  const table = municipalities
    .filter((municipality) => municipality.province !== 'Castelló' || claims.has(municipality))
    .map((municipality) => {
      const claimed = claims.get(municipality);
      return {
        name: municipality.name,
        // Four decimals is about eleven metres, far past what any of this needs
        latitude: Number(municipality.latitude.toFixed(4)),
        longitude: Number(municipality.longitude.toFixed(4)),
        comarca: municipality.comarca || '—',
        diocese: ANDORRA.has(bareName(municipality.name))
          ? 'Andorra'
          : claimed && claimed.size === 1
            ? [...claimed][0]
            : null,
      };
    })
    .sort((one, other) => one.comarca.localeCompare(other.comarca) || one.name.localeCompare(other.name));

  writeFileSync(OUT, `[\n${table.map((row) => `  ${JSON.stringify(row)}`).join(',\n')}\n]\n`);

  const answered = table.filter((row) => row.diocese !== null);
  console.log(`${table.length} municipalities written to ${OUT}`);
  console.log(`  with a diocese: ${answered.length}`);
  console.log(`  still to settle: ${table.length - answered.length}`);
  if (contested.length > 0) {
    console.log(`  claimed by two dioceses, so left unanswered: ${contested.join(', ')}`);
  }
  const byDiocese = new Map();
  for (const row of answered) byDiocese.set(row.diocese, (byDiocese.get(row.diocese) ?? 0) + 1);
  console.log('\nBy diocese:');
  for (const [diocese, count] of [...byDiocese].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(3)}  ${diocese}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
