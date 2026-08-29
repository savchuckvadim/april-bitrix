import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
    API_METHOD,
    getConfig,
    onlineHeaders,
    onlineURL,
    resolveSwrCache,
} from '@workspace/api';
import type { SwrResolveResult } from '@workspace/api';
import { portalActions } from './PortalSlice';
import {
    PORTAL_CACHE_MAX_AGE_MS,
    PORTAL_CACHE_STALE_AFTER_MS,
    getPortalCacheKey,
    isPortalSnapshot,
    isSamePortalSnapshot,
    sweepLegacyPortalCache,
} from '../lib/portal-cache';
import { Portal } from '../type/portal-type';

/** Ответ бэка `/front/portal`. */
type PortalResponse = {
    resultCode?: number;
    message?: string;
    data?: { portal?: Portal };
};

/**
 * Слепок из стора приложения.
 *
 * Пакет не знает RootState конкретного приложения, поэтому каст узкий и
 * читает ровно одно поле — то самое, куда пишет `portalActions.setPortal`.
 */
const readPortalFromState = (state: unknown): Portal | null => {
    const slice = (state as { portal?: { portal?: Portal | null } } | null)
        ?.portal;

    return slice?.portal ?? null;
};

/**
 * Возраст отданного слепка — в консоль.
 *
 * Наружу мутация возвращает сам слепок, без штампа времени, поэтому иначе
 * «работаем на позавчерашней карте полей» ничем не отличается от «слепок
 * только что из сети». А отличать нужно: по этой карте идут записи в CRM.
 * Свежую запись не поминаем — шум на каждом старте фрейма.
 */
const logSnapshotAge = (resolved: SwrResolveResult<Portal>): void => {
    if (resolved.savedAt === null) return;

    const ageMs = Date.now() - resolved.savedAt;

    if (ageMs < PORTAL_CACHE_STALE_AFTER_MS) return;

    const savedAt = new Date(resolved.savedAt).toLocaleString('ru-RU');
    const days = Math.floor(ageMs / (24 * 60 * 60 * 1000));

    console.info(
        `portal: слепок от ${savedAt} (${days} дн.), обновление ушло в фон`,
    );
};

export const portalAPI = createApi({
    reducerPath: 'portalAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${onlineURL}/front`,
        prepareHeaders: (headers, { getState }) => {
            headers.set('X-Requested-With', onlineHeaders['X-Requested-With']);
            headers.set('accept', onlineHeaders['accept']);
            headers.set('content-type', onlineHeaders['content-type']);
            const apiKey = getConfig().apiKey;
            if (apiKey) {
                headers.set('X-API-KEY', apiKey);
            }
            return headers;
        },
    }),

    endpoints: build => ({
        /**
         * Слепок портала: сначала кэш, обновление — тихо в фоне.
         *
         * Было: суточный ключ `portal_cache_<дата>`, вчерашняя запись
         * удалялась ДО запроса (сеть легла — фрейм остался вообще без
         * конфигурации портала), а попадание в кэш не приводило к запросу
         * вовсе (правка на портале не доезжала до конца календарных суток).
         *
         * Стало (`swr-cache`): запись живёт сутки и не удаляется никогда
         * раньше, чем приедет новая. Протухла — старый слепок отдаётся
         * мгновенно, обновление уходит в фон; получилось — кэш перезаписан и
         * стор обновлён через `onUpdate`; не получилось (сеть, 500, таймаут,
         * битый ответ) — работаем на прежнем слепке, предупреждение в
         * консоль, наружу ошибка не летит. Ошибка возвращается только когда
         * кэша нет вовсе и сеть недоступна.
         *
         * Потолок у этого «дальше работаем на прежнем» есть — неделя
         * (`PORTAL_CACHE_MAX_AGE_MS`): по карте полей слепка идут записи в
         * CRM, и писать по ней бесконечно нельзя.
         */
        fetchPortal: build.mutation<Portal, { domain: string }>({
            async queryFn(
                data,
                { dispatch, getState },
                _extraOptions,
                fetchWithBQ,
            ) {
                const key = getPortalCacheKey(data.domain);

                /**
                 * Живой запрос слепка. Транспортная ошибка, `resultCode ≠ 0`
                 * и ответ без слепка — одинаково неудача: кэш не трогаем.
                 *
                 * `signal` утилиты сюда не прокидывается намеренно:
                 * `fetchWithBQ` уже связан с сигналом самого RTK-запроса, а
                 * второй источник обрыва только запутал бы. Таймаут утилиты
                 * при этом работает — просто не рвёт сокет, а перестаёт
                 * ждать ответ.
                 */
                const loadPortal = async (): Promise<Portal> => {
                    const response = await fetchWithBQ({
                        url: '/portal',
                        method: API_METHOD.POST,
                        body: data,
                    });

                    if (response.error) {
                        throw new Error(
                            `Слепок портала не получен: ${JSON.stringify(response.error)}`,
                        );
                    }

                    const result = response.data as PortalResponse | null;

                    if (result?.resultCode !== 0) {
                        throw new Error(
                            result?.message || 'Слепок портала: resultCode ≠ 0',
                        );
                    }

                    const portal = result?.data?.portal;

                    if (!portal) {
                        throw new Error('Слепок портала: пустой ответ');
                    }

                    return portal;
                };

                try {
                    const resolved = await resolveSwrCache<Portal>({
                        key,
                        staleAfterMs: PORTAL_CACHE_STALE_AFTER_MS,
                        // Потолок возраста задаём явно: по карте полей из
                        // слепка идут необратимые записи в CRM, и дефолт
                        // утилиты (30 дней) для них слишком щедрый.
                        maxAgeMs: PORTAL_CACHE_MAX_AGE_MS,
                        fetcher: loadPortal,
                        validate: isPortalSnapshot,
                        onUpdate: fresh => {
                            // Фоновое обновление доехало. В стор кладём
                            // только РЕАЛЬНО изменившийся слепок: setPortal
                            // будит инициализацию компании, сбор контактов и
                            // гвард чужой задачи — гонять их ради тех же
                            // данных незачем.
                            const current = readPortalFromState(getState());

                            if (
                                current &&
                                isSamePortalSnapshot(current, fresh)
                            ) {
                                return;
                            }

                            dispatch(
                                portalActions.setPortal({ portal: fresh }),
                            );
                        },
                    });

                    logSnapshotAge(resolved);

                    // Слепок на руках — можно убрать мёртвые записи прошлой схемы.
                    sweepLegacyPortalCache();

                    return { data: resolved.value };
                } catch (error) {
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                        },
                    };
                }
            },

            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(portalActions.setPortal({ portal: data }));
                } catch (error) {
                    console.error('Error fetching portal:', error);
                }
            },
        }),
    }),
});

export const { useFetchPortalMutation } = portalAPI;
