import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import type { AiRequester } from '../lib/api/ai-analytics-helper';
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
 * менеджеру сервер отвечает 403 — текст ложится в секцию.
 */

/** Подбора недели ещё нет: list отвечает пустым calls и пустым generatedAt. */
export const isAiRopMarkWeekEmpty = (week: AiRopMarkWeek): boolean =>
    !week.generatedAt && week.calls.length === 0;

/**
 * Неделя с метками: list; если подбора ещё нет и requester — руководитель,
 * делаем pick (детерминирован, идемпотентен) и перечитываем list.
 * Не руководителю pick не шлём: его list и так ответит 403.
 */
const loadRopMarkWeek = async (
    requester: AiRequester,
    query: AiRopMarkWeekQuery,
    isLeader: boolean,
): Promise<AiEnvelope<AiRopMarkWeek>> => {
    const listed = await aiHelper.listRopMark(requester, query);
    if (
        listed.status !== 'ready' ||
        !listed.data ||
        !isAiRopMarkWeekEmpty(listed.data) ||
        !isLeader
    ) {
        return listed;
    }
    const picked = await aiHelper.pickRopMark(requester, query);
    if (picked.status !== 'ready') return picked;
    return await aiHelper.listRopMark(requester, query);
};

/**
 * Подбор недели и метки по нему. Без параметров — текущая неделя портала
 * (ключ ISO-недели или любой её день — через query).
 */
export const fetchAiRopMarkWeek =
    (query: AiRopMarkWeekQuery = {}, force = false) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        dispatch(aiAnalyticsActions.ropMarkQueried(query));
        const isLeader = selectAiIsLeader(getState());
        await dispatch(
            loadSection(
                'ropMark',
                requester => loadRopMarkWeek(requester, query, isLeader),
                { force, extra: ['rop-mark', query.weekKey, query.date] },
            ),
        );
    };

export const AI_ROP_MARK_SAVE_ERROR = 'Метка не сохранена';

/**
 * Слепая метка по звонку подбора; true — записана, список недели перечитан
 * (метка раскрывает aiCallType/aiScore звонка). 400 (звонок вне подбора,
 * подбора нет) и 403 (вне периметра, не руководитель) — текст сервера в
 * ropMarkSave.error, возврат false; список на экране не трогаем.
 */
export const saveAiRopMark =
    (input: AiRopMarkInput) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<boolean> => {
        const requester = selectAiRequester(getState());
        if (!requester || getState().aiAnalytics.ropMarkSave.pending) {
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
