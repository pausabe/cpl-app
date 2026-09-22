import React, { createContext, useContext, useMemo } from 'react';
import { createTheme, Theme } from './Theme';

export const ThemeContext = createContext<Theme>(createTheme());

interface ThemeProviderProps {
  dark: boolean;
  textSize: unknown;
  children?: React.ReactNode;
}

// Gets the mode and the text size from whoever knows the settings (NavigationController), so
// that nothing under it has to read them.
export function ThemeProvider({ dark, textSize, children }: ThemeProviderProps) {
  const theme = useMemo(() => createTheme({ dark, textSize }), [dark, String(textSize)]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
