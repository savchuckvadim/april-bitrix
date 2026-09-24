import { describe, expect, it } from 'vitest';
import type { DuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import { APP_FROM_ENUM } from '@/modules/app/model/slice/AppSlice';
import { EDepartmentRole } from '@/modules/features/Departament/lib/department-role-util';
import { JOIN_TO_MAIN_TEXT, resolveJoinTarget } from './join-to-main.util';

const context = (over: Partial<DuplicateContext> = {}): DuplicateContext => ({
    from: APP_FROM_ENUM.DEAL,
    companyId: null,
    leadId: null,
    dealId: 87955,
    hasCompany: false,
    ...over,
});

describe('resolveJoinTarget', () => {
    it('руководитель из сделки: кандидат-сделка → цель deal', () => {
        const target = resolveJoinTarget(
            { entityType: 'DEAL', id: 42423 },
            context(),
            EDepartmentRole.DEPARTMENT_HEAD,
        );
        expect(target).toEqual({
            allowed: true,
            reason: null,
            targetType: 'deal',
            targetId: 42423,
            dealId: 87955,
        });
    });

    it('кандидат-компания → цель company', () => {
        const target = resolveJoinTarget(
            { entityType: 'COMPANY', id: 91429 },
            context(),
            EDepartmentRole.GROUP_HEAD,
        );
        expect(target.allowed).toBe(true);
        expect(target.targetType).toBe('company');
        expect(target.targetId).toBe(91429);
    });

    it('рядовой сотрудник кнопку не получает', () => {
        const target = resolveJoinTarget(
            { entityType: 'DEAL', id: 42423 },
            context(),
            EDepartmentRole.EMPLOYEE,
        );
        expect(target.allowed).toBe(false);
        expect(target.reason).toBe(JOIN_TO_MAIN_TEXT.onlyHead);
    });

    it('приложение открыто не из сделки — присоединять нечего', () => {
        const target = resolveJoinTarget(
            { entityType: 'DEAL', id: 42423 },
            context({ from: APP_FROM_ENUM.COMPANY, dealId: null }),
            EDepartmentRole.SUPER,
        );
        expect(target.allowed).toBe(false);
        expect(target.reason).toBe(JOIN_TO_MAIN_TEXT.onlyFromDeal);
    });

    it('кандидат — текущая сделка или лид/контакт — нельзя', () => {
        expect(
            resolveJoinTarget(
                { entityType: 'DEAL', id: 87955 },
                context(),
                EDepartmentRole.SUPER,
            ).reason,
        ).toBe(JOIN_TO_MAIN_TEXT.ownDeal);
        expect(
            resolveJoinTarget(
                { entityType: 'CONTACT', id: 5 },
                context(),
                EDepartmentRole.SUPER,
            ).reason,
        ).toBe(JOIN_TO_MAIN_TEXT.onlyDealOrCompany);
    });
});
