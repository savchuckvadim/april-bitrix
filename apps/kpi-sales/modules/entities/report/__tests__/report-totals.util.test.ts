import { describe, expect, it } from 'vitest';
import {
    createIndicatorLabeler,
    defaultIndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';
import type { ReportData } from '../model/types/report/report-type';
import { getReportTotalColumns } from '../lib/report-totals.util';

const row = (id: number, counts: Array<[string, string, number]>): ReportData =>
    ({
        id,
        user: { ID: id },
        userName: `Сотрудник ${id}`,
        kpi: counts.map(([innerCode, name, count]) => ({
            id: innerCode,
            action: { innerCode, name },
            count,
        })),
    }) as unknown as ReportData;

const REPORT = [
    row(1, [
        ['presentation_plan', 'План  Презентация', 4],
        ['presentation_done', 'Презентация', 3],
    ]),
    // Порядок показателей у сотрудника другой — сумма по коду
    row(2, [
        ['presentation_done', 'Презентация', 5],
        ['presentation_plan', 'План  Презентация', 1],
    ]),
];

describe('getReportTotalColumns', () => {
    it('сумма по коду, порядок первой строки, названия — выводимые', () => {
        const labelOf = createIndicatorLabeler({ 'ev:presentation_done': 'Встреча' });
        expect(
            getReportTotalColumns(REPORT, labelOf).map(({ code, name, value }) => ({
                code,
                name,
                value,
            })),
        ).toEqual([
            { code: 'presentation_plan', name: 'План Презентация', value: 5 },
            { code: 'presentation_done', name: 'Встреча', value: 8 },
        ]);
    });

    it('показатель без названия — «Unknown»; пустой отчёт — пусто', () => {
        const report = [row(1, [['call_done', '', 2]])];
        expect(getReportTotalColumns(report, defaultIndicatorLabeler)[0]?.name).toBe(
            'Unknown',
        );
        expect(getReportTotalColumns([], defaultIndicatorLabeler)).toEqual([]);
    });
});
