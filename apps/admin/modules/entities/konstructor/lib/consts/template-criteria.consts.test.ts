import { describe, expect, it } from 'vitest';
import {
    ANY_CRITERIA_LABEL,
    CLIENT_TYPE_CODES,
    CLIENT_TYPE_LABELS,
    CLIENT_TYPE_OPTIONS,
    CONTRACT_LTYPE_CODES,
    CONTRACT_LTYPE_LABELS,
    CONTRACT_LTYPE_OPTIONS,
    SUPPLY_TYPE_CODES,
    SUPPLY_TYPE_LABELS,
    SUPPLY_TYPE_OPTIONS,
    TEMPLATE_SCOPE_CODES,
    TEMPLATE_SCOPE_LABELS,
    TEMPLATE_SCOPE_OPTIONS,
    formatCriteriaList,
    getClientTypeLabel,
    getContractLtypeLabel,
    getSupplyTypeLabel,
    getTemplateScopeLabel,
} from './template-criteria.consts';

/**
 * Эти проверки нужны, чтобы новый член перечисления на бэке падал ГРОМКО.
 * `Record<Code, string>` ловит пропуск подписи на этапе `tsc`, а тесты ниже
 * ловят обратное: подпись добавили, а код в список отображения не внесли
 * (тогда опция не появится в форме, и это молчаливая потеря функции).
 */
describe('CONTRACT_LTYPE: тип договора', () => {
    it.each([
        ['service', 'Договор услуг'],
        ['abon', 'Абонентский'],
        ['lic', 'Лицензионный'],
        ['key', 'Передача ключа доступа'],
    ])('«%s» → «%s»', (code, label) => {
        expect(getContractLtypeLabel(code)).toBe(label);
    });

    it('каждый код перечисления имеет непустую русскую подпись', () => {
        expect(CONTRACT_LTYPE_CODES).toHaveLength(4);
        for (const code of CONTRACT_LTYPE_CODES) {
            expect(CONTRACT_LTYPE_LABELS[code]).toBeTruthy();
        }
    });

    it('в словаре нет ключей сверх списка отображения и наоборот', () => {
        expect(Object.keys(CONTRACT_LTYPE_LABELS).sort()).toEqual(
            [...CONTRACT_LTYPE_CODES].sort(),
        );
    });

    it('порядок опций — доменный, из списка кодов, а не алфавитный', () => {
        expect(CONTRACT_LTYPE_OPTIONS.map((option) => option.value)).toEqual([
            'service',
            'abon',
            'lic',
            'key',
        ]);
    });
});

describe('CLIENT_TYPE: тип клиента', () => {
    it.each([
        ['org_state', 'Бюджетная организация'],
        ['org', 'Организация'],
        ['ip', 'ИП'],
        ['fiz', 'Физлицо'],
        ['advokat', 'Адвокатское образование'],
    ])('«%s» → «%s»', (code, label) => {
        expect(getClientTypeLabel(code)).toBe(label);
    });

    it('каждый код перечисления имеет непустую русскую подпись', () => {
        expect(CLIENT_TYPE_CODES).toHaveLength(5);
        for (const code of CLIENT_TYPE_CODES) {
            expect(CLIENT_TYPE_LABELS[code]).toBeTruthy();
        }
    });

    it('в словаре нет ключей сверх списка отображения и наоборот', () => {
        expect(Object.keys(CLIENT_TYPE_LABELS).sort()).toEqual(
            [...CLIENT_TYPE_CODES].sort(),
        );
    });

    it('каждая опция несёт код и русскую подпись', () => {
        expect(CLIENT_TYPE_OPTIONS).toContainEqual({
            value: 'fiz',
            label: 'Физлицо',
        });
        expect(CLIENT_TYPE_OPTIONS).toHaveLength(CLIENT_TYPE_CODES.length);
    });
});

describe('SUPPLY_TYPE: вид размещения', () => {
    it.each([
        ['internet', 'Интернет'],
        ['proxima', 'Проксима'],
    ])('«%s» → «%s»', (code, label) => {
        expect(getSupplyTypeLabel(code)).toBe(label);
    });

    it('каждый код перечисления имеет непустую русскую подпись', () => {
        expect(SUPPLY_TYPE_CODES).toHaveLength(2);
        for (const code of SUPPLY_TYPE_CODES) {
            expect(SUPPLY_TYPE_LABELS[code]).toBeTruthy();
        }
    });

    it('в словаре нет ключей сверх списка отображения и наоборот', () => {
        expect(Object.keys(SUPPLY_TYPE_LABELS).sort()).toEqual(
            [...SUPPLY_TYPE_CODES].sort(),
        );
    });

    it('каждая опция несёт код и русскую подпись', () => {
        expect(SUPPLY_TYPE_OPTIONS).toHaveLength(SUPPLY_TYPE_CODES.length);
    });
});

describe('TEMPLATE_SCOPE: уровень привязки', () => {
    it.each([
        ['common', 'Общий (для всех порталов)'],
        ['portal', 'Портальный'],
        ['provider', 'Портальный, под поставщика'],
    ])('«%s» → «%s»', (code, label) => {
        expect(getTemplateScopeLabel(code)).toBe(label);
    });

    it('каждый код перечисления имеет непустую русскую подпись', () => {
        expect(TEMPLATE_SCOPE_CODES).toHaveLength(3);
        for (const code of TEMPLATE_SCOPE_CODES) {
            expect(TEMPLATE_SCOPE_LABELS[code]).toBeTruthy();
        }
    });

    it('в словаре нет ключей сверх списка отображения и наоборот', () => {
        expect(Object.keys(TEMPLATE_SCOPE_LABELS).sort()).toEqual(
            [...TEMPLATE_SCOPE_CODES].sort(),
        );
    });

    it('опции идут в порядке «общий → портальный → под поставщика»', () => {
        expect(TEMPLATE_SCOPE_OPTIONS.map((option) => option.value)).toEqual([
            'common',
            'portal',
            'provider',
        ]);
    });
});

describe('подписи неизвестных и пустых значений', () => {
    it('неизвестный код не теряется — показывается как есть', () => {
        expect(getClientTypeLabel('samozanyat')).toBe('samozanyat');
        expect(getSupplyTypeLabel('wifi')).toBe('wifi');
        expect(getContractLtypeLabel('unknown')).toBe('unknown');
    });

    it('пустой тип договора рисуется прочерком, а не пустой ячейкой', () => {
        expect(getContractLtypeLabel(null)).toBe('—');
        expect(getContractLtypeLabel(undefined)).toBe('—');
        expect(getContractLtypeLabel('')).toBe('—');
    });
});

describe('formatCriteriaList: список критериев в строку', () => {
    it('пусто, null и undefined читаются как «подходит любому»', () => {
        expect(formatCriteriaList([], getClientTypeLabel)).toBe(
            ANY_CRITERIA_LABEL,
        );
        expect(formatCriteriaList(null, getClientTypeLabel)).toBe(
            ANY_CRITERIA_LABEL,
        );
        expect(formatCriteriaList(undefined, getClientTypeLabel)).toBe(
            ANY_CRITERIA_LABEL,
        );
    });

    it('подписи идут через запятую в порядке входного списка', () => {
        expect(formatCriteriaList(['ip', 'org'], getClientTypeLabel)).toBe(
            'ИП, Организация',
        );
    });

    it('неизвестный код в списке не прячет известные подписи', () => {
        expect(
            formatCriteriaList(['proxima', 'wifi'], getSupplyTypeLabel),
        ).toBe('Проксима, wifi');
    });
});
