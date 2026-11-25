import { describe, expect, it } from 'vitest';
import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import type { ReportData } from '@/modules/entities/report';
import { buildMergedRatingDataset } from '../rating.util';

/*
 * Датасет рейтингов и конверсий объединённого отчёта: состав сотрудников
 * тот же, что в объединённой таблице, — все из обоих источников; чего у
 * сотрудника нет (звонков или событий), то ноль.
 */

const kpiRow = (
    id: number,
    name: string,
    counts: Record<string, number>,
): ReportData =>
    ({
        id,
        user: { ID: id, NAME: name, LAST_NAME: 'Тестов' },
        userName: name,
        kpi: Object.entries(counts).map(([innerCode, count]) => ({
            id: innerCode,
            action: { innerCode, name: KPI_NAMES[innerCode] ?? innerCode },
            count,
        })),
    }) as unknown as ReportData;

/** Названия действий: «План», «Результативные» и «…звонок…» в объединённый не идут. */
const KPI_NAMES: Record<string, string> = {
    plan: 'План',
    result: 'Результативные',
    call_done: 'Звонок',
    presentation_done: 'Презентация',
    offer: 'КП',
};

const callingRow = (
    id: number,
    name: string,
    counts: Record<string, number>,
): ReportCallingData =>
    ({
        user: { ID: id, NAME: name, LAST_NAME: 'Тестов' },
        userName: name,
        callings: Object.entries(counts).map(([action, count], index) => ({
            id: `c${index + 1}`,
            action,
            count,
        })),
    }) as unknown as ReportCallingData;

const ALL_KPI = { plan: 9, result: 8, call_done: 7, presentation_done: 3, offer: 2 };
const CALLS = { 'Наборов номера': 40, 'Звонки > 30 сек': 12 };

describe('buildMergedRatingDataset — показатели', () => {
    it('сначала показатели звонков, затем события без «План», «Результативные» и звонковых', () => {
        const dataset = buildMergedRatingDataset(
            [kpiRow(1, 'Анна', ALL_KPI)],
            [callingRow(1, 'Анна', CALLS)],
        );
        expect(dataset.actions.map(action => action.name)).toEqual([
            'Наборов номера',
            'Звонки > 30 сек',
            'Презентация',
            'КП',
        ]);
        expect(dataset.actions.map(action => action.code)).toEqual([
            'c1',
            'c2',
            'presentation_done',
            'offer',
        ]);
    });

    it('у показателей событий есть действие для цвета графика, у звонков — нет', () => {
        const dataset = buildMergedRatingDataset(
            [kpiRow(1, 'Анна', ALL_KPI)],
            [callingRow(1, 'Анна', CALLS)],
        );
        expect(dataset.actions[0]?.filterAction).toBeUndefined();
        expect(dataset.actions[2]?.filterAction).toMatchObject({
            innerCode: 'presentation_done',
        });
    });

    it('событие с названием показателя звонков не дублируется', () => {
        const report = [
            {
                ...kpiRow(1, 'Анна', { presentation_done: 3 }),
                kpi: [
                    {
                        id: 'dup',
                        action: { innerCode: 'dup', name: 'Наборов номера' },
                        count: 5,
                    },
                    {
                        id: 'presentation_done',
                        action: {
                            innerCode: 'presentation_done',
                            name: 'Презентация',
                        },
                        count: 3,
                    },
                ],
            } as unknown as ReportData,
        ];
        const dataset = buildMergedRatingDataset(report, [
            callingRow(1, 'Анна', CALLS),
        ]);
        expect(dataset.actions.map(action => action.name)).toEqual([
            'Наборов номера',
            'Звонки > 30 сек',
            'Презентация',
        ]);
        expect(dataset.rows[0]?.values).toEqual({
            c1: 40,
            c2: 12,
            presentation_done: 3,
        });
    });
});

describe('buildMergedRatingDataset — сотрудники', () => {
    it('сотрудник в обоих источниках: значения звонков и событий в одной строке', () => {
        const dataset = buildMergedRatingDataset(
            [kpiRow(1, 'Анна', ALL_KPI)],
            [callingRow(1, 'Анна', CALLS)],
        );
        expect(dataset.rows).toEqual([
            {
                userId: 1,
                name: 'Анна Тестов',
                values: { c1: 40, c2: 12, presentation_done: 3, offer: 2 },
            },
        ]);
    });

    it('только звонки — события нулями', () => {
        const dataset = buildMergedRatingDataset(
            [kpiRow(1, 'Анна', ALL_KPI)],
            [callingRow(1, 'Анна', CALLS), callingRow(2, 'Борис', CALLS)],
        );
        expect(dataset.rows[1]).toEqual({
            userId: 2,
            name: 'Борис Тестов',
            values: { c1: 40, c2: 12, presentation_done: 0, offer: 0 },
        });
    });

    it('только события — строка есть, звонки нулями, стоит после сотрудников со звонками', () => {
        const dataset = buildMergedRatingDataset(
            [kpiRow(3, 'Вера', ALL_KPI), kpiRow(1, 'Анна', ALL_KPI)],
            [callingRow(1, 'Анна', CALLS)],
        );
        expect(dataset.rows.map(row => row.userId)).toEqual([1, 3]);
        expect(dataset.rows[1]).toEqual({
            userId: 3,
            name: 'Вера Тестов',
            values: { c1: 0, c2: 0, presentation_done: 3, offer: 2 },
        });
    });

    it('звонков нет совсем — отчёт из сотрудников и показателей событий', () => {
        const dataset = buildMergedRatingDataset(
            [kpiRow(1, 'Анна', ALL_KPI), kpiRow(2, 'Борис', ALL_KPI)],
            [],
        );
        expect(dataset.actions.map(action => action.code)).toEqual([
            'presentation_done',
            'offer',
        ]);
        expect(dataset.rows.map(row => row.userId)).toEqual([1, 2]);
        expect(dataset.rows[0]?.values).toEqual({
            presentation_done: 3,
            offer: 2,
        });
    });

    it('событий нет совсем — отчёт из сотрудников и показателей звонков', () => {
        const dataset = buildMergedRatingDataset(
            [],
            [callingRow(1, 'Анна', CALLS)],
        );
        expect(dataset.actions.map(action => action.code)).toEqual(['c1', 'c2']);
        expect(dataset.rows).toEqual([
            { userId: 1, name: 'Анна Тестов', values: { c1: 40, c2: 12 } },
        ]);
    });

    it('оба источника пусты — пустой датасет', () => {
        expect(buildMergedRatingDataset([], [])).toEqual({
            actions: [],
            rows: [],
        });
    });

    it('повтор сотрудника в событиях — берётся первая строка', () => {
        const dataset = buildMergedRatingDataset(
            [
                kpiRow(3, 'Вера', { presentation_done: 3 }),
                kpiRow(3, 'Вера', { presentation_done: 99 }),
            ],
            [],
        );
        expect(dataset.rows).toHaveLength(1);
        expect(dataset.rows[0]?.values).toEqual({ presentation_done: 3 });
    });
});
