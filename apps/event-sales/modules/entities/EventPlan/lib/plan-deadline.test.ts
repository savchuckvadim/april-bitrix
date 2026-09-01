import { describe, expect, it } from 'vitest';
import { isPlanDeadlineValid, toPlanDeadline,
    toPlanControlValue,
} from './plan-deadline';

describe('срок плана', () => {
    it('строка контрола валидна и превращается в дедлайн задачи', () => {
        expect(isPlanDeadlineValid('2026-08-26 15:04')).toBe(true);
        expect(toPlanDeadline('2026-08-26 15:04')).toBe('26.08.2026 15:04:00');
    });

    it('ISO дедлайна задачи (перенос) тоже валиден', () => {
        expect(isPlanDeadlineValid('2026-08-26T03:00:00+03:00')).toBe(true);
        expect(toPlanDeadline('2026-08-26T03:00:00+03:00')).toBe(
            '26.08.2026 03:00:00',
        );
    });

    it('пусто и мусор — невалидно, дедлайн пустой (а не исключение)', () => {
        for (const raw of ['', '   ', 'завтра', '2026-08', null, undefined]) {
            expect(isPlanDeadlineValid(raw)).toBe(false);
            expect(toPlanDeadline(raw)).toBe('');
        }
    });

    it('несуществующая дата не считается сроком', () => {
        expect(isPlanDeadlineValid('2026-13-40 15:04')).toBe(false);
    });
});

describe('toPlanControlValue', () => {
    it('ISO с оффсетом → формат контрола, настенное время без сдвига', () => {
        expect(toPlanControlValue('2026-08-31T06:51:00+02:00')).toBe(
            '2026-08-31 06:51',
        );
    });

    it('CRM-строка портала → формат контрола', () => {
        expect(toPlanControlValue('31.08.2026 06:51:00')).toBe(
            '2026-08-31 06:51',
        );
    });

    it('строка контрола проходит как есть', () => {
        expect(toPlanControlValue('2026-08-31 06:51')).toBe('2026-08-31 06:51');
    });

    it('мусор и пустота → пустая строка (контрол покажет пусто)', () => {
        expect(toPlanControlValue('мусор')).toBe('');
        expect(toPlanControlValue(null)).toBe('');
        expect(toPlanControlValue(undefined)).toBe('');
    });
});
