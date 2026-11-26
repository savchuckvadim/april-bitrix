import { describe, expect, it } from 'vitest';
import { buildPlanAnnotations } from '../plan-annotations.util';
import type { PlanAchievementRow } from '../plan-achievement.util';
import { INDICATORS } from './plan-columns.fixtures';

/** Иванов: звонки — план 10, факт 5 (50 %); презентации — план 4, факт 4. */
const ROWS: PlanAchievementRow[] = [
    {
        userId: 1,
        userName: 'Иванов',
        cells: INDICATORS.map(indicator => {
            if (indicator.code === 'calls_done') {
                return { code: indicator.code, plan: 10, fact: 5, percent: 0.5 };
            }
            if (indicator.code === 'presentations_done') {
                return { code: indicator.code, plan: 4, fact: 4, percent: 1 };
            }
            return { code: indicator.code, plan: null, fact: 0, percent: null };
        }),
    },
];

describe('buildPlanAnnotations', () => {
    it('без колонки плана — «⌖ план · %»', () => {
        const annotations = buildPlanAnnotations('kpi', INDICATORS, ROWS, 0.5);
        expect(annotations.get('1:call_done')?.text).toBe('⌖ 10 · 50%');
        expect(annotations.get('1:presentation_done')?.text).toBe('⌖ 4 · 100%');
    });

    it('у показателя с колонкой плана — только процент, подсказка полная', () => {
        const annotations = buildPlanAnnotations(
            'kpi',
            INDICATORS,
            ROWS,
            0.5,
            new Set(['calls_done']),
        );
        const calls = annotations.get('1:call_done');
        expect(calls?.text).toBe('⌖ 50%');
        expect(calls?.tooltip).toContain('пересчитан на выбранный период: 10.');
        expect(calls?.tooltip).toContain('Факт: 5 · выполнение 50%.');
        // Показатель без колонки плана — как раньше
        expect(annotations.get('1:presentation_done')?.text).toBe('⌖ 4 · 100%');
    });

    it('только показатели своего источника', () => {
        const annotations = buildPlanAnnotations(
            'calling',
            INDICATORS,
            ROWS,
            0.5,
            new Set(['calls_done']),
        );
        expect(annotations.size).toBe(0);
    });
});
