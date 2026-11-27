import { resolveSwrCache, SWR_DAY_MS, writeSwrCache } from '@workspace/api';
import type { InitV2Data } from '../model/dto';

/**
 * Поднять при смене формы или смысла ответа init/data: записи старой версии не
 * читаются. Версия 2: цены Универсала и консалтинга считаются от рабса с НДС
 * (tax_abs), в кэше лежал каталог со старым значением.
 */
export const CATALOG_CACHE_VERSION = 2;
/** Каталог старше недели из браузера не берём: ждём сеть */
const CATALOG_MAX_AGE_MS = 7 * SWR_DAY_MS;

const keyOf = (domain: string) => ({
    name: 'catalog',
    domain,
    version: CATALOG_CACHE_VERSION,
});

/** Битый ответ в браузер не кладём: по нему откроется следующий запуск */
const isCatalogData = (value: unknown): boolean => {
    if (!value || typeof value !== 'object') return false;
    const data = value as Record<string, unknown>;
    return (
        typeof data.complects === 'object' &&
        data.complects !== null &&
        Array.isArray(data.prices) &&
        Array.isArray(data.infoblocks)
    );
};

const sameData = (a: InitV2Data, b: InitV2Data): boolean =>
    JSON.stringify(a) === JSON.stringify(b);

export interface CatalogLoad {
    /** Каталог, с которым открываемся: из браузера, а если там нет — из сети */
    data: InitV2Data;
    /** Отдан сохранённый в браузере; false — каталог только что из сети */
    fromCache: boolean;
    /**
     * Свежий каталог с сервера, если он отличается от отданного. null — тот
     * же, обновить не удалось или отданный и так из сети.
     */
    fresh: Promise<InitV2Data | null>;
}

/**
 * Каталог «из браузера сразу, свежий — следом». Цены меняются редко, а
 * каталог — самый тяжёлый запрос входа: сохранённый отдаётся мгновенно, и
 * каждый раз тут же запрашивается свежий. Хранилище выбирает swrCache
 * (IndexedDB → localStorage → без кэша): где хранить негде, всё работает как
 * раньше, через сеть.
 */
export const loadCatalogData = async (
    domain: string,
    fetcher: () => Promise<InitV2Data>,
): Promise<CatalogLoad> => {
    let settle!: (value: InitV2Data | null) => void;
    const updated = new Promise<InitV2Data | null>(done => {
        settle = done;
    });

    const result = await resolveSwrCache<InitV2Data>({
        key: keyOf(domain),
        // «свежим» сохранённый каталог не считается никогда: обновляем каждый запуск
        staleAfterMs: 0,
        maxAgeMs: CATALOG_MAX_AGE_MS,
        fetcher,
        validate: isCatalogData,
        onUpdate: settle,
    });

    if (result.revalidation) {
        void result.revalidation.then(outcome => {
            if (outcome === 'failed') settle(null);
        });
    } else {
        settle(null);
    }

    return {
        data: result.value,
        fromCache: result.source !== 'network',
        fresh: updated.then(value =>
            value && !sameData(value, result.value) ? value : null,
        ),
    };
};

/** Каталог с сервера мимо сохранённого — для «Обновить»; заодно обновляет сохранённый */
export const refreshCatalogData = async (
    domain: string,
    fetcher: () => Promise<InitV2Data>,
): Promise<InitV2Data> => {
    const startedAt = Date.now();
    const data = await fetcher();
    if (isCatalogData(data)) {
        await writeSwrCache(keyOf(domain), data, { startedAt });
    }
    return data;
};
