import type { AppFeatureFlags } from '@/modules/shared/access';

/**
 * Флаги фич приложения — ЕДИНОЕ место включения/выключения.
 *
 * Выключить вкладку «Финансы» во всём приложении = financeTab: false.
 *
 * Кому видна включённая фича — решает таблица правил
 * modules/shared/access/access.rules.ts (роли headOf и т.д.).
 *
 * Задел: у разных порталов будут свои настройки — санка загрузит их с
 * бэка и задиспатчит appActions.setFeatures(partial), перекрыв дефолты.
 */
export const APP_FEATURES: AppFeatureFlags = {
    financeTab: true,
    /** Планы руководителя: false гасит всю фичу (настройки, блоки, Excel). */
    plans: true,
    /**
     * AI-аналитика ОП: false гасит вкладку и запрос settings/get целиком.
     * Второй уровень — портальный флаг, его ставит listener feature/ai-flags.
     */
    aiAnalytics: true,
    /** Портальный уровень приходит с бэка (settings/get); до ответа — выкл. */
    aiAnalyticsPortalEnabled: false,
};
