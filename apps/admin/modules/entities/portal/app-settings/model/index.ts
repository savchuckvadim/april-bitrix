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
 * Доменные алиасы generated-типов настроек приложений портала.
 * Схема (названия/описания/типы/дефолты) приходит С БЭКА из реестра
 * PORTAL_APP_SETTINGS_SCHEMA — фронт ничего не хардкодит.
 */
export type PortalAppSettingsResponse = PortalAppSettingsResponseDto;
export type PortalAppSettingsBlock = PortalAppSettingsBlockDto;
export type PortalAppSettingDescriptor = PortalAppSettingDescriptorDto;
/** Значение справочника настройки-списка: код + подпись чекбокса. */
export type PortalAppSettingOption = PortalAppSettingOptionDto;
export type PortalAppSettingsSave = PortalAppSettingsSaveDto;
/** Категория настроек приложения: секция с названием, пояснением и ссылками. */
export type PortalAppSettingGroup = PortalAppSettingGroupDto;
/** Ссылка категории на раздел админки (`{portalId}` подставляется). */
export type PortalAppSettingLink = PortalAppSettingLinkDto;

/** Код приложения (runtime-объект orval — автокомплит без magic strings). */
export const PORTAL_APP_CODE = PortalAppSettingsBlockDtoAppCode;
export type PortalAppCode = PortalAppSettingsBlockDtoAppCode;

/** Значение настройки в форме: null = «сбросить на дефолт кода». */
export type PortalAppSettingValue = boolean | number | string | null;
