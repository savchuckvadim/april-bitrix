import {
    decodeSwrEnvelope,
    encodeSwrEnvelope,
    markSwrEnvelopeStale,
    readSwrEnvelopeExpiredAt,
    readSwrEnvelopeSavedAt,
} from './swr-cache-envelope';
import {
    SWR_CACHE_KEY_PREFIX,
    SWR_DEFAULT_MAX_AGE_MS,
    SWR_DEFAULT_STALE_AFTER_MS,
    SWR_DEFAULT_TIMEOUT_MS,
    parseSwrCacheKeyString,
    swrCacheKeyToString,
} from './swr-cache-key';
import { getSwrStorage, resetSwrStorage } from './swr-cache-storage';
import type {
    SwrCacheEntry,
    SwrCacheKey,
    SwrFetcher,
    SwrReadOptions,
    SwrResolveOptions,
    SwrResolveResult,
    SwrRevalidateOutcome,
    SwrStorage,
    SwrWriteOptions,
} from './swr-cache.type';

/** Запрос висел дольше отведённого — считаем неудачей. */
export class SwrTimeoutError extends Error {
    constructor(timeoutMs: number) {
        super(`Запрос не уложился в ${timeoutMs} мс`);
        this.name = 'SwrTimeoutError';
    }
}

type FetchSuccess<T> = { ok: true; value: T };
type FetchFailure = { ok: false; error: unknown };
type FetchOutcome<T> = FetchSuccess<T> | FetchFailure;

/**
 * Явный предикат вместо сужения по `outcome.ok`: пакет типизируется и без
 * `strictNullChecks` (свой tsconfig), где сужение по дискриминанту не работает.
 */
const isFetchSuccess = <T>(
    outcome: FetchOutcome<T>,
): outcome is FetchSuccess<T> => outcome.ok;

/** Один ключ — один запрос: параллельные `resolve` делят общий промис. */
const inFlight = new Map<string, Promise<FetchOutcome<unknown>>>();

/** Чистка по возрасту тяжелее обычной записи — гоняем раз за сессию. */
let ageSweepDone = false;

const toError = (error: unknown): Error =>
    error instanceof Error ? error : new Error(String(error));

/**
 * Гонка загрузчика с таймером. Загрузчику отдаётся `signal` — кто умеет,
 * оборвёт запрос по-настоящему; кто не умеет, просто не увидит результата.
 */
const fetchWithTimeout = async <T>(
    fetcher: SwrFetcher<T>,
    timeoutMs: number,
): Promise<T | null | undefined> => {
    const controller =
        typeof AbortController === 'undefined' ? null : new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
            controller?.abort();
            reject(new SwrTimeoutError(timeoutMs));
        }, timeoutMs);
    });

    try {
        return await Promise.race([
            fetcher({ signal: controller?.signal }),
            timeout,
        ]);
    } finally {
        if (timer !== undefined) {
            clearTimeout(timer);
        }
    }
};

/** Наши ключи среди чужих (localStorage — общий бакет на весь origin). */
const listOwnKeys = async (storage: SwrStorage): Promise<string[]> =>
    (await storage.keys()).filter(key =>
        key.startsWith(`${SWR_CACHE_KEY_PREFIX}:`),
    );

/**
 * Уборка «братьев» — записей того же имени и домена, но другой версии схемы.
 * Зовётся ТОЛЬКО после успешной записи новой: старое не исчезает раньше,
 * чем появилось новое.
 */
const sweepOutdatedVersions = async (
    storage: SwrStorage,
    key: SwrCacheKey,
): Promise<void> => {
    const current = swrCacheKeyToString(key);

    for (const raw of await listOwnKeys(storage)) {
        if (raw === current) {
            continue;
        }

        const parsed = parseSwrCacheKeyString(raw);

        if (
            parsed &&
            parsed.name === key.name &&
            parsed.domain === key.domain
        ) {
            await storage.remove(raw);
        }
    }
};

/**
 * Отдельная чистка по возрасту: записи старше `maxAgeMs` и обёртки без
 * читаемого штампа времени. Безопасна — трогает только свои ключи.
 */
export const cleanupSwrCache = async (
    options: { maxAgeMs?: number } = {},
): Promise<number> => {
    const maxAgeMs = options.maxAgeMs ?? SWR_DEFAULT_MAX_AGE_MS;
    const storage = await getSwrStorage();

    if (storage.kind === 'none') {
        return 0;
    }

    const now = Date.now();
    let removed = 0;

    for (const raw of await listOwnKeys(storage)) {
        const stored = await storage.get(raw);

        if (stored === null) {
            continue;
        }

        const savedAt = readSwrEnvelopeSavedAt(stored);

        if (savedAt === null || now - savedAt > maxAgeMs) {
            await storage.remove(raw);
            removed += 1;
        }
    }

    return removed;
};

/** Чтение записи: значение, штамп времени и признак «пора обновлять». */
export const readSwrCache = async <T>(
    key: SwrCacheKey,
    options: SwrReadOptions = {},
): Promise<SwrCacheEntry<T> | null> => {
    const staleAfterMs = options.staleAfterMs ?? SWR_DEFAULT_STALE_AFTER_MS;
    const maxAgeMs = options.maxAgeMs ?? SWR_DEFAULT_MAX_AGE_MS;
    const storage = await getSwrStorage();

    if (storage.kind === 'none') {
        return null;
    }

    const raw = await storage.get(swrCacheKeyToString(key));

    if (!raw) {
        return null;
    }

    const decoded = decodeSwrEnvelope<T>(key, raw);

    if (!decoded) {
        return null;
    }

    const ageMs = Math.max(0, Date.now() - decoded.savedAt);

    if (ageMs > maxAgeMs) {
        return null;
    }

    return {
        value: decoded.value,
        savedAt: decoded.savedAt,
        ageMs,
        // Ручная пометка (`expire`) сильнее возраста: запись только что
        // записана, но источник данных заведомо изменился.
        isStale: decoded.isForcedStale || ageMs >= staleAfterMs,
    };
};

/**
 * Запись значения со штампом времени. Возвращает `false`, если хранилища нет,
 * оно отказало или значение отсечено эпохой (ответ запроса, стартовавшего до
 * явной инвалидации) — для вызывающего это не ошибка, просто кэш не сложился.
 */
export const writeSwrCache = async <T>(
    key: SwrCacheKey,
    value: T,
    options: SwrWriteOptions = {},
): Promise<boolean> => {
    const storage = await getSwrStorage();

    if (storage.kind === 'none') {
        return false;
    }

    const keyString = swrCacheKeyToString(key);
    const previous = await storage.get(keyString);
    const expiredAt = previous ? readSwrEnvelopeExpiredAt(previous) : null;

    // Ответ запроса, стартовавшего ДО явной инвалидации, — это слепок «до»:
    // записать его значило бы снять пометку, ради которой нажали ⟳, и ещё
    // сутки прожить на данных, про которые уже известно, что они устарели.
    // Прежнее значение остаётся на месте вместе с пометкой — ближайший
    // `resolve` снова уйдёт за новым.
    if (
        expiredAt !== null &&
        options.startedAt !== undefined &&
        options.startedAt < expiredAt
    ) {
        console.warn(
            `[swr-cache] ответ "${key.name}" пришёл от запроса, стартовавшего до ` +
                'инвалидации — запись пропущена, пометка остаётся',
        );

        return false;
    }

    let raw: string;

    try {
        // Эпоху переносим на новую запись: запоздавший ответ старого запроса
        // не должен лечь поверх уже приехавшего свежего.
        raw = encodeSwrEnvelope(key, value, Date.now(), expiredAt);
    } catch (e) {
        console.warn('[swr-cache] значение не сериализуется, кэш пропущен', e);
        return false;
    }

    const saved = await storage.set(keyString, raw);

    if (!saved) {
        return false;
    }

    // Уборка — только после того, как новое уже легло
    await sweepOutdatedVersions(storage, key);

    if (!ageSweepDone) {
        ageSweepDone = true;
        void cleanupSwrCache().catch(() => {});
    }

    return true;
};

/**
 * Явная инвалидация: запись остаётся, но считается протухшей — ближайший
 * `resolve` отдаст её мгновенно и сразу уйдёт за новой.
 *
 * Это, а не `remove`, — правильный способ сказать «источник изменился»
 * (переустановили поля портала, владелец щёлкнул настройку). Удаление
 * оставило бы приложение вообще без данных, если сеть в этот момент лежит.
 *
 * Пометка ставится «с эпохой» и снимает запрос, висящий в полёте: ответ,
 * стартовавший до неё, приложению уже неинтересен — он не перезапишет кэш
 * (см. `writeSwrCache`) и не будет отдан вместо нового запроса.
 *
 * `false` — записи нет, обёртка чужая или хранилище отказало.
 */
export const expireSwrCache = async (key: SwrCacheKey): Promise<boolean> => {
    const storage = await getSwrStorage();

    if (storage.kind === 'none') {
        return false;
    }

    const keyString = swrCacheKeyToString(key);
    const raw = await storage.get(keyString);

    if (!raw) {
        return false;
    }

    const marked = markSwrEnvelopeStale(raw, Date.now());

    if (!marked) {
        return false;
    }

    const saved = await storage.set(keyString, marked);

    if (saved) {
        // Запрос, уже висящий в полёте, стартовал ДО пометки и про
        // переустановку ничего не знает: снимаем его с общего промиса, чтобы
        // ближайший `resolve` поднял НОВЫЙ запрос, а не подхватил старый.
        // Ответ снятого запроса кэш не перезапишет — его отсечёт эпоха.
        inFlight.delete(keyString);
    }

    return saved;
};

/** Удаление одной записи — точечно, без метлы по префиксу. */
export const removeSwrCache = async (key: SwrCacheKey): Promise<void> => {
    const storage = await getSwrStorage();

    if (storage.kind === 'none') {
        return;
    }

    await storage.remove(swrCacheKeyToString(key));
};

const runFetch = async <T>(
    options: SwrResolveOptions<T>,
): Promise<FetchOutcome<T>> => {
    const timeoutMs = options.timeoutMs ?? SWR_DEFAULT_TIMEOUT_MS;
    // Момент старта: по нему запись отличит ответ «до инвалидации» от «после»
    const startedAt = Date.now();

    try {
        const value = await fetchWithTimeout(options.fetcher, timeoutMs);

        if (value === null || value === undefined) {
            throw new Error('Загрузчик вернул пустое значение');
        }

        if (options.validate && !options.validate(value)) {
            throw new Error('Ответ не прошёл проверку');
        }

        await writeSwrCache(options.key, value, { startedAt });

        return { ok: true, value };
    } catch (error) {
        return { ok: false, error };
    }
};

/** Один запрос на ключ: второй и третий вызовы подхватывают общий промис. */
const runSingleFlight = async <T>(
    options: SwrResolveOptions<T>,
): Promise<FetchOutcome<T>> => {
    const keyString = swrCacheKeyToString(options.key);
    const existing = inFlight.get(keyString);

    if (existing) {
        return (await existing) as FetchOutcome<T>;
    }

    const promise = runFetch(options) as Promise<FetchOutcome<unknown>>;

    inFlight.set(keyString, promise);

    try {
        return (await promise) as FetchOutcome<T>;
    } finally {
        if (inFlight.get(keyString) === promise) {
            inFlight.delete(keyString);
        }
    }
};

/**
 * Главный вход: «отдай старое, обнови в фоне».
 *
 * 1. запись свежая — отдаём мгновенно, сеть не трогаем;
 * 2. запись протухла — отдаём старое немедленно, обновляем в фоне;
 *    получилось — перезаписали и позвали `onUpdate`, не получилось —
 *    старое осталось, в консоль ушло предупреждение;
 * 3. записи нет — ждём сеть; сеть упала — честная ошибка наверх.
 */
export const resolveSwrCache = async <T>(
    options: SwrResolveOptions<T>,
): Promise<SwrResolveResult<T>> => {
    const entry = await readSwrCache<T>(options.key, {
        staleAfterMs: options.staleAfterMs,
        maxAgeMs: options.maxAgeMs,
    });

    if (entry && !entry.isStale) {
        return {
            value: entry.value,
            source: 'fresh',
            savedAt: entry.savedAt,
            revalidation: null,
        };
    }

    if (entry) {
        const revalidation = runSingleFlight(options).then(
            (outcome): SwrRevalidateOutcome => {
                if (isFetchSuccess(outcome)) {
                    options.onUpdate?.(outcome.value);
                    return 'updated';
                }

                console.warn(
                    `[swr-cache] фоновое обновление "${options.key.name}" не удалось, ` +
                        `остаётся кэш от ${new Date(entry.savedAt).toISOString()}`,
                    outcome.error,
                );

                return 'failed';
            },
        );

        return {
            value: entry.value,
            source: 'stale',
            savedAt: entry.savedAt,
            revalidation,
        };
    }

    const outcome = await runSingleFlight(options);

    if (!isFetchSuccess(outcome)) {
        throw toError(outcome.error);
    }

    return {
        value: outcome.value,
        source: 'network',
        savedAt: null,
        revalidation: null,
    };
};

/** Сброс состояния сессии: выбранное хранилище, общие промисы, флаг чистки. */
export const resetSwrCacheRuntime = (): void => {
    inFlight.clear();
    ageSweepDone = false;
    resetSwrStorage();
};

/** Единая точка входа — контракт `read` / `write` / `resolve`. */
export const swrCache = {
    read: readSwrCache,
    write: writeSwrCache,
    expire: expireSwrCache,
    remove: removeSwrCache,
    resolve: resolveSwrCache,
    cleanup: cleanupSwrCache,
};
