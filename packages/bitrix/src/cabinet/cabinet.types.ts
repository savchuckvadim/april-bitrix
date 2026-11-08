/**
 * Типы кабинета клиента-портала. Контракт бэка: back/libs/cabinet
 * (`/api/cabinet/*` на api.pbx.april-app.ru), DTO с теми же именами полей.
 */

/** Роль в кабинете портала: один владелец, участники, заявки из Битрикса. */
export type CabinetRole = 'owner' | 'member' | 'pending';

/** Уровень доступа: frame — сотрудник из Битрикса без доступа к кабинету. */
export type CabinetAccessLevel = 'frame' | 'member' | 'owner' | 'platform';

export type CabinetAppPart = 'sales' | 'service';

/** Ответ входа/обновления: refresh — в httpOnly-cookie, не здесь. */
export interface CabinetSiteSession {
    accessToken: string;
    accessExpiresAt: string | null;
    userId: number;
}

export interface CabinetPortalSummary {
    portalId: number;
    domain: string | null;
    organization: string | null;
    /** null — действующий портал April (подключён). */
    approvalStatus: string | null;
    role: CabinetRole | null;
}

export interface CabinetPortalOverview extends CabinetPortalSummary {
    level: CabinetAccessLevel;
    enabledParts: CabinetAppPart[];
    widgets: string[];
}

export interface CabinetProfile {
    userId: number;
    email: string | null;
    firstName: string;
    lastName: string;
    hasPassword: boolean;
    portals: CabinetPortalSummary[];
}

export interface CabinetMember {
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

export interface CabinetPerson {
    email: string;
    firstName: string;
    lastName: string;
}

export interface CabinetAddMember extends CabinetPerson {
    bitrixUserId?: string;
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

export interface CabinetPasswordLinkState {
    valid: boolean;
    purpose: 'setup' | 'reset' | null;
    emailMasked: string | null;
}

export interface CabinetFrameAccessStatus {
    role: CabinetRole | null;
    membershipId: string | null;
    emailMasked: string | null;
    hasPassword: boolean;
}

export interface CabinetTelegramCode {
    code: string;
    deepLink: string | null;
    botUsername: string | null;
    expiresAt: string;
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

/** «Подключение Битрикс24»: что ввести в Битрикс24 при создании локального приложения. */
export interface CabinetBitrixAppSetup {
    devSectionUrl: string;
    handlerUrl: string;
    installUrl: string;
    scopes: string[];
}

/** Подключение портала локальным приложением April. */
export interface CabinetBitrixAppConnection {
    domain: string;
    setup: CabinetBitrixAppSetup;
    keys: { set: boolean; clientId: string | null; updatedAt: string | null };
    install: {
        installed: boolean;
        status: string | null;
        installedAt: string | null;
        tokenExpiresAt: string | null;
    };
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
