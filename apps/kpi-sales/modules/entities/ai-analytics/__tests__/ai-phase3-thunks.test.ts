import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAiDossier, fetchAiPlanFact } from '../model/ai-analytics-thunks';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import { dossier, planFact, queued, ready } from './ai-fixtures';
import { makeAiStore, TEST_REQUESTER } from './ai-test-store';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { getPlanFact, getDossier } = vi.hoisted(() => ({
    getPlanFact: vi.fn(),
    getDossier: vi.fn(),
}));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getPlanFact = getPlanFact;
        getDossier = getDossier;
    },
}));

describe('fetchAiPlanFact — план-факт месяца (Фаза 3, П2)', () => {
    beforeEach(() => {
        getPlanFact.mockReset();
    });

    it('ready: секция с данными, запрос запомнен, ключ несёт месяц и менеджеров', async () => {
        getPlanFact.mockResolvedValue(ready(planFact(), 'pf-key'));
        const store = makeAiStore();
        await store.dispatch(
            fetchAiPlanFact({ monthKey: '2026-08', managerIds: ['7', '3'] }),
        );

        const section = store.getState().aiAnalytics.planFact;
        expect(section.status).toBe('ready');
        expect(section.serverKey).toBe('pf-key');
        expect(section.data?.rows[0]?.rows[0]?.status).toBe('behind');
        expect(section.requestKey).toBe(
            buildAiRequestKey({
                ...TEST_REQUESTER,
                extra: ['plan-fact', '2026-08', '7', '3'],
            }),
        );
        expect(store.getState().aiAnalytics.planFactQuery).toEqual({
            monthKey: '2026-08',
            managerIds: ['7', '3'],
        });
        expect(getPlanFact).toHaveBeenCalledWith(TEST_REQUESTER, {
            monthKey: '2026-08',
            managerIds: ['7', '3'],
        });
    });

    it('гард: тот же месяц не шлёт второй POST; другой месяц и force — шлют', async () => {
        getPlanFact.mockResolvedValue(ready(planFact()));
        const store = makeAiStore();
        await store.dispatch(fetchAiPlanFact({ monthKey: '2026-08' }));
        await store.dispatch(fetchAiPlanFact({ monthKey: '2026-08' }));
        expect(getPlanFact).toHaveBeenCalledTimes(1);

        await store.dispatch(fetchAiPlanFact({ monthKey: '2026-07' }));
        expect(getPlanFact).toHaveBeenCalledTimes(2);

        await store.dispatch(fetchAiPlanFact({ monthKey: '2026-07' }, true));
        expect(getPlanFact).toHaveBeenCalledTimes(3);
    });

    it('ошибка сети → status error с текстом', async () => {
        getPlanFact.mockRejectedValue(new Error('Сервер недоступен'));
        const store = makeAiStore();
        await store.dispatch(fetchAiPlanFact({ monthKey: '2026-08' }));
        const section = store.getState().aiAnalytics.planFact;
        expect(section.status).toBe('error');
        expect(section.error).toBe('Сервер недоступен');
    });
});

describe('fetchAiDossier — досье менеджера (Фаза 3, П4)', () => {
    beforeEach(() => {
        getDossier.mockReset();
    });

    it('ready: секция с данными, запрос запомнен, ключ — менеджер и окно без периода', async () => {
        getDossier.mockResolvedValue(ready(dossier(), 'dossier-key'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiDossier({ managerId: '7', months: 3 }));

        const section = store.getState().aiAnalytics.dossier;
        expect(section.status).toBe('ready');
        expect(section.serverKey).toBe('dossier-key');
        expect(section.data?.passport?.tenureMonths).toBe(10);
        expect(section.requestKey).toBe(
            buildAiRequestKey({
                ...TEST_REQUESTER,
                extra: ['dossier', '7', 3],
            }),
        );
        expect(store.getState().aiAnalytics.dossierQuery).toEqual({
            managerId: '7',
            months: 3,
        });
        expect(getDossier).toHaveBeenCalledWith(
            TEST_REQUESTER,
            { managerId: '7', months: 3 },
            { socketId: undefined, forceRefresh: false },
        );
    });

    it('queued: секция ждёт WS с серверным ключом; смена окна — новый POST', async () => {
        getDossier.mockResolvedValue(queued('srv-dossier'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiDossier({ managerId: '7', months: 3 }));

        const section = store.getState().aiAnalytics.dossier;
        expect(section.status).toBe('loading');
        expect(section.jobStatus).toBe('queued');
        expect(section.serverKey).toBe('srv-dossier');

        await store.dispatch(fetchAiDossier({ managerId: '7', months: 3 }));
        expect(getDossier).toHaveBeenCalledTimes(1);
        await store.dispatch(fetchAiDossier({ managerId: '7', months: 6 }));
        expect(getDossier).toHaveBeenCalledTimes(2);
    });

    it('force после ready шлёт POST с forceRefresh', async () => {
        getDossier.mockResolvedValue(ready(dossier()));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiDossier({ managerId: '7', months: 3 }));
        await store.dispatch(
            fetchAiDossier({ managerId: '7', months: 3 }, { force: true }),
        );
        expect(getDossier).toHaveBeenCalledTimes(2);
        expect(getDossier.mock.calls[1]?.[2]).toMatchObject({
            forceRefresh: true,
        });
    });
});
