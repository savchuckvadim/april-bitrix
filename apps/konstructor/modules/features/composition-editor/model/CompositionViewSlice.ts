import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
    DEFAULT_COMPOSITION_VIEW,
    type CompositionViewOwner,
    type CompositionViewSettings,
} from './types';

export interface CompositionViewState {
    settings: CompositionViewSettings;
    /** Владельца задаёт слой приложения; без него настройка живёт только в браузере */
    owner: CompositionViewOwner | null;
}

const initialState: CompositionViewState = {
    settings: DEFAULT_COMPOSITION_VIEW,
    owner: null,
};

/**
 * Вид наполнения — в сторе, а не в состоянии редактора: панель шага «Комплект»
 * и окно товара на «Ценах» монтируются отдельно, а настройка у них одна.
 */
const compositionViewSlice = createSlice({
    name: 'compositionView',
    initialState,
    reducers: {
        set(state: CompositionViewState, action: PayloadAction<CompositionViewSettings>) {
            state.settings = action.payload;
        },
        setOwner(state: CompositionViewState, action: PayloadAction<CompositionViewOwner | null>) {
            state.owner = action.payload;
        },
    },
});

export const compositionViewReducer = compositionViewSlice.reducer;
export const compositionViewActions = compositionViewSlice.actions;

export interface WithCompositionView {
    compositionView: CompositionViewState;
}

export const selectCompositionView = (state: WithCompositionView): CompositionViewSettings =>
    state.compositionView.settings;

export const selectCompositionViewOwner = (state: WithCompositionView): CompositionViewOwner | null =>
    state.compositionView.owner;
