import type { RootState } from '@/modules/app/model/store';
import { resolveSupply, selectCatalog } from '../../catalog';
import { getDealClientType } from '../../deal';
import { buildDocBody, toDocRows } from '../../document-payload';
import { toOfferClientType } from '../../offer-document';
import { findMainRow } from '../../row-set';
import type { ContractGenerateRequest, ContractSpecificationFormRequest } from '../model/dto';
import { CONTRACT_DEAL_FIELDS } from '../model/types';
import { buildContractLt } from './contract-lt.util';
import { missingDealFields, missingRequisites } from './contract-validation';
import { buildDocRegions } from './doc-regions.util';
import { toContractBxRq } from './to-contract-bx-rq.util';

/** Почему договор сейчас не собрать — подпись к заблокированной кнопке; null — можно. */
export const contractRequestBlocker = (state: RootState): string | null => {
    if (!state.app.domain) return 'Приложение не инициализировано';
    if (!state.app.dealId) return 'Сначала сохраните сделку — договор прикрепляется к ней';
    if (!findMainRow(state.rowSet.general)) return 'Нет главной строки: соберите комплект';
    if (!state.documentProvider.current) return 'Выберите поставщика';
    if (!state.bxrq.current.item) return 'Выберите реквизиты клиента';
    return null;
};

const clientTypeOf = (state: RootState) =>
    toOfferClientType(
        getDealClientType(state.portal.current?.bitrixDeal ?? undefined, state.app.bitrix.deal ?? undefined),
    );

/** Чего не хватает для документа: обязательные поля сделки и реквизиты (легаси validatePushRq + pushRequired). */
export const contractValidationErrors = (state: RootState): string[] => [
    ...missingDealFields(state.contractDocument.dealFields),
    ...missingRequisites(
        getDealClientType(state.portal.current?.bitrixDeal ?? undefined, state.app.bitrix.deal ?? undefined),
        state.bxrq.current.item,
    ),
];

/**
 * Содержание договора из текущей сборки: те же легаси-формы, что у КП
 * (document-payload). Строки — все строки general-сета, не total: договор
 * печатает каждый товар (легаси getRowsArrayFromSets(sets, false)).
 */
const contractBody = (state: RootState) => {
    const catalog = selectCatalog(state);
    const general = state.rowSet.general;
    const main = findMainRow(general);
    if (!main?.composition) return null;
    const supply = resolveSupply(catalog, main.refs.supplyCode);
    const body = buildDocBody({ catalog, general, alternative: [] });
    if (!body || !supply) return null;
    return {
        catalog,
        general,
        main,
        composition: main.composition,
        supply,
        body: { ...body, rows: toDocRows(catalog, { ...general, collapsed: false }, []) },
    };
};

/** Запрос формы договора (общая часть + спецификация); нет сборки — null. */
export const buildSpecificationFormRequest = (state: RootState): ContractSpecificationFormRequest | null => {
    const content = contractBody(state);
    if (!content) return null;
    const { body, catalog, composition, general } = content;
    return {
        contractType: body.contractType,
        clientType: clientTypeOf(state),
        supply: body.supply,
        contract: body.contract,
        rows: body.rows,
        complect: body.complect,
        lt: buildContractLt(catalog, composition, general.rows),
    };
};

/** Запрос `contract/generate`; блокер (см. contractRequestBlocker) или нет сборки — null. */
export const buildContractGenerateRequest = (state: RootState): ContractGenerateRequest | null => {
    if (contractRequestBlocker(state)) return null;
    const content = contractBody(state);
    const { domain, dealId, bitrix } = state.app;
    const provider = state.documentProvider.current;
    const rq = state.bxrq.current.item;
    if (!content || !dealId || !provider || !rq) return null;
    const { body, catalog, composition, supply } = content;
    const { dealFields, contractNumber, specification } = state.contractDocument;

    // договор подписывает ответственный по сделке, иначе по компании, иначе текущий пользователь
    const company = bitrix.company as Record<string, unknown> | null;
    const userId =
        Number(bitrix.deal?.ASSIGNED_BY_ID) || Number(company?.ASSIGNED_BY_ID) || Number(bitrix.user?.ID) || 0;

    const dealValues = Object.fromEntries(
        CONTRACT_DEAL_FIELDS.filter(field => field.payloadKey).map(field => [
            field.payloadKey,
            dealFields[field.code] ?? '',
        ]),
    ) as Record<NonNullable<(typeof CONTRACT_DEAL_FIELDS)[number]['payloadKey']>, string>;

    return {
        domain,
        companyId: String(bitrix.company?.ID ?? ''),
        dealId: String(dealId),
        providerId: Number(provider.id) || 0,
        userId,
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
        ...dealValues,
        contractNumber: contractNumber.trim(),
        clientType: clientTypeOf(state),
        bxrq: toContractBxRq(rq),
        contractSpecificationState: { items: specification },
    };
};
