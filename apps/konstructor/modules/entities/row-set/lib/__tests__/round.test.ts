import { describe, expect, it } from 'vitest';
import { round2 } from '../round.util';

/**
 * Паритет округления с легаси: `parseFloat(x.toFixed(2))` (row-price-utils,
 * documentPrice). Math.round(x*100)/100 на половинках копейки давал бы
 * другой результат — цены слепков обязаны совпадать до копейки.
 */
describe('round2 — как легаси toFixed(2)', () => {
    it('обычные значения', () => {
        expect(round2(8187)).toBe(8187);
        expect(round2(78595.2)).toBe(78595.2);
        expect(round2(8187 * 1.05)).toBe(8596.35);
        expect(round2(1 / 3)).toBe(0.33);
        expect(round2(-1.005)).toBe(-1);
    });

    it('половинки копейки — по toFixed, не по Math.round', () => {
        for (const value of [2.675, 1.115, 10.235, 4999.995, 0.015, 0.045]) {
            expect(round2(value)).toBe(Number(value.toFixed(2)));
        }
        expect(round2(2.675)).toBe(2.67);
        expect(round2(4999.995)).toBe(4999.99);
    });
});
