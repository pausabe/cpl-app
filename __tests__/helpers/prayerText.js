// Finds the prayer text on the screen by what it says. On iOS the text that can be selected by
// the piece is a read-only TextInput (src/components/PrayerText), and getByText only looks at
// Texts: this looks at both, so the tests say the same on one platform and on the other.
const RNTL = require('@testing-library/react-native');
const { TextInput } = require('react-native');

// Everything an element shows, its pieces joined: the strings it holds and those of the Texts
// inside it (a rubric line is the label and the text in another colour).
function shownText(element) {
  const walk = (child) => {
    if (child === null || child === undefined || typeof child === 'boolean') return '';
    if (Array.isArray(child)) return child.map(walk).join('');
    if (typeof child === 'string' || typeof child === 'number') return String(child);
    return walk(child.props && child.props.children);
  };
  return walk(element.props.children);
}

function matcherOf(matcher) {
  return typeof matcher === 'string' ? (text) => text === matcher : (text) => matcher.test(text);
}

// The elements that show this text, Texts and selectable texts alike
function queryAllPrayerText(matcher) {
  const matches = matcherOf(matcher);
  const inputs = RNTL.screen.UNSAFE_queryAllByType(TextInput).filter((input) => matches(shownText(input)));
  return [...RNTL.screen.queryAllByText(matcher), ...inputs];
}

function queryPrayerText(matcher) {
  return queryAllPrayerText(matcher)[0];
}

function getPrayerText(matcher) {
  const found = queryPrayerText(matcher);
  if (!found) throw new Error(`No prayer text shows ${matcher}`);
  return found;
}

// The same, for a text that turns up after a touch or once the day is loaded
function findPrayerText(matcher, timeout = 15000) {
  return RNTL.waitFor(() => getPrayerText(matcher), { timeout });
}

module.exports = { getPrayerText, queryPrayerText, queryAllPrayerText, findPrayerText, shownText };
