import { resolveSupply, type Catalog } from '../../catalog';
import { buildTotalRow, findMainRow, type KRow, type RowSet } from '../../row-set';
import type { DocVariant, OfferGenerateRequest } from '../model/dto';
import { buildComplectGroups } from './build-complect-groups';
import { contractTypeOf, toDocContract, toDocSupply } from './build-doc-refs';
import { toDocRow, toDocRows, toDocRowSets } from './build-doc-rows';

/** Содержательная часть документа — одна и та же у КП и у варианта КП. */
export type DocBody = Pick<
    OfferGenerateRequest,
    'contractType' | 'complect' | 'supply' | 'contract' | 'rows' | 'sets' | 'total'
>;

export interface DocBodyInput {
    catalog: Catalog;
    general: RowSet;
    alternative: RowSet[];
}

/** Нечего печатать — null (нет главной строки или её договора/поставки в каталоге). */
export const buildDocBody = ({ catalog, general, alternative }: DocBodyInput): DocBody | null => {
    const main = findMainRow(general);
    if (!main?.composition) return null;
    const contract = catalog.contracts.byCode[main.refs.contractCode];
    const supply = resolveSupply(catalog, main.refs.supplyCode);
    if (!contract || !supply) return null;

    const totalRow: KRow = general.collapsed ? (buildTotalRow(general) ?? main) : main;

    return {
        contractType: contractTypeOf(contract),
        complect: buildComplectGroups(catalog, main.composition),
        supply: toDocSupply(catalog, supply),
        contract: toDocContract(contract),
        rows: toDocRows(catalog, general, alternative),
        sets: toDocRowSets(catalog, general, alternative),
        total: toDocRow(catalog, totalRow, 'general', 0, 0),
    };
};

export interface DocVariantInput extends DocBodyInput {
    variantSmartId: number | null;
    /** Заголовок страницы варианта — название элемента смарта */
    title: string;
}

/** Участник КП с несколькими вариантами (DocumentVariantDto бэка). */
export const buildDocVariant = (input: DocVariantInput): DocVariant | null => {
    const body = buildDocBody(input);
    if (!body) return null;
    return { variantSmartId: input.variantSmartId, title: input.title, ...body };
};
