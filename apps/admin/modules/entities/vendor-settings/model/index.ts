import {
    VendorSettingGroupDtoGroup,
    type UpdateVendorSettingDto,
    type VendorSettingDto,
    type VendorSettingDtoKey,
    type VendorSettingDtoSource,
    type VendorSettingGroupDto,
    type VendorSettingsResponseDto,
    type VendorTelegramBotDto,
    type VendorTelegramBotDtoKey,
    type VendorTelegramBotDtoStatus,
    type VendorTelegramBotTestResultDto,
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
        'Общие для всех порталов настройки April: прокси за рубеж, ключи AI-сервисов, Telegram-боты и адреса виджетов. Значение отсюда важнее переменной окружения с тем же именем и применяется в течение минуты, без выкладки. Секреты хранятся зашифрованными и обратно не показываются.',
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

/** Проверка одного Telegram-бота: какой бот стоит в токене (сам токен не приходит). */
export type VendorTelegramBot = VendorTelegramBotDto;
export type VendorTelegramBotStatus = VendorTelegramBotDtoStatus;
export type VendorTelegramBotKey = VendorTelegramBotDtoKey;
export type VendorTelegramBotTestResult = VendorTelegramBotTestResultDto;

/** Группа, над полями которой показывается «кто есть кто» среди ботов. */
export const TELEGRAM_BOTS_GROUP = VendorSettingGroupDtoGroup['telegram-bots'];

export const TELEGRAM_BOTS_TEXT = {
    title: 'Какие боты подключены сейчас',
    loading: 'Спрашиваю Telegram…',
    loadError: 'Не удалось проверить ботов',
    placeAdmin: 'токен — в этих настройках',
    placeEnv: 'токен — только в окружении сервера (TELEGRAM_BOT_TOKEN)',
    notSet: 'токен не задан',
    unknownName: 'бот без имени',
    test: 'Отправить тест',
    testing: 'Отправляю…',
    clientTestHint:
        'Проверка клиентского бота — «Проверить» у привязанного чата на вкладке портала «Кабинет».',
    webhookOk: (url: string, pending: number): string =>
        `Сообщения боту доходят: вебхук ${url}${pending ? `, в очереди ${pending}` : ''}.`,
    webhookMissing: 'Вебхук не установлен — бот не получает сообщения (приложение bot ставит его само; проверьте адрес вебхука в окружении).',
    webhookError: (error: string, at: string | null, stale: boolean): string =>
        `Последняя ошибка доставки${at ? ` (${at})` : ''}: ${error}` +
        (stale ? ' — давно, очередь пуста: сейчас сообщения доходят.' : ''),
    sameToken: (others: readonly string[]): string =>
        `Тот же токен, что у: ${others.join(', ')}. Один бот на две задачи — так нельзя: замените токен на нужный.`,
} as const;

/** Цвет бэйджа статуса бота — тоны @workspace/april-ui. */
export const TELEGRAM_BOT_STATUS_TONE: Readonly<
    Record<VendorTelegramBotStatus, 'success' | 'muted' | 'destructive'>
> = {
    ok: 'success',
    'not-set': 'muted',
    error: 'destructive',
};
