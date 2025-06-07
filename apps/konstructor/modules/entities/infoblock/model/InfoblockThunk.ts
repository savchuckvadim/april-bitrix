import { ThunkAction, Action, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/modules/app/model/store";
import { IInfoBlock } from "../type/infoblock.type";
import { getInfoBlocks } from "../lib/infoblock.helper";


export const fetchInfoblocks = createAsyncThunk<
    IInfoBlock[],              // return type
    void,                      // argument type
    {
        state: RootState;        
        rejectValue: string;
        extra: { getWSClient: () => void };
    }
>(      
    'infoblock/fetchInfoblocks',
    async (_, { getState, rejectWithValue, extra }) => {
    
        try {
            const infoblocks = await getInfoBlocks();
            
            if (!infoblocks || infoblocks.length === 0) {
                return rejectWithValue('Ошибка загрузки');
            }
            return infoblocks;
        } catch (e: any) {
            
            return rejectWithValue(e.message || 'Ошибка загрузки');
        }
    }
);