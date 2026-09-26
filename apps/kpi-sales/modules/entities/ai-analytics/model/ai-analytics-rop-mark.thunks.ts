import type {
    AppDispatch,
    AppGetState,
    RootState,
} from '@/modules/app/model/store';
import {
    selectIsRealSuperUser,
    selectIsViewAs,
} from '@/modules/app/model/selectors';
import type { AiRequester } from '../lib/api/ai-analytics-helper';
import type { AiRequestKeyPart } from '../lib/ai-request-key.util';
import { isAiRopMarkWeekEmpty } from '../lib/ai-rop-mark-week.util';
import type {
    AiEnvelope,
    AiRopMarkInput,
    AiRopMarkWeek,
    AiRopMarkWeekQuery,
} from './index';
import { aiAnalyticsActions } from './ai-analytics-slice';
import { loadSection } from './ai-analytics-sync.thunks';
import {
    aiErrorMessage,
    aiHelper,
    selectAiIsLeader,
    selectAiRequester,
} from './ai-analytics-thunks.shared';

/*
 * Слепая оценка руководителя «три звонка недели» (rop-mark/pick | list |
 * save). Ручки синхронные и только для руководителей (cup/op/group):
 * менеджеру сервер отвечает 403 — текст ложится в секцию. Записи (save,
 * «Подобрать заново») в режиме «Смотреть как…» не шлём.
 */

export { isAiRopMarkWeekEmpty };

/** Параметры недели в ключе секции ropMark (один ключ у list и re-pick). */
const ropMarkExtra = (query: AiRopMarkWeekQuery): AiRequestKeyPart[] => [
    'rop-mark',
    query.weekKey,
    query.date,
];

/**
 * Неделя с метками: list; если подбора ещё нет и pick разрешён, делаем
 * pick (детерминирован, идемпотентен) и перечитываем list. Не
 * руководителю pick не шлём (его list и так ответит 403), в режиме
 * «Смотреть как…» — тоже: pick ушёл бы от имени просматриваемого.
 * Суперпользователю вендора — тоже нет: бэк его подбор не сохраняет, а
 * автоподбор от имени вендора на портале клиента не нужен.
 */
const loadRopMarkWeek = async (
    requester: AiRequester,
    query: AiRopMarkWeekQuery,
    canPick: boolean,
): Promise<AiEnvelope<AiRopMarkWeek>> => {
    const listed = await aiHelper.listRopMark(requester, query);
    if (
        listed.status !== 'ready' ||
        !listed.data ||
        !isAiRopMarkWeekEmpty(listed.data) ||
        !canPick
    ) {
        return listed;
    }
    const picked = await aiHelper.pickRopMark(requester, query);
    if (picked.status !== 'ready') return picked;
    return await aiHelper.listRopMark(requester, query);
};

/** Подбор заново (forceRefresh) и перечитка недели с метками. */
const repickRopMarkWeek = async (
    requester: AiRequester,
    query: AiRopMarkWeekQuery,
): Promise<AiEnvelope<AiRopMarkWeek>> => {
    const picked = await aiHelper.pickRopMark(requester, query, true);
    if (picked.status !== 'ready') return picked;
    return await aiHelper.listRopMark(requester, query);
};

/**
 * Автоподбор недели разрешён: руководитель, не «Смотреть как…» и не
 * реальный суперпользователь вендора (флаг не зависит от viewAs).
 */
const aiCanAutoPickRopMark = (state: RootState): boolean =>
    selectAiIsLeader(state) &&
    !selectIsViewAs(state) &&
    !selectIsRealSuperUser(state);

/**
 * Подбор недели и метки по нему. Без параметров — текущая неделя портала
 * (ключ ISO-недели или любой её день — через query).
 */
export const fetchAiRopMarkWeek =
    (query: AiRopMarkWeekQuery = {}, force = false) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        dispatch(aiAnalyticsActions.ropMarkQueried(query));
        const state = getState();
        const canPick = aiCanAutoPickRopMark(state);
        await dispatch(
            loadSection(
                'ropMark',
                requester => loadRopMarkWeek(requester, query, canPick),
                { force, extra: ropMarkExtra(query) },
            ),
        );
    };

/**
 * «Подобрать заново» (подбор недели вышел без звонков): pick с
 * forceRefresh, затем list той же недели, что на экране. Только
 * руководителю и не в режиме «Смотреть как…» — иначе false без запроса.
 * 403 (например, суперпользователю вендора) — текст сервера в секции.
 */
export const repickAiRopMarkWeek =
    () =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<boolean> => {
        const state = getState();
        if (selectIsViewAs(state) || !selectAiIsLeader(state)) return false;
        const query = state.aiAnalytics.ropMarkQuery ?? {};
        await dispatch(
            loadSection(
                'ropMark',
                requester => repickRopMarkWeek(requester, query),
                { force: true, extra: ropMarkExtra(query) },
            ),
        );
        return getState().aiAnalytics.ropMark.status === 'ready';
    };

export const AI_ROP_MARK_SAVE_ERROR = 'Метка не сохранена';

/**
 * Слепая метка по звонку подбора; true — записана, список недели перечитан
 * (метка раскрывает aiCallType/aiScore звонка). 400 (звонок вне подбора,
 * подбора нет) и 403 (вне периметра, не руководитель) — текст сервера в
 * ropMarkSave.error, возврат false; список на экране не трогаем. В режиме
 * «Смотреть как…» — false без запроса (метка ушла бы от чужого имени).
 */
export const saveAiRopMark =
    (input: AiRopMarkInput) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<boolean> => {
        const state = getState();
        if (selectIsViewAs(state)) return false;
        const requester = selectAiRequester(state);
        if (!requester || state.aiAnalytics.ropMarkSave.pending) {
            return false;
        }

        dispatch(aiAnalyticsActions.ropMarkSaving(input.transcriptionId));
        try {
            const response = await aiHelper.saveRopMark(requester, input);
            if (response.status !== 'ready' || !response.data) {
                throw new Error(response.message || AI_ROP_MARK_SAVE_ERROR);
            }
            dispatch(aiAnalyticsActions.ropMarkSaved(response.data));
            await dispatch(
                fetchAiRopMarkWeek(
                    getState().aiAnalytics.ropMarkQuery ?? {},
                    true,
                ),
            );
            return true;
        } catch (error) {
            dispatch(
                aiAnalyticsActions.ropMarkSaveFailed(
                    aiErrorMessage(error, AI_ROP_MARK_SAVE_ERROR),
                ),
            );
            return false;
        }
    };
