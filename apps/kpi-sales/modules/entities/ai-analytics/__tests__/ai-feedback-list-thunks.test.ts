import { beforeEach, describe, expect, it, vi } from 'vitest';
import { aiAnalyticsActions } from '../model/ai-analytics-slice';
import { fetchAiFeedbackList } from '../model/ai-analytics-thunks';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import type { AiFeedbackList } from '../model';
import { httpError, ready } from './ai-fixtures';
import { makeAiStore, TEST_REQUESTER } from './ai-test-store';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { listFeedback } = vi.hoisted(() => ({ listFeedback: vi.fn() }));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        listFeedback = listFeedback;
    },
}));

const LIST: AiFeedbackList = {
    items: [
        {
            id: 'f-1',
            kind: 'useful',
            object: 'attention:7:risk',
            managerId: '7',
            transcriptionId: null,
            requesterUserId: '42',
            reason: null,
            createdAt: '2026-09-10T08:00:00.000Z',
        },
    ],
    disagreementSharePct: 0,
};

const QUERY = { from: '2026-09-01', to: '2026-09-30', managerId: '7' };

describe('fetchAiFeedbackList — список обратной связи по сотруднику', () => {
    beforeEach(() => {
        listFeedback.mockReset();
    });

    it('ready: секция с данными, запрос запомнен, ключ несёт период и менеджера', async () => {
        listFeedback.mockResolvedValue(ready(LIST, 'list-key'));
        const store = makeAiStore();
        await store.dispatch(fetchAiFeedbackList(QUERY));

        const section = store.getState().aiAnalytics.feedbackList;
        expect(section.status).toBe('ready');
        expect(section.serverKey).toBe('list-key');
        expect(section.data?.items[0]?.id).toBe('f-1');
        expect(section.requestKey).toBe(
            buildAiRequestKey({
                ...TEST_REQUESTER,
                extra: ['feedback-list', '2026-09-01', '2026-09-30', '7'],
            }),
        );
        expect(store.getState().aiAnalytics.feedbackListQuery).toEqual(QUERY);
        expect(listFeedback).toHaveBeenCalledWith(
            TEST_REQUESTER,
            '2026-09-01',
            '2026-09-30',
            '7',
        );
    });

    it('повторный запрос с тем же ключом не уходит на сервер; force — уходит', async () => {
        listFeedback.mockResolvedValue(ready(LIST));
        const store = makeAiStore();
        await store.dispatch(fetchAiFeedbackList(QUERY));
        await store.dispatch(fetchAiFeedbackList(QUERY));
        expect(listFeedback).toHaveBeenCalledTimes(1);
        await store.dispatch(fetchAiFeedbackList(QUERY, true));
        expect(listFeedback).toHaveBeenCalledTimes(2);
    });

    it('403 менеджеру вне периметра — текст сервера в error, секция не падает', async () => {
        listFeedback.mockRejectedValue(
            httpError(403, 'Список обратной связи доступен только по себе'),
        );
        const store = makeAiStore();
        await store.dispatch(fetchAiFeedbackList(QUERY));

        const section = store.getState().aiAnalytics.feedbackList;
        expect(section.status).toBe('error');
        expect(section.error).toBe(
            'Список обратной связи доступен только по себе',
        );
    });

    it('resetData очищает список и запомненный запрос', async () => {
        listFeedback.mockResolvedValue(ready(LIST));
        const store = makeAiStore();
        await store.dispatch(fetchAiFeedbackList(QUERY));
        store.dispatch(aiAnalyticsActions.resetData());
        expect(store.getState().aiAnalytics.feedbackList.status).toBe('idle');
        expect(store.getState().aiAnalytics.feedbackListQuery).toBeNull();
    });
});
