import { describe, expect, it } from 'vitest';
import {
    analysisHistoryMonths,
    availableExportKinds,
    closedMonthOptions,
    closedPeriodOptions,
    fileSizeText,
} from './owner-report-periods';

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

describe('closedPeriodOptions — кварталы, полугодия, годы', () => {
    const november = new Date(2026, 10, 7);

    it('кварталы: идущий не закрыт, через границу года', () => {
        expect(closedPeriodOptions('quarter', november, 4)).toEqual([
            { value: '2026-Q3', label: '3 квартал 2026' },
            { value: '2026-Q2', label: '2 квартал 2026' },
            { value: '2026-Q1', label: '1 квартал 2026' },
            { value: '2025-Q4', label: '4 квартал 2025' },
        ]);
        expect(closedPeriodOptions('quarter', new Date(2026, 1, 1), 1)).toEqual([
            { value: '2025-Q4', label: '4 квартал 2025' },
        ]);
    });

    it('полугодия: идущее не закрыто', () => {
        expect(closedPeriodOptions('half_year', november, 2)).toEqual([
            { value: '2026-H1', label: '1 полугодие 2026' },
            { value: '2025-H2', label: '2 полугодие 2025' },
        ]);
        expect(closedPeriodOptions('half_year', new Date(2026, 2, 1), 1)).toEqual([
            { value: '2025-H2', label: '2 полугодие 2025' },
        ]);
    });

    it('годы: текущий не закрыт; месяц — как closedMonthOptions; count по виду', () => {
        expect(closedPeriodOptions('year', november, 2)).toEqual([
            { value: '2025', label: '2025 год' },
            { value: '2024', label: '2024 год' },
        ]);
        expect(closedPeriodOptions('month', november, 1)).toEqual(
            closedMonthOptions(november, 1),
        );
        expect(closedPeriodOptions('quarter', november)).toHaveLength(4);
    });
});

describe('availableExportKinds — виды периода по истории разборов', () => {
    const november = new Date(2026, 10, 7);

    it('месяцев истории — по номерам месяцев; без даты — ноль', () => {
        expect(analysisHistoryMonths('2026-08-15', november)).toBe(3);
        expect(analysisHistoryMonths('2025-11-01', november)).toBe(12);
        expect(analysisHistoryMonths(null, november)).toBe(0);
        expect(analysisHistoryMonths('мусор', november)).toBe(0);
    });

    it('месяц всегда; квартал с трёх месяцев, полугодие с шести, год с двенадцати', () => {
        expect(availableExportKinds(null, november)).toEqual(['month']);
        expect(availableExportKinds('2026-09-01', november)).toEqual(['month']);
        expect(availableExportKinds('2026-08-15', november)).toEqual([
            'month',
            'quarter',
        ]);
        expect(availableExportKinds('2026-05-01', november)).toEqual([
            'month',
            'quarter',
            'half_year',
        ]);
        expect(availableExportKinds('2025-10-01', november)).toEqual([
            'month',
            'quarter',
            'half_year',
            'year',
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
