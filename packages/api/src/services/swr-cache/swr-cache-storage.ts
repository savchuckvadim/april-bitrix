import type { SwrStorage, SwrStorageKind } from './swr-cache.type';

const DB_NAME = 'april-swr-cache';
const DB_VERSION = 1;
const STORE_NAME = 'entries';
/** Открытие IndexedDB может «залипнуть» (blocked, приватный режим) — не ждём вечно. */
const DB_OPEN_TIMEOUT_MS = 3_000;
const PROBE_KEY = '__swrc_probe__';

/** Окно браузера или `undefined` на сервере — единственная точка доступа к глобалам. */
const getWindowSafe = (): (Window & typeof globalThis) | undefined => {
    try {
        return typeof window === 'undefined' ? undefined : window;
    } catch {
        // Safari/ITP в partitioned-iframe умеет бросать на самом обращении
        return undefined;
    }
};

/** Хранилища нет: читаем пусто, пишем в никуда. Вызывающий этого не замечает. */
const createNoneStorage = (): SwrStorage => ({
    kind: 'none',
    get: async () => null,
    set: async () => false,
    remove: async () => {},
    keys: async () => [],
});

const promisifyRequest = <T>(request: IDBRequest<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

/** Открывает базу. `null` — IndexedDB недоступен, залип или отказал. */
const openDatabase = (factory: IDBFactory): Promise<IDBDatabase | null> =>
    new Promise<IDBDatabase | null>(resolve => {
        let settled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const settle = (db: IDBDatabase | null) => {
            if (settled) {
                return;
            }
            settled = true;
            if (timer !== undefined) {
                clearTimeout(timer);
            }
            resolve(db);
        };

        try {
            const request = factory.open(DB_NAME, DB_VERSION);

            timer = setTimeout(() => settle(null), DB_OPEN_TIMEOUT_MS);

            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            request.onsuccess = () => settle(request.result);
            request.onerror = () => settle(null);
            request.onblocked = () => settle(null);
        } catch {
            settle(null);
        }
    });

const createIndexedDbStorage = (db: IDBDatabase): SwrStorage => {
    const withStore = async <T>(
        mode: IDBTransactionMode,
        run: (store: IDBObjectStore) => IDBRequest<T>,
    ): Promise<T | null> => {
        try {
            const transaction = db.transaction(STORE_NAME, mode);

            return await promisifyRequest(
                run(transaction.objectStore(STORE_NAME)),
            );
        } catch (e) {
            console.warn('[swr-cache] IndexedDB отказал, запись пропущена', e);
            return null;
        }
    };

    return {
        kind: 'indexeddb',
        get: async key => {
            const raw = await withStore<unknown>('readonly', store =>
                store.get(key),
            );

            return typeof raw === 'string' ? raw : null;
        },
        set: async (key, raw) => {
            const result = await withStore<IDBValidKey>('readwrite', store =>
                store.put(raw, key),
            );

            return result !== null;
        },
        remove: async key => {
            await withStore<undefined>('readwrite', store => store.delete(key));
        },
        keys: async () => {
            const raw = await withStore<IDBValidKey[]>('readonly', store =>
                store.getAllKeys(),
            );

            return (raw ?? []).filter(
                (key): key is string => typeof key === 'string',
            );
        },
    };
};

/** Проверяем localStorage на деле: в приватном режиме он есть, но бросает. */
const probeLocalStorage = (storage: Storage): boolean => {
    try {
        storage.setItem(PROBE_KEY, '1');
        storage.removeItem(PROBE_KEY);
        return true;
    } catch {
        return false;
    }
};

const createLocalStorageStorage = (storage: Storage): SwrStorage => ({
    kind: 'localstorage',
    get: async key => {
        try {
            return storage.getItem(key);
        } catch {
            return null;
        }
    },
    set: async (key, raw) => {
        try {
            storage.setItem(key, raw);
            return true;
        } catch (e) {
            // Чаще всего QuotaExceededError: кэш — вещь необязательная,
            // приложение из-за неё падать не должно
            console.warn('[swr-cache] localStorage не принял запись', e);
            return false;
        }
    },
    remove: async key => {
        try {
            storage.removeItem(key);
        } catch {
            // запись всё равно перестанет читаться — молчим
        }
    },
    keys: async () => {
        try {
            const result: string[] = [];

            for (let i = 0; i < storage.length; i += 1) {
                const key = storage.key(i);

                if (key) {
                    result.push(key);
                }
            }

            return result;
        } catch {
            return [];
        }
    },
});

const selectStorage = async (): Promise<SwrStorage> => {
    const win = getWindowSafe();

    if (!win) {
        // SSR: ни window, ни хранилищ — утилита работает сквозной
        return createNoneStorage();
    }

    try {
        if (win.indexedDB) {
            const db = await openDatabase(win.indexedDB);

            if (db) {
                return createIndexedDbStorage(db);
            }
        }
    } catch {
        // падаем на localStorage
    }

    try {
        const local = win.localStorage;

        if (local && probeLocalStorage(local)) {
            return createLocalStorageStorage(local);
        }
    } catch {
        // приватный режим / отключённые куки — остаётся сквозной режим
    }

    return createNoneStorage();
};

let storagePromise: Promise<SwrStorage> | null = null;

/** Хранилище выбирается один раз за сессию: IndexedDB → localStorage → никакое. */
export const getSwrStorage = (): Promise<SwrStorage> => {
    if (!storagePromise) {
        storagePromise = selectStorage().catch(() => createNoneStorage());
    }

    return storagePromise;
};

/** Какое хранилище выбрано — для диагностики. */
export const getSwrStorageKind = async (): Promise<SwrStorageKind> =>
    (await getSwrStorage()).kind;

/** Сброс выбранного хранилища. Нужен тестам и хот-релоаду. */
export const resetSwrStorage = (): void => {
    storagePromise = null;
};
