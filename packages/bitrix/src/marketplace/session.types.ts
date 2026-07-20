/**
 * Типы portal-context сессии маркетплейса «Менеджер Гарант».
 * Контракт бэка: back/apps/pbx/src/marketplace (README модуля).
 */

/** Состояние допуска портала (вычисляет бэк; фронт только рендерит) */
export type PortalSessionState =
    | 'onboarding' // клиент не привязан — показать форму заявки
    | 'pending' //    заявка подана — «на рассмотрении»
    | 'active' //     допущен — полный кабинет
    | 'blocked' //    отключён вендором
    | 'unauthorized'; // верификация открытия не пройдена (нет сессии)

export interface PortalSessionUser {
    name?: string;
    lastName?: string;
    isAdmin: boolean;
    /** Email из Bitrix user.current (только state=onboarding) — префилл формы */
    email?: string;
}

/** Ответ POST /bitrix-marketplace/session/exchange */
export interface PortalSession {
    /** Portal-context JWT — хранится ТОЛЬКО в памяти, ходит Bearer-ом */
    token: string;
    state: PortalSessionState;
    domain?: string;
    memberId: string;
    user: PortalSessionUser;
}

/** Ответ GET/POST /bitrix-marketplace/onboarding */
export interface OnboardingState {
    state: PortalSessionState;
    organization?: {
        name?: string;
        email?: string;
    };
}

export interface OnboardingApplication {
    organizationName: string;
    contactEmail: string;
}

/** Ответ POST /bitrix-marketplace/onboarding/redeem (погашение кода) */
export interface RedeemInviteResult {
    state: PortalSessionState;
    productCode: string;
    /**
     * Запущена ли установка сущностей. false — установку запускает сам
     * клиент кнопкой (сценарий с мастером настройки).
     */
    provisionStarted: boolean;
    organizationName?: string;
}

/** Ответ POST /bitrix-marketplace/cabinet/install-product */
export interface InstallProductResult {
    productCode: string;
    provisionStarted: boolean;
}

/** Продукт портала (portal_products; отсутствие записи = не подключён) */
export interface CabinetProduct {
    code: string;
    status: 'active' | 'inactive' | 'suspended' | string;
    activatedAt?: string;
}

/** Компонент установки (marketplace_install_components) */
export interface CabinetComponent {
    productCode: string;
    componentType: 'placement' | 'smart_scenario' | 'pbx_entities' | string;
    /** Пустая строка — агрегат всей оси pbx_entities продукта */
    componentCode: string;
    status:
        | 'pending'
        | 'installing'
        | 'installed'
        | 'error'
        | 'unavailable'
        | 'skipped'
        | string;
    reasonCode?: string;
}

/** Ответ GET /bitrix-marketplace/cabinet/summary */
export interface CabinetSummary {
    state: PortalSessionState;
    organization?: {
        name?: string;
        email?: string;
    };
    products: CabinetProduct[];
    components: CabinetComponent[];
    installStatus?: string;
}
