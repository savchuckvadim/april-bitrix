import { describe, expect, it, vi } from 'vitest';
import {
    waitForDealWrite,
    type DealWritePollOptions,
    type DealWriteStatus,
} from '../deal-write-status.util';

const status = (patch: Partial<DealWriteStatus>): DealWriteStatus => ({
    state: 'active',
    done: false,
    ok: false,
    error: null,
    ...patch,
});

const options = (maxAttempts = 5): DealWritePollOptions => ({
    intervalMs: 1000,
    maxAttempts,
    wait: vi.fn(() => Promise.resolve()),
});

describe('ожидание записи полей и строк в сделку', () => {
    it('записано с первого опроса', async () => {
        const fetchStatus = vi.fn().mockResolvedValue(status({ state: 'completed', done: true, ok: true }));

        const outcome = await waitForDealWrite('op-1', fetchStatus, options());

        expect(outcome).toEqual({ kind: 'written' });
        expect(fetchStatus).toHaveBeenCalledWith('op-1');
    });

    it('задание идёт и повторяется, затем записано: опрос продолжается между ответами', async () => {
        const fetchStatus = vi
            .fn()
            .mockResolvedValueOnce(status({ state: 'waiting' }))
            .mockResolvedValueOnce(status({ state: 'retrying' }))
            .mockResolvedValueOnce(status({ state: 'completed', done: true, ok: true }));
        const opts = options();

        const outcome = await waitForDealWrite('op-1', fetchStatus, opts);

        expect(outcome).toEqual({ kind: 'written' });
        expect(fetchStatus).toHaveBeenCalledTimes(3);
        expect(opts.wait).toHaveBeenCalledWith(1000);
    });

    it('не записано: причина с бэка попадает в итог', async () => {
        const fetchStatus = vi
            .fn()
            .mockResolvedValue(status({ state: 'failed', done: true, ok: false, error: 'Bitrix 500' }));

        expect(await waitForDealWrite('op-1', fetchStatus, options())).toEqual({
            kind: 'failed',
            reason: 'Bitrix 500',
        });
    });

    it('сбой опроса не считается ответом: спрашиваем снова', async () => {
        const fetchStatus = vi
            .fn()
            .mockRejectedValueOnce(new Error('сеть'))
            .mockResolvedValueOnce(status({ state: 'completed', done: true, ok: true }));

        expect(await waitForDealWrite('op-1', fetchStatus, options())).toEqual({ kind: 'written' });
        expect(fetchStatus).toHaveBeenCalledTimes(2);
    });

    it('за отведённое время запись не завершилась: pending, опрос ограничен', async () => {
        const fetchStatus = vi.fn().mockResolvedValue(status({ state: 'active' }));

        expect(await waitForDealWrite('op-1', fetchStatus, options(3))).toEqual({ kind: 'pending' });
        expect(fetchStatus).toHaveBeenCalledTimes(3);
    });

    it('задания нет: unknown сразу', async () => {
        const fetchStatus = vi.fn().mockResolvedValue(status({ state: 'not_found' }));

        expect(await waitForDealWrite('op-1', fetchStatus, options())).toEqual({ kind: 'unknown' });
        expect(fetchStatus).toHaveBeenCalledTimes(1);
    });

    it('ручка статуса ни разу не ответила: unknown', async () => {
        const fetchStatus = vi.fn().mockRejectedValue(new Error('502'));

        expect(await waitForDealWrite('op-1', fetchStatus, options(2))).toEqual({ kind: 'unknown' });
        expect(fetchStatus).toHaveBeenCalledTimes(2);
    });
});
