import { describe, expect, it } from 'vitest';
import {
    FINANCE_PERIOD_CAPTION_HINT,
    FINANCE_PERIOD_CAPTION_RULE,
    formatFinanceDay,
    formatFinancePeriodCaption,
} from '../lib/period-caption.util';

describe('period-caption.util — подпись периода закрытых продаж', () => {
    it('«за ДД.ММ–ДД.ММ, по дате закрытия сделки»; без дат — только правило', () => {
        expect(formatFinancePeriodCaption('2026-04-27', '2026-07-26')).toBe(
            'за 27.04–26.07, по дате закрытия сделки',
        );
        expect(formatFinancePeriodCaption('', '2026-07-26')).toBe(
            FINANCE_PERIOD_CAPTION_RULE,
        );
        expect(formatFinancePeriodCaption(null, undefined)).toBe(
            FINANCE_PERIOD_CAPTION_RULE,
        );
        expect(formatFinanceDay('мусор')).toBe('мусор');
    });

    it('подсказка объясняет, какие сделки считаем, и как сравнить с AI', () => {
        expect(FINANCE_PERIOD_CAPTION_HINT.lines.join(' ')).toContain(
            'по дате закрытия',
        );
        expect(FINANCE_PERIOD_CAPTION_HINT.lines.join(' ')).toContain(
            'одинаковые даты',
        );
        for (const line of FINANCE_PERIOD_CAPTION_HINT.lines) {
            expect(line).not.toMatch(/[→×≥≤]|админк/i);
        }
    });
});
