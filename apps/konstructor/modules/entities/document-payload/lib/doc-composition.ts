import type { Composition } from '../../composition';
import type { KRow, RowSet } from '../../row-set';

/**
 * Состав для документов: доп. пакет LT идёт только с товарной строкой в наборе.
 * Несобранный или закрытый для отдела пакет строки не имеет, и его сервисов в
 * документе быть не должно: в легаси такой пакет нельзя было сохранить.
 */
export const docComposition = (main: KRow, set: RowSet): Composition | null => {
    if (!main.composition) return null;
    const withRows = new Set(
        set.rows.filter(row => row.productType === 'lt_other').map(row => row.refs.packetId),
    );
    return {
        ...main.composition,
        ltOther: main.composition.ltOther.filter(packet => withRows.has(packet.id)),
    };
};
