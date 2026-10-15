import type {
    PortalAppSettingDescriptorDto,
    PortalAppSettingGroupDto,
    PortalAppSettingLinkDto,
    PortalAppSettingOptionDto,
    PortalAppSettingsBlockDto,
    PortalAppSettingsResponseDto,
    PortalAppSettingsSaveDto,
} from '@workspace/nest-admin-api';
import { PortalAppSettingsBlockDtoAppCode } from '@workspace/nest-admin-api';

/**
 * Хук каталога («Хуки и автоматика»), который читает настройку: ссылка на
 * его страницу в карточке портала (`{portalId}` подставляется) и КАК он
 * её использует — внутренняя документация для сотрудников.
 */
export interface PortalAppSettingHookLink {
    code: string;
    title: string;
    href: string;
    /** gate — рубильник хука или крона, param — параметр поведения. */
    role?: 'gate' | 'param';
    /** Как хук использует настройку: к чему приведёт значение. */
    note?: string;
}

export type PortalAppSettingEntity =
    | 'lead'
    | 'deal'
    | 'company'
    | 'contact'
    | 'task';

/** PBX-поле, задействованное хуком, который читает настройку. */
export interface PortalAppSettingPbxField {
    entity: PortalAppSettingEntity;
    code: string;
    name: string;
    /** Обязательно хотя бы одному хуку (без него хук теряет основную функцию). */
    required?: boolean;
    /** Раздел PBX портала, где поле ставится (`{portalId}` подставляется). */
    href: string;
}

/** Стадия лида или воронки ОП, нужная хукам настройки. */
export interface PortalAppSettingStage {
    entity: 'lead' | 'deal';
    code: string;
    title: string;
    required?: boolean;
    href: string;
}

/**
 * Связи настройки и категории с каталогом хуков. Бэк отдаёт их с
 * 15.10.2026, generated-клиент ещё не перегенерирован — поля описаны
 * здесь и необязательны (у старого бэка и у ключей без хуков их нет).
 */
interface PortalAppSettingRelations {
    hooks?: PortalAppSettingHookLink[];
    pbxFields?: PortalAppSettingPbxField[];
    stages?: PortalAppSettingStage[];
}

/**
 * Доменные алиасы generated-типов настроек приложений портала.
 * Схема (названия/описания/типы/дефолты) приходит С БЭКА из реестра
 * PORTAL_APP_SETTINGS_SCHEMA — фронт ничего не хардкодит.
 */
export type PortalAppSettingDescriptor = PortalAppSettingDescriptorDto &
    PortalAppSettingRelations;
/**
 * Категория настроек приложения: секция с названием, пояснением, ссылками,
 * теорией (markdown, «Как это работает») и связями с хуками.
 */
export type PortalAppSettingGroup = PortalAppSettingGroupDto &
    PortalAppSettingRelations & {
        theory?: string;
    };
export type PortalAppSettingsBlock = Omit<
    PortalAppSettingsBlockDto,
    'settings' | 'groups'
> & {
    settings: PortalAppSettingDescriptor[];
    groups: PortalAppSettingGroup[];
};
export type PortalAppSettingsResponse = Omit<
    PortalAppSettingsResponseDto,
    'apps'
> & {
    apps: PortalAppSettingsBlock[];
};
/** Значение справочника настройки-списка: код + подпись чекбокса. */
export type PortalAppSettingOption = PortalAppSettingOptionDto;
export type PortalAppSettingsSave = PortalAppSettingsSaveDto;
/** Ссылка категории на раздел админки (`{portalId}` подставляется). */
export type PortalAppSettingLink = PortalAppSettingLinkDto;

/** Код приложения (runtime-объект orval — автокомплит без magic strings). */
export const PORTAL_APP_CODE = PortalAppSettingsBlockDtoAppCode;
export type PortalAppCode = PortalAppSettingsBlockDtoAppCode;

/** Значение настройки в форме: null = «сбросить на дефолт кода». */
export type PortalAppSettingValue = boolean | number | string | null;
