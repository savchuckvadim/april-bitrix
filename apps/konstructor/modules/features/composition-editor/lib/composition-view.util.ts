import {
    COMPOSITION_VIEW_OPTIONS,
    DEFAULT_COMPOSITION_VIEW,
    type CompositionViewMode,
    type CompositionViewSettings,
} from '../model/types';

export const isCompositionViewMode = (value: unknown): value is CompositionViewMode =>
    COMPOSITION_VIEW_OPTIONS.some(option => option.value === value);

/** Настройка из кэша: неизвестный вид или битое значение — по умолчанию */
export const parseCompositionView = (data: unknown): CompositionViewSettings | null => {
    if (typeof data !== 'object' || data === null) return null;
    const { mode, showWeights } = data as Partial<Record<keyof CompositionViewSettings, unknown>>;
    return {
        mode: isCompositionViewMode(mode) ? mode : DEFAULT_COMPOSITION_VIEW.mode,
        showWeights:
            typeof showWeights === 'boolean' ? showWeights : DEFAULT_COMPOSITION_VIEW.showWeights,
    };
};

export type WeightDot = 'full' | 'half';

/** Вес точками: целая — единица, половинка — 0.5 */
export const weightDots = (weight: number): WeightDot[] => {
    const dots: WeightDot[] = Array.from({ length: Math.floor(weight) }, () => 'full');
    return weight % 1 ? [...dots, 'half'] : dots;
};
