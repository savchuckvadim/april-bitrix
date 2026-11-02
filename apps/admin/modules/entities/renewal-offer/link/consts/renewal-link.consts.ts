import type { RenewalLinkStatus } from '../model';

export const RENEWAL_LINK_API_BASE = '/api/renewal-offer/links';
export const RENEWAL_LINK_LIST_CACHE_KEY = 'renewal-offer-links';

/** Сайт, на котором открываются предложения. В dev переопределяется env. */
export const RENEWAL_SITE_URL = (
    process.env.NEXT_PUBLIC_BITRIX_APP_URL || 'https://bitrix.april-app.ru'
).replace(/\/$/, '');

export const RENEWAL_LINK_STATUS_LABEL: Record<RenewalLinkStatus, string> = {
    active: 'Действует',
    expired: 'Истекла',
    revoked: 'Отозвана',
};

export const UNTIL_REVOKED = 'until-revoked';

export const RENEWAL_LINK_PERIOD_OPTIONS: ReadonlyArray<{
    value: string;
    label: string;
}> = [
    { value: '30', label: '30 дней' },
    { value: '60', label: '60 дней' },
    { value: '90', label: '90 дней' },
    { value: '365', label: 'Год' },
    { value: UNTIL_REVOKED, label: 'До отзыва' },
];

export const DEFAULT_RENEWAL_LINK_PERIOD = '60';

/**
 * Прайс по умолчанию — тот же, что на бэкенде и на странице предложения.
 * Здесь он нужен, чтобы форма открывалась заполненной: менеджер правит
 * только то, что у клиента иначе.
 */
export const RENEWAL_PRICE_DEFAULTS = {
    sales: 5000,
    aiBase: 7500,
    aiBaseEmployees: 3,
    aiExtra: 1000,
    aiFreeDelta: 2,
    manager: 10000,
    devHour: 2000,
    devHours: 30,
} as const;
