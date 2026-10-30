import { describe, expect, it } from 'vitest';
import type { GetSupplyResponseDto } from '@workspace/nest-admin-api';
import {
    SUPPLY_FIELDS,
    SUPPLY_FIELD_GROUPS,
    SUPPLY_TABLE_PRIMARY_KEYS,
    SUPPLY_TEXT_KEYS,
    countFilledTexts,
} from './supply-fields';

const supply = (
    overrides: Partial<GetSupplyResponseDto> = {},
): GetSupplyResponseDto =>
    ({
        id: '1',
        name: 'Интернет 5 ОД',
        fullName: 'Интернет 5 ОД',
        shortName: 'Интернет 5 ОД',
        code: 'internet_5',
        type: 'internet',
        usersQuantity: 5,
        coefficient: 3,
        ...overrides,
    }) as GetSupplyResponseDto;

describe('описание полей поставки', () => {
    it('показывает все поля карточки, кроме служебных', () => {
        // Служебные наружу не выводим: id в таблице отдельной колонкой,
        // даты правкам не подлежат
        const service = ['id', 'created_at', 'updated_at'];
        const described = new Set<string>(SUPPLY_FIELDS.map(f => f.key));
        const all = Object.keys(supply({ saleName_1: 'x' }));

        for (const key of all) {
            if (service.includes(key)) continue;
            expect(described.has(key)).toBe(true);
        }
    });

    it('ключи полей не повторяются между разделами', () => {
        const keys = SUPPLY_FIELDS.map(field => field.key);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('у каждого поля есть русская подпись без английских кодов', () => {
        for (const field of SUPPLY_FIELDS) {
            expect(field.label.length).toBeGreaterThan(0);
            // В клиентских текстах кодов и жаргона быть не должно
            expect(field.label).not.toMatch(
                /prop\d|contract|quantityForKp|e-mail|supply/i,
            );
        }
    });

    it('узкий вид таблицы берёт только существующие поля', () => {
        const described = new Set<string>(SUPPLY_FIELDS.map(f => f.key));
        for (const key of SUPPLY_TABLE_PRIMARY_KEYS) {
            expect(described.has(key)).toBe(true);
        }
    });

    it('в каждом разделе есть поля и заголовок', () => {
        expect(SUPPLY_FIELD_GROUPS.length).toBeGreaterThan(1);
        for (const group of SUPPLY_FIELD_GROUPS) {
            expect(group.title.length).toBeGreaterThan(0);
            expect(group.fields.length).toBeGreaterThan(0);
        }
    });

    it('считает только заполненные тексты', () => {
        expect(countFilledTexts(supply())).toBe(0);
        expect(
            countFilledTexts(
                supply({ contractName: 'на {n} ОД', acontractName: '' }),
            ),
        ).toBe(1);
        // null и пустая строка — это «не заполнено», а не значение
        expect(
            countFilledTexts(
                supply({ contractName: null, contractProp1: 'носитель' }),
            ),
        ).toBe(1);
    });

    it('все тексты договоров попали в подсчёт заполненности', () => {
        // Если поле добавят в договор, но забудут про kind: 'long',
        // счётчик в таблице начнёт врать
        for (const key of [
            'contractName',
            'contractProp1',
            'contractProp2',
            'lcontractName',
            'acontractName',
            'quantityForKp',
        ]) {
            expect(SUPPLY_TEXT_KEYS).toContain(key);
        }
    });
});
