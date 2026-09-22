import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useCustomUpdater } from './src/services/updaterService';
import NavigationController from './src/controllers/NavigationController';
import { useAppFonts } from './src/theme/fonts';

// The splash stays until the home has the day drawn: HomeScreenController hides it. Without this
// it went away at once, and for a moment the home showed empty and light, even in dark mode.
SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 250, fade: true });

function ConfigureUpdates() {
  useCustomUpdater();
}

export default function App() {
  ConfigureUpdates();
  // If something got stuck before the home, the splash goes anyway after 10 s
  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync().catch(() => undefined), 10000);
    return () => clearTimeout(timer);
  }, []);
  // Literata before the first screen, so that the day card never shows up in another font
  const fontsReady = useAppFonts();
  if (!fontsReady) {
    return null;
  }
  return <NavigationController />;
}
