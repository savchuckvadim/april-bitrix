/**
 * Типы «вида отчёта» портала. Ручки новые — клиент не сгенерирован, типы
 * написаны по контракту бэка (kpi-report `portal-view/get|save`) вручную.
 */

/** Группа бейджа в списке разборов: общие или из методики портала. */
export type PortalViewBadgeGroup = 'general' | 'methodology';

/** Портальные настройки вида отчёта. */
export interface PortalViewSettings {
    /** Коды скрытых вкладок: events | callings | merged | digest | finance | ai | call_reviews. */
    tabsHidden: string[];
    /** Показывать ли графики (на телефоне скрыты всегда). */
    chartsEnabled: boolean;
    /** Бейджи, видимые сразу, в порядке показа; пусто — набор по умолчанию. */
    badgesMain: string[];
    /** Кто менял последним. */
    updatedBy: string | null;
    /** Когда менял последний раз (ISO). */
    updatedAt: string | null;
}

/** Вкладка, которую можно скрыть: код и название для человека. */
export interface PortalViewTabOption {
    code: string;
    name: string;
}

/** Бейдж, который можно вынести в видимые сразу. */
export interface PortalViewBadgeOption {
    id: string;
    title: string;
    /** Пояснение — подсказка к бейджу. */
    hint: string | null;
    group: PortalViewBadgeGroup;
    /** Типы звонков, к которым относится бейдж методики. */
    callTypes: string[];
    /** Виден сразу, пока портал набор не менял. */
    mainByDefault: boolean;
}

/** Методика портала, чьи бейджи показаны во второй группе. */
export interface PortalViewMethodology {
    code: string;
    title: string;
}

/** Справочники для формы настроек. */
export interface PortalViewOptions {
    tabs: PortalViewTabOption[];
    badges: PortalViewBadgeOption[];
    methodology: PortalViewMethodology | null;
}

/** Ответ обеих ручек (get и save). */
export interface PortalViewResponse {
    view: PortalViewSettings;
    /** Пользователь может менять настройки (руководитель группы и выше, суперпользователь). */
    canEdit: boolean;
    /** Ссылка на чат поддержки; null — не настроена. */
    supportUrl: string | null;
    options: PortalViewOptions;
}

/** Общая часть тела запросов: портал и РЕАЛЬНЫЙ пользователь сессии. */
export interface PortalViewRequest {
    domain: string;
    requesterUserId: string;
}

/** Что меняем при сохранении: пропущенное поле остаётся как есть. */
export interface PortalViewSaveBody {
    tabsHidden?: string[];
    chartsEnabled?: boolean;
    badgesMain?: string[];
}

export type PortalViewSaveRequest = PortalViewRequest & PortalViewSaveBody;
