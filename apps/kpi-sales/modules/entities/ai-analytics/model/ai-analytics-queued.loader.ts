import type {
    AppDispatch,
    AppGetState,
    RootState,
} from '@/modules/app/model/store';
import { getWSClient } from '@/modules/app/model/ws-client';
import type { AiRequester } from '../lib/api/ai-analytics-helper';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import { clampAiPeriod } from '../lib/ai-period.util';
import { resolveAiByTypeCallType } from '../lib/ai-call-types.data';
import type { AiEnvelope, AiOverviewFilters, AiQueueOptions } from './index';
import {
    aiAnalyticsActions,
    type AiQueuedSection,
    type AiSectionData,
} from './ai-analytics-slice';
import {
    AI_QUEUED_MAX_ATTEMPTS,
    AI_QUEUED_TIMEOUT_MS,
    AI_TIMEOUT_MESSAGE,
    aiErrorMessage,
    selectAiRequester,
} from './ai-analytics-thunks.shared';

/*
 * Общий загрузчик тяжёлых секций (очередь + WS): периметр обзора, ключ
 * секции, гард дублей, таймер «WS не пришёл». Конкретные thunks —
 * ai-analytics-queued.thunks (обзор, «Внимание», срез по типу, резюме,
 * досье) и ai-analytics-types-matrix.thunks (матрица типов).
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
    brief: 'Не удалось собрать итоги периода',
    dossier: 'Ошибка сборки досье',
    typesMatrix: 'Ошибка среза по типам',
};

/** Маркер ключа матрицы типов (extra после `#`): отличает её от ключа обзора. */
export const AI_TYPES_MATRIX_KEY_PART = 'types-matrix';

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

export type QueuedFetcher<S extends AiQueuedSection> = (
    scope: AiOverviewScope,
    options: AiQueueOptions,
    /** Стор в момент POST (срез по типу берёт отсюда тип и раскладку). */
    state: RootState,
) => Promise<AiEnvelope<AiSectionData[S]>>;

/** Таймеры «WS не пришёл» по секциям; новый запрос секции гасит старый. */
const queuedTimers = new Map<AiQueuedSection, ReturnType<typeof setTimeout>>();

export const clearQueuedTimer = (section: AiQueuedSection): void => {
    const timer = queuedTimers.get(section);
    if (timer) clearTimeout(timer);
    queuedTimers.delete(section);
};

/**
 * Ключ секции: overview/attention/brief — периметр; byType — плюс тип и
 * раскладка; typesMatrix — периметр плюс маркер (срез фиксирован: все
 * типы, широкая раскладка — от выбора подвкладки не зависит); dossier —
 * requester, менеджер и окно (период фильтра на досье не влияет).
 */
const queuedRequestKey = (
    section: AiQueuedSection,
    scope: AiOverviewScope,
    state: RootState,
): string => {
    switch (section) {
        case 'dossier':
            return buildAiRequestKey({
                ...scope.requester,
                extra: [
                    'dossier',
                    state.aiAnalytics.dossierQuery?.managerId,
                    state.aiAnalytics.dossierQuery?.months,
                ],
            });
        case 'byType':
            return buildAiRequestKey({
                ...scope.requester,
                ...scope.filters,
                callType: resolveAiByTypeCallType(
                    state.aiAnalytics.selectedCallType,
                ),
                layout: state.aiAnalytics.typesLayout,
            });
        case 'typesMatrix':
            return buildAiRequestKey({
                ...scope.requester,
                ...scope.filters,
                extra: [AI_TYPES_MATRIX_KEY_PART],
            });
        default:
            return buildAiRequestKey({
                ...scope.requester,
                ...scope.filters,
            });
    }
};

/**
 * Загрузчик тяжёлой секции. ready — данные; queued/processing — секция
 * остаётся в loading с серверным ключом и ждёт WS ai-analytics:overview:done
 * (listener повторяет POST) либо таймаут 90 с (повтор POST, не больше
 * AI_QUEUED_MAX_ATTEMPTS раз); error — ошибка. Гард: тот же ключ уже
 * грузится (без resume) или готов (без force) — второй POST не шлём.
 */
export const loadQueuedSection =
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
