import { SpecificLiturgyTimeType } from '../services/celebrationTimeEnums';
import { hasContent, hasVisibleText } from './content';
import { singleLine } from './catalanText';
import { palmSundayGospel } from './palmSundayGospel';

// The Mass block on the home: the phrase of the Gospel and a button for each reading.

// The reading screen (LDDisplay) opens at one of these
export type MassScreenType =
  '1Lect' | 'Salm' | '2Lect' | 'Evangeli' | 'Rams' | 'VetllaPasquaLecturesSalms' | 'VetllaPasquaEvangeli';

// "Avui | Vespertina": the Mass of the day or the evening Mass of tomorrow's celebration
export type MassChoice = 'normal' | 'vespers';

export interface MassReadingInput {
  quote: string;
  comment: string;
}

export interface DayMassInput {
  title: string;
  secondReading: { reading: string };
  gospel: MassReadingInput;
}

export interface MassInput {
  today: DayMassInput;
  hasVespers: boolean;
  vespers: DayMassInput;
}

export interface MassDayInput {
  date: Date;
  specificLiturgyTime: string;
  yearType: string;
}

export interface MassButton {
  label: string;
  opens: MassScreenType;
}

// What the reading screen needs besides where to open: as MassLiturgyMainScreen passed it
export interface MassScreenParams {
  needSecondReading: boolean;
  useVespersTexts: boolean;
}

export interface MassBlock {
  // "Missa", or "Vetlla Pasqual" on Holy Saturday
  label: string;
  selector: { choice: MassChoice; vespersTitle: string } | null;
  gospel: { caption: string; phrase: string | null; opens: MassScreenType };
  // "Benedicció dels Rams"
  extra: MassButton | null;
  readings: MassButton[];
  params: MassScreenParams;
}

// --- Avui | Vespertina ------------------------------------------------------------------------
// What MassLiturgyMainScreen.Refresh_Layout decided, unchanged: the choice made today is kept
// for the rest of the day; if there is none, from the afternoon on the evening Mass is chosen.

export interface MassChoiceInput {
  // What was saved: "21:8:2026_vespers" (StorageKeys.CurrentMassVespersSelector)
  stored: string | null | undefined;
  // The day being shown, as DateManagement.getDateKeyToBeStored writes it
  todayKey: string;
  hasVespers: boolean;
  tomorrowIsEasterSunday: boolean;
  // Hour of the day of the date being shown
  hour: number;
  afternoonHour: number;
}

export interface MassChoiceDecision {
  choice: MassChoice;
  // Whether it was decided now and has to be saved
  save: boolean;
}

export function storedMassChoice(stored: string | null | undefined, todayKey: string): MassChoice | null {
  if (!stored || !stored.includes('_')) return null;
  const [day, choice] = stored.split('_');
  if (day !== todayKey || choice === 'undefined') return null;
  return choice === 'vespers' ? 'vespers' : 'normal';
}

export function massChoiceToStore(todayKey: string, choice: MassChoice): string {
  return `${todayKey}_${choice}`;
}

export function resolveMassChoice(input: MassChoiceInput): MassChoiceDecision {
  const stored = storedMassChoice(input.stored, input.todayKey);
  if (stored) return { choice: stored, save: false };
  const evening = !input.tomorrowIsEasterSunday && input.hasVespers && input.hour >= input.afternoonHour;
  return { choice: evening ? 'vespers' : 'normal', save: true };
}

// --- The block ----------------------------------------------------------------------------------

export interface MassBlockInput {
  today: MassDayInput;
  tomorrow: { specificLiturgyTime: string };
  mass: MassInput;
  choice: MassChoice;
}

function gospelCaption(prefix: string | null, quote: string): string {
  const parts = [prefix, 'Evangeli', hasVisibleText(quote) ? quote : null];
  return parts.filter(Boolean).join(' · ');
}

const phraseOf = (comment: string) => (hasVisibleText(comment) ? singleLine(comment) : null);

export function buildMass({ today, tomorrow, mass, choice }: MassBlockInput): MassBlock {
  const vespers = choice === 'vespers' && !!mass.hasVespers;
  const selected = vespers ? mass.vespers : mass.today;
  const params: MassScreenParams = {
    needSecondReading: hasContent(selected.secondReading.reading),
    useVespersTexts: choice === 'vespers',
  };
  const selector = mass.hasVespers
    ? { choice, vespersTitle: hasContent(mass.vespers.title) ? mass.vespers.title : '' }
    : null;

  // Holy Saturday: the Easter Vigil
  if (tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
    return {
      label: 'Vetlla Pasqual',
      selector,
      gospel: {
        caption: gospelCaption(null, mass.today.gospel.quote),
        phrase: phraseOf(mass.today.gospel.comment),
        opens: 'VetllaPasquaEvangeli',
      },
      extra: null,
      readings: [
        { label: 'Lectures i salms', opens: 'VetllaPasquaLecturesSalms' },
        { label: 'Evangeli', opens: 'VetllaPasquaEvangeli' },
      ],
      params,
    };
  }

  const readings: MassButton[] = [
    { label: 'Primera lectura', opens: '1Lect' },
    { label: 'Salm', opens: 'Salm' },
    ...(params.needSecondReading ? [{ label: 'Segona lectura', opens: '2Lect' as MassScreenType }] : []),
    { label: 'Evangeli', opens: 'Evangeli' },
  ];

  // Palm Sunday: the Passion has no phrase, the Gospel of the blessing does
  const blessing =
    today.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ? palmSundayGospel(today.yearType) : null;
  if (blessing) {
    return {
      label: 'Missa',
      selector,
      gospel: { caption: `Benedicció dels Rams · ${blessing.reference}`, phrase: blessing.phrase, opens: 'Rams' },
      extra: { label: 'Benedicció dels Rams', opens: 'Rams' },
      readings,
      params,
    };
  }

  return {
    label: 'Missa',
    selector,
    gospel: {
      caption: gospelCaption(
        vespers && hasContent(mass.vespers.title) ? mass.vespers.title : null,
        selected.gospel.quote,
      ),
      phrase: phraseOf(selected.gospel.comment),
      opens: 'Evangeli',
    },
    extra: null,
    readings,
    params,
  };
}
