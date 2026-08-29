/**
 * Минимальные подделки браузерных хранилищ для тестов swr-cache.
 * Реализуют ровно то, чем пользуется утилита: get/put/delete/getAllKeys
 * у IndexedDB и Storage-интерфейс у localStorage.
 */

type FakeHandler = (() => void) | null;

class FakeRequest<T> {
    result!: T;
    error: unknown = null;
    onsuccess: FakeHandler = null;
    onerror: FakeHandler = null;
    onupgradeneeded: FakeHandler = null;
    onblocked: FakeHandler = null;
}

/** Запрос IndexedDB отвечает асинхронно — обработчики вешают уже после вызова. */
const settle = <T>(request: FakeRequest<T>, run: () => T): FakeRequest<T> => {
    queueMicrotask(() => {
        try {
            request.result = run();
            request.onsuccess?.();
        } catch (e) {
            request.error = e;
            request.onerror?.();
        }
    });

    return request;
};

class FakeObjectStore {
    constructor(private readonly rows: Map<string, unknown>) {}

    get(key: string) {
        return settle(new FakeRequest<unknown>(), () => this.rows.get(key));
    }

    put(value: unknown, key: string) {
        return settle(new FakeRequest<string>(), () => {
            this.rows.set(key, value);
            return key;
        });
    }

    delete(key: string) {
        return settle(new FakeRequest<undefined>(), (): undefined => {
            this.rows.delete(key);
            return undefined;
        });
    }

    getAllKeys() {
        return settle(new FakeRequest<string[]>(), () => [...this.rows.keys()]);
    }
}

class FakeDatabase {
    private readonly stores = new Map<string, Map<string, unknown>>();

    readonly objectStoreNames = {
        contains: (name: string) => this.stores.has(name),
    };

    createObjectStore(name: string) {
        const rows = new Map<string, unknown>();

        this.stores.set(name, rows);

        return new FakeObjectStore(rows);
    }

    transaction(name: string) {
        const rows = this.stores.get(name);

        if (!rows) {
            throw new Error(`Нет хранилища "${name}"`);
        }

        return { objectStore: () => new FakeObjectStore(rows) };
    }

    close() {}
}

export type FakeIndexedDbOptions = {
    /** Открытие базы отвечает ошибкой — проверяем откат на localStorage */
    failOpen?: boolean;
    /** Открытие базы залипает навсегда — проверяем таймаут */
    hangOpen?: boolean;
};

/** Подделка `window.indexedDB`. */
export const createFakeIndexedDb = (options: FakeIndexedDbOptions = {}) => {
    const databases = new Map<string, FakeDatabase>();

    return {
        open: (name: string) => {
            const request = new FakeRequest<FakeDatabase>();

            if (options.hangOpen) {
                return request;
            }

            queueMicrotask(() => {
                if (options.failOpen) {
                    request.error = new Error('IndexedDB недоступен');
                    request.onerror?.();
                    return;
                }

                let db = databases.get(name);
                const isNew = !db;

                if (!db) {
                    db = new FakeDatabase();
                    databases.set(name, db);
                }

                request.result = db;

                if (isNew) {
                    request.onupgradeneeded?.();
                }

                request.onsuccess?.();
            });

            return request;
        },
    };
};

export type FakeLocalStorageOptions = {
    /** Запись всегда бросает — имитация QuotaExceededError */
    failWrite?: boolean;
};

/** Подделка `window.localStorage` поверх Map. */
export const createFakeLocalStorage = (
    options: FakeLocalStorageOptions = {},
): Storage => {
    const rows = new Map<string, string>();

    const storage: Storage = {
        get length() {
            return rows.size;
        },
        clear: () => rows.clear(),
        getItem: (key: string) => rows.get(key) ?? null,
        key: (index: number) => [...rows.keys()][index] ?? null,
        removeItem: (key: string) => {
            rows.delete(key);
        },
        setItem: (key: string, value: string) => {
            if (options.failWrite) {
                throw new Error('QuotaExceededError');
            }
            rows.set(key, value);
        },
    };

    return storage;
};
