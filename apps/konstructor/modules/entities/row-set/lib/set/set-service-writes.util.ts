import type { Composition } from '../../../composition';
import type { RowSet } from '../../model/types';
import { garantRows, leadGarantRow } from './set-ops.util';

/**
 * Запись сервисных значений набора. Значение консалтинга, академии и СТАР
 * одно на набор и читается из объединённого наполнения строк Гаранта
 * (см. set-services.util). План записи приводит наполнения строк к тому,
 * чтобы объединённое значение стало ровно выбранным.
 */

/** Одна запись наполнения: полезная нагрузка rowSetActions.setRowComposition */
export interface RowCompositionWrite {
    setId: string;
    key: string;
    composition: Composition;
}

/** Поля наполнения со значением «один на набор» */
export type SetServiceField = 'consalting' | 'academy';

const fieldPatch = (field: SetServiceField, value: string | null): Partial<Composition> =>
    field === 'consalting' ? { consalting: value } : { academy: value };

/**
 * План записи консалтинга или академии: новое значение получает ведущая
 * строка, у остальных строк Гаранта поле сбрасывается в null. В план входят
 * только строки, где значение меняется. Ведущей строки с наполнением нет —
 * план пуст.
 */
export const planServiceFieldWrite = (
    set: RowSet,
    field: SetServiceField,
    value: string | null,
): RowCompositionWrite[] => {
    const lead = leadGarantRow(set);
    if (!lead?.composition) return [];
    return garantRows(set).flatMap(row => {
        const composition = row.composition;
        if (!composition) return [];
        const next = row.key === lead.key ? value : null;
        if (composition[field] === next) return [];
        return [
            {
                setId: row.setId,
                key: row.key,
                composition: { ...composition, ...fieldPatch(field, next) },
            },
        ];
    });
};

/** План снятия СТАР: флаг гаснет у всех строк Гаранта, где он стоит */
export const planStarRemoval = (set: RowSet): RowCompositionWrite[] =>
    garantRows(set).flatMap(row => {
        const composition = row.composition;
        if (!composition?.star) return [];
        return [{ setId: row.setId, key: row.key, composition: { ...composition, star: false } }];
    });
