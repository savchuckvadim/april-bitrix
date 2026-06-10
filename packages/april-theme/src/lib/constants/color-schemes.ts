import type { ColorScheme } from '../types/theme';

export interface ColorSchemeOption {
    value: ColorScheme;
    color: string;
}

/**
 * Список доступных цветовых схем с их цветами для отображения
 */
export const COLOR_SCHEME_OPTIONS: ColorSchemeOption[] = [
    { value: 'default', color: '#1E293B' },
    { value: 'blue', color: '#3B82F6' },
    { value: 'violet', color: '#8B5CF6' },
    { value: 'pink', color: '#EC4899' },
    { value: 'red', color: '#EF4444' },
    { value: 'orange', color: '#F97316' },
    { value: 'yellow', color: '#FACC15' },
    { value: 'green', color: '#22C55E' },
    { value: 'bx', color: '#34c3f1' },
    { value: 'beige', color: '#ffeacf' },
    { value: 'explosive-pink', color: '#ff69b4' },
];
