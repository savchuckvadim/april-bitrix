import { PayloadAction, createSlice, current } from "@reduxjs/toolkit";
import { APP_TYPE } from "@/modules/app/types/app/app-type";





export type RouterState = typeof initialState
interface SetCurrentProcessRoutePayload {

    name: APP_TYPE 
}

const initialState = {

    current: APP_TYPE.EVENT as APP_TYPE


}


export const routerSlice = createSlice({
    name: 'router',
    initialState,
    reducers: {
        setCurrentProcess(state: RouterState, action: PayloadAction<SetCurrentProcessRoutePayload>) {
            const payload = action.payload

            state.current = payload.name

        },
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



export const routerReducer = routerSlice.reducer;

// Экспорт actions
export const routerActions = routerSlice.actions;