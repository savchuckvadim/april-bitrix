import type { AppThunk, RootState } from '@/modules/app/model/store';
import { OfferPdfPrefsHelper } from '../lib/api/offer-pdf-prefs-helper';
import { offerPdfStyleOf } from '../lib/offer-pdf-snapshot.util';
import { loadOfferPdfStyle, saveOfferPdfStyle } from '../lib/offer-pdf-storage';
import { offerPdfActions, selectOfferPdfOrigin, selectOfferPdfPrefs } from './OfferPdfSlice';

const helper = new OfferPdfPrefsHelper();

const ownerOf = (state: RootState): { domain: string; bxUserId: number } | null => {
    const { domain, bitrix } = state.app;
    const bxUserId = Number(bitrix.user?.ID);
    return domain && Number.isFinite(bxUserId) && bxUserId > 0 ? { domain, bxUserId } : null;
};

/**
 * Последний выбор менеджера при входе: сразу копия из браузера, затем сервер —
 * выбор могли сменить на другом компьютере. Слепок сделки и правку на экране
 * не перетирает (редьюсер applyManager).
 */
export const loadOfferPdfManagerPrefs = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const stored = loadOfferPdfStyle();
    if (stored) dispatch(offerPdfActions.applyManager(stored));

    const owner = ownerOf(getState());
    if (!owner) return;
    const saved = await helper.read(owner.domain, owner.bxUserId);
    // менеджер уже выбрал сам — его выбор новее ответа сервера
    if (!saved || selectOfferPdfOrigin(getState()) === 'user') return;
    saveOfferPdfStyle(saved);
    dispatch(offerPdfActions.applyManager(saved));
};

/**
 * Выбор на экране → последний выбор менеджера: браузер сразу, сервер следом.
 * Настройка не критична: сбой записи не откатывает выбор.
 */
export const saveOfferPdfManagerPrefs = (): AppThunk<Promise<void>> => async (_dispatch, getState) => {
    const state = getState();
    const style = offerPdfStyleOf(selectOfferPdfPrefs(state));
    saveOfferPdfStyle(style);
    const owner = ownerOf(state);
    if (!owner) return;
    try {
        await helper.write(owner.domain, owner.bxUserId, style);
    } catch (error) {
        console.warn('КП: выбор стиля не сохранён на сервере', error);
    }
};
