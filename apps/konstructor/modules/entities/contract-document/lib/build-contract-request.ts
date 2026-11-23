import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { selectClientType } from '../../deal';
import { toOfferClientType } from '../../offer-document';
import { findMainRow, type RowSet } from '../../row-set';
import type { ContractGenerateRequest, ContractSpecificationFormRequest } from '../model/dto';
import {
    buildContractGenerateCore,
    buildSpecificationFormCore,
    type ContractFormCoreInput,
    type ContractSharedData,
    type ContractUnitValues,
} from './build-contract-core';
import type { ContractUnit } from './contract-units';

/**
 * Почему договор сейчас не собрать — подпись к заблокированной кнопке; null —
 * можно. Реквизит клиента и обязательные поля сделки не блокируют: пустые
 * места договора бэк заполняет прочерками (решение владельца 05.11.2026).
 */
export const contractRequestBlocker = (state: RootState): string | null => {
    if (!state.app.domain) return 'Приложение не инициализировано';
    if (!state.app.dealId) return 'Сначала сохраните сделку — договор прикрепляется к ней';
    if (!findMainRow(state.rowSet.general)) return 'Нет главной строки: соберите комплект';
    if (!state.documentProvider.current) return 'Выберите поставщика';
    return null;
};

const clientTypeOf = (state: RootState) => toOfferClientType(selectClientType(state));

/** Вход ядра для набора строк: каталог, тип клиента и отдел берутся из состояния. */
const coreInputOf = (state: RootState, general: RowSet): ContractFormCoreInput => ({
    catalog: selectCatalog(state),
    general,
    clientType: clientTypeOf(state),
    serviceDepartment: Boolean(state.rowSet.context.serviceDepartment),
});

/**
 * Общие данные договоров из состояния; нет сделки или поставщика — null.
 * Договор подписывает ответственный по сделке, иначе по компании, иначе
 * текущий пользователь.
 */
const sharedDataOf = (state: RootState): ContractSharedData | null => {
    const { domain, dealId, bitrix } = state.app;
    const provider = state.documentProvider.current;
    if (!dealId || !provider) return null;
    return {
        domain,
        dealId,
        companyId: String(bitrix.company?.ID ?? ''),
        providerId: Number(provider.id) || 0,
        userId:
            Number(bitrix.deal?.ASSIGNED_BY_ID) ||
            Number(bitrix.company?.ASSIGNED_BY_ID) ||
            Number(bitrix.user?.ID) ||
            0,
        clientType: clientTypeOf(state),
        dealFields: state.contractDocument.dealFields,
        rq: state.bxrq.current.item,
    };
};

/** Запрос формы договора (общая часть + спецификация) по живому состоянию; нет сборки — null. */
export const buildSpecificationFormRequest = (state: RootState): ContractSpecificationFormRequest | null =>
    buildSpecificationFormCore(coreInputOf(state, state.rowSet.general));

/** Запрос `contract/generate` по живому состоянию; блокер (см. contractRequestBlocker) или нет сборки — null. */
export const buildContractGenerateRequest = (state: RootState): ContractGenerateRequest | null => {
    if (contractRequestBlocker(state)) return null;
    const shared = sharedDataOf(state);
    if (!shared) return null;
    const { contractNumber, specification } = state.contractDocument;
    return buildContractGenerateCore({
        ...coreInputOf(state, state.rowSet.general),
        shared,
        values: { contractNumber, specification },
    });
};

/** Запрос формы договора одной единицы (набор строк варианта); нет сборки — null. */
export const buildUnitSpecificationFormRequest = (
    state: RootState,
    unit: ContractUnit,
): ContractSpecificationFormRequest | null => buildSpecificationFormCore(coreInputOf(state, unit.general));

/**
 * Запрос `contract/generate` одной единицы: набор строк варианта, общие данные
 * экрана и значения единицы (спецификация, номер). Блокер экрана проверяет
 * вызывающий (contractGenerateBlocker); нет сборки или общих данных — null.
 */
export const buildUnitContractGenerateRequest = (
    state: RootState,
    unit: ContractUnit,
    values: ContractUnitValues,
): ContractGenerateRequest | null => {
    const shared = sharedDataOf(state);
    if (!shared) return null;
    return buildContractGenerateCore({ ...coreInputOf(state, unit.general), shared, values });
};
