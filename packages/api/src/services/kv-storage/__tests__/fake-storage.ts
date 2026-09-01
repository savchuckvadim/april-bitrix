/**
 * Минимальные подделки браузерных хранилищ для тестов kv-storage.
 * Реализуют ровно то, чем пользуется слой: get/put/delete/getAllKeys
 * у IndexedDB и Storage-интерфейс у localStorage.
 *
 * Тайминги — как у настоящего IndexedDB: запрос отвечает микротаском,
 * а oncomplete транзакции приходит отдельным макротаском ПОСЛЕ ответов
 * всех её запросов. Кто резолвится по onsuccess, коммита не дождался —
 * журнал `journal` этот порядок фиксирует.
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

export type FakeIndexedDbOptions = {
    /** Открытие базы отвечает ошибкой — проверяем откат на localStorage */
    failOpen?: boolean;
    /** Открытие базы залипает навсегда — проверяем таймаут */
    hangOpen?: boolean;
    /** Readwrite-транзакции абортятся на коммите: запросы «успели», фиксация — нет */
    abortWrites?: boolean;
    /** Журнал порядка событий: request.onsuccess → transaction.oncomplete … */
    journal?: string[];
};

class FakeObjectStore {
    constructor(
        private readonly rows: Map<string, unknown>,
        private readonly transaction: FakeTransaction,
    ) {}

    get(key: string) {
        return this.transaction.settle(new FakeRequest<unknown>(), () =>
            this.rows.get(key),
        );
    }

    put(value: unknown, key: string) {
        return this.transaction.settle(new FakeRequest<string>(), () => {
            this.rows.set(key, value);
            return key;
        });
    }

    delete(key: string) {
        return this.transaction.settle(
            new FakeRequest<undefined>(),
            (): undefined => {
                this.rows.delete(key);
                return undefined;
            },
        );
    }

    getAllKeys() {
        return this.transaction.settle(new FakeRequest<string[]>(), () => [
            ...this.rows.keys(),
        ]);
    }
}

/**
 * Транзакция подделки. Запросы отвечают микротаском, коммит приходит
 * макротаском после последнего ответа — как возврат в event loop у
 * настоящего IDB. Абортированная (`abortWrites` или упавший запрос)
 * вместо oncomplete зовёт onabort.
 */
class FakeTransaction {
    oncomplete: FakeHandler = null;
    onerror: FakeHandler = null;
    onabort: FakeHandler = null;
    error: Error | null = null;

    private readonly store: FakeObjectStore;
    private pending = 0;
    private failed = false;
    private finished = false;

    constructor(
        rows: Map<string, unknown>,
        private readonly mode: IDBTransactionMode,
        private readonly options: FakeIndexedDbOptions,
    ) {
        this.store = new FakeObjectStore(rows, this);
    }

    objectStore() {
        return this.store;
    }

    /** Запрос IndexedDB отвечает асинхронно — обработчики вешают уже после вызова. */
    settle<T>(request: FakeRequest<T>, run: () => T): FakeRequest<T> {
        this.pending += 1;

        queueMicrotask(() => {
            try {
                request.result = run();
                this.log('request.onsuccess');
                request.onsuccess?.();
            } catch (e) {
                request.error = e;
                this.failed = true;
                this.log('request.onerror');
                request.onerror?.();
            }

            this.pending -= 1;

            if (this.pending === 0) {
                setTimeout(() => this.finish(), 0);
            }
        });

        return request;
    }

    private finish() {
        if (this.finished || this.pending > 0) {
            return;
        }

        this.finished = true;

        const aborted =
            this.failed ||
            (this.mode === 'readwrite' && Boolean(this.options.abortWrites));

        if (aborted) {
            this.error = new Error('Транзакция абортирована на коммите');
            this.log('transaction.onabort');
            this.onabort?.();
            return;
        }

        this.log('transaction.oncomplete');
        this.oncomplete?.();
    }

    private log(event: string) {
        this.options.journal?.push(event);
    }
}

class FakeDatabase {
    private readonly stores = new Map<string, Map<string, unknown>>();

    constructor(private readonly options: FakeIndexedDbOptions) {}

    readonly objectStoreNames = {
        contains: (name: string) => this.stores.has(name),
    };

    createObjectStore(name: string) {
        this.stores.set(name, new Map());
    }

    transaction(name: string, mode: IDBTransactionMode = 'readonly') {
        const rows = this.stores.get(name);

        if (!rows) {
            throw new Error(`Нет хранилища "${name}"`);
        }

        const willAbort =
            mode === 'readwrite' && Boolean(this.options.abortWrites);

        // аборт — это откат: правки идут в копию и до базы не долетают
        return new FakeTransaction(
            willAbort ? new Map(rows) : rows,
            mode,
            this.options,
        );
    }

    close() {}
}

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
                    db = new FakeDatabase(options);
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
