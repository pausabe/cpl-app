import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from 'expo-audio';
import { Asset } from 'expo-asset';
import { StorageFullError, filePieceStore, type PieceStore } from '../services/audio/pieceStore';
import {
  downloadPieces,
  forgetHourFile,
  forgetOldHourFiles,
  readyFromStart,
  writeHourFile,
  type HourFile,
  type ScriptPiece,
} from '../services/audio/hourAudio';
import { STATUS_MAX_AGE, fetchAudioStatus, savedAudioStatus } from '../services/audio/audioStatus';
import { forgetChangedPieces } from '../services/audio/audioChanges';
import { attachToCar, detachFromCar, hasCarSession, updateCar } from '../services/audio/carAudio';
import type { SpeechPiece } from '../view-models/speech/script';

// The prayer read aloud: one hour at a time, for the whole app, so that it goes on when the screen
// is left, with the phone locked and in the car.
//
// It plays one MP3 for the hour (services/audio): what is on the phone plays at once; what is not,
// is downloaded in the order it is said, and it starts as soon as the beginning is here, the file
// growing while the rest arrives. When the audio cannot be had (no network, a limit of cpl-api, a
// full phone) it says so and stops: there is no phone's own voice any more. Pau tried it with no
// network and heard nothing at all, on iPhone or Android (the phones rarely have a Catalan voice),
// and he preferred a clear word to a poor voice (9 October 2026). A piece cpl-api does not have is
// left out, and the hour goes on without it.

export type ListenPhase = 'idle' | 'preparing' | 'playing' | 'paused' | 'waiting' | 'finished';
// The pace, as a percentage of the normal one, in steps of 5, kept for the next time. Pau found the
// voices' own pace a little slow: 100 % is a touch faster than Azure's (8 October 2026).
export const NORMAL_RATE = 1.05;
export const SPEED_STEP = 5;
export const MIN_SPEED = 75;
export const MAX_SPEED = 150;
const SPEED_KEY = 'listenSpeed';
export const rateOf = (percent: number) => (NORMAL_RATE * percent) / 100;

export interface ListenState {
  phase: ListenPhase;
  hour: string | null;
  // «Laudes», «Ofici de lectura», «Lectures de la missa»
  title: string;
  pieces: SpeechPiece[];
  // The piece being said, and where the hour is
  index: number;
  position: number;
  seconds: number;
  // How much of the hour is on the phone, 0 to 1, while it is being downloaded
  progress: number;
  // Percentage of the normal pace
  speed: number;
}

const IDLE: ListenState = {
  phase: 'idle',
  hour: null,
  title: '',
  pieces: [],
  index: 0,
  position: 0,
  seconds: 0,
  progress: 0,
  speed: 100,
};

// It starts as soon as these many pieces from the beginning are here (or all of them, if fewer)
const START_PIECES = 10;

// What the screen of the hour says when it cannot be heard (a dialog over it). The phone's own voice
// read it before, and with no Catalan voice installed it was silence (Pau, 9 October 2026).
export const PROBLEMS = {
  offline:
    "No hi ha connexió, i l'àudio d'aquesta pregària no és al mòbil.\n\nSi saps que estaràs sense connexió, baixa't abans l'àudio d'avui a Configuració.",
  lost: "S'ha perdut la connexió, i la resta de l'àudio d'aquesta pregària no és al mòbil.",
  limited: "Ara no es pot baixar l'àudio. Torna-ho a provar d'aquí a una estona.",
  noSpace: "El mòbil no té prou espai lliure per a l'àudio.",
  missing: "Aquesta pregària encara no té l'àudio preparat.",
};

export interface ListenProblem {
  hour: string;
  message: string;
}

const problemListeners = new Set<() => void>();
let problem: ListenProblem | null = null;

function setProblem(next: ListenProblem | null) {
  if (next === problem) return;
  problem = next;
  problemListeners.forEach((listener) => listener());
}

export const getListenProblem = () => problem;
export function subscribeListenProblem(listener: () => void) {
  problemListeners.add(listener);
  return () => {
    problemListeners.delete(listener);
  };
}
export const useListenProblem = () => useSyncExternalStore(subscribeListenProblem, getListenProblem, getListenProblem);
export const dismissListenProblem = () => setProblem(null);

// --- The store the screens read ---------------------------------------------------------------

type Listener = () => void;
const listeners = new Set<Listener>();
let state: ListenState = IDLE;

function set(changes: Partial<ListenState>) {
  state = { ...state, ...changes };
  listeners.forEach((listener) => listener());
}

export const getListenState = () => state;
export function subscribeListen(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export const useListen = () => useSyncExternalStore(subscribeListen, getListenState, getListenState);

// --- Whether it can be heard ----------------------------------------------------------------

// cpl-api says whether the prayer can be heard (services/audio/audioStatus); until it has said
// anything, it can
export interface ListenAvailability {
  enabled: boolean;
  message: string | null;
}

const availabilityListeners = new Set<Listener>();
let availability: ListenAvailability = { enabled: true, message: null };
let lastCheck = -Infinity;

function setAvailability(next: ListenAvailability) {
  if (next.enabled === availability.enabled && next.message === availability.message) return;
  availability = next;
  availabilityListeners.forEach((listener) => listener());
}

export const getListenAvailability = () => availability;
export function subscribeListenAvailability(listener: Listener) {
  availabilityListeners.add(listener);
  return () => {
    availabilityListeners.delete(listener);
  };
}
export const useListenAvailability = () =>
  useSyncExternalStore(subscribeListenAvailability, getListenAvailability, getListenAvailability);

// What was last heard from cpl-api, and a new question if it is a few hours old. The answer also
// says whether pieces the phone may have were remade with another sound: those go.
export async function refreshListenAvailability(now = Date.now()) {
  if (now - lastCheck < STATUS_MAX_AGE) return;
  lastCheck = now;
  const saved = await savedAudioStatus();
  if (saved) setAvailability({ enabled: saved.enabled, message: saved.message });
  if (saved && now - saved.checkedAt < STATUS_MAX_AGE) return;
  const fresh = await fetchAudioStatus(now);
  if (!fresh) return;
  setAvailability({ enabled: fresh.enabled, message: fresh.message });
  await forgetChangedPieces(fresh.version, pieceStore()).catch(() => undefined);
}

// --- What it plays with ---------------------------------------------------------------------

interface Session {
  pieces: ScriptPiece[];
  abort: AbortController;
  file: HourFile | null;
  // Why the rest will not come (no network, a limit): when what is here runs out, it says so and stops
  cutShort: string | null;
  // One change of the file at a time: the batches of pieces arrive one after the other
  queue: Promise<unknown>;
}

function inTurn(current: Session, work: () => Promise<unknown>) {
  current.queue = current.queue.then(work, work);
  return current.queue;
}

let store: PieceStore | null = null;
let player: AudioPlayer | null = null;
let session: Session | null = null;

// The pieces kept on the phone: those of the hours heard, and those of a day downloaded beforehand
// (dayAudioController)
export function pieceStore(): PieceStore {
  if (!store) {
    store = filePieceStore();
    forgetOldHourFiles();
  }
  return store;
}

function audioPlayer(): AudioPlayer {
  if (player) return player;
  player = createAudioPlayer(null, { updateInterval: 500 });
  player.addListener('playbackStatusUpdate', onStatus);
  // It plays with the phone on silent, locked and with the app in the background
  setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' }).catch(
    () => undefined,
  );
  return player;
}

// For tests: start again from nothing, with a store of their own
export function resetListen(testStore?: PieceStore) {
  stop();
  store = testStore ?? null;
  player = null;
  state = IDLE;
  availability = { enabled: true, message: null };
  lastCheck = -Infinity;
  problem = null;
}

// Where each part of the hour starts (the titles the reader says), for jumping from part to part
function partStarts(pieces: SpeechPiece[]): number[] {
  const starts = pieces.map((p, i) => (p.kind === 'secció' || p.kind === 'títol' ? i : -1)).filter((i) => i >= 0);
  return starts.length && starts[0] === 0 ? starts : [0, ...starts];
}

// The picture of the lock screen and the car: the CPL icon, as a file of the phone
let artwork: string | null = null;
async function loadArtwork(): Promise<string> {
  if (artwork !== null) return artwork;
  try {
    const asset = Asset.fromModule(require('../assets/icon/icon.png'));
    await asset.downloadAsync();
    artwork = asset.localUri ?? asset.uri ?? '';
  } catch {
    artwork = '';
  }
  return artwork;
}

function metadata(index: number) {
  return {
    title: partTitle(index),
    artist: 'CPL',
    albumTitle: state.title,
    ...(artwork ? { artworkUrl: artwork } : {}),
  };
}

// What the lock screen and the car say: the part being said
function partTitle(index: number): string {
  const titled = state.pieces
    .slice(0, index + 1)
    .reverse()
    .find((p) => p.kind === 'secció' || p.kind === 'títol');
  return titled ? titled.text.replace(/\.$/, '') : state.title;
}

// On Android, the app's own media session (services/audio/carAudio): the same for the lock screen,
// the notification and Android Auto, with ⏮ ⏭ that tell the app to jump a part
function carArtist() {
  return `${state.title} · CPL`;
}

function lockScreen(active: boolean) {
  if (!player) return;
  if (hasCarSession()) {
    if (active) attachToCar(player, partTitle(state.index), carArtist(), artwork || null);
    else detachFromCar();
    return;
  }
  try {
    if (active) {
      player.setActiveForLockScreen(true, metadata(state.index), { showSeekForward: true, showSeekBackward: true });
    } else {
      player.clearLockScreenControls();
    }
  } catch {
    // Without lock-screen controls it still plays
  }
}

function indexAt(position: number): number {
  const starts = session?.file?.starts ?? [];
  let i = 0;
  while (i + 1 < starts.length && starts[i + 1] <= position + 0.05) i++;
  return i;
}

// The lock screen and the car skip 10 seconds forward or back, natively, without telling the app;
// the app notices the jump and turns it into a jump to the next or the previous part
export const REMOTE_SKIP_SECONDS = 10;
let lastPosition = 0;
let lastAt = 0;
let ownSeekUntil = 0;

function remoteSkip(status: AudioStatus): 'next' | 'previous' | null {
  const now = Date.now();
  const elapsed = status.playing && lastAt ? ((now - lastAt) / 1000) * rateOf(state.speed) : 0;
  const jumped = status.currentTime - (lastPosition + elapsed);
  const before = lastPosition;
  lastPosition = status.currentTime;
  lastAt = now;
  if (now < ownSeekUntil) return null;
  if (Math.abs(Math.abs(jumped) - REMOTE_SKIP_SECONDS) > 1.5) return null;
  // Undone where it was, so that «previous» is decided from there
  lastPosition = before;
  return jumped > 0 ? 'next' : 'previous';
}

function onStatus(status: AudioStatus) {
  if (!session || !session.file) return;
  // With the app's own media session the jumps come as jumps (carController), not as 10 seconds
  const skip = hasCarSession() ? null : remoteSkip(status);
  if (skip) {
    set({ position: lastPosition, index: indexAt(lastPosition) });
    if (skip === 'next') nextPart();
    else previousPart();
    return;
  }
  const index = indexAt(status.currentTime);
  if (index !== state.index && player) {
    if (hasCarSession()) updateCar(partTitle(index), carArtist(), artwork || null);
    else {
      try {
        player.updateLockScreenMetadata(metadata(index));
      } catch {
        // The lock screen keeps the title it had
      }
    }
  }
  set({ position: status.currentTime, index });
  if (status.didJustFinish) {
    // The end of what is here, not of the hour: it waits for the rest, unless it will not come
    if (session.file.count < session.pieces.length) {
      if (session.cutShort) giveUp(session.cutShort);
      else set({ phase: 'waiting' });
    } else finish(session);
  }
}

async function load(file: HourFile, at: number, play: boolean) {
  const p = audioPlayer();
  const previous = session?.file?.uri ?? null;
  if (session) session.file = file;
  p.replace({ uri: file.uri });
  p.setPlaybackRate(rateOf(state.speed));
  ownSeekUntil = Date.now() + 1500;
  lastPosition = at;
  if (at > 0) await p.seekTo(at);
  if (play) p.play();
  if (previous && previous !== file.uri) forgetHourFile(previous);
  set({ seconds: file.seconds });
}

// The file again with every piece that is here from the start; where it was, and playing if it was
async function grow(current: Session) {
  const ready = readyFromStart(current.pieces, pieceStore());
  if (current !== session || !current.file || ready <= current.file.count) return;
  const waiting = state.phase === 'waiting';
  const at = waiting ? current.file.seconds : (player?.currentTime ?? state.position);
  let file: HourFile;
  try {
    file = await writeHourFile(current.pieces, ready, pieceStore());
  } catch (error) {
    if (error instanceof StorageFullError) return giveUp(PROBLEMS.noSpace);
    throw error;
  }
  if (current !== session) return forgetHourFile(file.uri);
  await load(file, at, waiting || state.phase === 'playing');
  if (waiting) set({ phase: 'playing' });
}

async function startAudio(current: Session) {
  const ready = readyFromStart(current.pieces, pieceStore());
  let file: HourFile;
  try {
    file = await writeHourFile(current.pieces, ready, pieceStore());
  } catch (error) {
    if (error instanceof StorageFullError) return giveUp(PROBLEMS.noSpace);
    throw error;
  }
  if (current !== session) return forgetHourFile(file.uri);
  await loadArtwork();
  await load(file, 0, true);
  set({ phase: 'playing', index: 0, position: 0 });
  lockScreen(true);
}

// The audio will not come: the screen says why, and the player goes away
function giveUp(message: string) {
  const { hour } = state;
  if (!session || !hour) return;
  stop();
  setProblem({ hour, message });
}

// The pieces cpl-api does not have are left out of the hour (and of what the screen follows)
function leaveOut(current: Session, missing: Set<string>) {
  const keep = current.pieces.map((p) => !missing.has(p.key) || pieceStore().has(p.key));
  current.pieces = current.pieces.filter((_, i) => keep[i]);
  set({ pieces: state.pieces.filter((_, i) => keep[i]) });
}

// --- What the screens can do ----------------------------------------------------------------

export async function listen(hour: string, title: string, pieces: SpeechPiece[]) {
  stop();
  const script: ScriptPiece[] = pieces.map(({ key, voice, text, pause }) => ({ key, voice, text, pause }));
  const current: Session = {
    pieces: script,
    abort: new AbortController(),
    file: null,
    cutShort: null,
    queue: Promise.resolve(),
  };
  session = current;
  setProblem(null);
  set({ ...IDLE, speed: state.speed, phase: 'preparing', hour, title, pieces });

  let started = false;
  // Starts when the beginning is here; once started, the file grows with what has arrived
  const advance = () =>
    inTurn(current, async () => {
      if (current !== session) return;
      if (started) return grow(current);
      const pieces = current.pieces;
      if (pieces.length && readyFromStart(pieces, pieceStore()) >= Math.min(START_PIECES, pieces.length)) {
        started = true;
        await startAudio(current);
      }
    });

  await advance();
  const download = await downloadPieces(script, pieceStore(), {
    signal: current.abort.signal,
    onProgress: (done, total) => {
      if (current !== session) return;
      set({ progress: total ? done / total : 1 });
      advance();
    },
  });
  await advance();
  if (current !== session) return;
  const cut = download.offline || download.limited || download.noSpace;
  // What cpl-api does not have is left out, and the hour goes on without it
  if (!cut && download.missing.length) {
    leaveOut(current, new Set(download.missing));
    if (!current.pieces.length) return giveUp(PROBLEMS.missing);
    await advance();
    if (current !== session) return;
  }
  if (readyFromStart(current.pieces, pieceStore()) === current.pieces.length) return;
  const reason = download.noSpace ? PROBLEMS.noSpace : download.limited ? PROBLEMS.limited : PROBLEMS.offline;
  // Nothing to play: it says so at once. Otherwise what is here plays, and then it says so.
  if (!started) return giveUp(reason);
  current.cutShort = download.offline ? PROBLEMS.lost : reason;
  if (state.phase === 'waiting') giveUp(current.cutShort);
}

export function toggle() {
  if (!session) return;
  // Before it has started, the button is there to give up
  if (state.phase === 'preparing') return stop();
  if (!player || !session.file) return;
  if (state.phase === 'playing' || state.phase === 'waiting') {
    player.pause();
    set({ phase: 'paused' });
  } else if (state.phase === 'paused') {
    player.play();
    set({ phase: 'playing' });
  } else if (state.phase === 'finished') {
    player.seekTo(0).then(() => player?.play());
    set({ phase: 'playing', index: 0 });
    lockScreen(true);
  }
}

export function jump(index: number) {
  if (!session) return;
  const target = Math.max(0, Math.min(index, session.pieces.length - 1));
  const file = session.file;
  if (!player || !file || target >= file.count) return;
  ownSeekUntil = Date.now() + 1500;
  lastPosition = file.starts[target];
  player.seekTo(file.starts[target]);
  set({ index: target, position: file.starts[target] });
}

export function nextPart() {
  const next = partStarts(state.pieces).find((i) => i > state.index);
  if (next !== undefined) jump(next);
}

// A few seconds into a part, back to its start; at its start, to the one before
export function previousPart() {
  const starts = partStarts(state.pieces);
  const current = [...starts].reverse().find((i) => i <= state.index) ?? 0;
  const before = [...starts].reverse().find((i) => i < current) ?? 0;
  const file = session?.file;
  const into = file ? state.position - (file.starts[current] ?? 0) : 0;
  jump(into > 3 ? current : before);
}

export function setSpeed(percent: number) {
  const speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, Math.round(percent / SPEED_STEP) * SPEED_STEP));
  set({ speed });
  AsyncStorage.setItem(SPEED_KEY, String(speed)).catch(() => undefined);
  player?.setPlaybackRate(rateOf(speed));
}

// The pace chosen last time
export async function loadSpeed() {
  try {
    const saved = parseInt((await AsyncStorage.getItem(SPEED_KEY)) ?? '', 10);
    if (saved >= MIN_SPEED && saved <= MAX_SPEED) set({ speed: saved });
  } catch {
    // The normal pace
  }
}

// The parts of the hour, for choosing where to go: the title the reader says and where it starts
export function partsOf(pieces: SpeechPiece[]): { index: number; title: string }[] {
  return partStarts(pieces)
    .filter((i) => pieces[i] && (pieces[i].kind === 'secció' || pieces[i].kind === 'títol'))
    .map((index) => ({ index, title: pieces[index].text.replace(/\.$/, '') }));
}

// The screen of an hour was left: if that hour is the one being read, it stops (otherwise, opening
// Laudes would go on reading Completes)
export function leftHour(hour: string) {
  if (state.hour === hour) stop();
  if (problem?.hour === hour) setProblem(null);
}

// The hour heard to the end: the player says so for a moment and goes away by itself (Pau asked for
// it on 9 October 2026: once Lauds are over there is nothing left to do with it)
export const CLOSE_AFTER_FINISHING_MS = 3000;

function finish(finished: Session) {
  set({ phase: 'finished' });
  lockScreen(false);
  setTimeout(() => {
    if (session === finished && state.phase === 'finished') stop();
  }, CLOSE_AFTER_FINISHING_MS);
}

export function stop() {
  if (!session) return;
  const current = session;
  session = null;
  current.abort.abort();
  player?.pause();
  lockScreen(false);
  forgetHourFile(current.file?.uri ?? null);
  set({ ...IDLE, speed: state.speed });
}
