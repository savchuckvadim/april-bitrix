import { describe, expect, it } from 'vitest';
import type { MethodologyCatalog, MethodologyCheckpoint } from '../model';
import {
    bumpVersion,
    capText,
    conditionText,
    copyConfig,
    emptyConfig,
    fromCatalogCheckpoint,
    isValidMethodologyCode,
    itemStateLabel,
    parseConditionValue,
    parseConfigJson,
    suggestCode,
    toggleInList,
    uniqueCode,
} from './methodology-form.util';

const catalog = {
    conditionOps: [
        { code: 'is', title: 'равно' },
        { code: 'empty', title: 'пусто' },
        { code: 'checkpoint_missed', title: 'пункт пропущен' },
    ],
    factFields: [{ code: 'needsFound', title: 'Потребности выявлены (да/нет)' }],
    capTargets: [
        { code: 'total', title: 'Итоговая оценка' },
        { code: 'PRICE', title: 'Работа по цене' },
    ],
} as unknown as MethodologyCatalog;

const checkpoints: MethodologyCheckpoint[] = [
    { code: 'pres.a', title: 'Резюмировал потребности', types: ['presentation'], evidence: 'quote', mandatory: true },
];

describe('methodology-form.util', () => {
    it('версия поднимается по patch; мусор — 1.0.0', () => {
        expect(bumpVersion('1.2.3')).toBe('1.2.4');
        expect(bumpVersion(' 2.0.9 ')).toBe('2.0.10');
        expect(bumpVersion('v1')).toBe('1.0.0');
    });

    it('код из названия: транслит, дефисы, начало с буквы', () => {
        expect(suggestCode('Методика Воронежа')).toBe('metodika-voronezha');
        expect(suggestCode('  2026 план  ')).toBe('m-2026-plan');
        expect(suggestCode('!!!')).toBe('');
        expect(isValidMethodologyCode('garant-own')).toBe(true);
        expect(isValidMethodologyCode('Garant')).toBe(false);
    });

    it('условия и ограничители словами', () => {
        expect(conditionText({ op: 'is', field: 'needsFound', value: false }, catalog, checkpoints)).toBe(
            'Потребности выявлены (да/нет) равно false',
        );
        expect(conditionText({ op: 'empty', field: 'needsFound' }, catalog, checkpoints)).toBe(
            'Потребности выявлены (да/нет): пусто',
        );
        expect(conditionText({ op: 'checkpoint_missed', checkpoint: 'pres.a' }, catalog, checkpoints)).toBe(
            'пункт пропущен: Резюмировал потребности',
        );
        expect(capText({ code: 'c', title: 't', when: [], target: 'PRICE', max: 6 }, catalog)).toBe(
            'Работа по цене не выше 6',
        );
    });

    it('значение условия из текста: булево, число, строка, пусто', () => {
        expect(parseConditionValue('true')).toBe(true);
        expect(parseConditionValue(' 3 ')).toBe(3);
        expect(parseConditionValue('2,5')).toBe(2.5);
        expect(parseConditionValue('lpr')).toBe('lpr');
        expect(parseConditionValue('')).toBeNull();
    });

    it('уникальный код, переключение списка, копия конфига, пустой конфиг', () => {
        expect(uniqueCode('own.point', ['own.point', 'own.point_2'])).toBe('own.point_3');
        expect(toggleInList(['cold'], 'cold')).toEqual([]);
        expect(toggleInList(['cold'], 'call')).toEqual(['cold', 'call']);
        const source = { ...emptyConfig('a-b', 'А'), version: '3.1.0', principles: ['п'] };
        const copy = copyConfig(source, 'c-d', 'С');
        expect(copy).toMatchObject({ code: 'c-d', title: 'С', version: '1.0.0', principles: ['п'] });
        copy.principles.push('ещё');
        expect(source.principles).toEqual(['п']);
    });

    it('состояние строки и разбор JSON', () => {
        const texts = { builtin: 'встроенная', inactive: 'выключена', invalid: 'конфиг с ошибками' };
        expect(itemStateLabel({ source: 'builtin', isActive: true, valid: true }, texts)).toEqual(['встроенная']);
        expect(itemStateLabel({ source: 'table', isActive: false, valid: false }, texts)).toEqual(['выключена', 'конфиг с ошибками']);
        expect(parseConfigJson('{"code":"x"}').config).toEqual({ code: 'x' });
        expect(parseConfigJson('[1]').error).toBe('Ожидается объект конфига');
        expect(parseConfigJson('{').config).toBeNull();
    });
});

describe('fromCatalogCheckpoint', () => {
    it('берёт пункт каталога без служебных полей и оставляет только типы методики', () => {
        const own = fromCatalogCheckpoint(
            {
                code: 'pres.a',
                title: 'Резюмировал потребности',
                types: ['presentation', 'cold'],
                evidence: 'quote',
                mandatory: true,
                hint: 'подсказка',
                rule: [{ op: 'is', field: 'needsFound', value: true }],
                byRule: true,
                source: 'polyansky',
            },
            ['presentation'],
        );
        expect(own).toEqual({
            code: 'pres.a',
            title: 'Резюмировал потребности',
            types: ['presentation'],
            evidence: 'quote',
            mandatory: true,
            hint: 'подсказка',
            rule: [{ op: 'is', field: 'needsFound', value: true }],
        });
        expect('byRule' in own).toBe(false);
    });
});
