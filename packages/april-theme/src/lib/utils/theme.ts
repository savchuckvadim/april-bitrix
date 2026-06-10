import { ColorScheme, ColorSchemes } from '../types/theme';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';
const COLOR_SCHEME_STORAGE_KEY = 'color-scheme';

/**
 * Определяет текущую тему по приоритету:
 * 1. Класс на HTML элементе (самый надежный)
 * 2. resolvedTheme
 * 3. theme (если не 'system')
 * 4. fallback 'light'
 */
export function getActualTheme(resolvedTheme?: string, theme?: string): Theme {
    if (typeof document !== 'undefined') {
        if (document.documentElement.classList.contains('dark')) {
            return 'dark';
        }
        if (document.documentElement.classList.contains('light')) {
            return 'light';
        }
    }

    if (resolvedTheme === 'dark' || resolvedTheme === 'light') {
        return resolvedTheme;
    }

    if (
        theme &&
        theme !== 'system' &&
        (theme === 'dark' || theme === 'light')
    ) {
        return theme;
    }

    return 'light';
}

/**
 * Создает класс цветовой схемы в формате: {scheme}-{theme}
 */
export function getColorSchemeClassName(
    scheme: ColorScheme,
    theme: Theme,
): string {
    return `${scheme}-${theme}`;
}

/**
 * Удаляет все классы цветовых схем с HTML элемента
 */
export function removeColorSchemeClasses(): void {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.remove(
        ...ColorSchemes.flatMap(s => [`${s}-light`, `${s}-dark`]),
    );
}

/**
 * Применяет класс цветовой схемы к HTML элементу
 */
export function applyColorSchemeClass(scheme: ColorScheme, theme: Theme): void {
    if (typeof document === 'undefined') return;

    removeColorSchemeClasses();
    const className = getColorSchemeClassName(scheme, theme);
    document.documentElement.classList.add(className);
}

/**
 * Применяет класс темы (light/dark) к HTML элементу
 */
export function applyThemeClass(theme: Theme): void {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
}

/**
 * Применяет тему и цветовую схему к HTML элементу
 */
export function applyThemeAndColorScheme(
    scheme: ColorScheme,
    theme: Theme,
): void {
    applyThemeClass(theme);
    applyColorSchemeClass(scheme, theme);
}

/**
 * Сохраняет тему в localStorage
 */
export function saveThemeToStorage(theme: Theme): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Загружает тему из localStorage
 */
export function loadThemeFromStorage(): Theme | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
        return stored;
    }
    return null;
}

/**
 * Сохраняет цветовую схему в localStorage
 */
export function saveColorSchemeToStorage(scheme: ColorScheme): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
}

/**
 * Загружает цветовую схему из localStorage
 */
export function loadColorSchemeFromStorage(): ColorScheme | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    if (stored && ColorSchemes.includes(stored as ColorScheme)) {
        return stored as ColorScheme;
    }
    return null;
}

/**
 * Проверяет, является ли тема темной
 */
export function isDarkTheme(theme: Theme | string | undefined): boolean {
    return theme === 'dark';
}

/**
 * Переключает тему (dark <-> light)
 */
export function toggleTheme(currentTheme: Theme): Theme {
    return currentTheme === 'dark' ? 'light' : 'dark';
}
