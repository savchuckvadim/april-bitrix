import { describe, expect, it } from 'vitest';
import {
    addSource,
    dealContactIds,
    leadContactId,
    relatedLeadIds,
    uniqueIds,
    type ContactSourceMap,
} from './contact-sources';

describe('dealContactIds', () => {
    it('берёт основной контакт и множественный список', () => {
        expect(
            dealContactIds({ CONTACT_ID: '11', CONTACT_IDS: ['11', 12, 0] }),
        ).toEqual([11, 12]);
    });

    it('сделка без контактов — пусто', () => {
        expect(dealContactIds({ CONTACT_ID: '0' })).toEqual([]);
        expect(dealContactIds(null)).toEqual([]);
    });
});

describe('leadContactId', () => {
    it('читает контакт лида, «0» считает отсутствием', () => {
        expect(leadContactId({ CONTACT_ID: '42' })).toBe(42);
        expect(leadContactId({ CONTACT_ID: '0' })).toBeNull();
        expect(leadContactId(null)).toBeNull();
    });
});

describe('relatedLeadIds', () => {
    it('берёт лид сделки и привязки задачи', () => {
        expect(
            relatedLeadIds({
                deal: { LEAD_ID: '7' },
                taskLeadIds: [7, 8],
            }),
        ).toEqual([7, 8]);
    });

    it('текущий лид исключает — он отдельный источник', () => {
        expect(
            relatedLeadIds({
                deal: { LEAD_ID: '7' },
                lead: { ID: 7 },
                taskLeadIds: [9],
            }),
        ).toEqual([9]);
    });

    it('связей нет — пусто', () => {
        expect(relatedLeadIds({})).toEqual([]);
    });
});

describe('uniqueIds / addSource', () => {
    it('чистит нули и повторы, порядок сохраняет', () => {
        expect(uniqueIds([3, 0, 3, null, 1, undefined])).toEqual([3, 1]);
    });

    it('один контакт может прийти из двух связей — помним обе', () => {
        const map: ContactSourceMap = {};
        addSource(map, 'company', [5]);
        addSource(map, 'lead', [5, 6]);
        addSource(map, 'lead', [5]);
        expect(map[5]).toEqual(['company', 'lead']);
        expect(map[6]).toEqual(['lead']);
    });
});
