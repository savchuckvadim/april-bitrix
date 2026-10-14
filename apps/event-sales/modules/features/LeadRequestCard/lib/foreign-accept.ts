import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';

/** Сотрудник из загруженной структуры — нужны только id и имя. */
interface NamedUser {
    ID: string | number;
    NAME?: string | null;
    LAST_NAME?: string | null;
}

/** Имя того, на ком заявка; в загруженной структуре его нет — null. */
export const findUserName = (
    users: readonly NamedUser[],
    userId: number | null | undefined,
): string | null => {
    if (!userId) return null;
    const user = users.find(item => Number(item.ID) === userId);
    const name = user
        ? [user.NAME, user.LAST_NAME].filter(Boolean).join(' ').trim()
        : '';
    return name || null;
};

/**
 * Текст окна перед тем, как забрать чужую заявку (garant, 14.10.2026):
 * принявший забирает клиента целиком — сделку, заявку и задачи, поэтому
 * без явного «да» чужую заявку не берём.
 */
export const getForeignAcceptDescription = (ownerName: string | null): string =>
    `${ownerName ? `Ответственный по заявке — ${ownerName}.` : LEAD_REQUEST_TEXT.foreignTitle + '.'} ` +
    LEAD_REQUEST_TEXT.foreignAcceptHint;
