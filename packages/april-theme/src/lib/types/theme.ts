/**
 * Типы и интерфейсы для работы с темой
 */

export type ColorScheme =
    | 'default'
    | 'blue'
    | 'violet'
    | 'pink'
    | 'green'
    | 'yellow'
    | 'orange'
    | 'red'
    | 'bx'
    | 'beige'
    | 'explosive-pink';

export const ColorSchemes: readonly ColorScheme[] = [
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

export interface ColorContextValue {
    scheme: ColorScheme;
    setScheme: (s: ColorScheme) => void;
}

export interface ThemeContextValue {
    theme: string | undefined;
    resolvedTheme: string | undefined;
    setTheme: (theme: string) => void;
}
