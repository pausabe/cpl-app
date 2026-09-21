// What a screen shows as text, in reading order, for comparing two builds of a screen: the
// liturgical text that is read, with its rubric colour and italics, and nothing of the
// controls (selectors and «Continua amb…» buttons) or of the spacing between paragraphs.
//
// Colours are reduced to what they mean, rubric (R) or text (T), so that a new shade of red
// or a dark background do not count as a change. A colour that is neither shows up as is.
const RUBRIC = new Set(['red', '#FA8072', '#B3261E', '#F28B82']);
const TEXT = new Set(['black', 'white', '#000000', '#FFFFFF', '#182322', '#E6ECEB']);
const INTERACTIVE_ROLES = new Set(['button', 'radio', 'switch', 'link', 'togglebutton', 'tab']);

function flatten(style) {
  if (!style) return {};
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten));
  return style;
}

function isInteractive(node) {
  const p = node.props || {};
  return INTERACTIVE_ROLES.has(p.accessibilityRole) || INTERACTIVE_ROLES.has(p.role) ||
    typeof p.onClick === 'function';
}

function role(color) {
  if (RUBRIC.has(color)) return 'R';
  if (TEXT.has(color) || color === undefined) return 'T';
  return `(${color})`;
}

// Runs of text with the same look, merged, and whitespace-only runs (the old empty lines)
// dropped. Every run keeps its exact characters: spaces, line breaks and punctuation included.
function textRuns(json) {
  const runs = [];
  const push = (text, style) => {
    const key = role(style.color) + (style.fontStyle === 'italic' ? 'i' : '');
    const last = runs[runs.length - 1];
    if (last && last.key === key) last.text += text;
    else runs.push({ key, text });
  };
  const walk = (node, inherited) => {
    if (node === null || node === undefined) return;
    if (Array.isArray(node)) return node.forEach((n) => walk(n, inherited));
    if (typeof node === 'string') {
      if (inherited) push(node, inherited);
      return;
    }
    if (isInteractive(node)) return;
    const style = node.type === 'Text' ? { ...(inherited || {}), ...flatten(node.props.style) } : inherited;
    (node.children || []).forEach((child) => walk(child, node.type === 'Text' ? style : undefined));
  };
  walk(json, undefined);
  // A paragraph break is a run boundary: runs that only differ in the whitespace between
  // them (a gap made of "\n" before, of margin now) compare equal.
  return runs
    .map((r) => ({ key: r.key, text: r.text.replace(/^\n+|\n+$/g, '') }))
    .filter((r) => r.text.trim() !== '')
    .map((r) => `${r.key}|${r.text}`);
}

module.exports = { textRuns };
