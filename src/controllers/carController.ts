import { useSyncExternalStore } from 'react';
import { File, Paths } from 'expo-file-system';
import {
  carReady,
  carWasUsed,
  hasCarSession,
  onCar,
  setCarCatalog,
  type CarCatalogEntry,
} from '../services/audio/carAudio';
import type { SpeechPiece } from '../view-models/speech/script';
import * as Logger from '../utils/logger';
import { reportProblem } from '../services/health/problems';
import * as Listen from './listenController';

// Android Auto: choosing an hour of today in the car, with the phone in a pocket and maybe the app
// closed. The words of an hour come from its screen (the voice reads what the screen shows), and in
// the car there is no screen: so the phone gets them ready beforehand. Every time the app opens on a
// phone that has been in a car (or when the car connects with the app open), CarScriptPreparer draws
// each hour of today out of sight and keeps its words in a file; the car offers those hours, and
// «Continua escoltant» with the one left halfway. With the app closed, Android Auto wakes it up
// without a screen and it plays from the file (modules/cpl-car).

export interface PreparedHour {
  // «Laudes» (the hour as the voice knows it), «Laudes» (as the car shows it), what goes under it
  hour: string;
  title: string;
  subtitle: string;
  pieces: SpeechPiece[];
}

export interface PreparedDay {
  day: string;
  hours: PreparedHour[];
}

// The hour left halfway, for «Continua escoltant»
interface Resume {
  day: string;
  hour: string;
  index: number;
  title: string;
  part: string;
}

const FILE_NAME = 'car-hours.json';
const RESUME_NAME = 'car-resume.json';
export const CONTINUE = 'continue';

const file = (name: string) => new File(Paths.document, name);

function readJson<T>(name: string): T | null {
  try {
    const f = file(name);
    return f.exists ? (JSON.parse(f.textSync()) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(name: string, value: unknown) {
  try {
    file(name).write(JSON.stringify(value));
  } catch {
    // Next time
  }
}

export function today(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const hourId = (day: string, hour: string) => `${day}|${hour}`;

let prepared: PreparedDay | null | undefined;

export function preparedDay(): PreparedDay | null {
  if (prepared === undefined) prepared = readJson<PreparedDay>(FILE_NAME);
  return prepared;
}

// --- What the car offers --------------------------------------------------------------------------

function resumeEntry(): CarCatalogEntry | null {
  const resume = readJson<Resume>(RESUME_NAME);
  if (!resume || resume.day !== today()) return null;
  return { id: CONTINUE, title: `Continua: ${resume.title}`, subtitle: resume.part };
}

export function publishCatalog() {
  if (!hasCarSession()) return;
  const day = preparedDay();
  Logger.log(Logger.LogKeys.Car, 'publishCatalog', `${day?.day ?? 'none'}: ${day?.hours.length ?? 0} hours`);
  const items = (day?.day === today() ? day.hours : []).map((h) => ({
    id: hourId(day!.day, h.hour),
    title: h.title,
    subtitle: h.subtitle,
  }));
  setCarCatalog(day?.day ?? today(), items, resumeEntry());
}

// --- Getting today ready (CarScriptPreparer draws the hours) ---------------------------------------

export interface HourToPrepare {
  hour: string;
  title: string;
  subtitle: string;
}

interface Preparation {
  day: string;
  hours: HourToPrepare[];
  done: PreparedHour[];
}

type Listener = () => void;
const listeners = new Set<Listener>();
let preparation: Preparation | null = null;
// Android Auto has connected while the app was open, or the app has been in a car before
let wanted = false;

function changed() {
  listeners.forEach((listener) => listener());
}

export const getPreparation = () => preparation;
export function subscribePreparation(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export const usePreparation = () => useSyncExternalStore(subscribePreparation, getPreparation, getPreparation);

// Whether the hours of this day still have to be made ready on this phone
export function needsPreparing(day: string): boolean {
  if (!hasCarSession() || preparation) return false;
  if (!wanted && !carWasUsed()) return false;
  return preparedDay()?.day !== day;
}

export function startPreparing(day: string, hours: HourToPrepare[]) {
  if (preparation || !hours.length) return;
  Logger.log(Logger.LogKeys.Car, 'startPreparing', `${day}: ${hours.map((h) => h.hour).join(', ')}`);
  preparation = { day, hours, done: [] };
  changed();
}

// One hour ready; with the last one, the file and what the car offers
export function hourPrepared(hour: PreparedHour) {
  if (!preparation) return;
  preparation.done.push(hour);
  if (preparation.done.length < preparation.hours.length) {
    preparation = { ...preparation };
    changed();
    return;
  }
  // An hour that gave no words is not offered
  prepared = { day: preparation.day, hours: preparation.done.filter((h) => h.pieces.length > 0) };
  writeJson(FILE_NAME, prepared);
  preparation = null;
  changed();
  publishCatalog();
}

export function cancelPreparing() {
  if (!preparation) return;
  preparation = null;
  changed();
}

// --- What the car asks for --------------------------------------------------------------------------

async function playFromCar(id: string) {
  const state = Listen.getListenState();
  if (id === CONTINUE) {
    // Still here: it goes on
    if (state.phase !== 'idle' && state.phase !== 'finished') {
      if (state.phase === 'paused') Listen.toggle();
      return;
    }
    const resume = readJson<Resume>(RESUME_NAME);
    const hour = resume && resume.day === today() ? preparedDay()?.hours.find((h) => h.hour === resume.hour) : null;
    if (!resume || !hour) return;
    await Listen.listen(hour.hour, hour.title, hour.pieces);
    if (resume.index > 0) Listen.jump(resume.index);
    return;
  }
  const day = preparedDay();
  const hour = day?.hours.find((h) => hourId(day.day, h.hour) === id);
  if (!hour) return;
  if (state.hour === hour.hour && state.phase !== 'idle' && state.phase !== 'finished') {
    if (state.phase === 'paused') Listen.toggle();
    return;
  }
  await Listen.listen(hour.hour, hour.title, hour.pieces);
}

// The hour being read, kept for «Continua escoltant» when it stops halfway
let lastResume = '';
function rememberWhereItIs() {
  const state = Listen.getListenState();
  if (!state.hour || state.phase === 'idle') return;
  // From the start of the part: the car's list changes once a part, not once a strophe
  const part = Listen.partsOf(state.pieces)
    .filter((p) => p.index <= state.index)
    .pop();
  const resume: Resume = {
    day: today(),
    hour: state.hour,
    index: state.phase === 'finished' ? 0 : (part?.index ?? 0),
    title: state.title,
    part: part?.title ?? state.title,
  };
  const key = `${resume.hour}|${resume.index}|${resume.part}`;
  if (key === lastResume) return;
  lastResume = key;
  writeJson(RESUME_NAME, resume);
  publishCatalog();
}

let wired = false;

// Listening to the car, once, as soon as the app's code is there (also with no screen, when Android
// Auto wakes the app up)
export function wireCar() {
  if (wired || !hasCarSession()) return;
  wired = true;
  onCar('onCarCommand', ({ type }) => {
    Logger.log(Logger.LogKeys.Car, 'onCarCommand', type);
    if (type === 'next') Listen.nextPart();
    else Listen.previousPart();
  });
  onCar('onCarPlay', ({ id }) => {
    Logger.log(Logger.LogKeys.Car, 'onCarPlay', id);
    playFromCar(id).catch((error) => {
      Logger.logError(Logger.LogKeys.Car, 'onCarPlay', error);
      reportProblem('car', error);
    });
  });
  onCar('onCarConnected', () => {
    Logger.log(Logger.LogKeys.Car, 'onCarConnected', 'the car is here');
    wanted = true;
    changed();
  });
  Listen.subscribeListen(rememberWhereItIs);
  let lastPhase = '';
  Listen.subscribeListen(() => {
    const { phase, hour } = Listen.getListenState();
    const now = `${hour} ${phase}`;
    if (now === lastPhase) return;
    lastPhase = now;
    Logger.log(Logger.LogKeys.Car, 'listen', now);
  });
  publishCatalog();
  carReady();
}

// For tests
export function resetCar() {
  prepared = undefined;
  preparation = null;
  wanted = false;
  lastResume = '';
  wired = false;
}
