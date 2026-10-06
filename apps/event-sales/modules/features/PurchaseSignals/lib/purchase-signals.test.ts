import { describe, expect, it } from 'vitest';
import type { PBXField } from '@/modules/app/types/portal/portal-type';
import {
    CONCURENT_DATE_FIELDS,
    CONTRACT_DATE_FIELDS,
    readConcurentCodes,
    readConcurentOptions,
    resolveDates,
    toConcurentFieldValue,
} from './purchase-signals';

/** Поле слепка портала — только то, что читает блок. */
const field = (
    code: string,
    bitrixId: string,
    items: Array<{ code: string; name: string; bitrixId: number }> = [],
): PBXField => ({ code, bitrixId, items }) as unknown as PBXField;

const CONCURENTS = field('concurents_multiple', 'CONCURENTS_MULTIPLE', [
    { code: 'kons_plus', name: 'Консультант+', bitrixId: 101 },
    { code: 'kodex', name: 'Кодекс', bitrixId: 102 },
]);

describe('«Конкуренты»: поле ищется по коду, который стоит на порталах', () => {
    it('справочник находится по коду concurents_multiple', () => {
        expect(readConcurentOptions([CONCURENTS])).toEqual([
            { code: 'kons_plus', name: 'Консультант+' },
            { code: 'kodex', name: 'Кодекс' },
        ]);
    });

    it('прежний код op_concurents_multiple справочником не считается', () => {
        const legacy = field(
            'op_concurents_multiple',
            'OP_CONCURENTS_MULTIPLE',
            [{ code: 'kodex', name: 'Кодекс', bitrixId: 1 }],
        );

        expect(readConcurentOptions([legacy])).toEqual([]);
    });

    it('выбранные читаются кодами, а не id элементов', () => {
        const row = { UF_CRM_CONCURENTS_MULTIPLE: ['102', 101, 999] };

        expect(readConcurentCodes([CONCURENTS], row)).toEqual([
            'kodex',
            'kons_plus',
        ]);
    });

    it('запись: коды → id элементов своего носителя; пусто → пустая строка', () => {
        expect(toConcurentFieldValue([CONCURENTS], ['kodex'])).toEqual({
            key: 'UF_CRM_CONCURENTS_MULTIPLE',
            value: ['102'],
        });
        expect(toConcurentFieldValue([CONCURENTS], [])).toEqual({
            key: 'UF_CRM_CONCURENTS_MULTIPLE',
            value: '',
        });
        expect(toConcurentFieldValue([], ['kodex'])).toBeNull();
    });
});

describe('даты блока: что установлено и откуда значение', () => {
    const dealFields = [
        field('op_sale_date_prognoz', 'OP_SALE_DATE_PROGNOZ'),
        field('contract_start', 'CONTRACT_START'),
        field('contract_present_end', 'CONTRACT_PRESENT_END'),
    ];
    const companyFields = [
        field('contract_start', 'CONTRACT_START'),
        field('op_concurent_pay_date', 'OP_CONCURENT_PAY_DATE'),
    ];

    const carriers = [
        {
            row: {
                UF_CRM_OP_SALE_DATE_PROGNOZ: '2026-11-01T03:00:00+03:00',
                UF_CRM_CONTRACT_START: '',
            },
            fields: dealFields,
        },
        {
            row: {
                UF_CRM_CONTRACT_START: '15.01.2026',
                UF_CRM_OP_CONCURENT_PAY_DATE: '2026-12-31',
            },
            fields: companyFields,
        },
    ];

    it('показываются только даты, установленные хотя бы у одного носителя', () => {
        const dates = resolveDates(carriers, CONTRACT_DATE_FIELDS, {});

        expect(dates.map(date => date.code)).toEqual([
            'op_sale_date_prognoz',
            'contract_start',
            'contract_present_end',
        ]);
    });

    it('значение — первое непустое: у сделки пусто, берём у компании', () => {
        const dates = resolveDates(carriers, CONTRACT_DATE_FIELDS, {});

        expect(dates.find(date => date.code === 'contract_start')?.value).toBe(
            '2026-01-15',
        );
        expect(
            dates.find(date => date.code === 'op_sale_date_prognoz')?.value,
        ).toBe('2026-11-01');
    });

    it('правка менеджера сильнее строки сущности', () => {
        const dates = resolveDates(carriers, CONCURENT_DATE_FIELDS, {
            op_concurent_pay_date: '2027-01-31',
        });

        expect(dates).toEqual([
            {
                code: 'op_concurent_pay_date',
                label: 'Оплачено до',
                value: '2027-01-31',
                wide: false,
            },
        ]);
    });

    it('плановая дата покупки занимает строку целиком, пары «с / по» — нет', () => {
        const dates = resolveDates(carriers, CONTRACT_DATE_FIELDS, {});

        expect(dates.map(date => date.wide)).toEqual([true, false, false]);
    });
});
