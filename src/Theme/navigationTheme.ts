import {DarkTheme, DefaultTheme, Theme as NavigationTheme} from '@react-navigation/native';
import {Theme} from './Theme';

// React Navigation's own colours, from the app's theme: no white flash between screens in
// dark mode.
export function navigationTheme(theme: Theme): NavigationTheme {
    const base = theme.dark ? DarkTheme : DefaultTheme;
    return {
        ...base,
        dark: theme.dark,
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
        headerStyle: {backgroundColor: theme.colors.header},
        headerTintColor: theme.colors.onHeader,
        headerTitleStyle: {color: theme.colors.onHeader, fontSize: theme.text.headerTitle, fontWeight: '600' as const},
        headerShadowVisible: false,
    };
}
