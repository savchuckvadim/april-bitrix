'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { MoonStar, SunDim } from 'lucide-react';

import { ColorSchemePicker } from './ColorSchemePicker';

/**
 * Приложения именуют тему двумя способами, и переключатель обязан понимать оба.
 *
 *  · Простой: `light` / `dark` — так живут kpi-sales, kpi-service, konstructor.
 *  · Составной: `<схема>-<light|dark>` (`air-dark`, `default-dark`, `bx-light`) —
 *    так живут bitrix и admin, и там переключение на голое `dark` вешало на
 *    <html> несуществующий класс, то есть ломало тему.
 *
 * Поэтому переворачиваем только суффикс, сохраняя цветовую схему.
 */
const isDarkTheme = (theme: string | undefined): boolean =>
    theme === 'dark' || Boolean(theme?.endsWith('-dark'));

const toggledTheme = (theme: string | undefined): string => {
    if (theme?.endsWith('-dark')) return `${theme.slice(0, -5)}-light`;
    if (theme?.endsWith('-light')) return `${theme.slice(0, -6)}-dark`;
    return theme === 'dark' ? 'light' : 'dark';
};

export const ThemeToggler = () => {
    const { theme, setTheme } = useTheme();

    /*
     * На сервере темы не существует, поэтому до гидратации иконку выбирать
     * нельзя: сервер отдал бы «солнце», клиент тут же нарисовал «луну», и React
     * ронял бы всё дерево с Hydration failed. Раньше это не всплывало только
     * потому, что переключатель показывали внутри уже раскрытой панели, то есть
     * после гидратации.
     */
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const isDark = isMounted && isDarkTheme(theme);
    const label = isDark ? 'Светлая тема' : 'Тёмная тема';

    return (
        <div className="text-foreground flex items-center gap-1">
            <button
                type="button"
                onClick={() => setTheme(toggledTheme(theme))}
                aria-label={label}
                title={label}
                suppressHydrationWarning
                className="cursor-pointer transition-transform duration-300"
            >
                {isDark ? <MoonStar size={20} /> : <SunDim size={20} />}
            </button>

            <ColorSchemePicker />
        </div>
    );
};
