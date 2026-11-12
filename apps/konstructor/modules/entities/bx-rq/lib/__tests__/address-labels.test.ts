import { describe, expect, it } from 'vitest';
import {
    BX_ADDRESS_TYPE,
    CONTRACT_RQ_GROUP,
    RQ_TYPE,
    type AddressRqItem,
    type RqItem,
    type RqRecord,
} from '../../model/types';
import { addressTitle } from '../address-util';
import { validatePushRq } from '../field-items-util';

const field = (code: string, value: string): RqItem => ({
    type: 'string',
    name: code,
    value,
    code,
    isRequired: false,
    includes: [RQ_TYPE.ORGANIZATION, RQ_TYPE.IP, RQ_TYPE.FIZ],
    group: CONTRACT_RQ_GROUP.ADDRESS,
    isActive: true,
    isDisable: false,
    order: 1,
});

const address = (type_id: BX_ADDRESS_TYPE): AddressRqItem => ({
    anchor_id: 1,
    type_id,
    name_type: '',
    fields: [
        field('address_country', 'Россия'),
        field('address_city', ''),
        field('address_1', 'ул. Ленина, 1'),
        field('address_postal_code', ''),
    ],
});

const fizRecord = (): RqRecord => ({
    bx_id: 1,
    preset_id: 6,
    type: RQ_TYPE.FIZ,
    fields: [],
    address: {
        items: [address(BX_ADDRESS_TYPE.REGISTERED), address(BX_ADDRESS_TYPE.PRIMARY)],
        current: null,
    },
    bank: { items: [], current: null, fields: [] },
});

describe('адреса: только фактический и юридический (12.11.2026)', () => {
    it('подписи не зависят от типа клиента — «Адреса прописки» нет', () => {
        expect(addressTitle(BX_ADDRESS_TYPE.REGISTERED)).toBe('Юридический адрес');
        expect(addressTitle(BX_ADDRESS_TYPE.PRIMARY)).toBe('Фактический адрес');
    });

    it('у физлица недостающее в адресах подписано как юридический/фактический, индекс не требуется', () => {
        const gaps = validatePushRq(RQ_TYPE.FIZ, fizRecord());

        expect(gaps).toEqual(['Юридический адрес: address_city', 'Фактический адрес: address_city']);
        expect(gaps.join(' ')).not.toMatch(/прописк/i);
    });
});
