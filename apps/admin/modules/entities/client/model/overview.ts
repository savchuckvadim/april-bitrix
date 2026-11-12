/**
 * Сводка организации-клиента (бэк: @lib/cabinet
 * `GET admin/cabinet/clients/:clientId`) — для страницы клиента.
 */

export interface ClientOverviewOwner {
    name: string;
    email: string | null;
    /** Пароль задан — может входить на сайте кабинета. */
    hasPassword: boolean;
}

export interface ClientOverviewPortal {
    portalId: number;
    domain: string | null;
    approvalStatus: string | null;
    /** Приложение April установлено на портале. */
    appInstalled: boolean;
    /** Чем бэкенд ходит в портал: webhook | app | auto. */
    bitrixAuthMode: string;
    owner: ClientOverviewOwner | null;
    /** Действующие участники вместе с владельцем. */
    members: number;
    /** Заявки на доступ, ждут подтверждения. */
    pending: number;
    /** Привязанные Telegram-чаты. */
    telegram: number;
}

export interface ClientOverviewPersonPortal {
    portalId: number;
    domain: string | null;
    /** owner | member. */
    role: string;
}

export interface ClientOverviewPerson {
    userId: number;
    name: string;
    email: string | null;
    hasPassword: boolean;
    portals: ClientOverviewPersonPortal[];
}

export interface ClientOverview {
    clientId: number;
    name: string;
    email: string | null;
    status: string | null;
    isActive: boolean;
    portals: ClientOverviewPortal[];
    people: ClientOverviewPerson[];
}
