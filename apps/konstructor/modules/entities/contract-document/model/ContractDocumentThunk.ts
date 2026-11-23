import { readFieldValue } from '@workspace/pbx';
import type { AppThunk, RootState } from '@/modules/app/model/store';
import { updateDealField } from '../../deal';
import { toInputDate } from '../../offer-document';
import { saveSnapshot } from '../../snapshot';
import { ContractDocumentHelper } from '../lib/api/contract-document-helper';
import {
    buildContractGenerateRequest,
    buildSpecificationFormRequest,
    buildUnitContractGenerateRequest,
    buildUnitSpecificationFormRequest,
    contractRequestBlocker,
} from '../lib/build-contract-request';
import { toBitrixDate } from '../lib/contract-validation';
import { contractGenerateBlocker, selectContractUnits } from '../lib/select-contract-units';
import { contractDocumentActions } from './ContractDocumentSlice';
import {
    ALL_DEAL_DOCUMENT_FIELDS,
    CONTRACT_DEAL_FIELDS,
    type ContractDealField,
    type ContractDealFieldValues,
} from './types';

const helper = new ContractDocumentHelper();

const errorText = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

/**
 * Вход на экран договора: поля сделки из Bitrix по pbx-кодам (один раз на
 * сделку — менеджер мог уже править), затем форма с бэка. Форма зависит от
 * сборки, поэтому запрашивается на каждом входе.
 * Когда варианты продаются вместе, у каждой договорной единицы своя форма:
 * состояние ушедших из сделки единиц удаляется, формы остальных запрашиваются
 * по одной, друг за другом (после живой формы, её читает отчёт о поставке).
 */
export const initContractDocument = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    dispatch(initDealDocumentFields(CONTRACT_DEAL_FIELDS));
    const { units } = selectContractUnits(getState());
    dispatch(contractDocumentActions.unitsRetained(units.map(unit => unit.key)));
    await dispatch(fetchContractForm());
    for (const unit of units) {
        await dispatch(fetchContractUnitForm(unit.key));
    }
};

/**
 * Дефолты полей сделки из Bitrix по pbx-кодам — только для кодов, которых в
 * состоянии ещё нет: экраны договора и отчёта делят одно хранилище, и правка
 * менеджера на одном экране не должна перетираться входом на другой.
 */
export const initDealDocumentFields =
    (fields: ContractDealField[]): AppThunk<void> =>
    (dispatch, getState) => {
        const state = getState();
        const portalFields = state.portal.current?.bitrixDeal?.bitrixfields ?? null;
        const deal = state.app.bitrix.deal;
        const current = state.contractDocument.dealFields;
        const values: ContractDealFieldValues = { ...current };
        for (const field of fields) {
            if (field.code in current) continue;
            const raw = readFieldValue(portalFields, deal, field.code);
            values[field.code] =
                field.type === 'date' ? toInputDate(raw) : typeof raw === 'string' ? raw.trim() : '';
        }
        dispatch(contractDocumentActions.setDealFieldsDefaults(values));
    };

export const fetchContractForm = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const request = buildSpecificationFormRequest(getState());
    if (!request) {
        dispatch(contractDocumentActions.formFailed('Нет главной строки: соберите комплект'));
        return;
    }
    dispatch(contractDocumentActions.formLoading());
    try {
        const response = await helper.specificationForm(request);
        dispatch(
            contractDocumentActions.formLoaded({
                contractForm: response.contract,
                specification: response.specification,
            }),
        );
    } catch (error) {
        dispatch(contractDocumentActions.formFailed(errorText(error, 'форма договора не загружена')));
    }
};

/**
 * Поле сделки по blur → Bitrix (легаси updateDeal из PBX-карточки). Значение
 * в состоянии уже новое; ошибка записи показывается, но поле не откатываем —
 * менеджер повторит blur.
 */
export const saveContractDealField =
    (code: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const state = getState();
        const field = ALL_DEAL_DOCUMENT_FIELDS.find(item => item.code === code);
        const dealId = state.app.dealId;
        if (!field || !dealId) return;
        const raw = state.contractDocument.dealFields[code] ?? '';
        const value = field.type === 'date' ? toBitrixDate(raw) : raw.trim();
        dispatch(contractDocumentActions.savingField(code));
        const result = await dispatch(updateDealField({ dealId, value, fieldCode: code }));
        if (updateDealField.rejected.match(result)) {
            dispatch(
                contractDocumentActions.saveFailed(
                    typeof result.payload === 'string' ? result.payload : `Поле «${field.label}» не записано`,
                ),
            );
            return;
        }
        dispatch(contractDocumentActions.savingField(null));
    };

/**
 * «Сформировать договор»: слепок сделки → contract/generate (DOCX +
 * комментарий в таймлайн). Незаполненные поля и реквизиты не останавливают:
 * на их месте бэк ставит прочерки (решение владельца 05.11.2026).
 * Ссылка — в состоянии; во фрейме экран уводит в сделку.
 */
export const generateContract = (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
    const state = getState();
    const blocker = contractRequestBlocker(state);
    if (blocker) {
        dispatch(contractDocumentActions.generateFailed(blocker));
        return false;
    }
    const request = buildContractGenerateRequest(state);
    if (!request) {
        dispatch(contractDocumentActions.generateFailed('Нет договора или поставки главной строки'));
        return false;
    }
    dispatch(contractDocumentActions.generateStarted());
    try {
        await dispatch(saveSnapshot());
        const response = await helper.generate(request);
        dispatch(
            contractDocumentActions.generateDone({
                link: response.link,
                documentName: response.documentName,
                savedToDisk: response.savedToDisk,
            }),
        );
        return true;
    } catch (error) {
        dispatch(contractDocumentActions.generateFailed(errorText(error, 'договор не сформирован')));
        return false;
    }
};

/** Единица договора по ключу среди текущих участников; вышла из сделки — undefined. */
const findUnit = (state: RootState, key: string) =>
    selectContractUnits(state).units.find(candidate => candidate.key === key);

/** Форма договора одной единицы: общая часть и спецификация по набору её варианта. */
export const fetchContractUnitForm =
    (key: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const state = getState();
        const unit = findUnit(state, key);
        if (!unit) return;
        const request = buildUnitSpecificationFormRequest(state, unit);
        if (!request) {
            dispatch(
                contractDocumentActions.unitFormFailed({ key, error: 'Нет главной строки варианта: соберите комплект' }),
            );
            return;
        }
        dispatch(contractDocumentActions.unitFormLoading({ key }));
        try {
            const response = await helper.specificationForm(request);
            dispatch(
                contractDocumentActions.unitFormLoaded({
                    key,
                    contractForm: response.contract,
                    specification: response.specification,
                }),
            );
        } catch (error) {
            dispatch(
                contractDocumentActions.unitFormFailed({ key, error: errorText(error, 'форма договора не загружена') }),
            );
        }
    };

/**
 * «Сформировать» у договорной единицы: слепок сделки → contract/generate по
 * набору строк её варианта. Номер и спецификация — свои у единицы, поля
 * сделки, реквизит и поставщик общие. Результат и ошибка пишутся в состояние
 * единицы; возвращает, удалось ли формирование.
 */
export const generateContractUnit =
    (key: string): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        const state = getState();
        const unit = findUnit(state, key);
        if (!unit) {
            dispatch(
                contractDocumentActions.unitGenerateFailed({ key, error: 'Вариант больше не участвует в документах' }),
            );
            return false;
        }
        const blocker = contractGenerateBlocker(state);
        if (blocker) {
            dispatch(contractDocumentActions.unitGenerateFailed({ key, error: blocker }));
            return false;
        }
        const values = state.contractDocument.units[key];
        const request = buildUnitContractGenerateRequest(state, unit, {
            specification: values?.specification ?? [],
            contractNumber: values?.contractNumber ?? '',
        });
        if (!request) {
            dispatch(
                contractDocumentActions.unitGenerateFailed({
                    key,
                    error: 'Нет договора или поставки главной строки варианта',
                }),
            );
            return false;
        }
        dispatch(contractDocumentActions.unitGenerateStarted({ key }));
        try {
            await dispatch(saveSnapshot());
            const response = await helper.generate(request);
            dispatch(
                contractDocumentActions.unitGenerateDone({
                    key,
                    link: response.link,
                    documentName: response.documentName,
                    savedToDisk: response.savedToDisk,
                }),
            );
            return true;
        } catch (error) {
            dispatch(
                contractDocumentActions.unitGenerateFailed({ key, error: errorText(error, 'договор не сформирован') }),
            );
            return false;
        }
    };

/**
 * «Сформировать все договоры»: единицы по очереди, каждая со своим слепком и
 * своим результатом. Сбой одной единицы не останавливает остальные, его
 * ошибка лежит в состоянии этой единицы. Возвращает true, только если
 * удались все; единиц нет — false (сформировано ничего).
 */
export const generateContractUnits = (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
    const keys = selectContractUnits(getState()).units.map(unit => unit.key);
    if (!keys.length) return false;
    let allDone = true;
    for (const key of keys) {
        const done = await dispatch(generateContractUnit(key));
        if (!done) allDone = false;
    }
    return allDone;
};
