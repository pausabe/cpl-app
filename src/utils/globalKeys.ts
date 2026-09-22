// Colours, sizes and spacing of the screens are in src/Theme. What is left here is used
// outside them.
let GlobalKeys = {
  // The screen that shows while an update is applied (UpdaterService)
  barColor: '#006064',
  itemsBarColor: '#FFFFFF',

  // Until 3 h, the app asks whether the liturgy of the day before is wanted
  late_prayer: 3,
  // From 18 h, the evening Mass of tomorrow's celebration is chosen
  afternoon_hour: 18,

  server_url: 'https://serveditorial.cpl.es/api/emp/read/',
};

export default GlobalKeys;
