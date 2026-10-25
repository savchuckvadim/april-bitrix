import type {
    KonstructorAppSettingsResolve200AllOf,
    KonstructorAppSettingsResolvedDto,
} from '@workspace/nest-konstructor-api';

/**
 * Ответ `/app-settings/konstructor`: значения ключей реестра ПЛОСКО
 * (camelCase) плюс `storedKeys` — какие ключи владелец реально задал.
 * Та же форма и те же оговорки, что у event-sales (`storedKeys` может не
 * прийти со старого бэка).
 */
export type KonstructorAppSettings = Partial<KonstructorAppSettingsResolvedDto> &
    Record<string, KonstructorAppSettingsResolve200AllOf[string] | string[] | undefined>;
