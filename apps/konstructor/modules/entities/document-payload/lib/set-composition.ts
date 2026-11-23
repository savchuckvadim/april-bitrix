import { mergeCompositions, type Composition } from '../../composition';
import { findMainRow, garantRows, type KRow, type RowSet } from '../../row-set';

/**
 * Объединённое наполнение набора для документов и полей сделки: у каждой
 * garant-строки общего набора своё наполнение, и в документ идёт всё вместе
 * (цены дополнительных комплектов уже стоят в таблице). Составы
 * сливаются без повторов (mergeCompositions), главная строка идёт первой и
 * задаёт комплект и режим наполнения. Строки без наполнения пропускаются;
 * нет ни одного наполнения — null.
 *
 * `lead` — строка, которая идёт первой; по умолчанию главная строка набора.
 * Её наполнение берётся из самой переданной строки, даже если набор хранит
 * более старую копию.
 */
export const setComposition = (set: RowSet, lead?: KRow | null): Composition | null => {
    const first = lead ?? findMainRow(set);
    const garant = garantRows(set);
    const ordered = first ? [first, ...garant.filter(row => row.key !== first.key)] : garant;
    return mergeCompositions(ordered.flatMap(row => (row.composition ? [row.composition] : [])));
};
