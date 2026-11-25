import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CalculationInfo } from '@/modules/shared/lib/calculation-info/calculation-info';
import { ReportCallingData } from '../type/calling-type';

export type CallingStatisticsState = typeof initialState;

const initialState = {
    items: null as ReportCallingData[] | null,
    isFetched: false,
    isLoading: false as boolean,
    /**
     * Сведения о расчёте статистики (когда рассчитана, период закрыт).
     * null — сервер их не прислал: период открытый или сервер старый.
     */
    calculation: null as CalculationInfo | null,
};

interface FetchedPayload {
    items: ReportCallingData[] | null;
    calculation: CalculationInfo | null;
}

const callingStatisticsSlice = createSlice({
    name: 'callingStatistics',
    initialState,
    reducers: {
        setLoading: (
            state: CallingStatisticsState,
            action: PayloadAction<boolean>,
        ) => {
            state.isLoading = action.payload;
        },
        /**
         * Данные статистики вместе со сведениями о расчёте. Без сведений
         * (ответ без полей, сбой запроса, снимок публичной ссылки) прежние
         * сведения очищаются: они относились к другим данным.
         */
        setFetched: {
            reducer: (
                state: CallingStatisticsState,
                action: PayloadAction<FetchedPayload>,
            ) => {
                state.items = action.payload.items;
                state.calculation = action.payload.calculation;
                state.isFetched = true;
            },
            prepare: (
                items: ReportCallingData[] | null,
                calculation: CalculationInfo | null = null,
            ) => ({ payload: { items, calculation } }),
        },
    },
});

export const callingStatisticsActions = callingStatisticsSlice.actions;
export default callingStatisticsSlice.reducer;
