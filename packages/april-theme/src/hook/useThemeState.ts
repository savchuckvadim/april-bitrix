import { useEffect, useState } from 'react';
import type { Theme } from '../lib/utils/theme';
import {
    getActualTheme,
    loadThemeFromStorage,
    applyThemeClass,
} from '../lib/utils/theme';

/**
 * Хук для отслеживания текущей темы с синхронизацией с DOM
 */
export function useThemeState(resolvedTheme?: string, theme?: string): Theme {
    const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
        // Инициализация: проверяем localStorage или DOM
        const stored = loadThemeFromStorage();
        if (stored) {
            return stored;
        }
        return getActualTheme(resolvedTheme, theme);
    });

    // Загружаем тему из localStorage при монтировании
    useEffect(() => {
        const stored = loadThemeFromStorage();
        if (stored) {
            setCurrentTheme(stored);
            applyThemeClass(stored);
        } else {
            const actualTheme = getActualTheme(resolvedTheme, theme);
            setCurrentTheme(actualTheme);
        }
    }, []);

    // Отслеживаем изменения resolvedTheme и theme
    useEffect(() => {
        const actualTheme = getActualTheme(resolvedTheme, theme);
        setCurrentTheme(actualTheme);
    }, [resolvedTheme, theme]);

    // Отслеживаем изменения класса на HTML элементе (только для обновления UI)
    useEffect(() => {
        const updateTheme = () => {
            const actualTheme = getActualTheme(resolvedTheme, theme);
            setCurrentTheme(prev => {
                // Обновляем только если тема действительно изменилась
                if (prev !== actualTheme) {
                    return actualTheme;
                }
                return prev;
            });
        };

        // Отслеживаем изменения через MutationObserver
        const observer = new MutationObserver(() => {
            // Используем requestAnimationFrame для избежания зацикливания
            requestAnimationFrame(updateTheme);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
        };
    }, [resolvedTheme, theme]);

    return currentTheme;
}
