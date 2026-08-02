'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export type ColorScheme =
    | 'default'
    | 'blue'
    | 'violet'
    | 'pink'
    | 'green'
    | 'yellow'
    | 'orange'
    | 'red' | 'bx' | 'beige' | 'explosive-pink'
    | 'air' | 'claude';
export const ColorSchemes = [
    'default',
    'blue',
    'violet',
    'pink',
    'green',
    'yellow',
    'orange',
    'red',
    'bx',
    'beige',
    'explosive-pink',
    'air',
    'claude',
] as const;

/* Пресеты масштаба UI — см. packages/ui/src/styles/tokens/density.css */
export type UIScale = 'compact' | 'comfortable' | 'large' | 'xl';
export const UIScales = ['compact', 'comfortable', 'large', 'xl'] as const;

interface ColorContextValue {
    scheme: ColorScheme;
    setScheme: (s: ColorScheme) => void;
    scale: UIScale;
    setScale: (s: UIScale) => void;
}

export const ColorContext = createContext<ColorContextValue | null>(null);

/**
 * Приложения задают тему двумя способами, и провайдер обязан понимать оба.
 *
 *  · Простой: `light` / `dark` — схема берётся из состояния провайдера.
 *  · Составной: `<схема>-<light|dark>` (`air-dark`, `default-dark`) — схема уже
 *    внутри имени темы.
 *
 * Раньше составной случай разбирался неверно: класс собирался как
 * `${scheme}-${theme}` и давал мусор вроде `default-air-dark`, под который нет
 * ни одного правила CSS. Работал при этом класс от next-themes, а мусорный
 * копился на <html> при каждом переключении, потому что в список на удаление
 * он не попадал. Заодно выбор цветовой схемы в таких приложениях ни на что не
 * влиял.
 */
const splitTheme = (
    theme: string | undefined,
): { scheme: ColorScheme | null; mode: 'light' | 'dark' } => {
    if (!theme) return { scheme: null, mode: 'light' };

    const dashIndex = theme.lastIndexOf('-');
    if (dashIndex > 0) {
        const prefix = theme.slice(0, dashIndex) as ColorScheme;
        const suffix = theme.slice(dashIndex + 1);
        if (
            (suffix === 'light' || suffix === 'dark') &&
            ColorSchemes.includes(prefix)
        ) {
            return { scheme: prefix, mode: suffix };
        }
    }

    return { scheme: null, mode: theme === 'dark' ? 'dark' : 'light' };
};

export const AprilThemeProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    // Дефолт compact: приложения живут во фреймах насыщенного UI Bitrix24,
    // мелкий масштаб роднее; пользовательский выбор персистится в localStorage.
    const [scheme, setScheme] = useState<ColorScheme>('default');
    const [scale, setScale] = useState<UIScale>('compact');
    const { theme } = useTheme();

    const fromTheme = splitTheme(theme);

    useEffect(() => {
        const stored = localStorage.getItem('color-scheme') as ColorScheme;
        if (stored && ColorSchemes.includes(stored)) setScheme(stored);
        const storedScale = localStorage.getItem('ui-scale') as UIScale;
        if (storedScale && UIScales.includes(storedScale)) {
            setScale(storedScale);
        }
    }, []);

    /*
     * Схему из составной темы подхватываем один раз, и только если пользователь
     * ещё не выбирал её сам: иначе `defaultTheme="air-dark"` перетирал бы выбор
     * при каждой перерисовке.
     */
    useEffect(() => {
        if (!fromTheme.scheme) return;
        if (localStorage.getItem('color-scheme')) return;
        setScheme(fromTheme.scheme);
    }, [fromTheme.scheme]);

    useEffect(() => {
        const className = `${scheme}-${fromTheme.mode}`;
        document.documentElement.classList.remove(
            ...ColorSchemes.flatMap(s => [`${s}-light`, `${s}-dark`]),
        );
        document.documentElement.classList.add(className);
        localStorage.setItem('color-scheme', scheme);
    }, [scheme, fromTheme.mode]);

    useEffect(() => {
        document.documentElement.dataset.scale = scale;
        localStorage.setItem('ui-scale', scale);
    }, [scale]);

    return (
        <ColorContext.Provider value={{ scheme, setScheme, scale, setScale }}>
            {children}
        </ColorContext.Provider>
    );
};
