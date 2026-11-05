import { describe, expect, it } from 'vitest';
import { bxrqActions, bxrqReducer, type BXRQState } from '../../model/BxRqSlice';
import { CONTRACT_RQ_GROUP, RQ_TYPE, type RqRecord, type RqItem } from '../../model/types';
import { fromBundleDto } from '../adapters/rq-dto.adapter';
import type { RqBundleDto, RqRecordDto } from '../../model/dto';

const field = (code: string, value: string, includes: RQ_TYPE[] = [RQ_TYPE.ORGANIZATION]): RqItem => ({
    type: 'string',
    name: code,
    value,
    code,
    isRequired: false,
    includes,
    group: CONTRACT_RQ_GROUP.RQ,
    isActive: true,
    isDisable: false,
    order: 1,
});

const record = (bx_id: number, inn: string): RqRecord => ({
    bx_id,
    preset_id: 2,
    type: RQ_TYPE.ORGANIZATION,
    fields: [field('inn', inn), field('docSer', '', [RQ_TYPE.FIZ])],
    address: { items: [], current: null },
    bank: { items: [], current: { id: -1, fields: [field('bank_name', '')] }, fields: [] },
});

const stateWith = (items: RqRecord[]): BXRQState => {
    const template = record(-1, '');
    const initial = bxrqReducer(undefined, { type: 'init' });
    return {
        ...initial,
        rqs: {
            [RQ_TYPE.ORGANIZATION]: { items, default: template },
            [RQ_TYPE.IP]: { items: [], default: { ...template, type: RQ_TYPE.IP, preset_id: 4 } },
            [RQ_TYPE.FIZ]: { items: [], default: { ...template, type: RQ_TYPE.FIZ, preset_id: 6 } },
            current: items[0] ?? null,
        },
        current: { items: items.length ? items : [template], item: items[0] ?? template },
    };
};

describe('bxrq: новый реквизит', () => {
    it('startNewRecord: черновик из шаблона типа, поля только этого типа, bx_id -1', () => {
        const state = bxrqReducer(
            stateWith([record(77, '7701')]),
            bxrqActions.startNewRecord({ clientType: RQ_TYPE.BUDGET }),
        );
        expect(state.creating.base?.bx_id).toBe(-1);
        expect(state.creating.base?.type).toBe(RQ_TYPE.ORGANIZATION);
        expect(state.creating.base?.preset_id).toBe(2);
        expect(state.creating.base?.fields.map(item => item.code)).toEqual(['inn']);
        // существующий реквизит остаётся текущим, пока новый не сохранён
        expect(state.current.item?.bx_id).toBe(77);
    });

    it('saveBaseCreating: новый добавляется к существующим и становится текущим', () => {
        const start = bxrqReducer(
            stateWith([record(77, '7701')]),
            bxrqActions.startNewRecord({ clientType: RQ_TYPE.ORGANIZATION }),
        );
        const saved = record(501, '7702');
        const state = bxrqReducer(
            start,
            bxrqActions.saveBaseCreating({ item: saved, clientType: RQ_TYPE.ORGANIZATION }),
        );
        expect(state.current.items.map(item => item.bx_id)).toEqual([77, 501]);
        expect(state.current.item?.bx_id).toBe(501);
        expect(state.rqs?.[RQ_TYPE.ORGANIZATION].items.map(item => item.bx_id)).toEqual([77, 501]);
        expect(state.creating.base).toBeNull();
    });

    it('saveBaseCreating: первый реквизит типа вытесняет заготовку из списка', () => {
        const state = bxrqReducer(
            stateWith([]),
            bxrqActions.saveBaseCreating({ item: record(501, '7702'), clientType: RQ_TYPE.ORGANIZATION }),
        );
        expect(state.current.items.map(item => item.bx_id)).toEqual([501]);
    });

    it('saveBaseCreating: существующий заменяется на месте', () => {
        const state = bxrqReducer(
            stateWith([record(77, '7701'), record(78, '7703')]),
            bxrqActions.saveBaseCreating({ item: record(77, '9999'), clientType: RQ_TYPE.ORGANIZATION }),
        );
        expect(state.current.items.map(item => item.bx_id)).toEqual([77, 78]);
        expect(state.current.items[0]?.fields[0]?.value).toBe('9999');
    });
});

describe('адаптер: шаблон без default от бэка', () => {
    const dtoField = (code: string, value: string): RqRecordDto['fields'][number] => ({
        type: 'string',
        name: code,
        value,
        code,
        isRequired: false,
        includes: ['org'],
        isActive: true,
        order: 1,
    });
    const dtoRecord = (bx_id: number): RqRecordDto => ({
        bx_id,
        preset_id: 2,
        type: 'org',
        fields: [dtoField('inn', '7701')],
        address: {
            items: [
                {
                    anchor_id: 353,
                    type_id: 6,
                    name_type: 'Юридический адрес',
                    fields: [dtoField('address_city', 'Москва')],
                },
            ],
        },
        bank: { items: [{ id: 5, fields: [dtoField('bank_name', 'Сбер')] }] },
    });

    it('из существующего реквизита с очищенными значениями, адресами и банком-заготовкой', () => {
        const bundle = fromBundleDto({
            org: { items: [dtoRecord(77)], default: null },
            ip: { items: [], default: null },
            fiz: { items: [], default: null },
            current: null,
        } as unknown as RqBundleDto);
        const template = bundle[RQ_TYPE.ORGANIZATION].default;
        expect(template.bx_id).toBe(-1);
        expect(template.fields[0]).toMatchObject({ code: 'inn', value: '' });
        expect(template.address.items[0]).toMatchObject({ anchor_id: -1 });
        expect(template.address.items[0]?.fields[0]).toMatchObject({ value: '' });
        expect(template.bank.current).toMatchObject({ id: -1 });
        expect(template.bank.current?.fields[0]).toMatchObject({ code: 'bank_name', value: '' });
        // настоящий реквизит не тронут
        expect(bundle[RQ_TYPE.ORGANIZATION].items[0]?.fields[0]?.value).toBe('7701');
    });

    it('бэк отдал default — он и используется', () => {
        const bundle = fromBundleDto({
            org: { items: [], default: dtoRecord(-1) },
            ip: { items: [], default: null },
            fiz: { items: [], default: null },
            current: null,
        } as unknown as RqBundleDto);
        expect(bundle[RQ_TYPE.ORGANIZATION].default.fields[0]?.value).toBe('7701');
        expect(bundle[RQ_TYPE.IP].default.fields).toEqual([]);
    });
});
