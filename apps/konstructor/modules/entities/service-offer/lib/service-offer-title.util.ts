import { resolveSupply, type Catalog, type ContractKind } from '../../catalog';
import type { KRow } from '../../row-set';

/** Название вида договора для заголовка элемента смарта (легаси getContractName). */
const CONTRACT_KIND_TITLE: Record<ContractKind, string> = {
    service: 'Договор услуг',
    abon: 'Абонемент',
    lic: 'Лицензия',
    key: 'Передача ключа доступа',
};

/** Заголовок элемента «предложение на будущий период»: комплект · поставка · вид договора. */
export const buildServiceOfferTitle = (catalog: Catalog, mainRow: KRow | null): string => {
    if (!mainRow) return '';
    const complect = catalog.complects.byCode[mainRow.refs.complectCode ?? ''];
    const supply = resolveSupply(catalog, mainRow.refs.supplyCode);
    const contract = catalog.contracts.byCode[mainRow.refs.contractCode];
    return [complect?.fullTitle ?? complect?.title, supply?.name, contract ? CONTRACT_KIND_TITLE[contract.kind] : null]
        .filter(Boolean)
        .join(' ');
};
