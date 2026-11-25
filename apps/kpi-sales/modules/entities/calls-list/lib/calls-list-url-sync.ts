/**
 * Фильтры списка разборов живут в состоянии страницы, адрес страницы — их
 * зеркало (чтобы «назад» со страницы разбора вернул к тем же фильтрам).
 * Адрес обновляется с задержкой: переход внутри приложения доходит до
 * страницы не сразу. Поэтому страница помнит, какие записи в адрес сделала
 * сама, и отличает их от смены адреса извне (шаг по истории окна, ссылка):
 * свою запись она пропускает, чужой адрес — принимает как новые фильтры.
 * Функции чистые.
 */

/** Строка параметров в одном виде: без «?», в кодировке URLSearchParams. */
export function canonicalCallsListSearch(search: string): string {
    return new URLSearchParams(search.replace(/^\?/, '')).toString();
}

/**
 * Адрес страницы сменился на `observed`. Если это одна из наших записей —
 * возвращает записи, сделанные после неё (они ещё не дошли до адреса; более
 * ранние уже не придут — переход их обогнал). Если адрес сменили не мы —
 * null: фильтры нужно взять из адреса.
 */
export function settleCallsListUrlWrite(
    pending: readonly string[],
    observed: string,
): string[] | null {
    const index = pending.lastIndexOf(canonicalCallsListSearch(observed));
    return index < 0 ? null : pending.slice(index + 1);
}
