import { describe, expect, it } from 'vitest';
import {
    FLOW_POLL_INTERVAL_MS,
    FLOW_POLL_TIMEOUT_MS,
    getFlowPollDelayMs,
} from './flow-watch';

describe('пауза между опросами статуса отчёта', () => {
    it('первые секунды — часто: обычный отчёт исполняется быстро', () => {
        expect(getFlowPollDelayMs(0)).toBe(FLOW_POLL_INTERVAL_MS);
        expect(getFlowPollDelayMs(8_999)).toBe(FLOW_POLL_INTERVAL_MS);
    });

    it('отчёт задержался — спрашиваем реже', () => {
        expect(getFlowPollDelayMs(9_000)).toBe(3_000);
        expect(getFlowPollDelayMs(29_999)).toBe(3_000);
        expect(getFlowPollDelayMs(30_000)).toBe(5_000);
        expect(getFlowPollDelayMs(FLOW_POLL_TIMEOUT_MS)).toBe(5_000);
    });

    it('за весь срок ожидания уходит в разы меньше запросов, чем раньше', () => {
        let elapsed = 0;
        let polls = 0;
        while (elapsed < FLOW_POLL_TIMEOUT_MS) {
            polls += 1;
            elapsed += getFlowPollDelayMs(elapsed);
        }
        const before = FLOW_POLL_TIMEOUT_MS / FLOW_POLL_INTERVAL_MS;

        expect(polls).toBeLessThanOrEqual(45);
        expect(polls).toBeLessThan(before / 2);
    });
});
