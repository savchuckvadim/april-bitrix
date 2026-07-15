import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { PBXField, PBXFieldItem } from '@/modules/app/types/portal/portal-type';
import { CompanyColorType } from '../utils/event-company-util';

export type EventCompanyState = typeof initialState;

export interface SetInitCompany {
    bitrixId: string;
    field: PBXField;
    items: PBXFieldItem[];
    current: PBXFieldItem | undefined;
}

export enum EV_COMPANY_PROP {
    COLOR = 'color',
    STATUS = 'status',
    CURRENT = 'current',
}

const emptyPropState = () => ({
    bitrixId: '' as string,
    field: null as null | PBXField,
    items: [] as PBXFieldItem[],
    current: null as null | undefined | PBXFieldItem,
    isLoading: false as boolean,
    /** менял ли пользователь значение в этой сессии (валидация withColorRequired) */
    isChanged: false as boolean,
    error: '' as string,
});

const initialState = {
    [EV_COMPANY_PROP.CURRENT]: emptyPropState(),
    [EV_COMPANY_PROP.COLOR]: emptyPropState(),
    [EV_COMPANY_PROP.STATUS]: emptyPropState(),
};

const eventCompanySlice = createSlice({
    name: 'eventCompany',
    initialState,
    reducers: {
        setInitCompanyColor: (
            state: EventCompanyState,
            action: PayloadAction<SetInitCompany>,
        ) => {
            state.color = { ...state.color, ...action.payload };
        },
        setInitCompanyStatus: (
            state: EventCompanyState,
            action: PayloadAction<SetInitCompany>,
        ) => {
            state.status = { ...state.status, ...action.payload };
        },
        setCurrentColor: (
            state: EventCompanyState,
            action: PayloadAction<{ color: CompanyColorType }>,
        ) => {
            state.color.current = state.color.items.find(
                fi => fi.code == action.payload.color,
            );
            state.color.isChanged = true;
            state.color.error = '';
        },
        setError: (
            state: EventCompanyState,
            action: PayloadAction<{ type: EV_COMPANY_PROP; error: string }>,
        ) => {
            state[action.payload.type].error = action.payload.error;
        },
        setCurrentProp: (
            state: EventCompanyState,
            action: PayloadAction<{
                code: CompanyColorType | string;
                type: EV_COMPANY_PROP;
            }>,
        ) => {
            const type = action.payload.type;
            state[type].current = state[type].items.find(
                fi => fi.code == action.payload.code,
            );
        },
        setIsLoading: (
            state: EventCompanyState,
            action: PayloadAction<{ isLoading: boolean; type: EV_COMPANY_PROP }>,
        ) => {
            state[action.payload.type].isLoading = action.payload.isLoading;
        },
    },
});

export const eventCompanyReducer = eventCompanySlice.reducer;
export const eventCompanyActions = eventCompanySlice.actions;
