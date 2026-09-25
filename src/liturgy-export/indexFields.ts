// cpl-app's liturgy, flattened into the field names of saints-app's shared index
// (`himno`, `primer_salmo_texto`, `responsorios`, `FIRSTLECTURE_ref`…).
//
// That shared vocabulary is the whole trick of the migration: it is what lets the join write a
// Catalan cell into the same slot the Spanish one occupies, and what lets the day comparator put
// the two texts on one row. Every rule in this file was read off the app that renders the cell,
// never guessed — where the reason is not obvious it is written down next to the code.
import Laudes from '../models/hours-liturgy/Laudes';
import NightPrayer from '../models/hours-liturgy/NightPrayer';
import Office from '../models/hours-liturgy/Office';
import Vespers from '../models/hours-liturgy/Vespers';
import { SpecificHour } from '../models/hours-liturgy/Hours';
import { DayMassLiturgy, Hallelujah, MassGospel, MassPsalm, MassReading } from '../models/MassLiturgy';
import { Psalm, ReadingOfTheOffice, ShortResponsory } from '../models/liturgy-masters/CommonParts';

/** One cell of the index: a text, or the list of parts a responsory or the intercessions hold. */
export type IndexFields = Record<string, string | string[]>;

/** Every Hour the flatteners read. The Office has its own shape and its own function. */
export type AnyHour = Laudes | Vespers | SpecificHour | Office;

// Fixed short-form doxology used mid-responsory — the same constant the join writes, so that the
// comparator's cpl-app column is byte-identical to what the join would have put in the cell.
export const GLORIA_PATRI_SHORT = 'Glòria al Pare, i al Fill, i a l’Esperit Sant.';

// Terce, Sext and None live under `hoursLiturgy.hours`, not at the root of the resolved day.
export const INTERMEDIATE_HOURS = { Tercia: 'thirdHour', Sexta: 'sixthHour', Nona: 'ninthHour' } as const;

function setField(out: IndexFields, key: string, value: string | string[] | null | undefined): void {
  if (value === undefined || value === null || value === '') return;
  out[key] = value;
}

// --- The prayers blob -> its parts ------------------------------------------------------
//
// cpl-app keeps the intercessions as one text; the index keeps the introduction, the response and
// each petition apart. Same parse as the join (see join-content.test.js), with one addition: the
// final paragraph, cpl-app's own invitation to the Lord's Prayer. The join does not observe it
// (that cell is filled from a hand-translated table), but the comparator still has to show what
// cpl-app says there — it is a line Pau reads in the app.
export type ParsedPrayers = {
  intro: string;
  respuesta: string;
  contenido: { peticion: string; cierre: string }[];
  padrenuestro: string;
};

export function parsePrayers(blob: string | null | undefined): ParsedPrayers | null {
  if (!blob) return null;
  const paragraphs = blob
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length < 2) return null;
  const firstLines = paragraphs[0]
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    intro: firstLines.slice(0, -1).join('\n'),
    respuesta: firstLines[firstLines.length - 1],
    contenido: paragraphs.slice(1, -1).map((p) => {
      const idx = p.indexOf('—');
      if (idx === -1) return { peticion: p.trim(), cierre: '' };
      return {
        peticion: p.slice(0, idx).trim(),
        cierre: p
          .slice(idx + 1)
          .replace(/^\t/, '')
          .trim(),
      };
    }),
    padrenuestro: paragraphs[paragraphs.length - 1],
  };
}

// --- Responsories ----------------------------------------------------------------------

/** The short responsory of Lauds and Vespers: six lines, or the one line a special antiphon replaces it with. */
export function expandResponsory(r: ShortResponsory | null | undefined): { parts?: string[]; special?: string } | null {
  if (!r) return null;
  if (r.hasSpecialAntiphon) return { special: r.specialAntiphon };
  const full = `${r.firstPart || ''} ${r.secondPart || ''}`.trim();
  return {
    parts: [
      `℣. ${r.firstPart || ''} * ${r.secondPart || ''}`,
      `℟. ${full}`,
      `℣. ${r.thirdPart || ''}`,
      `℟. ${r.secondPart || ''}`,
      `℣. ${GLORIA_PATRI_SHORT}`,
      `℟. ${full}`,
    ],
  };
}

// The responsory in the shape the index stores it. Lauds and Vespers expand to six lines; an
// intermediate Hour's is a plain versicle/response pair (`CommonParts.Responsory`) and the index
// holds exactly two ids for it — `℣.` then `℟.`, verified against es/responsorios 10415/10416 of
// `advent_1_friday__ANY`. The Office of Readings has no short responsory either and falls through
// to the same pair.
export function responsoryParts(hourData: AnyHour): string[] | null {
  if ('shortResponsory' in hourData && hourData.shortResponsory) {
    const r = expandResponsory(hourData.shortResponsory);
    if (!r) return null;
    return r.parts || (r.special ? [r.special] : null);
  }
  const r = 'responsory' in hourData ? hourData.responsory : null;
  if (r && (r.versicle || r.response)) return [`℣. ${r.versicle || ''}`, `℟. ${r.response || ''}`];
  return null;
}

// --- The psalmody ----------------------------------------------------------------------

// A celebration says ONE antiphon over all three psalms (`hasMultipleAntiphons: false`), and the
// psalms keep carrying the psalter's own antiphons underneath — cpl-app does not show those. The
// index has the same shape: 173 of the 495 entries of `all_tercia.json` carry
// `primer_salmo_antifona` and -1 in the other two. Returns one entry per psalm.
export function psalmAntiphons(hourData: AnyHour): (string | null)[] {
  if ('hasMultipleAntiphons' in hourData && hourData.hasMultipleAntiphons === false && hourData.uniqueAntiphon) {
    return [hourData.uniqueAntiphon, null, null];
  }
  const psalms: (Psalm | null)[] = [hourData.firstPsalm, hourData.secondPsalm, hourData.thirdPsalm];
  return psalms.map((p) => (p ? p.antiphon : null));
}

// --- An Hour -----------------------------------------------------------------------------

// One Hour of cpl-app, keyed by the index's field names. List fields hold an array (one entry per
// responsory part / intercession), matching how the index stores them. A field cpl-app has nothing
// for is simply absent.
//
// The intermediate Hours are a smaller Lauds (`Hours.ts`, class `SpecificHour`): no evangelical
// antiphon, no intercessions, and two fields shaped differently. This reads both shapes, so the
// comparator, the inspector and the join keep speaking one vocabulary.
export function extractHourFields(hourData: AnyHour | null | undefined): IndexFields | null {
  if (!hourData) return null;
  const out: IndexFields = {};

  setField(out, 'himno', hourData.anthem);
  const psalms: [string, Psalm | null][] = [
    ['primer', hourData.firstPsalm],
    ['segundo', hourData.secondPsalm],
    ['tercer', hourData.thirdPsalm],
  ];
  const antiphons = psalmAntiphons(hourData);
  psalms.forEach(([prefix, psalm], i) => {
    if (!psalm) return;
    setField(out, `${prefix}_salmo_cita`, psalm.title);
    setField(out, `${prefix}_salmo_antifona`, antiphons[i]);
    setField(out, `${prefix}_salmo_texto`, psalm.psalm);
  });
  if ('shortReading' in hourData && hourData.shortReading) {
    setField(out, 'lectura_biblica_cita', hourData.shortReading.quote);
    setField(out, 'lectura_biblica', hourData.shortReading.shortReading);
  }
  setField(out, 'responsorios', responsoryParts(hourData));
  if ('evangelicalAntiphon' in hourData) setField(out, 'cantico_evangelico_antifona', hourData.evangelicalAntiphon);

  const prayers = 'prayers' in hourData ? parsePrayers(hourData.prayers) : null;
  if (prayers) {
    setField(out, 'preces_intro', prayers.intro);
    setField(out, 'preces_respuesta', prayers.respuesta);
    setField(
      out,
      'preces_contenido',
      prayers.contenido.map((c) => `${c.peticion}\n${c.cierre}`),
    );
    setField(out, 'invitacion_padrenuestro', prayers.padrenuestro);
  }
  setField(out, 'oracion_final', hourData.finalPrayer);
  return out;
}

// --- The Office of Readings -------------------------------------------------------------
//
// A different shape from every other Hour, so it gets its own three helpers rather than bending
// `extractHourFields` around it. What each one has to produce is not a matter of taste:
// `OfficeFirstLecture.vue` and `OfficeSecondLecture.vue` take the fields apart themselves, and the
// Catalan has to come apart the same way or the page loses a line.

// `lectura_*_cita_a` is TWO lines in one cell, separated by a literal `$`: the components render
// `split("$")[0]` as its own paragraph (the book, or the author and work) and `split("$")[1]` in the
// `reference-bible` style next to the title (the chapter and verses, or the critical edition).
// Writing the citation as one plain string would leave that second slot empty every day of the year.
//
// cpl-app already holds the two halves apart — `reference` and `quote` — so the separator is inserted
// between them, spaced exactly as `es` spaces it ("Del libro del profeta Miqueas $Miq 4, 1-7 $").
// Where cpl-app cuts is not where `es` cuts: for the patristic reading `es` puts the author alone
// before the `$` and the work after it, while cpl-app puts "Dels comentaris de sant Agustí, bisbe,
// als Salms" before and the locus "(Salm 47, 7: CCL 38, 543-545…)" after. Both render coherently;
// cpl-app's is the cut the Catalan volumes print.
export function officeCitation(reading: ReadingOfTheOffice | null | undefined): string | null {
  if (!reading) return null;
  const ref = (reading.reference || '').trim();
  const quote = (reading.quote || '').trim();
  if (ref && quote) return `${ref} $${quote} $`;
  return ref || quote || null;
}

// The responsory that follows each of the two readings. `es` stores it as THREE ids:
//
//   [0]  a blank (" " in 912 of the 920 entries; nothing renders it)
//   [1]  ℟. firstPart * secondPart
//   [2]  ℣. thirdPart * secondPart
//
// — confirmed field by field against 2026-08-12, where cpl-app's `firstReading.responsory` carries
// exactly those three parts and `es/responsorios` 12507-12509 hold exactly that composition. The
// sigils are the ones the components force anyway (`OfficeFirstLecture.vue` rewrites [1]'s to ℟ and
// [2]'s to ℣), so they are written the way they will be shown.
//
// Not the same shape as `responsoryParts` above: that one is the short responsory of Lauds, Vespers
// and the little Hours. This one belongs to a reading, and the Office has two.
export function readingResponsoryParts(reading: ReadingOfTheOffice | null | undefined): string[] | null {
  const r = reading && reading.responsory;
  if (!r) return null;
  if (r.hasSpecialAntiphon) return r.specialAntiphon ? [' ', r.specialAntiphon] : null;
  const first = (r.firstPart || '').trim();
  const second = (r.secondPart || '').trim();
  const third = (r.thirdPart || '').trim();
  if (!first && !second && !third) return null;
  return [' ', `℟. ${first} * ${second}`, `℣. ${third} * ${second}`];
}

// The Office of Readings flattened into the index's field names. Only the `_a` (annual) cycle is
// produced: cpl-app has a single cycle of readings, and Catalan is not in
// `LanguageFeatures.biennialReadings`, so the app never asks for `_i`/`_p`. If `ca` is ever added
// there, those cells will render empty — see FASES.md, fase 3.
export function extractOfficeFields(office: Office | null | undefined): IndexFields | null {
  if (!office) return null;
  const out: IndexFields = {};

  setField(out, 'himno', office.anthem);
  const psalms: [string, Psalm | null][] = [
    ['primer', office.firstPsalm],
    ['segundo', office.secondPsalm],
    ['tercer', office.thirdPsalm],
  ];
  psalms.forEach(([prefix, psalm]) => {
    if (!psalm) return;
    setField(out, `${prefix}_salmo_cita`, psalm.title);
    setField(out, `${prefix}_salmo_antifona`, psalm.antiphon);
    setField(out, `${prefix}_salmo_texto`, psalm.psalm);
  });
  // The Office's own responsory is a plain versicle/response pair, like an intermediate Hour's, so
  // the shared helper reads it: `Office` has no `shortResponsory` field and falls through on its own.
  setField(out, 'responsorio1', responsoryParts(office));
  const readings: [string, ReadingOfTheOffice | null][] = [
    ['biblica', office.firstReading],
    ['patristica', office.secondReading],
  ];
  readings.forEach(([kind, reading]) => {
    if (!reading) return;
    setField(out, `lectura_${kind}_cita_a`, officeCitation(reading));
    setField(out, `lectura_${kind}_titulo_a`, reading.title);
    setField(out, `lectura_${kind}_texto_a`, reading.reading);
  });
  setField(out, 'responsorio2_a', readingResponsoryParts(office.firstReading));
  setField(out, 'responsorio3_a', readingResponsoryParts(office.secondReading));
  setField(out, 'oracion_final', office.finalPrayer);
  return out;
}

// --- The Mass ----------------------------------------------------------------------------
//
// A vocabulary of its own again, and for once it is saints-app's that is the odd one:
// `lecturesStore.contentByDay` is an ARRAY of `Lecture` objects (`title`, `body`, `type`) rather
// than an object with one key per field. The type IS the role, so flattening it to
// `{ROLE}_ref` / `{ROLE}_texto` gives the join and the probe one vocabulary again — see PLAN §18.

/** The four shapes a role of the Mass can take on `DayMassLiturgy`. */
type MassPart = MassReading | MassPsalm | MassGospel | Hallelujah;

/** Only the fields of `DayMassLiturgy` that hold one of them: `title`, `hasGlory` and the rest are not roles. */
type MassPartKey = {
  [K in keyof DayMassLiturgy]: DayMassLiturgy[K] extends MassPart ? K : never;
}[keyof DayMassLiturgy];

// Which of cpl-app's fields each role of the index is made of: where the role lives on
// `DayMassLiturgy`, and the field holding the reading itself, which is named differently for a
// reading, a psalm and the Gospel. Both names are checked against the models, so renaming either
// side stops `make types` instead of quietly emptying every Mass of the year.
const role = <K extends MassPartKey>(
  part: K,
  body: keyof DayMassLiturgy[K] & string,
  extra: { psalm?: true; noRef?: true } = {},
) => ({ part, body, ...extra });

export const MASS_ROLES = {
  FIRSTLECTURE: role('firstReading', 'reading'),
  SECONDLECTURE: role('secondReading', 'reading'),
  THIRDLECTURE: role('thirdReading', 'reading'),
  FOURTHLECTURE: role('fourthReading', 'reading'),
  FIFTHLECTURE: role('fifthReading', 'reading'),
  SIXTHLECTURE: role('sixthReading', 'reading'),
  SEVENTHLECTURE: role('seventhReading', 'reading'),
  // The epistle of the Easter Vigil (Rm 6), which the index numbers as the eighth reading.
  EIGHTHLECTURE: role('apostleReading', 'reading'),
  GOSPEL: role('gospel', 'gospel'),
  PSALM: role('psalm', 'psalm', { psalm: true }),
  SECONDPSALM: role('secondPsalm', 'psalm', { psalm: true }),
  THIRDPSALM: role('thirdPsalm', 'psalm', { psalm: true }),
  FOURTHPSALM: role('fourthPsalm', 'psalm', { psalm: true }),
  FIFTHPSALM: role('fifthPsalm', 'psalm', { psalm: true }),
  SIXTHPSALM: role('sixthPsalm', 'psalm', { psalm: true }),
  SEVENTHPSALM: role('seventhPsalm', 'psalm', { psalm: true }),
  // The verse before the Gospel. Only the verse: the refrain the index keeps in the reference cell
  // ("Al·leluia, al·leluia, al·leluia") is not data in cpl-app at all — it is a constant inside its
  // own screen — so nothing here can supply it. See PLAN §18.3.
  ACCLAMATION: role('hallelujah', 'hallelujah', { noRef: true }),
};

// cpl-app writes "-" where a slot is empty, and its own `StringManagement.hasLiturgyContent` treats
// that exactly like an empty string. Observing it would file a hyphen as if it were a reading.
function massContent(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const t = String(v).trim();
  return t === '' || t === '-' ? null : t;
}

// The reference cell, which carries TWO things separated by a literal `_`: `formatTitleLectures()`
// renders `split("_")[0]` as the citation and `[1]` as the subtitle. cpl-app already holds the two
// apart — `quote` and `comment` — so the separator goes between them, spelled the way `es` spells it
// ("Ez 9, 17; 10, 18-22: _La marca en la frente…_").
//
// The psalm is the exception, and deliberately. In `es` the subtitle of a psalm is its RESPONSE and
// the body carries none (917 of 918 psalms have no `R.` line); cpl-app does the opposite — the
// response is inside the body, repeated after each stanza, which is how the Catalan volume prints it
// and how cpl-app's own screen shows it. `formatTextLecture()` turns those `R.` into `℟` on its own,
// so copying the body as it is renders correctly and no surgery on a liturgical text is needed. The
// reference is then just the citation.
//
// cpl-app leaves the book name off a psalm ("112,1-2.3-4.5-6 (R.: 4b)") because its screen prints
// "Salm responsorial" before it, so `Sl ` is prefixed here — but only to a citation that really
// starts with a psalm number, never to a canticle ("Ex 15, 1-2…") standing in for one, which the
// Easter Vigil uses twice.
export function massCitation(part: { quote?: string; comment?: string } | null, isPsalm?: boolean): string | null {
  const quote = massContent(part && part.quote);
  if (isPsalm) return quote && /^\d/.test(quote) ? `Sl ${quote}` : quote;
  const comment = massContent(part && part.comment);
  if (quote && comment) return `${quote}: _${comment}_`;
  return quote || comment || null;
}

// One Mass of cpl-app, keyed by the index's role names. `title` ("Lectura de la profecia d'Ezequiel")
// is deliberately absent: the index has no cell for it and saints-app builds it itself from the
// role's own literal.
export function extractMassFields(dayMass: DayMassLiturgy | null | undefined): IndexFields | null {
  if (!dayMass) return null;
  const out: IndexFields = {};
  for (const [roleName, spec] of Object.entries(MASS_ROLES)) {
    const part: MassPart | undefined = dayMass[spec.part];
    if (!part) continue;
    if (!('noRef' in spec && spec.noRef)) {
      const ref = massCitation(part, 'psalm' in spec && spec.psalm);
      if (ref) out[`${roleName}_ref`] = ref;
    }
    // The name was checked against the model where MASS_ROLES is declared; here it is a lookup.
    const body = massContent((part as unknown as Record<string, unknown>)[spec.body]);
    if (body) out[`${roleName}_texto`] = body;
  }
  return out;
}

// --- Compline ----------------------------------------------------------------------------
//
// The one Hour that does NOT go through `day_specific_texts`: saints-app keeps it as seven files
// per language, one per weekday (`complineStore.ts` imports `compline/{lang}/{dayNumber}.json`).
// No shared numeric id space, so no shared cells, no conflicts and no probe — see PLAN §16.
//
// What the file needs besides these fields — the heading, the Latin hymn, the identity — has no
// source in cpl-app and is copied or hand-translated by the extractor. Here is only what cpl-app
// itself says.
export function extractComplineFields(np: NightPrayer | null | undefined): IndexFields | null {
  if (!np) return null;
  const out: IndexFields = {};
  setField(out, 'himno', np.anthem);

  const psalms: [string, Psalm | null][] = [['primer', np.firstPsalm]];
  if (np.hasMultiplePsalms && np.secondPsalm) psalms.push(['segundo', np.secondPsalm]);
  for (const [prefix, psalm] of psalms) {
    if (!psalm) continue;
    setField(out, `${prefix}_salmo_cita`, psalm.title);
    // With two psalms under one antiphon cpl-app leaves the second one's empty; the renderer
    // then has nothing to print there, which is what the screen shows too. The empty string is
    // written on purpose, so `setField` is not the one to do it.
    out[`${prefix}_salmo_antifona`] = prefix === 'segundo' && np.useOnlyFirstPsalmAntiphon ? '' : psalm.antiphon || '';
    setField(out, `${prefix}_salmo_texto`, psalm.psalm);
  }

  if (np.shortReading) {
    setField(out, 'lectura_biblica_cita', np.shortReading.quote);
    setField(out, 'lectura_biblica', np.shortReading.shortReading);
  }
  setField(out, 'responsorio', responsoryParts(np as unknown as AnyHour));
  setField(out, 'cantico_evangelico_antifona', np.evangelicalAntiphon);
  setField(out, 'oracion_final', np.finalPrayer);
  return out;
}

/** The seasonal antiphon cpl-app carries on the short responsory: the Triduum's and the Easter octave's. */
export function complineSpecialAntiphon(np: NightPrayer | null | undefined): string | null {
  return (np && np.shortResponsory && np.shortResponsory.specialAntiphon) || null;
}
