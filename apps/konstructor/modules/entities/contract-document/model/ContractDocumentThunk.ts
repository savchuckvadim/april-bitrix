import { readFieldValue } from '@workspace/pbx';
import type { AppThunk } from '@/modules/app/model/store';
import { updateDealField } from '../../deal';
import { toInputDate } from '../../offer-document';
import { saveSnapshot } from '../../snapshot';
import { ContractDocumentHelper } from '../lib/api/contract-document-helper';
import {
    buildContractGenerateRequest,
    buildSpecificationFormRequest,
    contractRequestBlocker,
    contractValidationErrors,
} from '../lib/build-contract-request';
import { toBitrixDate } from '../lib/contract-validation';
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
 */
export const initContractDocument = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    dispatch(initDealDocumentFields(CONTRACT_DEAL_FIELDS));
    await dispatch(fetchContractForm());
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
 * «Сформировать договор»: обязательные поля и реквизиты → слепок сделки →
 * contract/generate (DOCX + комментарий в таймлайн). Ссылка — в состоянии;
 * во фрейме экран уводит в сделку.
 */
export const generateContract = (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
    const state = getState();
    const blocker = contractRequestBlocker(state);
    if (blocker) {
        dispatch(contractDocumentActions.generateFailed(blocker));
        return false;
    }
    const errors = contractValidationErrors(state);
    if (errors.length) {
        dispatch(contractDocumentActions.generateFailed(`Не заполнено: ${errors.join(', ')}`));
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
        dispatch(contractDocumentActions.generateDone({ link: response.link, documentName: response.documentName }));
        return true;
    } catch (error) {
        dispatch(contractDocumentActions.generateFailed(errorText(error, 'договор не сформирован')));
        return false;
    }
};
