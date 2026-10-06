import { describe, expect, it } from 'vitest';
import type { BXDeal } from '@workspace/bx';
import { mapBoundDeal } from './bound-deal-view';
import { toContextDealRow } from './context-deal';

const placementDeal = (fields: Record<string, unknown>): BXDeal =>
    fields as unknown as BXDeal;

describe('сделка плейсмента для полоски шапки', () => {
    it('нет сделки в контексте — строить нечего', () => {
        expect(toContextDealRow(null)).toBeNull();
        expect(toContextDealRow(undefined)).toBeNull();
        expect(toContextDealRow(placementDeal({ ID: '0' }))).toBeNull();
        expect(toContextDealRow(placementDeal({ TITLE: 'без id' }))).toBeNull();
    });

    it('берёт стадию, воронку и признак закрытия из ответа crm.deal.get', () => {
        expect(
            toContextDealRow(
                placementDeal({
                    ID: '31077',
                    TITLE: 'ТИК Левобережного района',
                    STAGE_ID: 'C31:OFFER_CREATE',
                    CATEGORY_ID: '31',
                    OPPORTUNITY: '12000.00',
                    CLOSED: 'N',
                    DATE_CREATE: '2026-08-11T14:04:00+03:00',
                }),
            ),
        ).toEqual({
            ID: 31077,
            TITLE: 'ТИК Левобережного района',
            STAGE_ID: 'C31:OFFER_CREATE',
            CATEGORY_ID: 31,
            OPPORTUNITY: '12000.00',
            CLOSED: 'N',
            DATE_CREATE: '2026-08-11T14:04:00+03:00',
        });
    });

    it('общая воронка: CATEGORY_ID 0 остаётся нулём, а не теряется', () => {
        const row = toContextDealRow(
            placementDeal({ ID: 5, STAGE_ID: 'NEW', CATEGORY_ID: '0' }),
        );

        expect(row?.CATEGORY_ID).toBe(0);
    });

    it('неизвестный CLOSED не объявляет сделку ни открытой, ни закрытой', () => {
        const row = toContextDealRow(placementDeal({ ID: 5 }));

        expect(row).not.toBeNull();
        expect(Object.keys(row ?? {})).not.toContain('CLOSED');
    });

    it('строка превращается в сделку с позицией стадии — как привязка задачи', () => {
        const row = toContextDealRow(
            placementDeal({
                ID: 31077,
                TITLE: 'Сделка',
                STAGE_ID: 'C31:WARM',
                CATEGORY_ID: 31,
                CLOSED: 'N',
            }),
        );
        if (!row) throw new Error('строка сделки не собралась');
        const deal = mapBoundDeal(
            row,
            [
                { statusId: 'C31:NEW', name: 'Новая' },
                { statusId: 'C31:WARM', name: 'Переговоры' },
                { statusId: 'C31:WON', name: 'Успех' },
            ],
            new Map([[31, 'sales_base']]),
        );

        expect(deal.id).toBe(31077);
        expect(deal.closed).toBe(false);
        expect(deal.stage).toMatchObject({
            bitrixId: 'C31:WARM',
            categoryCode: 'sales_base',
            title: 'Переговоры',
            order: 1,
            total: 3,
        });
    });
});
