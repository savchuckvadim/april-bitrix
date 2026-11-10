import { describe, expect, it } from 'vitest';
import type { Catalog } from '@/modules/entities/catalog';
import type { KRow } from '@/modules/entities/row-set';
import { contractTypeWarning, toDealSendWarnings } from '../deal-send-warnings.util';

describe('toDealSendWarnings', () => {
    it('название с бэка, причина и адрес правки', () => {
        const warning = toDealSendWarnings([
            { code: 'contract_type', reason: 'unknown_item', title: 'Тип договора' },
        ])[0]!;
        expect(warning.field).toBe('Тип договора');
        expect(warning.problem).toBe('на портале нет такого пункта списка');
        expect(warning.fix).toContain('PBX → Сделка');
    });

    it('старый бэк без title — название из канона полей', () => {
        const warning = toDealSendWarnings([{ code: 'quantity_for_kp', reason: 'not_on_portal' }])[0]!;
        expect(warning.field).toBe('Количество для КП');
        expect(warning.problem).toBe('поля нет на портале');
    });

    it('неизвестный код и причина не теряются', () => {
        const warning = toDealSendWarnings([{ code: 'new_field', reason: 'something' }])[0]!;
        expect(warning.field).toBe('new_field');
        expect(warning.problem).toBe('something');
    });
});

describe('contractTypeWarning', () => {
    const catalog = (bitrixItemId: number) =>
        ({
            contracts: { byCode: { licYear: { code: 'licYear', name: 'Лицензионный 12 мес.', bitrixItemId } } },
        }) as unknown as Catalog;
    const row = { refs: { contractCode: 'licYear' } } as unknown as KRow;

    it('пункт привязан — молчим', () => {
        expect(contractTypeWarning(catalog(5444), row)).toBeNull();
    });

    it('пункта нет — называем договор и где привязать', () => {
        const warning = contractTypeWarning(catalog(0), row);
        expect(warning?.field).toBe('Тип договора');
        expect(warning?.problem).toContain('Лицензионный 12 мес.');
        expect(warning?.fix).toContain('Конструктор → Договоры');
    });
});
