import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { selectIsViewAs } from '@/modules/app/model/selectors';
import { resolveAiByTypeCallType } from '../lib/ai-call-types.data';
import type {
    AiDossierQuery,
    AiSettingsInput,
    AiSettingsSaveResult,
} from './index';
import { AI_QUEUED_SECTIONS, aiAnalyticsActions } from './ai-analytics-slice';
import {
    aiErrorMessage,
    aiHelper,
    selectAiRequester,
} from './ai-analytics-thunks.shared';
import {
    AI_QUEUED_ERROR_MESSAGES,
    clearQueuedTimer,
    loadQueuedSection,
    type AiQueuedLoadOptions,
} from './ai-analytics-queued.loader';
import { fetchAiTypesMatrix } from './ai-analytics-types-matrix.thunks';

/*
 * Тяжёлые ручки (очередь + WS): обзор, «Внимание», срез по типу, AI-резюме
 * периода (brief), досье, их возобновление/падение по WS, «Пересчитать» и
 * уровни менеджеров (сбрасывают кэш обзора). Общий загрузчик, периметр и
 * ключи секций — ai-analytics-queued.loader; синхронные —
 * ai-analytics-sync.thunks.
 */

export {
    AI_QUEUED_ERROR_MESSAGES,
    selectAiOverviewScope,
    type AiOverviewScope,
    type AiQueuedLoadOptions,
} from './ai-analytics-queued.loader';

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
 * WS сверяем с ключом queued-ответа (пакет фактов до данных прошлого
 * периода); ready повторного POST может нести другой requestKey —
 * принимаем любой: гарды смотрят на наш ключ периметра.
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
 * (attention/by-type/матрица типов при отсутствии обзора отвечают его
 * ключом; у резюме свой ключ по packHash).
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
            typesMatrix: fetchAiTypesMatrix,
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
 * «Пересчитать» (AI_VIEW_ALL): forceRefresh обзора, затем «Внимание»,
 * открытый срез по типу и матрица типов (если блоки уже открывались) —
 * они увидят идущий расчёт (processing) и дождутся WS done; повторной
 * джобы сервер не заводит.
 */
export const recalcAiOverview =
    () =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        await dispatch(fetchAiOverview({ force: true }));
        const tasks: Promise<void>[] = [
            dispatch(fetchAiAttention({ force: true })),
        ];
        const { byType, typesMatrix } = getState().aiAnalytics;
        if (byType.status !== 'idle') {
            tasks.push(dispatch(fetchAiByType({ force: true })));
        }
        if (typesMatrix.status !== 'idle') {
            tasks.push(dispatch(fetchAiTypesMatrix({ force: true })));
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
