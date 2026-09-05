import type {
    CurrentUserInfo,
    DepartmentHeadType,
    VisibilityLevel,
} from '../../model';

/** Подписи уровней видимости для баннеров и подсказок. */
export const VISIBILITY_LABEL: Record<VisibilityLevel, string> = {
    own: 'менеджер',
    group: 'руководитель группы',
    department: 'руководитель отдела',
    all: 'руководитель направления',
};

/**
 * headOf → уровень видимости. Нужен для ответов без поля `visibility`:
 * снимки публичных ссылок (v: 1) и бэк до обновления.
 */
export const visibilityFromHeadOf = (
    headOf: DepartmentHeadType | null | undefined,
): VisibilityLevel => {
    switch (headOf) {
        case 'cup':
            return 'all';
        case 'op':
            return 'department';
        case 'group':
            return 'group';
        default:
            return 'own';
    }
};

/** Уровень видимости текущего пользователя: поле бэка, иначе по headOf. */
export const resolveVisibility = (
    currentUser:
        | Pick<CurrentUserInfo, 'headOf' | 'visibility'>
        | null
        | undefined,
): VisibilityLevel =>
    currentUser?.visibility ?? visibilityFromHeadOf(currentUser?.headOf);

/**
 * Подпись роли для баннера «Смотреть как…»: уровень видимости и пометка,
 * если он поднят настройкой портала («Отдел продаж»), а не структурой.
 */
export const visibilityLabel = (
    currentUser:
        | Pick<CurrentUserInfo, 'headOf' | 'visibility' | 'headOfSource'>
        | null
        | undefined,
): string => {
    const label = VISIBILITY_LABEL[resolveVisibility(currentUser)];
    return currentUser?.headOfSource === 'settings'
        ? `${label} (по настройке портала)`
        : label;
};
