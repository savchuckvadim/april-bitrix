import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type WordTemplatePreviewPhase = 'idle' | 'starting' | 'polling' | 'ready' | 'failed';

export type WordTemplatePdfPreviewPatch = Partial<{
    previewPhase: WordTemplatePreviewPhase;
    previewOperationId: string | null;
    previewPdfObjectUrl: string | null;
    previewError: string | null;
    previewFileName: string | null;
}>;

export type WordTemplatePdfPreviewState = {
    previewRequestId: number;
    previewPhase: WordTemplatePreviewPhase;
    previewOperationId: string | null;
    previewPdfObjectUrl: string | null;
    previewError: string | null;
    previewFileName: string | null;
    previewListenersActive: boolean;
    needUpdate: boolean;
};

const initialState: WordTemplatePdfPreviewState = {
    previewRequestId: 0,
    previewPhase: 'idle',
    previewOperationId: null,
    previewPdfObjectUrl: null,
    previewError: null,
    previewFileName: null,
    previewListenersActive: false,
    needUpdate: false,
};

export const wordTemplatePdfPreviewSlice = createSlice({
    name: 'wordTemplatePdfPreview',
    initialState,
    reducers: {
        bumpPreviewRequestId: (state: WordTemplatePdfPreviewState) => {
            state.previewRequestId += 1;
        },
        setPreviewPatch: (state: WordTemplatePdfPreviewState, action: PayloadAction<WordTemplatePdfPreviewPatch>) => {
            Object.assign(state, action.payload);
        },
        setPreviewListenersActive: (state: WordTemplatePdfPreviewState, action: PayloadAction<boolean>) => {
            state.previewListenersActive = action.payload;
        },
        setNeedUpdate: (state: WordTemplatePdfPreviewState, action: PayloadAction<boolean>) => {
            state.needUpdate = action.payload;
        },
        clear: () => initialState,
    },
});

export const wordTemplatePdfPreviewAC = wordTemplatePdfPreviewSlice.actions;
export const wordTemplatePdfPreviewReducer = wordTemplatePdfPreviewSlice.reducer;
export default wordTemplatePdfPreviewReducer;
