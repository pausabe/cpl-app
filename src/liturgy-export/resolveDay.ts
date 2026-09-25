// One date, prayed as cpl-app prays it, plus the two things a comparison needs that the app
// itself never has to ask for: the same day with the celebration taken out, and the Mass of
// the weekday next to the Mass that was rendered.
//
// It walks the same path as `dataService.reloadAllData`, minus the global state and minus the
// settings coming off the phone. Anything the app changes here — a renamed service, a renamed
// field — breaks `make types` in the very push that renames it. That is the whole reason this
// file is TypeScript and lives inside `src`.
import Hours, { SpecificHour } from '../models/hours-liturgy/Hours';
import HoursLiturgy from '../models/hours-liturgy/HoursLiturgy';
import Laudes from '../models/hours-liturgy/Laudes';
import Vespers from '../models/hours-liturgy/Vespers';
import LiturgyDayInformation from '../models/LiturgyDayInformation';
import { DayMassLiturgy } from '../models/MassLiturgy';
import { Settings } from '../models/Settings';
import * as DatabaseDataService from '../services/databaseDataService';
import { obtainHours } from '../services/liturgy/hoursService';
import { obtainHoursLiturgy } from '../services/liturgy/hoursLiturgyService';
import { obtainLaudes } from '../services/liturgy/laudesService';
import { obtainLiturgyDayInformation } from '../services/liturgy/liturgyDayInformationService';
import { obtainLiturgyMasters } from '../services/liturgy/liturgyMastersService';
import { obtainMassLiturgy } from '../services/liturgy/massLiturgyService';
import { obtainVespers } from '../services/liturgy/vespersService';

/** The same Hours, resolved with no celebration: what the day would be if it were a plain weekday. */
export type FerialHours = {
  laudes: Laudes;
  vespers: Vespers;
  tercia: SpecificHour;
  sexta: SpecificHour;
  nona: SpecificHour;
};

/** What the app showed, and what the weekday alone would have given. Equal when nothing is proper. */
export type ResolvedMass = {
  rendered: DayMassLiturgy;
  ferial: DayMassLiturgy | null;
};

export type ResolvedDay = {
  liturgyDayInformation: LiturgyDayInformation;
  hoursLiturgy: HoursLiturgy;
  ferial: FerialHours | null;
  mass: ResolvedMass | null;
};

/** What to resolve besides the Hours. Both are real work, and the celebration probe needs neither. */
export type ResolveOptions = { ferial?: boolean; mass?: boolean };

export async function resolveDay(
  date: Date,
  settings: Settings,
  { ferial: wantFerial = true, mass: wantMass = true }: ResolveOptions = {},
): Promise<ResolvedDay> {
  const liturgyDayInformation = await obtainLiturgyDayInformation(date, settings);
  const tomorrowDayInformation = await obtainLiturgyDayInformation(liturgyDayInformation.tomorrow.date, settings);
  const todayMasters = await obtainLiturgyMasters(liturgyDayInformation, settings);
  const tomorrowMasters = await obtainLiturgyMasters(tomorrowDayInformation, settings);

  // Before `obtainHoursLiturgy`, not after: that is when nothing has yet written a celebration
  // into anything the control is made of.
  const ferial = wantFerial ? resolveFerial(todayMasters, liturgyDayInformation, settings) : null;
  const hoursLiturgy = await obtainHoursLiturgy(todayMasters, tomorrowMasters, liturgyDayInformation, settings);

  return {
    liturgyDayInformation,
    hoursLiturgy,
    ferial,
    mass: wantMass ? await resolveMass(liturgyDayInformation, hoursLiturgy, settings) : null,
  };
}

// The day with the celebration taken out, so that a caller can tell a proper text from a
// weekday one field by field. Terce, Sext and None come as one object, and asked for with an
// empty `Hours` it is the same call the app makes, so seasons and psalter weeks behave exactly
// as they do on screen.
//
// Every Hour here is asked for AFRESH, and Vespers above all. `hoursLiturgy.vespersOptions
// .vespersWithoutCelebration` looks like the control and is not: `mergeVespersWithCelebration`
// starts from that very object (`let vespers = withoutCelebrationVespers`) and writes the
// celebration's parts into it, so by the time the day is resolved the two are the same object.
// Reading it marks every field of Vespers as ferial and invents a divergence on every single
// memorial — MIGRA-001, which `review/resolve-cpl-days.test.js` had to work around with a
// private copy of this function. The control is taken here instead, and there is one resolver.
function resolveFerial(
  masters: Parameters<typeof obtainLaudes>[0],
  liturgyDayInformation: LiturgyDayInformation,
  settings: Settings,
): FerialHours {
  const ferialHours = obtainHours(masters, liturgyDayInformation.today, new Hours(), settings);
  return {
    laudes: obtainLaudes(masters, liturgyDayInformation.today, new Laudes(), settings),
    vespers: obtainVespers(masters, liturgyDayInformation.today, settings),
    tercia: ferialHours.thirdHour,
    sexta: ferialHours.sixthHour,
    nona: ferialHours.ninthHour,
  };
}

// The Mass, in the two halves saints-app keeps apart.
//
// `all_lectures.json` carries a memorial's own readings under `CELEBRATION_*` and the weekday's
// under the plain roles, and `lecturesStore` merges the two so the page shows both. cpl-app
// shows ONE Mass: `obtainMassLiturgy` returns the celebration's on a memorial, a feast or a
// solemnity, and the weekday's otherwise. So which of the two cells cpl-app's text belongs in
// depends on what it decided to render — and the way to know is the same trick the Hours use:
// ask for the weekday's Mass a second time, from the real code path (`getNormalDaysMassLiturgy`,
// keyed on season, weekday, week and year cycle), and see whether what it rendered is that or
// something else.
//
// `MassLiturgy.vespers` is the anticipated evening Mass of the following day. The index has one
// entry per day and no cell for it, so it is not carried: see PLAN §18.5.
export async function resolveMass(
  liturgyDayInformation: LiturgyDayInformation,
  hoursLiturgy: HoursLiturgy,
  settings: Settings,
): Promise<ResolvedMass | null> {
  let rendered: DayMassLiturgy;
  try {
    const massLiturgy = await obtainMassLiturgy(
      liturgyDayInformation,
      hoursLiturgy.todayCelebrationInformation,
      hoursLiturgy.tomorrowCelebrationInformation,
      settings,
    );
    rendered = massLiturgy.today;
  } catch {
    return null;
  }
  let ferial: DayMassLiturgy | null = null;
  try {
    ferial = await DatabaseDataService.getNormalDaysMassLiturgy(liturgyDayInformation.today);
  } catch {
    ferial = null;
  }
  return { rendered, ferial };
}
