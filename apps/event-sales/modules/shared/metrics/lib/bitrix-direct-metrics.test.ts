import { describe, expect, it, vi } from 'vitest';
import { createBitrixDirectMetrics } from './bitrix-direct-metrics';

describe('createBitrixDirectMetrics', () => {
    it('вызовы копятся и уходят суммой по исходу — одно событие на исход', () => {
        const send = vi.fn();
        let scheduled: (() => void) | null = null;
        const counter = createBitrixDirectMetrics(send, flush => {
            scheduled = flush;
        });

        counter.record('ok');
        counter.record('ok');
        counter.record('limit');
        expect(send).not.toHaveBeenCalled();

        (scheduled as unknown as () => void)();

        expect(send).toHaveBeenCalledTimes(2);
        expect(send).toHaveBeenCalledWith('ok', 2);
        expect(send).toHaveBeenCalledWith('limit', 1);
    });

    it('одна отложенная отправка на окно, после неё — новое окно', () => {
        const schedule = vi.fn();
        const counter = createBitrixDirectMetrics(vi.fn(), schedule);

        counter.record('ok');
        counter.record('error');
        expect(schedule).toHaveBeenCalledTimes(1);

        counter.flush();
        counter.record('ok');
        expect(schedule).toHaveBeenCalledTimes(2);
    });

    it('после отправки счётчики обнуляются', () => {
        const send = vi.fn();
        const counter = createBitrixDirectMetrics(send, () => undefined);

        counter.record('ok');
        counter.flush();
        counter.flush();

        expect(send).toHaveBeenCalledTimes(1);
    });
});
