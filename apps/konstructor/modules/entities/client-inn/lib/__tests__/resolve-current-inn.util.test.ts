import { describe, expect, it } from 'vitest';
import { resolveCurrentInn } from '../resolve-current-inn.util';

describe('resolveCurrentInn', () => {
    it('ИНН текущего реквизита ведёт, даже когда в компании записан другой', () => {
        expect(
            resolveCurrentInn({
                requisiteInn: ' 5001007329 ',
                companyInn: '7707083893',
                hasInnField: true,
            }),
        ).toEqual({ value: '5001007329', source: 'requisite' });
    });

    it('реквизита или его ИНН нет — ИНН компании', () => {
        expect(
            resolveCurrentInn({ requisiteInn: null, companyInn: '7707083893', hasInnField: true }),
        ).toEqual({ value: '7707083893', source: 'company' });
        expect(
            resolveCurrentInn({ requisiteInn: '  ', companyInn: '7707083893', hasInnField: true }),
        ).toEqual({ value: '7707083893', source: 'company' });
    });

    it('нигде нет: поле на портале есть — «не заполнен», поля нет — шапка молчит', () => {
        expect(
            resolveCurrentInn({ requisiteInn: null, companyInn: null, hasInnField: true }),
        ).toEqual({ value: null, source: null });
        expect(
            resolveCurrentInn({ requisiteInn: null, companyInn: null, hasInnField: false }),
        ).toEqual({ value: undefined, source: null });
    });

    it('реквизит с ИНН показывается и там, где поля op_inn на портале нет', () => {
        expect(
            resolveCurrentInn({ requisiteInn: '5001007329', companyInn: null, hasInnField: false })
                .value,
        ).toBe('5001007329');
    });
});
