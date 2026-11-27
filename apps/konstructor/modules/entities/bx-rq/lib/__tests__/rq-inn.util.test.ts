import { describe, expect, it } from 'vitest';
import { CONTRACT_RQ_GROUP, RQ_TYPE, type RqRecord } from '../../model/types';
import { getRqInn } from '../rq-inn.util';

const record = (bx_id: number, inn: string): RqRecord => ({
    bx_id,
    preset_id: 2,
    type: RQ_TYPE.ORGANIZATION,
    fields: [
        {
            type: 'string',
            name: 'ИНН',
            value: inn,
            code: 'inn',
            isRequired: false,
            includes: [RQ_TYPE.ORGANIZATION],
            group: CONTRACT_RQ_GROUP.RQ,
            isActive: true,
            isDisable: false,
            order: 1,
        },
    ],
    address: { items: [], current: null },
    bank: { items: [], current: null, fields: [] },
});

describe('getRqInn', () => {
    it('ИНН сохранённого реквизита без пробелов', () => {
        expect(getRqInn(record(5, ' 7707083893 '))).toBe('7707083893');
    });

    it('шаблон, пустой ИНН и отсутствие реквизита дают null', () => {
        expect(getRqInn(record(-1, '7707083893'))).toBeNull();
        expect(getRqInn(record(5, '  '))).toBeNull();
        expect(getRqInn(null)).toBeNull();
    });
});
