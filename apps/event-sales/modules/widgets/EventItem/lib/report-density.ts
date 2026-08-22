/**
 * Сколько места отдать комментарию.
 *
 * Отчёт и план живут в одном окне высотой около 630 px — и во фрейме-вкладке,
 * и на большом экране (там столько же отдано этой области). Карточек отчёта
 * при этом может быть одна («в работе» + комментарий), а может быть пять:
 * записи, продажа, пост-отказ, контакт, заявка. Фиксированная высота
 * комментария одинаково плоха в обоих случаях — то пустое поле в пол-экрана,
 * то щель в три строки под самое важное поле формы.
 *
 * Поэтому высота — функция от числа соседей: свободно — разъезжаемся, тесно —
 * ужимаемся, но не ниже читаемого минимума.
 */

export type ReportDensity = 'roomy' | 'normal' | 'dense';

export interface ReportDensityInput {
    /** Записи звонков показываются. */
    withRecords?: boolean;
    withSale?: boolean;
    withPostFail?: boolean;
    withContact?: boolean;
    withRequest?: boolean;
    /** Пульт развёрнут (не свёрнут в пилюлю) — это тоже карточка. */
    withPult?: boolean;
}

/** Сколько карточек, кроме комментария, стоит в колонке отчёта. */
export const countReportCards = (input: ReportDensityInput): number =>
    [
        input.withRecords,
        input.withSale,
        input.withPostFail,
        input.withContact,
        input.withRequest,
        input.withPult,
    ].filter(Boolean).length;

export const getReportDensity = (input: ReportDensityInput): ReportDensity => {
    const cards = countReportCards(input);
    if (cards <= 1) return 'roomy';
    if (cards <= 3) return 'normal';
    return 'dense';
};

/**
 * Высота комментария — в СТРОКАХ поля, а не в размере карточки.
 *
 * Так её задаёт сам textarea: строка — это то, чем менеджер меряет
 * комментарий («три строки на разговор»), и поле остаётся тянущимся вручную.
 * Управлять высотой рамки снаружи значило бы драться с внутренним ростом
 * поля по содержимому (field-sizing).
 *
 * Обычный режим — десять строк (требование владельца): комментарий пишут
 * при каждом отчёте, и семи строк на живой разговор не хватало. Минимум —
 * пять: ниже поле превращается в щель.
 */
export const COMMENT_ROWS: Record<ReportDensity, number> = {
    roomy: 14,
    normal: 10,
    dense: 5,
};
