import { useContext } from 'react';
import { ThemeContext } from '../provider/Theme';

/**
 * Кастомный хук useTheme, который работает везде (в пакете и в приложении)
 * Использует ThemeContext из AprilThemeProvider, если доступен,
 * иначе fallback на next-themes
 */
export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        // Fallback: пытаемся использовать next-themes напрямую
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useTheme: useNextTheme } = require('next-themes');
            return useNextTheme();
        } catch {
            throw new Error(
                'useTheme must be used within AprilThemeProvider or NextThemesProvider',
            );
        }
    }
    return ctx;
};
