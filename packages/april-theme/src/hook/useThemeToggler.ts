import { useState, useEffect } from 'react';
import { useTheme } from './useTheme';
import { useColorScheme } from './useColorScheme';
import { useMounted } from './useMounted';
import { useThemeState } from './useThemeState';
import {
    toggleTheme,
    applyThemeAndColorScheme,
    saveThemeToStorage,
} from '../lib/utils/theme';

/**
 * Хук для переключения темы
 * Инкапсулирует всю логику переключения темы
 */
export function useThemeToggler() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const { scheme } = useColorScheme();
    const mounted = useMounted();
    const currentTheme = useThemeState(resolvedTheme, theme);
    const [isSpinning, setIsSpinning] = useState(false);

    // Отслеживаем изменение темы для запуска анимации
    useEffect(() => {
        if (mounted) {
            setIsSpinning(true);
            const timer = setTimeout(() => {
                setIsSpinning(false);
            }, 400); // Длительность анимации вращения

            return () => clearTimeout(timer);
        }
    }, [currentTheme, mounted]);

    const toggle = () => {
        if (!mounted) return;

        const newTheme = toggleTheme(currentTheme);

        // Сохраняем тему в localStorage
        saveThemeToStorage(newTheme);

        // Устанавливаем тему через next-themes
        setTheme(newTheme);

        // Применяем тему и цветовую схему к HTML элементу
        applyThemeAndColorScheme(scheme, newTheme);
    };

    return {
        currentTheme,
        toggle,
        mounted,
        isSpinning,
    };
}
