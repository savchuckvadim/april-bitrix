import type {
    CurrentUserInfo,
    DepartmentHeadType,
    HeadOfSource,
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
 * Пометка к подписи роли по источнику: structure — роль из структуры
 * Битрикса (без пометки); settings — поднята настройкой портала «Отдел
 * продаж»; superuser — суперпользователь вендора (env BX_SUPER_USER_IDS).
 */
export const HEAD_OF_SOURCE_SUFFIX: Record<HeadOfSource, string> = {
    structure: '',
    settings: ' (по настройке портала)',
    superuser: ' (суперпользователь)',
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
 * Подпись роли для баннера «Смотреть как…»: уровень видимости и пометка
 * источника (настройка портала, суперпользователь вендора). Нет источника
 * (снимки ссылок v: 1, старый бэк) — без пометки.
 */
export const visibilityLabel = (
    currentUser:
        | Pick<CurrentUserInfo, 'headOf' | 'visibility' | 'headOfSource'>
        | null
        | undefined,
): string => {
    const label = VISIBILITY_LABEL[resolveVisibility(currentUser)];
    const source = currentUser?.headOfSource;
    // Неизвестный источник (бэк новее фронта) — тоже без пометки.
    const suffix = source ? (HEAD_OF_SOURCE_SUFFIX[source] ?? '') : '';
    return label + suffix;
};
