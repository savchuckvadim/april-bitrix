import { describe, expect, it } from 'vitest';
import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import type { ReportData } from '@/modules/entities/report';
import { createIndicatorLabeler } from '@/modules/shared/lib/indicator-labels';
import {
    applyMergedSelection,
    buildCallingRatingDataset,
    buildKpiRatingDataset,
    buildMergedRatingDataset,
} from '../rating.util';
import { labelRatingDataset } from '../rating-labels.util';

/*
 * Рейтинги: свои названия ставятся ПОСЛЕ отборов по названию (состав
 * объединённого отчёта, выбор «Колонки»); выбор показателя — по коду.
 */

const KPI_NAMES: Record<string, string> = {
    result_communication_plan: 'План',
    call_done: 'Звонок совершен',
    presentation_done: 'Презентация',
    offer: 'КП',
};

const kpiRow = (id: number, counts: Record<string, number>): ReportData =>
    ({
        id,
        user: { ID: id, NAME: `Имя${id}`, LAST_NAME: 'Тестов' },
        userName: `Имя${id}`,
        kpi: Object.entries(counts).map(([innerCode, count]) => ({
            id: innerCode,
            action: { innerCode, name: KPI_NAMES[innerCode] ?? innerCode },
            count,
        })),
    }) as unknown as ReportData;

const callingRow = (id: number, half: number): ReportCallingData =>
    ({
        userId: id,
        user: { ID: id, NAME: `Имя${id}`, LAST_NAME: 'Тестов' },
        callings: [{ id: 30, action: 'Звонки > 30 сек', count: half }],
    }) as unknown as ReportCallingData;

const REPORT = [
    kpiRow(1, { result_communication_plan: 5, call_done: 9, presentation_done: 3, offer: 2 }),
    kpiRow(2, { result_communication_plan: 1, call_done: 4, presentation_done: 1, offer: 0 }),
];
const CALLINGS = [callingRow(1, 12), callingRow(2, 7)];

const labelOf = createIndicatorLabeler({
    'ev:presentation_done': 'Звонок-встреча',
    'ev:offer': 'Звонок-встреча',
    'ev:call_done': 'Дозвоны',
    'call:30': 'Дозвоны от 30 с',
});

describe('labelRatingDataset', () => {
    it('события и звонки: названия по коду, коды и значения прежние', () => {
        const kpi = labelRatingDataset(buildKpiRatingDataset(REPORT), labelOf);
        expect(kpi.actions.map(action => [action.code, action.name])).toEqual([
            ['result_communication_plan', 'План'],
            ['call_done', 'Дозвоны'],
            ['presentation_done', 'Звонок-встреча'],
            ['offer', 'Звонок-встреча'],
        ]);
        expect(kpi.rows).toEqual(buildKpiRatingDataset(REPORT).rows);

        const callings = labelRatingDataset(buildCallingRatingDataset(CALLINGS), labelOf);
        expect(callings.actions.map(action => [action.code, action.name])).toEqual([
            ['30', 'Дозвоны от 30 с'],
        ]);
    });

    it('объединённый: состав и выбор по исходным названиям, подписи — свои', () => {
        const dataset = labelRatingDataset(
            applyMergedSelection(buildMergedRatingDataset(REPORT, CALLINGS), {
                selectedUsers: [],
                selectedActions: ['Звонки > 30 сек', 'Презентация', 'КП'],
            }),
            labelOf,
        );
        // «Звонок совершен» и «План» не входят (по исходным), своё название
        // со словом «звонок» показатель не исключает; одинаковые — оба.
        expect(dataset.actions.map(action => [action.code, action.name])).toEqual([
            ['30', 'Дозвоны от 30 с'],
            ['presentation_done', 'Звонок-встреча'],
            ['offer', 'Звонок-встреча'],
        ]);
    });
});
