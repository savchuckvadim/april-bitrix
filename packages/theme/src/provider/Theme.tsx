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

export const AprilThemeProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    // Дефолт compact: приложения живут во фреймах насыщенного UI Bitrix24,
    // мелкий масштаб роднее; пользовательский выбор персистится в localStorage.
    const [scheme, setScheme] = useState<ColorScheme>('default');
    const [scale, setScale] = useState<UIScale>('compact');
    const { theme } = useTheme(); // light / dark / system

    useEffect(() => {
        const stored = localStorage.getItem('color-scheme') as ColorScheme;
        if (stored && ColorSchemes.includes(stored)) setScheme(stored);
        const storedScale = localStorage.getItem('ui-scale') as UIScale;
        if (storedScale && UIScales.includes(storedScale)) {
            setScale(storedScale);
        }
    }, []);

    useEffect(() => {
        const className = `${scheme}-${theme}`;
        document.documentElement.classList.remove(
            ...ColorSchemes.flatMap(s => [`${s}-light`, `${s}-dark`]),
        );
        document.documentElement.classList.add(className);
        localStorage.setItem('color-scheme', scheme);
    }, [scheme, theme]);

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
