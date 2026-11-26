import { describe, expect, it } from 'vitest';
import type { RTableRow } from '@workspace/april-ui';
import { getCallingStatisticsTableData } from '@/modules/entities/calling-statistics/lib/ui-util';
import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import { getReportTableData } from '@/modules/entities/report/lib/ui-util';
import type { ReportData } from '@/modules/entities/report/model/types/report/report-type';
import {
    createIndicatorLabeler,
    labelTableRows,
} from '@/modules/shared/lib/indicator-labels';
import { getIsFiltredKpiReportForMergedReport } from '@/modules/shared/lib/merged-actions.util';
import {
    getKpidReportsExcelData,
    getMergedReportsData,
    getMergedReportsExcelData,
    labelExcelRows,
} from '../merge-reports.util';
import {
    getMergedColumnNames,
    resolveCheckedColumns,
    selectMergedTableRows,
} from '../merged-table-selection.util';
import {
    getMergedColumnLabels,
    getMergedTotalColumns,
} from '../merged-labels.util';
import {
    CALLINGS_ALL,
    CALL_ALL,
    CALL_HALF,
    CALL_MINUTE,
    EVENTS_PLAIN,
    EV_OFFER,
    EV_PRESENTATION,
} from './merge-reports.fixtures';

/*
 * Свои названия показателей в объединённом отчёте — ТОЛЬКО в выводе.
 * Объединение, состав колонок (merged-actions.util) и выбор «Колонки»
 * (хранится исходными названиями) работают по исходным названиям.
 */

/** Экран: те же шаги, что в MergedReportTable (таблицы из сырых отчётов → merge). */
const mergedRows = (
    events: ReportData[] = EVENTS_PLAIN,
    callings: ReportCallingData[] = CALLINGS_ALL,
): RTableRow[] =>
    getMergedReportsData(
        getReportTableData(events),
        getCallingStatisticsTableData(callings),
    ).data;

/** На проде id показателя события — его innerCode (бэк: kpi-report.use-case). */
const withCodeIds = (rows: ReportData[]): ReportData[] =>
    rows.map(row => ({
        ...row,
        kpi: row.kpi.map(kpi => ({
            ...kpi,
            id: kpi.action.innerCode as unknown as number,
        })),
    }));

const names = (row: RTableRow | undefined): string[] =>
    row?.actions.map(action => action.name) ?? [];

describe('выбор «Колонки» по исходным названиям при своих названиях', () => {
    const labelOf = createIndicatorLabeler({
        'call:30': 'Дозвоны',
        'ev:presentation_done': 'Встреча',
    });
    const saved = [CALL_HALF, EV_PRESENTATION];

    it('сохранённый выбор продолжает выбирать колонки, шапка — свои названия', () => {
        const rows = mergedRows();
        const shown = labelTableRows(
            selectMergedTableRows(rows, { selectedUsers: [], selectedActions: saved }),
            labelOf,
        );

        expect(shown).toHaveLength(3);
        expect(names(shown[0])).toEqual(['Дозвоны', 'Встреча']);
        expect(shown[0]?.actions.map(action => action.code)).toEqual([
            '30',
            'presentation_done',
        ]);
        expect(shown[0]?.actions.map(action => action.value)).toEqual([25, 3]);
    });

    it('список «Колонки»: отметки по исходным названиям, подписи — свои', () => {
        const rows = mergedRows();
        const columns = getMergedColumnNames(rows);
        const labels = getMergedColumnLabels(rows, labelOf);

        expect(columns).toEqual([CALL_ALL, CALL_HALF, CALL_MINUTE, EV_PRESENTATION, EV_OFFER]);
        expect(resolveCheckedColumns(columns, saved)).toEqual(saved);
        expect(columns.map(column => labels.get(column))).toEqual([
            CALL_ALL,
            'Дозвоны',
            CALL_MINUTE,
            'Встреча',
            EV_OFFER,
        ]);
    });

    it('итог: выбранные колонки по исходным названиям, подписи — свои', () => {
        const rows = selectMergedTableRows(mergedRows(), {
            selectedUsers: [],
            selectedActions: saved,
        });
        expect(getMergedTotalColumns(rows, saved, labelOf)).toEqual([
            { code: '30', name: 'Дозвоны', value: 25 + 18 + 5 },
            { code: 'presentation_done', name: 'Встреча', value: 3 + 5 + 0 },
        ]);
    });
});

describe('два показателя с одинаковым своим названием', () => {
    const labelOf = createIndicatorLabeler({
        'ev:presentation_done': 'Встреча',
        'ev:ev_offer_act_send': 'Встреча',
    });

    it('оба остаются в таблице со своими значениями', () => {
        const shown = labelTableRows(mergedRows(), labelOf);
        expect(names(shown[0])).toEqual([CALL_ALL, CALL_HALF, CALL_MINUTE, 'Встреча', 'Встреча']);
        expect(shown[0]?.actions.map(action => action.value)).toEqual([40, 25, 12, 3, 2]);
    });

    it('оба остаются в строках Excel с прежними id', () => {
        const rows = labelExcelRows(
            getMergedReportsExcelData(withCodeIds(EVENTS_PLAIN), CALLINGS_ALL, [], []),
            labelOf,
        );
        expect(rows[0]?.kpi).toEqual([
            { id: 'all', action: CALL_ALL, count: 40 },
            { id: '30', action: CALL_HALF, count: 25 },
            { id: '60', action: CALL_MINUTE, count: 12 },
            { id: 'presentation_done', action: 'Встреча', count: 3 },
            { id: 'ev_offer_act_send', action: 'Встреча', count: 2 },
        ]);
    });
});

describe('состав объединённого отчёта — по исходным названиям', () => {
    const labelOf = createIndicatorLabeler({
        'ev:presentation_done': 'Звонок-встреча',
        'ev:call_done': 'Дозвоны',
        'ev:result_communication_plan': 'Запланировано',
    });

    it('своё название со словом «звонок» колонку не исключает', () => {
        expect(getIsFiltredKpiReportForMergedReport('Звонок-встреча')).toBe(false);
        const shown = labelTableRows(mergedRows(), labelOf);
        expect(names(shown[0])).toContain('Звонок-встреча');
    });

    it('исходно исключённые («План», «Звонок совершен») не возвращаются своим названием', () => {
        const shown = labelTableRows(mergedRows(), labelOf);
        expect(names(shown[0])).not.toContain('Дозвоны');
        expect(names(shown[0])).not.toContain('Запланировано');
        expect(shown[0]?.actions.map(action => action.code)).toEqual([
            'all',
            '30',
            '60',
            'presentation_done',
            'ev_offer_act_send',
        ]);
    });
});

describe('Excel: свои названия последним шагом', () => {
    const labelOf = createIndicatorLabeler({
        'call:30': 'Дозвоны',
        'ev:presentation_done': 'Встреча',
        'ev:call_done': 'Дозвоны по событиям',
    });

    it('события: заголовки — свои, id, значения и порядок прежние', () => {
        const raw = getKpidReportsExcelData(withCodeIds(EVENTS_PLAIN));
        const labeled = labelExcelRows(raw, labelOf);

        expect(labeled.map(row => row.id)).toEqual(raw.map(row => row.id));
        labeled.forEach((row, index) => {
            const source = raw[index]!;
            expect(row.userName).toBe(source.userName);
            expect(row.kpi.map(kpi => kpi.id)).toEqual(source.kpi.map(kpi => kpi.id));
            expect(row.kpi.map(kpi => kpi.count)).toEqual(
                source.kpi.map(kpi => kpi.count),
            );
        });
        expect(labeled[0]?.kpi.map(kpi => kpi.action)).toEqual([
            'План',
            'Результативные',
            'Дозвоны по событиям',
            'Встреча',
            EV_OFFER,
        ]);
    });

    it('объединённый: выбор по исходным названиям, затем свои заголовки', () => {
        const rows = labelExcelRows(
            getMergedReportsExcelData(withCodeIds(EVENTS_PLAIN), CALLINGS_ALL, [], [
                CALL_HALF,
                EV_PRESENTATION,
            ]),
            labelOf,
        );
        expect(rows.map(row => row.kpi)).toEqual([
            [
                { id: '30', action: 'Дозвоны', count: 25 },
                { id: 'presentation_done', action: 'Встреча', count: 3 },
            ],
            [
                { id: '30', action: 'Дозвоны', count: 18 },
                { id: 'presentation_done', action: 'Встреча', count: 5 },
            ],
            [
                { id: '30', action: 'Дозвоны', count: 5 },
                { id: 'presentation_done', action: 'Встреча', count: 0 },
            ],
        ]);
    });

    it('без своего названия — исходное без лишних пробелов; входные строки не меняются', () => {
        const raw = [
            {
                id: 1,
                userName: 'Иванов Иван',
                kpi: [{ id: 'presentation_plan', action: 'План  Презентация', count: 4 }],
            },
        ];
        const before = JSON.stringify(raw);
        expect(labelExcelRows(raw, labelOf)[0]?.kpi[0]?.action).toBe('План Презентация');
        expect(JSON.stringify(raw)).toBe(before);
    });
});
