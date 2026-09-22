// The layers of the app, checked: the interface on one side and the rest on the other, so that
// either can be changed without touching the other.
//
//   Theme, Components  Draw what they are given. Nothing of the day's data or the settings.
//   ViewModels         Turn the day's data into what the screens show. Pure functions: no React,
//                      no services, no storage. Tested on their own.
//   Views              Screens. They get everything through props (and the theme) from their
//                      controller; they never read DataService nor save a setting.
//   Controllers        The glue: they read the data (LiturgyStore), call the services and hand
//                      props to the views.
//   Services, Models   The liturgy and its data. The redesign does not touch them.
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '../../src');

function filesIn(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesIn(full));
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

// Imports of a file, as paths inside src/ ("services/dataService") or package names
function importsOf(file) {
  const code = fs.readFileSync(file, 'utf8');
  const specifiers = [
    ...code.matchAll(/(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]/g),
    ...code.matchAll(/import\s+['"]([^'"]+)['"]/g),
    ...code.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g),
  ].map((m) => m[1]);
  return specifiers.map((spec) => {
    if (!spec.startsWith('.')) return { spec, target: `package:${spec}` };
    const resolved = path.relative(SRC, path.resolve(path.dirname(file), spec)).replace(/\\/g, '/');
    return { spec, target: resolved.replace(/\.(js|jsx|ts|tsx)$/, '') };
  });
}

function violations(layer, isAllowed) {
  const out = [];
  for (const file of filesIn(path.join(SRC, layer))) {
    for (const { spec, target } of importsOf(file)) {
      if (!isAllowed(target)) out.push(`${path.relative(SRC, file)} → ${spec}`);
    }
  }
  return out;
}

const isPackage = (target) => target.startsWith('package:');
const inside = (target, ...folders) => folders.some((f) => target === f || target.startsWith(`${f}/`));
// Enumerations of the domain: plain values, no data access
const DOMAIN_ENUMS = ['services/celebrationTimeEnums', 'services/databaseEnums'];

test('Theme només depèn de si mateix', () => {
  expect(violations('theme', (t) => isPackage(t) || inside(t, 'theme', 'assets'))).toEqual([]);
});

test('Components només depenen del tema, d’altres components i dels tipus de ViewModels', () => {
  expect(violations('components', (t) => isPackage(t) || inside(t, 'components', 'theme', 'view-models'))).toEqual([]);
});

test('ViewModels són funcions pures: ni React ni serveis', () => {
  expect(
    violations(
      'view-models',
      (t) =>
        (isPackage(t) && !/^package:(react|react-native|expo)/.test(t)) ||
        inside(t, 'view-models', ...DOMAIN_ENUMS, 'utils/StringManagement'),
    ),
  ).toEqual([]);
});

test('Views només reben les dades per props: ni serveis ni controladors', () => {
  expect(
    violations(
      'views',
      (t) =>
        isPackage(t) ||
        inside(t, 'views', 'components', 'theme', 'view-models', 'assets', ...DOMAIN_ENUMS) ||
        inside(t, 'utils/globalViewFunctions', 'utils/logger', 'utils/StringManagement'),
    ),
  ).toEqual([]);
});

test('les dades del dia (DataService) només es llegeixen des del magatzem i des dels serveis', () => {
  const readers = [];
  for (const layer of fs.readdirSync(SRC)) {
    if (!fs.statSync(path.join(SRC, layer)).isDirectory()) continue;
    for (const file of filesIn(path.join(SRC, layer))) {
      if (importsOf(file).some(({ target }) => target === 'services/dataService'))
        readers.push(path.relative(SRC, file));
    }
  }
  expect(readers.filter((file) => !file.startsWith('services/'))).toEqual(['controllers/liturgyStore.ts']);
});
