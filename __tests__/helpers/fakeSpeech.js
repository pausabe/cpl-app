// expo-speech under Jest: it keeps what it was asked to say, and says it at once
const spoken = [];

module.exports = {
  VoiceQuality: { Default: 'Default', Enhanced: 'Enhanced' },
  getAvailableVoicesAsync: async () => [
    { identifier: 'ca-montse', name: 'Montse', language: 'ca-ES', quality: 'Default' },
    { identifier: 'ca-jordi', name: 'Jordi', language: 'ca-ES', quality: 'Default' },
  ],
  speak: (text, options = {}) => {
    spoken.push({ text, voice: options.voice, rate: options.rate });
    if (options.onDone) setTimeout(options.onDone, 0);
  },
  stop: () => {},
  __spoken: spoken,
};
