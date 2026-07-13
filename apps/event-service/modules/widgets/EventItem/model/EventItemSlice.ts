import { PayloadAction, createSlice } from "@reduxjs/toolkit"

//TYPES
export type EventItemStateType = typeof initialState
// export type CallingResultActionsType = InferActionsTypes<typeof callingResultAC>
export enum EventItemResultType {
    RESULT = 'result',
    NORESULT = 'noresult',
    EXPIRED = 'expired',
    NEW='new',
    CANCEL='cancel'
}


const initialState = {
    isActive: false,
    type: null as null | EventItemResultType,
    // fetchedKpiList: null,
}

interface SetEventItemMenuStatusPayload {
    status: boolean,
    menuType: EventItemResultType | null
}
interface SetEventItemMenuSTypePayload {
    menuType: EventItemResultType
}

const eventItemSlice = createSlice({
    name: 'eventItem',
    initialState,
    reducers: {

        setEventItemMenuStatus: (
            state: EventItemStateType, action: PayloadAction<SetEventItemMenuStatusPayload>
        ) => {
            const payload = action.payload
            state.isActive = payload.status
            state.type = payload.status
                ? payload.menuType
                : null

        },
        setMenuType: (
            state: EventItemStateType, action: PayloadAction<SetEventItemMenuSTypePayload>
        ) => {

            state.type =  action.payload.menuType
               
        },


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




export const eventItemReducer = eventItemSlice.reducer;

// Экспорт actions
export const eventItemActions = eventItemSlice.actions;
