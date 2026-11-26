import { describe, expect, it } from 'vitest';
import type { RTableAction, RTableRow } from '@workspace/april-ui';
import {
    createIndicatorLabeler,
    labelTableRows,
} from '@/modules/shared/lib/indicator-labels';
import { selectMergedTableRows } from '@/modules/feature/merged-kpi-calling-report/lib/merged-table-selection.util';
import {
    withPlanTableColumns,
    withPlanTotalColumns,
} from '../plan-columns-table.util';
import {
    achievementByUser,
    planColumnSpecs,
    tablePlanColumnSpecs,
} from '../plan-columns.util';
import {
    PLAN_COLUMN_CELL_CLASS,
    PLAN_COLUMN_HEADER_CLASS,
} from '../plan-columns.consts';
import { INDICATORS, IVANOV, PETROV } from './plan-columns.fixtures';

const labelOf = createIndicatorLabeler({ 'ev:presentation_done': 'Встреча' });

/** Строки объединённой таблицы: бакеты звонков, затем события (исходные названия). */
const row = (id: number, name: string): RTableRow => ({
    id,
    name,
    actions: [
        { name: 'Наборов номера', value: 40, code: 'all' },
        { name: 'Звонки > 30 сек', value: 25, code: '30' },
        { name: 'Звонок', value: 7, code: 'call_done' },
        { name: 'Презентация проведена', value: 3, code: 'presentation_done' },
        { name: 'КП', value: 1, code: 'ev_offer_act_send' },
        { name: 'Сделка', value: 1, code: 'ev_success_done' },
    ],
});

const ROWS: RTableRow[] = [row(1, 'Иванов'), row(2, 'Петров'), row(3, 'Сидоров')];

const SPECS = planColumnSpecs(INDICATORS, []);
/** Руководитель: видит планы всех (у Сидорова строки достижения нет — его не было в отчёте). */
const ALL = achievementByUser([IVANOV, PETROV]);
/** Рядовой Петров: только своя строка. */
const OWN = achievementByUser([PETROV]);

const codes = (actions: RTableAction[] | undefined): (string | undefined)[] =>
    actions?.map(action => action.code) ?? [];

const cell = (target: RTableRow | undefined, code: string): RTableAction | undefined =>
    target?.actions.find(action => action.code === code);

describe('withPlanTableColumns', () => {
    it('колонка плана всегда вплотную слева от своего факта', () => {
        const [first] = withPlanTableColumns(ROWS, SPECS, ALL, labelOf);
        expect(codes(first?.actions)).toEqual([
            'all',
            'plan:calls_over_30s',
            '30',
            'plan:calls_done',
            'call_done',
            'plan:presentations_done',
            'presentation_done',
            'plan:offers_sent',
            'ev_offer_act_send',
            'ev_success_done',
        ]);
    });

    it('значения: план до целого, без плана — «—», значения факта не меняются', () => {
        const [ivanov] = withPlanTableColumns(ROWS, SPECS, ALL, labelOf);
        expect(cell(ivanov, 'plan:calls_done')).toMatchObject({ value: 10 });
        expect(cell(ivanov, 'plan:calls_done')?.display).toBeUndefined();
        expect(cell(ivanov, 'plan:presentations_done')).toMatchObject({ value: 5 });
        expect(cell(ivanov, 'plan:offers_sent')).toMatchObject({ value: 0, display: '—' });
        expect(cell(ivanov, 'call_done')).toEqual({ name: 'Звонок', value: 7, code: 'call_done' });
    });

    it('сотрудник вне области видимости — пустая ячейка', () => {
        const [, , sidorov] = withPlanTableColumns(ROWS, SPECS, ALL, labelOf);
        expect(cell(sidorov, 'plan:calls_done')?.display).toBe('');
    });

    it('рядовой видит план только в своей строке, чужие — пусто', () => {
        const [ivanov, petrov] = withPlanTableColumns(ROWS, SPECS, OWN, labelOf);
        expect(cell(ivanov, 'plan:calls_done')?.display).toBe('');
        expect(cell(ivanov, 'plan:presentations_done')?.display).toBe('');
        expect(cell(petrov, 'plan:calls_done')).toMatchObject({ value: 20 });
        expect(cell(petrov, 'plan:presentations_done')?.display).toBe('—');
    });

    it('колонка плана: код plan:<код>, подпись, подсказка шапки и плановая подсветка', () => {
        const [ivanov] = withPlanTableColumns(
            labelTableRows(ROWS, labelOf),
            SPECS,
            ALL,
            labelOf,
        );
        expect(cell(ivanov, 'plan:presentations_done')).toEqual({
            name: 'План: Встреча',
            code: 'plan:presentations_done',
            value: 5,
            headerClassName: PLAN_COLUMN_HEADER_CLASS,
            cellClassName: PLAN_COLUMN_CELL_CLASS,
            headerHint:
                'План по показателю «Встреча» (на квартал), пересчитан на выбранный период',
        });
    });

    it('объединённый: факт скрыт «Колонками» — план уходит вместе с ним', () => {
        const selected = selectMergedTableRows(ROWS, {
            selectedUsers: [],
            selectedActions: ['Звонки > 30 сек', 'КП'],
        });
        const [first] = withPlanTableColumns(selected, SPECS, ALL, labelOf);
        expect(codes(first?.actions)).toEqual([
            'plan:calls_over_30s',
            '30',
            'plan:offers_sent',
            'ev_offer_act_send',
        ]);
    });

    it('таблица событий: бакетов звонков в колонках планов нет', () => {
        const eventsSpecs = tablePlanColumnSpecs('events', INDICATORS, {
            isPublic: false,
            canView: true,
            canViewAll: true,
            flags: { plansEvents: true, plansMerged: false, plansCallings: false },
            hiddenCodes: [],
        });
        const [first] = withPlanTableColumns(ROWS, eventsSpecs, ALL, labelOf);
        expect(codes(first?.actions)).not.toContain('plan:calls_over_30s');
        expect(codes(first?.actions)).toContain('plan:calls_done');
    });

    it('входные строки не изменяются', () => {
        const before = JSON.stringify(ROWS);
        withPlanTableColumns(ROWS, SPECS, ALL, labelOf);
        expect(JSON.stringify(ROWS)).toBe(before);
    });
});

describe('withPlanTotalColumns', () => {
    const TOTALS: RTableAction[] = [
        { name: 'Звонок', value: 21, code: 'call_done' },
        { name: 'Встреча', value: 9, code: 'presentation_done' },
        { name: 'КП', value: 3, code: 'ev_offer_act_send' },
    ];

    it('итог плана слева от итога факта — сумма планов сотрудников таблицы', () => {
        const result = withPlanTotalColumns(TOTALS, [1, 2, 3], SPECS, ALL, labelOf);
        expect(codes(result)).toEqual([
            'plan:calls_done',
            'call_done',
            'plan:presentations_done',
            'presentation_done',
            'plan:offers_sent',
            'ev_offer_act_send',
        ]);
        expect(result[0]).toMatchObject({ name: 'План: Звонок', value: 30 });
        expect(result[2]).toMatchObject({ name: 'План: Встреча', value: 5 });
        expect(result[4]).toMatchObject({ value: 0, display: '—' });
    });

    it('рядовой: итог — только его план; его нет в таблице секции — пусто', () => {
        expect(withPlanTotalColumns(TOTALS, [1, 2], SPECS, OWN, labelOf)[0]).toMatchObject({
            value: 20,
        });
        expect(withPlanTotalColumns(TOTALS, [1, 3], SPECS, OWN, labelOf)[0]?.display).toBe('');
    });
});
