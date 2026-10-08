// expo-audio under Jest, which has no native side: a player that keeps what it was asked (source,
// play, pause, seek, rate, lock screen) and lets a test send it the updates the real one sends.
const players = [];
const modes = [];

class FakePlayer {
  constructor() {
    this.calls = [];
    this.source = null;
    this.playing = false;
    this.currentTime = 0;
    this.playbackRate = 1;
    this.lockScreen = null;
    this.listeners = [];
  }
  addListener(event, listener) {
    this.listeners.push(listener);
    return { remove: () => (this.listeners = this.listeners.filter((l) => l !== listener)) };
  }
  // A test pretends the player has got this far
  emit(status) {
    this.currentTime = status.currentTime ?? this.currentTime;
    this.listeners.forEach((l) => l({ didJustFinish: false, playing: this.playing, duration: 0, ...status }));
  }
  replace(source) {
    this.calls.push(['replace', source.uri]);
    this.source = source.uri;
    this.currentTime = 0;
  }
  play() {
    this.calls.push(['play']);
    this.playing = true;
  }
  pause() {
    this.calls.push(['pause']);
    this.playing = false;
  }
  async seekTo(seconds) {
    this.calls.push(['seekTo', seconds]);
    this.currentTime = seconds;
  }
  setPlaybackRate(rate) {
    this.calls.push(['rate', rate]);
    this.playbackRate = rate;
  }
  setActiveForLockScreen(active, metadata) {
    this.lockScreen = active ? metadata : null;
  }
  updateLockScreenMetadata(metadata) {
    this.lockScreen = metadata;
  }
  clearLockScreenControls() {
    this.lockScreen = null;
  }
  remove() {}
}

module.exports = {
  createAudioPlayer: () => {
    const player = new FakePlayer();
    players.push(player);
    return player;
  },
  setAudioModeAsync: async (mode) => {
    modes.push(mode);
  },
  useAudioPlayer: () => new FakePlayer(),
  __players: players,
  __modes: modes,
};
