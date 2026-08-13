import { describe, expect, it } from 'vitest';
import { getEventTypeLabel, getIsRequestEvent } from './event-request-type';

describe('getIsRequestEvent', () => {
    it('холодное с привязанным лидом — заявка', () => {
        expect(
            getIsRequestEvent({ eventType: 'xo', ufCrmTask: ['L_337065'] }),
        ).toBe(true);
    });

    it('холодное без лида остаётся холодным обзвоном', () => {
        expect(
            getIsRequestEvent({ eventType: 'xo', ufCrmTask: ['CO_431'] }),
        ).toBe(false);
        expect(getIsRequestEvent({ eventType: 'xo' })).toBe(false);
    });

    it('другие типы заявкой не становятся', () => {
        expect(
            getIsRequestEvent({
                eventType: 'presentation',
                ufCrmTask: ['L_1'],
            }),
        ).toBe(false);
    });
});

describe('getEventTypeLabel', () => {
    it('подписывает заявку своим словом', () => {
        expect(
            getEventTypeLabel({
                eventType: 'xo',
                type: 'Холодный',
                ufCrmTask: ['L_7'],
            }),
        ).toBe('Заявка');
    });

    it('остальным ничего не меняет', () => {
        expect(
            getEventTypeLabel({
                eventType: 'xo',
                type: 'Холодный',
                ufCrmTask: [],
            }),
        ).toBe('Холодный');
    });
});
