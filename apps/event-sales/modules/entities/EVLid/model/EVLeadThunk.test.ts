import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { fetchLead } from './EVLeadThunk';
import { eventLeadActions } from './EVLeadSlice';

const h = vi.hoisted(() => ({
    alive: new Set<number>(),
    asked: [] as number[],
}));

vi.mock('@workspace/bitrix', () => ({
    Bitrix: {
        getService: () => ({
            lead: {
                get: vi.fn(async (id: number) => {
                    h.asked.push(id);
                    if (!h.alive.has(id)) {
                        throw new Error('Request failed with status code 400');
                    }
                    return { result: { ID: String(id), TITLE: `Лид ${id}` } };
                }),
            },
        }),
    },
}));

const task = (ufCrmTask: string[]): EventTask =>
    ({ id: 1, ufCrmTask }) as unknown as EventTask;

const run = async (t: EventTask | null) => {
    const dispatch = vi.fn();
    await fetchLead(t)(dispatch as never);
    return dispatch.mock.calls.map(([action]) => action as { type: string });
};

describe('fetchLead', () => {
    beforeEach(() => {
        h.alive = new Set();
        h.asked = [];
    });

    // garant 06.11.2026: лид задачи удалили — экран падал целиком.
    it('удалённый лид не роняет открытие задачи — лид-контекст очищается', async () => {
        const actions = await run(task(['L_215557', 'D_33467', 'CO_168247']));
        expect(actions.map(a => a.type)).toEqual([
            eventLeadActions.clean.type,
        ]);
    });

    it('первый лид удалён — берётся следующий живой', async () => {
        h.alive = new Set([11]);
        const actions = await run(task(['L_215557', 'L_11', 'D_1']));
        expect(h.asked).toEqual([215557, 11]);
        expect(actions.map(a => a.type)).toEqual([
            eventLeadActions.setCurrentLead.type,
        ]);
    });

    it('у задачи нет лидов — без запросов, контекст очищается', async () => {
        const actions = await run(task(['D_1', 'CO_2']));
        expect(h.asked).toEqual([]);
        expect(actions.map(a => a.type)).toEqual([
            eventLeadActions.clean.type,
        ]);
    });
});
