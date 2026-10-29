import type {
    UpdateVendorSettingDto,
    VendorSettingDto,
    VendorSettingDtoKey,
    VendorSettingDtoSource,
    VendorSettingGroupDto,
    VendorSettingsResponseDto,
} from '@workspace/nest-admin-api';

/**
 * Типы раздела «Настройки приложения» — сгенерированные DTO бэка admin
 * (`VendorSettingsController`), реестр настроек и тексты живут на бэке
 * (`@lib/vendor-settings`), фронт только показывает.
 */
export type VendorSetting = VendorSettingDto;
/** Ключ настройки — он же имя переменной окружения; перечень задаёт бэк. */
export type VendorSettingKey = VendorSettingDtoKey;
export type VendorSettingGroup = VendorSettingGroupDto;
export type VendorSettings = VendorSettingsResponseDto;
export type VendorSettingUpdate = UpdateVendorSettingDto;

/** Что действует для настройки: админка, окружение или ничего. */
export type VendorSettingSource = VendorSettingDtoSource;
export type VendorSourceTone = 'ok' | 'muted' | 'warn';

/** Подписи «что действует» — зеркало VENDOR_SETTING_SOURCES бэка. */
export const VENDOR_SOURCE_LABELS: Readonly<
    Record<VendorSettingSource, { label: string; tone: VendorSourceTone }>
> = {
    admin: { label: 'действует значение из админки', tone: 'ok' },
    env: { label: 'действует значение из окружения приложения', tone: 'muted' },
    none: { label: 'не задано нигде', tone: 'warn' },
};

export const VENDOR_SETTINGS_TEXT = {
    title: 'Настройки приложения',
    intro:
        'Общие для всех порталов настройки April: прокси за рубеж и ключи AI-сервисов. Значение отсюда важнее переменной окружения с тем же именем и применяется в течение минуты, без выкладки. Секреты хранятся зашифрованными и обратно не показываются.',
    loading: 'Загружаю настройки…',
    loadError: 'Не удалось загрузить настройки приложения',
    howTo: 'Где взять и как заполнить',
    save: 'Сохранить',
    reset: 'Очистить и использовать окружение',
    keepSecret: 'Значение сохранено, показывается маской. Введите новое, чтобы заменить.',
    envFallback:
        'В окружении приложения значение тоже есть: если очистить здесь, будет действовать оно.',
    noEnv: 'В окружении приложения значения нет.',
    saved: 'Настройка сохранена, применится в течение минуты',
    saveError: 'Не удалось сохранить настройку',
    updatedAt: (at: string, by: string | null): string =>
        `Изменено ${new Date(at).toLocaleString('ru-RU')}${by ? `, ${by}` : ''}.`,
} as const;
