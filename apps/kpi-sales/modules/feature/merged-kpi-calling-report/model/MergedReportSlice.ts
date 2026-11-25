import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MergedReportState {
    /**
     * Сотрудники объединённого отчёта. Во фрейме портала поле пустое —
     * сотрудников выбирает главный фильтр отчёта. Заполняется только на
     * публичной странице из снимка ссылки (старые снимки несут выбор).
     * Пусто = без ограничения.
     */
    selectedUsers: number[];
    /** Показатели (колонки) объединённой таблицы. Пусто = все. */
    selectedActions: string[];
}
const initialState: MergedReportState = {
    selectedUsers: [] as number[],
    selectedActions: [] as string[],
}

const mergedReportSlice = createSlice({
    name: 'mergedReport',
    initialState,
    reducers: {
        setSelectedUsers: (
            state: MergedReportState,
            action: PayloadAction<number[]>
        ) => {
            state.selectedUsers = action.payload;
        },
        setSelectedActions: (
            state: MergedReportState,
            action: PayloadAction<string[]>
        ) => {
            state.selectedActions = action.payload;
        },
    },
});

export const mergedReportActions = mergedReportSlice.actions;
export const mergedReportReducer = mergedReportSlice.reducer;
