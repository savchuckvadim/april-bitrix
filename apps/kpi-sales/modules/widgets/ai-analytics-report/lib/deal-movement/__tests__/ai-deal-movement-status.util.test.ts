import { describe, expect, it } from 'vitest';
import { AI_DEAL_MOVEMENT_STATUSES } from '@/modules/entities/ai-analytics';
import {
    AI_DM_STATUS_COLOR_TOKEN,
    AI_DM_STATUS_TONE,
    aiDmAlarmCells,
    aiDmCellOf,
    aiDmOrderedCells,
    aiDmSortManagers,
    aiDmStatusTitles,
} from '../ai-deal-movement-status.util';
import { cell, departmentCells, manager } from './ai-deal-movement.fixtures';

describe('ai-deal-movement-status — ячейки статусов', () => {
    it('у каждого статуса есть тон и токен цвета темы', () => {
        for (const status of AI_DEAL_MOVEMENT_STATUSES) {
            expect(AI_DM_STATUS_TONE[status]).toBeTruthy();
            expect(AI_DM_STATUS_COLOR_TOKEN[status]).toMatch(/^--/);
        }
    });

    it('пять статусов в постоянном порядке, пропавший — пустой с подписью из запаса', () => {
        const titles = aiDmStatusTitles(departmentCells());
        const ordered = aiDmOrderedCells(
            [cell('moving', 4), cell('stuck', 1)],
            titles,
        );
        expect(ordered.map(item => item.status)).toEqual([...AI_DEAL_MOVEMENT_STATUSES]);
        expect(ordered[0]).toEqual({
            status: 'rolled_back',
            title: 'Вернулась назад',
            count: 0,
            amountSum: null,
        });
        expect(ordered[2]?.count).toBe(1);
    });

    it('без запасных подписей пропавшая ячейка — без подписи (свою не придумываем)', () => {
        expect(aiDmCellOf([], 'stuck').title).toBe('');
    });

    it('фильтр статусов — только тревожные с подписью сервера', () => {
        expect(aiDmAlarmCells(departmentCells()).map(item => item.title)).toEqual([
            'Вернулась назад',
            'Без внимания',
            'Без продвижения',
            'Под риском',
        ]);
        expect(aiDmAlarmCells([cell('moving', 3)])).toEqual([]);
    });

    it('менеджеры: больше проблемных выше, при равенстве — больше сумма, затем имя', () => {
        const sorted = aiDmSortManagers([
            manager('1', 3, 100, 'Яковлев'),
            manager('2', 10, 50),
            manager('3', 3, 500),
            manager('4', 3, 100, 'Абрамов'),
        ]);
        expect(sorted.map(item => item.managerId)).toEqual(['2', '3', '4', '1']);
    });
});
