import { resolveSupply, type Catalog } from '../../catalog';
import { findMainRow, type RowSet } from '../../row-set';
import type { DocVariant, OfferGenerateRequest } from '../model/dto';
import { buildComplectGroups } from './build-complect-groups';
import { docComposition } from './doc-composition';
import { docTotalRow } from './doc-total-row';
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

/**
 * Нечего печатать — null (нет главной строки, наполнения у строк набора или
 * договора/поставки главной строки в каталоге). Группы инфоблоков строятся от
 * объединённого наполнения всего общего набора (docComposition).
 */
export const buildDocBody = ({ catalog, general, alternative }: DocBodyInput): DocBody | null => {
    const main = findMainRow(general);
    const composition = main && docComposition(main, general);
    if (!main || !composition) return null;
    const contract = catalog.contracts.byCode[main.refs.contractCode];
    const supply = resolveSupply(catalog, main.refs.supplyCode);
    if (!contract || !supply) return null;

    return {
        contractType: contractTypeOf(contract),
        complect: buildComplectGroups(catalog, composition),
        supply: toDocSupply(catalog, supply),
        contract: toDocContract(contract),
        rows: toDocRows(catalog, general, alternative),
        sets: toDocRowSets(catalog, general, alternative),
        // «Итого» — по всему общему набору, свёрнут он или развёрнут
        total: toDocRow(catalog, docTotalRow(general, main), 'general', 0, 0),
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
