import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    EReportDateMode,
    ReportDateType,
} from '@/modules/entities/report/model/types/report/report-type';
import {
    reportFilterDraftActions as actions,
    reportFilterDraftReducer as reducer,
} from '../report-filter-draft.slice';
import type {
    ReportFilterDraftState,
    ReportFilterValues,
} from '../report-filter-draft.types';

/*
 * Редьюсеры черновика: правила правки периода те же, что у действующего
 * фильтра (setChangedDate/setChangedDateMode), состояние отчёта не нужно.
 */

const SNAPSHOT: ReportFilterValues = {
    date: { from: '2026-11-02', to: '2026-11-20', mode: EReportDateMode.RANGE },
    userIds: [1, 2],
    actionCodes: ['call_plan', 'call_done'],
};

const initial = (): ReportFilterDraftState =>
    reducer(undefined, { type: '@@init' });

const opened = (): ReportFilterDraftState =>
    reducer(initial(), actions.opened(SNAPSHOT));

beforeEach(() => {
    vi.useFakeTimers();
    // Среда 25.11.2026: неделя 23–29 ноября, месяц 1–30 ноября
    vi.setSystemTime(new Date(2026, 10, 25, 12, 0, 0));
});

afterEach(() => {
    vi.useRealTimers();
});

describe('черновик фильтра: открытие и закрытие', () => {
    it('по умолчанию закрыт и пуст', () => {
        expect(initial()).toEqual({
            isOpen: false,
            date: { from: '', to: '', mode: EReportDateMode.RANGE },
            userIds: [],
            actionCodes: [],
        });
    });

    it('открытие — снимок действующего фильтра целиком', () => {
        expect(opened()).toEqual({ isOpen: true, ...SNAPSHOT });
    });

    it('повторное открытие затирает прежний черновик новым снимком', () => {
        let state = opened();
        state = reducer(state, actions.usersChanged([9]));
        state = reducer(state, actions.closed());
        state = reducer(
            state,
            actions.opened({ ...SNAPSHOT, userIds: [4, 5] }),
        );
        expect(state.userIds).toEqual([4, 5]);
        expect(state.isOpen).toBe(true);
    });

    it('закрытие только гасит isOpen', () => {
        const state = reducer(opened(), actions.closed());
        expect(state.isOpen).toBe(false);
        expect(state.date).toEqual(SNAPSHOT.date);
    });
});

describe('черновик фильтра: период', () => {
    it('дата нормализуется в yyyy-MM-dd, режим не меняется', () => {
        let state = opened();
        state = reducer(
            state,
            actions.dateChanged({
                typeOfDate: ReportDateType.FROM,
                value: '2026-11-05T21:00:00.000',
            }),
        );
        state = reducer(
            state,
            actions.dateChanged({
                typeOfDate: ReportDateType.TO,
                value: '25.11.2026',
            }),
        );
        expect(state.date).toEqual({
            from: '2026-11-05',
            to: '2026-11-25',
            mode: EReportDateMode.RANGE,
        });
    });

    it('пустая или нераспознанная дата игнорируется', () => {
        let state = opened();
        state = reducer(
            state,
            actions.dateChanged({ typeOfDate: ReportDateType.FROM, value: '' }),
        );
        state = reducer(
            state,
            actions.dateChanged({
                typeOfDate: ReportDateType.TO,
                value: 'не дата',
            }),
        );
        expect(state.date).toEqual(SNAPSHOT.date);
    });

    it.each([
        [EReportDateMode.TODAY, '2026-11-25', '2026-11-25'],
        [EReportDateMode.WEEK, '2026-11-23', '2026-11-29'],
        [EReportDateMode.MONTH, '2026-11-01', '2026-11-30'],
    ])('режим %s — даты считаются по режиму', (mode, from, to) => {
        const state = reducer(opened(), actions.dateModeChanged({ mode }));
        expect(state.date).toEqual({ from, to, mode });
    });

    it('режим «Диапазон» — режим сменился, даты по умолчанию как у setChangedDateMode (неделя)', () => {
        const state = reducer(
            opened(),
            actions.dateModeChanged({ mode: EReportDateMode.RANGE }),
        );
        expect(state.date).toEqual({
            from: '2026-11-23',
            to: '2026-11-29',
            mode: EReportDateMode.RANGE,
        });
    });

    it('правка периода не трогает сотрудников и действия', () => {
        const state = reducer(
            opened(),
            actions.dateModeChanged({ mode: EReportDateMode.MONTH }),
        );
        expect(state.userIds).toEqual([1, 2]);
        expect(state.actionCodes).toEqual(['call_plan', 'call_done']);
    });
});

describe('черновик фильтра: сотрудники', () => {
    it('выбор заменяется целиком', () => {
        const state = reducer(opened(), actions.usersChanged([7, 8, 9]));
        expect(state.userIds).toEqual([7, 8, 9]);
    });

    it('пустой выбор допустим (при «Применить» это «все видимые»)', () => {
        const state = reducer(opened(), actions.usersChanged([]));
        expect(state.userIds).toEqual([]);
    });
});

describe('черновик фильтра: действия', () => {
    it('включённое действие выключается', () => {
        const state = reducer(opened(), actions.actionToggled('call_plan'));
        expect(state.actionCodes).toEqual(['call_done']);
    });

    it('выключенное действие включается — в конец', () => {
        const state = reducer(opened(), actions.actionToggled('presentation_done'));
        expect(state.actionCodes).toEqual([
            'call_plan',
            'call_done',
            'presentation_done',
        ]);
    });

    it('двойное нажатие возвращает исходный набор', () => {
        let state = opened();
        state = reducer(state, actions.actionToggled('call_plan'));
        state = reducer(state, actions.actionToggled('call_plan'));
        expect(state.actionCodes).toEqual(['call_done', 'call_plan']);
        expect(new Set(state.actionCodes)).toEqual(new Set(SNAPSHOT.actionCodes));
    });
});
