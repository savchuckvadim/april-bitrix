import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSwrStorageKind } from '../swr-cache-storage';
import { resetSwrCacheRuntime, swrCache } from '../swr-cache';
import type { SwrCacheKey, SwrFetchContext } from '../swr-cache.type';
import AES from 'crypto-js/aes';

import { getSwrCacheSecret } from '../swr-cache-key';
import { createFakeIndexedDb, createFakeLocalStorage } from './fake-storage';

type Portal = { title: string };

const ALPHA = 'alpha.bitrix24.ru';
const BETA = 'beta.bitrix24.ru';

const portalKey = (domain = ALPHA, version = 1): SwrCacheKey => ({
    name: 'portal',
    domain,
    version,
});

/** Подсовываем утилите нужный набор хранилищ и сбрасываем её состояние. */
const mountWindow = (win: Record<string, unknown> | null) => {
    if (win) {
        (globalThis as Record<string, unknown>).window = win;
    } else {
        delete (globalThis as Record<string, unknown>).window;
    }

    resetSwrCacheRuntime();
};

const withIndexedDb = () =>
    mountWindow({
        indexedDB: createFakeIndexedDb(),
        localStorage: createFakeLocalStorage(),
    });

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    withIndexedDb();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    mountWindow(null);
});

describe('swrCache.resolve — свежая запись', () => {
    it('отдаёт кэш и вообще не трогает сеть', async () => {
        await swrCache.write<Portal>(portalKey(), { title: 'из кэша' });

        const fetcher = vi.fn(async () => ({ title: 'из сети' }));
        const result = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher,
        });

        expect(result.source).toBe('fresh');
        expect(result.value).toEqual({ title: 'из кэша' });
        expect(result.revalidation).toBeNull();
        expect(fetcher).not.toHaveBeenCalled();
    });
});

describe('swrCache.resolve — протухшая запись', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-08-01T09:00:00Z'));
    });

    it('отдаёт старое немедленно, а сеть зовёт в фоне', async () => {
        await swrCache.write<Portal>(portalKey(), { title: 'вчерашний' });
        vi.setSystemTime(new Date('2026-08-03T09:00:00Z'));

        const fetcher = vi.fn(async () => ({ title: 'сегодняшний' }));
        const onUpdate = vi.fn();
        const result = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher,
            onUpdate,
        });

        // старое пришло синхронно с чтением кэша, до ответа сети
        expect(result.source).toBe('stale');
        expect(result.value).toEqual({ title: 'вчерашний' });
        expect(onUpdate).not.toHaveBeenCalled();

        await expect(result.revalidation).resolves.toBe('updated');

        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(onUpdate).toHaveBeenCalledWith({ title: 'сегодняшний' });

        const entry = await swrCache.read<Portal>(portalKey());

        expect(entry?.value).toEqual({ title: 'сегодняшний' });
        expect(entry?.isStale).toBe(false);
    });

    it('ошибка фонового обновления оставляет старое значение', async () => {
        await swrCache.write<Portal>(portalKey(), { title: 'вчерашний' });
        const before = await swrCache.read<Portal>(portalKey());

        vi.setSystemTime(new Date('2026-08-03T09:00:00Z'));

        const onUpdate = vi.fn();
        const result = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher: async () => {
                throw new Error('502 Bad Gateway');
            },
            onUpdate,
        });

        expect(result.value).toEqual({ title: 'вчерашний' });
        await expect(result.revalidation).resolves.toBe('failed');

        const after = await swrCache.read<Portal>(portalKey());

        expect(after?.value).toEqual({ title: 'вчерашний' });
        expect(after?.savedAt).toBe(before?.savedAt);
        expect(onUpdate).not.toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalled();
    });

    it('пустой и битый ответ кэш не затирают', async () => {
        await swrCache.write<Portal>(portalKey(), { title: 'вчерашний' });
        vi.setSystemTime(new Date('2026-08-03T09:00:00Z'));

        const empty = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher: async () => null,
        });

        await expect(empty.revalidation).resolves.toBe('failed');

        const broken = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher: async () => ({ title: '' }),
            validate: value => Boolean((value as Portal).title),
        });

        await expect(broken.revalidation).resolves.toBe('failed');

        const entry = await swrCache.read<Portal>(portalKey());

        expect(entry?.value).toEqual({ title: 'вчерашний' });
    });

    it('зависший запрос обрывается по таймауту, старое остаётся', async () => {
        await swrCache.write<Portal>(portalKey(), { title: 'вчерашний' });
        vi.setSystemTime(new Date('2026-08-03T09:00:00Z'));

        const seen: { ctx: SwrFetchContext | null } = { ctx: null };
        const result = await swrCache.resolve<Portal>({
            key: portalKey(),
            timeoutMs: 20,
            fetcher: ctx => {
                seen.ctx = ctx;
                return new Promise<Portal>(() => {});
            },
        });

        expect(result.value).toEqual({ title: 'вчерашний' });
        await expect(result.revalidation).resolves.toBe('failed');
        expect(seen.ctx?.signal?.aborted).toBe(true);

        const entry = await swrCache.read<Portal>(portalKey());

        expect(entry?.value).toEqual({ title: 'вчерашний' });
    });
});

describe('swrCache.resolve — пустой кэш', () => {
    it('ждёт сеть и отдаёт сетевое значение', async () => {
        const result = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher: async () => ({ title: 'из сети' }),
        });

        expect(result.source).toBe('network');
        expect(result.value).toEqual({ title: 'из сети' });

        const entry = await swrCache.read<Portal>(portalKey());

        expect(entry?.value).toEqual({ title: 'из сети' });
    });

    it('ошибка сети без кэша — честная ошибка наверх', async () => {
        await expect(
            swrCache.resolve<Portal>({
                key: portalKey(),
                fetcher: async () => {
                    throw new Error('нет сети');
                },
            }),
        ).rejects.toThrow('нет сети');
    });
});

describe('swrCache.resolve — один запрос на ключ', () => {
    it('три параллельных вызова делят один запрос', async () => {
        let calls = 0;
        let release: () => void = () => {};
        const gate = new Promise<void>(resolve => {
            release = resolve;
        });

        const fetcher = async () => {
            calls += 1;
            await gate;
            return { title: 'из сети' };
        };

        const pending = Promise.all([
            swrCache.resolve<Portal>({ key: portalKey(), fetcher }),
            swrCache.resolve<Portal>({ key: portalKey(), fetcher }),
            swrCache.resolve<Portal>({ key: portalKey(), fetcher }),
        ]);

        release();

        const results = await pending;

        expect(calls).toBe(1);
        expect(results.map(item => item.value.title)).toEqual([
            'из сети',
            'из сети',
            'из сети',
        ]);
    });
});

describe('ключ записи', () => {
    it('разные домены не пересекаются', async () => {
        await swrCache.write<Portal>(portalKey(ALPHA), { title: 'альфа' });

        expect(await swrCache.read<Portal>(portalKey(BETA))).toBeNull();

        await swrCache.write<Portal>(portalKey(BETA), { title: 'бета' });

        const alpha = await swrCache.read<Portal>(portalKey(ALPHA));
        const beta = await swrCache.read<Portal>(portalKey(BETA));

        expect(alpha?.value).toEqual({ title: 'альфа' });
        expect(beta?.value).toEqual({ title: 'бета' });
    });

    it('смена версии схемы обесценивает старую запись', async () => {
        await swrCache.write<Portal>(portalKey(ALPHA, 1), { title: 'старая' });

        expect(await swrCache.read<Portal>(portalKey(ALPHA, 2))).toBeNull();

        await swrCache.write<Portal>(portalKey(ALPHA, 2), { title: 'новая' });

        // запись прошлой версии убрана — но только ПОСЛЕ появления новой
        expect(await swrCache.read<Portal>(portalKey(ALPHA, 1))).toBeNull();
        expect(
            (await swrCache.read<Portal>(portalKey(ALPHA, 2)))?.value,
        ).toEqual({ title: 'новая' });
    });
});

describe('выбор хранилища', () => {
    it('IndexedDB — первым', async () => {
        await expect(getSwrStorageKind()).resolves.toBe('indexeddb');
    });

    it('IndexedDB отказал — работаем на localStorage', async () => {
        const local = createFakeLocalStorage();

        mountWindow({
            indexedDB: createFakeIndexedDb({ failOpen: true }),
            localStorage: local,
        });

        await expect(getSwrStorageKind()).resolves.toBe('localstorage');

        await swrCache.write<Portal>(portalKey(), { title: 'запасной путь' });

        expect(local.length).toBe(1);
        expect(local.key(0)).toContain('swrc:v1:portal:');
        expect((await swrCache.read<Portal>(portalKey()))?.value).toEqual({
            title: 'запасной путь',
        });
    });

    it('обоих хранилищ нет — утилита сквозная, ничего не роняет', async () => {
        mountWindow({});

        await expect(getSwrStorageKind()).resolves.toBe('none');
        expect(await swrCache.write<Portal>(portalKey(), { title: 'x' })).toBe(
            false,
        );
        expect(await swrCache.read<Portal>(portalKey())).toBeNull();

        const fetcher = vi.fn(async () => ({ title: 'из сети' }));

        const first = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher,
        });
        const second = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher,
        });

        expect(first.source).toBe('network');
        expect(second.source).toBe('network');
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('на сервере (нет window) утилита не падает', async () => {
        mountWindow(null);

        await expect(getSwrStorageKind()).resolves.toBe('none');
        expect(await swrCache.read<Portal>(portalKey())).toBeNull();
        await expect(swrCache.remove(portalKey())).resolves.toBeUndefined();

        const result = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher: async () => ({ title: 'из сети' }),
        });

        expect(result.source).toBe('network');
    });

    it('переполненный localStorage не роняет запись', async () => {
        mountWindow({
            indexedDB: createFakeIndexedDb({ failOpen: true }),
            localStorage: createFakeLocalStorage({ failWrite: true }),
        });

        await expect(getSwrStorageKind()).resolves.toBe('none');
        expect(await swrCache.write<Portal>(portalKey(), { title: 'x' })).toBe(
            false,
        );
    });
});

describe('swrCache.cleanup', () => {
    it('убирает записи старше предельного возраста', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-07-01T09:00:00Z'));

        await swrCache.write<Portal>(portalKey(), { title: 'древний' });

        vi.setSystemTime(new Date('2026-09-01T09:00:00Z'));

        await expect(swrCache.cleanup()).resolves.toBe(1);
        expect(await swrCache.read<Portal>(portalKey())).toBeNull();
    });
});

describe('swrCache.expire — явная инвалидация', () => {
    it('помечает запись протухшей, но значение оставляет на месте', async () => {
        await swrCache.write<Portal>(portalKey(), { title: 'вчерашний' });

        expect((await swrCache.read<Portal>(portalKey()))?.isStale).toBe(false);
        await expect(swrCache.expire(portalKey())).resolves.toBe(true);

        const entry = await swrCache.read<Portal>(portalKey());

        // это НЕ удаление: значение читается как прежде
        expect(entry?.value).toEqual({ title: 'вчерашний' });
        expect(entry?.isStale).toBe(true);
    });

    it('после пометки resolve отдаёт старое и обновляет в фоне', async () => {
        await swrCache.write<Portal>(portalKey(), { title: 'вчерашний' });
        await swrCache.expire(portalKey());

        const fetcher = vi.fn(async () => ({ title: 'переустановленный' }));
        const result = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher,
        });

        expect(result.source).toBe('stale');
        expect(result.value).toEqual({ title: 'вчерашний' });
        await expect(result.revalidation).resolves.toBe('updated');

        const entry = await swrCache.read<Portal>(portalKey());

        // удачное обновление снимает и пометку
        expect(entry?.value).toEqual({ title: 'переустановленный' });
        expect(entry?.isStale).toBe(false);
    });

    it('после пометки упавшая сеть оставляет старое значение рабочим', async () => {
        await swrCache.write<Portal>(portalKey(), { title: 'вчерашний' });
        await swrCache.expire(portalKey());

        const result = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher: async () => {
                throw new Error('бэк лежит');
            },
        });

        expect(result.value).toEqual({ title: 'вчерашний' });
        await expect(result.revalidation).resolves.toBe('failed');

        const entry = await swrCache.read<Portal>(portalKey());

        expect(entry?.value).toEqual({ title: 'вчерашний' });
        // пометка держится — следующий старт снова попробует обновить
        expect(entry?.isStale).toBe(true);
    });

    it('помечать нечего — сообщает об этом, ничего не создавая', async () => {
        await expect(swrCache.expire(portalKey())).resolves.toBe(false);
        expect(await swrCache.read<Portal>(portalKey())).toBeNull();
    });
});

describe('swrCache.expire — пометка во время запроса', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-08-01T09:00:00Z'));
    });

    /** Запрос, который отпускают руками: имитирует ответ, зависший в полёте. */
    const heldFetcher = () => {
        let release: (value: Portal) => void = () => {};
        const pending = new Promise<Portal>(resolve => {
            release = resolve;
        });

        return { pending, release: (value: Portal) => release(value) };
    };

    it('ответ запроса, стартовавшего до пометки, её не снимает', async () => {
        await swrCache.write<Portal>(portalKey(), { title: 'вчерашний' });
        vi.setSystemTime(new Date('2026-08-03T09:00:00Z'));

        const held = heldFetcher();
        // запрос ушёл ДО того, как на портале переустановили поля
        const result = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher: () => held.pending,
        });

        expect(result.source).toBe('stale');

        // ⟳ прямо во время полёта
        vi.setSystemTime(new Date('2026-08-03T09:00:01Z'));
        await swrCache.expire(portalKey());

        held.release({ title: 'слепок до переустановки' });
        await expect(result.revalidation).resolves.toBe('updated');

        const entry = await swrCache.read<Portal>(portalKey());

        // слепок «до» в кэш не лёг и пометку не снял
        expect(entry?.value).toEqual({ title: 'вчерашний' });
        expect(entry?.isStale).toBe(true);

        // а значит ближайший resolve по-прежнему идёт в сеть
        const fetcher = vi.fn(async () => ({ title: 'переустановленный' }));
        const next = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher,
        });

        expect(next.source).toBe('stale');
        await expect(next.revalidation).resolves.toBe('updated');
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect((await swrCache.read<Portal>(portalKey()))?.value).toEqual({
            title: 'переустановленный',
        });
    });

    it('пометка снимает запрос с полёта — resolve поднимает новый', async () => {
        await swrCache.write<Portal>(portalKey(), { title: 'вчерашний' });
        vi.setSystemTime(new Date('2026-08-03T09:00:00Z'));

        const calls: string[] = [];
        const held = heldFetcher();

        const first = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher: () => {
                calls.push('до пометки');
                return held.pending;
            },
        });

        expect(first.source).toBe('stale');

        vi.setSystemTime(new Date('2026-08-03T09:00:01Z'));
        await swrCache.expire(portalKey());

        // это и есть ⟳: init пошёл заново, пока прежний запрос ещё висит
        const second = await swrCache.resolve<Portal>({
            key: portalKey(),
            fetcher: async () => {
                calls.push('после пометки');
                return { title: 'переустановленный' };
            },
        });

        await expect(second.revalidation).resolves.toBe('updated');

        // новый запрос, а не подхваченный старый
        expect(calls).toEqual(['до пометки', 'после пометки']);

        const updated = await swrCache.read<Portal>(portalKey());

        expect(updated?.value).toEqual({ title: 'переустановленный' });
        expect(updated?.isStale).toBe(false);

        // запоздавший ответ старого запроса свежую запись не затирает
        held.release({ title: 'слепок до переустановки' });
        await expect(first.revalidation).resolves.toBe('updated');

        const settled = await swrCache.read<Portal>(portalKey());

        expect(settled?.value).toEqual({ title: 'переустановленный' });
        expect(settled?.isStale).toBe(false);
    });
});

describe('формат записи — без шифрования', () => {
    it('новая запись лежит открыто: значение читается без расшифровки', async () => {
        const local = createFakeLocalStorage();

        mountWindow({
            indexedDB: createFakeIndexedDb({ failOpen: true }),
            localStorage: local,
        });

        await swrCache.write<Portal>(portalKey(), { title: 'открытым текстом' });

        const raw = local.getItem(local.key(0) as string) as string;
        const envelope = JSON.parse(raw) as Record<string, unknown>;

        // Шифрование убрали (решение владельца 28.08.2026): ключом был домен,
        // который и так виден в адресе фрейма, а AES стоил десятков
        // миллисекунд синхронно на каждом чтении и записи слепка.
        expect(envelope.f).toBe(2);
        expect(envelope.data).toBeUndefined();
        expect(envelope.value).toEqual({ title: 'открытым текстом' });
    });

    it('запись прежнего, зашифрованного формата по-прежнему читается', async () => {
        const local = createFakeLocalStorage();

        mountWindow({
            indexedDB: createFakeIndexedDb({ failOpen: true }),
            localStorage: local,
        });

        const key = portalKey();

        // Кладём запись руками ровно в том виде, в каком её оставила
        // прежняя версия утилиты: формат 1, значение под AES.
        await swrCache.write<Portal>(key, { title: 'будет переписан' });
        const storageKey = local.key(0) as string;

        local.setItem(
            storageKey,
            JSON.stringify({
                f: 1,
                v: key.version,
                savedAt: Date.now(),
                data: AES.encrypt(
                    JSON.stringify({ title: 'из старого кэша' }),
                    getSwrCacheSecret(key),
                ).toString(),
            }),
        );

        // Иначе после выката фронта у всех разом пропал бы кэш портала —
        // и первый же старт при недоступном бэке остался бы без слепка.
        expect((await swrCache.read<Portal>(key))?.value).toEqual({
            title: 'из старого кэша',
        });
    });
});
