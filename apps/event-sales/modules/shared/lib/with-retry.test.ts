import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SLOW_SERVER_TEXT, isSlowServerError } from './request-error';
import { RETRY_ATTEMPTS, isRetryable, withRetry } from './with-retry';

const httpError = (status: number) => ({ response: { status } });
const networkError = () => new Error('Network Error');
const timeoutError = () =>
    Object.assign(new Error('timeout of 25000ms exceeded'), {
        code: 'ECONNABORTED',
    });

describe('какие ошибки повторяем', () => {
    it('сеть моргнула (ответа нет) — повторяем', () => {
        expect(isRetryable(networkError())).toBe(true);
    });

    it.each([502, 503, 429])(
        'сервер временно недоступен (%i) — повторяем',
        status => {
            expect(isRetryable(httpError(status))).toBe(true);
        },
    );

    it('таймаут не повторяем: сервер занят, повтор добавит ему работы', () => {
        expect(isRetryable(timeoutError())).toBe(false);
        expect(isRetryable({ code: 'ETIMEDOUT' })).toBe(false);
    });

    it('504 от шлюза — тот же перегруз, не повторяем', () => {
        expect(isRetryable(httpError(504))).toBe(false);
    });

    it.each([400, 403, 404, 500])('%i повтором не лечится', status => {
        expect(isRetryable(httpError(status))).toBe(false);
    });
});

describe('«сервер не успел ответить»', () => {
    it('узнаёт таймаут и 504, но не обычные сбои', () => {
        expect(isSlowServerError(timeoutError())).toBe(true);
        expect(isSlowServerError(httpError(504))).toBe(true);
        expect(isSlowServerError(httpError(500))).toBe(false);
        expect(isSlowServerError(networkError())).toBe(false);
        expect(isSlowServerError(null)).toBe(false);
    });

    it('текст для менеджера — по-русски и без технических слов', () => {
        expect(SLOW_SERVER_TEXT).not.toMatch(/[a-z]/i);
    });
});

describe('withRetry', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('быстрый сетевой сбой — повторяет до успеха', async () => {
        const request = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(networkError())
            .mockResolvedValueOnce('ok');

        const result = withRetry(request);
        await vi.runAllTimersAsync();

        await expect(result).resolves.toBe('ok');
        expect(request).toHaveBeenCalledTimes(2);
    });

    it('таймаут — одна попытка, без повторов', async () => {
        const request = vi
            .fn<() => Promise<string>>()
            .mockRejectedValue(timeoutError());

        const result = withRetry(request);
        const assertion = expect(result).rejects.toThrow('timeout');
        await vi.runAllTimersAsync();
        await assertion;

        expect(request).toHaveBeenCalledTimes(1);
    });

    it('сбой не проходит — сдаётся после отведённых попыток', async () => {
        const request = vi
            .fn<() => Promise<string>>()
            .mockRejectedValue(httpError(503));

        const result = withRetry(request);
        const assertion = expect(result).rejects.toEqual(httpError(503));
        await vi.runAllTimersAsync();
        await assertion;

        expect(request).toHaveBeenCalledTimes(RETRY_ATTEMPTS);
    });
});
