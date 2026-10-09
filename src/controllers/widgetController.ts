import * as LiturgyStore from './liturgyStore';
import * as StorageService from '../services/storage/storageService';
import StorageKeys from '../services/storage/storageKeys';
import { hasWidgets, writeWidgetPayload } from '../services/widgetService';
import { buildDayCard } from '../view-models/dayCard';
import { vespersSubtitle } from '../view-models/hours';
import { buildMass } from '../view-models/mass';
import { WIDGET_DAYS, WidgetDay, buildWidgetDay, buildWidgetPayload, isoDate } from '../view-models/widgets';
import * as Logger from '../utils/logger';

// The words of the days to come for the widgets of the home screen (view-models/widgets): from
// yesterday, which they show from midnight to 2 h, to two weeks ahead, in the place and with the
// options of the user. Asked for after every load of the home, but worked out again only when
// something the widgets show can have changed: the day, the place, an optional memorial, the
// database. Once per opening of the app at least, so that a new version of the app or of the
// widgets gets them at once.

// After the home is drawn: the days go one by one through the queue of the store, and the first
// moments of the app are for what the user touches
const DELAY_MS = 3000;

let lastKey: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let running: Promise<void> | null = null;

async function keyOf(today: Date): Promise<string> {
  const { settings, database } = LiturgyStore.getSnapshot();
  const optionalMemorial = await StorageService.getData(StorageKeys.OptionalFestivity).catch(() => null);
  return JSON.stringify([
    isoDate(today),
    settings.dioceseName,
    settings.prayingPlace,
    settings.dioceseCode,
    database.version,
    optionalMemorial,
  ]);
}

export async function widgetDays(today: Date): Promise<WidgetDay[]> {
  const days: WidgetDay[] = [];
  for (let offset = -1; offset < WIDGET_DAYS; offset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    try {
      const data = await LiturgyStore.widgetDay(date);
      const { today: day, tomorrow } = data.day;
      days.push(
        buildWidgetDay({
          date,
          card: buildDayCard(day, data.celebration, data.settings, data.optionalMemorials),
          vespers: vespersSubtitle(data.vespersTitle, day.specificLiturgyTime),
          mass: buildMass({ today: day, tomorrow, mass: data.mass, choice: 'normal' }),
        }),
      );
    } catch (error) {
      // A day the database does not have (its last days): the widgets show the hour without its name
      Logger.logError(Logger.LogKeys.Widgets, 'widgetDays', error as Error);
      if (offset >= 0) break;
    }
  }
  return days;
}

export async function refreshWidgets(now: Date = new Date()): Promise<void> {
  if (!hasWidgets()) return;
  if (running) return running;
  running = (async () => {
    const key = await keyOf(now);
    if (key === lastKey) return;
    const days = await widgetDays(now);
    if (days.length === 0) return;
    writeWidgetPayload(JSON.stringify(buildWidgetPayload(days, now)));
    lastKey = key;
  })()
    .catch((error) => Logger.logError(Logger.LogKeys.Widgets, 'refreshWidgets', error as Error))
    .finally(() => {
      running = null;
    });
  return running;
}

// After every load of the home: once it has settled, and only the last one of several in a row
export function scheduleWidgetRefresh(): void {
  if (!hasWidgets()) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    refreshWidgets();
  }, DELAY_MS);
}

// For tests
export function resetWidgets(): void {
  lastKey = null;
  running = null;
  if (timer) clearTimeout(timer);
  timer = null;
}
