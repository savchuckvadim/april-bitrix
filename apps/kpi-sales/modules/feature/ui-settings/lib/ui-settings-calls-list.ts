/**
 * Настройки страницы «Разборы звонков» в блобе UI-настроек: добавленные
 * в панель бейджи. Блоб пришёл с бэка или из кэша — значения могли
 * протухнуть или испортиться, поэтому гидрация чистит список.
 */

/** Сколько добавленных бейджей помним у пользователя. */
export const UI_SETTINGS_EXTRA_BADGES_MAX = 40;

/** Длиннее id бейджа или пункта методики не бывает — мусор отбрасываем. */
export const UI_SETTINGS_EXTRA_BADGE_ID_MAX = 80;

/**
 * Список добавленных бейджей из блоба: только непустые строки разумной
 * длины, без повторов, не больше предела; не список — пусто.
 */
export function sanitizeExtraBadges(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    const ids = raw.filter(
        (item): item is string =>
            typeof item === 'string' &&
            item.length > 0 &&
            item.length <= UI_SETTINGS_EXTRA_BADGE_ID_MAX,
    );
    return [...new Set(ids)].slice(0, UI_SETTINGS_EXTRA_BADGES_MAX);
}
