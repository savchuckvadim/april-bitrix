import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BXUser } from '@workspace/bx';
import { appActions } from '@/modules/app/model/AppSlice';
import {
    fetchAiRopMarkWeek,
    repickAiRopMarkWeek,
    saveAiRopMark,
} from '../model/ai-analytics-rop-mark.thunks';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import { httpError, ready, ropMarkWeek, ropMarkWeekEmpty } from './ai-fixtures';
import { makeAiStore, TEST_REQUESTER } from './ai-test-store';

/*
 * Записи слепой оценки: гард режима «Смотреть как…» (save и авто-pick не
 * уходят от имени просматриваемого) и «Подобрать заново» (pick с
 * forceRefresh). Чтение list / pick и save — ai-rop-mark-thunks.test.ts.
 */

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

/** Текст 403 бэка (AI_ROP_MARK_SUPER_USER_FORBIDDEN_MESSAGE). */
const VENDOR_403 =
    'Суперпользователь вендора смотрит слепую проверку только на чтение: ставить метки и пересобирать подбор недели могут только руководители портала';
const VIEWED_USER = { ID: 7, LAST_NAME: 'Менеджер' } as unknown as BXUser;

beforeEach(() => {
    listRopMark.mockReset();
    pickRopMark.mockReset();
    saveRopMark.mockReset();
});

describe('режим «Смотреть как…» — слепая оценка только на чтение', () => {
    it('подбора нет → list есть, pick не шлём', async () => {
        listRopMark.mockResolvedValue(ready(ropMarkWeekEmpty()));
        const store = makeAiStore({ leader: true });
        store.dispatch(appActions.setViewAsUser(VIEWED_USER));
        await store.dispatch(fetchAiRopMarkWeek());
        expect(listRopMark).toHaveBeenCalledTimes(1);
        expect(pickRopMark).not.toHaveBeenCalled();
        expect(store.getState().aiAnalytics.ropMark.status).toBe('ready');
    });

    it('saveAiRopMark — false без запроса: метка не уходит от чужого имени', async () => {
        const store = makeAiStore({ leader: true });
        store.dispatch(appActions.setViewAsUser(VIEWED_USER));
        const ok = await store.dispatch(
            saveAiRopMark({ transcriptionId: 't-1', agree: true }),
        );
        expect(ok).toBe(false);
        expect(saveRopMark).not.toHaveBeenCalled();
        expect(store.getState().aiAnalytics.ropMarkSave.pending).toBeNull();
    });
});

describe('repickAiRopMarkWeek — «Подобрать заново»', () => {
    it('подбор без звонков → pick с forceRefresh той же недели, затем list', async () => {
        listRopMark
            .mockResolvedValueOnce(ready(ropMarkWeek({ calls: [] })))
            .mockResolvedValueOnce(ready(ropMarkWeek()));
        pickRopMark.mockResolvedValue(ready(ropMarkWeek()));
        const store = makeAiStore({ leader: true });
        await store.dispatch(fetchAiRopMarkWeek({ weekKey: '2026-W38' }));
        expect(pickRopMark).not.toHaveBeenCalled();

        const ok = await store.dispatch(repickAiRopMarkWeek());
        expect(ok).toBe(true);
        expect(pickRopMark).toHaveBeenCalledWith(
            TEST_REQUESTER,
            { weekKey: '2026-W38' },
            true,
        );
        expect(listRopMark).toHaveBeenCalledTimes(2);
        const section = store.getState().aiAnalytics.ropMark;
        expect(section.status).toBe('ready');
        expect(section.data?.calls).toHaveLength(1);
        expect(section.requestKey).toBe(
            buildAiRequestKey({
                ...TEST_REQUESTER,
                extra: ['rop-mark', '2026-W38', undefined],
            }),
        );
    });

    it('403 суперпользователю вендора → текст сервера в секции, list не шлём', async () => {
        pickRopMark.mockRejectedValue(httpError(403, VENDOR_403));
        const store = makeAiStore({ leader: true });
        const ok = await store.dispatch(repickAiRopMarkWeek());
        expect(ok).toBe(false);
        expect(listRopMark).not.toHaveBeenCalled();
        expect(store.getState().aiAnalytics.ropMark.status).toBe('error');
        expect(store.getState().aiAnalytics.ropMark.error).toBe(VENDOR_403);
    });

    it('не руководитель и режим «Смотреть как…» — false без запросов', async () => {
        const manager = makeAiStore({ leader: false });
        expect(await manager.dispatch(repickAiRopMarkWeek())).toBe(false);

        const viewAs = makeAiStore({ leader: true });
        viewAs.dispatch(appActions.setViewAsUser(VIEWED_USER));
        expect(await viewAs.dispatch(repickAiRopMarkWeek())).toBe(false);

        expect(pickRopMark).not.toHaveBeenCalled();
        expect(listRopMark).not.toHaveBeenCalled();
    });
});
