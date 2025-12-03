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
    | 'red' | 'bx' | 'beige' | 'explosive-pink';
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
] as const;

interface ColorContextValue {
    scheme: ColorScheme;
    setScheme: (s: ColorScheme) => void;
}

export const ColorContext = createContext<ColorContextValue | null>(null);

export const AprilThemeProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [scheme, setScheme] = useState<ColorScheme>('default');
    const { theme } = useTheme(); // light / dark / system

    useEffect(() => {
        const stored = localStorage.getItem('color-scheme') as ColorScheme;
        if (stored) setScheme(stored);
    }, []);

    useEffect(() => {
        const className = `${scheme}-${theme}`;
        document.documentElement.classList.remove(
            ...ColorSchemes.flatMap(s => [`${s}-light`, `${s}-dark`]),
        );
        document.documentElement.classList.add(className);
        localStorage.setItem('color-scheme', scheme);
    }, [scheme, theme]);

    return (
        <ColorContext.Provider value={{ scheme, setScheme }}>
            {children}
        </ColorContext.Provider>
    );
};

// export const AprilThemeProvider = ({
//     children,
//     initialScheme = 'default',
// }: {
//     children: React.ReactNode;
//     initialScheme?: ColorScheme;
// }) => {
//     const [scheme, setScheme] = useState<ColorScheme>(initialScheme);
//     const { theme } = useTheme();

//     useEffect(() => {
//         const stored = localStorage.getItem('color-scheme') as ColorScheme;
//         if (stored) {
//             setScheme(stored);
//         } else {
//             // если нет в LS — инициализируем
//             localStorage.setItem('color-scheme', initialScheme);
//         }
//     }, [initialScheme]);

//     useEffect(() => {
//         const className = `${scheme}-${theme}`;
//         document.documentElement.classList.remove(
//             ...ColorSchemes.flatMap(s => [`${s}-light`, `${s}-dark`]),
//         );
//         document.documentElement.classList.add(className);
//         localStorage.setItem('color-scheme', scheme);
//     }, [scheme, theme]);

//     return (
//         <ColorContext.Provider value={{ scheme, setScheme }}>
//             {children}
//         </ColorContext.Provider>
//     );
// };
