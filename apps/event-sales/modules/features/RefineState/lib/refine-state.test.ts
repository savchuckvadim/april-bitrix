import { describe, expect, it } from 'vitest';
import type { PBXField } from '@/modules/app/types/portal/portal-type';
import { readRefineState, toRefineSinceLabel } from './refine-state';

const field = (code: string, bitrixId: string): PBXField =>
    ({ code, bitrixId, type: 'string', items: [] }) as unknown as PBXField;

const FIELDS = [
    field('op_is_in_refine', 'OP_IS_IN_REFINE'),
    field('op_refined_at', 'OP_REFINED_AT'),
    field('op_refined_reason', 'OP_REFINED_REASON'),
];

describe('readRefineState', () => {
    it('флаг не установлен на портале — null, даже если дата и причина есть', () => {
        expect(
            readRefineState(FIELDS.slice(1), {
                UF_CRM_OP_REFINED_AT: '02.09.2026',
                UF_CRM_OP_REFINED_REASON: 'дорого',
            }),
        ).toBeNull();
    });

    it.each(['1', 1, true, 'Y'])('флаг %s — состояние активно', raw => {
        expect(
            readRefineState(FIELDS, { UF_CRM_OP_IS_IN_REFINE: raw })?.isActive,
        ).toBe(true);
    });

    it.each(['0', 0, false, 'N', '', undefined])(
        'флаг %s — состояния нет',
        raw => {
            expect(
                readRefineState(FIELDS, { UF_CRM_OP_IS_IN_REFINE: raw })
                    ?.isActive,
            ).toBe(false);
        },
    );

    it('дата и причина читаются по слепку, причина — trim', () => {
        expect(
            readRefineState(FIELDS, {
                UF_CRM_OP_IS_IN_REFINE: '1',
                UF_CRM_OP_REFINED_AT: '2026-09-02T03:00:00+03:00',
                UF_CRM_OP_REFINED_REASON: '  Нет денег — «дорого»  ',
            }),
        ).toEqual({
            isActive: true,
            sinceLabel: '2 сентября 2026',
            reason: 'Нет денег — «дорого»',
        });
    });

    it('строки сделки нет — состояние пустое, не null', () => {
        expect(readRefineState(FIELDS, null)).toEqual({
            isActive: false,
            sinceLabel: '',
            reason: '',
        });
    });
});

describe('toRefineSinceLabel', () => {
    it('CRM-дата и ISO дают один и тот же день по-русски', () => {
        expect(toRefineSinceLabel('02.09.2026')).toBe('2 сентября 2026');
        expect(toRefineSinceLabel('2026-09-02')).toBe('2 сентября 2026');
    });

    it('мусор и пустота — пустая строка', () => {
        expect(toRefineSinceLabel('')).toBe('');
        expect(toRefineSinceLabel('вчера')).toBe('');
        expect(toRefineSinceLabel(null)).toBe('');
    });
});
