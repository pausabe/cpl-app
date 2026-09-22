import {
  convertTextSize, createTheme, liturgicalColor, navigationTheme, palettes, prayerTextStyles, textSizeStep,
} from '../../src/Theme';

test('la mida del text: deu passos de 3 px des de 15, i 21 per defecte', () => {
  expect(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(convertTextSize))
    .toEqual([15, 18, 21, 24, 27, 30, 33, 36, 39, 42]);
  expect(convertTextSize(3)).toBe(21);
  expect(convertTextSize(undefined)).toBe(21);
  expect(convertTextSize('11')).toBe(42);
  expect(convertTextSize('0')).toBe(15);
  expect(textSizeStep('abc')).toBe(3);
});

test('els colors del disseny, clar i fosc', () => {
  expect(palettes.light).toMatchObject({
    header: '#006064', homeBackground: '#E7F2F1', prayerBackground: '#FFFFFF', surface: '#FFFFFF',
    border: '#D3E3E1', text: '#182322', text2: '#475756', text3: '#5A6B6A',
    accentFill: '#007B80', accentText: '#00696D', rubric: '#B3261E',
  });
  expect(palettes.dark).toMatchObject({
    header: '#006064', homeBackground: '#0E1413', prayerBackground: '#0B0F0E', surface: '#18201F',
    border: '#2A3534', text: '#E6ECEB', text2: '#B3C0BE', text3: '#93A3A1',
    accentFill: '#1F7F7B', accentText: '#7FD1CC', rubric: '#F28B82',
  });
});

test('els colors litúrgics de la targeta del dia', () => {
  expect(liturgicalColor('R', 'light')).toMatchObject({dot: '#C62828', tint: '#F8E7E5', accent: '#B3261E'});
  expect(liturgicalColor('V', 'dark')).toMatchObject({dot: '#2E7D32', tint: '#16241A', accent: '#8CC98F'});
  // Green, most of the year, is only the background now: it must not be the home's own
  expect(liturgicalColor('V', 'light').tint).toBe('#DDEEDA');
  expect(liturgicalColor('V', 'light').tint).not.toBe(palettes.light.homeBackground);
  expect(liturgicalColor('M', 'light')).toMatchObject({dot: '#6A3D9A', tint: '#EFE8F4', accent: '#6A3D9A'});
  expect(liturgicalColor('B', 'light')).toMatchObject({dot: '#FFFFFF', dotOutlined: true, tint: '#F7F1E3', accent: '#7A5F14'});
  expect(liturgicalColor('B', 'dark')).toMatchObject({tint: '#26221A', accent: '#E3C877'});
  expect(liturgicalColor('?', 'light').code).toBe('V');
});

test('el text de la pregària: la mida triada, la rúbrica vermella i les lectures a l’esquerra', () => {
  const styles = prayerTextStyles(createTheme({dark: false, textSize: '3'}));
  expect(styles.black).toMatchObject({color: '#182322', fontSize: 21, lineHeight: 30});
  expect(styles.red).toMatchObject({color: '#B3261E', fontSize: 21});
  expect(styles.blackJustified.textAlign).toBe('left');
  expect(styles.blackSmallItalicRight).toMatchObject({fontSize: 19, fontStyle: 'italic', textAlign: 'right'});
  expect(styles.sectionTitle).toMatchObject({color: '#B3261E', fontSize: 15, fontWeight: '700'});
  expect(styles.container.backgroundColor).toBe('#FFFFFF');

  const dark = prayerTextStyles(createTheme({dark: true, textSize: '10'}));
  expect(dark.black).toMatchObject({color: '#E6ECEB', fontSize: 42});
  expect(dark.red.color).toBe('#F28B82');
  expect(dark.container.backgroundColor).toBe('#0B0F0E');
});

test('el mateix tema dona els mateixos estils (no es recalculen a cada render)', () => {
  const theme = createTheme({textSize: '4'});
  expect(prayerTextStyles(theme)).toBe(prayerTextStyles(theme));
});

test('React Navigation pren els colors del tema', () => {
  const nav = navigationTheme(createTheme({dark: true}));
  expect(nav.dark).toBe(true);
  expect(nav.colors).toMatchObject({primary: '#1F7F7B', background: '#0E1413', card: '#006064', text: '#E6ECEB'});
  expect(navigationTheme(createTheme()).dark).toBe(false);
});
