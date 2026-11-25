import { describe, expect, it } from 'vitest';
import type { BXUser } from '@workspace/bx';
import {
    EReportDateMode,
    type FilterInnerCode,
} from '@/modules/entities/report/model/types/report/report-type';
import type { ReportFilterValues } from '../../model/filter-draft/report-filter-draft.types';
import {
    isFilterDraftChanged,
    readActiveFilterValues,
    resolveDraftUsers,
} from '../filter-draft.util';

const user = (id: number): BXUser => ({ ID: id }) as unknown as BXUser;

const REPORT = {
    date: {
        from: '2026-11-02',
        to: '2026-11-20',
        inProcess: false,
        mode: EReportDateMode.RANGE,
    },
    filter: ['call_plan', 'call_done'] as FilterInnerCode[],
};

const values = (overrides: Partial<ReportFilterValues> = {}): ReportFilterValues => ({
    date: { from: '2026-11-02', to: '2026-11-20', mode: EReportDateMode.RANGE },
    userIds: [1, 2],
    actionCodes: ['call_plan', 'call_done'],
    ...overrides,
});

describe('readActiveFilterValues — снимок действующего фильтра', () => {
    it('период, сотрудники и действия действующего фильтра', () => {
        expect(readActiveFilterValues(REPORT, [user(1), user(2)])).toEqual({
            date: {
                from: '2026-11-02',
                to: '2026-11-20',
                mode: EReportDateMode.RANGE,
            },
            userIds: [1, 2],
            actionCodes: ['call_plan', 'call_done'],
        });
    });

    it('ID сотрудников приводятся к числам (в структуре бывают строки)', () => {
        const snapshot = readActiveFilterValues(REPORT, [
            { ID: '7' } as unknown as BXUser,
        ]);
        expect(snapshot.userIds).toEqual([7]);
    });

    it('служебное поле inProcess в снимок не попадает', () => {
        const snapshot = readActiveFilterValues(REPORT, []);
        expect(Object.keys(snapshot.date).sort()).toEqual(['from', 'mode', 'to']);
    });

    it('снимок — копия: правка не задевает действующее состояние', () => {
        const snapshot = readActiveFilterValues(REPORT, []);
        snapshot.actionCodes.push('call_pound');
        snapshot.date.from = '2000-01-01';
        expect(REPORT.filter).toEqual(['call_plan', 'call_done']);
        expect(REPORT.date.from).toBe('2026-11-02');
    });
});

describe('isFilterDraftChanged — отличается ли черновик от действующего', () => {
    it('одинаковые значения — не отличается', () => {
        expect(isFilterDraftChanged(values(), values())).toBe(false);
    });

    it('порядок сотрудников и действий не важен', () => {
        expect(
            isFilterDraftChanged(
                values({
                    userIds: [2, 1],
                    actionCodes: ['call_done', 'call_plan'],
                }),
                values(),
            ),
        ).toBe(false);
    });

    it('другой режим периода', () => {
        expect(
            isFilterDraftChanged(
                values({
                    date: {
                        from: '2026-11-02',
                        to: '2026-11-20',
                        mode: EReportDateMode.MONTH,
                    },
                }),
                values(),
            ),
        ).toBe(true);
    });

    it('другая дата начала или конца', () => {
        const date = (from: string, to: string) => ({
            from,
            to,
            mode: EReportDateMode.RANGE,
        });
        expect(
            isFilterDraftChanged(
                values({ date: date('2026-11-03', '2026-11-20') }),
                values(),
            ),
        ).toBe(true);
        expect(
            isFilterDraftChanged(
                values({ date: date('2026-11-02', '2026-11-21') }),
                values(),
            ),
        ).toBe(true);
    });

    it('другой состав сотрудников', () => {
        expect(isFilterDraftChanged(values({ userIds: [1] }), values())).toBe(true);
        expect(isFilterDraftChanged(values({ userIds: [1, 3] }), values())).toBe(true);
    });

    it('другой набор действий', () => {
        expect(
            isFilterDraftChanged(values({ actionCodes: ['call_plan'] }), values()),
        ).toBe(true);
    });

    it('пустой выбор сотрудников сравнивается как есть, а не как «все»', () => {
        expect(isFilterDraftChanged(values({ userIds: [] }), values())).toBe(true);
        expect(
            isFilterDraftChanged(values({ userIds: [] }), values({ userIds: [] })),
        ).toBe(false);
    });
});

describe('resolveDraftUsers — кого черновик переносит в действующий фильтр', () => {
    const visible = [user(1), user(2), user(3)];

    it('выбранные из видимых — в порядке видимого списка', () => {
        expect(resolveDraftUsers([3, 1], visible)).toEqual([user(1), user(3)]);
    });

    it('пустой выбор — все видимые', () => {
        expect(resolveDraftUsers([], visible)).toEqual(visible);
    });

    it('выбор, которого нет среди видимых, тоже означает всех видимых', () => {
        expect(resolveDraftUsers([99], visible)).toEqual(visible);
    });

    it('невидимые ID отбрасываются, видимые остаются', () => {
        expect(resolveDraftUsers([2, 99], visible)).toEqual([user(2)]);
    });

    it('ID в структуре — строки: сравнение по числу', () => {
        const users = [{ ID: '5' }, { ID: '6' }] as unknown as BXUser[];
        expect(resolveDraftUsers([6], users)).toEqual([users[1]]);
    });

    it('нет видимых — пусто; результат — новый массив, не видимый список', () => {
        expect(resolveDraftUsers([1], [])).toEqual([]);
        const result = resolveDraftUsers([], visible);
        expect(result).not.toBe(visible);
    });
});
