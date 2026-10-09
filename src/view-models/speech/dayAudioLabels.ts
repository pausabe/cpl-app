// What Configuració says of today's audio downloaded beforehand (controllers/dayAudioController):
// the button, how it is going, and what happened when it did not go well.

export type DayAudioPhase =
  'idle' | 'downloading' | 'done' | 'partial' | 'offline' | 'limited' | 'noSpace' | 'notReady';

export interface DayAudioLabels {
  // The button, or null while there is nothing to press
  action: string | null;
  status: string | null;
  // 0 to 1 while downloading
  progress: number | null;
}

// A day is between 14 and 36 MB, 18 most days (the sweep of October 2026)
export const DAY_AUDIO_HELP =
  "Totes les hores i les lectures de la missa d'avui al mòbil, per escoltar-les sense connexió. Ocupa uns 20 MB.";

export function dayAudioLabels(phase: DayAudioPhase, progress: number): DayAudioLabels {
  const again = 'Torna-ho a provar';
  switch (phase) {
    case 'downloading':
      return { action: null, status: `Baixant… ${Math.round(progress * 100)} %`, progress };
    case 'done':
      return { action: null, status: "L'àudio d'avui ja és al mòbil.", progress: null };
    case 'partial':
      return {
        action: again,
        status: 'Ja és al mòbil, menys algun tros que encara no està preparat: aquell se saltarà.',
        progress: null,
      };
    case 'offline':
      return { action: again, status: 'Sense connexió. Torna-ho a provar quan en tinguis.', progress: null };
    case 'limited':
      return { action: again, status: "Ara no es pot baixar l'àudio. Torna-ho a provar més tard.", progress: null };
    case 'noSpace':
      return { action: again, status: 'El mòbil no té prou espai lliure.', progress: null };
    case 'notReady':
      return { action: again, status: "L'àudio d'avui encara no està preparat.", progress: null };
    default:
      return { action: "Baixa l'àudio d'avui", status: null, progress: null };
  }
}
