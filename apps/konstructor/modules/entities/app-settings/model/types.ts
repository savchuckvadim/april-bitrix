/**
 * Настройки конструктора, которые читает фрейм (ключи реестра
 * PORTAL_APP_SETTINGS_SCHEMA[konstructor], camelCase). Дефолты — как в
 * реестре бэка: пока портал ничего не задал, поведение прежнее.
 */
export interface KonstructorAppConfig {
    /** Блок «3 КП для торгов» на экране КП (легаси — только april-garant) */
    zakupkiEnabled: boolean;
}

export const DEFAULT_KONSTRUCTOR_APP_CONFIG: KonstructorAppConfig = {
    zakupkiEnabled: false,
};

export type AppSettingsStatus = 'idle' | 'loading' | 'ready' | 'error';
