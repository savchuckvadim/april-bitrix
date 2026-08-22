import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export type EventItemStateType = typeof initialState;

export enum EventItemResultType {
    RESULT = 'result',
    NORESULT = 'noresult',
    EXPIRED = 'expired',
    NEW = 'new',
    CANCEL = 'cancel',
}

const initialState = {
    isActive: false,
    type: null as null | EventItemResultType,
    /**
     * Окно «осталось заполнить» перед отправкой. Живёт в сторе, а не в
     * компоненте: ItemActions смонтирован дважды (колонка и нижняя панель),
     * и окно должно быть одно на обоих.
     */
    isPreflightOpen: false,
};

const eventItemSlice = createSlice({
    name: 'eventItem',
    initialState,
    reducers: {
        setEventItemMenuStatus: (
            state: EventItemStateType,
            action: PayloadAction<{
                status: boolean;
                menuType: EventItemResultType | null;
            }>,
        ) => {
            state.isActive = action.payload.status;
            state.type = action.payload.status ? action.payload.menuType : null;
        },
        setPreflightOpen: (
            state: EventItemStateType,
            action: PayloadAction<{ isOpen: boolean }>,
        ) => {
            state.isPreflightOpen = action.payload.isOpen;
        },
        setMenuType: (
            state: EventItemStateType,
            action: PayloadAction<{ menuType: EventItemResultType | null }>,
        ) => {
            state.type = action.payload.menuType;
        },
    },
});

export const eventItemReducer = eventItemSlice.reducer;
export const eventItemActions = eventItemSlice.actions;
