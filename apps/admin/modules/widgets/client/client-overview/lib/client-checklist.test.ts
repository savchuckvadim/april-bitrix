import { describe, expect, it } from 'vitest';
import type { ClientOverview, ClientOverviewPortal } from '@/modules/entities/client';
import { clientChecklist } from './client-checklist';

const portal = (overrides: Partial<ClientOverviewPortal> = {}): ClientOverviewPortal => ({
    portalId: 12,
    domain: 'alfacentr.bitrix24.ru',
    approvalStatus: null,
    appInstalled: false,
    bitrixAuthMode: 'webhook',
    owner: { name: 'Иванов Пётр', email: 'ivanov@alfacentr.ru', hasPassword: true },
    members: 1,
    pending: 0,
    telegram: 1,
    ...overrides,
});

const overview = (portals: ClientOverviewPortal[]): ClientOverview => ({
    clientId: 6,
    name: 'Альфа-Центр',
    email: null,
    status: 'active',
    isActive: true,
    portals,
    people: [],
});

const statusOf = (portals: ClientOverviewPortal[]) =>
    Object.fromEntries(clientChecklist(overview(portals)).map(item => [item.key, item.status]));

describe('страница клиента: что сделать', () => {
    it('нет порталов — ничего не готово, кроме заявок', () => {
        expect(statusOf([])).toEqual({
            portal: 'todo',
            owner: 'todo',
            password: 'todo',
            pending: 'done',
            telegram: 'todo',
        });
    });

    it('всё настроено — всё готово, ссылок нет', () => {
        const checks = clientChecklist(overview([portal()]));
        expect(checks.every(item => item.status === 'done')).toBe(true);
        expect(checks.every(item => item.link === null)).toBe(true);
    });

    it('без владельца — ссылка на «Кабинет» этого портала', () => {
        const checks = clientChecklist(overview([portal(), portal({ portalId: 13, domain: 'alfa-2.bitrix24.ru', owner: null })]));
        const owner = checks.find(item => item.key === 'owner');
        expect(owner?.status).toBe('todo');
        expect(owner?.hint).toContain('alfa-2.bitrix24.ru');
        expect(owner?.link?.href).toBe('/portal/13/cabinet');
    });

    it('владелец без пароля и заявки — подсказки с именем и числом', () => {
        const checks = clientChecklist(
            overview([portal({ owner: { name: 'Иванов Пётр', email: null, hasPassword: false }, pending: 2 })]),
        );
        expect(checks.find(item => item.key === 'password')?.hint).toContain('Иванов Пётр');
        expect(checks.find(item => item.key === 'pending')?.hint).toContain('alfacentr.bitrix24.ru — 2');
    });
});
