import { getCrmUrl } from '@workspace/bitrix';
import { IS_PROD } from '../consts/app-global';
import { appActions } from './AppSlice';
import type { AppThunk } from './store';

/**
 * Документ → сделка: экран загрузки на всё время генерации, повторное
 * нажатие ничего не запускает. В Битриксе после успеха уводим окно в
 * сделку — экран остаётся до ухода страницы; вне Битрикса или при ошибке
 * снимаем его, и менеджер видит результат на экране.
 */
export const runDocumentToDeal =
    (message: string, task: () => Promise<boolean>): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        if (getState().app.busy) return false;
        dispatch(appActions.setBusy(message));
        let ok = false;
        try {
            ok = await task();
        } finally {
            const { domain, dealId } = getState().app;
            const url = ok && IS_PROD ? getCrmUrl(domain, 'deal', dealId) : null;
            if (url) {
                dispatch(appActions.setBusy('Открываю сделку…'));
                (window.top ?? window).location.replace(url);
            } else {
                dispatch(appActions.setBusy(null));
            }
        }
        return ok;
    };
