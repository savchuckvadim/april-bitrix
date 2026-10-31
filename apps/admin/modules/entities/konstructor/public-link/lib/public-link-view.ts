import {
    KONSTRUCTOR_APP_URL,
    UNTIL_REVOKED,
} from '../consts/public-link.consts';
import type { PublicLink } from '../model';

export const publicLinkUrl = (token: string): string =>
    `${KONSTRUCTOR_APP_URL}/p/${encodeURIComponent(token)}`;

export const formatPublicLinkDate = (value: string | null): string =>
    value ? new Date(value).toLocaleString('ru-RU') : '—';

export const formatPublicLinkExpiry = (value: string | null): string =>
    value ? new Date(value).toLocaleDateString('ru-RU') : 'До отзыва';

export const countActivePublicLinks = (links: readonly PublicLink[]): number =>
    links.filter(link => link.status === 'active').length;

/** Значение селекта срока → дни для запроса; «до отзыва» — без срока. */
export const periodToDays = (period: string): number | undefined =>
    period === UNTIL_REVOKED ? undefined : Number(period);
