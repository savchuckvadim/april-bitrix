/** Подстрока-аннотация ячейки (например, % конверсии показателя). */
export interface RTableAnnotation {
    text: string;
    className?: string;
    /** Пояснение значения (например «5 из 89…») — показывается тултипом. */
    tooltip?: string;
}

/** Значение показателя в строке; code — стабильный код (для конверсий/сопоставления). */
export interface RTableAction {
    name: string;
    value: number;
    code?: string;
    /**
     * Текст вместо числа: например, оценка «6,4», когда value хранит число
     * разборов для рейтингов и CSV. Не задан — показывается value.
     */
    display?: string;
    /** Класс значения (тон «выше/ниже среднего» и т. п.). */
    className?: string;
    /** Подсказка ко всей ячейке (значение + подстроки) — тултипом. */
    tooltip?: string;
}

/** Строка таблицы: пользователь + значения показателей. */
export interface RTableRow {
    id?: number;
    name: string;
    actions: RTableAction[];
    /** Класс строки (например, строка «Итого»). */
    className?: string;
}

export interface RTableProps {
    code: string;
    firstCellName: string;
    data: RTableRow[];
    withLink?: boolean;
    onClick?: (id: number) => void;
    /** Аннотации ячеек по ключу `${rowId}:${actionCode}`. */
    annotations?: Map<string, RTableAnnotation>;
    /**
     * План-аннотации (вторая подстрока, «⌖ план · %») — отдельный канал,
     * чтобы не конфликтовать с конверсиями на той же ячейке.
     */
    planAnnotations?: Map<string, RTableAnnotation>;
    /**
     * Подсказки к колонкам по коду показателя (`action.code`, без кода —
     * по имени): колонка помечается в шапке, текст уходит в тултип.
     */
    columnHints?: Map<string, string>;
    /**
     * Клик по заголовку колонки (код показателя, без кода — имя): шапка
     * становится кнопкой. Не задан — шапка как раньше.
     */
    onColumnClick?: (code: string) => void;
}
