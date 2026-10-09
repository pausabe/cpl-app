import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useDatabaseUpdates } from './src/services/databaseUpdateService';
import NavigationController from './src/controllers/NavigationController';
import { useAppFonts } from './src/theme/fonts';
import { wireCar } from './src/controllers/carController';
import { startHealthMonitoring } from './src/services/health/healthMonitor';
import RenderCrashGuard from './src/controllers/RenderCrashGuard';

// Before anything else can fail: the errors and the unexpected closings of the app reach cpl-cloud,
// where Pau sees them (the «Salut» tab of the publishing website)
startHealthMonitoring();

// The splash stays until the home has the day drawn: HomeScreenController hides it. Without this
// it went away at once, and for a moment the home showed empty and light, even in dark mode.
SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 250, fade: true });

// Android Auto may wake the app up with no screen, to play an hour chosen in the car: it is listened
// to from the first moment
wireCar();

export default function App() {
  // The texts come from the publishing website; the code, from the stores
  useDatabaseUpdates();
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
  return (
    <RenderCrashGuard>
      <NavigationController />
    </RenderCrashGuard>
  );
}
