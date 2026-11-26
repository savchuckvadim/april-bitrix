import type { LibraryItem } from '../model/dto';

/** Сотрудник портала в том виде, в каком его отдаёт `user.get`. */
export interface PortalUserName {
    ID?: number | string;
    NAME?: string;
    LAST_NAME?: string;
}

/** Имя и фамилия одной строкой; пусто — имени нет. */
export const portalUserName = (user: PortalUserName): string =>
    [user.NAME, user.LAST_NAME]
        .map(part => part?.trim())
        .filter(Boolean)
        .join(' ');

/** id → «Имя Фамилия»; без id и без имени человека в карте нет. */
export const namesByUserId = (users: PortalUserName[]): Record<number, string> => {
    const names: Record<number, string> = {};
    for (const user of users) {
        const id = Number(user.ID);
        const name = portalUserName(user);
        if (Number.isFinite(id) && id > 0 && name) names[id] = name;
    }
    return names;
};

/**
 * Авторы чужих заготовок без повторов: их имена спрашиваем у портала одним
 * запросом. Своя заготовка и заготовка без автора (глобальная акция) не в счёт.
 */
export const foreignAuthorIds = (
    items: Array<Pick<LibraryItem, 'authorId'>>,
    currentUserId: number | null,
): number[] => {
    const ids = new Set<number>();
    for (const item of items) {
        const id = Number(item.authorId);
        if (Number.isFinite(id) && id > 0 && id !== currentUserId) ids.add(id);
    }
    return [...ids];
};

/**
 * «Автор: Имя Фамилия» — только на чужих карточках и только когда имя уже
 * известно. Текущий пользователь неизвестен — сказать нечего, строки нет.
 */
export const libraryItemAuthorLabel = (
    item: Pick<LibraryItem, 'authorId'>,
    currentUserId: number | null,
    names: Record<number, string>,
): string | undefined => {
    const id = Number(item.authorId);
    if (currentUserId === null || !Number.isFinite(id) || id <= 0 || id === currentUserId) {
        return undefined;
    }
    const name = names[id];
    return name ? `Автор: ${name}` : undefined;
};
