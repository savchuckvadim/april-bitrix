/**
 * Типы «вида отчёта» портала. Ручки новые — клиент не сгенерирован, типы
 * написаны по контракту бэка (kpi-report `portal-view/get|save`) вручную.
 */
import type { PORTAL_VIEW_INDICATOR_GROUPS } from '../consts/portal-view.consts';

/** Группа бейджа в списке разборов: общие или из методики портала. */
export type PortalViewBadgeGroup = 'general' | 'methodology';

/** Группа показателя на странице настроек (коды — PORTAL_VIEW_INDICATOR_GROUPS). */
export type PortalViewIndicatorGroup =
    (typeof PORTAL_VIEW_INDICATOR_GROUPS)[number];

/** Портальные настройки вида отчёта. */
export interface PortalViewSettings {
    /** Коды скрытых вкладок: events | callings | merged | digest | finance | ai | call_reviews. */
    tabsHidden: string[];
    /** Показывать ли графики (на телефоне скрыты всегда). */
    chartsEnabled: boolean;
    /** Бейджи, видимые сразу, в порядке показа; пусто — набор по умолчанию. */
    badgesMain: string[];
    /**
     * Свои названия показателей: ключ `ev:<innerCode>`, `call:<id бакета>`,
     * `plan:<код плана>`; значение — непустое название для показа. Данные
     * отчёта не меняются: название подставляется только при выводе.
     */
    labels: Record<string, string>;
    /** Колонки планов на вкладках «Все» и «События». */
    plansEvents: boolean;
    /** Колонки планов в «Объединённом отчёте». */
    plansMerged: boolean;
    /** Колонки планов на вкладке «Звонки» (только интерфейс, не Excel). */
    plansCallings: boolean;
    /** Коды плановых показателей, чью колонку не выводить; пусто — все. */
    planColumnsHidden: string[];
    /** Кто менял последним. */
    updatedBy: string | null;
    /** Когда менял последний раз (ISO). */
    updatedAt: string | null;
}

/** Вкладка, которую можно скрыть: код и название для человека. */
export interface PortalViewTabOption {
    code: string;
    name: string;
    /**
     * Вкладку видят все сотрудники портала («Все», «События», «Звонки»,
     * «Объединённый отчёт», «Дайджест»); остальные показываются по правам.
     * Хотя бы одна общая вкладка остаётся видимой, последнюю не выключить.
     */
    common: boolean;
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

/** Показатель отчёта, которому можно задать своё название (каталог портала). */
export interface PortalViewIndicator {
    /** Ключ своего названия: `ev:…`, `call:…` или `plan:…`. */
    key: string;
    group: PortalViewIndicatorGroup;
    /** Исходное название показателя (у колонки плана — название по умолчанию). */
    name: string;
    /** У колонки плана — ключ показателя-факта, перед которым она стоит; иначе null. */
    factKey: string | null;
}

/** Справочники для формы настроек. */
export interface PortalViewOptions {
    tabs: PortalViewTabOption[];
    badges: PortalViewBadgeOption[];
    methodology: PortalViewMethodology | null;
    /** Каталог показателей: события в порядке отчёта, бакеты звонков, колонки планов. */
    indicators: PortalViewIndicator[];
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
    /** Свои названия целиком; пустое название — «как было». */
    labels?: Record<string, string>;
    plansEvents?: boolean;
    plansMerged?: boolean;
    plansCallings?: boolean;
    planColumnsHidden?: string[];
}

export type PortalViewSaveRequest = PortalViewRequest & PortalViewSaveBody;
