import { resolveSupply, type Catalog } from '../../catalog';
import type { RqRecord } from '../../bx-rq/model/types';
import { buildDocBody, setComposition, toDocRows, type OfferClientType } from '../../document-payload';
import { findMainRow, type RowSet } from '../../row-set';
import type {
    ContractGenerateRequest,
    ContractSpecificationFormRequest,
    ContractSpecificationItem,
} from '../model/dto';
import { CONTRACT_DEAL_FIELDS, type ContractDealFieldValues } from '../model/types';
import { buildContractLt } from './contract-lt.util';
import { buildDocRegions } from './doc-regions.util';
import { emptyContractBxRq, toContractBxRq } from './to-contract-bx-rq.util';

/**
 * Ядро сборки запросов договора: чистые функции без привязки к стору. Живое
 * состояние и каждая договорная единица (один вариант комплекта) собираются
 * одним и тем же кодом, различаются только набор строк и значения единицы.
 */

/** Что нужно, чтобы описать договор по набору строк: каталог, общий набор, тип клиента, отдел. */
export interface ContractFormCoreInput {
    catalog: Catalog;
    /** Общий набор договора: живой или из слепка варианта */
    general: RowSet;
    clientType: OfferClientType;
    /** Сервисный отдел: пакет LT веса 4 открыт только ему */
    serviceDepartment: boolean;
}

/** Значения одной единицы, которые правит менеджер. */
export interface ContractUnitValues {
    specification: ContractSpecificationItem[];
    contractNumber: string;
}

/** Данные, общие для всех договоров экрана: сделка, клиент, поставщик, исполнитель. */
export interface ContractSharedData {
    domain: string;
    dealId: number;
    companyId: string;
    providerId: number;
    /** Кто подписывает: ответственный по сделке, по компании или текущий пользователь */
    userId: number;
    clientType: OfferClientType;
    /** Поля сделки по pbx-коду; пустое значение уходит пустой строкой */
    dealFields: ContractDealFieldValues;
    /** Текущий реквизит клиента; null — бэк ставит прочерки */
    rq: RqRecord | null;
}

export interface ContractGenerateCoreInput extends ContractFormCoreInput {
    shared: ContractSharedData;
    values: ContractUnitValues;
}

/**
 * Содержание договора из набора: те же легаси-формы, что у КП
 * (document-payload). Строки — все строки general-сета, не total: договор
 * печатает каждый товар (легаси getRowsArrayFromSets(sets, false)).
 * Регионы и Legal Tech строятся от объединённого наполнения общего набора:
 * в договор идёт наполнение всех комплектов, как у групп инфоблоков.
 */
const contractBody = (catalog: Catalog, general: RowSet) => {
    const main = findMainRow(general);
    const composition = main && setComposition(general, main);
    if (!main || !composition) return null;
    const supply = resolveSupply(catalog, main.refs.supplyCode);
    const body = buildDocBody({ catalog, general, alternative: [] });
    if (!body || !supply) return null;
    return {
        catalog,
        general,
        main,
        composition,
        supply,
        body: { ...body, rows: toDocRows(catalog, { ...general, collapsed: false }, []) },
    };
};

/** Запрос формы договора (общая часть + спецификация); нет сборки — null. */
export const buildSpecificationFormCore = (
    input: ContractFormCoreInput,
): ContractSpecificationFormRequest | null => {
    const content = contractBody(input.catalog, input.general);
    if (!content) return null;
    const { body, catalog, composition } = content;
    return {
        contractType: body.contractType,
        clientType: input.clientType,
        supply: body.supply,
        contract: body.contract,
        rows: body.rows,
        complect: body.complect,
        lt: buildContractLt(catalog, composition, input.serviceDepartment),
    };
};

/** Значения полей сделки в именах ContractGenerateDto (только поля с payloadKey). */
const dealValuesOf = (dealFields: ContractDealFieldValues) =>
    Object.fromEntries(
        CONTRACT_DEAL_FIELDS.filter(field => field.payloadKey).map(field => [
            field.payloadKey,
            dealFields[field.code] ?? '',
        ]),
    ) as Record<NonNullable<(typeof CONTRACT_DEAL_FIELDS)[number]['payloadKey']>, string>;

/** Запрос `contract/generate` одного договора; нет сборки — null. */
export const buildContractGenerateCore = (input: ContractGenerateCoreInput): ContractGenerateRequest | null => {
    const content = contractBody(input.catalog, input.general);
    if (!content) return null;
    const { body, catalog, composition, supply } = content;
    const { shared, values } = input;

    return {
        domain: shared.domain,
        companyId: shared.companyId,
        dealId: String(shared.dealId),
        providerId: shared.providerId,
        userId: shared.userId,
        contractType: body.contractType,
        complect: body.complect,
        supply: {
            name: body.supply.name,
            forkp: supply.quantityForKp ?? '',
            number: body.supply.number,
            type: body.supply.type,
        },
        contract: body.contract,
        regions: buildDocRegions(catalog, composition),
        rows: body.rows,
        total: body.total,
        ...dealValuesOf(shared.dealFields),
        contractNumber: values.contractNumber.trim(),
        clientType: shared.clientType,
        // без реквизита бэк ставит прочерки во всех строках клиента
        bxrq: shared.rq ? toContractBxRq(shared.rq) : emptyContractBxRq(),
        contractSpecificationState: { items: values.specification },
    };
};
