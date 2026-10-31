import { describe, expect, it } from 'vitest';
import type { PortalRegion } from '../model';
import {
    ownPriceLabel,
    toSourceOptions,
    withoutRegion,
} from './region-view.util';

const region = (over: Partial<PortalRegion>): PortalRegion =>
    ({
        id: '1',
        title: 'Алтайский край',
        code: 'ad',
        abs: 3481,
        own_abs: null,
        own_abs_region_title: null,
        ...over,
    }) as PortalRegion;

describe('варианты региона-источника', () => {
    it('подпись справа — общий рабс, код участвует в поиске', () => {
        expect(toSourceOptions([region({})])).toEqual([
            {
                value: '1',
                label: 'Алтайский край',
                hint: '3481',
                keywords: ['ad'],
            },
        ]);
    });

    it('сам регион из вариантов убирается', () => {
        const options = toSourceOptions([region({}), region({ id: '2' })]);

        expect(withoutRegion(options, 1).map(item => item.value)).toEqual(['2']);
    });
});

describe('подпись своей цены', () => {
    it('источник, ручной рабс или «не задан»', () => {
        expect(
            ownPriceLabel(
                region({ own_abs_region_title: 'Ленинградская область' }),
            ),
        ).toBe('как у региона: Ленинградская область');
        expect(ownPriceLabel(region({ own_abs: 5000 }))).toBe('5000');
        expect(ownPriceLabel(region({}))).toBe('не задан');
    });
});
