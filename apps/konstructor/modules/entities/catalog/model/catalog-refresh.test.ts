import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InitV2Data } from './dto';
import type { Catalog } from './types';

const mocks = vi.hoisted(() => ({
    loadCatalogData: vi.fn(),
    refreshCatalogData: vi.fn(),
    hasUserActed: vi.fn(),
}));

vi.mock('../lib/catalog-cache', () => ({
    loadCatalogData: mocks.loadCatalogData,
    refreshCatalogData: mocks.refreshCatalogData,
}));
vi.mock('../lib/first-interaction', () => ({ hasUserActed: mocks.hasUserActed }));
// раскладка каталога тут не проверяется: метка показывает, какой каталог в сторе
vi.mock('../lib/adapters/from-init-v2', () => ({
    catalogFromInitV2: (data: { mark: string; broken?: boolean }) => {
        if (data.broken) throw new Error('каталог старого вида');
        return { mark: data.mark } as unknown as Catalog;
    },
}));
vi.mock('../lib/api/catalog-helper', () => ({
    CatalogHelper: class {
        getInitData = vi.fn();
    },
}));

const data = (mark: string, broken = false) => ({ mark, broken }) as unknown as InitV2Data;
// свежий каталог ставится на следующий тик после сохранённого — ждём с запасом
const flush = () => new Promise(resolve => setTimeout(resolve, 10));

/** Слайс держит «каталог уже грузился во вкладке» на уровне модуля — каждому тесту свой */
const setup = async () => {
    vi.resetModules();
    const { catalogReducer, initCatalog } = await import('./CatalogSlice');
    const store = configureStore({ reducer: { catalog: catalogReducer } });
    const markOf = () => (store.getState().catalog.catalog as unknown as { mark: string }).mark;
    return { store, initCatalog, markOf };
};

describe('каталог: сохранённый сразу, свежий — до первого действия менеджера', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.hasUserActed.mockReturnValue(false);
    });

    it('свежий каталог пришёл, менеджер ещё ничего не нажал — подменяем молча', async () => {
        mocks.loadCatalogData.mockResolvedValue({
            data: data('сохранённый'),
            fromCache: true,
            fresh: Promise.resolve(data('свежий')),
        });
        const { store, initCatalog, markOf } = await setup();

        await store.dispatch(initCatalog({ domain: 'portal.ru' }));
        await flush();

        expect(store.getState().catalog.loading).toBe('succeeded');
        expect(markOf()).toBe('свежий');
    });

    it('менеджер уже работает — цены под рукой не меняются', async () => {
        mocks.hasUserActed.mockReturnValue(true);
        mocks.loadCatalogData.mockResolvedValue({
            data: data('сохранённый'),
            fromCache: true,
            fresh: Promise.resolve(data('свежий')),
        });
        const { store, initCatalog, markOf } = await setup();

        await store.dispatch(initCatalog({ domain: 'portal.ru' }));
        await flush();

        expect(markOf()).toBe('сохранённый');
    });

    it('с сервера пришёл тот же каталог — стор не трогаем', async () => {
        mocks.loadCatalogData.mockResolvedValue({
            data: data('сохранённый'),
            fromCache: true,
            fresh: Promise.resolve(null),
        });
        const { store, initCatalog, markOf } = await setup();

        await store.dispatch(initCatalog({ domain: 'portal.ru' }));
        await flush();

        expect(markOf()).toBe('сохранённый');
    });

    it('повторная загрузка во вкладке («Обновить») идёт на сервер мимо сохранённого', async () => {
        mocks.loadCatalogData.mockResolvedValue({
            data: data('сохранённый'),
            fromCache: true,
            fresh: Promise.resolve(null),
        });
        mocks.refreshCatalogData.mockResolvedValue(data('с сервера'));
        const { store, initCatalog, markOf } = await setup();

        await store.dispatch(initCatalog({ domain: 'portal.ru' }));
        await store.dispatch(initCatalog({ domain: 'portal.ru' }));

        expect(mocks.loadCatalogData).toHaveBeenCalledTimes(1);
        expect(mocks.refreshCatalogData).toHaveBeenCalledTimes(1);
        expect(markOf()).toBe('с сервера');
    });

    it('сохранённый каталог старого вида не разложился — берём с сервера', async () => {
        mocks.loadCatalogData.mockResolvedValue({
            data: data('старый вид', true),
            fromCache: true,
            fresh: Promise.resolve(null),
        });
        mocks.refreshCatalogData.mockResolvedValue(data('с сервера'));
        const { store, initCatalog, markOf } = await setup();

        await store.dispatch(initCatalog({ domain: 'portal.ru' }));

        expect(store.getState().catalog.loading).toBe('succeeded');
        expect(markOf()).toBe('с сервера');
    });
});
