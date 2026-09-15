export { AprilThemeProvider, ColorSchemes, UIScales } from './provider/Theme';
export type { ColorScheme, UIScale } from './provider/Theme';

export { ThemeToggler } from './components/ThemeToggler';
export { ScaleToggler } from './components/ScaleToggler';
export { ThemeTogglePanel } from './components/ThemeTogglePanel';
export { ThemeInitScript } from './components/ThemeInitScript';
export { useColorScheme } from './hook/useColorScheme';
export { useUIScale } from './hook/useUIScale';

// Правило выбора стороны для раскрытия палитры — чистая функция, вынесена
// наружу ради теста: панель не должна уезжать за край окна.
export {
    PICKER_PANEL_WIDTH_PX,
    PICKER_VIEWPORT_PADDING_PX,
    resolvePickerSide,
} from './model/picker-side';
export type { PickerSide } from './model/picker-side';
