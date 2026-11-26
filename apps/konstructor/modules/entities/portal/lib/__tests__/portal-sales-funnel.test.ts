import { describe, expect, it } from 'vitest';
import type { Portal } from '../../model/dto';
import { getSalesFunnelScope } from '../portal-util';

/** Слепок портала с воронками: нужны только коды категорий и стадий */
const portalWith = (
    categories: Array<{ code: string; bitrixId: string; stages: Array<{ code: string; bitrixId: string }> }>,
): Portal => ({ bitrixDeal: { categories } }) as unknown as Portal;

const SALES_BASE = {
    code: 'sales_base',
    bitrixId: '34',
    stages: [
        { code: 'sales_new', bitrixId: 'C34:NEW' },
        { code: 'sales_offer_create', bitrixId: 'C34:UC_DOCS' },
        { code: 'sales_success', bitrixId: 'C34:WON' },
        { code: 'sales_fail', bitrixId: 'C34:LOSE' },
        { code: 'sales_double', bitrixId: 'C34:APOLOGY' },
        { code: 'sales_not_ca', bitrixId: 'C34:UC_NOT_CA' },
    ],
};

describe('getSalesFunnelScope', () => {
    it('номер воронки sales_base и её финальные стадии', () => {
        const scope = getSalesFunnelScope(
            portalWith([
                { code: 'service_base', bitrixId: '40', stages: [{ code: 'sales_success', bitrixId: 'C40:WON' }] },
                SALES_BASE,
            ]),
        );

        expect(scope?.categoryId).toBe(34);
        expect([...(scope?.finalStageIds ?? [])].sort()).toEqual(
            ['C34:APOLOGY', 'C34:LOSE', 'C34:UC_NOT_CA', 'C34:WON'].sort(),
        );
    });

    it('рабочие стадии в финальные не попадают', () => {
        const scope = getSalesFunnelScope(portalWith([SALES_BASE]));

        expect(scope?.finalStageIds.has('C34:NEW')).toBe(false);
        expect(scope?.finalStageIds.has('C34:UC_DOCS')).toBe(false);
    });

    it('общая воронка с номером 0 допустима', () => {
        const scope = getSalesFunnelScope(portalWith([{ ...SALES_BASE, bitrixId: '0' }]));

        expect(scope?.categoryId).toBe(0);
    });

    it('нет слепка, схемы сделок или воронки sales_base — null', () => {
        expect(getSalesFunnelScope(null)).toBeNull();
        expect(getSalesFunnelScope({ bitrixDeal: null } as unknown as Portal)).toBeNull();
        expect(
            getSalesFunnelScope(portalWith([{ code: 'service_base', bitrixId: '40', stages: [] }])),
        ).toBeNull();
        expect(getSalesFunnelScope(portalWith([{ ...SALES_BASE, bitrixId: '' }]))).toBeNull();
    });
});
