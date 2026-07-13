import {
    PortalKeyResponseDtoKeyName,
    type PortalKeyResponseDto,
    type PortalKeysResponseDto,
    type SetPortalKeyDto,
} from '@workspace/nest-pbx-install-api';

/** Имя ключа интеграции портала. */
export type PortalKeyName = PortalKeyResponseDtoKeyName;
/** Все ключи портала (расшифрованные). */
export type PortalKeys = PortalKeysResponseDto;
/** Один ключ портала. */
export type PortalKey = PortalKeyResponseDto;
/** Тело установки значения ключа. */
export type SetPortalKey = SetPortalKeyDto;

/** Метаданные одного ключа: подпись и пояснение назначения (для тултипа). */
export interface PortalKeyMeta {
    name: PortalKeyName;
    label: string;
    description: string;
}

/**
 * Порядок и подписи ключей для UI. Источник правды по составу —
 * {@link PortalKeyResponseDtoKeyName}; здесь добавлены человекочитаемые подписи.
 */
export const PORTAL_KEY_META: PortalKeyMeta[] = [
    {
        name: PortalKeyResponseDtoKeyName.nestKey,
        label: 'Nest (основной)',
        description: 'Ключ основного nest-приложения (back).',
    },
    {
        name: PortalKeyResponseDtoKeyName.nestKonstructorKey,
        label: 'Конструктор',
        description: 'Ключ приложения-конструктора КП.',
    },
    {
        name: PortalKeyResponseDtoKeyName.nestReportKey,
        label: 'Отчёты',
        description: 'Ключ приложения отчётов.',
    },
    {
        name: PortalKeyResponseDtoKeyName.nestEventsKey,
        label: 'Event-sales',
        description: 'Ключ приложения event-sales.',
    },
    {
        name: PortalKeyResponseDtoKeyName.nestServiceKey,
        label: 'Сервис',
        description: 'Ключ сервисного приложения.',
    },
    {
        name: PortalKeyResponseDtoKeyName.nestWebhooksKey,
        label: 'Вебхуки',
        description: 'Ключ приложения вебхуков.',
    },
    {
        name: PortalKeyResponseDtoKeyName.nestScheduleKey,
        label: 'Планировщик',
        description: 'Ключ приложения планировщика.',
    },
    {
        name: PortalKeyResponseDtoKeyName.vibeKey,
        label: 'Vibe',
        description: 'Ключ интеграции Vibe.',
    },
];
