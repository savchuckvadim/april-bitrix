import { describe, expect, it } from 'vitest';
import {
    isValidAuditMonths,
    isValidProbeMonths,
    parseAuditMonths,
} from './audit-months.util';

describe('parseAuditMonths: значение поля → число', () => {
    it('число как есть, пустая строка и мусор — NaN', () => {
        expect(parseAuditMonths('12')).toBe(12);
        expect(parseAuditMonths(' 6 ')).toBe(6);
        expect(parseAuditMonths('')).toBeNaN();
        expect(parseAuditMonths('   ')).toBeNaN();
        expect(parseAuditMonths('abc')).toBeNaN();
    });
});

describe('isValidAuditMonths: окно аудита 1–24', () => {
    it('границы включительно, вне границ и дроби — нет', () => {
        expect(isValidAuditMonths(1)).toBe(true);
        expect(isValidAuditMonths(24)).toBe(true);
        expect(isValidAuditMonths(0)).toBe(false);
        expect(isValidAuditMonths(25)).toBe(false);
        expect(isValidAuditMonths(6.5)).toBe(false);
        expect(isValidAuditMonths(Number.NaN)).toBe(false);
    });
});

describe('isValidProbeMonths: окно пробы истории стадий 1–36', () => {
    it('границы включительно, 36 — ещё можно, 37 — уже нет', () => {
        expect(isValidProbeMonths(1)).toBe(true);
        expect(isValidProbeMonths(12)).toBe(true);
        expect(isValidProbeMonths(36)).toBe(true);
        expect(isValidProbeMonths(0)).toBe(false);
        expect(isValidProbeMonths(37)).toBe(false);
        expect(isValidProbeMonths(12.5)).toBe(false);
        expect(isValidProbeMonths(Number.NaN)).toBe(false);
    });
});
