import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

export type ColorScheme = 'default' | 'blue' | 'violet' | 'pink' | 'green' | 'yellow' | 'orange' | 'red'  ;
export const ColorSchemes = ['default', 'blue', 'violet', 'pink', 'green', 'yellow', 'orange', 'red'] as const;

interface ColorContextValue {
    scheme: ColorScheme;
    setScheme: (s: ColorScheme) => void;
}

export const ColorContext = createContext<ColorContextValue | null>(null);

export const AprilThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [scheme, setScheme] = useState<ColorScheme>('default');
    const { theme } = useTheme(); // light / dark / system

    useEffect(() => {
        const stored = localStorage.getItem("color-scheme") as ColorScheme;
        if (stored) setScheme(stored);
    }, []);

    useEffect(() => {
        const className = `${scheme}-${theme}`;
        document.documentElement.classList.remove(...ColorSchemes.flatMap(s => [`${s}-light`, `${s}-dark`]));
        document.documentElement.classList.add(className);
        localStorage.setItem("color-scheme", scheme);
    }, [scheme, theme]);

    return (
        <ColorContext.Provider value={{ scheme, setScheme }}>
            {children}
        </ColorContext.Provider>
    );
};

