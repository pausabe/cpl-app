import { Linking } from 'react-native';
import * as LiturgyStore from './liturgyStore';
import { buildHours } from '../view-models/hours';
import { buildMass } from '../view-models/mass';
import { type WidgetLink, parseWidgetLink } from '../view-models/widgets';

// A touch on a widget of the home screen opens the app at what the widget was showing
// (view-models/widgets): an hour of a day, the readings of its Mass, or the home. The home
// (HomeScreenController) loads the day of the link and opens its screen here.

// The app comes back to the front with the link: for a moment the home must not take it for an
// ordinary return and load today over the day of the link
const RECENT_MS = 3000;
let lastLinkAt = 0;

export const openedFromWidgetRecently = (): boolean => Date.now() - lastLinkAt < RECENT_MS;

function heard(url: string | null | undefined): WidgetLink | null {
  const link = parseWidgetLink(url);
  if (link) lastLinkAt = Date.now();
  return link;
}

// The link that opened the app, when a widget opened it
export async function initialWidgetLink(): Promise<WidgetLink | null> {
  try {
    return heard(await Linking.getInitialURL());
  } catch {
    return null;
  }
}

// The links that come while the app is open
export function onWidgetLink(listener: (link: WidgetLink) => void): () => void {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    const link = heard(url);
    if (link) listener(link);
  });
  return () => subscription.remove();
}

export interface LinkedScreen {
  name: 'LHDisplay' | 'LDDisplay';
  params: Record<string, unknown>;
}

// The screen of a link, with the params the home gives it, once its day is the one loaded
export function linkedScreen(link: WidgetLink): LinkedScreen | null {
  const { day, hours, mass } = LiturgyStore.getSnapshot();
  if (link.kind === 'hour') {
    const tile = buildHours({
      vespersTitle: hours.vespers?.title,
      specificLiturgyTime: day.today.specificLiturgyTime,
      hour: new Date().getHours(),
    }).find((candidate) => candidate.key === link.hour);
    if (!tile) return null;
    return {
      name: 'LHDisplay',
      params: { type: tile.screenType, title: tile.label, ...(tile.subtitle ? { subtitle: tile.subtitle } : {}) },
    };
  }
  if (link.kind === 'mass') {
    // The Mass of the day, the one whose phrase the widget shows: never the evening one
    const block = buildMass({ today: day.today, tomorrow: day.tomorrow, mass, choice: 'normal' });
    return { name: 'LDDisplay', params: { type: link.opens, title: 'Missa', ...block.params } };
  }
  return null;
}
