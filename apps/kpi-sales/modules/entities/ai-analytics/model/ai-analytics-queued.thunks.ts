import type {
    AppDispatch,
    AppGetState,
    RootState,
} from '@/modules/app/model/store';
import { getWSClient } from '@/modules/app/model/ws-client';
import { selectIsViewAs } from '@/modules/app/model/selectors';
import type { AiRequester } from '../lib/api/ai-analytics-helper';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import { clampAiPeriod } from '../lib/ai-period.util';
import { resolveAiByTypeCallType } from '../lib/ai-call-types.data';
import type {
    AiDossierQuery,
    AiEnvelope,
    AiOverviewFilters,
    AiQueueOptions,
    AiSettingsInput,
    AiSettingsSaveResult,
} from './index';
import {
    AI_QUEUED_SECTIONS,
    aiAnalyticsActions,
    type AiQueuedSection,
    type AiSectionData,
} from './ai-analytics-slice';
import {
    AI_QUEUED_MAX_ATTEMPTS,
    AI_QUEUED_TIMEOUT_MS,
    AI_TIMEOUT_MESSAGE,
    aiErrorMessage,
    aiHelper,
    selectAiRequester,
} from './ai-analytics-thunks.shared';

/*
 * Тяжёлые ручки (очередь + WS): обзор, «Внимание», срез по типу, AI-резюме
 * периода (brief), их возобновление/падение по WS, «Пересчитать» и уровни
 * менеджеров (сбрасывают кэш обзора). Синхронные — ai-analytics-sync.thunks.
 */

/** Id WS-соединения; до инициализации клиента — без подписки (придёт по таймауту). */
const safeSocketId = (): string | undefined => {
    try {
        return getWSClient().socket.id;
    } catch {
        return undefined;
    }
};

/** Текст ошибки секции, когда сервер причины не назвал. */
export const AI_QUEUED_ERROR_MESSAGES: Record<AiQueuedSection, string> = {
    overview: 'Ошибка расчёта обзора',
    attention: 'Ошибка расчёта обзора',
    byType: 'Ошибка расчёта обзора',
    brief: 'Ошибка сборки резюме',
    dossier: 'Ошибка сборки досье',
};

/** Периметр тяжёлых ручек: requester + период фильтра (≤ 3 мес.) + выбранные менеджеры. */
export interface AiOverviewScope {
    requester: AiRequester;
    filters: AiOverviewFilters;
    /** Начало периода подтянуто к лимиту бэка — показать подсказку. */
    clamped: boolean;
}

export const selectAiOverviewScope = (
    state: RootState,
): AiOverviewScope | null => {
    const requester = selectAiRequester(state);
    if (!requester) return null;
    const period = clampAiPeriod(state.report.date.from, state.report.date.to);
    if (!period) return null;
    const managerIds = state.department.current
        .map(user => Number(user.ID))
        .filter(Boolean);
    return {
        requester,
        filters: {
            from: period.from,
            to: period.to,
            managerIds: managerIds.length ? managerIds : undefined,
        },
        clamped: period.clamped,
    };
};

export interface AiQueuedLoadOptions {
    /** «Пересчитать»: forceRefresh — сервер обходит кэш и error-конверт. */
    force?: boolean;
    /**
     * Повторный POST по тому же requestKey (WS done или таймаут) — не
     * сбрасывает секцию в pending и не форсит пересчёт.
     */
    resume?: boolean;
}

type QueuedFetcher<S extends AiQueuedSection> = (
    scope: AiOverviewScope,
    options: AiQueueOptions,
    /** Стор в момент POST (срез по типу берёт отсюда тип и раскладку). */
    state: RootState,
) => Promise<AiEnvelope<AiSectionData[S]>>;

/** Таймеры «WS не пришёл» по секциям; новый запрос секции гасит старый. */
const queuedTimers = new Map<AiQueuedSection, ReturnType<typeof setTimeout>>();

const clearQueuedTimer = (section: AiQueuedSection): void => {
    const timer = queuedTimers.get(section);
    if (timer) clearTimeout(timer);
    queuedTimers.delete(section);
};

/**
 * Ключ секции: overview/attention — периметр; byType — плюс тип и
 * раскладка; dossier — requester, менеджер и окно (период фильтра на
 * досье не влияет).
 */
const queuedRequestKey = (
    section: AiQueuedSection,
    scope: AiOverviewScope,
    state: RootState,
): string =>
    section === 'dossier'
        ? buildAiRequestKey({
              ...scope.requester,
              extra: [
                  'dossier',
                  state.aiAnalytics.dossierQuery?.managerId,
                  state.aiAnalytics.dossierQuery?.months,
              ],
          })
        : buildAiRequestKey({
        ...scope.requester,
        ...scope.filters,
        ...(section === 'byType'
            ? {
                  callType: resolveAiByTypeCallType(
                      state.aiAnalytics.selectedCallType,
                  ),
                  layout: state.aiAnalytics.typesLayout,
              }
            : {}),
    });

/**
 * Загрузчик тяжёлой секции. ready — данные; queued/processing — секция
 * остаётся в loading с серверным ключом и ждёт WS ai-analytics:overview:done
 * (listener повторяет POST) либо таймаут 90 с (повтор POST, не больше
 * AI_QUEUED_MAX_ATTEMPTS раз); error — ошибка. Гард: тот же ключ уже
 * грузится (без resume) или готов (без force) — второй POST не шлём.
 */
const loadQueuedSection =
    <S extends AiQueuedSection>(
        section: S,
        fetcher: QueuedFetcher<S>,
        options: AiQueuedLoadOptions = {},
    ) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        const state = getState();
        const scope = selectAiOverviewScope(state);
        if (!scope) return;

        const requestKey = queuedRequestKey(section, scope, state);
        const current = state.aiAnalytics[section];
        const same = current.requestKey === requestKey;
        if (options.resume) {
            // Возобновлять нечего: ключ сменился или секция уже не грузится.
            if (!same || current.status !== 'loading') return;
        } else if (same && !options.force) {
            if (current.status === 'loading' || current.status === 'ready')
                return;
        }

        clearQueuedTimer(section);
        if (!options.resume) {
            dispatch(
                aiAnalyticsActions.sectionPending({ section, requestKey }),
            );
        }
        try {
            const response = await fetcher(
                scope,
                {
                    socketId: safeSocketId(),
                    forceRefresh: !!options.force && !options.resume,
                },
                state,
            );
            // Пока ждали ответ, фильтр мог смениться — редьюсер отбросит,
            // но таймер под чужой ключ ставить не нужно.
            if (getState().aiAnalytics[section].requestKey !== requestKey)
                return;

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
                throw new Error(
                    response.message || AI_QUEUED_ERROR_MESSAGES[section],
                );
            }
            if (
                getState().aiAnalytics[section].queuedAttempts >=
                AI_QUEUED_MAX_ATTEMPTS
            ) {
                throw new Error(AI_TIMEOUT_MESSAGE);
            }
            dispatch(
                aiAnalyticsActions.sectionQueued({
                    section,
                    requestKey,
                    serverKey: response.requestKey,
                    jobStatus: response.status,
                }),
            );
            queuedTimers.set(
                section,
                setTimeout(() => {
                    queuedTimers.delete(section);
                    dispatch(
                        loadQueuedSection(section, fetcher, { resume: true }),
                    );
                }, AI_QUEUED_TIMEOUT_MS),
            );
        } catch (error) {
            dispatch(
                aiAnalyticsActions.sectionFailed({
                    section,
                    requestKey,
                    error: aiErrorMessage(
                        error,
                        AI_QUEUED_ERROR_MESSAGES[section],
                    ),
                }),
            );
        }
    };

/** Обзор менеджер × тип за период глобального фильтра. */
export const fetchAiOverview = (options: AiQueuedLoadOptions = {}) =>
    loadQueuedSection(
        'overview',
        (scope, queue) =>
            aiHelper.getOverview(scope.requester, scope.filters, queue),
        options,
    );

/** Карточки «Внимание» (те же фильтры; без обзора — ждём его расчёт). */
export const fetchAiAttention = (options: AiQueuedLoadOptions = {}) =>
    loadQueuedSection(
        'attention',
        (scope, queue) =>
            aiHelper.getAttention(scope.requester, scope.filters, queue),
        options,
    );

/** Срез по выбранному типу звонка / возражениям в текущей раскладке. */
export const fetchAiByType = (options: AiQueuedLoadOptions = {}) =>
    loadQueuedSection(
        'byType',
        (scope, queue, state) =>
            aiHelper.getByType(
                scope.requester,
                scope.filters,
                resolveAiByTypeCallType(state.aiAnalytics.selectedCallType),
                state.aiAnalytics.typesLayout,
                queue,
            ),
        options,
    );

/**
 * AI-резюме периода в периметре обзора (те же период и менеджеры).
 * queued/processing → ждём WS ai-analytics:brief:done с requestKey и
 * повторяем POST; `source = template` и `reason` приходят в data как есть.
 * { force: true } — forceRefresh пересобирает резюме.
 */
export const fetchAiBrief = (options: AiQueuedLoadOptions = {}) =>
    loadQueuedSection(
        'brief',
        (scope, queue) =>
            aiHelper.getBrief(scope.requester, scope.filters, queue),
        options,
    );

/** Загрузчик досье по запомненному запросу (resume по WS без повторного dossierQueried). */
const loadDossierSection = (options: AiQueuedLoadOptions = {}) =>
    loadQueuedSection(
        'dossier',
        (scope, queue, state) => {
            const query = state.aiAnalytics.dossierQuery;
            if (!query) throw new Error('Досье: менеджер не выбран');
            return aiHelper.getDossier(scope.requester, query, queue);
        },
        options,
    );

/**
 * Досье менеджера за окно месяцев (Фаза 3, П4): очередь + WS
 * ai-analytics:dossier:done; ключ — менеджер и окно. { force: true } —
 * собрать заново, минуя кэш.
 */
export const fetchAiDossier =
    (query: AiDossierQuery, options: AiQueuedLoadOptions = {}) =>
    async (dispatch: AppDispatch): Promise<void> => {
        dispatch(aiAnalyticsActions.dossierQueried(query));
        await dispatch(loadDossierSection(options));
    };

/**
 * WS ai-analytics:overview:done / brief:done — результат в кэше сервера:
 * повторяем POST у всех тяжёлых секций, которые ждали этот ключ
 * (attention/by-type при отсутствии обзора отвечают его ключом; у резюме
 * свой ключ по packHash).
 */
export const resumeAiQueuedSections =
    (serverKey?: string) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        const ai = getState().aiAnalytics;
        const resumers = {
            overview: fetchAiOverview,
            attention: fetchAiAttention,
            byType: fetchAiByType,
            brief: fetchAiBrief,
            dossier: loadDossierSection,
        } as const;
        await Promise.all(
            AI_QUEUED_SECTIONS.filter(section => {
                const current = ai[section];
                return (
                    current.status === 'loading' &&
                    current.jobStatus !== null &&
                    (!serverKey || current.serverKey === serverKey)
                );
            }).map(section => dispatch(resumers[section]({ resume: true }))),
        );
    };

/** WS ai-analytics:overview:error / brief:error — расчёт упал: секции с этим ключом в ошибку. */
export const failAiQueuedSections =
    (payload: { requestKey?: string; message?: string }) =>
    (dispatch: AppDispatch, getState: AppGetState): void => {
        const ai = getState().aiAnalytics;
        for (const section of AI_QUEUED_SECTIONS) {
            const current = ai[section];
            if (
                current.status === 'loading' &&
                current.requestKey &&
                (!payload.requestKey ||
                    current.serverKey === payload.requestKey)
            ) {
                clearQueuedTimer(section);
                dispatch(
                    aiAnalyticsActions.sectionFailed({
                        section,
                        requestKey: current.requestKey,
                        error:
                            payload.message ||
                            AI_QUEUED_ERROR_MESSAGES[section],
                    }),
                );
            }
        }
    };

/**
 * «Пересчитать» (AI_VIEW_ALL): forceRefresh обзора, затем «Внимание» и
 * открытый срез по типу — они увидят идущий расчёт (processing) и
 * дождутся WS done; повторной джобы сервер не заводит.
 */
export const recalcAiOverview =
    () =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        await dispatch(fetchAiOverview({ force: true }));
        const tasks: Promise<void>[] = [
            dispatch(fetchAiAttention({ force: true })),
        ];
        if (getState().aiAnalytics.byType.status !== 'idle') {
            tasks.push(dispatch(fetchAiByType({ force: true })));
        }
        await Promise.all(tasks);
    };

export const AI_SETTINGS_SAVE_ERROR = 'Настройки не сохранены';

/** saveAiLevels в режиме «Смотреть как…»: запись заблокирована гардом. */
export const AI_SETTINGS_VIEW_AS_ERROR =
    'В режиме «Смотреть как…» настройки не сохраняются: выйдите из режима и сохраните от своего имени.';

/**
 * Настройки витрины → settings/save: уровни, цели по уровням, отсутствия,
 * подтверждение состава и прочие блоки DTO. В payload — только блоки,
 * которые менялись: не переданный блок сервер не трогает. Имя историческое
 * (первым блоком были уровни); состояние — `levels` слайса. Возвращает
 * итог сервера (comparableFrom, breaksSeries, warnings) либо null — текст
 * ошибки в `levels.error`. В режиме «Смотреть как…» — null без запроса
 * (AI_SETTINGS_VIEW_AS_ERROR). После успеха listener перечитывает обзор.
 */
export const saveAiLevels =
    (input: AiSettingsInput) =>
    async (
        dispatch: AppDispatch,
        getState: AppGetState,
    ): Promise<AiSettingsSaveResult | null> => {
        // «Смотреть как…»: настройки ушли бы от имени просматриваемого —
        // запроса нет, в диалоге понятная причина вместо молчания.
        if (selectIsViewAs(getState())) {
            dispatch(
                aiAnalyticsActions.levelsFailed(AI_SETTINGS_VIEW_AS_ERROR),
            );
            return null;
        }
        const requester = selectAiRequester(getState());
        if (!requester || getState().aiAnalytics.levels.saving) return null;

        dispatch(aiAnalyticsActions.levelsSaving());
        try {
            const response = await aiHelper.saveSettings(requester, input);
            if (response.status !== 'ready' || !response.data) {
                throw new Error(response.message || AI_SETTINGS_SAVE_ERROR);
            }
            dispatch(aiAnalyticsActions.levelsSaved(response.data.savedAt));
            return response.data;
        } catch (error) {
            dispatch(
                aiAnalyticsActions.levelsFailed(
                    aiErrorMessage(error, AI_SETTINGS_SAVE_ERROR),
                ),
            );
            return null;
        }
    };
