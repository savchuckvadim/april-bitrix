import { describe, expect, it } from 'vitest';
import type { BXUser } from '@workspace/bx';
import type { RootState } from '@/modules/app/model/store';
import type { SalesDepartment } from '@/modules/entities/department/model';
import {
    EReportDateMode,
    type FilterInnerCode,
} from '@/modules/entities/report/model/types/report/report-type';
import type { ReportFilterValues } from '../../model/filter-draft/report-filter-draft.types';
import {
    buildSaveFilterDto,
    selectFilterValuesToSave,
    toSavedDates,
} from '../save-filter.util';

const user = (id: number): BXUser => ({ ID: id }) as unknown as BXUser;

type SaveState = Pick<RootState, 'report' | 'department' | 'reportFilterDraft'>;

/** Действующий фильтр: 1–20 ноября, сотрудники 1 и 2, одно действие. */
const makeState = (draft: Partial<SaveState['reportFilterDraft']> = {}): SaveState =>
    ({
        report: {
            date: {
                from: '2026-11-01',
                to: '2026-11-20',
                inProcess: false,
                mode: EReportDateMode.RANGE,
            },
            filter: ['call_plan'] as FilterInnerCode[],
        },
        department: {
            items: [user(1), user(2), user(3)],
            current: [user(1), user(2)],
        },
        reportFilterDraft: {
            isOpen: false,
            date: { from: '', to: '', mode: EReportDateMode.RANGE },
            userIds: [],
            actionCodes: [],
            ...draft,
        },
    }) as unknown as SaveState;

describe('toSavedDates', () => {
    it('диапазон сохраняется как custom с обеими датами', () => {
        expect(
            toSavedDates({
                from: '2026-11-01',
                to: '2026-11-20',
                mode: EReportDateMode.RANGE,
            }),
        ).toEqual({ mode: 'custom', from: '2026-11-01', to: '2026-11-20' });
    });

    it.each([EReportDateMode.TODAY, EReportDateMode.WEEK, EReportDateMode.MONTH])(
        'быстрый режим %s — только режим, без дат',
        mode => {
            expect(
                toSavedDates({ from: '2026-11-01', to: '2026-11-20', mode }),
            ).toEqual({ mode });
        },
    );
});

describe('selectFilterValuesToSave — что сохраняет «Сохранить фильтр»', () => {
    it('панель закрыта — действующий фильтр', () => {
        expect(selectFilterValuesToSave(makeState())).toEqual({
            date: {
                from: '2026-11-01',
                to: '2026-11-20',
                mode: EReportDateMode.RANGE,
            },
            userIds: [1, 2],
            actionCodes: ['call_plan'],
        });
    });

    it('панель закрыта — черновик игнорируется, даже если в нём что-то осталось', () => {
        const values = selectFilterValuesToSave(
            makeState({ isOpen: false, userIds: [3], actionCodes: ['call_done'] }),
        );
        expect(values.userIds).toEqual([1, 2]);
        expect(values.actionCodes).toEqual(['call_plan']);
    });

    it('панель открыта — значения черновика', () => {
        const values = selectFilterValuesToSave(
            makeState({
                isOpen: true,
                date: {
                    from: '2026-10-01',
                    to: '2026-10-31',
                    mode: EReportDateMode.RANGE,
                },
                userIds: [3],
                actionCodes: ['call_done', 'call_plan'],
            }),
        );
        expect(values).toEqual({
            date: {
                from: '2026-10-01',
                to: '2026-10-31',
                mode: EReportDateMode.RANGE,
            },
            userIds: [3],
            actionCodes: ['call_done', 'call_plan'],
        });
    });

    it('панель открыта, никто не выбран — сохраняются все видимые, как при «Применить»', () => {
        const values = selectFilterValuesToSave(
            makeState({ isOpen: true, userIds: [] }),
        );
        expect(values.userIds).toEqual([1, 2, 3]);
    });

    it('панель открыта — невидимые ID из черновика не сохраняются', () => {
        const values = selectFilterValuesToSave(
            makeState({ isOpen: true, userIds: [2, 99] }),
        );
        expect(values.userIds).toEqual([2]);
    });
});

describe('buildSaveFilterDto — запрос сохранения фильтра (формат v2)', () => {
    const values: ReportFilterValues = {
        date: { from: '2026-11-01', to: '2026-11-20', mode: EReportDateMode.RANGE },
        userIds: [5, 7],
        actionCodes: ['call_plan', 'call_done'],
    };

    it('портал, пользователь и значения фильтра', () => {
        const dto = buildSaveFilterDto(
            { domain: 'test.bitrix24.ru', userId: 42 },
            values,
            [],
        );
        expect(dto).toMatchObject({
            domain: 'test.bitrix24.ru',
            userId: 42,
            filter: {
                version: 2,
                actions: ['call_plan', 'call_done'],
                dates: { mode: 'custom', from: '2026-11-01', to: '2026-11-20' },
                legacyUserIds: [5, 7],
            },
        });
    });

    it('selection собирается по структуре отделов: группа частично, сотрудник вне групп отдельно', () => {
        // ОП 10: группа 11 (сотрудники 5 и 6), сотрудник 7 прямо в отделе
        const departments = [
            {
                department: { ID: 10 },
                groups: [{ ID: 11, USERS: [{ ID: 5 }, { ID: 6 }] }],
                allUsers: [{ ID: 5 }, { ID: 6 }, { ID: 7 }],
            },
        ] as unknown as SalesDepartment[];

        const dto = buildSaveFilterDto(
            { domain: 'test.bitrix24.ru', userId: 42 },
            values,
            departments,
        );
        expect(dto.filter.selection).toEqual({
            departments: [
                {
                    id: 10,
                    all: false,
                    groups: [{ id: 11, all: false, userIds: [5] }],
                    userIds: [7],
                },
            ],
        });
    });

    it('без структуры отделов selection — пустой список отделов', () => {
        const dto = buildSaveFilterDto(
            { domain: 'test.bitrix24.ru', userId: 42 },
            values,
            [],
        );
        expect(dto.filter.selection).toEqual({ departments: [] });
    });
});
