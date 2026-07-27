/** Подстрока-аннотация ячейки (например, % конверсии показателя). */
export interface RTableAnnotation {
    text: string;
    className?: string;
    /** Пояснение значения (например «5 из 89…») — показывается тултипом. */
    tooltip?: string;
}

/** Строка таблицы: пользователь + значения показателей. */
export interface RTableRow {
    id?: number;
    name: string;
    /** code — стабильный код показателя (для конверсий/сопоставления). */
    actions: { name: string; value: number; code?: string }[];
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
}
