import type { Catalog } from '../../../catalog';
import {
    describeLtPackets,
    mergeCompositions,
    type Composition,
    type LtPacketView,
} from '../../../composition';
import type { KRow, RowSet } from '../../model/types';
import { garantRows, leadGarantRow } from './set-ops.util';

/**
 * Чтение сервисных значений набора. Сервисные строки (консалтинг, СТАР,
 * академия, платный LT) выводятся из ОБЪЕДИНЁННОГО наполнения всех строк
 * Гаранта, поэтому значение сервисной строки одно на набор и равно значению
 * в этом объединении. Карточка строки и кнопка «Академия» читают его здесь.
 */

/** Объединённое наполнение переданных строк; строки без наполнения пропускаются */
export const mergeRowCompositions = (rows: KRow[]): Composition | null =>
    mergeCompositions(rows.flatMap(row => (row.composition ? [row.composition] : [])));

/** Объединённое наполнение всех строк Гаранта набора (источник сервисных строк) */
export const mergedSetComposition = (set: RowSet): Composition | null =>
    mergeRowCompositions(garantRows(set));

export interface SetServiceValues {
    /** Платный консалтинг: sovex | pkpremium | null (Горячая линия) */
    consalting: string | null;
    /** Код пакета академии или null */
    academy: string | null;
    /** СТАР есть хотя бы у одной строки Гаранта */
    star: boolean;
}

/** Текущие значения консалтинга, академии и СТАР набора */
export const setServiceValues = (set: RowSet): SetServiceValues => {
    const merged = mergedSetComposition(set);
    return {
        consalting: merged?.consalting ?? null,
        academy: merged?.academy ?? null,
        star: merged?.star ?? false,
    };
};

/**
 * Строка Гаранта, в чьём наполнении лежит платный LT (первая такая по
 * порядку). Платного LT нет ни в одной строке — ведущая строка.
 */
export const paidLtOwner = (set: RowSet): KRow | null =>
    garantRows(set).find(row => (row.composition?.ltInPacket.length ?? 0) > 0) ??
    leadGarantRow(set);

export interface PaidLtContext {
    catalog: Catalog;
    serviceDepartment?: boolean;
}

/** Платный пакет LT набора, собранный из объединённого наполнения (вес, состав, пакет каталога) */
export const paidLtPacket = (set: RowSet, context: PaidLtContext): LtPacketView | null => {
    const merged = mergedSetComposition(set);
    if (!merged) return null;
    const { catalog, serviceDepartment } = context;
    return (
        describeLtPackets(merged, {
            catalog,
            complect: catalog.complects.byCode[merged.complectCode] ?? null,
            serviceDepartment,
        }).find(packet => packet.id === 'paid') ?? null
    );
};
