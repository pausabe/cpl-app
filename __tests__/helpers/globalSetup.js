// The app works in the phone's local time, and every date in these tests is a Catalan
// calendar day. Pin the zone so the results don't depend on the machine running them.
module.exports = () => {
  process.env.TZ = 'Europe/Madrid';
};
