import { describe, expect, it } from 'vitest';
import type { BXCompany, BXDeal } from '@workspace/bx';
import type { RelatedCrmDetails } from '@/modules/entities/RelatedCrm';
import {
    DISCOVERED_BINDINGS_LIMIT,
    buildHistoryBindings,
    collectDiscoveredBindings,
    parseBindingValue,
} from './bindings';

const related = {
    entityType: 'deal',
    entityId: 5512,
    deals: [
        { id: 5512, title: 'Базовая сделка', leadId: 318051 },
        { id: 5600, title: 'Презентация' },
    ],
    leads: [{ id: 999, title: 'Лид компании' }],
    contacts: [{ id: 917, name: 'Мария', lastName: 'Сидорова' }],
    batchRequests: 3,
    warnings: [],
} as unknown as RelatedCrmDetails;

describe('buildHistoryBindings', () => {
    it('собирает CO/D/L/C без дублей, порядок = приоритет групп', () => {
        const bindings = buildHistoryBindings({
            company: { ID: 431, TITLE: 'ООО Ромашка' } as unknown as BXCompany,
            deal: { ID: 5512, TITLE: 'Базовая сделка' } as unknown as BXDeal,
            lead: null,
            related,
            taskLinks: {
                companyId: 431,
                dealIds: [5512],
                leadIds: [318051],
                contactIds: [917],
            },
        });

        expect(bindings.map(binding => binding.value)).toEqual([
            'CO_431',
            'D_5512',
            'D_5600',
            'L_999',
            'L_318051',
            'C_917',
        ]);
        expect(bindings[0]?.title).toBe('ООО Ромашка');
        expect(
            bindings.find(binding => binding.value === 'C_917')?.title,
        ).toBe('Мария Сидорова');
    });

    it('сделка без компании: лид сделки попадает из details.deals[].leadId', () => {
        const bindings = buildHistoryBindings({
            company: null,
            deal: { ID: 5512, TITLE: 'Сделка' } as unknown as BXDeal,
            lead: null,
            related,
            taskLinks: null,
        });
        expect(bindings.map(binding => binding.value)).toContain('L_318051');
        expect(
            bindings.some(binding => binding.value.startsWith('CO_')),
        ).toBe(false);
    });

    it('пустой контекст — пустое множество', () => {
        expect(
            buildHistoryBindings({
                company: null,
                deal: null,
                lead: null,
                related: null,
                taskLinks: null,
            }),
        ).toEqual([]);
    });
});

describe('collectDiscoveredBindings', () => {
    const record = (id: number, bindings: string[]) =>
        ({
            id,
            title: '',
            comment: '',
            date: '',
            dateTs: null,
            responsibleId: null,
            eventType: null,
            eventAction: null,
            resultStatus: null,
            bindings,
        }) as const;

    it('открывает незнакомые L_/D_/C_ из записей, чужие CO_ и мусор пропускает', () => {
        const discovered = collectDiscoveredBindings(
            [
                record(1, ['CO_431', 'L_318051']),
                record(2, ['CO_999', 'D_5600', 'C_917', 'X_1', 'L_318051']),
            ],
            ['CO_431', 'D_5600'],
        );
        expect(discovered.map(binding => binding.value)).toEqual([
            'L_318051',
            'C_917',
        ]);
        expect(discovered[0]).toMatchObject({ type: 'lead', id: 318051 });
    });

    it('режет по лимиту', () => {
        const many = record(
            1,
            Array.from({ length: 30 }, (_, index) => `L_${index + 1}`),
        );
        expect(
            collectDiscoveredBindings([many], []).length,
        ).toBe(DISCOVERED_BINDINGS_LIMIT);
    });
});

describe('parseBindingValue', () => {
    it('различает CO_ и C_, отбрасывает мусор', () => {
        expect(parseBindingValue('CO_431')).toEqual({
            type: 'company',
            id: 431,
        });
        expect(parseBindingValue('C_917')).toEqual({
            type: 'contact',
            id: 917,
        });
        expect(parseBindingValue('l_7')).toEqual({ type: 'lead', id: 7 });
        expect(parseBindingValue('L_abc')).toBeNull();
        expect(parseBindingValue('банан')).toBeNull();
    });
});
