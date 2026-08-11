/**
 * Путь к статике и внутренним URL с учётом префикса приложения.
 *
 * В проде event-sales живёт под `/sales` на общем домене (в корне —
 * kpi-sales), поэтому Next собирается с `basePath`. Он сам префиксует
 * `next/link`, `router.push` и `/_next/*`, но НЕ трогает:
 *  - строки в `src`/`href` обычного HTML (`<img src="/logo.svg">`),
 *  - `window.location.href = '/'`,
 *  - любые пути, собранные вручную.
 *
 * Такой путь уходит в корень домена — то есть в чужое приложение: логотип
 * не грузится, «на главную» уводит в отчёт kpi-sales. Всё, что строится
 * руками, обязано проходить через эту функцию.
 *
 * Значение приходит из next.config (`env.NEXT_PUBLIC_BASE_PATH`) и
 * инлайнится в бандл на сборке — в dev оно пустое, и функция ничего не меняет.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const withBasePath = (path: string): string => {
    if (!path.startsWith('/')) return path;
    // Уже с префиксом — не удваиваем (важно для повторных вызовов).
    if (BASE_PATH && path.startsWith(`${BASE_PATH}/`)) return path;
    return `${BASE_PATH}${path}`;
};
