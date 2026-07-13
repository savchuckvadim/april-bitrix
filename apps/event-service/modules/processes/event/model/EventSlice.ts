import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { EVENT_PROP, SetFinishStatusPayload, SetFullCompleteStatusPayload, SetPrimrtiveStatePropPayload, setCurrentPagePayload } from "../types/event-types";
import { EV_REPORT_PROP } from "@/modules/entities/EventReport/type/event-report-type";
import { EV_PLAN_PROP } from "@/modules/entities/EventPlan/type/event-plan-type";
import { ROUTE_EVENT } from "@/modules/processes/routes/types/router-type";
import { EV_CONTACT_PROP } from "@/modules/entities/EventContact/type/event-contact-type";
import { BXCompany, BXSmart, Placement } from "@workspace/bx";
import { EV_PLAN_SERVICE_PROP } from "@/modules/entities/EventPlan/type/event-plan-service-type";


export type EventState = typeof initialState
// event - корневой стэйт - это процесс который определяет какая страница
// сейчас должна быть
// содержит общие данные для всех страниц
type EventCurrentErrors = {
    [EV_REPORT_PROP.COMMENT]: string
    [EV_PLAN_PROP.NAME]: string
    [EV_CONTACT_PROP.NAME]: string
    [EV_CONTACT_PROP.PHONE]: string
    [EV_CONTACT_PROP.EMAIL]: string
    [EV_CONTACT_PROP.POST]:  string

}
export interface SetErrorsPayload {
    isError: boolean
    errors: EventCurrentErrors
}
export type ErrorsCode = EV_REPORT_PROP.COMMENT | EV_PLAN_PROP.NAME | EV_PLAN_SERVICE_PROP.NAME
// | EV_CONTACT_PROP.NAME | EV_CONTACT_PROP.EMAIL | EV_CONTACT_PROP.PHONE  | EV_CONTACT_PROP.POST
export const errors = {
    [EV_REPORT_PROP.COMMENT]: '' as string,
    [EV_PLAN_PROP.NAME]: '' as string,
    [EV_CONTACT_PROP.NAME]: '' as string,
    [EV_CONTACT_PROP.PHONE]: '' as string,
    [EV_CONTACT_PROP.EMAIL]: '' as string,
    [EV_CONTACT_PROP.POST]: '' as string,

} as EventCurrentErrors
const initialState = {

    // [EVENT_PROP.RESPONSIBILITY]: {
    //     items: [] as Array<BXUser>,
    //     current: null as BXUser | null
    // } as EV_USERS_STATE_ITEM,
    // [EVENT_PROP.CREATED_BY]: {
    //     items: [] as Array<BXUser>,
    //     current: null as BXUser | null
    // } as EV_USERS_STATE_ITEM,

    placement: null as null | Placement,
    groupId: 28 as number,
    company: null as BXCompany | null,
    smart: null as BXSmart | null,

    isFullComplete: false,
    isFinish: false,
    result: '',
    currentPage: ROUTE_EVENT.LIST as ROUTE_EVENT, //'list' as 'list' | 'item' | 'postSale',
    errors: {
        isError: false as boolean,
        current: errors as EventCurrentErrors
    }
    //todo current page list | item | item = result menu status

    // isRequiredError: false,


}


const eventSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {

        // setFetchedDepartament: (state: EventState, action: PayloadAction<SetFetchedDepartamentPayload>) => {
        //     const payload = action.payload
        //     let responsibilityCurrent = payload.currentUser



        //     let bosssId = 107  // fatima
        //     if (payload.domain === 'alfacentr.bitrix24.ru') {
        //         // bosssId = 28
        //         bosssId = 158 //дарья
        //     }
        //     state[EVENT_PROP.RESPONSIBILITY].items = payload.departament;
        //     state[EVENT_PROP.RESPONSIBILITY].current = responsibilityCurrent;
        //     state[EVENT_PROP.CREATED_BY].items = payload.departament;
        //     state[EVENT_PROP.CREATED_BY].current = { ID: bosssId };


        // },
        setPrimrtiveStateProp: (
            state: EventState, action: PayloadAction<SetPrimrtiveStatePropPayload>
        ) => {
            const currentKey = action.payload.name as EVENT_PROP
            //@ts-ignore
            state[currentKey].current = action.payload.value

        },

        setFullCompleteStatus: (
            state: EventState, action: PayloadAction<SetFullCompleteStatusPayload>
        ) => {

            state.isFullComplete = action.payload.status
        },
        setCurrentPage: (
            state: EventState,
            action: PayloadAction<setCurrentPagePayload>
        ) => {
            state.currentPage = action.payload.page;

        },
        setFinishStatus: (
            state: EventState,
            action: PayloadAction<SetFinishStatusPayload>
        ) => {
            state = {

                // [EVENT_PROP.RESPONSIBILITY]: {
                //     items: [] as Array<BXUser>,
                //     current: null as BXUser | null
                // },
                // [EVENT_PROP.CREATED_BY]: {
                //     items: [] as Array<BXUser>,
                //     current: null as BXUser | null
                // },

                placement: null as null | Placement,
                groupId: 28 as number,
                company: null as BXCompany | null,
                smart: null as BXSmart | null,

                isFullComplete: false,
                isFinish: action.payload.status,
                result: action.payload.result,
                currentPage: ROUTE_EVENT.LIST,
                errors: {
                    isError: false,
                    current: errors
                }

            }

        },
        setErrors(
            state: EventState,
            action: PayloadAction<SetErrorsPayload>
        ) {
            const pay = action.payload
            state.errors.isError = pay.isError
            state.errors.current = pay.errors
        },
        setError(
            state: EventState,
            action: PayloadAction<{
                code: ErrorsCode
                value: string
            }>
        ) {
            const pay = action.payload

            state.errors.current[pay.code] = pay.value
            for (const key in state.errors.current) {
                const ekey = key as ErrorsCode
                if (state.errors.current[ekey]) {
                    state.errors.isError = true

                }
            }
        }
        // usersFetching(state: UserState, action: PayloadAction<null>) {
        //     state.isLoading = true;
        // },
        // usersFetchingSuccess(state: UserState, action: PayloadAction<IUser[]>) {
        //     state.isLoading = false;
        //     state.error = '';
        //     state.users = action.payload
        // },
        // usersError(state: UserState, action: PayloadAction<string>) {
        //     state.isLoading = false;
        //     state.error = action.payload
        // },

    },

    //@ts-ignore
    // extraReducers: {
    //     [fetchUsers.fulfilled.type]: (state: UserState, action: PayloadAction<IUser[]>) => {
    //         state.isLoading = false;
    //         state.error = '';
    //         state.users = action.payload
    //     },
    //     [fetchUsers.pending.type]: (state: UserState, action: PayloadAction<null>) => {
    //         state.isLoading = true;
    //     },
    //     [fetchUsers.rejected.type]: (state: UserState, action: PayloadAction<string>) => {
    //         state.isLoading = false;
    //         state.error = action.payload
    //     }
    // }

    // extraReducers: (builder) => {
    //     builder.addCase(fetchUsers.fulfilled, (state:UserState, action: PayloadAction<IUser[]>) => {
    //       state.isLoading = false;
    //       state.error = '';
    //       state.users = action.payload;
    //     });
    //     builder.addCase(fetchUsers.pending, (state:UserState, action: PayloadAction<null>) => {
    //       state.isLoading = true;
    //     });
    //     //@ts-ignore
    //     builder.addCase(fetchUsers.rejected, (state:UserState, action:  PayloadAction<string>) => {

    //         state.isLoading = false;
    //       state.error = action.payload;
    //     });
    //   }
});




export const eventReducer = eventSlice.reducer;

// Экспорт actions
export const eventActions = eventSlice.actions;