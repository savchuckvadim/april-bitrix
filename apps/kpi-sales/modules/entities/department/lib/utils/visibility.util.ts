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
 * продаж»; superuser — суперпользователь вендора (админка April).
 * portal_default здесь нет намеренно: его пометка зависит от уровня и
 * собирается в visibilityLabel.
 */
export const HEAD_OF_SOURCE_SUFFIX: Record<
    Exclude<HeadOfSource, 'portal_default'>,
    string
> = {
    structure: '',
    settings: ' (по настройке портала)',
    superuser: ' (суперпользователь)',
};

/** Периметр уровня в винительном падеже: «видит …». */
export const PERIMETER_LABEL: Record<VisibilityLevel, string> = {
    own: 'только себя',
    group: 'свою группу',
    department: 'свой отдел',
    all: 'всю структуру',
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
 *
 * Портальный уровень для рядовых (portal_default): роль — по headOf
 * (рядовой остаётся «менеджером», руководитель группы — «руководителем
 * группы»), а расширенный периметр — в пометке: «менеджер (видит свою
 * группу по настройке портала)».
 */
export const visibilityLabel = (
    currentUser:
        | Pick<CurrentUserInfo, 'headOf' | 'visibility' | 'headOfSource'>
        | null
        | undefined,
): string => {
    const source = currentUser?.headOfSource;
    if (source === 'portal_default') {
        const role = VISIBILITY_LABEL[visibilityFromHeadOf(currentUser?.headOf)];
        const perimeter = PERIMETER_LABEL[resolveVisibility(currentUser)];
        return `${role} (видит ${perimeter} по настройке портала)`;
    }
    const label = VISIBILITY_LABEL[resolveVisibility(currentUser)];
    // Неизвестный источник (бэк новее фронта) — тоже без пометки.
    const suffix = source ? (HEAD_OF_SOURCE_SUFFIX[source] ?? '') : '';
    return label + suffix;
};
