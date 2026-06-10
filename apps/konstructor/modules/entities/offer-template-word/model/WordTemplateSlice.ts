import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
    SelectedMetaData,
    WordTemplate,
    WordTemplateSummary,
    WordTemplateVisibility,
} from '../types/word-template-types';

export type WordTemplateState = {
    templates: WordTemplateSummary[];
    publicTemplates: WordTemplateSummary[];
    userTemplates: WordTemplateSummary[];
    portalTemplates: WordTemplateSummary[];
    currentTemplate: WordTemplate | null;
    selectedTemplate: WordTemplateSummary | null;
    selectedTemplates: SelectedMetaData[];
    favorites: string[];
    isLoading: boolean;
    isFetched: boolean;
    isInitialized: boolean;
    error: string | null;
    isSettingsOpen: boolean;
    isDeleting: boolean | string;
};

const initialState: WordTemplateState = {
    templates: [],
    publicTemplates: [],
    userTemplates: [],
    portalTemplates: [],
    currentTemplate: null,
    selectedTemplate: null,
    selectedTemplates: [],
    favorites: [],
    isLoading: false,
    isFetched: false,
    isInitialized: false,
    error: null,
    isSettingsOpen: false,
    isDeleting: false,
};

function resolveSelectedTemplate(
    state: WordTemplateState,
    selected: SelectedMetaData[],
): WordTemplateSummary | null {
    const selectedTemplateId = selected.find(s => s.is_current)?.template_id || null;
    let selectedTemplate =
        state.templates.find(t => Number(t.id) === Number(selectedTemplateId)) || null;

    selectedTemplate =
        [...state.userTemplates, ...state.portalTemplates, ...state.publicTemplates].find(
            t => Number(t.id) === Number(selectedTemplateId),
        ) || null;

    if (!selectedTemplate) {
        selectedTemplate = state.portalTemplates.find(t => t.is_default === true) || null;
    }
    if (!selectedTemplate) {
        selectedTemplate = state.publicTemplates.find(t => t.is_default === true) || null;
    }
    if (!selectedTemplate) {
        selectedTemplate = state.portalTemplates[0] || null;
    }
    if (!selectedTemplate) {
        selectedTemplate = state.publicTemplates[0] || null;
    }
    if (!selectedTemplate) {
        selectedTemplate = state.userTemplates[0] || null;
    }
    if (!selectedTemplate) {
        selectedTemplate = state.templates[0] || null;
    }
    return selectedTemplate;
}

export const wordTemplateSlice = createSlice({
    name: 'offerTemplateWord',
    initialState,
    reducers: {
        setLoading: (state: WordTemplateState, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setTemplates: (state: WordTemplateState, action: PayloadAction<WordTemplateSummary[]>) => {
            state.templates = action.payload;
            state.isFetched = true;
            state.isLoading = false;
            state.error = null;
        },
        setPublicTemplates: (state: WordTemplateState, action: PayloadAction<WordTemplateSummary[]>) => {
            state.publicTemplates = action.payload;
        },
        setUserTemplates: (state: WordTemplateState, action: PayloadAction<WordTemplateSummary[]>) => {
            state.userTemplates = action.payload;
        },
        setPortalTemplates: (state: WordTemplateState, action: PayloadAction<WordTemplateSummary[]>) => {
            state.portalTemplates = action.payload;
        },
        setCurrentTemplate: (state: WordTemplateState, action: PayloadAction<WordTemplate | null>) => {
            state.currentTemplate = action.payload;
        },
        setSelectedTemplate: (state: WordTemplateState, action: PayloadAction<WordTemplateSummary | null>) => {
            state.selectedTemplate = action.payload;
        },
        setFetchedSelectedTemplates: (state: WordTemplateState, action: PayloadAction<SelectedMetaData[]>) => {
            state.selectedTemplates = action.payload;
            state.selectedTemplate = resolveSelectedTemplate(state, action.payload);
        },
        setFetchedFavorites: (state: WordTemplateState, action: PayloadAction<string[]>) => {
            state.favorites = action.payload;
        },
        setFetched: (state: WordTemplateState, action: PayloadAction<boolean>) => {
            state.isFetched = action.payload;
        },
        setInitialized: (state: WordTemplateState, action: PayloadAction<boolean>) => {
            state.isInitialized = action.payload;
        },
        setError: (state: WordTemplateState, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        addTemplate: (state: WordTemplateState, action: PayloadAction<WordTemplateSummary | WordTemplate>) => {
            const newTemplate = action.payload as WordTemplateSummary;
            state.templates.push(newTemplate);
            const visibility = newTemplate.visibility;
            if (visibility === WordTemplateVisibility.PUBLIC) {
                state.publicTemplates.push(newTemplate);
            } else if (visibility === WordTemplateVisibility.USER) {
                state.userTemplates.push(newTemplate);
            } else if (visibility === WordTemplateVisibility.PORTAL) {
                state.portalTemplates.push(newTemplate);
            }
        },
        updateTemplate: (state: WordTemplateState, action: PayloadAction<WordTemplateSummary | WordTemplate>) => {
            const updatedTemplate = action.payload;
            const map = (t: WordTemplateSummary) =>
                t.id === updatedTemplate.id ? updatedTemplate : t;
            state.templates = state.templates.map(map);
            state.publicTemplates = state.publicTemplates.map(map);
            state.userTemplates = state.userTemplates.map(map);
            state.portalTemplates = state.portalTemplates.map(map);
            if (state.currentTemplate?.id === updatedTemplate.id) {
                state.currentTemplate = updatedTemplate as WordTemplate;
            }
            if (state.selectedTemplate?.id === updatedTemplate.id) {
                state.selectedTemplate = updatedTemplate;
            }
        },
        deleteTemplate: (state: WordTemplateState, action: PayloadAction<string>) => {
            const id = action.payload;
            state.templates = state.templates.filter(t => t.id !== id);
            state.publicTemplates = state.publicTemplates.filter(t => t.id !== id);
            state.userTemplates = state.userTemplates.filter(t => t.id !== id);
            state.portalTemplates = state.portalTemplates.filter(t => t.id !== id);
            if (state.currentTemplate?.id === id) {
                state.currentTemplate = null;
            }
            if (state.selectedTemplate?.id === id) {
                state.selectedTemplate = null;
            }
            state.favorites = state.favorites.filter(f => f !== id);
        },
        setDeleting: (state: WordTemplateState, action: PayloadAction<string | false>) => {
            state.isDeleting = action.payload || false;
        },
        addToFavorites: (state: WordTemplateState, action: PayloadAction<string>) => {
            const id = action.payload;
            if (!state.favorites.includes(id)) {
                state.favorites.push(id);
            }
        },
        removeFromFavorites: (state: WordTemplateState, action: PayloadAction<string>) => {
            state.favorites = state.favorites.filter(fid => fid !== action.payload);
        },
        setSettingsOpen: (state: WordTemplateState, action: PayloadAction<boolean>) => {
            state.isSettingsOpen = action.payload;
        },
        clear: () => initialState,
    },
});

export const wordTemplateAC = wordTemplateSlice.actions;
export const wordTemplate = wordTemplateSlice.reducer;
