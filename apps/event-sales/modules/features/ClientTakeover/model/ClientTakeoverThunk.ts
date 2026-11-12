import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { buildFlowPayload } from '@/modules/processes/event/lib/build-flow-payload';
import { fetchTakeoverPreview } from '../lib/api/client-takeover-helper';
import { clientTakeoverActions } from './ClientTakeoverSlice';

/** Продолжить отправку после закрытия вопроса (ленивый импорт — цикл). */
const continueSend = async (dispatch: AppDispatch) => {
    const { send } = await import('@/modules/processes/event/model/SendThunk');
    dispatch(send());
};

/**
 * Шаг перед отправкой: что заберёт и закроет отчёт. Спрашивать нечего
 * (бэк ответил `ask: false`) или предпросмотр не дошёл — вопрос закрывается
 * сам, и отправка идёт без перехвата: бэк без явного «Забрать себе» чужое не
 * трогает, поэтому сбой здесь безопасен.
 */
export const openClientTakeover =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        dispatch(clientTakeoverActions.opened());
        try {
            const preview = await fetchTakeoverPreview(
                buildFlowPayload(getState()),
            );
            if (preview.ask) {
                dispatch(clientTakeoverActions.previewLoaded(preview));
                return;
            }
        } catch (error) {
            console.error('client takeover preview error', error);
        }
        dispatch(clientTakeoverActions.resolvedAndClosed(null));
        await continueSend(dispatch);
    };

/** Ответ менеджера: «Забрать себе» (true) или «Не забирать» (false). */
export const confirmClientTakeover =
    (take: boolean) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const wasPendingSend = getState().clientTakeover.pendingSend;
        dispatch(clientTakeoverActions.resolvedAndClosed(take));
        if (wasPendingSend) await continueSend(dispatch);
    };

/** Отмена: менеджер вернулся к форме, отправка не продолжается. */
export const closeClientTakeover = () => (dispatch: AppDispatch) => {
    dispatch(clientTakeoverActions.closed());
};
