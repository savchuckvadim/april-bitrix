/**
 * Как назвать сотрудника портала. Данные отдельно от вёрстки.
 */

export interface PortalUser {
    id: number;
    name: string;
    position: string | null;
}

/** Сырой ответ user.get: поля приходят строками и могут отсутствовать. */
export interface RawPortalUser {
    ID?: number | string;
    NAME?: string;
    LAST_NAME?: string;
    SECOND_NAME?: string;
    WORK_POSITION?: string;
}

/**
 * Имя и фамилия одной строкой. Ни того ни другого нет (бывает у служебных
 * учёток) — честный «Сотрудник N», а не пустая строка: пустое место в истории
 * читается как сбой загрузки.
 */
export const userDisplayName = (
    raw: RawPortalUser | null | undefined,
    fallbackId?: number | string | null,
): string => {
    const id = Number(raw?.ID ?? fallbackId ?? 0);
    const name = [raw?.NAME, raw?.LAST_NAME].filter(Boolean).join(' ').trim();
    if (name) return name;
    return id > 0 ? `Сотрудник ${id}` : 'Сотрудник';
};

/** Сырой пользователь → то, что нужно карточке. Без id — null. */
export const mapPortalUser = (
    raw: RawPortalUser | null | undefined,
): PortalUser | null => {
    const id = Number(raw?.ID ?? 0);
    if (!Number.isFinite(id) || id <= 0) return null;
    return {
        id,
        name: userDisplayName(raw),
        position: raw?.WORK_POSITION?.trim() || null,
    };
};
