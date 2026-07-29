import type { Catalog } from '../../../catalog';

/** Общий контекст сборки строки: каталог + регион + налог поставщика */
export interface BuildRowCtx {
    catalog: Catalog;
    regionCode: string;
    withTax: boolean;
}
