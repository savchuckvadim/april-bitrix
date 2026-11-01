import { termMonthsOf, type Catalog } from '../../../catalog';
import type { RowSet } from '../../model/types';
import { leadGarantRow } from './set-ops.util';

/**
 * Срок сделки набора в месяцах: количество ведущего Гаранта × длительность
 * его договора (легаси: quantity × contractCoefficient у total-строки).
 * null — набор пуст или договор не найден.
 */
export const setTermMonths = (set: RowSet, catalog: Catalog): number | null => {
    const lead = leadGarantRow(set);
    const contract = lead ? catalog.contracts.byCode[lead.refs.contractCode] : null;
    return lead && contract ? termMonthsOf(lead.price.quantity, contract) : null;
};
