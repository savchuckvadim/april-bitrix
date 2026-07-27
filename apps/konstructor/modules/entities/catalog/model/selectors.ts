import type { CatalogState } from './CatalogSlice';

/**
 * Селекторы каталога. Стейт-срез подключается в store под ключом `catalog`.
 * Типизируем через структурный интерфейс, чтобы не тянуть RootState в entity.
 */
interface WithCatalog {
    catalog: CatalogState;
}

export const selectCatalog = (state: WithCatalog) => state.catalog.catalog;
export const selectCatalogLoading = (state: WithCatalog) =>
    state.catalog.loading;
export const selectCatalogReady = (state: WithCatalog) =>
    state.catalog.loading === 'succeeded';

export const selectComplects = (state: WithCatalog) =>
    state.catalog.catalog.complects;
export const selectSupplies = (state: WithCatalog) =>
    state.catalog.catalog.supplies;
export const selectContracts = (state: WithCatalog) =>
    state.catalog.catalog.contracts;
export const selectRegions = (state: WithCatalog) =>
    state.catalog.catalog.regions;
export const selectServices = (state: WithCatalog) =>
    state.catalog.catalog.services;

export const selectComplectByCode = (code: string) => (state: WithCatalog) =>
    state.catalog.catalog.complects.byCode[code] ?? null;
