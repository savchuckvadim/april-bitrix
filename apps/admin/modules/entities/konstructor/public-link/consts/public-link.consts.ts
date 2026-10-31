import type { PublicLinkStatus } from '../model';

export const PUBLIC_LINK_API_BASE = '/api/konstructor/public-links';
export const PUBLIC_LINK_LIST_CACHE_KEY = 'konstructor-public-links';

/** Адрес конструктора, на котором открываются ссылки. В dev переопределяется env. */
export const KONSTRUCTOR_APP_URL = (
    process.env.NEXT_PUBLIC_KONSTRUCTOR_APP_URL ||
    'https://next.april-app.ru/konstructor'
).replace(/\/$/, '');

export const PUBLIC_LINK_STATUS_LABEL: Record<PublicLinkStatus, string> = {
    active: 'Действует',
    expired: 'Истекла',
    revoked: 'Отозвана',
};

export const UNTIL_REVOKED = 'until-revoked';

export const PUBLIC_LINK_PERIOD_OPTIONS: ReadonlyArray<{
    value: string;
    label: string;
}> = [
    { value: '7', label: '7 дней' },
    { value: '30', label: '30 дней' },
    { value: '90', label: '90 дней' },
    { value: '365', label: 'Год' },
    { value: UNTIL_REVOKED, label: 'До отзыва' },
];

export const DEFAULT_PUBLIC_LINK_PERIOD = '30';
