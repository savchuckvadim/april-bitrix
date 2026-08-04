/*
 * Цветовые схемы и пресеты масштаба — общие константы темы.
 *
 * Вынесены из provider/Theme.tsx отдельным модулем сознательно: тот помечен
 * 'use client', а список схем нужен ещё и инлайн-скрипту инициализации, который
 * обязан быть серверным (он и существует ради того, чтобы отработать до
 * гидратации). Публичная поверхность не изменилась — provider реэкспортирует.
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
    | 'explosive-pink'
    | 'air'
    | 'claude';

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
