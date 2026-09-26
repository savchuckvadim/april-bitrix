import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    fetchAiRopMarkWeek,
    isAiRopMarkWeekEmpty,
    saveAiRopMark,
} from '../model/ai-analytics-thunks';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import {
    httpError,
    ready,
    ropMark,
    ropMarkCall,
    ropMarkWeek,
    ropMarkWeekEmpty,
} from './ai-fixtures';
import { makeAiStore, TEST_REQUESTER } from './ai-test-store';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { listRopMark, pickRopMark, saveRopMark } = vi.hoisted(() => ({
    listRopMark: vi.fn(),
    pickRopMark: vi.fn(),
    saveRopMark: vi.fn(),
}));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        listRopMark = listRopMark;
        pickRopMark = pickRopMark;
        saveRopMark = saveRopMark;
    },
}));

const LEADER_403 = 'Операция доступна только руководителю отдела продаж';
const NOT_PICKED_400 =
    'Звонок не входит в подбор недели: слепая метка ставится только по трём подобранным звонкам';

describe('isAiRopMarkWeekEmpty', () => {
    it('подбора нет — calls пуст и generatedAt пустой; подбор без кандидатов — не «нет»', () => {
        expect(isAiRopMarkWeekEmpty(ropMarkWeekEmpty())).toBe(true);
        expect(isAiRopMarkWeekEmpty(ropMarkWeek())).toBe(false);
        expect(isAiRopMarkWeekEmpty(ropMarkWeek({ calls: [] }))).toBe(false);
    });
});

describe('fetchAiRopMarkWeek — list / pick', () => {
    beforeEach(() => {
        listRopMark.mockReset();
        pickRopMark.mockReset();
    });

    it('подбор есть → только list; ключ несёт неделю; запрос запомнен', async () => {
        listRopMark.mockResolvedValue(ready(ropMarkWeek(), 'srv-week'));
        const store = makeAiStore({ leader: true });
        await store.dispatch(fetchAiRopMarkWeek({ weekKey: '2026-W38' }));

        const section = store.getState().aiAnalytics.ropMark;
        expect(section.status).toBe('ready');
        expect(section.serverKey).toBe('srv-week');
        expect(section.data?.calls).toHaveLength(1);
        expect(section.requestKey).toBe(
            buildAiRequestKey({
                ...TEST_REQUESTER,
                extra: ['rop-mark', '2026-W38', undefined],
            }),
        );
        expect(store.getState().aiAnalytics.ropMarkQuery).toEqual({
            weekKey: '2026-W38',
        });
        expect(listRopMark).toHaveBeenCalledWith(TEST_REQUESTER, {
            weekKey: '2026-W38',
        });
        expect(pickRopMark).not.toHaveBeenCalled();
    });

    it('подбора нет и requester — руководитель → pick, затем list', async () => {
        listRopMark
            .mockResolvedValueOnce(ready(ropMarkWeekEmpty()))
            .mockResolvedValueOnce(ready(ropMarkWeek()));
        pickRopMark.mockResolvedValue(ready(ropMarkWeek()));
        const store = makeAiStore({ leader: true });
        await store.dispatch(fetchAiRopMarkWeek());

        expect(pickRopMark).toHaveBeenCalledTimes(1);
        expect(pickRopMark).toHaveBeenCalledWith(TEST_REQUESTER, {});
        expect(listRopMark).toHaveBeenCalledTimes(2);
        expect(store.getState().aiAnalytics.ropMark.status).toBe('ready');
        expect(store.getState().aiAnalytics.ropMark.data?.calls).toHaveLength(
            1,
        );
    });

    it('подбора нет, но requester не руководитель → pick не шлём', async () => {
        listRopMark.mockResolvedValue(ready(ropMarkWeekEmpty()));
        const store = makeAiStore({ leader: false });
        await store.dispatch(fetchAiRopMarkWeek());
        expect(pickRopMark).not.toHaveBeenCalled();
        expect(store.getState().aiAnalytics.ropMark.status).toBe('ready');
        expect(store.getState().aiAnalytics.ropMark.data?.calls).toEqual([]);
    });

    it('403 менеджеру на list → status error с текстом сервера', async () => {
        listRopMark.mockRejectedValue(httpError(403, LEADER_403));
        const store = makeAiStore({ leader: false });
        await store.dispatch(fetchAiRopMarkWeek());
        expect(store.getState().aiAnalytics.ropMark.status).toBe('error');
        expect(store.getState().aiAnalytics.ropMark.error).toBe(LEADER_403);
    });

    it('pick упал → ошибка секции, второй list не шлём', async () => {
        listRopMark.mockResolvedValue(ready(ropMarkWeekEmpty()));
        pickRopMark.mockRejectedValue(httpError(403, LEADER_403));
        const store = makeAiStore({ leader: true });
        await store.dispatch(fetchAiRopMarkWeek());
        expect(listRopMark).toHaveBeenCalledTimes(1);
        expect(store.getState().aiAnalytics.ropMark.status).toBe('error');
    });

    it('гард: тот же ключ ready — повторного list нет; force — есть', async () => {
        listRopMark.mockResolvedValue(ready(ropMarkWeek()));
        const store = makeAiStore({ leader: true });
        await store.dispatch(fetchAiRopMarkWeek());
        await store.dispatch(fetchAiRopMarkWeek());
        expect(listRopMark).toHaveBeenCalledTimes(1);
        await store.dispatch(fetchAiRopMarkWeek({}, true));
        expect(listRopMark).toHaveBeenCalledTimes(2);
    });
});

describe('saveAiRopMark — слепая метка', () => {
    beforeEach(() => {
        listRopMark.mockReset();
        pickRopMark.mockReset();
        saveRopMark.mockReset();
    });

    it('ready → lastSaved, повторный list той же недели с раскрытой оценкой', async () => {
        listRopMark
            .mockResolvedValueOnce(ready(ropMarkWeek()))
            .mockResolvedValueOnce(
                ready(
                    ropMarkWeek({
                        calls: [
                            ropMarkCall({
                                marked: true,
                                aiCallType: 'presentation',
                                aiScore: 71,
                                mark: ropMark(),
                            }),
                        ],
                    }),
                ),
            );
        saveRopMark.mockResolvedValue(
            ready({ id: 'm-1', replaced: false, blind: true }, 'srv-t-1'),
        );
        const store = makeAiStore({ leader: true });
        await store.dispatch(fetchAiRopMarkWeek({ weekKey: '2026-W38' }));

        const ok = await store.dispatch(
            saveAiRopMark({
                transcriptionId: 't-1',
                agree: true,
                ropScore: 8,
                sections: ['NEEDS'],
                why: 'Потребность выявлена',
            }),
        );
        expect(ok).toBe(true);
        expect(saveRopMark).toHaveBeenCalledWith(
            TEST_REQUESTER,
            expect.objectContaining({ transcriptionId: 't-1', agree: true }),
        );
        expect(listRopMark).toHaveBeenCalledTimes(2);
        expect(listRopMark.mock.calls[1]?.[1]).toEqual({
            weekKey: '2026-W38',
        });

        const state = store.getState().aiAnalytics;
        expect(state.ropMarkSave.pending).toBeNull();
        expect(state.ropMarkSave.error).toBeNull();
        expect(state.ropMarkSave.lastSaved).toEqual({
            id: 'm-1',
            replaced: false,
            blind: true,
        });
        expect(state.ropMark.data?.calls[0]?.aiScore).toBe(71);
        expect(state.ropMark.data?.calls[0]?.mark?.ropScore).toBe(8);
    });

    it('400 (звонок вне подбора) → ropMarkSave.error, false, список на месте', async () => {
        listRopMark.mockResolvedValue(ready(ropMarkWeek()));
        saveRopMark.mockRejectedValue(httpError(400, NOT_PICKED_400));
        const store = makeAiStore({ leader: true });
        await store.dispatch(fetchAiRopMarkWeek());

        const ok = await store.dispatch(
            saveAiRopMark({ transcriptionId: 't-99', agree: false }),
        );
        expect(ok).toBe(false);
        expect(store.getState().aiAnalytics.ropMarkSave.error).toBe(
            NOT_PICKED_400,
        );
        expect(store.getState().aiAnalytics.ropMarkSave.pending).toBeNull();
        expect(store.getState().aiAnalytics.ropMark.status).toBe('ready');
        expect(listRopMark).toHaveBeenCalledTimes(1);
    });

    it('403 (не руководитель) → текст сервера, false', async () => {
        saveRopMark.mockRejectedValue(httpError(403, LEADER_403));
        const store = makeAiStore({ leader: false });
        const ok = await store.dispatch(
            saveAiRopMark({ transcriptionId: 't-1', agree: true }),
        );
        expect(ok).toBe(false);
        expect(store.getState().aiAnalytics.ropMarkSave.error).toBe(LEADER_403);
    });

    it('пока метка отправляется, вторая не уходит', async () => {
        let resolveSave: (value: unknown) => void = () => undefined;
        saveRopMark.mockImplementationOnce(
            () =>
                new Promise(resolve => {
                    resolveSave = resolve;
                }),
        );
        listRopMark.mockResolvedValue(ready(ropMarkWeek()));
        const store = makeAiStore({ leader: true });
        const first = store.dispatch(
            saveAiRopMark({ transcriptionId: 't-1', agree: true }),
        );
        expect(store.getState().aiAnalytics.ropMarkSave.pending).toBe('t-1');
        const second = await store.dispatch(
            saveAiRopMark({ transcriptionId: 't-2', agree: true }),
        );
        expect(second).toBe(false);
        resolveSave(ready({ id: 'm-1', replaced: false, blind: true }));
        expect(await first).toBe(true);
        expect(saveRopMark).toHaveBeenCalledTimes(1);
    });
});
