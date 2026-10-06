/**
 * Таймаут интерактивных запросов к нашему серверу.
 *
 * До 05.10.2026 таймаута не было вовсе: при перегрузе сервер держал запрос
 * до 5 минут, менеджер смотрел на вечный скелетон, а повтор ×3 ещё и утраивал
 * нагрузку. Теперь у чтений, которых человек ждёт у экрана, есть потолок —
 * дальше блок показывает ошибку с кнопкой «Повторить».
 *
 * Только ЧТЕНИЯ и только перечисленные здесь. Записи (отчёт, присоединение,
 * выбор ИНН, обновление заявки) в список не входят намеренно: обрыв по
 * таймауту не отменяет запись на сервере, и «ошибка» на экране при реально
 * выполненном действии хуже долгого ожидания. Отправку отчёта ведёт своя
 * очередь досылки — у неё собственные сроки.
 */
export const INTERACTIVE_REQUEST_TIMEOUT_MS = 25_000;

interface InteractiveRoute {
    method: 'GET' | 'POST';
    /** Начало пути; у ручек с id в конце — без него. */
    prefix: string;
    /** Путь должен совпасть целиком (у префикса есть пишущие «соседи»). */
    exact?: boolean;
}

const INTERACTIVE_ROUTES: readonly InteractiveRoute[] = [
    { method: 'POST', prefix: '/api/duplicates/details', exact: true },
    { method: 'POST', prefix: '/api/duplicates/search', exact: true },
    { method: 'POST', prefix: '/api/sales-hooks/client-work/deals', exact: true },
    { method: 'POST', prefix: '/api/event-sales/stage-predict', exact: true },
    { method: 'POST', prefix: '/api/bitrix/department/sales', exact: true },
    { method: 'POST', prefix: '/api/bx/department/structure', exact: true },
    { method: 'GET', prefix: '/api/inn/deal/' },
    { method: 'GET', prefix: '/api/lead-request/card/' },
    { method: 'GET', prefix: '/api/app-settings/' },
    { method: 'GET', prefix: '/api/questionnaires' },
];

const pathOf = (url: string): string => url.split('?')[0] ?? '';

export const resolveRequestTimeout = ({
    url,
    method,
}: {
    url?: string;
    method?: string;
}): number | undefined => {
    if (!url) return undefined;
    const path = pathOf(url);
    const verb = (method ?? 'GET').toUpperCase();
    const matched = INTERACTIVE_ROUTES.some(
        route =>
            route.method === verb &&
            (route.exact ? path === route.prefix : path.startsWith(route.prefix)),
    );
    return matched ? INTERACTIVE_REQUEST_TIMEOUT_MS : undefined;
};
