import type { BXUser } from '@workspace/bx';

/**
 * Суперпользователи получают права руководителя территории независимо от
 * структуры (временный механизм; при необходимости переедет в конфиг/БД).
 */
export const SUPER_USER_LAST_NAMES = ['Савчук'];

export const isSuperUser = (user: BXUser | null | undefined): boolean =>
    Boolean(
        user?.LAST_NAME &&
            SUPER_USER_LAST_NAMES.some(lastName =>
                String(user.LAST_NAME).includes(lastName),
            ),
    );
