import { describe, expect, it } from 'vitest';

import type { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { findTaskById } from './find-task-by-id.util';

/**
 * Недозвон обязан найти свою задачу: портал отдаёт id строкой, кнопка
 * передаёт число. Без задачи бэк не знает тип события и не пишет
 * «Звонок не состоялся» в KPI и историю.
 */
const task = (id: string | number): EventTask =>
    ({ id, name: 'Звонок ОАО «Завод»', eventType: 'warm' }) as unknown as EventTask;

describe('findTaskById', () => {
    it('находит задачу, когда id в списке строкой, а искомый — числом (и наоборот)', () => {
        const tasks = [task('738563'), task('738570')];

        expect(findTaskById(tasks, 738570)?.id).toBe('738570');
        expect(findTaskById(tasks, '738563')?.id).toBe('738563');
        expect(findTaskById([task(1)], '1')?.id).toBe(1);
    });

    it('нет списка, нет id или мусор — null', () => {
        expect(findTaskById(null, 738563)).toBeNull();
        expect(findTaskById([task('738563')], null)).toBeNull();
        expect(findTaskById([task('738563')], 0)).toBeNull();
        expect(findTaskById([task('738563')], 'abc')).toBeNull();
        expect(findTaskById([task('738563')], 999)).toBeNull();
    });
});
