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
    it('CRM-строка дедлайна тоже нормализуется в формат контрола', () => {
        expect(
            buildRescheduleSeed(task({ deadlineRaw: '31.08.2026 06:51:00' }))
                .date,
        ).toBe('2026-08-31 06:51');
    });

    it('мусорный дедлайн — null, а не подставленное «сегодня»', () => {
        expect(
            buildRescheduleSeed(task({ deadlineRaw: 'мусор' })).date,
        ).toBeNull();
    });


    it('берёт название, срок и тип текущей задачи', () => {
        expect(
            buildRescheduleSeed(
                task({ name: '  Созвон  ', eventType: 'presentation' }),
            ),
        ).toEqual({
            name: 'Созвон',
            // ISO дедлайна нормализован в формат КОНТРОЛА: сырой ISO пикер
            // не разбирал, показывал пустую дату, и перенос уезжал на
            // «сегодня» (todo3108 №2). Настенное время без сдвига таймзоной.
            date: '2026-08-20 10:00',
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
