// What the player says of the hour being read aloud: the part being said, how far it is, and what it
// is doing when it is not simply playing (getting the audio, waiting for the rest, the phone's voice).

export interface ListenProgress {
  phase: 'idle' | 'preparing' | 'playing' | 'paused' | 'waiting' | 'finished';
  title: string;
  position: number;
  seconds: number;
  progress: number;
  mode: 'audio' | 'device';
  index: number;
  pieces: { kind: string; text: string }[];
}

export interface ListenLabels {
  part: string;
  subtitle: string;
  time: string;
  // How far, 0 to 1: the hour, or the download while it is being got
  progress: number;
}

export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// The part being said: the last title the reader said before this piece, without its full stop
export function partOf(pieces: { kind: string; text: string }[], index: number, fallback: string): string {
  for (let i = Math.min(index, pieces.length - 1); i >= 0; i--) {
    const p = pieces[i];
    if (p.kind === 'secció' || p.kind === 'títol') return p.text.replace(/\.$/, '');
  }
  return fallback;
}

export function listenLabels(s: ListenProgress): ListenLabels {
  const part = partOf(s.pieces, s.index, s.title);
  const time = s.seconds > 0 ? `${clock(s.position)} de ${clock(s.seconds)}` : '';
  if (s.phase === 'preparing') {
    return { part, subtitle: `Preparant l'àudio… ${Math.round(s.progress * 100)} %`, time, progress: s.progress };
  }
  if (s.phase === 'waiting') return { part, subtitle: "Esperant la resta de l'àudio…", time, progress: s.progress };
  if (s.mode === 'device') {
    const progress = s.pieces.length ? s.index / s.pieces.length : 0;
    return { part, subtitle: `${s.title} · veu del telèfon`, time: '', progress };
  }
  if (s.phase === 'finished') return { part, subtitle: `${s.title} · acabat`, time, progress: 1 };
  return {
    part,
    subtitle: time ? `${s.title} · ${time}` : s.title,
    time,
    progress: s.seconds ? s.position / s.seconds : 0,
  };
}
