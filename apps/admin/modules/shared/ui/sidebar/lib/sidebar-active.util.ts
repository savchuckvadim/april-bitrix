/**
 * Ссылка пункта бокового меню, которая считается активной на этом адресе.
 *
 * Пункт подходит, если адрес совпадает с его ссылкой или лежит под ней
 * (сравнение по сегменту: подстрока делала `/contract` активным и на
 * `/contract-template`). Когда подходят несколько пунктов, выигрывает самая
 * длинная ссылка: на `/portal/1/provider/images` горит один пункт «Печати,
 * подписи и логотипы», «Поставщики» со ссылкой `/portal/1/provider` остаётся
 * погашенным. null, если не подходит ни один.
 */
export function resolveActiveSidebarHref(
    hrefs: readonly string[],
    pathname: string | null,
): string | null {
    if (!pathname) return null;
    let active: string | null = null;
    for (const href of hrefs) {
        const matches = pathname === href || pathname.startsWith(`${href}/`);
        if (matches && (active === null || href.length > active.length)) active = href;
    }
    return active;
}
