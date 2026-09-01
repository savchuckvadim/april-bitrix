import { describe, expect, it } from 'vitest';
import { deferredStepKey } from './deferred-helper';

/**
 * Ключ шага — язык, на котором сервер отвечает, что осталось неисполненным
 * (`pending`). Разойдись он с серверным — конверт либо потерял бы
 * неисполненный шаг, либо вечно держал бы исполненный.
 */
describe('deferredStepKey', () => {
    it('обычный шаг адресуется своим kind', () => {
        expect(deferredStepKey({ kind: 'kpi' })).toBe('kpi');
        expect(deferredStepKey({ kind: 'pres-deals' })).toBe('pres-deals');
        expect(deferredStepKey({ kind: 'lead-request-sync' })).toBe(
            'lead-request-sync',
        );
    });

    it('сайд-flow различается потоком: у ЗПР и презентаций свои шаги', () => {
        const zpr = deferredStepKey({
            kind: 'side-flow',
            flow: 'zpr',
            addedTaskId: 42,
            createdPresDealId: null,
        });
        const pres = deferredStepKey({
            kind: 'side-flow',
            flow: 'pres',
            addedTaskId: 42,
            createdPresDealId: 1024,
        });

        expect(zpr).toBe('side-flow:zpr');
        expect(pres).toBe('side-flow:pres');
        expect(zpr).not.toBe(pres);
    });
});
