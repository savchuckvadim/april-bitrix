import { describe, expect, it } from 'vitest';
import type { PBXField, Portal } from '../../../portal';
import type { SupplyFormItem } from '../../model/dto';
import { buildPbxEntityItems, buildPresentPbxEntityItems } from '../pbx-entity-items.util';
import { missingSupplyFields, selectItemToValue, visibleSupplyItems, withSelectDefaults } from '../supply-form.util';
import { buildSupplyRpaFilter, pickSupplyRpaId } from '../supply-rpa.util';
import { toReportContact, toSupplyContact } from '../supply-contacts.util';

const option = (code: string, name: string) => ({ id: 0, code, name, title: name });
const item = (code: string, over: Partial<SupplyFormItem> = {}): SupplyFormItem =>
    ({
        type: 'string',
        name: code,
        value: '',
        isRequired: false,
        code,
        group: 'supply',
        isActive: true,
        isDisable: false,
        order: 0,
        includes: ['org', 'org_state', 'ip', 'fiz'],
        supplies: ['internet', 'proxima'],
        contractType: ['service', 'lic', 'abon', 'key'],
        ...over,
    }) as SupplyFormItem;

const scope = { clientType: 'org', contractType: 'service', supplyType: 'internet' } as const;

describe('supply-form.util', () => {
    const items: SupplyFormItem[] = [
        item('sale_date', { type: 'date', isRequired: true, component: 'base_one', order: 0 }),
        item('is_contract_done', {
            type: 'select',
            isRequired: true,
            component: 'contract',
            order: 5,
            items: [option('yes', 'Да'), option('no', 'Нет')],
            value: null,
        }),
        item('contract_number', { component: 'contract', order: 6 }),
        item('current_contract', { type: 'file', component: 'contract', order: 7, value: null }),
        item('only_proxima', { supplies: ['proxima'], order: 8 }),
        item('hidden', { isActive: false, order: 9 }),
        item('situation_comments', { type: 'text', isRequired: true, order: 10 }),
    ];

    it('select без значения получает первый вариант; зависимые поля группы видны только при «Да»', () => {
        const withDefaults = withSelectDefaults(items);
        const trigger = withDefaults.find(entry => entry.code === 'is_contract_done')!;
        expect(trigger.value).toMatchObject({ code: 'yes' });
        const visible = visibleSupplyItems(withDefaults, scope).map(entry => entry.code);
        expect(visible).toEqual(['sale_date', 'is_contract_done', 'contract_number', 'current_contract', 'situation_comments']);

        const closed = withDefaults.map(entry =>
            entry.code === 'is_contract_done' ? { ...entry, value: selectItemToValue(option('no', 'Нет')) } : entry,
        );
        expect(visibleSupplyItems(closed, scope).map(entry => entry.code)).toEqual([
            'sale_date',
            'is_contract_done',
            'situation_comments',
        ]);
    });

    it('обязательные без значения — по подписям; файл считается заполненным по files или value', () => {
        const visible = visibleSupplyItems(withSelectDefaults(items), scope);
        expect(missingSupplyFields(visible, {})).toEqual(['sale_date', 'situation_comments']);
        const filled = visible.map(entry => (entry.code === 'sale_date' ? { ...entry, value: '2026-11-01' } : entry));
        expect(missingSupplyFields(filled, {})).toEqual(['situation_comments']);
    });
});

describe('buildPbxEntityItems', () => {
    const field = (code: string, bitrixId: string, type = 'string', items: Array<{ code: string; bitrixId: number; name: string }> = []) =>
        ({ code, bitrixId, type, id: 1, name: code, title: code, bitrixCamelId: '', entity_id: 1, parent_type: 'deal', items }) as unknown as PBXField;
    const fields = [
        field('supply_date', '100'),
        field('op_client_type', '200', 'enumeration', [{ code: 'commerc', bitrixId: 55, name: 'Коммерческие' }]),
    ];

    it('строка — из сущности, правка экрана сильнее; enumeration — выбранный вариант; нет поля — заглушка', () => {
        const items = buildPbxEntityItems({
            fields,
            entity: { UF_CRM_100: '2026-11-05T00:00:00+03:00', UF_CRM_200: 55 },
            codes: ['supply_date', 'op_client_type', 'absent'],
            overrides: { supply_date: '2026-11-06' },
            requiredCodes: ['supply_date'],
        });
        expect(items['supply_date']).toMatchObject({ current: '2026-11-06', isRequired: true, bitrixId: '100' });
        expect(items['op_client_type']!.current).toMatchObject({ code: 'commerc' });
        expect(items['absent']).toMatchObject({ current: null, field: { code: 'absent', bitrixId: '' } });
    });

    it('present — только поля, которые есть на портале', () => {
        const items = buildPresentPbxEntityItems({ fields, entity: {}, codes: ['supply_date', 'absent'] });
        expect(Object.keys(items)).toEqual(['supply_date']);
    });
});

describe('supply-rpa.util', () => {
    const portal = {
        rpas: [
            {
                code: 'supply',
                bitrixId: 7,
                bitrixfields: [{ code: 'rpa_crm_base_deal', bitrixId: '12' }],
            },
        ],
    } as unknown as Portal;

    it('фильтр по сделке и не закрытым стадиям; первая заявка — её id', () => {
        const query = buildSupplyRpaFilter(portal, 555, [
            { id: 1, typeId: 7, name: 'Новая', code: 'new', color: '', sort: 1 },
            { id: 2, typeId: 7, name: 'Успех', code: 'ok', color: '', sort: 2, isSuccess: true },
            { id: 3, typeId: 7, name: 'Провал', code: 'fail', color: '', sort: 3, isFail: true },
        ])!;
        expect(query.typeId).toBe(7);
        expect(query.filter).toEqual({ UF_RPA_7_12: 555, logic: 'and', 0: { '!=stageId': 2 }, 1: { '!=stageId': 3 } });
        expect(pickSupplyRpaId([{ id: '42' }, { id: 43 }])).toBe(42);
        expect(pickSupplyRpaId([])).toBeNull();
    });
});

describe('supply-contacts.util', () => {
    it('контакт Bitrix → отчёт: ФИО, должность, телефоны', () => {
        const contact = toSupplyContact({
            ID: 9,
            NAME: 'Иван',
            LAST_NAME: 'Петров',
            POST: 'Бухгалтер',
            PHONE: [{ VALUE: '+7 900', TYPE: 'WORK' }],
        });
        expect(contact).toMatchObject({ ID: '9', NAME: 'Петров Иван', POST: 'Бухгалтер', PHONE: ['+7 900'] });
        expect(toReportContact(contact).contact.PHONE).toEqual([{ VALUE: '+7 900' }]);
    });
});
