/**
 * Формы ручек `renewal-offer/links` (бэкенд: back/libs/renewal-offer).
 * Описаны руками, пока не прогнан `pnpm run generate` в
 * `@workspace/nest-admin-api`; после генерации здесь останутся алиасы на
 * `RenewalOfferLinkDto` и `CreateRenewalOfferLinkDto`.
 */
export type RenewalLinkStatus = 'active' | 'expired' | 'revoked';

export type RenewalExtraPeriod = 'month' | 'once';

/** Дополнительная услуга вне прайса — строкой в предложении. */
export interface RenewalExtraLine {
    title: string;
    price: number;
    period: RenewalExtraPeriod;
}

/** Состав и цены предложения. */
export interface RenewalOffer {
    clientName: string;

    salesIncluded: boolean;
    salesPrice: number;

    aiIncluded: boolean;
    aiEmployees: number;
    aiBasePrice: number;
    aiBaseEmployees: number;
    aiExtraPrice: number;
    aiFreeDelta: number;

    managerIncluded: boolean;
    managerPrice: number;

    devIncluded: boolean;
    devHours: number;
    devHourPrice: number;

    /** Скидка в процентах от стоимости услуг; 0 — без скидки. */
    discountPercent: number;
    /** Рубли со знаком: только у ссылок, выданных до процентов. */
    adjustment: number;
    adjustmentLabel: string;

    extras: RenewalExtraLine[];
}

/** Что отправляем при создании: все цены необязательны. */
export type RenewalOfferInput = Partial<Omit<RenewalOffer, 'clientName'>> & {
    clientName: string;
};

export interface RenewalLink {
    id: string;
    token: string;
    clientName: string;
    /** Служебная пометка о выдаче; клиент её не видит */
    title: string | null;
    /** Месячный платёж на момент выдачи, ₽ */
    monthlyTotal: number;
    offer: RenewalOffer;
    status: RenewalLinkStatus;
    expiresAt: string | null;
    revokedAt: string | null;
    viewCount: number;
    lastViewedAt: string | null;
    createdAt: string | null;
}

export interface RenewalLinkCreate {
    offer: RenewalOfferInput;
    title?: string;
    /** Не указан — ссылка действует до отзыва */
    expiresInDays?: number;
}

export interface RenewalLinksRevoked {
    revoked: number;
}
