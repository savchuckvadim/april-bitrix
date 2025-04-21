import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EDownloadType } from "./download-thunk";

type TDownloadState = typeof initialState

const initialState = {
    isDownloading: false as boolean,
    downloadType: null as EDownloadType | null,
    error: null as string | null,
}
export const downloadSlice = createSlice({
    name: 'download',
    initialState: {
        isDownloading: false,
        downloadType: null as EDownloadType | null,
        error: null,
    },
    reducers: {
        setDownloadStatus: (
            state: TDownloadState,
            action: PayloadAction<{
                status: boolean,
                type: EDownloadType
            }>
        ) => {
            state.downloadType = action.payload.status ? action.payload.type : null
            state.isDownloading = action.payload.status;

        },


    },
})
export const { setDownloadStatus } = downloadSlice.actions
export default downloadSlice.reducer
