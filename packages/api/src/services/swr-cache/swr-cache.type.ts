/**
 * Типы утилиты «отдай старое, обнови в фоне» (stale-while-revalidate).
 *
 * Смысл: почти неизменные слепки (портал, портальные настройки, справочники)
 * лежат в браузере со штампом времени. Пока запись свежая — сеть не трогаем
 * вовсе; протухла — отдаём старое немедленно и тихо тянем новое; не вышло —
 * старое остаётся жить, ошибка не долетает до экрана.
 */

/**
 * Ключ записи кэша.
 *
 * Домен обязателен: у легаси-утилиты (`local-encrypt.ts`) домена в ключе нет,
 * из-за чего два портала в одном браузере делят одну ячейку и по очереди
 * стирают её друг другу. Версия схемы обесценивает старые записи
 * автоматически — поменяли форму значения, подняли версию, старое не читается.
 */
export type SwrCacheKey = {
    /** Логическое имя записи: `portal`, `app-config`, … */
    name: string;
    /** Домен портала — попадает и в ключ, и в секрет шифрования */
    domain: string;
    /** Версия схемы значения (целое, ≥ 1) */
    version: number;
};

/** Запись, прочитанная из хранилища. */
export type SwrCacheEntry<T> = {
    value: T;
    /** Момент записи, ms epoch */
    savedAt: number;
    /** Возраст записи на момент чтения, ms */
    ageMs: number;
    /** Возраст перевалил за `staleAfterMs` — пора обновлять в фоне */
    isStale: boolean;
};

/** Откуда взято значение, которое вернул `resolve`. */
export type SwrValueSource =
    /** Свежий кэш — сеть не трогали */
    | 'fresh'
    /** Протухший кэш — отдали немедленно, обновление ушло в фон */
    | 'stale'
    /** Кэша не было — дождались сети */
    | 'network';

/** Чем закончилось фоновое обновление. */
export type SwrRevalidateOutcome =
    /** Данные приехали и легли в кэш */
    | 'updated'
    /** Сеть/таймаут/битый ответ — старое осталось на месте */
    | 'failed';

/** Контекст, который получает загрузчик: по `signal` можно оборвать запрос. */
export type SwrFetchContext = {
    signal?: AbortSignal;
};

/** Загрузчик значения. `null`/`undefined` считаются неудачей — кэш не трогаем. */
export type SwrFetcher<T> = (
    ctx: SwrFetchContext,
) => Promise<T | null | undefined>;

export type SwrReadOptions = {
    /** Через сколько запись считается протухшей. По умолчанию сутки */
    staleAfterMs?: number;
    /** Предельный возраст: старше — запись мертва и не отдаётся */
    maxAgeMs?: number;
};

/** Что запись знает о запросе, который принёс значение. */
export type SwrWriteOptions = {
    /**
     * Момент старта запроса, ms epoch. Нужен ровно для одного решения:
     * запрос, стартовавший ДО явной инвалидации (`expire`), привозит слепок
     * «до» — его записывать нельзя, иначе пометка снимется и приложение ещё
     * сутки проживёт на заведомо устаревших данных. Без штампа проверки нет:
     * ручная запись (`swrCache.write`) кладётся как прежде.
     */
    startedAt?: number;
};

export type SwrResolveOptions<T> = SwrReadOptions & {
    key: SwrCacheKey;
    fetcher: SwrFetcher<T>;
    /** Потолок ожидания сети, ms. По умолчанию 15 с */
    timeoutMs?: number;
    /** Зовётся ТОЛЬКО когда фоновое обновление реально принесло новое значение */
    onUpdate?: (value: T) => void;
    /**
     * Проверка ответа перед записью в кэш. Вернула `false` —
     * ответ считается битым, старое значение остаётся.
     */
    validate?: (value: unknown) => boolean;
};

export type SwrResolveResult<T> = {
    value: T;
    source: SwrValueSource;
    /** Момент записи отданного значения; `null` — значение только что из сети */
    savedAt: number | null;
    /**
     * Промис фонового обновления. Ждать его НЕ нужно — он для тестов
     * и диагностики. `null`, если обновление не запускалось.
     */
    revalidation: Promise<SwrRevalidateOutcome> | null;
};

/** Какое хранилище выбрала утилита. `none` — работаем сквозной, всегда в сеть. */
export type SwrStorageKind = 'indexeddb' | 'localstorage' | 'none';

/** Единый интерфейс хранилища: IndexedDB и localStorage за одной дверью. */
export type SwrStorage = {
    kind: SwrStorageKind;
    get: (key: string) => Promise<string | null>;
    set: (key: string, raw: string) => Promise<boolean>;
    remove: (key: string) => Promise<void>;
    keys: () => Promise<string[]>;
};
