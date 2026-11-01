/**
 * Как менеджеру удобнее видеть наполнение: один и тот же состав и одни правила,
 * разная вёрстка. Выбор и видимость весов — личная настройка пользователя.
 */
export type CompositionViewMode = 'classic' | 'cards' | 'flat' | 'dense' | 'summary';

/** Как метить вес блока: у каждого вида своя метка */
export type WeightMarkKind = 'tag' | 'number' | 'dots';

export interface CompositionViewSettings {
    mode: CompositionViewMode;
    /** Метки веса у блоков; общий вес комплекта виден всегда */
    showWeights: boolean;
}

/** Чья настройка: без владельца (публичная версия) вид живёт только в браузере. */
export interface CompositionViewOwner {
    domain: string;
    bxUserId: number;
}

export const DEFAULT_COMPOSITION_VIEW: CompositionViewSettings = {
    mode: 'classic',
    showWeights: true,
};

export const COMPOSITION_VIEW_OPTIONS: ReadonlyArray<{
    value: CompositionViewMode;
    label: string;
}> = [
    { value: 'classic', label: 'Классика' },
    { value: 'cards', label: 'Карточки' },
    { value: 'flat', label: 'Секции' },
    { value: 'dense', label: 'Плотно' },
    { value: 'summary', label: 'Сводка' },
];

export const WEIGHT_MARK_BY_VIEW: Record<CompositionViewMode, WeightMarkKind> = {
    classic: 'number',
    cards: 'tag',
    flat: 'number',
    dense: 'dots',
    summary: 'number',
};
