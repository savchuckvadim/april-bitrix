import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { selectIsViewAs } from '@/modules/app/model/selectors';
import { AI_FEEDBACK_OBJECT } from '../lib/ai-pulse.data';
import { aiFeedbackKey } from '../lib/ai-feedback.util';
import type { AiFeedbackInput } from './index';
import { aiAnalyticsActions } from './ai-analytics-slice';
import { fetchAiAgenda } from './ai-analytics-sync.thunks';
import {
    aiErrorMessage,
    aiHelper,
    selectAiRequester,
} from './ai-analytics-thunks.shared';

/*
 * Реакции на витрину (feedback): «полезно / не полезно», «не согласен»,
 * «отработано» и view-телеметрия. Ключ в сторе — канал вида + объект
 * (lib/ai-feedback.util aiFeedbackKey). В режиме «Смотреть как…» ничего
 * не пишем: реакция ушла бы от имени просматриваемого. После «не согласен»
 * перечитываем загруженную повестку — в ней блок несогласий.
 */

export const AI_FEEDBACK_SAVE_ERROR = 'Реакция не записана';

/**
 * Реакция на витрину; true — записана. false без запроса: режим
 * «Смотреть как…», нет requester или та же реакция уже в пути. Ошибка
 * сервера (403/400) — текст в feedback.errors по ключу реакции.
 */
export const sendAiFeedback =
    (feedback: AiFeedbackInput) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<boolean> => {
        const state = getState();
        if (selectIsViewAs(state)) return false;
        const requester = selectAiRequester(state);
        if (!requester) return false;
        const { object, kind } = feedback;
        const key = aiFeedbackKey(kind, object);
        if (state.aiAnalytics.feedback.pending.includes(key)) return false;

        dispatch(aiAnalyticsActions.feedbackSending({ kind, object }));
        try {
            const response = await aiHelper.addFeedback(requester, feedback);
            if (response.status !== 'ready') {
                throw new Error(response.message || AI_FEEDBACK_SAVE_ERROR);
            }
            dispatch(aiAnalyticsActions.feedbackSent({ kind, object }));
            if (kind === 'alert_handled' && feedback.transcriptionId) {
                dispatch(
                    aiAnalyticsActions.alertHandled(feedback.transcriptionId),
                );
            }
            if (
                kind === 'disagree' &&
                getState().aiAnalytics.agenda.status !== 'idle'
            ) {
                // Не ждём: реакция уже записана, повестка догрузится сама.
                void dispatch(fetchAiAgenda(true));
            }
            return true;
        } catch (error) {
            dispatch(
                aiAnalyticsActions.feedbackFailed({
                    kind,
                    object,
                    error: aiErrorMessage(error, AI_FEEDBACK_SAVE_ERROR),
                }),
            );
            return false;
        }
    };

/**
 * Телеметрия «открыл витрину» — один раз за сессию на объект; true —
 * записана. В режиме «Смотреть как…» не шлём и объект не помечаем:
 * после выхода из режима view уйдёт уже от реального пользователя.
 */
export const sendAiView =
    (object: string = AI_FEEDBACK_OBJECT.PULSE) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<boolean> => {
        const state = getState();
        if (selectIsViewAs(state)) return false;
        if (state.aiAnalytics.feedback.viewed.includes(object)) return false;
        dispatch(aiAnalyticsActions.markViewed(object));
        return await dispatch(sendAiFeedback({ kind: 'view', object }));
    };
