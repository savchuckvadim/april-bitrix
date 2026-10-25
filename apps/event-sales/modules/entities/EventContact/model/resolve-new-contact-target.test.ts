import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RootState } from '@/modules/app/model/store';

const h = vi.hoisted(() => ({ getList: vi.fn() }));

vi.mock('@workspace/bitrix', () => ({
    Bitrix: { getService: () => ({ deal: { getList: h.getList } }) },
}));

import { resolveNewContactTarget } from './resolve-new-contact-target';

/** Минимальный стор: контекст фрейма, слепок портала, ответственный плана. */
const makeState = (over: {
    deal?: Record<string, unknown> | null;
    company?: Record<string, unknown> | null;
    lead?: Record<string, unknown> | null;
    planResponsibleId?: number;
    categories?: Array<{ bitrixId: number; code: string }>;
}): RootState =>
    ({
        app: {
            bitrix: {
                deal: over.deal ?? null,
                company: over.company ?? null,
                lead: over.lead ?? null,
                user: { ID: '7' },
            },
        },
        portal: {
            portal: {
                bitrixDeal: {
                    categories: over.categories ?? [
                        { bitrixId: 31, code: 'sales_base' },
                        { bitrixId: 33, code: 'sales_xo' },
                    ],
                },
            },
        },
        department: {
            plan: {
                responsible: {
                    current: over.planResponsibleId
                        ? { ID: String(over.planResponsibleId) }
                        : null,
                },
            },
        },
    }) as unknown as RootState;

beforeEach(() => {
    h.getList.mockReset();
});

describe('resolveNewContactTarget', () => {
    it('из сделки — в сеть не ходим, ответственный сделки', async () => {
        const target = await resolveNewContactTarget(
            makeState({
                deal: { ID: '104459', ASSIGNED_BY_ID: '459' },
                company: { ID: '161825' },
            }),
        );
        expect(target).toEqual({
            companyId: 161825,
            dealId: 104459,
            responsibleId: 459,
        });
        expect(h.getList).not.toHaveBeenCalled();
    });

    it('из компании — открытые «ОП Основная» компании, своя по ответственному плана', async () => {
        h.getList.mockResolvedValue({
            result: [
                { ID: '500', ASSIGNED_BY_ID: '69', DATE_MODIFY: '2026-10-22T10:00:00+03:00' },
                { ID: '400', ASSIGNED_BY_ID: '459', DATE_MODIFY: '2026-10-01T10:00:00+03:00' },
            ],
        });
        const target = await resolveNewContactTarget(
            makeState({ company: { ID: '177317' }, planResponsibleId: 459 }),
        );
        expect(h.getList).toHaveBeenCalledWith(
            { COMPANY_ID: 177317, CATEGORY_ID: 31, CLOSED: 'N' },
            ['ID', 'ASSIGNED_BY_ID', 'DATE_MODIFY'],
            { DATE_MODIFY: 'DESC' },
        );
        expect(target).toEqual({
            companyId: 177317,
            dealId: 400,
            responsibleId: 459,
        });
    });

    it('запрос сделок упал — контакт в компанию, ответственный — сам пользователь', async () => {
        h.getList.mockRejectedValue(new Error('сеть'));
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const target = await resolveNewContactTarget(
            makeState({ company: { ID: '177317' } }),
        );
        expect(target).toEqual({
            companyId: 177317,
            dealId: null,
            responsibleId: 7,
        });
    });

    it('в слепке нет воронки «ОП Основная» — сделку не ищем', async () => {
        const target = await resolveNewContactTarget(
            makeState({ company: { ID: '1' }, categories: [] }),
        );
        expect(h.getList).not.toHaveBeenCalled();
        expect(target.dealId).toBeNull();
    });
});
