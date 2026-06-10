import React, { createContext } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { useColorSchemeState } from '../hook/useColorSchemeState';
import { useApplyColorScheme } from '../hook/useApplyColorScheme';
import type { ColorContextValue, ThemeContextValue } from '../lib/types/theme';
import { ColorSchemes } from '../lib/types/theme';

// Реэкспортируем типы и константы
export type {
    ColorScheme,
    ColorContextValue,
    ThemeContextValue,
} from '../lib/types/theme';
export { ColorSchemes };

export const ColorContext = createContext<ColorContextValue | null>(null);
export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface AprilThemeProviderProps {
    children: React.ReactNode;
    theme?: string | undefined;
    resolvedTheme?: string | undefined;
    setTheme?: (theme: string) => void;
}

/**
 * Провайдер для управления темой и цветовыми схемами
 * Интегрируется с NextThemesProvider для работы с темами
 */
export const AprilThemeProvider = ({
    children,
    theme: themeProp,
    resolvedTheme: resolvedThemeProp,
    setTheme: setThemeProp,
}: AprilThemeProviderProps) => {
    // Управление состоянием цветовой схемы
    const [scheme, setScheme] = useColorSchemeState('default');

    // Используем переданные пропсы или useTheme() из next-themes
    const nextTheme = useNextTheme();
    const theme = themeProp ?? nextTheme.theme;
    const resolvedTheme = resolvedThemeProp ?? nextTheme.resolvedTheme;
    const setTheme = setThemeProp ?? nextTheme.setTheme;

    // Применяем цветовую схему при изменении scheme, theme или resolvedTheme
    useApplyColorScheme(scheme, resolvedTheme, theme);

    return (
        <ColorContext.Provider value={{ scheme, setScheme }}>
            <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
                {children}
            </ThemeContext.Provider>
        </ColorContext.Provider>
    );
};
