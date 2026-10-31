import { describe, expect, it } from 'vitest';
import { KONSTRUCTOR_APP_URL, UNTIL_REVOKED } from '../consts/public-link.consts';
import type { PublicLink } from '../model';
import {
    countActivePublicLinks,
    formatPublicLinkExpiry,
    periodToDays,
    publicLinkUrl,
} from './public-link-view';

const link = (status: PublicLink['status']): PublicLink => ({
    id: status,
    token: 'tok',
    portalId: 1,
    domain: 'test.bitrix24.ru',
    title: 'Тест',
    status,
    expiresAt: null,
    revokedAt: null,
    viewCount: 0,
    lastViewedAt: null,
    createdAt: null,
});

describe('public-link-view', () => {
    it('адрес ссылки ведёт на публичный маршрут конструктора', () => {
        expect(publicLinkUrl('a-b_c')).toBe(`${KONSTRUCTOR_APP_URL}/p/a-b_c`);
    });

    it('без срока показывает «До отзыва»', () => {
        expect(formatPublicLinkExpiry(null)).toBe('До отзыва');
    });

    it('считает только действующие ссылки', () => {
        expect(
            countActivePublicLinks([
                link('active'),
                link('expired'),
                link('revoked'),
                link('active'),
            ]),
        ).toBe(2);
    });

    it('срок: дни числом, «до отзыва» — без срока', () => {
        expect(periodToDays('30')).toBe(30);
        expect(periodToDays(UNTIL_REVOKED)).toBeUndefined();
    });
});
