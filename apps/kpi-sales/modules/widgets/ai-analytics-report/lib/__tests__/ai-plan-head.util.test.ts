import { describe, expect, it } from 'vitest';
import type { AiPlanTargetCell } from '@/modules/entities/ai-analytics/model';
import { aiPlanHeadCells, aiSignalHasPlanHead } from '../ai-plan-head.util';

const target = (overrides: Partial<AiPlanTargetCell> = {}): AiPlanTargetCell => ({
    code: 'presentations_done',
    name: 'Презентации',
    unit: 'count',
    factSource: 'kpi',
    periodType: 'month',
    target: 30,
    plan: 88.3,
    fact: 45,
    percent: 0.51,
    ...overrides,
});

describe('ai-plan-head.util — колонка «План руководителя»', () => {
    it('ячейки только по показателям с планом больше нуля, факт null сохраняется', () => {
        const cells = aiPlanHeadCells([
            target(),
            target({ code: 'sales_count', name: 'Продажи', plan: null, target: null }),
            target({ code: 'offers_sent', name: 'КП', plan: 0, target: 0 }),
            target({
                code: 'airtime_minutes',
                name: 'Эфирное время',
                unit: 'minutes',
                factSource: 'airtime',
                plan: 600,
                fact: null,
                percent: null,
            }),
        ]);
        expect(cells.map(cell => cell.code)).toEqual([
            'presentations_done',
            'airtime_minutes',
        ]);
        expect(cells[0]).toEqual({
            code: 'presentations_done',
            name: 'Презентации',
            unit: 'count',
            plan: 88.3,
            fact: 45,
            percent: 0.51,
        });
        expect(cells[1]?.fact).toBeNull();
    });

    it('старый кэш без planTargets — пусто; колонка видна, если план есть хоть у кого-то', () => {
        expect(aiPlanHeadCells(undefined)).toEqual([]);
        expect(aiSignalHasPlanHead([{}, { planTargets: [] }])).toBe(false);
        expect(
            aiSignalHasPlanHead([
                { planTargets: [target({ plan: null })] },
                { planTargets: [target()] },
            ]),
        ).toBe(true);
    });
});
