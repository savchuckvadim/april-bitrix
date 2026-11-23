import type { Composition } from '../../composition';
import type { KRow, RowSet } from '../../row-set';
import { setComposition } from './set-composition';

/**
 * Два отсева документа поверх готового наполнения: в документах идёт только
 * то, что стало товарной строкой. Доп. пакет LT без строки (не собран или
 * закрыт для отдела) и академия без строки (пакет не подходит под срок сделки)
 * в документе не появляются: в легаси такой пакет нельзя было сохранить, а
 * академию он убирал из комплекта.
 */
const withProductRowsOnly = (composition: Composition, set: RowSet): Composition => {
    const withRows = new Set(
        set.rows.filter(row => row.productType === 'lt_other').map(row => row.refs.packetId),
    );
    const hasAcademyRow = set.rows.some(row => row.productType === 'academy');
    return {
        ...composition,
        ltOther: composition.ltOther.filter(packet => withRows.has(packet.id)),
        academy: hasAcademyRow ? composition.academy : null,
    };
};

/**
 * Состав для документов: объединённое наполнение всех garant-строк набора
 * (главная первой, см. setComposition) с двумя отсевами. У набора с одной
 * garant-строкой результат равен наполнению этой строки после отсевов.
 */
export const docComposition = (main: KRow, set: RowSet): Composition | null => {
    const merged = setComposition(set, main);
    return merged && withProductRowsOnly(merged, set);
};

/**
 * Состав одной главной строки для документов, которым весь набор не нужен
 * (описание комплекта): наполнение главной строки с теми же двумя отсевами.
 */
export const mainDocComposition = (main: KRow, set: RowSet): Composition | null =>
    main.composition ? withProductRowsOnly(main.composition, set) : null;
