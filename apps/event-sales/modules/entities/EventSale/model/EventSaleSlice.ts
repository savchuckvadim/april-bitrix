import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { BXDeal, BXList } from '@workspace/bx';

export type SaleState = typeof initialState;

// У каждой задачи может быть своя основная сделка и сделка презентации,
// у основной — много предыдущих презентаций.
const initialState = {
    taskDeals: {} as { [key: number]: { allPresentationDeals?: BXDeal[] } },

    isSaled: false as boolean,
    isFetched: false as boolean,
    isLoading: false as boolean,
    /** показывать ли данные по продаже текущей задачи (статус «Продажа») */
    isCurrentShow: false as boolean,
    isCurrentFetched: false as boolean,

    presDeals: {
        items: [] as BXDeal[],
        current: null as null | BXDeal,
        show: null as null | BXDeal,
        isItemsFetched: false as boolean,
    },

    presList: {
        items: [] as Array<BXList>,
        isItemsFetched: false as boolean,
        current: null as null | BXList,
        show: null as null | BXList,
    },
};

const eventSaleSlice = createSlice({
    name: 'eventSale',
    initialState,
    reducers: {
        setIsLoading: (
            state: SaleState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isLoading = action.payload.status;
        },
        setPortalSale: (
            state: SaleState,
            action: PayloadAction<{ presDeals: BXDeal[] }>,
        ) => {
            state.presDeals.items = action.payload.presDeals;
            state.presDeals.isItemsFetched = true;
            state.isFetched = true;
            state.isLoading = false;
        },
        setCurrentPresShowStatus: (
            state: SaleState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isCurrentShow = action.payload.status;
            state.isCurrentFetched = action.payload.status;
        },
        /** Текущий список сделок из taskDeals по taskId (null — сброс). */
        setCurrentPresList: (
            state: SaleState,
            action: PayloadAction<{ taskId: number | null }>,
        ) => {
            const taskId = action.payload.taskId;
            const taskDeals = taskId ? state.taskDeals[taskId] : undefined;

            state.presDeals.items = taskDeals?.allPresentationDeals ?? [];
            state.presDeals.isItemsFetched = true;
            state.presList.items = [];
            state.presList.isItemsFetched = true;
        },
        setCurrentPresItem: (
            state: SaleState,
            action: PayloadAction<{
                dealId: number | null;
                type: 'show' | 'current';
            }>,
        ) => {
            const deal =
                state.presDeals.items.find(d => d.ID === action.payload.dealId) ??
                null;
            state.presDeals[action.payload.type] = deal;
        },
        clean: (state: SaleState) => {
            state.isFetched = false;
            state.presDeals.isItemsFetched = false;
        },
    },
});

export const eventSaleReducer = eventSaleSlice.reducer;
export const eventSaleActions = eventSaleSlice.actions;
