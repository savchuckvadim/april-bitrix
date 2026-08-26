import { describe, expect, it } from 'vitest';
import {
    parseCrmDate,
    toCrmDate,
    toCrmDateTime,
    toDateInputValue,
    toDateTimeInputValue,
    toHumanDate,
    toHumanDateTime,
} from './crm-date';

describe('crm-date: разбор диалектов портала', () => {
    it('ISO из контрола и из ответа REST', () => {
        expect(parseCrmDate('2026-08-26')).toEqual({
            year: 2026,
            month: 8,
            day: 26,
            hours: 0,
            minutes: 0,
            seconds: 0,
        });
        expect(parseCrmDate('2026-08-26T15:04')).toMatchObject({
            hours: 15,
            minutes: 4,
            seconds: 0,
        });
        expect(parseCrmDate('2026-08-26T03:00:00+03:00')).toMatchObject({
            day: 26,
            hours: 3,
        });
    });

    it('CRM-строка портала', () => {
        expect(parseCrmDate('26.08.2026 15:04:05')).toEqual({
            year: 2026,
            month: 8,
            day: 26,
            hours: 15,
            minutes: 4,
            seconds: 5,
        });
        expect(parseCrmDate('26.08.2026')).toMatchObject({ day: 26, hours: 0 });
    });

    it('пустое и мусорное — null', () => {
        expect(parseCrmDate('')).toBeNull();
        expect(parseCrmDate('   ')).toBeNull();
        expect(parseCrmDate('2026-08')).toBeNull();
        expect(parseCrmDate(null)).toBeNull();
        expect(parseCrmDate(undefined)).toBeNull();
        expect(parseCrmDate(1234)).toBeNull();
    });

    it('несуществующие месяц/день/время — null', () => {
        expect(parseCrmDate('2026-13-01')).toBeNull();
        expect(parseCrmDate('2026-00-10')).toBeNull();
        expect(parseCrmDate('2026-08-26T25:00')).toBeNull();
    });
});

describe('crm-date: запись в портал', () => {
    it('date-поле — DD.MM.YYYY', () => {
        expect(toCrmDate('2026-08-26')).toBe('26.08.2026');
        expect(toCrmDate('2026-08-26T15:04')).toBe('26.08.2026');
        expect(toCrmDate('26.08.2026 15:04:05')).toBe('26.08.2026');
        expect(toCrmDate('')).toBeNull();
    });

    it('datetime-поле — DD.MM.YYYY HH:mm:ss (канон BitrixDateTime)', () => {
        expect(toCrmDateTime('2026-08-26T15:04')).toBe('26.08.2026 15:04:00');
        expect(toCrmDateTime('2026-08-26')).toBe('26.08.2026 00:00:00');
        expect(toCrmDateTime('26.08.2026 15:04:05')).toBe(
            '26.08.2026 15:04:05',
        );
        expect(toCrmDateTime('чушь')).toBeNull();
    });

    it('полночь не уезжает на сутки (лексический разбор, не new Date)', () => {
        expect(toCrmDateTime('2026-01-01T00:00')).toBe('01.01.2026 00:00:00');
        expect(toCrmDate('2026-01-01')).toBe('01.01.2026');
    });
});

describe('crm-date: чтение в контролы', () => {
    it('date-контрол принимает оба диалекта', () => {
        expect(toDateInputValue('26.08.2026 15:04:05')).toBe('2026-08-26');
        expect(toDateInputValue('2026-08-26T03:00:00+03:00')).toBe(
            '2026-08-26',
        );
        expect(toDateInputValue('')).toBe('');
    });

    it('datetime-контрол сохраняет время', () => {
        expect(toDateTimeInputValue('26.08.2026 15:04:05')).toBe(
            '2026-08-26T15:04',
        );
        expect(toDateTimeInputValue('2026-08-26')).toBe('2026-08-26T00:00');
        expect(toDateTimeInputValue('мусор')).toBe('');
    });

    it('человекочитаемые подписи', () => {
        expect(toHumanDate('2026-08-26T15:04')).toBe('26.08.2026');
        expect(toHumanDateTime('2026-08-26T15:04')).toBe('26.08.2026 15:04');
        expect(toHumanDateTime('')).toBe('');
    });
});
