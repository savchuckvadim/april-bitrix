/**
 * Подделка браузерного хранилища для тестов кэша (`swr-cache`).
 *
 * Тесты идут в среде node: `window` нет вовсе, поэтому утилита уходит в
 * сквозной режим и кэш проверить нечем. Здесь — минимальный `Storage`
 * поверх Map и подстановка его в `globalThis.window`. IndexedDB намеренно
 * не подделываем: утилита сама падает на localStorage, а проверять её выбор
 * хранилища — работа тестов самого пакета `@workspace/api`.
 *
 * В прод-бандл файл не попадает: его не импортирует ни один модуль
 * приложения.
 */
export const createFakeLocalStorage = (): Storage => {
    const rows = new Map<string, string>();

    return {
        get length() {
            return rows.size;
        },
        key: (index: number) => [...rows.keys()][index] ?? null,
        getItem: (key: string) => rows.get(key) ?? null,
        setItem: (key: string, value: string) => {
            rows.set(key, String(value));
        },
        removeItem: (key: string) => {
            rows.delete(key);
        },
        clear: () => {
            rows.clear();
        },
    } as Storage;
};

/** Ставит окно с хранилищем на место `globalThis.window`. */
export const mountFakeWindow = (): Storage => {
    const localStorage = createFakeLocalStorage();

    (globalThis as Record<string, unknown>).window = { localStorage };
    (globalThis as Record<string, unknown>).localStorage = localStorage;

    return localStorage;
};

/** Убирает окно — иначе соседние тесты увидят чужое хранилище. */
export const unmountFakeWindow = (): void => {
    delete (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).localStorage;
};
