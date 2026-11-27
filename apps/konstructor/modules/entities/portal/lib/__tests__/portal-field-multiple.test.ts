import { describe, expect, it } from 'vitest';
import { isPortalFieldMultiple } from '../portal-util';
import type { Portal } from '../../model/dto';

/** Множественное ли поле на портале: по типу поля pbx-установки */
const portalWith = (parts: { dealFields?: object[]; smartFields?: object[] }): Portal =>
    ({
        bitrixDeal: { bitrixfields: parts.dealFields ?? [], categories: [] },
        smarts: [{ type: 'service_offer', bitrixfields: parts.smartFields ?? [] }],
    }) as unknown as Portal;

describe('isPortalFieldMultiple', () => {
    it('поле сделки типа multiple — множественное', () => {
        const portal = portalWith({
            dealFields: [
                { code: 'npa', type: 'multiple' },
                { code: 'la', type: 'string' },
            ],
        });
        expect(isPortalFieldMultiple(portal, 'npa')).toBe(true);
        expect(isPortalFieldMultiple(portal, 'la')).toBe(false);
    });

    it('поле смарта «Предложение на будущий период» ищется в смарте, не в сделке', () => {
        const portal = portalWith({
            dealFields: [{ code: 'npa', type: 'string' }],
            smartFields: [{ code: 'npa', type: 'multiple' }],
        });
        expect(isPortalFieldMultiple(portal, 'npa', 'deal')).toBe(false);
        expect(isPortalFieldMultiple(portal, 'npa', 'service_offer')).toBe(true);
    });

    it('нет поля, слепка или смарта — не множественное', () => {
        expect(isPortalFieldMultiple(null, 'npa')).toBe(false);
        expect(isPortalFieldMultiple(portalWith({}), 'npa')).toBe(false);
        expect(isPortalFieldMultiple({ bitrixDeal: null, smarts: [] } as unknown as Portal, 'npa', 'service_offer')).toBe(
            false,
        );
    });
});
