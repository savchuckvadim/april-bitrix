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

export interface CabinetPortalCard {
    portalId: number;
    domain: string | null;
    clientId: number | null;
    organization: string | null;
    approvalStatus: string | null;
    members: CabinetMember[];
    telegram: CabinetTelegramBinding[];
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
