import type { AppThunk } from '@/modules/app/model/store';
import { RqHelper } from '../../bx-rq';
import { initializeWordTemplates } from '../../offer-template-word';
import { saveSnapshot } from '../../snapshot';
import { OfferDocumentHelper } from '../lib/api/offer-document-helper';
import { buildOfferMultiGenerateRequest, offerRequestBlocker } from '../lib/build-offer-request';
import { resolveInvoiceDefaults, resolveRecipientDefaults } from '../lib/document-defaults.util';
import { offerDocumentActions } from './OfferDocumentSlice';
import type { OfferRecipientCaseField } from './types';

const helper = new OfferDocumentHelper();
const rqHelper = new RqHelper();

const errorText = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

/**
 * Падеж для КП («Уважаемому Иванову Ивану Ивановичу», «Генеральному
 * директору»): склоняет бэк (rq/case), фронт только спрашивает по blur.
 * Ошибка склонения — печатаем как есть, КП не блокируем.
 */
export const declineRecipientCase =
    (field: OfferRecipientCaseField): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const value = getState().offerDocument.recipient[field].trim();
        if (!value) {
            dispatch(offerDocumentActions.setRecipientCase({ field, value: '' }));
            return;
        }
        dispatch(offerDocumentActions.setCaseLoading({ field, loading: true }));
        try {
            const cased = await rqHelper.declineCase(value, field === 'name' ? 'person' : 'word');
            // пока ждали ответ, поле могли переписать — старый падеж не нужен
            if (getState().offerDocument.recipient[field].trim() !== value) return;
            dispatch(offerDocumentActions.setRecipientCase({ field, value: cased }));
        } catch (error) {
            console.warn('offer-document: падеж не получен', error);
            dispatch(offerDocumentActions.setRecipientCase({ field, value }));
        } finally {
            dispatch(offerDocumentActions.setCaseLoading({ field, loading: false }));
        }
    };

/**
 * Вход на экран КП: дефолты получателя и счёта из сделки/компании (один раз
 * на сделку), падежи, Word-шаблоны пользователя. Повторный вход ничего не
 * перетирает — менеджер мог уже править шапку.
 */
export const initOfferDocument = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const state = getState();
    void dispatch(initializeWordTemplates());
    if (state.offerDocument.initialized) return;

    const portal = state.portal.current;
    const input = {
        deal: state.app.bitrix.deal,
        company: state.app.bitrix.company,
        dealFields: portal?.bitrixDeal?.bitrixfields ?? null,
        companyFields: portal?.company?.bitrixfields ?? null,
    };
    dispatch(
        offerDocumentActions.setDefaults({
            recipient: resolveRecipientDefaults(input),
            invoice: resolveInvoiceDefaults(input),
        }),
    );
    await Promise.all([dispatch(declineRecipientCase('name')), dispatch(declineRecipientCase('position'))]);
};

/**
 * «Сформировать КП»: слепок сделки (чтобы шаблон и сборка пережили уход со
 * страницы) → generate-multi. В Битриксе ответ — operationId: документы
 * придут в сделку очередью, экран уводит в сделку. Вне Битрикса — ссылки.
 */
export const generateOfferDocument = (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
    const state = getState();
    const blocker = offerRequestBlocker(state);
    const request = blocker ? null : buildOfferMultiGenerateRequest(state);
    if (!request) {
        dispatch(offerDocumentActions.generateFailed(blocker ?? 'Нет договора или поставки главной строки'));
        return false;
    }
    dispatch(offerDocumentActions.generateStarted());
    try {
        await dispatch(saveSnapshot());
        const response = await helper.generate(request);
        const result = response.result;
        dispatch(
            offerDocumentActions.generateDone({
                operationId: response.operationId,
                links: result ? [...result.links, ...result.invoiceLinks] : [],
                warnings: result?.warnings ?? [],
            }),
        );
        return true;
    } catch (error) {
        dispatch(offerDocumentActions.generateFailed(errorText(error, 'КП не сформировано')));
        return false;
    }
};
