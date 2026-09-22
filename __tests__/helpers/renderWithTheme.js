// Renders a piece of the interface as the app does: inside the theme (light or dark, with a text
// size) and with the safe area of a phone.
const React = require('react');
const RNTL = require('@testing-library/react-native');
const { SafeAreaProvider } = require('react-native-safe-area-context');
const { ThemeProvider } = require('../../src/Theme');

const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

function withTheme(ui, { dark = false, textSize = '3' } = {}) {
  return React.createElement(
    SafeAreaProvider,
    { initialMetrics: METRICS },
    React.createElement(ThemeProvider, { dark, textSize }, ui),
  );
}

function renderWithTheme(ui, options) {
  return RNTL.render(withTheme(ui, options));
}

// The style of a host element, flattened
function styleOf(element) {
  const flatten = (s) => (Array.isArray(s) ? Object.assign({}, ...s.map(flatten)) : s || {});
  return flatten(element.props.style);
}

module.exports = { renderWithTheme, withTheme, styleOf, METRICS };
