// The export path to saints-app, in one call: a date and a diocese in, and out comes the day as
// cpl-app prays it with every Hour flattened into the field names of saints-app's shared index.
//
// Everything downstream — the join that writes the Catalan cells, the probe, the day inspector and
// the day comparator — comes through here, so none of them can drift from another. The reason it
// lives in `src` rather than in `migration-to-saints` is that here `make types` reads it: when the
// app renames a service or a field, this breaks in the same push, and not three months later in a
// merge, writing empty cells all the way.
import HoursLiturgy from '../models/hours-liturgy/HoursLiturgy';
import { SpecificHour } from '../models/hours-liturgy/Hours';
import { buildSettings, ExportProfile } from './settings';
import {
  AnyHour,
  complineSpecialAntiphon,
  extractComplineFields,
  extractHourFields,
  extractMassFields,
  extractOfficeFields,
  IndexFields,
  INTERMEDIATE_HOURS,
} from './indexFields';
import { resolveDay, ResolvedDay, ResolveOptions } from './resolveDay';

export * from './indexFields';
export * from './resolveDay';
export * from './settings';

/** The Hours the export walks, in the order they are prayed. The Office goes first: it may be said at any hour, but the volumes print it at the head. */
export const EXPORT_HOURS = ['Office', 'Laudes', 'Tercia', 'Sexta', 'Nona', 'Vespers'] as const;
export type ExportHour = (typeof EXPORT_HOURS)[number];

export type DayFields = {
  date: string;
  diocese: string;
  prayingPlace: string;
  celebration: {
    title: string | null;
    // Kept alongside the title because the same saint can be a Memory in one diocese and a Feast in
    // another, which is exactly what makes days differ between the two apps.
    celebrationType: unknown;
    specificLiturgyTime: unknown;
    week: string;
    weekCycle: string;
    yearType: string;
  };
  /** Per Hour, cpl-app's text under the index's field names. */
  hours: Partial<Record<ExportHour, IndexFields | null>>;
  /** The same Hours resolved with no celebration, for telling a proper text from a weekday one. */
  ferialHours: Partial<Record<ExportHour, IndexFields | null>>;
  /** What the app rendered, and the weekday's Mass beside it. */
  mass: { rendered: IndexFields | null; ferial: IndexFields | null } | null;
  /**
   * Compline, which travels apart: saints-app keeps it as seven files per language rather than in
   * the shared index, so it is never one of `hours`. `specialAntiphon` is the seasonal one cpl-app
   * carries on the short responsory (the Triduum's, the Easter octave's).
   */
  compline: { fields: IndexFields | null; specialAntiphon: string | null };
  /** Not one of the Hours walked field by field, but the first thing the app shows in the morning. */
  invitatory: string | null;
};

/** Where one Hour's data sits on the resolved day. Lauds, Vespers and the Office are at the root; Terce, Sext and None hang off `hours`. */
export function hourDataOf(hoursLiturgy: HoursLiturgy, hour: ExportHour): AnyHour | null {
  switch (hour) {
    case 'Office':
      return hoursLiturgy.office;
    case 'Laudes':
      return hoursLiturgy.laudes;
    case 'Vespers':
      return hoursLiturgy.vespers;
    default:
      return hoursLiturgy.hours ? (hoursLiturgy.hours[INTERMEDIATE_HOURS[hour]] as SpecificHour) : null;
  }
}

function fieldsOf(hour: ExportHour, data: AnyHour | null): IndexFields | null {
  // The Office of Readings has its own field vocabulary: two long readings and three responsories.
  return hour === 'Office' ? extractOfficeFields(data as never) : extractHourFields(data);
}

export async function resolveDayFields(
  dateStr: string,
  {
    hours = [...EXPORT_HOURS],
    ferial: wantFerial,
    mass: wantMass,
    ...profile
  }: ExportProfile & { hours?: ExportHour[] } & ResolveOptions,
): Promise<DayFields> {
  const [y, m, d] = dateStr.split('-').map(Number);
  const settings = buildSettings(profile);
  const resolved: ResolvedDay = await resolveDay(new Date(y, m - 1, d), settings, {
    ferial: wantFerial,
    mass: wantMass,
  });
  const { liturgyDayInformation, hoursLiturgy, ferial, mass } = resolved;
  const today = liturgyDayInformation.today;

  const out: DayFields = {
    date: dateStr,
    diocese: settings.dioceseName,
    prayingPlace: settings.prayingPlace,
    celebration: {
      title: (hoursLiturgy.todayCelebrationInformation && hoursLiturgy.todayCelebrationInformation.title) || null,
      celebrationType: today.celebrationType,
      specificLiturgyTime: today.specificLiturgyTime,
      week: today.week,
      weekCycle: today.weekCycle,
      yearType: today.yearType,
    },
    hours: {},
    ferialHours: {},
    mass: mass ? { rendered: extractMassFields(mass.rendered), ferial: extractMassFields(mass.ferial) } : null,
    compline: {
      fields: extractComplineFields(hoursLiturgy.nightPrayer),
      specialAntiphon: complineSpecialAntiphon(hoursLiturgy.nightPrayer),
    },
    invitatory: hoursLiturgy.invitation ? hoursLiturgy.invitation.invitationAntiphon || null : null,
  };

  const FERIAL_TWINS = ferial
    ? ({
        Laudes: ferial.laudes,
        Vespers: ferial.vespers,
        Tercia: ferial.tercia,
        Sexta: ferial.sexta,
        Nona: ferial.nona,
      } as const)
    : null;

  for (const hour of hours) {
    out.hours[hour] = fieldsOf(hour, hourDataOf(hoursLiturgy, hour));
    // The Office has no ferial twin to compare against: saints-app shows one office there,
    // whatever the day.
    out.ferialHours[hour] = FERIAL_TWINS && hour !== 'Office' ? fieldsOf(hour, FERIAL_TWINS[hour]) : null;
  }
  return out;
}
