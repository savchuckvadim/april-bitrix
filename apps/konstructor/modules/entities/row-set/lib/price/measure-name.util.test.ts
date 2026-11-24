import { describe, expect, it } from 'vitest';
import { measureNameOf } from './measure-name.util';

const saved = { measure: { id: 18, code: 35, name: 'Лицензия 6 месяцев', type: 6 } };

describe('measureNameOf', () => {
    it('единица из справочника побеждает сохранённую в строке', () => {
        const contract = { measure: { id: 18, code: 35, name: 'лиц. 6 мес.', fullName: 'Лицензия 6 месяцев' } };
        expect(measureNameOf(saved, contract)).toBe('лиц. 6 мес.');
    });

    it('договора в справочнике нет — сохранённая единица', () => {
        expect(measureNameOf(saved, undefined)).toBe('Лицензия 6 месяцев');
        expect(measureNameOf(saved, null)).toBe('Лицензия 6 месяцев');
    });
});
