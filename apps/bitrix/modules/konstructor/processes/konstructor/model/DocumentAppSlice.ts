import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type DocumentKonstructorState = typeof initialState;

const initialState = {
  dealId: null as number | null,
  isFavorite: false as boolean,
  isResized: false,
  initialized: false,
};

const appSlice = createSlice({
  name: "documentKonstructor",
  initialState,
  reducers: {
    setAppBitrixDeal: (
      state: DocumentKonstructorState,
      action: PayloadAction<{
        dealId: number;
      }>,
    ) => {
      const payload = action.payload;
      state.dealId = payload.dealId;
    },

    setInitializedSuccess: (
      state: DocumentKonstructorState,
      action: PayloadAction<{}>,
    ) => {
      state.initialized = true;
    },
  },
});

export const appReducer = appSlice.reducer;

// Экспорт actions
export const appActions = appSlice.actions;
