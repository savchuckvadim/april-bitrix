import type { Composition } from '../../composition';
import type { KRow, RowSet } from '../../row-set';

/**
 * Состав для документов: в них идёт только то, что стало товарной строкой.
 * Доп. пакет LT без строки (не собран или закрыт для отдела) и академия без
 * строки (пакет не подходит под срок сделки) в документе не появляются: в
 * легаси такой пакет нельзя было сохранить, а академию он убирал из комплекта.
 */
export const docComposition = (main: KRow, set: RowSet): Composition | null => {
    if (!main.composition) return null;
    const withRows = new Set(
        set.rows.filter(row => row.productType === 'lt_other').map(row => row.refs.packetId),
    );
    const hasAcademyRow = set.rows.some(row => row.productType === 'academy');
    return {
        ...main.composition,
        ltOther: main.composition.ltOther.filter(packet => withRows.has(packet.id)),
        academy: hasAcademyRow ? main.composition.academy : null,
    };
};
