import { describe, expect, it } from 'vitest';
import type { IBXListItem } from '@workspace/bitrix';
import type { PBXFieldItem } from '@workspace/pbx';
import { mapHistoryElement, parseCrmDate } from './map-history-item';
import { HistoryListRef } from './history-list';

const item = (bitrixId: number, code: string, name: string): PBXFieldItem =>
    ({ bitrixId, code, name, title: name }) as unknown as PBXFieldItem;

const ref: HistoryListRef = {
    iblockId: 42,
    properties: {
        eventDate: { key: 'PROPERTY_100', items: [] },
        eventTitle: { key: 'PROPERTY_101', items: [] },
        comment: { key: 'PROPERTY_102', items: [] },
        responsible: { key: 'PROPERTY_103', items: [] },
        crm: { key: 'PROPERTY_104', items: [] },
        eventType: {
            key: 'PROPERTY_105',
            items: [item(11, 'xo', 'Холодный звонок'), item(12, 'call', 'Звонок')],
        },
        eventAction: {
            key: 'PROPERTY_106',
            items: [item(21, 'done', 'Состоялся')],
        },
        resultStatus: {
            key: 'PROPERTY_107',
            items: [item(31, 'op_call_result_yes', 'Да')],
        },
    },
};

const element = {
    ID: '7001',
    NAME: 'Событие',
    DATE_CREATE: '01.01.2026 09:00:00',
    // Битрикс отдаёт значения свойств мапами — и одиночные тоже.
    PROPERTY_100: { '1': '05.08.2026 14:30:00' },
    PROPERTY_101: { '2': 'Звонок по оплате' },
    PROPERTY_102: { '3': 'Договорились о счёте' },
    PROPERTY_103: { '4': '447' },
    PROPERTY_104: { '5': 'CO_431', '6': 'l_318051' },
    PROPERTY_105: { '7': '11' },
    PROPERTY_106: { '8': '21' },
    PROPERTY_107: { '9': '31' },
} as unknown as IBXListItem;

describe('mapHistoryElement', () => {
    it('маппит скаляры, enum-итемы по bitrixId и нормализует привязки', () => {
        const record = mapHistoryElement(element, ref);
        expect(record.id).toBe(7001);
        expect(record.title).toBe('Звонок по оплате');
        expect(record.comment).toBe('Договорились о счёте');
        expect(record.date).toBe('05.08.2026 14:30:00');
        expect(record.responsibleId).toBe(447);
        expect(record.eventType).toEqual({ code: 'xo', name: 'Холодный звонок' });
        expect(record.eventAction).toEqual({ code: 'done', name: 'Состоялся' });
        expect(record.resultStatus).toEqual({
            code: 'op_call_result_yes',
            name: 'Да',
        });
        // Привязки — верхним регистром, порядок сохранён.
        expect(record.bindings).toEqual(['CO_431', 'L_318051']);
    });

    it('без event_date падает на DATE_CREATE; неизвестный enum отдаёт сырое значение', () => {
        const bare = {
            ID: 5,
            NAME: 'Без свойств',
            DATE_CREATE: '01.01.2026 09:00:00',
            PROPERTY_105: { '1': '999' },
        } as unknown as IBXListItem;
        const record = mapHistoryElement(bare, ref);
        expect(record.title).toBe('Без свойств');
        expect(record.date).toBe('01.01.2026 09:00:00');
        expect(record.eventType).toEqual({ code: '999', name: '999' });
        expect(record.bindings).toEqual([]);
    });
});

describe('parseCrmDate', () => {
    it('разбирает DD.MM.YYYY HH:mm:ss и держит сортировку', () => {
        const early = parseCrmDate('05.08.2026 14:30:00');
        const later = parseCrmDate('06.08.2026 09:00:00');
        expect(early).not.toBeNull();
        expect(later).not.toBeNull();
        expect(later! > early!).toBe(true);
    });

    it('дата без времени и мусор', () => {
        expect(parseCrmDate('05.08.2026')).not.toBeNull();
        expect(parseCrmDate('не дата')).toBeNull();
    });
});
