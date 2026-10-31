import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectCatalogReady, type InitV2Data } from '@/modules/entities/catalog';
import { complectDescriptionActions } from '@/modules/entities/complect-description';
import { parseAttachmentName } from '../lib/attachment-name.util';
import { publicFlowSurface } from '../lib/public-flow';
import { checkPublicLink, openPublicLink } from '../model/PublicAccessThunk';
import { setupPublicStore } from '../model/public-store';

const CATALOG = {
    complects: { prof: [], universal: [] },
    infoblocks: [],
    regions: [],
    contracts: { current: [], items: [] },
    supplies: [],
    prices: [],
    services: { lt: [], ltPackages: [], consalting: [], star: [] },
    measures: [],
} as unknown as InitV2Data;

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status });

/** Прокси как чёрный ящик: на адрес — ответ или готовый Response. */
const stubProxy = (routes: Record<string, () => Response>) => {
    const fetchMock = vi.fn(async (url: string) => {
        const route = routes[url];
        if (!route) throw new Error(`unexpected ${url}`);
        return route();
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
};

const healthy = {
    '/api/public/tok': () => json({ expiresAt: null }),
    '/api/public/tok/catalog': () => json(CATALOG),
};

describe('публичная ссылка', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: () => null,
            setItem: () => undefined,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('действующая: каталог в сторе, статус ready', async () => {
        stubProxy(healthy);
        const store = setupPublicStore();

        await store.dispatch(openPublicLink('tok'));

        expect(store.getState().publicAccess.status).toBe('ready');
        expect(selectCatalogReady(store.getState())).toBe(true);
    });

    it('отозванная при открытии: статус gone, каталога нет', async () => {
        stubProxy({
            '/api/public/tok': () => json({ error: 'x' }, 410),
            '/api/public/tok/catalog': () => json({ error: 'x' }, 410),
        });
        const store = setupPublicStore();

        await store.dispatch(openPublicLink('tok'));

        expect(store.getState().publicAccess.status).toBe('gone');
        expect(selectCatalogReady(store.getState())).toBe(false);
    });

    it('сбой сервиса при открытии: экран ошибки, повтор возможен', async () => {
        stubProxy({
            '/api/public/tok': () => json({ error: 'x' }, 502),
            '/api/public/tok/catalog': () => json({ error: 'x' }, 502),
        });
        const store = setupPublicStore();

        await store.dispatch(openPublicLink('tok'));
        expect(store.getState().publicAccess.status).toBe('error');

        stubProxy(healthy);
        await store.dispatch(openPublicLink('tok'));
        expect(store.getState().publicAccess.status).toBe('ready');
    });

    it('отзыв на открытой вкладке стирает каталог из памяти', async () => {
        stubProxy(healthy);
        const store = setupPublicStore();
        await store.dispatch(openPublicLink('tok'));

        stubProxy({ '/api/public/tok': () => json({ error: 'x' }, 410) });
        await store.dispatch(checkPublicLink());

        expect(store.getState().publicAccess.status).toBe('gone');
        expect(selectCatalogReady(store.getState())).toBe(false);
    });

    it('сбой сети при проверке экран не закрывает', async () => {
        stubProxy(healthy);
        const store = setupPublicStore();
        await store.dispatch(openPublicLink('tok'));

        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        await store.dispatch(checkPublicLink());

        expect(store.getState().publicAccess.status).toBe('ready');
        expect(selectCatalogReady(store.getState())).toBe(true);
    });

    describe('описание комплекта', () => {
        const content = { complectName: 'Проф', supply: '1 ОД', groups: [] };

        const flush = () => new Promise(resolve => setTimeout(resolve, 0));

        const openedStore = async () => {
            const store = setupPublicStore();
            await store.dispatch(openPublicLink('tok'));
            return store;
        };

        beforeEach(() => {
            vi.stubGlobal('URL', {
                createObjectURL: () => 'blob:docx',
                revokeObjectURL: () => undefined,
            });
        });

        it('файл приходит по токену, ссылка ведёт на него', async () => {
            stubProxy({
                ...healthy,
                '/api/public/tok/description': () =>
                    new Response('docx', {
                        headers: {
                            'Content-Disposition':
                                "attachment; filename*=UTF-8''%D0%9E%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5.docx",
                        },
                    }),
            });
            const store = await openedStore();

            store.dispatch(complectDescriptionActions.requested(content));
            await flush();
            await flush();

            expect(store.getState().complectDescription).toMatchObject({
                status: 'done',
                link: 'blob:docx',
                documentName: 'Описание.docx',
            });
        });

        it('лимит: понятная ошибка, ссылка продолжает работать', async () => {
            stubProxy({
                ...healthy,
                '/api/public/tok/description': () => json({ error: 'x' }, 429),
            });
            const store = await openedStore();

            store.dispatch(complectDescriptionActions.requested(content));
            await flush();
            await flush();

            expect(store.getState().complectDescription.status).toBe('error');
            expect(store.getState().complectDescription.error).toContain('повторите');
            expect(store.getState().publicAccess.status).toBe('ready');
        });

        it('ссылку отозвали за мгновение до запроса: страница закрывается', async () => {
            stubProxy({
                ...healthy,
                '/api/public/tok/description': () => json({ error: 'x' }, 410),
            });
            const store = await openedStore();

            store.dispatch(complectDescriptionActions.requested(content));
            await flush();
            await flush();

            expect(store.getState().publicAccess.status).toBe('gone');
        });
    });
});

describe('поверхность публичной версии', () => {
    const surface = publicFlowSurface('tok');

    it('адреса с токеном и без шага «Документ»', () => {
        expect(surface.basePath).toBe('/p/tok');
        expect(surface.steps.map(step => step.route)).toEqual([
            'params',
            'complect',
            'prices',
        ]);
    });

    it('с первого шага «Назад» вести некуда', () => {
        expect(surface.hasStartScreen).toBe(false);
    });
});

describe('имя файла из заголовка', () => {
    it('нет заголовка — запасное имя', () => {
        expect(parseAttachmentName(null, 'x.docx')).toBe('x.docx');
    });

    it('битая кодировка — запасное имя', () => {
        expect(parseAttachmentName("filename*=UTF-8''%E0%A4%A", 'x.docx')).toBe('x.docx');
    });
});
