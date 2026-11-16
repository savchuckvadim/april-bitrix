import { isAnyOf, type ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { saveOfferPdfManagerPrefs } from './OfferPdfPrefsThunk';
import { offerPdfActions } from './OfferPdfSlice';

/** Пауза перед записью выбора: перебор стилей и гамм не шлёт запрос на каждый клик */
const SAVE_DEBOUNCE_MS = 800;

/**
 * Менеджер сменил формат, стиль, гамму или настройки → это его последний
 * выбор (для новых сделок). Письмо и номер принадлежат сделке — не сюда.
 */
export function setupOfferPdfManagerPrefsListener(listenerMiddleware: ListenerMiddlewareInstance) {
    listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()({
        matcher: isAnyOf(
            offerPdfActions.setFormat,
            offerPdfActions.selectStyle,
            offerPdfActions.setPalette,
            offerPdfActions.setSettings,
        ),
        effect: async (_action, listenerApi) => {
            listenerApi.cancelActiveListeners();
            await listenerApi.delay(SAVE_DEBOUNCE_MS);
            await listenerApi.dispatch(saveOfferPdfManagerPrefs());
        },
    });
}
