/**
 * Кабинет клиента-портала в админке April (бэк — @lib/cabinet,
 * `admin/cabinet/portals/:portalId`).
 *
 * Формы описаны руками: ручки ещё не прогнаны через orval. После
 * `pnpm run generate` в `@workspace/nest-admin-api` правка сводится к
 * замене этих объявлений импортом сгенерированных DTO — имена полей
 * совпадают с бэком (CabinetAdminPortalCardDto, CabinetMemberDto, …).
 * Прецедент — `entities/portal/vendor-super-users`.
 */

/** Роль в кабинете портала: один владелец, участники, заявки из Битрикса. */
export type CabinetRole = 'owner' | 'member' | 'pending';

export interface CabinetMember {
    /** ID членства (portal_users.id) — адрес действий. */
    id: string;
    userId: number;
    email: string | null;
    firstName: string;
    lastName: string;
    role: CabinetRole;
    bitrixUserId: string | null;
    revoked: boolean;
    hasPassword: boolean;
    createdAt: string | null;
}

export interface CabinetTelegramBinding {
    id: string;
    bitrixUserId: string | null;
    userId: number | null;
    telegramUsername: string | null;
    displayName: string | null;
    createdBy: string | null;
    createdAt: string | null;
}

/** Приложение April на портале: установка, режим авторизации, виджеты. */
export interface CabinetAppStatus {
    installed: boolean;
    installStatus: string | null;
    installedAt: string | null;
    uninstalledAt: string | null;
    /** webhook | app | auto */
    bitrixAuthMode: string;
    enabledParts: string[];
    /** Коды виджетов из настройки портала app_widgets. */
    widgets: string[];
}

export interface CabinetPortalCard {
    portalId: number;
    domain: string | null;
    clientId: number | null;
    organization: string | null;
    approvalStatus: string | null;
    app: CabinetAppStatus;
    members: CabinetMember[];
    telegram: CabinetTelegramBinding[];
}

/** Ответ обновления/переустановки виджетов (прокси admin → pbx). */
export interface CabinetWidgetsResult {
    ok: boolean;
    /** JSON pbx: { bound, unbound, errors, total }. */
    details?: string;
}

export interface CabinetPasswordLink {
    url: string;
    expiresAt: string;
    emailSent: boolean;
}

export interface CabinetInviteResult {
    member: CabinetMember;
    passwordLink: CabinetPasswordLink | null;
}

export interface CabinetAddMember {
    email: string;
    firstName: string;
    lastName: string;
    bitrixUserId?: string;
    makeOwner?: boolean;
}

/** «Подключение Битрикс24» (бэк: admin/cabinet/portals/:id/bitrix-app). */
export interface CabinetBitrixAppConnection {
    domain: string;
    setup: {
        devSectionUrl: string;
        handlerUrl: string;
        installUrl: string;
        scopes: string[];
    };
    keys: { set: boolean; clientId: string | null; updatedAt: string | null };
    install: {
        installed: boolean;
        status: string | null;
        installedAt: string | null;
        tokenExpiresAt: string | null;
    };
    /** error — ответ Битрикса при неудаче (виден только April). */
    lastRefresh: { at: string | null; ok: boolean; error: string | null } | null;
}

export interface CabinetBitrixAppKeys {
    clientId: string;
    clientSecret: string;
}

export type CabinetBitrixAppCheckResult =
    | 'ok'
    | 'no_keys'
    | 'not_installed'
    | 'keys_invalid'
    | 'reopen_app'
    | 'unavailable';

export interface CabinetBitrixAppCheck {
    result: CabinetBitrixAppCheckResult;
    message: string;
}
