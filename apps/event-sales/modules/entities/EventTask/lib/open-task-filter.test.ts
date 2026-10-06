import { describe, expect, it } from 'vitest';
import {
    OPEN_TASK_FILTER,
    TASK_STATUS_AWAITING_CONTROL,
    TASK_STATUS_COMPLETED,
} from './open-task-filter';

describe('фильтр открытых дел', () => {
    it('отсекает завершённые задачи и задачи, ждущие приёмки постановщиком', () => {
        expect(OPEN_TASK_FILTER).toEqual({ '!REAL_STATUS': [4, 5] });
        expect(TASK_STATUS_AWAITING_CONTROL).toBe(4);
        expect(TASK_STATUS_COMPLETED).toBe(5);
    });

    it('фильтрует по реальному статусу, а не по метастатусу', () => {
        // STATUS в tasks.task.list умеет метастатусы (просрочена, новая),
        // REAL_STATUS — только настоящие; условие «не 4 и не 5» должно
        // смотреть именно на него.
        expect(Object.keys(OPEN_TASK_FILTER)).toEqual(['!REAL_STATUS']);
    });
});
