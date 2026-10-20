/*
 * Подпись периода закрытых продаж — одна для плиток «Продажи» на странице
 * сотрудника и на вкладке «Финансы»: за какие даты считаем и по какой дате
 * сделки. Нужна, чтобы сравнение с вкладкой AI шло за одинаковое окно.
 */

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})/;

/** «2026-09-07» → «07.09»; не дата — как есть. */
export const formatFinanceDay = (value: string): string => {
    const match = DATE_KEY.exec(value);
    return match ? `${match[3]}.${match[2]}` : value;
};

export const FINANCE_PERIOD_CAPTION_RULE = 'по дате закрытия сделки';

/** «за 01.09–30.09, по дате закрытия сделки»; дат нет — только правило. */
export const formatFinancePeriodCaption = (
    from: string | null | undefined,
    to: string | null | undefined,
): string =>
    from && to
        ? `за ${formatFinanceDay(from)}–${formatFinanceDay(to)}, ${FINANCE_PERIOD_CAPTION_RULE}`
        : FINANCE_PERIOD_CAPTION_RULE;

/** Подсказка к подписи периода: какие сделки считаются. */
export const FINANCE_PERIOD_CAPTION_HINT = {
    title: 'Какие сделки считаем',
    lines: [
        'Сделки, закрытые в успех в этот период по дате закрытия, у которых сотрудник — ответственный.',
        'Вкладка AI считает те же сделки за свой период (не больше трёх последних месяцев): чтобы сравнить, выберите одинаковые даты.',
    ],
} as const;
