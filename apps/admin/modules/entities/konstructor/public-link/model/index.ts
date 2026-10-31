/**
 * Формы ручек `konstructor/public-links`. Описаны руками, пока не прогнан
 * `pnpm run generate` в `@workspace/nest-konstructor-api`; после генерации здесь
 * останутся алиасы на `PublicLinkDto` и `CreatePublicLinkDto`.
 */
export type PublicLinkStatus = 'active' | 'expired' | 'revoked';

export interface PublicLink {
    id: string;
    token: string;
    portalId: number;
    domain: string;
    title: string;
    status: PublicLinkStatus;
    expiresAt: string | null;
    revokedAt: string | null;
    viewCount: number;
    lastViewedAt: string | null;
    createdAt: string | null;
}

export interface PublicLinkCreate {
    portalId: number;
    title: string;
    /** Не указан — ссылка действует до отзыва */
    expiresInDays?: number;
}

export interface PublicLinksRevoked {
    revoked: number;
}
