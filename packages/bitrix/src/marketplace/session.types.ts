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
