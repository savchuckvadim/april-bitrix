import type { KRow, RowSet } from '../../model/types';
import { round2 } from '../round.util';

/**
 * Свёрнутая total-строка: имена через « + », цены суммируются, количество
 * едино по сету (первой строки). Ручная правка тотала (set.totalPrice)
 * побеждает производный расчёт.
 */
export const buildTotalRow = (set: RowSet): KRow | null => {
    const first = set.rows[0];
    if (!first) return null;

    const quantity = first.price.quantity;
    const total = set.rows.reduce(
        (acc, row) => ({
            base: acc.base + row.price.base,
            sum: acc.sum + row.price.sum,
            month: acc.month + row.price.month,
        }),
        { base: 0, sum: 0, month: 0 },
    );
    const sum = round2(total.sum);
    const base = round2(total.base);
    const current = quantity > 0 ? round2(sum / quantity) : sum;

    const derived = {
        base,
        current,
        quantity,
        month: round2(total.month),
        sum,
        measure: first.price.measure,
        discount: {
            percent:
                base > 0 ? Math.round((current / base) * 10000) / 10000 : 1,
            amount: round2(base - current),
            current: 'percent' as const,
        },
    };

    return {
        key: `${set.id}_total`,
        setId: set.id,
        role: first.role,
        productType: 'garant',
        refs: first.refs,
        names: {
            name: set.rows.map(row => row.names.name).join(' + '),
            shortName: set.rows.map(row => row.names.shortName).join(' + '),
            alternativeName: null,
        },
        price: set.totalPrice ?? derived,
    };
};
