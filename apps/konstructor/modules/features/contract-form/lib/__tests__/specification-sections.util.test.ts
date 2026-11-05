import { describe, expect, it } from 'vitest';
import type { ContractSpecificationItem } from '@/modules/entities/contract-document';
import {
    groupSpecificationDetails,
    ltPacketsOf,
    specificationRows,
} from '../specification-sections.util';

const row = (code: string, name: string, value: string): ContractSpecificationItem =>
    ({
        code,
        name,
        value,
        type: 'text',
        isRequired: false,
        isActive: true,
        isDisable: true,
        isHidden: true,
        includes: [],
        group: 'specification',
        order: 0,
    }) as unknown as ContractSpecificationItem;

describe('подробности спецификации', () => {
    const items = [
        row('specification_pk', 'ПК/ГЛ', 'Горячая линия'),
        row('specification_iblocks', 'Информационные блоки', 'Законодательство России\n'),
        row('specification_ers', 'Энциклопедии Решений', 'ЭР Договоры\n'),
        row('specification_ifree', 'Бесплатные информационные блоки', 'ПРАЙМ\n'),
        row('specification_lt_free', 'Legal Tech в комплекте (бесплатно)', 'LT Малый'),
        row('specification_lt_free_services', 'Состав Бесплатных Legal Tech', ' Сутяжник\n'),
        row('specification_lt_packet', 'Платный Пакет Legal Tech 1', 'LT Малый'),
        row('specification_lt_services', 'Состав Платного Legal Tech 1', 'Искра\n'),
        row('specification_lt_packet_2', 'Платный Пакет Legal Tech 2', 'LT Средний'),
        row('specification_lt_services_2', 'Состав Платного Legal Tech 2', 'ЧекДок\nТендер\n'),
        row('specification_services', 'Другие сервисы', 'СТАР'),
        row('specification_email_comment', 'Email примечание', 'e'),
    ];

    it('разделы в постоянном порядке; ИБ вместе с бесплатными, остальное — «Поставка»', () => {
        const sections = groupSpecificationDetails(items);
        expect(sections.map(section => [section.key, section.items.map(item => item.code)])).toEqual([
            ['iblocks', ['specification_iblocks', 'specification_ifree']],
            ['ers', ['specification_ers']],
            ['lt-free', ['specification_lt_free', 'specification_lt_free_services']],
            [
                'lt-paid',
                [
                    'specification_lt_packet',
                    'specification_lt_services',
                    'specification_lt_packet_2',
                    'specification_lt_services_2',
                ],
            ],
            ['services', ['specification_services']],
            ['consalting', ['specification_pk']],
            ['supply', ['specification_email_comment']],
        ]);
    });

    it('платные LT — пакетами: подпись, название, состав списком', () => {
        const paid = groupSpecificationDetails(items).find(section => section.key === 'lt-paid')!;
        expect(ltPacketsOf(paid.items)).toEqual([
            { key: 'specification_lt_packet', label: 'Платный Пакет Legal Tech 1', name: 'LT Малый', services: ['Искра'] },
            {
                key: 'specification_lt_packet_2',
                label: 'Платный Пакет Legal Tech 2',
                name: 'LT Средний',
                services: ['ЧекДок', 'Тендер'],
            },
        ]);
    });

    it('пустой пакет не показывается; высота поля 2..6 строк', () => {
        expect(ltPacketsOf([row('specification_lt_packet', 'Платный', ''), row('specification_lt_services', 'Состав', '')])).toEqual([]);
        expect(specificationRows('a')).toBe(2);
        expect(specificationRows('a\nb\nc')).toBe(3);
        expect(specificationRows('1\n2\n3\n4\n5\n6\n7\n8')).toBe(6);
    });
});
