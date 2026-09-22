import React from 'react';
import { ThemeProvider } from '../Theme';
import { useAppearance } from './LiturgyStore';

// The theme of the app: the dark mode and the text size of the loaded settings. When they
// change (Configuració, the "Aa" sheet, the system appearance) every screen redraws.
export default function AppThemeProvider({ children }: { children?: React.ReactNode }) {
  const { dark, textSize } = useAppearance();
  return (
    <ThemeProvider dark={dark} textSize={textSize}>
      {children}
    </ThemeProvider>
  );
}
