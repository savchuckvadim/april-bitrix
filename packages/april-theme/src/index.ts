export {
    AprilThemeProvider,
    ColorSchemes,
    ColorContext,
    ThemeContext,
} from './provider/Theme';
export type {
    ColorScheme,
    ColorContextValue,
    ThemeContextValue,
    AprilThemeProviderProps,
} from './provider/Theme';

export { ThemeToggler } from './components/ThemeToggler';
export { ColorSchemePicker } from './components/ColorSchemePicker';

export { useColorScheme } from './hook/useColorScheme';
export { useTheme } from './hook/useTheme';
export { useMounted } from './hook/useMounted';
export { useThemeState } from './hook/useThemeState';
export { useThemeToggler } from './hook/useThemeToggler';
export { useColorSchemePicker } from './hook/useColorSchemePicker';

export * from './lib/utils/theme';
export { COLOR_SCHEME_OPTIONS } from './lib/constants/color-schemes';
export type { ColorSchemeOption } from './lib/constants/color-schemes';
