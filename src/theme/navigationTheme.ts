import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { Theme } from './theme';

// React Navigation's own colours, from the app's theme: no white flash between screens in
// dark mode.
//
// To React Navigation the theme is always dark: the native stack only uses that for the top bar
// on iOS, which is dark teal in both modes. With the light mode of the app, iOS 26 drew the
// capsules of glass of its buttons whitish and the back arrow black, on the teal. The glass
// still lights up a little over a light page below the bar: that is the system's, not this.
export function navigationTheme(theme: Theme): NavigationTheme {
  const base = theme.dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: true,
    colors: {
      ...base.colors,
      primary: theme.colors.accentFill,
      background: theme.colors.homeBackground,
      card: theme.colors.header,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.rubric,
    },
  };
}

// The top bar of every screen: the brand colour in both modes, white title and icons
export function headerOptions(theme: Theme) {
  return {
    headerStyle: { backgroundColor: theme.colors.header },
    headerTintColor: theme.colors.onHeader,
    headerTitleStyle: { color: theme.colors.onHeader, fontSize: theme.text.headerTitle, fontWeight: '600' as const },
    headerShadowVisible: false,
  };
}
