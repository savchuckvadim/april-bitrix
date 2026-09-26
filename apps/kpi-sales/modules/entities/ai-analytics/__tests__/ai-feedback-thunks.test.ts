import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BXUser } from '@workspace/bx';
import { appActions } from '@/modules/app/model/AppSlice';
import {
    AI_FEEDBACK_SAVE_ERROR,
    sendAiFeedback,
    sendAiView,
} from '../model/ai-analytics-feedback.thunks';
import { aiFeedbackKey, aiFeedbackView } from '../lib/ai-feedback.util';
import type { AiEnvelope } from '../model';
import { makeAiStore, TEST_REQUESTER, type AiTestStore } from './ai-test-store';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { addFeedback } = vi.hoisted(() => ({ addFeedback: vi.fn() }));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        addFeedback = addFeedback;
    },
}));

/* Локальные фикстуры: конверт ответа и ошибка axios с телом бэка. */
type Saved = AiEnvelope<{ id: string }>;

const saved = (): Saved => ({
    status: 'ready',
    requestKey: 'k',
    data: { id: '1' },
});

const axiosError = (status: number, message: string): Error =>
    Object.assign(new Error(`Request failed with status code ${status}`), {
        response: { status, data: { resultCode: 1, message } },
    });

const VIEWED_USER = { ID: 7, LAST_NAME: 'Менеджер' } as unknown as BXUser;
const OUT_OF_SCOPE = 'Менеджер вне периметра видимости пользователя';

/** Отложенный ответ ручки: запрос «в пути», пока тест его не отпустит. */
const deferred = () => {
    let resolve: (value: Saved) => void = () => undefined;
    const promise = new Promise<Saved>(done => {
        resolve = done;
    });
    return { promise, resolve: () => resolve(saved()) };
};

const feedbackOf = (store: AiTestStore) =>
    store.getState().aiAnalytics.feedback;

describe('реакции в режиме «Смотреть как…»', () => {
    beforeEach(() => addFeedback.mockReset());

    it('sendAiFeedback — false без запроса и без pending', async () => {
        const store = makeAiStore();
        store.dispatch(appActions.setViewAsUser(VIEWED_USER));
        const ok = await store.dispatch(
            sendAiFeedback({ kind: 'useful', object: 'pulse' }),
        );
        expect(ok).toBe(false);
        expect(addFeedback).not.toHaveBeenCalled();
        expect(feedbackOf(store).pending).toEqual([]);
        expect(feedbackOf(store).errors).toEqual({});
    });

    it('sendAiView — false, объект не помечен; после выхода view уходит от реального пользователя', async () => {
        addFeedback.mockResolvedValue(saved());
        const store = makeAiStore();
        store.dispatch(appActions.setViewAsUser(VIEWED_USER));
        expect(await store.dispatch(sendAiView('pulse'))).toBe(false);
        expect(feedbackOf(store).viewed).toEqual([]);
        expect(addFeedback).not.toHaveBeenCalled();

        store.dispatch(appActions.setViewAsUser(null));
        expect(await store.dispatch(sendAiView('pulse'))).toBe(true);
        expect(addFeedback).toHaveBeenCalledWith(TEST_REQUESTER, {
            kind: 'view',
            object: 'pulse',
        });
    });

    it('состояние кнопок: неактивны с подсказкой', () => {
        const view = aiFeedbackView(
            { pending: [], sent: {}, errors: {} },
            'rate',
            'pulse',
            true,
        );
        expect(view.disabled).toBe(true);
        expect(view.pending).toBe(false);
        expect(view.readOnlyHint).toBe(
            'В режиме просмотра реакции не сохраняются',
        );
    });
});

describe('ключи реакций: канал + объект', () => {
    beforeEach(() => addFeedback.mockReset());

    it('view по pulse в пути не блокирует «полезно» по pulse', async () => {
        const view = deferred();
        addFeedback
            .mockReturnValueOnce(view.promise)
            .mockResolvedValueOnce(saved());
        const store = makeAiStore();
        const viewing = store.dispatch(sendAiView('pulse'));
        expect(feedbackOf(store).pending).toEqual([
            aiFeedbackKey('view', 'pulse'),
        ]);

        const ok = await store.dispatch(
            sendAiFeedback({ kind: 'useful', object: 'pulse' }),
        );
        expect(ok).toBe(true);

        view.resolve();
        expect(await viewing).toBe(true);
        expect(feedbackOf(store).pending).toEqual([]);
        // view — телеметрия: в sent только «пальцы».
        expect(feedbackOf(store).sent).toEqual({
            [aiFeedbackKey('rate', 'pulse')]: 'useful',
        });
    });

    it('«Отработано» и «полезно» по одному call:<id> — независимы', async () => {
        const handled = deferred();
        addFeedback
            .mockReturnValueOnce(handled.promise)
            .mockResolvedValueOnce(saved());
        const store = makeAiStore();
        const handling = store.dispatch(
            sendAiFeedback({
                kind: 'alert_handled',
                object: 'call:t-1',
                transcriptionId: 't-1',
            }),
        );
        const rated = await store.dispatch(
            sendAiFeedback({ kind: 'useful', object: 'call:t-1' }),
        );
        expect(rated).toBe(true);

        handled.resolve();
        expect(await handling).toBe(true);
        const { sent } = feedbackOf(store);
        expect(sent[aiFeedbackKey('rate', 'call:t-1')]).toBe('useful');
        expect(sent[aiFeedbackKey('alert_handled', 'call:t-1')]).toBe(
            'alert_handled',
        );
    });

    it('реакция канала в пути — второй клик не уходит («не полезно» делит канал с «полезно»)', async () => {
        const first = deferred();
        addFeedback.mockReturnValueOnce(first.promise);
        const store = makeAiStore();
        const sending = store.dispatch(
            sendAiFeedback({ kind: 'useful', object: 'agenda' }),
        );
        const second = await store.dispatch(
            sendAiFeedback({ kind: 'not_useful', object: 'agenda' }),
        );
        expect(second).toBe(false);
        first.resolve();
        expect(await sending).toBe(true);
        expect(addFeedback).toHaveBeenCalledTimes(1);
    });
});

describe('ошибка записи — у своей кнопки, повтор её снимает', () => {
    beforeEach(() => addFeedback.mockReset());

    it('403 → errors[ключ] с текстом сервера; соседний канал чист', async () => {
        addFeedback.mockRejectedValueOnce(axiosError(403, OUT_OF_SCOPE));
        const store = makeAiStore();
        const ok = await store.dispatch(
            sendAiFeedback({
                kind: 'disagree',
                object: 'overview:7',
                managerId: '7',
            }),
        );
        expect(ok).toBe(false);
        const feedback = feedbackOf(store);
        expect(feedback.pending).toEqual([]);
        expect(feedback.errors).toEqual({
            [aiFeedbackKey('disagree', 'overview:7')]: OUT_OF_SCOPE,
        });
        expect(
            aiFeedbackView(feedback, 'disagree', 'overview:7', false).error,
        ).toBe(`Не сохранилось: ${OUT_OF_SCOPE}`);
        expect(
            aiFeedbackView(feedback, 'rate', 'overview:7', false).error,
        ).toBeNull();
    });

    it('конверт error без текста → запасной текст; успешный повтор снимает ошибку', async () => {
        addFeedback
            .mockResolvedValueOnce({ status: 'error', requestKey: 'k' })
            .mockResolvedValueOnce(saved());
        const store = makeAiStore();
        const key = aiFeedbackKey('useful', 'agenda');
        await store.dispatch(
            sendAiFeedback({ kind: 'useful', object: 'agenda' }),
        );
        expect(feedbackOf(store).errors[key]).toBe(AI_FEEDBACK_SAVE_ERROR);

        const retried = await store.dispatch(
            sendAiFeedback({ kind: 'useful', object: 'agenda' }),
        );
        expect(retried).toBe(true);
        expect(feedbackOf(store).errors[key]).toBeUndefined();
        expect(feedbackOf(store).sent[key]).toBe('useful');
    });
});
