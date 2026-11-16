import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InitV2Data } from '../../model/dto';

const swr = vi.hoisted(() => ({
    resolveSwrCache: vi.fn(),
    writeSwrCache: vi.fn(),
}));

vi.mock('@workspace/api', () => ({
    resolveSwrCache: swr.resolveSwrCache,
    writeSwrCache: swr.writeSwrCache,
    SWR_DAY_MS: 86_400_000,
}));

import { loadCatalogData, refreshCatalogData } from '../catalog-cache';

/** Каталог с ценой: по ней тест отличает сохранённый от свежего */
const catalogWith = (price: number) =>
    ({ complects: {}, infoblocks: [], prices: [{ value: price }] }) as unknown as InitV2Data;

interface ResolveOptions {
    staleAfterMs: number;
    onUpdate: (value: InitV2Data) => void;
    validate: (value: unknown) => boolean;
}

const fetcher = () => Promise.resolve(catalogWith(100));

describe('каталог из браузера', () => {
    beforeEach(() => {
        swr.resolveSwrCache.mockReset();
        swr.writeSwrCache.mockReset();
    });

    it('в браузере пусто — каталог из сети, подменять нечем', async () => {
        swr.resolveSwrCache.mockResolvedValue({
            value: catalogWith(100),
            source: 'network',
            revalidation: null,
        });
        const load = await loadCatalogData('portal.ru', fetcher);
        expect(load.fromCache).toBe(false);
        await expect(load.fresh).resolves.toBeNull();
    });

    it('сохранённый отдаётся сразу и обновляется каждый запуск', async () => {
        swr.resolveSwrCache.mockImplementation((options: ResolveOptions) => {
            // свежим сохранённый каталог не считается никогда
            expect(options.staleAfterMs).toBe(0);
            return Promise.resolve({
                value: catalogWith(100),
                source: 'stale',
                revalidation: Promise.resolve('updated').then(outcome => {
                    options.onUpdate(catalogWith(120));
                    return outcome;
                }),
            });
        });
        const load = await loadCatalogData('portal.ru', fetcher);
        expect(load.fromCache).toBe(true);
        expect(load.data).toEqual(catalogWith(100));
        // цены изменились — свежий каталог отдаётся для подмены
        await expect(load.fresh).resolves.toEqual(catalogWith(120));
    });

    it('с сервера пришёл тот же каталог — подмены нет', async () => {
        swr.resolveSwrCache.mockImplementation((options: ResolveOptions) =>
            Promise.resolve({
                value: catalogWith(100),
                source: 'stale',
                revalidation: Promise.resolve('updated').then(outcome => {
                    options.onUpdate(catalogWith(100));
                    return outcome;
                }),
            }),
        );
        const load = await loadCatalogData('portal.ru', fetcher);
        await expect(load.fresh).resolves.toBeNull();
    });

    it('обновить не удалось — работаем на сохранённом', async () => {
        swr.resolveSwrCache.mockResolvedValue({
            value: catalogWith(100),
            source: 'stale',
            revalidation: Promise.resolve('failed'),
        });
        const load = await loadCatalogData('portal.ru', fetcher);
        expect(load.data).toEqual(catalogWith(100));
        await expect(load.fresh).resolves.toBeNull();
    });

    it('битый ответ в браузер не кладётся', async () => {
        swr.resolveSwrCache.mockImplementation((options: ResolveOptions) => {
            expect(options.validate({ message: 'ошибка' })).toBe(false);
            expect(options.validate(null)).toBe(false);
            expect(options.validate(catalogWith(1))).toBe(true);
            return Promise.resolve({
                value: catalogWith(100),
                source: 'network',
                revalidation: null,
            });
        });
        await loadCatalogData('portal.ru', fetcher);
        expect(swr.resolveSwrCache).toHaveBeenCalledTimes(1);
    });

    it('«Обновить» берёт каталог с сервера и обновляет сохранённый', async () => {
        const data = await refreshCatalogData('portal.ru', () => Promise.resolve(catalogWith(150)));
        expect(data).toEqual(catalogWith(150));
        expect(swr.resolveSwrCache).not.toHaveBeenCalled();
        expect(swr.writeSwrCache).toHaveBeenCalledWith(
            { name: 'catalog', domain: 'portal.ru', version: 1 },
            catalogWith(150),
            expect.objectContaining({ startedAt: expect.any(Number) as number }),
        );
    });
});
