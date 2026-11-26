import type { AppThunk } from '@/modules/app/model/store';
import { PresentationDealsHelper } from '../lib/api/presentation-deals-helper';
import { buildPresentationDealsQuery } from '../lib/presentation-deals.util';
import { offerDocumentActions } from './OfferDocumentSlice';

const helper = new PresentationDealsHelper();

/**
 * Сделки презентации текущей сделки: один запрос на сделку при входе на экран
 * КП. Нет сделки, слепок портала ещё не пришёл (экран вызовет thunk снова,
 * когда он придёт) или запрос уже был — ничего не делаем. Нет поля
 * `to_base_sales` или воронки `sales_presentation` на портале — презентаций
 * нет, вопрос не показывается. Сбой запроса вопрос тоже прячет, повторный
 * вход на экран пробует ещё раз.
 */
export const loadPresentationDeals = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const state = getState();
    const { dealId, bitrix } = state.app;
    const { status } = state.offerDocument.presentation;
    const portal = state.portal.current;
    if (!dealId || !portal || status === 'loading' || status === 'ready') return;

    const query = buildPresentationDealsQuery({
        portal,
        dealId,
        companyId: Number(bitrix.deal?.COMPANY_ID) || Number(bitrix.company?.ID) || null,
    });
    if (!query) {
        dispatch(offerDocumentActions.presentationLoaded([]));
        return;
    }

    dispatch(offerDocumentActions.presentationLoading());
    try {
        const items = await helper.list(query);
        // пока ждали ответ, в плейсменте открыли другую сделку: чужие презентации не нужны
        if (getState().app.dealId !== dealId) return;
        dispatch(offerDocumentActions.presentationLoaded(items));
    } catch (error) {
        console.warn('offer-document: сделки презентации не загружены', error);
        if (getState().app.dealId === dealId) dispatch(offerDocumentActions.presentationFailed());
    }
};
