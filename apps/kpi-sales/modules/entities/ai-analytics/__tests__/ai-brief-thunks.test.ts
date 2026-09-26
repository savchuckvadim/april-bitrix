import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BXUser } from '@workspace/bx';
import { departmentActions } from '@/modules/entities/department/model/department-slice';
import {
    AI_QUEUED_TIMEOUT_MS,
    failAiQueuedSections,
    fetchAiBrief,
    resumeAiQueuedSections,
} from '../model/ai-analytics-thunks';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import { brief, processing, queued, ready } from './ai-fixtures';
import { makeAiStore, TEST_REQUESTER } from './ai-test-store';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { getBrief, getOverview } = vi.hoisted(() => ({
    getBrief: vi.fn(),
    getOverview: vi.fn(),
}));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getBrief = getBrief;
        getOverview = getOverview;
        getAttention = vi.fn();
        getByType = vi.fn();
    },
}));

const BRIEF_KEY = buildAiRequestKey({
    ...TEST_REQUESTER,
    from: '2026-08-01',
    to: '2026-08-31',
    managerIds: [3, 7],
});

describe('fetchAiBrief — AI-резюме периода (очередь + WS)', () => {
    beforeEach(() => {
        getBrief.mockReset();
        getOverview.mockReset();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('ready: резюме в data, ключ — периметр обзора, POST несёт период и менеджеров', async () => {
        getBrief.mockResolvedValue(ready(brief(), 'srv-brief'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiBrief());

        const section = store.getState().aiAnalytics.brief;
        expect(section.status).toBe('ready');
        expect(section.requestKey).toBe(BRIEF_KEY);
        expect(section.serverKey).toBe('srv-brief');
        expect(section.data?.headline).toContain('спокойная');
        expect(getBrief).toHaveBeenCalledWith(
            TEST_REQUESTER,
            { from: '2026-08-01', to: '2026-08-31', managerIds: [7, 3] },
            { socketId: undefined, forceRefresh: false },
        );
    });

    it('queued → loading с серверным ключом → WS done → повторный POST → ready', async () => {
        getBrief
            .mockResolvedValueOnce(queued('srv-brief'))
            .mockResolvedValueOnce(ready(brief(), 'srv-brief'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiBrief());

        const waiting = store.getState().aiAnalytics.brief;
        expect(waiting.status).toBe('loading');
        expect(waiting.jobStatus).toBe('queued');
        expect(waiting.serverKey).toBe('srv-brief');

        await store.dispatch(resumeAiQueuedSections('srv-brief'));
        expect(getBrief).toHaveBeenCalledTimes(2);
        expect(getBrief.mock.calls[1]?.[2]).toMatchObject({
            forceRefresh: false,
        });
        expect(store.getState().aiAnalytics.brief.status).toBe('ready');
    });

    it('done обзора с чужим ключом резюме не возобновляет; обзор — не трогает резюме', async () => {
        getBrief.mockResolvedValue(processing('srv-brief'));
        getOverview.mockResolvedValue(ready({ managers: [] }, 'srv-ov'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiBrief());
        await store.dispatch(resumeAiQueuedSections('srv-ov'));
        expect(getBrief).toHaveBeenCalledTimes(1);
        expect(getOverview).not.toHaveBeenCalled();
        expect(store.getState().aiAnalytics.brief.status).toBe('loading');
    });

    it('WS error с этим ключом → секция в error с текстом', async () => {
        getBrief.mockResolvedValue(queued('srv-brief'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiBrief());
        store.dispatch(
            failAiQueuedSections({
                requestKey: 'srv-brief',
                message: 'Квота модели исчерпана',
            }),
        );
        expect(store.getState().aiAnalytics.brief.status).toBe('error');
        expect(store.getState().aiAnalytics.brief.error).toBe(
            'Квота модели исчерпана',
        );
    });

    it('WS error без текста → запасной текст резюме, не обзора', async () => {
        getBrief.mockResolvedValue(queued('srv-brief'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiBrief());
        store.dispatch(failAiQueuedSections({ requestKey: 'srv-brief' }));
        expect(store.getState().aiAnalytics.brief.error).toBe(
            'Ошибка сборки резюме',
        );
    });

    it('error-конверт → error с сообщением сервера', async () => {
        getBrief.mockResolvedValue({
            status: 'error',
            requestKey: 'k',
            message: 'Период больше 3 мес.',
        });
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiBrief());
        expect(store.getState().aiAnalytics.brief.status).toBe('error');
        expect(store.getState().aiAnalytics.brief.error).toBe(
            'Период больше 3 мес.',
        );
    });

    it('source = template и reason сохраняются как есть', async () => {
        getBrief.mockResolvedValue(
            ready(
                brief({
                    source: 'template',
                    reason: 'нет ключа VibeCode',
                    usage: undefined,
                }),
            ),
        );
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiBrief());
        const data = store.getState().aiAnalytics.brief.data;
        expect(data?.source).toBe('template');
        expect(data?.reason).toBe('нет ключа VibeCode');
        expect(data?.usage).toBeUndefined();
    });

    it('{ force: true } шлёт forceRefresh — «пересобрать резюме»', async () => {
        getBrief.mockResolvedValue(ready(brief()));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiBrief());
        await store.dispatch(fetchAiBrief({ force: true }));
        expect(getBrief).toHaveBeenCalledTimes(2);
        expect(getBrief.mock.calls[1]?.[2]).toMatchObject({
            forceRefresh: true,
        });
    });

    it('таймаут без WS → повторный POST по тому же ключу', async () => {
        vi.useFakeTimers();
        getBrief
            .mockResolvedValueOnce(queued('srv-brief'))
            .mockResolvedValueOnce(ready(brief(), 'srv-brief'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiBrief());
        await vi.advanceTimersByTimeAsync(AI_QUEUED_TIMEOUT_MS + 10);
        expect(getBrief).toHaveBeenCalledTimes(2);
        expect(store.getState().aiAnalytics.brief.status).toBe('ready');
    });

    it('смена состава менеджеров — новый ключ, старый ответ не перетирает', async () => {
        getBrief.mockResolvedValue(ready(brief(), 'k1'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiBrief());
        store.dispatch(
            departmentActions.setDepartmentCurrent([
                { ID: 7 },
            ] as unknown as BXUser[]),
        );
        getBrief.mockResolvedValue(ready(brief({ packHash: 'hash-2' }), 'k2'));
        await store.dispatch(fetchAiBrief());
        expect(getBrief).toHaveBeenCalledTimes(2);
        expect(getBrief.mock.calls[1]?.[1]).toMatchObject({ managerIds: [7] });
        expect(store.getState().aiAnalytics.brief.data?.packHash).toBe(
            'hash-2',
        );
    });
});
