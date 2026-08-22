import { describe, expect, it } from 'vitest';
import type { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { EV_PLAN_CODE } from '../type/event-plan-type';
import { buildRescheduleSeed } from './plan-reschedule';

const task = (over: Partial<EventTask>): EventTask =>
    ({
        id: 1,
        name: 'ООО Ромашка',
        eventType: 'warm',
        deadlineRaw: '2026-08-20T10:00:00+03:00',
        ...over,
    }) as EventTask;

describe('buildRescheduleSeed', () => {
    it('берёт название, срок и тип текущей задачи', () => {
        expect(
            buildRescheduleSeed(
                task({ name: '  Созвон  ', eventType: 'presentation' }),
            ),
        ).toEqual({
            name: 'Созвон',
            date: '2026-08-20T10:00:00+03:00',
            typeCode: EV_PLAN_CODE.PRESENTATION,
        });
    });

    it('холодные виды сводятся к одному коду плана', () => {
        for (const eventType of ['xo', 'xoRequest', 'xoLead'] as const) {
            expect(buildRescheduleSeed(task({ eventType })).typeCode).toBe(
                EV_PLAN_CODE.COLD,
            );
        }
    });

    it('незнакомый тип — обычный звонок, задача без срока — null', () => {
        const seed = buildRescheduleSeed(
            task({ eventType: 'ss', deadlineRaw: null }),
        );
        expect(seed.typeCode).toBe(EV_PLAN_CODE.WARM);
        expect(seed.date).toBeNull();
    });
});
