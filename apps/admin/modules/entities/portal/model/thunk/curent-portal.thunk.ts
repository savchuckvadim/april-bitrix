import { RootState } from "@/modules/app/model/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { PortalHelper } from "../../api/portal-helper";
import { IPortal } from "../slice/PortalSlice";

export const fetchCurrentPortal = createAsyncThunk<
    {
        portal: IPortal | null;
    },
    { portalId?: number },
    {
        state: RootState;
        rejectValue: string;
        extra: { getWSClient: () => void };
    }
>(
    'portal/fetchCurrentPortal',
    async (params, { rejectWithValue }) => {
        const portalId = params?.portalId;
        if (!portalId) {
            return { portal: null };
        }
        const portalHelper = new PortalHelper();


        try {
            const portal = await portalHelper.getPortalById(portalId);
            return {
                portal: portal || null,
            }
        } catch (e: any) {
            return rejectWithValue(e.message || 'Ошибка загрузки');

        }
    },
);
