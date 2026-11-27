import type { RootState } from '@/modules/app/model/store';
import { resolveSupply, selectCatalog, type SupplyKind } from '../../catalog';
import { selectClientType } from '../../deal';
import { findMainRow } from '../../row-set';
import type { InvoiceClientType, InvoiceSupplyType } from '../model';
import { clientTypeOfRq } from './invoice-template-criteria.util';

/**
 * Тип клиента из шапки (компания, затем сделка) в код бэка. Не задан, значит
 * `null`: подбор тогда берёт только шаблоны «для любого типа клиента».
 */
export const selectInvoiceClientType = (
    state: RootState,
): InvoiceClientType | null => clientTypeOfRq(selectClientType(state));

/**
 * Тип поставки главной строки общего набора: от него бэк подбирает шаблон
 * счёта при генерации КП. Нет главной строки, значит `null`.
 */
export const selectInvoiceSupplyType = (
    state: RootState,
): InvoiceSupplyType | null => {
    const main = findMainRow(state.rowSet.general);
    if (!main) return null;
    const supply = resolveSupply(selectCatalog(state), main.refs.supplyCode);
    return (supply?.type as SupplyKind | undefined) ?? null;
};
