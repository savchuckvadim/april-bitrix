import { resolveSupply, type Catalog } from '../../catalog';
import type { Composition } from '../../composition';
// чистый модуль contract-document, не баррель: баррель тянет thunk и договорный стор
import { buildContractLt } from '../../contract-document/lib/contract-lt.util';
import { findMainRow, type RowSet } from '../../row-set';
import type { DocVariant, OfferGenerateRequest } from '../model/dto';
import { buildComplectGroups } from './build-complect-groups';
import { buildComplectSections } from './build-complect-sections';
import { docComposition } from './doc-composition';
import { docTotalRow } from './doc-total-row';
import { contractTypeOf, toDocContract, toDocSupply } from './build-doc-refs';
import { toDocRow, toDocRows, toDocRowSets } from './build-doc-rows';

/** Содержательная часть документа — одна и та же у КП и у варианта КП. */
export type DocBody = Pick<
    OfferGenerateRequest,
    'contractType' | 'complect' | 'complects' | 'supply' | 'contract' | 'rows' | 'sets' | 'total'
>;

export interface DocBodyInput {
    catalog: Catalog;
    general: RowSet;
    alternative: RowSet[];
}

/** Содержательная часть документа и наполнение, от которого она построена. */
interface DocBodyParts {
    body: DocBody;
    composition: Composition;
}

const buildDocBodyParts = ({ catalog, general, alternative }: DocBodyInput): DocBodyParts | null => {
    const main = findMainRow(general);
    const composition = main && docComposition(main, general);
    if (!main || !composition) return null;
    const contract = catalog.contracts.byCode[main.refs.contractCode];
    const supply = resolveSupply(catalog, main.refs.supplyCode);
    if (!contract || !supply) return null;
    const complects = buildComplectSections(catalog, general, main);

    return {
        composition,
        body: {
            contractType: contractTypeOf(contract),
            complect: buildComplectGroups(catalog, composition),
            ...(complects ? { complects } : {}),
            supply: toDocSupply(catalog, supply),
            contract: toDocContract(contract),
            rows: toDocRows(catalog, general, alternative),
            sets: toDocRowSets(catalog, general, alternative),
            // «Итого» — по всему общему набору, свёрнут он или развёрнут
            total: toDocRow(catalog, docTotalRow(general, main), 'general', 0, 0),
        },
    };
};

/**
 * Нечего печатать — null (нет главной строки, наполнения у строк набора или
 * договора/поставки главной строки в каталоге). Группы инфоблоков строятся от
 * объединённого наполнения всего общего набора (docComposition). Когда в
 * наборе два и больше комплекта с наполнением, к ним добавляются разделы
 * по комплектам (`complects`); у набора с одним комплектом поля нет.
 */
export const buildDocBody = (input: DocBodyInput): DocBody | null => buildDocBodyParts(input)?.body ?? null;

export interface DocVariantInput extends DocBodyInput {
    variantSmartId: number | null;
    /** Заголовок страницы варианта — название элемента смарта */
    title: string;
    /** Сервисный отдел: пакет LT веса 4 открыт только ему (как у договора); без поля — не сервисный */
    serviceDepartment?: boolean;
}

/**
 * Участник КП с несколькими вариантами (DocumentVariantDto бэка). Несёт `lt`:
 * бесплатную часть и платные пакеты Legal Tech того же наполнения, от которого
 * построены группы инфоблоков, в той же форме, что `lt` формы договора.
 */
export const buildDocVariant = (input: DocVariantInput): DocVariant | null => {
    const parts = buildDocBodyParts(input);
    if (!parts) return null;
    return {
        variantSmartId: input.variantSmartId,
        title: input.title,
        ...parts.body,
        lt: buildContractLt(input.catalog, parts.composition, input.serviceDepartment ?? false),
    };
};
