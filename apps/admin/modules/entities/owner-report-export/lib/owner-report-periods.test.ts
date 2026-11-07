import { describe, expect, it } from 'vitest';
import { closedMonthOptions, fileSizeText } from './owner-report-periods';

describe('closedMonthOptions', () => {
    it('без текущего месяца, новые первыми, через границу года', () => {
        const options = closedMonthOptions(new Date(2026, 0, 15), 3);
        expect(options).toEqual([
            { value: '2025-12', label: 'Декабрь 2025' },
            { value: '2025-11', label: 'Ноябрь 2025' },
            { value: '2025-10', label: 'Октябрь 2025' },
        ]);
    });

    it('7 ноября 2026 — первым идёт октябрь', () => {
        expect(closedMonthOptions(new Date(2026, 10, 7), 1)).toEqual([
            { value: '2026-10', label: 'Октябрь 2026' },
        ]);
    });
});

describe('fileSizeText', () => {
    it('КБ и МБ по-русски, пусто — прочерк', () => {
        expect(fileSizeText(88_000)).toBe('86 КБ');
        expect(fileSizeText(1_300_000)).toBe('1,2 МБ');
        expect(fileSizeText(null)).toBe('—');
    });
});
