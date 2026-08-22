import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { getCanSkipPlan } from './plan-skip';

const makeState = (over: {
    withNoPlan?: boolean;
    tasksCount?: number | null;
}): RootState =>
    ({
        app: { config: { withNoPlan: over.withNoPlan ?? false } },
        eventTask: {
            tasks:
                over.tasksCount === null || over.tasksCount === undefined
                    ? null
                    : Array.from({ length: over.tasksCount }, (_, i) => ({
                          id: i + 1,
                      })),
        },
    }) as unknown as RootState;

describe('getCanSkipPlan', () => {
    it('одна задача, домен без withNoPlan — пропуск запрещён', () => {
        expect(getCanSkipPlan(makeState({ tasksCount: 1 }))).toBe(false);
    });

    it('задач больше одной — «без плана» разрешено', () => {
        expect(getCanSkipPlan(makeState({ tasksCount: 2 }))).toBe(true);
        expect(getCanSkipPlan(makeState({ tasksCount: 5 }))).toBe(true);
    });

    it('домен с withNoPlan разрешает всегда — прежнее поведение', () => {
        expect(
            getCanSkipPlan(makeState({ withNoPlan: true, tasksCount: 1 })),
        ).toBe(true);
        expect(
            getCanSkipPlan(makeState({ withNoPlan: true, tasksCount: null })),
        ).toBe(true);
    });

    it('список задач ещё не загружен (null) — пропуск запрещён', () => {
        expect(getCanSkipPlan(makeState({ tasksCount: null }))).toBe(false);
        expect(getCanSkipPlan(makeState({ tasksCount: 0 }))).toBe(false);
    });
});
