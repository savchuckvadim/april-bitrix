import { describe, expect, it } from 'vitest';
import {
    COMMENT_ROWS,
    countReportCards,
    getReportDensity,
} from './report-density';

describe('getReportDensity', () => {
    it('обычный день — только пульт: комментарию вся вертикаль', () => {
        expect(getReportDensity({ withPult: true })).toBe('roomy');
        expect(getReportDensity({})).toBe('roomy');
    });

    it('пара соседей — средняя высота', () => {
        expect(getReportDensity({ withPult: true, withContact: true })).toBe(
            'normal',
        );
    });

    it('полный отчёт — комментарий ужимается', () => {
        expect(
            getReportDensity({
                withPult: true,
                withContact: true,
                withRequest: true,
                withSale: true,
                withRecords: true,
            }),
        ).toBe('dense');
    });

    it('считает именно карточки, а не флаги', () => {
        expect(countReportCards({ withPult: true, withSale: false })).toBe(1);
    });

    it('чем теснее, тем меньше строк — и никогда меньше четырёх', () => {
        expect(COMMENT_ROWS.roomy).toBeGreaterThan(COMMENT_ROWS.normal);
        expect(COMMENT_ROWS.normal).toBeGreaterThan(COMMENT_ROWS.dense);
        expect(COMMENT_ROWS.dense).toBeGreaterThanOrEqual(4);
    });
});
