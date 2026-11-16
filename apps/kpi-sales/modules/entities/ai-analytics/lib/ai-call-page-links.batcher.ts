/**
 * Ссылки на страницы разбора звонков для списков витрины. Каждая строка
 * списка спрашивает ссылку своего звонка; запросы одного тика собираются в
 * одну пачку, ответы запоминаются до перезагрузки страницы. Звонок, на
 * который ссылку не дали (нет прав или разбора), тоже запоминается — второй
 * раз о нём не спрашиваем.
 *
 * Чистая логика без React и сети: загрузчик и планировщик приходят снаружи.
 */

/** Сколько звонков уходит в одном запросе — предел ручки бэкенда. */
export const CALL_PAGE_LINKS_BATCH = 100;

/** Загрузчик пачки: номера расшифровок → найденные ссылки. */
export type CallPageLinksLoader = (
    ids: string[],
) => Promise<{ transcriptionId: string; url: string }[]>;

export interface CallPageLinkBatcher {
    /** Ссылка звонка; null — ссылки нет. Ошибка сети тоже даёт null. */
    get(transcriptionId: string): Promise<string | null>;
}

/**
 * @param load запрос пачки на бэкенд
 * @param schedule когда отправлять накопленное (по умолчанию — следующий тик)
 */
export function createCallPageLinkBatcher(
    load: CallPageLinksLoader,
    schedule: (flush: () => void) => void = (flush) => {
        setTimeout(flush, 0);
    },
): CallPageLinkBatcher {
    const known = new Map<string, Promise<string | null>>();
    let queue: { id: string; resolve: (url: string | null) => void }[] = [];
    let scheduled = false;

    const flush = (): void => {
        scheduled = false;
        const pending = queue;
        queue = [];
        for (let start = 0; start < pending.length; start += CALL_PAGE_LINKS_BATCH) {
            const chunk = pending.slice(start, start + CALL_PAGE_LINKS_BATCH);
            load(chunk.map((item) => item.id))
                .then((links) => {
                    const urls = new Map(
                        links.map((link) => [link.transcriptionId, link.url]),
                    );
                    for (const item of chunk) {
                        item.resolve(urls.get(item.id) ?? null);
                    }
                })
                .catch(() => {
                    // Сеть или 403: строки остаются без ссылки, а следующий
                    // показ списка спросит заново.
                    for (const item of chunk) {
                        known.delete(item.id);
                        item.resolve(null);
                    }
                });
        }
    };

    return {
        get(transcriptionId) {
            const cached = known.get(transcriptionId);
            if (cached) return cached;
            const promise = new Promise<string | null>((resolve) => {
                queue.push({ id: transcriptionId, resolve });
            });
            known.set(transcriptionId, promise);
            if (!scheduled) {
                scheduled = true;
                schedule(flush);
            }
            return promise;
        },
    };
}
