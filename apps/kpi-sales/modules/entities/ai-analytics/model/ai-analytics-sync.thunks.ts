import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import type { AiRequester } from '../lib/api/ai-analytics-helper';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import { AI_FEEDBACK_OBJECT } from '../lib/ai-pulse.data';
import type { AiCacheResetScope, AiEnvelope, AiFeedbackInput } from './index';
import { aiAnalyticsActions, type AiSectionData } from './ai-analytics-slice';
import {
    AI_POLL_INTERVAL_MS,
    AI_QUEUED_TIMEOUT_MS,
    AI_TIMEOUT_MESSAGE,
    aiErrorMessage,
    aiHelper,
    selectAiRequester,
} from './ai-analytics-thunks.shared';

/*
 * Синхронные ручки: настройки, пульс, повестка (опрос при queued),
 * реакции и «Обновить». Тяжёлые (очередь + WS) — ai-analytics-queued.thunks.
 */

type SyncSection = 'settings' | 'pulse' | 'agenda';

const sleep = (ms: number) =>
    new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Общий загрузчик синхронной секции: ключ запроса → гард дублей (тот же
 * ключ уже грузится или готов) → pending → конверт. ready — данные;
 * queued/processing — опрос той же ручки до готовности или таймаута;
 * error — ошибка. Ответы с устаревшим ключом отбрасывает редьюсер.
 */
const loadSection =
    <S extends SyncSection>(
        section: S,
        fetcher: (
            requester: AiRequester,
        ) => Promise<AiEnvelope<AiSectionData[S]>>,
        force = false,
    ) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        const requester = selectAiRequester(getState());
        if (!requester) return;

        const requestKey = buildAiRequestKey(requester);
        const current = getState().aiAnalytics[section];
        if (current.requestKey === requestKey) {
            if (current.status === 'loading') return;
            if (current.status === 'ready' && !force) return;
        }

        dispatch(aiAnalyticsActions.sectionPending({ section, requestKey }));
        const startedAt = Date.now();
        try {
            for (;;) {
                const response = await fetcher(requester);
                if (response.status === 'ready') {
                    if (!response.data) throw new Error('Пустой ответ сервера');
                    dispatch(
                        aiAnalyticsActions.sectionReady({
                            section,
                            data: response.data,
                            requestKey,
                            serverKey: response.requestKey,
                        }),
                    );
                    return;
                }
                if (response.status === 'error') {
                    throw new Error(response.message || 'Ошибка AI-аналитики');
                }
                // queued | processing — результат появится в кэше сервера.
                if (Date.now() - startedAt >= AI_QUEUED_TIMEOUT_MS) {
                    throw new Error(AI_TIMEOUT_MESSAGE);
                }
                await sleep(AI_POLL_INTERVAL_MS);
                // За время ожидания запрос мог стать неактуальным.
                if (getState().aiAnalytics[section].requestKey !== requestKey) {
                    return;
                }
            }
        } catch (error) {
            dispatch(
                aiAnalyticsActions.sectionFailed({
                    section,
                    requestKey,
                    error: aiErrorMessage(error, 'Ошибка AI-аналитики'),
                }),
            );
        }
    };

/** Настройки и готовность (флаги портала, readiness, типы звонков). */
export const fetchAiSettings = (force = false) =>
    loadSection(
        'settings',
        requester => aiHelper.getSettings(requester),
        force,
    );

/** Пульс дисциплины «следующий шаг с датой» (окно 5 рабочих дней). */
export const fetchAiPulse = (force = false) =>
    loadSection('pulse', requester => aiHelper.getPulse(requester), force);

/** Повестка РОПа на текущую ISO-неделю. */
export const fetchAiAgenda = (force = false) =>
    loadSection('agenda', requester => aiHelper.getAgenda(requester), force);

/* ---------- Реакции ---------- */

/** Реакция на витрину; true — записана. */
export const sendAiFeedback =
    (feedback: AiFeedbackInput) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<boolean> => {
        const requester = selectAiRequester(getState());
        if (!requester) return false;
        const { object, kind } = feedback;
        if (getState().aiAnalytics.feedback.pending.includes(object)) {
            return false;
        }

        dispatch(aiAnalyticsActions.feedbackSending(object));
        try {
            const response = await aiHelper.addFeedback(requester, feedback);
            if (response.status !== 'ready') {
                throw new Error(response.message || 'Реакция не записана');
            }
            dispatch(aiAnalyticsActions.feedbackSent({ object, kind }));
            if (kind === 'alert_handled' && feedback.transcriptionId) {
                dispatch(
                    aiAnalyticsActions.alertHandled(feedback.transcriptionId),
                );
            }
            return true;
        } catch (error) {
            dispatch(
                aiAnalyticsActions.feedbackFailed({
                    object,
                    error: aiErrorMessage(error, 'Реакция не записана'),
                }),
            );
            return false;
        }
    };

/** Телеметрия «открыл витрину» — один раз за сессию на объект. */
export const sendAiView =
    (object: string = AI_FEEDBACK_OBJECT.PULSE) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        if (getState().aiAnalytics.feedback.viewed.includes(object)) return;
        dispatch(aiAnalyticsActions.markViewed(object));
        await dispatch(sendAiFeedback({ kind: 'view', object }));
    };

/**
 * «Обновить»: сброс серверного кэша (только руководители cup|op — отказ
 * сервера глотаем, тогда придёт кэш) и принудительная перечитка пульса
 * и повестки.
 */
export const refreshAiAnalytics =
    (scopes: AiCacheResetScope[] = ['pulse', 'agenda']) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        const requester = selectAiRequester(getState());
        if (!requester) return;
        await Promise.all(
            scopes.map(scope =>
                aiHelper.resetCache(requester, scope).catch(() => undefined),
            ),
        );
        await Promise.all([
            dispatch(fetchAiPulse(true)),
            dispatch(fetchAiAgenda(true)),
        ]);
    };
