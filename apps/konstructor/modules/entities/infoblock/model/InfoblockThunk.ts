import { ThunkAction, Action, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/modules/app/model/store";
import { IInfoBlock, IInfoBlockGroup } from "../type/infoblock.type";
import { getInfoBlocks } from "../lib/infoblock.helper";

export const fetchInfoblocks = createAsyncThunk<
  {
    infoblocks: IInfoBlock[];
    groups: IInfoBlockGroup[];
  }, // return type
  void, // argument type
  {
    state: RootState;
    rejectValue: string;
    extra: { getWSClient: () => void };
  }
>(
  "infoblock/fetchInfoblocks",
  async (_, { getState, dispatch, rejectWithValue, extra }) => {
    try {
      const response = await getInfoBlocks();

      if (!response || response.infoblocks.length === 0) {
        return rejectWithValue("Ошибка загрузки");
      }
      return response;
    } catch (e: any) {
      return rejectWithValue(e.message || "Ошибка загрузки");
    }
  },
);
