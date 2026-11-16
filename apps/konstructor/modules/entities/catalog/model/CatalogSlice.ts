import {
    createAction,
    createAsyncThunk,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import type { Catalog } from './types';
import { emptyCatalog } from './types';
import { CatalogHelper } from '../lib/api/catalog-helper';
import { catalogFromInitV2 } from '../lib/adapters/from-init-v2';
import { loadCatalogData, refreshCatalogData } from '../lib/catalog-cache';
import { hasUserActed } from '../lib/first-interaction';

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

/** Свежий каталог пришёл следом за сохранённым в браузере и молча встал на его место */
const catalogRefreshed = createAction<Catalog>('catalog/refreshed');

/** Каталог уже грузился в этой вкладке: повторная загрузка — это «Обновить», ей нужен свежий */
let loadedInThisTab = false;

/**
 * Загрузка init v2 и раскладка в доменный каталог.
 *
 * Первый раз во вкладке — «из браузера сразу, свежий следом»
 * (lib/catalog-cache). Свежий, если он отличается, встаёт на место молча, пока
 * менеджер ещё ничего не нажал; после первого действия остаётся в браузере
 * до следующего открытия — цены не меняются под рукой. Восстановленные сделки
 * это не задевает: они хранят свои цены в слепке.
 */
export const initCatalog = createAsyncThunk<Catalog, { domain: string }>(
    'catalog/init',
    async ({ domain }, { dispatch }) => {
        const fetcher = () => catalogHelper.getInitData(domain);
        if (loadedInThisTab) {
            return catalogFromInitV2(await refreshCatalogData(domain, fetcher));
        }

        const { data, fromCache, fresh } = await loadCatalogData(domain, fetcher);
        let markLoaded!: () => void;
        const loaded = new Promise<void>(done => {
            markLoaded = done;
        });
        // Свежий каталог ставится строго после сохранённого: приди он раньше,
        // ответ этой загрузки затёр бы его старым.
        void Promise.all([fresh, loaded]).then(([next]) => {
            if (!next) return;
            // следующий тик: к нему сохранённый каталог уже в сторе (fulfilled)
            setTimeout(() => {
                if (!hasUserActed()) {
                    dispatch(catalogRefreshed(catalogFromInitV2(next)));
                }
            }, 0);
        });

        let catalog: Catalog;
        try {
            catalog = catalogFromInitV2(data);
        } catch (error) {
            if (!fromCache) throw error;
            // сохранённый каталог старого вида не разложился — берём с сервера
            catalog = catalogFromInitV2(await refreshCatalogData(domain, fetcher));
        }
        loadedInThisTab = true;
        markLoaded();
        return catalog;
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
            })
            .addCase(catalogRefreshed, (state, action) => {
                state.catalog = action.payload;
            });
    },
});

// Деструктуризация вместо экспорта slice.actions целиком —
// обход TS2742 (immer-тип не именуется при pnpm-раскладке)
const { setCatalog } = catalogSlice.actions;
export const catalogActions = { setCatalog };
export const catalogReducer = catalogSlice.reducer;
