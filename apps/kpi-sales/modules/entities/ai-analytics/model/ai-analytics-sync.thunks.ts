import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import type { AiRequester } from '../lib/api/ai-analytics-helper';
import {
    buildAiRequestKey,
    type AiRequestKeyPart,
} from '../lib/ai-request-key.util';
import type {
    AiCacheResetScope,
    AiDailyPlanQuery,
    AiPlanFactQuery,
    AiEnvelope,
    AiStyleQuery,
} from './index';
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
 * Синхронные ручки: настройки, пульс, повестка (опрос при queued), план
 * дня и карточка стиля (ключ с параметрами), «Обновить». Реакции —
 * ai-analytics-feedback.thunks (они сами зовут fetchAiAgenda — поэтому
 * отсюда их не реэкспортируем, иначе импорт замкнулся бы в цикл).
 * Тяжёлые (очередь + WS) — ai-analytics-queued.thunks; слепая оценка —
 * ai-analytics-rop-mark.thunks; «Как считаем» — ai-analytics-about.thunks.
 */

export type SyncSection =
    | 'settings'
    | 'pulse'
    | 'agenda'
    | 'dailyPlan'
    | 'ropMark'
    | 'style'
    | 'planFact'
    | 'forecast';

export interface SyncLoadOptions {
    /** Повторить запрос, даже если секция с тем же ключом уже готова. */
    force?: boolean;
    /** Параметры секции в ключе запроса (менеджер, дата, неделя…). */
    extra?: readonly AiRequestKeyPart[];
}

const sleep = (ms: number) =>
    new Promise<void>(resolve => setTimeout(resolve, ms));

/** Текст ошибки секции без сообщения сервера. */
export const AI_SYNC_ERROR_MESSAGE = 'Ошибка AI-аналитики';

/**
 * Общий загрузчик синхронной секции: ключ запроса (requester + extra) →
 * гард дублей (тот же ключ уже грузится или готов) → pending → конверт.
 * ready — данные; queued/processing — опрос той же ручки до готовности
 * или таймаута; error — ошибка. HTTP 403/400 не падают — текст сервера
 * уходит в секцию. Ответы с устаревшим ключом отбрасывает редьюсер.
 */
export const loadSection =
    <S extends SyncSection>(
        section: S,
        fetcher: (
            requester: AiRequester,
        ) => Promise<AiEnvelope<AiSectionData[S]>>,
        options: SyncLoadOptions = {},
    ) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        const requester = selectAiRequester(getState());
        if (!requester) return;

        const requestKey = buildAiRequestKey({
            ...requester,
            extra: options.extra,
        });
        const current = getState().aiAnalytics[section];
        if (current.requestKey === requestKey) {
            if (current.status === 'loading') return;
            if (current.status === 'ready' && !options.force) return;
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
                    throw new Error(response.message || AI_SYNC_ERROR_MESSAGE);
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
                    error: aiErrorMessage(error, AI_SYNC_ERROR_MESSAGE),
                }),
            );
        }
    };

/** Настройки и готовность (флаги портала, readiness, типы звонков). */
export const fetchAiSettings = (force = false) =>
    loadSection('settings', requester => aiHelper.getSettings(requester), {
        force,
    });

/** Пульс дисциплины «следующий шаг с датой» (окно 5 рабочих дней). */
export const fetchAiPulse = (force = false) =>
    loadSection('pulse', requester => aiHelper.getPulse(requester), { force });

/** Повестка планёрки: звонки прошлой полной ISO-недели и несогласия с её понедельника (weekKey — текущая неделя). */
export const fetchAiAgenda = (force = false) =>
    loadSection('agenda', requester => aiHelper.getAgenda(requester), {
        force,
    });

/* ---------- План дня и карточка стиля (Фаза 2) ---------- */

/** Текст секции, когда план дня выключен настройкой портала (без запроса). */
export const AI_DAILY_PLAN_DISABLED_MESSAGE =
    'План дня выключен на портале — чтобы включить, попросите разработчика';

/**
 * План дня менеджера от цели месяца. Без даты — сегодня в TZ портала.
 * Гейт settings.data.dailyPlanEnabled: при явном false запрос не шлём,
 * секция сразу в error с подсказкой; сервер при выключенной настройке
 * отвечает 403 — его текст тоже ложится в error.
 */
export const fetchAiDailyPlan =
    (query: AiDailyPlanQuery, force = false) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        dispatch(aiAnalyticsActions.dailyPlanQueried(query));
        const extra = ['plan', query.managerId, query.date];
        if (getState().aiAnalytics.settings.data?.dailyPlanEnabled === false) {
            const requester = selectAiRequester(getState());
            if (!requester) return;
            const requestKey = buildAiRequestKey({ ...requester, extra });
            dispatch(
                aiAnalyticsActions.sectionPending({
                    section: 'dailyPlan',
                    requestKey,
                }),
            );
            dispatch(
                aiAnalyticsActions.sectionFailed({
                    section: 'dailyPlan',
                    requestKey,
                    error: AI_DAILY_PLAN_DISABLED_MESSAGE,
                }),
            );
            return;
        }
        await dispatch(
            loadSection(
                'dailyPlan',
                requester => aiHelper.getDailyPlan(requester, query),
                { force, extra },
            ),
        );
    };

/**
 * Реконсиляция «план — факт» месяца (Фаза 3, П2): цели руководителя из
 * снимка против факта на дату. Ключ — месяц и менеджеры; сервер сам
 * отсекает чужих и при выключенном плане дня отдаёт строки без «в день
 * надо» (перечень причин — в data.reasons).
 */
export const fetchAiPlanFact =
    (query: AiPlanFactQuery, force = false) =>
    async (dispatch: AppDispatch): Promise<void> => {
        dispatch(aiAnalyticsActions.planFactQueried(query));
        await dispatch(
            loadSection(
                'planFact',
                requester => aiHelper.getPlanFact(requester, query),
                {
                    force,
                    extra: [
                        'plan-fact',
                        query.monthKey,
                        ...(query.managerIds ?? []),
                    ],
                },
            ),
        );
    };

/**
 * Карточка стиля менеджера за месячное окно (без месяца — последний
 * профиль). Состояние карточки (ready | few_data | opt_out) — в data;
 * 403 (менеджер вне периметра) — текст сервера в error.
 */
export const fetchAiStyleProfile =
    (query: AiStyleQuery, force = false) =>
    async (dispatch: AppDispatch): Promise<void> => {
        dispatch(aiAnalyticsActions.styleQueried(query));
        await dispatch(
            loadSection(
                'style',
                requester => aiHelper.getStyleProfile(requester, query),
                { force, extra: ['style', query.managerId, query.month] },
            ),
        );
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
