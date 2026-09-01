import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSwrStorage } from '../../swr-cache/swr-cache-storage';
import { getKvStorage, getKvStorageKind, resetKvStorage } from '../kv-storage';
import { createFakeIndexedDb, createFakeLocalStorage } from './fake-storage';

/** Подсовываем слою нужный набор хранилищ и сбрасываем сделанный выбор. */
const mountWindow = (win: Record<string, unknown> | null) => {
    if (win) {
        (globalThis as Record<string, unknown>).window = win;
    } else {
        delete (globalThis as Record<string, unknown>).window;
    }

    resetKvStorage();
};

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mountWindow({
        indexedDB: createFakeIndexedDb(),
        localStorage: createFakeLocalStorage(),
    });
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    mountWindow(null);
});

describe('цепочка выбора хранилища', () => {
    it('IndexedDB — первым', async () => {
        await expect(getKvStorageKind()).resolves.toBe('indexeddb');
    });

    it('IndexedDB отказал — работаем на localStorage', async () => {
        mountWindow({
            indexedDB: createFakeIndexedDb({ failOpen: true }),
            localStorage: createFakeLocalStorage(),
        });

        await expect(getKvStorageKind()).resolves.toBe('localstorage');
    });

    it('зависшее открытие IndexedDB гасится таймаутом', async () => {
        mountWindow({
            indexedDB: createFakeIndexedDb({ hangOpen: true }),
            localStorage: createFakeLocalStorage(),
        });
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

        const kind = getKvStorageKind();

        await vi.advanceTimersByTimeAsync(3_000);

        await expect(kind).resolves.toBe('localstorage');
    });

    it('выбор делается один раз за сессию, сброс выбирает заново', async () => {
        const first = await getKvStorage();

        expect(await getKvStorage()).toBe(first);

        resetKvStorage();

        expect(await getKvStorage()).not.toBe(first);
    });

    it('getSwrStorage — прежнее имя того же синглтона', async () => {
        expect(await getSwrStorage()).toBe(await getKvStorage());
    });
});

describe('изоляция ключей', () => {
    const ENVELOPE_KEY = 'evob:alpha.bitrix24.ru:op-1';
    const CACHE_KEY = 'swrc:v1:portal:alpha.bitrix24.ru';

    /** Соседи с разными префиксами живут рядом и не задевают друг друга. */
    const checkIsolation = async () => {
        const storage = await getKvStorage();

        expect(await storage.set(ENVELOPE_KEY, 'конверт')).toBe(true);
        expect(await storage.set(CACHE_KEY, 'слепок')).toBe(true);

        expect(await storage.get(ENVELOPE_KEY)).toBe('конверт');
        expect(await storage.get(CACHE_KEY)).toBe('слепок');
        expect((await storage.keys()).sort()).toEqual([
            ENVELOPE_KEY,
            CACHE_KEY,
        ]);

        await storage.remove(ENVELOPE_KEY);

        expect(await storage.get(ENVELOPE_KEY)).toBeNull();
        expect(await storage.get(CACHE_KEY)).toBe('слепок');
    };

    it('в IndexedDB', async () => {
        await expect(getKvStorageKind()).resolves.toBe('indexeddb');
        await checkIsolation();
    });

    it('на localStorage — так же', async () => {
        mountWindow({
            indexedDB: createFakeIndexedDb({ failOpen: true }),
            localStorage: createFakeLocalStorage(),
        });

        await expect(getKvStorageKind()).resolves.toBe('localstorage');
        await checkIsolation();
    });
});

describe('отказ обоих хранилищ', () => {
    it('нет ни IndexedDB, ни localStorage — kind «none», операции no-op', async () => {
        mountWindow({});

        await expect(getKvStorageKind()).resolves.toBe('none');

        const storage = await getKvStorage();

        expect(await storage.set('evob:x', 'конверт')).toBe(false);
        expect(await storage.get('evob:x')).toBeNull();
        expect(await storage.keys()).toEqual([]);
        await expect(storage.remove('evob:x')).resolves.toBeUndefined();
    });

    it('localStorage есть, но не пишет — проба отсеивает его до «none»', async () => {
        mountWindow({
            indexedDB: createFakeIndexedDb({ failOpen: true }),
            localStorage: createFakeLocalStorage({ failWrite: true }),
        });

        await expect(getKvStorageKind()).resolves.toBe('none');

        const storage = await getKvStorage();

        expect(await storage.set('evob:x', 'конверт')).toBe(false);
    });

    it('SSR: window отсутствует — «none», ничего не падает', async () => {
        mountWindow(null);

        await expect(getKvStorageKind()).resolves.toBe('none');

        const storage = await getKvStorage();

        expect(await storage.get('evob:x')).toBeNull();
    });
});

describe('фиксация записи в IndexedDB', () => {
    it('set резолвится после коммита транзакции, а не после onsuccess', async () => {
        const journal: string[] = [];

        mountWindow({
            indexedDB: createFakeIndexedDb({ journal }),
            localStorage: createFakeLocalStorage(),
        });

        const storage = await getKvStorage();
        const write = storage.set('evob:x', 'конверт').then(saved => {
            journal.push('resolve');
            return saved;
        });

        await expect(write).resolves.toBe(true);
        expect(journal).toEqual([
            'request.onsuccess',
            'transaction.oncomplete',
            'resolve',
        ]);
    });

    it('аборт транзакции — та же ошибка записи, что у request.onerror', async () => {
        mountWindow({
            indexedDB: createFakeIndexedDb({ abortWrites: true }),
            localStorage: createFakeLocalStorage(),
        });

        await expect(getKvStorageKind()).resolves.toBe('indexeddb');

        const storage = await getKvStorage();

        // тот же путь, что у ошибки запроса: false наружу, warn в консоль
        expect(await storage.set('evob:x', 'конверт')).toBe(false);
        expect(console.warn).toHaveBeenCalled();
        // аборт откатывает транзакцию — чтение живо и отвечает пусто
        expect(await storage.get('evob:x')).toBeNull();
    });
});
