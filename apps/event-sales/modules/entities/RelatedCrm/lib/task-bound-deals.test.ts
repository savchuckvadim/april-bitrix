import { describe, expect, it } from 'vitest';
import type { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import type { RelatedDeal } from '../model';
import { collectTaskBoundDeals } from './task-bound-deals';

const task = (ufCrmTask: string[]): EventTask =>
    ({ id: 1, ufCrmTask }) as unknown as EventTask;

const deal = (id: number): RelatedDeal =>
    ({ id, title: `Сделка ${id}`, closed: false }) as RelatedDeal;

describe('collectTaskBoundDeals', () => {
    it('собирает загруженные сделки по D_-привязкам задач', () => {
        const result = collectTaskBoundDeals(
            [task(['L_330743', 'D_25359'])],
            { 25359: deal(25359) },
        );
        expect(result.map(item => item.id)).toEqual([25359]);
    });

    it('дедупит id между задачами и пропускает незагруженные', () => {
        const result = collectTaskBoundDeals(
            [task(['D_1', 'D_2']), task(['D_1', 'D_3'])],
            { 1: deal(1), 3: deal(3) },
        );
        expect(result.map(item => item.id)).toEqual([1, 3]);
    });

    it('null-задачи и привязки не-сделок молча пропускаются', () => {
        const result = collectTaskBoundDeals(
            [null, undefined, task(['CO_5', 'L_6'])],
            { 5: deal(5), 6: deal(6) },
        );
        expect(result).toEqual([]);
    });
});
