import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
    EReportDateMode,
    ReportDateType,
    type FilterInnerCode,
} from '@/modules/entities/report/model/types/report/report-type';
import {
    writePeriodDate,
    writePeriodMode,
} from '@/modules/entities/report/lib/date-util';
import type {
    ReportFilterDraftState,
    ReportFilterValues,
} from './report-filter-draft.types';

const createInitialState = (): ReportFilterDraftState => ({
    isOpen: false,
    date: {
        [ReportDateType.FROM]: '',
        [ReportDateType.TO]: '',
        mode: EReportDateMode.RANGE,
    },
    userIds: [],
    actionCodes: [],
});

/**
 * Черновик фильтра отчёта. Правила правки те же, что у действующего фильтра
 * (нормализация дат, расчёт дат по режиму), но состояние отчёта не трогается.
 */
const reportFilterDraftSlice = createSlice({
    name: 'reportFilterDraft',
    initialState: createInitialState(),
    reducers: {
        /** Панель открыта: черновик — снимок действующего фильтра. */
        opened: (
            state: ReportFilterDraftState,
            action: PayloadAction<ReportFilterValues>,
        ) => {
            state.isOpen = true;
            state.date = action.payload.date;
            state.userIds = action.payload.userIds;
            state.actionCodes = action.payload.actionCodes;
        },
        /** Панель закрыта: черновик больше не используется. */
        closed: (state: ReportFilterDraftState) => {
            state.isOpen = false;
        },
        /** Дата выбрана в календаре (режим периода не меняется). */
        dateChanged: (
            state: ReportFilterDraftState,
            action: PayloadAction<{
                typeOfDate: ReportDateType;
                value: string;
            }>,
        ) => {
            writePeriodDate(
                state.date,
                action.payload.typeOfDate,
                action.payload.value,
            );
        },
        /** Выбран режим периода: даты считаются по режиму. */
        dateModeChanged: (
            state: ReportFilterDraftState,
            action: PayloadAction<{ mode: EReportDateMode }>,
        ) => {
            writePeriodMode(state.date, action.payload.mode);
        },
        /** Выбранные сотрудники целиком (ID). */
        usersChanged: (
            state: ReportFilterDraftState,
            action: PayloadAction<number[]>,
        ) => {
            state.userIds = action.payload;
        },
        /** Действие нажато: выключенное включается (в конец), включённое выключается. */
        actionToggled: (
            state: ReportFilterDraftState,
            action: PayloadAction<FilterInnerCode>,
        ) => {
            const code = action.payload;
            state.actionCodes = state.actionCodes.includes(code)
                ? state.actionCodes.filter(current => current !== code)
                : [...state.actionCodes, code];
        },
    },
});

export const reportFilterDraftReducer = reportFilterDraftSlice.reducer;
export const reportFilterDraftActions = reportFilterDraftSlice.actions;
