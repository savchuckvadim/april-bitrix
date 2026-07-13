import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { PBXField, PBXFieldItem, PBXList } from "@/modules/app/types/portal/portal-type";
import { CompanyColorType } from "../utils/event-company-util";
// import { getreportState } from "../utils/event-company-util";

//TYPES
export type EventReportState = typeof initialState


export interface SetInitCompany {
    bitrixId: string
    field: PBXField,
    items: PBXFieldItem[]
    current: PBXFieldItem
}

export enum EV_COMPANY_PROP {
    COLOR = 'color',
    STATUS = 'status',
    CURRENT = 'current'

}
const initialState = {

    [EV_COMPANY_PROP.CURRENT]: {
        bitrixId: '' as string,
        field: null as null | PBXField,
        items: [] as PBXFieldItem[],
        current: null as null | PBXFieldItem,
        isLoading: false as boolean
    },
    [EV_COMPANY_PROP.COLOR]: {
        bitrixId: '' as string,
        field: null as null | PBXField,
        items: [] as PBXFieldItem[],
        current: null as null | PBXFieldItem,
        isLoading: false as boolean
    },
    [EV_COMPANY_PROP.STATUS]: {
        bitrixId: '' as string,
        field: null as null | PBXField,
        items: [] as PBXFieldItem[],
        current: null as null | PBXFieldItem,
        isLoading: false as boolean
    },
    // result: {
    //     bitrixId: '' as string,
    //     field: null as null | PBXField,
    //     items: [] as PBXFieldItem[],
    //     current: null as null | PBXFieldItem,
    // },
    // concurent: {
    //     bitrixId: '' as string,
    //     field: null as null | PBXField,
    //     items: [] as PBXFieldItem[],
    //     current: null as null | PBXFieldItem,
    // }

}


const eventCompanySlice = createSlice({
    name: 'eventCompany',
    initialState,
    reducers: {

        setInitCompanyColor: (
            state: EventReportState,
            action: PayloadAction<SetInitCompany>

        ) => {
            const payload = action.payload;
            state.color = { ...state.color, ...payload }
        },
        setInitCompanyStatus: (
            state: EventReportState,
            action: PayloadAction<SetInitCompany>

        ) => {
            const payload = action.payload;
            state.status = { ...state.color, ...payload }
        },
        setCurrentColor: (
            state: EventReportState,
            action: PayloadAction<{ color: CompanyColorType }>

        ) => {
            const payload = action.payload;
            state.color.current = state.color.items
                .find(fi => fi.code == payload.color)
        },
        setCurrentProp: (
            state: EventReportState,
            action: PayloadAction<{ code: CompanyColorType | string, type: EV_COMPANY_PROP }>

        ) => {
            const payload = action.payload;
            const type = payload.type
            state[type].current = state[type].items
                .find(fi => fi.code == payload.code)
        },
        setIsLoading: (
            state: EventReportState,
            action: PayloadAction<{ isLoading: boolean, type: EV_COMPANY_PROP }>

        ) => {
            const payload = action.payload;
            const type = payload.type
            state[type].isLoading = payload.isLoading
        },

    },
    // extraReducers: (builder) => {
    //     // Здесь мы отслеживаем успешную загрузку Portal
    //     builder.addMatcher(
    //         portalAPI.endpoints.fetchPortal.matchFulfilled,
    //         (state, action) => {
    //             const pCompany = action.payload.company
    //             state.current = pCompany
    //             if (pCompany) {
    //                 if (pCompany.bitrixfields) {
    //                     const colorField = pCompany.bitrixfields.find(field => field.code === '')
    //                 }
    //             }
    //             // Когда портал загружен, начинаем загрузку компании
    //             
    //             // Логика для загрузки Company
    //             // Вы можете вызывать дополнительный action для загрузки данных о компании
    //             // Например, dispatch(companyAPI.endpoints.fetchCompany.initiate())
    //         }
    //     );
    // },

});


//utils


export const eventCompanyReducer = eventCompanySlice.reducer;

// Экспорт actions
export const eventCompanyActions = eventCompanySlice.actions;