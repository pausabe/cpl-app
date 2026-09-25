import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { fontFamilies } from './typography';

// Literata (SIL Open Font License, src/Assets/fonts/OFL.txt): the semibold for the date and the
// title of the day and for the titles of sheets, the italic for the phrase of the Gospel.
export const fontAssets = {
  [fontFamilies.serifSemiBold]: require('../assets/fonts/Literata-SemiBold.ttf'),
  [fontFamilies.serifItalic]: require('../assets/fonts/Literata-Italic.ttf'),
};

// True once the fonts are there. If they cannot be loaded the app goes on with the system font:
// better another font than no app.
export function useAppFonts(): boolean {
  const [ready, setReady] = useState(() => Object.keys(fontAssets).every((name) => Font.isLoaded(name)));
  useEffect(() => {
    if (ready) return;
    let active = true;
    Font.loadAsync(fontAssets)
      .catch(() => undefined)
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);
  return ready;
}
