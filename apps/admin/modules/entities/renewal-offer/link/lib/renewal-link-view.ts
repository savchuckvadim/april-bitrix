import {
    RENEWAL_SITE_URL,
    UNTIL_REVOKED,
} from '../consts/renewal-link.consts';
import type { RenewalLink, RenewalOffer } from '../model';

/** Ссылка на предложение, которую отправляют клиенту. */
export const renewalLinkUrl = (token: string): string =>
    `${RENEWAL_SITE_URL}/renewal/${encodeURIComponent(token)}`;

/** Ссылка на PDF того же предложения — чтобы проверить файл до отправки. */
export const renewalPdfUrl = (token: string): string =>
    `${renewalLinkUrl(token)}/pdf`;

export const formatRenewalLinkDate = (value: string | null): string =>
    value ? new Date(value).toLocaleString('ru-RU') : '—';

export const formatRenewalLinkExpiry = (value: string | null): string =>
    value ? new Date(value).toLocaleDateString('ru-RU') : 'До отзыва';

export const countActiveRenewalLinks = (
    links: readonly RenewalLink[],
): number => links.filter(link => link.status === 'active').length;

/** Значение селекта срока → дни для запроса; «до отзыва» — без срока. */
export const periodToDays = (period: string): number | undefined =>
    period === UNTIL_REVOKED ? undefined : Number(period);

const NBSP = ' ';

/** Сумма рублями с неразрывными пробелами, как на странице предложения. */
export const formatRub = (amount: number): string => {
    const rounded = Math.round(amount);
    const sign = rounded < 0 ? '−' : '';
    const digits = Math.abs(rounded)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    return `${sign}${digits}${NBSP}₽`;
};

/**
 * Короткий состав предложения для таблицы: какие услуги включены.
 * Нужен, чтобы в списке было видно, что именно предложено, не раскрывая
 * строку целиком.
 */
export const renewalOfferSummary = (offer: RenewalOffer): string => {
    const parts: string[] = [];
    if (offer.salesIncluded) parts.push('Приложения');
    if (offer.aiIncluded) parts.push(`AI (${offer.aiEmployees})`);
    if (offer.managerIncluded) parts.push('Менеджер');
    for (const line of offer.extras) {
        const title = line.title.trim();
        if (title) parts.push(title);
    }
    return parts.length ? parts.join(', ') : 'Ничего не включено';
};
