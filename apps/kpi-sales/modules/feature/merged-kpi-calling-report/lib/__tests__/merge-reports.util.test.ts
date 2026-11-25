import { describe, expect, it } from 'vitest';
import type { RTableProps } from '@/modules/shared';
import { getCallingStatisticsTableData } from '@/modules/entities/calling-statistics/lib/ui-util';
import { getReportTableData } from '@/modules/entities/report/lib/ui-util';
import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import type { ReportData } from '@/modules/entities/report/model/types/report/report-type';
import {
    getMergedReportsData,
    getMergedReportsExcelData,
} from '../merge-reports.util';
import {
    CALLINGS_ALL,
    CALLINGS_MIXED,
    CALL_ALL,
    CALL_HALF,
    CALL_MINUTE,
    EVENTS_ALL,
    EVENTS_MIXED,
    EVENTS_PLAIN,
    EV_OFFER,
    EV_PRESENTATION,
    callKpi,
    eventKpi,
    makeCall,
    makeCallingRow,
    makeEventsRow,
    makeKpi,
} from './merge-reports.fixtures';

/** Экран: те же шаги, что в MergedReportTable (таблицы из сырых отчётов → merge). */
const screen = (
    events: ReportData[],
    callings: ReportCallingData[],
): RTableProps =>
    getMergedReportsData(
        getReportTableData(events),
        getCallingStatisticsTableData(callings),
    );

const rowIds = (table: RTableProps): Array<number | undefined> =>
    table.data.map(row => row.id);

const columnNames = (table: RTableProps): string[][] =>
    table.data.map(row => row.actions.map(action => action.name));

const CALL_COLUMNS = [CALL_ALL, CALL_HALF, CALL_MINUTE];
const EVENT_COLUMNS = [EV_PRESENTATION, EV_OFFER];
const ALL_COLUMNS = [...CALL_COLUMNS, ...EVENT_COLUMNS];

/**
 * Эталон «как раньше»: значения записаны запуском прежних функций
 * (getMergedReportsData / getMergedReportsExcelData до правок) на
 * фикстурах CALLINGS_ALL + EVENTS_*: пять показателей на сотрудника.
 */
type FiveValues = [number, number, number, number, number];

const legacyScreenRow = (
    id: number,
    name: string,
    [all, half, minute, presentation, offer]: FiveValues,
) => ({
    id,
    name,
    actions: [
        { name: CALL_ALL, value: all, code: 'all' },
        { name: CALL_HALF, value: half, code: '30' },
        { name: CALL_MINUTE, value: minute, code: '60' },
        { name: EV_PRESENTATION, value: presentation, code: 'presentation_done' },
        { name: EV_OFFER, value: offer, code: 'ev_offer_act_send' },
    ],
});

const excelKpi = (
    id: string,
    action: string,
    count: number,
) => ({ id, action, count });

const legacyExcelRow = (
    id: number,
    userName: string,
    [all, half, minute, presentation, offer]: FiveValues,
) => ({
    id,
    userName,
    kpi: [
        excelKpi('all', CALL_ALL, all),
        excelKpi('30', CALL_HALF, half),
        excelKpi('60', CALL_MINUTE, minute),
        excelKpi('103', EV_PRESENTATION, presentation),
        excelKpi('104', EV_OFFER, offer),
    ],
});

const LEGACY_VALUES: Record<'ivan' | 'petr' | 'sidor', FiveValues> = {
    ivan: [40, 25, 12, 3, 2],
    petr: [30, 18, 7, 5, 1],
    sidor: [10, 5, 1, 0, 0],
};

describe('getMergedReportsData', () => {
    describe('все сотрудники есть в обоих источниках — как раньше', () => {
        const expected = {
            code: 'report',
            firstCellName: 'Менеджер',
            data: [
                legacyScreenRow(10, 'Иван Иванов', LEGACY_VALUES.ivan),
                legacyScreenRow(20, 'Пётр Петров', LEGACY_VALUES.petr),
                legacyScreenRow(30, 'Сидор Сидоров', LEGACY_VALUES.sidor),
            ],
        };

        it('результат совпадает с прежним (колонки звонков, затем события)', () => {
            expect(screen(EVENTS_PLAIN, CALLINGS_ALL)).toEqual(expected);
        });

        it('показатель события с названием показателя звонков не дублируется, остаётся значение звонков', () => {
            // EVENTS_ALL: у каждого есть событие «Звонки > 30 сек» (99/98/97)
            const result = screen(EVENTS_ALL, CALLINGS_ALL);

            expect(result).toEqual(expected);
            result.data.forEach(row => {
                expect(
                    row.actions.filter(action => action.name === CALL_HALF),
                ).toHaveLength(1);
            });
        });
    });

    describe('состав сотрудников', () => {
        const result = screen(EVENTS_MIXED, CALLINGS_MIXED);

        it('в порядке звонков, затем те, кто есть только в событиях', () => {
            // звонки: 20, 10, 30; только события: 40
            expect(rowIds(result)).toEqual([20, 10, 30, 40]);
        });

        it('сотрудник только из звонков остаётся строкой с нулями по событиям', () => {
            const row = result.data.find(item => item.id === 30);

            expect(row).toEqual({
                id: 30,
                name: 'Сидор Сидоров',
                actions: [
                    { name: CALL_ALL, value: 10, code: 'all' },
                    { name: CALL_HALF, value: 5, code: '30' },
                    { name: CALL_MINUTE, value: 1, code: '60' },
                    { name: EV_PRESENTATION, value: 0, code: 'presentation_done' },
                    { name: EV_OFFER, value: 0, code: 'ev_offer_act_send' },
                ],
            });
        });

        it('сотрудник только из событий остаётся строкой с нулями по звонкам', () => {
            const row = result.data.find(item => item.id === 40);

            expect(row).toEqual({
                id: 40,
                name: 'Анна Антонова',
                actions: [
                    { name: CALL_ALL, value: 0, code: 'all' },
                    { name: CALL_HALF, value: 0, code: '30' },
                    { name: CALL_MINUTE, value: 0, code: '60' },
                    { name: EV_PRESENTATION, value: 7, code: 'presentation_done' },
                    { name: EV_OFFER, value: 6, code: 'ev_offer_act_send' },
                ],
            });
        });

        it('сотрудник в обоих источниках: значения звонков и событий свои', () => {
            const row = result.data.find(item => item.id === 10);

            expect(row?.actions.map(action => action.value)).toEqual([
                40, 25, 12, 3, 2,
            ]);
        });

        it('код и подписи таблицы берутся из таблицы событий', () => {
            expect(result.code).toBe('report');
            expect(result.firstCellName).toBe('Менеджер');
        });

        it('шапка сотрудника из обоих источников — из звонков', () => {
            const callings = [
                makeCallingRow(10, 'Иван', 'Иванов', callKpi(1, 1, 1)),
            ];
            const events = [
                {
                    ...makeEventsRow(10, 'Иван', 'Иванов', eventKpi(0, 0, 0, 1, 1)),
                    userName: 'Иванов И. (из событий)',
                },
            ];

            expect(screen(events, callings).data[0]?.name).toBe('Иван Иванов');
        });
    });

    describe('набор колонок', () => {
        it('у всех строк одинаковый: показатели звонков, затем события', () => {
            const result = screen(EVENTS_MIXED, CALLINGS_MIXED);

            result.data.forEach((row, index) => {
                expect(columnNames(result)[index]).toEqual(ALL_COLUMNS);
                expect(row.actions).toHaveLength(ALL_COLUMNS.length);
            });
        });

        it('не зависит от того, чьих строк больше: колонки сотрудника только из событий не теряются', () => {
            // у звонков 3 колонки, у события-only сотрудника — 2 нужных + 1 свой;
            // самая длинная строка не должна вытеснять колонки звонков
            const callings = [
                makeCallingRow(10, 'Иван', 'Иванов', callKpi(40, 25, 12)),
            ];
            const events = [
                makeEventsRow(10, 'Иван', 'Иванов', eventKpi(0, 0, 0, 3, 2)),
                makeEventsRow(40, 'Анна', 'Антонова', [
                    ...eventKpi(0, 0, 0, 7, 6),
                    makeKpi(106, 'ev_invoice_act_send', 'Счёт выставлен', 4),
                    makeKpi(107, 'ev_contract_act_send', 'Договор отправлен', 1),
                    makeKpi(108, 'ev_success_done', 'Оплачен', 9),
                ]),
            ];
            const result = screen(events, callings);

            expect(columnNames(result)).toEqual([
                [...ALL_COLUMNS, 'Счёт выставлен', 'Договор отправлен', 'Оплачен'],
                [...ALL_COLUMNS, 'Счёт выставлен', 'Договор отправлен', 'Оплачен'],
            ]);
            expect(result.data[0]?.actions.map(action => action.value)).toEqual([
                40, 25, 12, 3, 2, 0, 0, 0,
            ]);
            expect(result.data[1]?.actions.map(action => action.value)).toEqual([
                0, 0, 0, 7, 6, 4, 1, 9,
            ]);
        });

        it('колонка звонков, которой нет у части сотрудников, есть у всех с нулём', () => {
            const callings = [
                makeCallingRow(10, 'Иван', 'Иванов', callKpi(40, 25, 12)),
                makeCallingRow(30, 'Сидор', 'Сидоров', [
                    makeCall('all', CALL_ALL, 10),
                    makeCall('180', 'Звонки > 3 минут', 2),
                ]),
            ];
            const events = [
                makeEventsRow(10, 'Иван', 'Иванов', eventKpi(0, 0, 0, 3, 2)),
                makeEventsRow(30, 'Сидор', 'Сидоров', eventKpi(0, 0, 0, 0, 0)),
            ];
            const result = screen(events, callings);
            const expectedNames = [...CALL_COLUMNS, 'Звонки > 3 минут', ...EVENT_COLUMNS];

            expect(columnNames(result)).toEqual([expectedNames, expectedNames]);
            expect(result.data[0]?.actions.map(action => action.value)).toEqual([
                40, 25, 12, 0, 3, 2,
            ]);
            expect(result.data[1]?.actions.map(action => action.value)).toEqual([
                10, 0, 0, 2, 0, 0,
            ]);
        });

        it('из событий отбираются только допустимые для объединённого отчёта', () => {
            const result = screen(EVENTS_ALL, CALLINGS_ALL);

            // «План», «Результативные» и «Звонок совершен» в объединённый отчёт не входят
            columnNames(result).forEach(names => {
                expect(names).toEqual(ALL_COLUMNS);
            });
        });
    });

    describe('пустые источники', () => {
        it('пустые звонки: сотрудники событий с колонками событий', () => {
            const result = screen(EVENTS_PLAIN, []);

            expect(rowIds(result)).toEqual([10, 20, 30]);
            expect(columnNames(result)).toEqual([
                EVENT_COLUMNS,
                EVENT_COLUMNS,
                EVENT_COLUMNS,
            ]);
            expect(result.data[0]?.actions.map(action => action.value)).toEqual([
                3, 2,
            ]);
            expect(result.data[0]?.name).toBe('Иван Иванов');
        });

        it('пустые события: сотрудники звонков с колонками звонков', () => {
            const result = screen([], CALLINGS_ALL);

            expect(rowIds(result)).toEqual([10, 20, 30]);
            expect(columnNames(result)).toEqual([
                CALL_COLUMNS,
                CALL_COLUMNS,
                CALL_COLUMNS,
            ]);
            expect(result.data[1]?.actions.map(action => action.value)).toEqual([
                30, 18, 7,
            ]);
        });

        it('оба пустые: строк нет', () => {
            expect(screen([], [])).toEqual({
                code: 'report',
                firstCellName: 'Менеджер',
                data: [],
            });
        });
    });

    it('исходные таблицы не изменяются', () => {
        const report = getReportTableData(EVENTS_MIXED);
        const callings = getCallingStatisticsTableData(CALLINGS_MIXED);
        const reportBefore = JSON.stringify(report);
        const callingsBefore = JSON.stringify(callings);

        getMergedReportsData(report, callings);

        expect(JSON.stringify(report)).toBe(reportBefore);
        expect(JSON.stringify(callings)).toBe(callingsBefore);
    });

    it('повторный вызов на тех же таблицах даёт тот же результат', () => {
        const report = getReportTableData(EVENTS_MIXED);
        const callings = getCallingStatisticsTableData(CALLINGS_MIXED);

        expect(getMergedReportsData(report, callings)).toEqual(
            getMergedReportsData(report, callings),
        );
    });
});

describe('getMergedReportsExcelData', () => {
    const ALL_USERS = [10, 20, 30];

    describe('все сотрудники есть в обоих источниках — как раньше', () => {
        it('все сотрудники и показатели: звонки, затем события', () => {
            const result = getMergedReportsExcelData(
                EVENTS_PLAIN,
                CALLINGS_ALL,
                ALL_USERS,
                ALL_COLUMNS,
            );

            expect(result).toEqual([
                legacyExcelRow(10, 'Иван Иванов', LEGACY_VALUES.ivan),
                legacyExcelRow(20, 'Пётр Петров', LEGACY_VALUES.petr),
                legacyExcelRow(30, 'Сидор Сидоров', LEGACY_VALUES.sidor),
            ]);
        });

        it('выбранные показатели «План», «Результативные», «Звонок совершен» не попадают в файл', () => {
            const result = getMergedReportsExcelData(
                EVENTS_PLAIN,
                CALLINGS_ALL,
                ALL_USERS,
                [...ALL_COLUMNS, 'План', 'Результативные', 'Звонок совершен'],
            );

            expect(result).toEqual([
                legacyExcelRow(10, 'Иван Иванов', LEGACY_VALUES.ivan),
                legacyExcelRow(20, 'Пётр Петров', LEGACY_VALUES.petr),
                legacyExcelRow(30, 'Сидор Сидоров', LEGACY_VALUES.sidor),
            ]);
        });

        it('часть сотрудников и показателей: порядок показателей сохраняется', () => {
            const result = getMergedReportsExcelData(
                EVENTS_PLAIN,
                CALLINGS_ALL,
                [30, 10],
                [EV_OFFER, CALL_MINUTE],
            );

            expect(result).toEqual([
                {
                    id: 10,
                    userName: 'Иван Иванов',
                    kpi: [excelKpi('60', CALL_MINUTE, 12), excelKpi('104', EV_OFFER, 2)],
                },
                {
                    id: 30,
                    userName: 'Сидор Сидоров',
                    kpi: [excelKpi('60', CALL_MINUTE, 1), excelKpi('104', EV_OFFER, 0)],
                },
            ]);
        });

        it('показатель события с названием показателя звонков не дублируется (как на экране)', () => {
            const [row] = getMergedReportsExcelData(
                EVENTS_ALL,
                CALLINGS_ALL,
                [10],
                ALL_COLUMNS,
            );

            expect(row?.kpi.map(kpi => kpi.action)).toEqual(ALL_COLUMNS);
            expect(row?.kpi.find(kpi => kpi.action === CALL_HALF)?.count).toBe(25);
        });
    });

    describe('состав сотрудников', () => {
        const result = getMergedReportsExcelData(
            EVENTS_MIXED,
            CALLINGS_MIXED,
            [10, 20, 30, 40],
            ALL_COLUMNS,
        );

        it('те же сотрудники в том же порядке, что на экране', () => {
            const onScreen = screen(EVENTS_MIXED, CALLINGS_MIXED);

            expect(result.map(row => row.id)).toEqual(rowIds(onScreen));
            expect(result.map(row => row.id)).toEqual([20, 10, 30, 40]);
        });

        it('те же колонки у всех строк, что на экране: звонки, затем события', () => {
            const onScreen = screen(EVENTS_MIXED, CALLINGS_MIXED);

            result.forEach((row, index) => {
                expect(row.kpi.map(kpi => kpi.action)).toEqual(
                    columnNames(onScreen)[index],
                );
            });
        });

        it('значения те же, что на экране', () => {
            const onScreen = screen(EVENTS_MIXED, CALLINGS_MIXED);

            result.forEach((row, index) => {
                expect(row.kpi.map(kpi => kpi.count)).toEqual(
                    onScreen.data[index]?.actions.map(action => action.value),
                );
            });
        });

        it('сотрудник только из звонков остаётся с нулями по событиям', () => {
            expect(result.find(row => row.id === 30)).toEqual({
                id: 30,
                userName: 'Сидор Сидоров',
                kpi: [
                    excelKpi('all', CALL_ALL, 10),
                    excelKpi('30', CALL_HALF, 5),
                    excelKpi('60', CALL_MINUTE, 1),
                    excelKpi('103', EV_PRESENTATION, 0),
                    excelKpi('104', EV_OFFER, 0),
                ],
            });
        });

        it('сотрудник только из событий остаётся с нулями по звонкам', () => {
            expect(result.find(row => row.id === 40)).toEqual({
                id: 40,
                userName: 'Анна Антонова',
                kpi: [
                    excelKpi('all', CALL_ALL, 0),
                    excelKpi('30', CALL_HALF, 0),
                    excelKpi('60', CALL_MINUTE, 0),
                    excelKpi('103', EV_PRESENTATION, 7),
                    excelKpi('104', EV_OFFER, 6),
                ],
            });
        });

        it('имя в шапке сотрудника из обоих источников — из событий', () => {
            const callings = [
                {
                    ...makeCallingRow(10, 'Иван', 'Иванов', callKpi(1, 1, 1)),
                    userName: 'Иванов И. (из звонков)',
                },
            ];
            const events = [makeEventsRow(10, 'Иван', 'Иванов', eventKpi(0, 0, 0, 1, 1))];

            const [row] = getMergedReportsExcelData(events, callings, [10], ALL_COLUMNS);

            expect(row?.userName).toBe('Иван Иванов');
        });

        it('форма строки не меняется: id, userName, kpi (id и action — строки, count — число)', () => {
            result.forEach(row => {
                expect(Object.keys(row).sort()).toEqual(['id', 'kpi', 'userName']);
                expect(typeof row.id).toBe('number');
                row.kpi.forEach(kpi => {
                    expect(Object.keys(kpi).sort()).toEqual(['action', 'count', 'id']);
                    expect(typeof kpi.id).toBe('string');
                    expect(typeof kpi.action).toBe('string');
                    expect(typeof kpi.count).toBe('number');
                });
            });
        });
    });

    describe('локальный фильтр', () => {
        it('selectedUsers оставляет только выбранных сотрудников (в порядке экрана)', () => {
            const result = getMergedReportsExcelData(
                EVENTS_MIXED,
                CALLINGS_MIXED,
                [40, 20],
                ALL_COLUMNS,
            );

            expect(result.map(row => row.id)).toEqual([20, 40]);
        });

        it('selectedActions оставляет только выбранные показатели в порядке «звонки, события»', () => {
            const result = getMergedReportsExcelData(
                EVENTS_MIXED,
                CALLINGS_MIXED,
                [10, 20, 30, 40],
                [EV_PRESENTATION, CALL_HALF],
            );

            result.forEach(row => {
                expect(row.kpi.map(kpi => kpi.action)).toEqual([
                    CALL_HALF,
                    EV_PRESENTATION,
                ]);
            });
        });

        it('пустой выбор сотрудников и показателей — без ограничения, как на экране', () => {
            const unrestricted = getMergedReportsExcelData(
                EVENTS_MIXED,
                CALLINGS_MIXED,
                [],
                [],
            );
            const onScreen = screen(EVENTS_MIXED, CALLINGS_MIXED);

            expect(unrestricted.map(row => row.id)).toEqual(rowIds(onScreen));
            unrestricted.forEach((row, index) => {
                expect(row.kpi.map(kpi => kpi.action)).toEqual(
                    columnNames(onScreen)[index],
                );
            });
        });

        it('выбор сотрудника, которого нет в данных, даёт пустой файл', () => {
            expect(
                getMergedReportsExcelData(EVENTS_MIXED, CALLINGS_MIXED, [999], ALL_COLUMNS),
            ).toEqual([]);
        });

        it('состав совпадает с экраном и при выбранной части сотрудников', () => {
            const selected = [10, 40];
            const onScreen = screen(EVENTS_MIXED, CALLINGS_MIXED).data.filter(
                row => row.id !== undefined && selected.includes(row.id),
            );
            const result = getMergedReportsExcelData(
                EVENTS_MIXED,
                CALLINGS_MIXED,
                selected,
                ALL_COLUMNS,
            );

            expect(result.map(row => row.id)).toEqual(onScreen.map(row => row.id));
        });
    });

    describe('пустые источники', () => {
        it('пустые звонки: сотрудники событий с показателями событий', () => {
            const result = getMergedReportsExcelData(EVENTS_PLAIN, [], ALL_USERS, EVENT_COLUMNS);

            expect(result.map(row => row.id)).toEqual([10, 20, 30]);
            expect(result[0]?.kpi).toEqual([
                excelKpi('103', EV_PRESENTATION, 3),
                excelKpi('104', EV_OFFER, 2),
            ]);
        });

        it('пустые события: сотрудники звонков с показателями звонков', () => {
            const result = getMergedReportsExcelData([], CALLINGS_ALL, ALL_USERS, CALL_COLUMNS);

            expect(result.map(row => row.id)).toEqual([10, 20, 30]);
            expect(result[1]).toEqual({
                id: 20,
                userName: 'Пётр Петров',
                kpi: [
                    excelKpi('all', CALL_ALL, 30),
                    excelKpi('30', CALL_HALF, 18),
                    excelKpi('60', CALL_MINUTE, 7),
                ],
            });
        });

        it('оба пустые: файл без сотрудников', () => {
            expect(getMergedReportsExcelData([], [], ALL_USERS, ALL_COLUMNS)).toEqual([]);
        });
    });

    it('исходные данные не изменяются', () => {
        const events = JSON.stringify(EVENTS_MIXED);
        const callings = JSON.stringify(CALLINGS_MIXED);

        getMergedReportsExcelData(EVENTS_MIXED, CALLINGS_MIXED, [10, 20, 30, 40], ALL_COLUMNS);

        expect(JSON.stringify(EVENTS_MIXED)).toBe(events);
        expect(JSON.stringify(CALLINGS_MIXED)).toBe(callings);
    });
});
