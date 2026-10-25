import type { AppThunk } from '@/modules/app/model/store';
import { RqHelper } from '../lib/api/rq-helper';
import { filterFieldItems, getFullName } from '../lib/field-items-util';
import {
    BANK_RQ_ITEM_CODE,
    RQ_ITEM_CODE,
    RQ_TYPE,
    type BankRqItem,
    type BX_ADDRESS_TYPE,
    type RqItem,
    type RqRecord,
} from './types';
import { bxrqActions } from './BxRqSlice';

const helper = new RqHelper();

const {
    cleanError,
    setError,
    setLoading,
    setFetched,
    setFetchedStatus,
    setCreatingLoadingStatus,
    saveBaseCreating,
    saveAddressCreating,
    saveBankCreating,
    setBaseProp,
    setRequiredUnderstand,
    setCaseLoading,
} = bxrqActions;

const getSaveErrorMessage = (error: unknown): string => {
    const fallback = 'Ошибка сохранения реквизитов';
    const message =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : '';
    const normalized = message.toLowerCase();
    if (normalized.includes('инн') || normalized.includes('inn')) {
        return normalized.includes('длин') ||
            normalized.includes('символ') ||
            normalized.includes('length')
            ? 'Ошибка сохранения ИНН: превышена допустимая длина'
            : 'Ошибка сохранения ИНН';
    }
    return message || fallback;
};

const setFieldValue = (fields: RqItem[], code: string, value: string): RqItem[] =>
    fields.map(field =>
        field.code === code && field.type !== 'select' && field.type !== 'file'
            ? { ...field, value }
            : field,
    );

export const fetchBXRQ =
    (domain: string, companyId: number, currentRqId?: number): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        if (getState().bxrq.isLoading) return;
        dispatch(setLoading(true));
        try {
            const bxrq = await helper.fetch(domain, companyId);
            dispatch(setFetched({ bxrq, currentRqId }));
        } catch (error) {
            console.warn('bx-rq: реквизиты не загружены', error);
            dispatch(setFetchedStatus(true));
        }
    };

/**
 * Банк для режима «прочие реквизиты одной строкой»: комментарий из черновика
 * пишется в поле comments текущего банка; пустое название банка → «Банк».
 */
const buildSimpleCommentBank = (
    currentBank: BankRqItem | null,
    comment: string,
): BankRqItem => {
    let fields = setFieldValue(
        currentBank?.fields ?? [],
        BANK_RQ_ITEM_CODE.BANK_COMMENTS,
        comment,
    );
    const bankName = fields.find(field => field.code === BANK_RQ_ITEM_CODE.BANK_NAME);
    if (
        bankName &&
        bankName.type !== 'select' &&
        bankName.type !== 'file' &&
        !bankName.value.trim()
    ) {
        fields = setFieldValue(fields, BANK_RQ_ITEM_CODE.BANK_NAME, 'Банк');
    }
    return { id: currentBank && currentBank.id > 0 ? currentBank.id : -1, fields };
};

/** Сохранить черновик базовых полей (+ комментарий банка в простом режиме). */
export const saveBXRQ =
    (
        domain: string,
        companyId: number,
        currentClientType: RQ_TYPE,
    ): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        dispatch(cleanError({ code: 'save' }));
        dispatch(setCreatingLoadingStatus(true));
        dispatch(setRequiredUnderstand({ status: false }));
        try {
            const rqsState = getState().bxrq;
            const draft = rqsState.creating.base;
            const currentItem = rqsState.current.item;
            if (!rqsState.rqs || !draft || !currentItem) {
                dispatch(setCreatingLoadingStatus(false));
                return;
            }
            const fields = filterFieldItems(draft.fields, currentClientType);
            const storedId = await helper.storeRecord(domain, companyId, {
                ...draft,
                fields,
            });
            const rqId = storedId && storedId > 0 ? storedId : draft.bx_id;

            let item: RqRecord = { ...currentItem, bx_id: rqId, fields };

            const simpleBankComment = rqsState.creating.simpleBankComment.trim();
            const currentBank = item.bank.current ?? item.bank.items[0] ?? null;
            const currentBankComment = (
                currentBank?.fields.find(
                    field => field.code === BANK_RQ_ITEM_CODE.BANK_COMMENTS,
                )?.value ?? ''
            )
                .toString()
                .trim();
            const shouldSaveBankComment =
                rqsState.settings.isSimpleBankCommentMode &&
                (Boolean(simpleBankComment) || simpleBankComment !== currentBankComment);

            if (shouldSaveBankComment) {
                const bankPayload = buildSimpleCommentBank(currentBank, simpleBankComment);
                const bankId = await helper.storeBank(domain, companyId, rqId, bankPayload);
                const updatedBank = { ...bankPayload, id: bankId };
                item = {
                    ...item,
                    bank: { items: [updatedBank], current: updatedBank, fields: updatedBank.fields },
                };
            }

            dispatch(saveBaseCreating({ item, clientType: currentClientType }));
        } catch (error) {
            dispatch(setError({ code: 'save', value: getSaveErrorMessage(error) }));
        } finally {
            dispatch(setCreatingLoadingStatus(false));
        }
    };

export const saveAddress =
    (
        domain: string,
        companyId: number,
        currentClientType: RQ_TYPE,
        typeId: BX_ADDRESS_TYPE,
    ): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        dispatch(cleanError({ code: 'save' }));
        dispatch(setRequiredUnderstand({ status: false }));
        const rqsState = getState().bxrq;
        const draft = rqsState.creating.address;
        const rq = rqsState.current.item;
        if (!rqsState.rqs || !draft || !rq) return;
        dispatch(setCreatingLoadingStatus(true));
        try {
            await helper.storeAddress(domain, companyId, rq.bx_id, draft);
            dispatch(saveAddressCreating({ typeId, clientType: currentClientType }));
        } catch (error) {
            dispatch(setError({ code: 'save', value: getSaveErrorMessage(error) }));
        } finally {
            dispatch(setCreatingLoadingStatus(false));
        }
    };

export const saveBank =
    (domain: string, companyId: number, currentClientType: RQ_TYPE): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        dispatch(cleanError({ code: 'save' }));
        dispatch(setRequiredUnderstand({ status: false }));
        const rqsState = getState().bxrq;
        const draft = rqsState.creating.bank;
        const rq = rqsState.current.item;
        if (!rqsState.rqs || !draft || !rq) return;
        dispatch(setCreatingLoadingStatus(true));
        try {
            const bankId = await helper.storeBank(domain, companyId, rq.bx_id, draft);
            dispatch(saveBankCreating({ bankId, clientType: currentClientType }));
        } catch (error) {
            dispatch(setError({ code: 'save', value: getSaveErrorMessage(error) }));
        } finally {
            dispatch(setCreatingLoadingStatus(false));
        }
    };

const NAME_CODES: string[] = [
    RQ_ITEM_CODE.FIRST_NAME,
    RQ_ITEM_CODE.LAST_NAME,
    RQ_ITEM_CODE.SECOND_NAME,
];
const CASE_CODES: string[] = [
    RQ_ITEM_CODE.DIRECTOR_NAME,
    RQ_ITEM_CODE.DIRECTOR_POSITION,
    RQ_ITEM_CODE.BASED,
];

/**
 * Blur текстового поля черновика: ФИО собирает personName/fullname/shortname
 * для ИП; директор/должность/основание получают родительный падеж с бэка
 * в поле `<code>_case`.
 */
export const blurCase =
    (code: string, value: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const state = getState().bxrq;
        if (state.caseLoading.includes(code)) return;

        if (NAME_CODES.includes(code)) {
            const fields = state.creating.base?.fields;
            if (fields) {
                const { fullName, initials } = getFullName(fields);
                dispatch(setBaseProp({ code: RQ_ITEM_CODE.PERSON_NAME, value: fullName }));
                dispatch(
                    setBaseProp({
                        code: RQ_ITEM_CODE.FULLNAME,
                        value: `Индивидуальный Предприниматель ${fullName}`,
                    }),
                );
                dispatch(setBaseProp({ code: RQ_ITEM_CODE.SHORTNAME, value: `ИП ${initials}` }));
            }
        }

        if (!CASE_CODES.includes(code)) return;
        const caseCode = `${code}_case`;
        dispatch(setCaseLoading({ code: caseCode }));
        try {
            const lower = value.toLocaleLowerCase();
            const casedValue =
                code === RQ_ITEM_CODE.BASED && (lower === 'устав' || lower === 'устава')
                    ? 'Устава'
                    : await helper.declineCase(
                          value,
                          code === RQ_ITEM_CODE.DIRECTOR_NAME ? 'person' : 'word',
                      );
            dispatch(setBaseProp({ code: caseCode, value: casedValue }));
        } catch (error) {
            console.warn('bx-rq: падеж не получен', error);
            dispatch(setBaseProp({ code: caseCode, value }));
        } finally {
            dispatch(setCaseLoading({ code: caseCode }));
        }
    };
