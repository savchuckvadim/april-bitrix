import type {
    PortalAppSettingDescriptor,
    PortalAppSettingEntity,
    PortalAppSettingGroup,
    PortalAppSettingPbxField,
    PortalAppSettingsBlock,
    PortalAppSettingStage,
} from '../model';

/** Порядок сущностей в блоке «Что установить»: от лида к задаче. */
const ENTITY_ORDER: readonly PortalAppSettingEntity[] = [
    'lead',
    'deal',
    'company',
    'contact',
    'task',
];

/** Требования к порталу по одной сущности: поля и стадии. */
export interface AppSettingRequirementsByEntity {
    entity: PortalAppSettingEntity;
    fields: PortalAppSettingPbxField[];
    stages: PortalAppSettingStage[];
}

const requiredFirst = <T extends { required?: boolean }>(items: T[]): T[] =>
    items
        .map((item, index) => ({ item, index }))
        .sort(
            (left, right) =>
                Number(Boolean(right.item.required)) -
                    Number(Boolean(left.item.required)) ||
                left.index - right.index,
        )
        .map(entry => entry.item);

/**
 * «Что установить на портале» для категории: поля и стадии хуков,
 * сгруппированные по сущностям в порядке лид → сделка → компания →
 * контакт → задача; внутри — обязательные первыми, дальше порядок бэка.
 * Пустые сущности не показываются.
 */
export const groupRequirementsByEntity = (
    pbxFields: readonly PortalAppSettingPbxField[] = [],
    stages: readonly PortalAppSettingStage[] = [],
): AppSettingRequirementsByEntity[] =>
    ENTITY_ORDER.map(entity => ({
        entity,
        fields: requiredFirst(pbxFields.filter(field => field.entity === entity)),
        stages: requiredFirst(stages.filter(stage => stage.entity === entity)),
    })).filter(item => item.fields.length > 0 || item.stages.length > 0);

/** Секция блока: категория и её настройки (после поиска). */
export interface AppSettingsGroupView {
    group: PortalAppSettingGroup;
    settings: PortalAppSettingDescriptor[];
    /** Сколько настроек секции задано на портале (по всей секции, не по поиску). */
    customized: number;
    total: number;
}

/**
 * Категория для настроек старого бэка, который ещё не отдаёт group/groups:
 * всё в одну секцию, как было до категорий.
 */
export const FALLBACK_GROUP: PortalAppSettingGroup = {
    code: 'all',
    title: 'Все настройки',
    description: '',
    links: [],
};

export const normalizeSettingsQuery = (query: string): string =>
    query.trim().toLowerCase();

/** Совпадение по названию, коду, описанию настройки или названию категории. */
export const matchesSetting = (
    setting: PortalAppSettingDescriptor,
    group: PortalAppSettingGroup,
    normalizedQuery: string,
): boolean =>
    !normalizedQuery ||
    [setting.name, setting.code, setting.description, group.title].some(text =>
        text.toLowerCase().includes(normalizedQuery),
    );

const isCustomized = (setting: PortalAppSettingDescriptor): boolean =>
    setting.stored ?? setting.value !== null;

/**
 * Настройки блока по категориям в порядке бэка; при поиске — только
 * совпавшие настройки и только секции, где они есть.
 */
export const buildGroupViews = (
    block: PortalAppSettingsBlock,
    query: string,
): AppSettingsGroupView[] => {
    const normalizedQuery = normalizeSettingsQuery(query);
    const groups: PortalAppSettingGroup[] = block.groups?.length
        ? block.groups
        : [FALLBACK_GROUP];
    const known = new Set(groups.map(group => group.code));
    const groupOf = (setting: PortalAppSettingDescriptor): string =>
        setting.group && known.has(setting.group)
            ? setting.group
            : groups[groups.length - 1]!.code;

    return groups
        .map(group => {
            const all = block.settings.filter(
                setting => groupOf(setting) === group.code,
            );
            return {
                group,
                settings: all.filter(setting =>
                    matchesSetting(setting, group, normalizedQuery),
                ),
                customized: all.filter(isCustomized).length,
                total: all.length,
            };
        })
        .filter(view => view.settings.length > 0);
};

/**
 * Путь ссылки категории для конкретного портала. Ссылки без `{portalId}`
 * (глобальные страницы админки: путеводитель, «Модель», «Аудит») остаются
 * как есть.
 */
export const resolveSettingsLink = (href: string, portalId: number): string =>
    href.replace('{portalId}', String(portalId));

/** Якорь категории на странице настроек: `#group-<код категории>`. */
export const groupAnchorId = (groupCode: string): string => `group-${groupCode}`;

/** Якорь настройки: `#setting-<snake_case код>` — на него ведут путеводитель и хуки. */
export const settingAnchorId = (settingCode: string): string =>
    `setting-${settingCode}`;

/**
 * Секция категории должна быть раскрыта по якорю адреса: якорь указывает
 * на саму категорию либо на одну из её настроек. Иначе ссылка «на ключ»
 * привела бы в свёрнутую секцию.
 */
export const isGroupAnchored = (
    hash: string,
    groupCode: string,
    settingCodes: readonly string[],
): boolean => {
    const anchor = hash.replace(/^#/, '');
    if (!anchor) return false;
    return (
        anchor === groupAnchorId(groupCode) ||
        settingCodes.some(code => settingAnchorId(code) === anchor)
    );
};
