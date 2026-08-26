import { describe, expect, it } from 'vitest';
import { isPlanDeadlineValid, toPlanDeadline } from './plan-deadline';

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
