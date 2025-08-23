import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type RouterState = typeof initialState;
interface SetCurrentProcessRoutePayload {
  route: ROUTE;
}
export enum ROUTE {
  START = "start",
  COMPLECT = "complect",
  PRODUCT = "product",
  FAVOURITE = "favorite",
  DOCUMENT = "document",
}
const initialState = {
  current: ROUTE.START as ROUTE,
  items: {
    [ROUTE.START]: {
      title: "Start",
      path: "/",
    },
    [ROUTE.COMPLECT]: {
      title: "Complect",
      path: "/complect",
    },
    [ROUTE.PRODUCT]: {
      title: "Product",
      path: "/product",
    },
    [ROUTE.FAVOURITE]: {
      title: "Favourite",
      path: "/favorite",
    },
    [ROUTE.DOCUMENT]: {
      title: "Document",
      path: "/document",
    },
  },
};

export const routerSlice = createSlice({
  name: "router",
  initialState,
  reducers: {
    setCurrent(
      state: RouterState,
      action: PayloadAction<SetCurrentProcessRoutePayload>,
    ) {
      const payload = action.payload;

      state.current = payload.route;
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
