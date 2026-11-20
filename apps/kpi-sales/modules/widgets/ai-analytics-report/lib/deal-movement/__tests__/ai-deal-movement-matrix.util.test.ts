import { describe, expect, it } from 'vitest';
import {
    AI_DM_HEAT_CLASSES,
    aiDmBuyAnywayTitle,
    aiDmHeatLevel,
    aiDmMatrixRows,
    aiDmMatrixSummary,
    aiDmNoScoreText,
    aiDmPickMatrix,
    isAiDmMatrixMode,
} from '../ai-deal-movement-matrix.util';
import { matrixBlock } from './ai-deal-movement.fixtures';

describe('ai-deal-movement-matrix — тепловая матрица', () => {
    const block = matrixBlock();

    it('насыщенность: пусто — 0, самая полная — максимум, малое — хотя бы 1', () => {
        expect(aiDmHeatLevel(0, 10)).toBe(0);
        expect(aiDmHeatLevel(10, 10)).toBe(AI_DM_HEAT_CLASSES.length - 1);
        expect(aiDmHeatLevel(1, 100)).toBe(1);
        expect(aiDmHeatLevel(5, 0)).toBe(0);
    });

    it('3 полосы × 5 уровней, пустые клетки — ноль, порядок сервера', () => {
        const rows = aiDmMatrixRows(block, block.department);
        expect(rows.map(row => row.band.title)).toEqual([
            'Низкая оценка (1–4)',
            'Средняя оценка (5–7)',
            'Высокая оценка (8–10)',
        ]);
        expect(rows.every(row => row.cells.length === 5)).toBe(true);
        expect(rows[1]?.cells.map(item => item.count)).toEqual([0, 10, 0, 0, 0]);
        expect(rows[1]?.cells[1]?.heatClass).toBe(AI_DM_HEAT_CLASSES[5]);
        expect(rows[1]?.cells[0]?.heatClass).toBe('');
    });

    it('клетка «купил бы и без менеджера» помечена подписью сервера и в подсказке', () => {
        const flagged = aiDmMatrixRows(block, block.department)[0]?.cells[3];
        expect(flagged?.flagged).toBe(true);
        expect(flagged?.flagTitle).toBe('клиент купил бы и без менеджера');
        expect(flagged?.hint).toBe(
            '3 звонка · Низкая оценка (1–4) · продвижение 4 · клиент купил бы и без менеджера',
        );
        // Пустая клетка той же пометки не создаёт.
        expect(aiDmMatrixRows(block, block.department)[0]?.cells[4]?.flagged).toBe(false);
    });

    it('итог: звонков в матрице и пометка; без пометки — только число', () => {
        expect(aiDmMatrixSummary(block.department)).toBe(
            'В матрице 20 звонков · клиент купил бы и без менеджера: 3',
        );
        expect(aiDmMatrixSummary({ ...block.department, buyAnyway: 0 })).toBe(
            'В матрице 20 звонков',
        );
        expect(aiDmBuyAnywayTitle({ cells: [] })).toBeNull();
    });

    it('звонки без оценки — фраза; ноль — ничего', () => {
        expect(aiDmNoScoreText(2)).toBe(
            'Ещё 2 звонка с продвижением, но без оценки — в матрицу не попали.',
        );
        expect(aiDmNoScoreText(0)).toBeNull();
    });

    it('выбор матрицы: отдел; менеджер — выбранный или первый в списке', () => {
        expect(aiDmPickMatrix(block, 'department', '512').matrix).toBe(block.department);
        expect(aiDmPickMatrix(block, 'manager', '512').managerId).toBe('512');
        expect(aiDmPickMatrix(block, 'manager', null).managerId).toBe('447');
        expect(aiDmPickMatrix(block, 'manager', 'пропал').managerId).toBe('447');
        expect(aiDmPickMatrix({ ...block, managers: [] }, 'manager', null)).toEqual({
            matrix: null,
            managerId: null,
        });
        expect(isAiDmMatrixMode('manager')).toBe(true);
        expect(isAiDmMatrixMode('nope')).toBe(false);
    });
});
