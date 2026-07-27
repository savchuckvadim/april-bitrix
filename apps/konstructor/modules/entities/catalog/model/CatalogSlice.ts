import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Catalog } from './types';
import { emptyCatalog } from './types';
import { CatalogHelper } from '../lib/api/catalog-helper';
import { catalogFromInitV2 } from '../lib/adapters/from-init-v2';

export interface CatalogState {
    catalog: Catalog;
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: CatalogState = {
    catalog: emptyCatalog(),
    loading: 'idle',
    error: null,
};

const catalogHelper = new CatalogHelper();

/** Загрузка init v2 и раскладка в доменный каталог */
export const initCatalog = createAsyncThunk<Catalog, { domain: string }>(
    'catalog/init',
    async ({ domain }) => {
        const data = await catalogHelper.getInitData(domain);
        return catalogFromInitV2(data);
    },
);

const catalogSlice = createSlice({
    name: 'catalog',
    initialState,
    reducers: {
        /** Прямая установка каталога (dev-фикстура, тесты) */
        setCatalog(state, action: PayloadAction<Catalog>) {
            state.catalog = action.payload;
            state.loading = 'succeeded';
            state.error = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(initCatalog.pending, state => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(initCatalog.fulfilled, (state, action) => {
                state.catalog = action.payload;
                state.loading = 'succeeded';
            })
            .addCase(initCatalog.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.error.message ?? 'Catalog init failed';
            });
    },
});

// Деструктуризация вместо экспорта slice.actions целиком —
// обход TS2742 (immer-тип не именуется при pnpm-раскладке)
const { setCatalog } = catalogSlice.actions;
export const catalogActions = { setCatalog };
export const catalogReducer = catalogSlice.reducer;
