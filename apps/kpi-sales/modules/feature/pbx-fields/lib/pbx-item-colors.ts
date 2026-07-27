/**
 * Цветовые обозначения элементов enum-полей.
 *
 * Бэк цветов не хранит (IFieldItem без color) — цвет назначает фронт:
 *  - известные коды op_client_type — фиксированная карта (стабильный цвет
 *    типа клиента во всех приложениях);
 *  - per-portal коды (contract_type) — детерминированная палитра по индексу
 *    элемента в meta (порядок элементов стабилен для портала).
 *
 * Классы записаны СТАТИЧЕСКИ полными строками (Tailwind-purge не видит
 * динамических подстановок); только токены тем (--chart-*, семантические).
 */

/** Мягкий бэйдж: заливка/текст/бордер одного токена. */
export interface PbxItemBadgeClasses {
    badge: string;
    dot: string;
}

const PALETTE: readonly PbxItemBadgeClasses[] = [
    {
        badge: 'bg-chart-1/15 text-chart-1 border-chart-1/40',
        dot: 'bg-chart-1',
    },
    {
        badge: 'bg-chart-2/15 text-chart-2 border-chart-2/40',
        dot: 'bg-chart-2',
    },
    {
        badge: 'bg-chart-3/15 text-chart-3 border-chart-3/40',
        dot: 'bg-chart-3',
    },
    {
        badge: 'bg-chart-4/15 text-chart-4 border-chart-4/40',
        dot: 'bg-chart-4',
    },
    {
        badge: 'bg-chart-5/15 text-chart-5 border-chart-5/40',
        dot: 'bg-chart-5',
    },
] as const;

/**
 * Фиксированные цвета известных кодов op_client_type (истинная типизация
 * бэка: state/commerc/ip/fiz/layer). Семантика: бюджетники — info-синий,
 * коммерческие — success, ИП — warning, физлицо/адвокаты — палитра.
 */
const KNOWN_ITEM_CLASSES: Record<string, PbxItemBadgeClasses> = {
    state: {
        badge: 'bg-info/15 text-info border-info/40',
        dot: 'bg-info',
    },
    commerc: {
        badge: 'bg-success/15 text-success border-success/40',
        dot: 'bg-success',
    },
    ip: {
        badge: 'bg-warning/15 text-warning border-warning/40',
        dot: 'bg-warning',
    },
    fiz: PALETTE[3]!,
    layer: PALETTE[4]!,
};

const NEUTRAL_CLASSES: PbxItemBadgeClasses = {
    badge: 'border-border text-muted-foreground',
    dot: 'bg-muted-foreground',
};

/**
 * Классы бэйджа/точки элемента: известный код — из карты, иначе палитра
 * по индексу элемента в items поля; null-значение — нейтраль.
 */
export const pbxItemClasses = (
    itemCode: string | null,
    itemIndex: number,
): PbxItemBadgeClasses => {
    if (itemCode === null) return NEUTRAL_CLASSES;
    return (
        KNOWN_ITEM_CLASSES[itemCode] ??
        PALETTE[Math.abs(itemIndex) % PALETTE.length]!
    );
};
