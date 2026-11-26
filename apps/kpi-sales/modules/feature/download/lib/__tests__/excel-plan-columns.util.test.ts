import { describe, expect, it } from 'vitest';
import type { DownloadKpiReportItemDto } from '@workspace/nest-kpi-report-sales-api';
import { createIndicatorLabeler } from '@/modules/shared/lib/indicator-labels';
import { labelExcelRows } from '@/modules/feature/merged-kpi-calling-report/lib/merge-reports.util';
import {
    achievementByUser,
    tablePlanColumnSpecs,
    type PlanColumnsGate,
} from '@/modules/feature/plans/lib/plan-columns.util';
import {
    INDICATORS,
    IVANOV,
    PETROV,
} from '@/modules/feature/plans/lib/__tests__/plan-columns.fixtures';
import {
    hasExcelPlanColumns,
    withExcelPlanColumns,
} from '../excel-plan-columns.util';

const GATE: PlanColumnsGate = {
    isPublic: false,
    canView: true,
    canViewAll: true,
    flags: { plansEvents: true, plansMerged: true, plansCallings: false },
    hiddenCodes: [],
};

/** Строки объединённого отчёта после отбора колонок: бакеты, затем события. */
const excelRow = (id: number, userName: string): DownloadKpiReportItemDto => ({
    id,
    userName,
    kpi: [
        { id: '30', action: 'Звонки > 30 сек', count: 25 },
        { id: 'call_done', action: ' Звонок', count: 7 },
        { id: 'presentation_done', action: 'Презентация  проведена', count: 3 },
        { id: 'ev_success_done', action: 'Сделка', count: 1 },
    ],
});

const ROWS = [excelRow(1, 'Иванов'), excelRow(2, 'Петров'), excelRow(3, 'Сидоров')];
const labelOf = createIndicatorLabeler({
    'ev:presentation_done': 'Встреча',
    'plan:calls_over_30s': 'План',
});
const ALL = achievementByUser([IVANOV, PETROV]);

/** Как в download-thunk: свои названия, затем колонки планов. */
const build = (
    tab: 'events' | 'merged',
    achievement = ALL,
    rows: DownloadKpiReportItemDto[] = ROWS,
) =>
    withExcelPlanColumns(
        labelExcelRows(rows, labelOf),
        tablePlanColumnSpecs(tab, INDICATORS, GATE),
        achievement,
        labelOf,
    );

describe('withExcelPlanColumns', () => {
    it('колонка плана — перед своим фактом, с видом plan и заметкой к шапке', () => {
        const [ivanov] = build('merged');
        expect(ivanov?.kpi).toEqual([
            {
                id: 'plan:calls_over_30s',
                action: 'План',
                count: 30,
                kind: 'plan',
                note: 'План по показателю «Звонки > 30 сек» (на месяц), пересчитан на выбранный период',
            },
            { id: '30', action: 'Звонки > 30 сек', count: 25 },
            {
                id: 'plan:calls_done',
                action: 'План: Звонок',
                count: 10,
                kind: 'plan',
                note: 'План по показателю «Звонок» (на месяц), пересчитан на выбранный период',
            },
            { id: 'call_done', action: 'Звонок', count: 7 },
            {
                id: 'plan:presentations_done',
                action: 'План: Встреча',
                count: 5,
                kind: 'plan',
                note: 'План по показателю «Встреча» (на квартал), пересчитан на выбранный период',
            },
            { id: 'presentation_done', action: 'Встреча', count: 3 },
            { id: 'ev_success_done', action: 'Сделка', count: 1 },
        ]);
    });

    it('плана нет и сотрудник вне области видимости — count null', () => {
        const [, petrov, sidorov] = build('merged');
        const planOf = (codes: { id: string; count: number | null }[] | undefined, id: string) =>
            codes?.find(kpi => kpi.id === id)?.count;
        expect(planOf(petrov?.kpi, 'plan:calls_done')).toBe(20);
        expect(planOf(petrov?.kpi, 'plan:presentations_done')).toBeNull();
        expect(planOf(sidorov?.kpi, 'plan:calls_done')).toBeNull();
    });

    it('рядовой: план только в своей строке', () => {
        const [ivanov, petrov] = build('merged', achievementByUser([PETROV]));
        expect(ivanov?.kpi.filter(kpi => kpi.kind === 'plan').map(kpi => kpi.count)).toEqual([
            null,
            null,
            null,
        ]);
        expect(petrov?.kpi.find(kpi => kpi.id === 'plan:calls_done')?.count).toBe(20);
    });

    it('таблица событий (и вкладка «Звонки»): колонок планов бакетов нет', () => {
        const [ivanov] = build('events');
        expect(ivanov?.kpi.map(kpi => kpi.id)).toEqual([
            '30',
            'plan:calls_done',
            'call_done',
            'plan:presentations_done',
            'presentation_done',
            'ev_success_done',
        ]);
    });

    it('факт убран отбором колонок — колонки плана нет; id и порядок прежние', () => {
        const narrowed = ROWS.map(row => ({
            ...row,
            kpi: row.kpi.filter(kpi => kpi.id !== 'call_done'),
        }));
        const [ivanov] = build('merged', ALL, narrowed);
        expect(ivanov?.kpi.map(kpi => kpi.id)).toEqual([
            'plan:calls_over_30s',
            '30',
            'plan:presentations_done',
            'presentation_done',
            'ev_success_done',
        ]);
    });

    it('выключенный флаг — строки как после своих названий, без колонок планов', () => {
        const labeled = labelExcelRows(ROWS, labelOf);
        const rows = withExcelPlanColumns(
            labeled,
            tablePlanColumnSpecs('events', INDICATORS, {
                ...GATE,
                flags: { plansEvents: false, plansMerged: true, plansCallings: true },
            }),
            ALL,
            labelOf,
        );
        expect(rows).toEqual(labeled);
        expect(hasExcelPlanColumns(rows)).toBe(false);
        expect(hasExcelPlanColumns(build('events'))).toBe(true);
    });
});
