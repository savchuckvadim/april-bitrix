/**
 * Типы централизованного управления доступом.
 *
 * Чистый слой (shared): никаких импортов из entities/features/app —
 * контекст доступа собирает app-слой (modules/app/lib/access), правила
 * лежат рядом в access.rules.ts. Потребители (виджеты/фичи/сущности)
 * сверяются через хук useAccess(EAccessFeature.X).
 */

/** Роль руководителя из структуры отделов (bэк: BxCurrentUserDto.headOf). */
export type AccessHeadOf = 'cup' | 'op' | 'group' | null;

/**
 * Фичи/поверхности, доступ к которым управляется централизованно.
 * Новое ограничение видимости = новый ключ здесь + правило в ACCESS_RULES.
 */
export enum EAccessFeature {
    /** Вкладка «Финансы» в отчёте. */
    FINANCE_TAB = 'financeTab',
    /** Кнопка «Смотреть как…» (режим просмотра от имени пользователя). */
    VIEW_AS = 'viewAs',
    /**
     * Командный вид эфирного времени (таблица команды + рейтинг).
     * Без доступа — только собственная карточка.
     */
    AIRTIME_TEAM = 'airtimeTeam',
    /** Создание/управление публичными ссылками на отчёт. */
    SHARE_LINKS = 'shareLinks',
    /** Видеть планы руководителя (свои — любой сотрудник при вкл. фиче). */
    PLANS_VIEW = 'plansView',
    /** Видеть планы ВСЕХ сотрудников (руководители). */
    PLANS_VIEW_ALL = 'plansViewAll',
    /** Настраивать планы (показатели, значения) — руководители op/cup. */
    PLANS_CONFIGURE = 'plansConfigure',
}

/**
 * Флаги включения фич приложения. Сейчас — константа APP_FEATURES
 * (modules/app/consts/features.ts); задел: у разных порталов будут свои
 * настройки, которые приедут с бэка (appActions.setFeatures).
 */
export interface AppFeatureFlags {
    /** Вкладка «Финансы» включена в приложении вообще. */
    financeTab: boolean;
    /** Планы руководителя включены в приложении вообще (гасит всю фичу). */
    plans: boolean;
}

/**
 * Контекст проверки прав — всё, что нужно правилам. Собирается из стора
 * app-слоем (selectAccessContext), правила остаются чистыми функциями.
 */
export interface AccessContext {
    /** Флаги приложения (пока константа, позже — per-portal с бэка). */
    features: AppFeatureFlags;
    /** Роль эффективного пользователя (в режиме viewAs — просматриваемого). */
    headOf: AccessHeadOf;
    /** Эффективный пользователь — суперюзер (в viewAs всегда false). */
    isSuperUser: boolean;
    /** РЕАЛЬНЫЙ пользователь — суперюзер (не зависит от viewAs). */
    isRealSuperUser: boolean;
    /** Активен режим «Смотреть как…». */
    isViewAs: boolean;
    /** Мультипортал (несколько отделов продаж). */
    isMulti: boolean;
}
