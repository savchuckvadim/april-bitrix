import { Bitrix } from '@bitrix/index';
import type { IBXContact } from '@workspace/bitrix';
import type { AppThunk } from '@/modules/app/model/store';
import { SUPPLY_REPORT_DEAL_FIELDS, fetchContractForm, initDealDocumentFields } from '../../contract-document';
import { saveSnapshot } from '../../snapshot';
import { SupplyReportHelper } from '../lib/api/supply-report-helper';
import {
    buildInitSupplyRequest,
    buildSupplyFormRequest,
    buildSupplyReportGenerateRequest,
    supplyReportBlocker,
    supplyReportValidationErrors,
} from '../lib/build-supply-report-request';
import { fileToBase64, toSupplyContact } from '../lib/supply-contacts.util';
import { withSelectDefaults } from '../lib/supply-form.util';
import { buildSupplyRpaFilter, pickSupplyRpaId } from '../lib/supply-rpa.util';
import type { InitSupplyFile, SupplyFormItem } from './dto';
import { supplyReportActions } from './SupplyReportSlice';

const helper = new SupplyReportHelper();

const errorText = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

/**
 * Вход на экран отчёта: поля сделки по pbx-кодам, спецификация (её читает
 * отчёт), форма отчёта с бэка, контакты сделки и открытая заявка RPA.
 * Форма запрашивается один раз на сделку — менеджер её заполняет.
 */
export const initSupplyReport = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    dispatch(initDealDocumentFields(SUPPLY_REPORT_DEAL_FIELDS));
    const state = getState();
    const tasks: Promise<unknown>[] = [];
    if (state.contractDocument.formStatus === 'idle' || state.contractDocument.formStatus === 'error') {
        tasks.push(dispatch(fetchContractForm()));
    }
    if (state.supplyReport.formStatus === 'idle' || state.supplyReport.formStatus === 'error') {
        tasks.push(dispatch(fetchSupplyForm()));
    }
    if (!state.supplyReport.contacts.length) tasks.push(dispatch(fetchSupplyContacts()));
    if (state.supplyReport.rpaId === null) tasks.push(dispatch(findSupplyRpa()));
    await Promise.all(tasks);
};

export const fetchSupplyForm = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const request = buildSupplyFormRequest(getState());
    if (!request) {
        dispatch(supplyReportActions.formFailed('Нет главной строки: соберите комплект'));
        return;
    }
    dispatch(supplyReportActions.formLoading());
    try {
        const response = await helper.form(request);
        dispatch(supplyReportActions.formLoaded(withSelectDefaults(response.supply)));
    } catch (error) {
        dispatch(supplyReportActions.formFailed(errorText(error, 'форма отчёта не загружена')));
    }
};

/** Контакты сделки (CONTACT_IDS) — в отчёт и в заявку RPA. Ошибка — просто без контактов. */
export const fetchSupplyContacts = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const ids = (getState().app.bitrix.deal?.CONTACT_IDS ?? []).map(Number).filter(id => id > 0);
    if (!ids.length) return;
    try {
        const bitrix = Bitrix.getService();
        const contacts = await Promise.all(ids.map(id => bitrix.contact.get(id) as Promise<IBXContact | null>));
        dispatch(
            supplyReportActions.setContacts(
                contacts.flatMap(contact => (contact ? [toSupplyContact(contact)] : [])),
            ),
        );
    } catch (error) {
        console.warn('supply-report: контакты сделки не загружены', error);
    }
};

/**
 * Открытая заявка RPA «Поставка» этой сделки (легаси getRpaHelper): её
 * init-supply обновит, иначе создаст. Процесса на портале нет — пропускаем.
 */
export const findSupplyRpa = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const state = getState();
    const portal = state.portal.current;
    const dealId = state.app.dealId;
    if (!portal || !dealId) return;
    try {
        const bitrix = Bitrix.getService();
        const typeId = buildSupplyRpaFilter(portal, dealId, [])?.typeId;
        if (!typeId) return;
        const stages = await bitrix.rpaStage.listForType(typeId);
        const query = buildSupplyRpaFilter(portal, dealId, stages);
        if (!query) return;
        const response = (await bitrix.rpaItem.list({ typeId: query.typeId, filter: query.filter })) as
            | { items?: Array<{ id?: number | string }> }
            | null;
        dispatch(supplyReportActions.setRpaId(pickSupplyRpaId(response?.items ?? [])));
    } catch (error) {
        console.warn('supply-report: заявка RPA не найдена', error);
    }
};

export const setSupplyValue =
    (code: string, value: SupplyFormItem['value']): AppThunk<void> =>
    dispatch => {
        dispatch(supplyReportActions.setValue({ code, value }));
    };

/** Файл формы (договор / счёт) → base64 в состояние; null — снять файл. */
export const pickSupplyFile =
    (code: string, file: File | null): AppThunk<Promise<void>> =>
    async dispatch => {
        if (!file) {
            dispatch(supplyReportActions.setFile({ code, file: null }));
            return;
        }
        const base64 = await fileToBase64(file);
        dispatch(supplyReportActions.setFile({ code, file: { filename: file.name, base64 } }));
    };

/**
 * «Сформировать отчёт»: проверки → слепок → generate-document → при включённом
 * процессе init-supply (заявка RPA, файлы, таймлайн по участникам).
 */
export const generateSupplyReport = (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
    const state = getState();
    const blocker = supplyReportBlocker(state);
    if (blocker) {
        dispatch(supplyReportActions.generateFailed(blocker));
        return false;
    }
    const errors = supplyReportValidationErrors(state);
    if (errors.length) {
        dispatch(supplyReportActions.generateFailed(`Не заполнено: ${errors.join(', ')}`));
        return false;
    }
    const request = buildSupplyReportGenerateRequest(state);
    if (!request) {
        dispatch(supplyReportActions.generateFailed('Нет договора или поставки главной строки'));
        return false;
    }
    dispatch(supplyReportActions.generateStarted());
    try {
        await dispatch(saveSnapshot());
        const { result } = await helper.generate(request);
        let rpaId: number | null = null;
        if (state.supplyReport.needProcess) {
            const files: InitSupplyFile[] = Object.entries(state.supplyReport.files).map(([code, file]) => ({
                code,
                filename: file.filename,
                base64: file.base64,
            }));
            const initRequest = buildInitSupplyRequest(getState(), result.file, files);
            if (initRequest) {
                const response = await helper.initSupply(initRequest);
                rpaId = response.id_rpa;
            }
        }
        dispatch(supplyReportActions.generateDone({ link: result.link, rpaId }));
        return true;
    } catch (error) {
        dispatch(supplyReportActions.generateFailed(errorText(error, 'отчёт не сформирован')));
        return false;
    }
};
