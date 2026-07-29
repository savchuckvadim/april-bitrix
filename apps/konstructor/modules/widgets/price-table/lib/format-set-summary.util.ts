import { TAX_COEFFICIENT, type RowSet, buildTotalRow } from '@/modules/entities/row-set';

/**
 * Сводка сета: «Всего наименований K на сумму X ₽[, в том числе НДС 5% — Y ₽]»
 * (легаси format-set-block-summary: vat = sum − sum / 1.05).
 */
export const formatSetSummary = (set: RowSet, withTax: boolean): string => {
    const total = buildTotalRow(set);
    if (!total) return 'Пусто';
    const sum = total.price.sum;
    const formatted = sum.toLocaleString('ru-RU', {
        maximumFractionDigits: 2,
    });
    let text = `Всего наименований ${set.rows.length} на сумму ${formatted} ₽`;
    if (withTax) {
        const vat = sum - sum / TAX_COEFFICIENT;
        text += `, в том числе НДС 5% — ${vat.toLocaleString('ru-RU', {
            maximumFractionDigits: 2,
        })} ₽`;
    }
    return text;
};
