import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import { appActions, appReducer } from '@/modules/app/model/AppSlice';
import type { AppDispatch, RootState } from '@/modules/app/model/store';
import {
    aiAnalyticsActions,
    aiAnalyticsReducer,
} from '../model/ai-analytics-slice';
import {
    AI_POLL_INTERVAL_MS,
    AI_QUEUED_TIMEOUT_MS,
    fetchAiPulse,
    sendAiFeedback,
    sendAiView,
} from '../model/ai-analytics-thunks';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import type { AiEnvelope, AiPulse } from '../model';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { getPulse, addFeedback } = vi.hoisted(() => ({
    getPulse: vi.fn(),
    addFeedback: vi.fn(),
}));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getPulse = getPulse;
        addFeedback = addFeedback;
        getSettings = vi.fn();
        getAgenda = vi.fn();
        resetCache = vi.fn();
    },
}));

const PULSE: AiPulse = {
    periodDate: '2026-09-04',
    window: { from: '2026-08-31', to: '2026-09-04', workdays: [] },
    nextStepDateRate: { value: 0.42, n: 50, confidence: { level: 'ok' } },
    xmr: null,
    analyzedCalls: 50,
    shortCallsSharePct: 30,
    byManager: [],
    alerts: [
        {
            managerId: '7',
            transcriptionId: 't-1',
            kind: 'promise',
            quote: '',
            callStartedAt: '2026-09-03T10:00:00Z',
            handled: false,
        },
    ],
};

const ready = (data: AiPulse): AiEnvelope<AiPulse> => ({
    status: 'ready',
    requestKey: 'server-key',
    data,
});

const queued = (): AiEnvelope<AiPulse> => ({
    status: 'queued',
    requestKey: 'k',
});

const USER = { ID: 42, LAST_NAME: 'Тест' } as unknown as BXUser;

const makeStore = () => {
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            aiAnalytics: aiAnalyticsReducer,
        }),
    });
    store.dispatch(
        appActions.setAppData({ domain: 'test.bitrix24.ru', user: USER }),
    );
    return store as unknown as {
        dispatch: AppDispatch;
        getState: () => RootState;
    };
};

const EXPECTED_KEY = buildAiRequestKey({
    domain: 'test.bitrix24.ru',
    requesterUserId: '42',
});

describe('buildAiRequestKey', () => {
    it('сортирует менеджеров и не зависит от порядка', () => {
        const scope = {
            domain: 'd',
            requesterUserId: '1',
            from: '2026-09-01',
            to: '2026-09-07',
        };
        expect(buildAiRequestKey({ ...scope, managerIds: [3, 1, 2] })).toBe(
            buildAiRequestKey({ ...scope, managerIds: [1, 2, 3] }),
        );
        expect(buildAiRequestKey({ ...scope, managerIds: [1, 2, 3] })).toBe(
            'd|1|2026-09-01|2026-09-07|1_2_3',
        );
    });

    it('пульс/повестка: только домен и requester', () => {
        expect(EXPECTED_KEY).toBe('test.bitrix24.ru|42|||');
    });
});

describe('aiAnalyticsSlice — статусы секций', () => {
    beforeEach(() => {
        getPulse.mockReset();
        addFeedback.mockReset();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('ready: idle → loading → ready с нашим и серверным ключом', async () => {
        getPulse.mockResolvedValue(ready(PULSE));
        const store = makeStore();
        expect(store.getState().aiAnalytics.pulse.status).toBe('idle');

        const promise = store.dispatch(fetchAiPulse());
        expect(store.getState().aiAnalytics.pulse.status).toBe('loading');
        expect(store.getState().aiAnalytics.pulse.requestKey).toBe(
            EXPECTED_KEY,
        );
        await promise;

        const pulse = store.getState().aiAnalytics.pulse;
        expect(pulse.status).toBe('ready');
        expect(pulse.serverKey).toBe('server-key');
        expect(pulse.data?.analyzedCalls).toBe(50);
        expect(getPulse).toHaveBeenCalledWith({
            domain: 'test.bitrix24.ru',
            requesterUserId: '42',
        });
    });

    it('гард от дублей: тот же ключ в loading/ready не шлёт второй POST', async () => {
        getPulse.mockResolvedValue(ready(PULSE));
        const store = makeStore();
        const first = store.dispatch(fetchAiPulse());
        store.dispatch(fetchAiPulse()); // пока грузится
        await first;
        await store.dispatch(fetchAiPulse()); // уже готово
        expect(getPulse).toHaveBeenCalledTimes(1);

        await store.dispatch(fetchAiPulse(true)); // force — повтор
        expect(getPulse).toHaveBeenCalledTimes(2);
    });

    it('error-конверт → status error с сообщением сервера', async () => {
        getPulse.mockResolvedValue({
            status: 'error',
            requestKey: 'k',
            message: 'Нет прав',
        });
        const store = makeStore();
        await store.dispatch(fetchAiPulse());
        expect(store.getState().aiAnalytics.pulse.status).toBe('error');
        expect(store.getState().aiAnalytics.pulse.error).toBe('Нет прав');
    });

    it('после error повтор без force снова шлёт запрос', async () => {
        getPulse.mockResolvedValueOnce({ status: 'error', requestKey: 'k' });
        getPulse.mockResolvedValueOnce(ready(PULSE));
        const store = makeStore();
        await store.dispatch(fetchAiPulse());
        await store.dispatch(fetchAiPulse());
        expect(getPulse).toHaveBeenCalledTimes(2);
        expect(store.getState().aiAnalytics.pulse.status).toBe('ready');
    });

    it('queued: опрашивает и по таймауту 90 с уходит в error', async () => {
        vi.useFakeTimers();
        getPulse.mockResolvedValue(queued());
        const store = makeStore();
        const promise = store.dispatch(fetchAiPulse());

        await vi.advanceTimersByTimeAsync(AI_POLL_INTERVAL_MS * 2 + 10);
        expect(store.getState().aiAnalytics.pulse.status).toBe('loading');
        expect(getPulse.mock.calls.length).toBeGreaterThanOrEqual(2);

        await vi.advanceTimersByTimeAsync(
            AI_QUEUED_TIMEOUT_MS + AI_POLL_INTERVAL_MS,
        );
        await promise;
        expect(store.getState().aiAnalytics.pulse.status).toBe('error');
        expect(store.getState().aiAnalytics.pulse.error).toContain(
            'слишком долго',
        );
    });

    it('queued → ready на повторном опросе', async () => {
        vi.useFakeTimers();
        getPulse
            .mockResolvedValueOnce(queued())
            .mockResolvedValueOnce(ready(PULSE));
        const store = makeStore();
        const promise = store.dispatch(fetchAiPulse());
        await vi.advanceTimersByTimeAsync(AI_POLL_INTERVAL_MS + 10);
        await promise;
        expect(store.getState().aiAnalytics.pulse.status).toBe('ready');
    });

    it('устаревший ответ (сменился requester) не перетирает секцию', () => {
        const store = makeStore();
        store.dispatch(
            aiAnalyticsActions.sectionPending({
                section: 'pulse',
                requestKey: 'new',
            }),
        );
        store.dispatch(
            aiAnalyticsActions.sectionReady({
                section: 'pulse',
                data: PULSE,
                requestKey: 'old',
                serverKey: 's',
            }),
        );
        expect(store.getState().aiAnalytics.pulse.status).toBe('loading');
        expect(store.getState().aiAnalytics.pulse.data).toBeNull();
    });

    it('публичная страница (isPublic) — запросов нет', async () => {
        const store = makeStore();
        store.dispatch(appActions.setPublicMode(true));
        await store.dispatch(fetchAiPulse());
        expect(getPulse).not.toHaveBeenCalled();
        expect(store.getState().aiAnalytics.pulse.status).toBe('idle');
    });
});

describe('aiAnalyticsSlice — реакции', () => {
    beforeEach(() => {
        getPulse.mockReset();
        addFeedback.mockReset();
    });

    it('alert_handled гасит сигнал локально после ответа бэка', async () => {
        getPulse.mockResolvedValue(ready(PULSE));
        addFeedback.mockResolvedValue({
            status: 'ready',
            requestKey: 'k',
            data: { id: '1' },
        });
        const store = makeStore();
        await store.dispatch(fetchAiPulse());

        const ok = await store.dispatch(
            sendAiFeedback({
                kind: 'alert_handled',
                object: 'call:t-1',
                transcriptionId: 't-1',
                managerId: '7',
            }),
        );
        expect(ok).toBe(true);
        expect(
            store.getState().aiAnalytics.pulse.data?.alerts[0]?.handled,
        ).toBe(true);
        expect(store.getState().aiAnalytics.feedback.sent['call:t-1']).toBe(
            'alert_handled',
        );
        expect(addFeedback).toHaveBeenCalledWith(
            { domain: 'test.bitrix24.ru', requesterUserId: '42' },
            expect.objectContaining({
                kind: 'alert_handled',
                transcriptionId: 't-1',
            }),
        );
    });

    it('ошибка записи: pending снимается, sent не меняется', async () => {
        addFeedback.mockRejectedValue(new Error('403'));
        const store = makeStore();
        const ok = await store.dispatch(
            sendAiFeedback({ kind: 'useful', object: 'pulse' }),
        );
        expect(ok).toBe(false);
        expect(store.getState().aiAnalytics.feedback.pending).toEqual([]);
        expect(
            store.getState().aiAnalytics.feedback.sent.pulse,
        ).toBeUndefined();
        expect(store.getState().aiAnalytics.feedback.error).toBe('403');
    });

    it('view — один раз за сессию на объект и без подсветки кнопок', async () => {
        addFeedback.mockResolvedValue({
            status: 'ready',
            requestKey: 'k',
            data: { id: '1' },
        });
        const store = makeStore();
        await store.dispatch(sendAiView('pulse'));
        await store.dispatch(sendAiView('pulse'));
        expect(addFeedback).toHaveBeenCalledTimes(1);
        expect(
            store.getState().aiAnalytics.feedback.sent.pulse,
        ).toBeUndefined();
    });

    it('hydrateSettings принимает только известный тип звонка', () => {
        const store = makeStore();
        store.dispatch(
            aiAnalyticsActions.hydrateSettings({
                selectedCallType: 'presentation',
            }),
        );
        expect(store.getState().aiAnalytics.selectedCallType).toBe(
            'presentation',
        );
        store.dispatch(
            aiAnalyticsActions.hydrateSettings({ selectedCallType: 'garbage' }),
        );
        expect(store.getState().aiAnalytics.selectedCallType).toBe(
            'presentation',
        );
    });

    it('«все типы» — значение по умолчанию и валидное значение blob', () => {
        const store = makeStore();
        expect(store.getState().aiAnalytics.selectedCallType).toBe('all');
        store.dispatch(
            aiAnalyticsActions.hydrateSettings({
                selectedCallType: 'presentation',
            }),
        );
        store.dispatch(
            aiAnalyticsActions.hydrateSettings({ selectedCallType: 'all' }),
        );
        expect(store.getState().aiAnalytics.selectedCallType).toBe('all');
    });
});
