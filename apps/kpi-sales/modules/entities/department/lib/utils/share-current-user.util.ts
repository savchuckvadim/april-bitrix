import type { CurrentUserInfo } from '../../model';

/**
 * Суперпользователь вендора по ответу структуры: флаг бэка или источник
 * роли superuser (env BX_SUPER_USER_IDS). Поля может не быть в старых
 * снимках ссылок и ответах старого бэка — тогда false.
 */
export const isVendorSuperUser = (
    currentUser: Pick<CurrentUserInfo, 'isSuperUser' | 'headOfSource'>,
): boolean =>
    currentUser.isSuperUser === true ||
    currentUser.headOfSource === 'superuser';

/**
 * currentUser для снимка публичной ссылки (/share) — чтобы публичная
 * страница выглядела как раньше.
 *
 * Ссылки создаёт суперпользователь вендора. Раньше его роль в снимке
 * была ролью по структуре (headOf null, visibility own) — вкладка
 * «Финансы» и командные виды на /share скрыты. Теперь бэк отдаёт ему
 * headOf cup и visibility all, и без нормализации публичная страница
 * начала бы показывать финансы. Поэтому роль суперпользователя в снимке
 * сбрасываем до прежней «без роли». Периметр снимка (visibleUsers,
 * visibleGroups, defaultSelected) не трогаем — он уже посчитан у создателя.
 * Остальные пользователи — как есть.
 */
export const toShareCurrentUser = (
    currentUser: CurrentUserInfo | null,
): CurrentUserInfo | null => {
    if (!currentUser || !isVendorSuperUser(currentUser)) return currentUser;
    return {
        ...currentUser,
        isSuperUser: false,
        headOf: null,
        headOfDepartmentIds: [],
        visibility: 'own',
        headOfSource: 'structure',
    };
};
