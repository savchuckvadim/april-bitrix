import { describe, expect, it } from 'vitest';
import {
    appendWordTemplateCriteria,
    buildWordTemplateCriteriaFields,
    normalizeCriteriaList,
} from './word-template-criteria-payload';

/**
 * Бэкенд разбирает `client_types`/`supply_types` через
 * `@Transform(parseMultipartList)`, который на ПУСТОЙ строке возвращает
 * `undefined` (поле «не передано»), а на `"[]"` — пустой массив (сброс в
 * NULL). Разница и проверяется ниже: create не должен присылать `"[]"`,
 * update — обязан.
 */
describe('normalizeCriteriaList', () => {
    it('пустой список, null и undefined дают undefined', () => {
        expect(normalizeCriteriaList([])).toBeUndefined();
        expect(normalizeCriteriaList(null)).toBeUndefined();
        expect(normalizeCriteriaList(undefined)).toBeUndefined();
    });

    it('повторы убираются, порядок выбора сохраняется', () => {
        expect(normalizeCriteriaList(['ip', 'org', 'ip'])).toEqual(['ip', 'org']);
    });
});

describe('buildWordTemplateCriteriaFields: create', () => {
    it('пустые критерии не дают ни одного поля — на бэке это NULL «для любого»', () => {
        expect(
            buildWordTemplateCriteriaFields(
                { agent_id: '', client_types: [], supply_types: [] },
                'create',
            ),
        ).toEqual({});
    });

    it('полностью отсутствующие критерии тоже не дают полей', () => {
        expect(buildWordTemplateCriteriaFields({}, 'create')).toEqual({});
    });

    it('списки уходят JSON-строкой, которую понимает parseMultipartList', () => {
        const fields = buildWordTemplateCriteriaFields(
            { client_types: ['org', 'ip'], supply_types: ['internet'] },
            'create',
        );

        expect(fields.client_types).toBe('["org","ip"]');
        expect(fields.supply_types).toBe('["internet"]');
    });

    it('agent_id обрезается; пробелы считаются пустым значением', () => {
        expect(
            buildWordTemplateCriteriaFields({ agent_id: ' 42 ' }, 'create').agent_id,
        ).toBe('42');
        expect(
            buildWordTemplateCriteriaFields({ agent_id: '   ' }, 'create'),
        ).toEqual({});
    });

    it('agent_id остаётся строкой: в БД это BIGINT', () => {
        const fields = buildWordTemplateCriteriaFields(
            { agent_id: '9007199254740993' },
            'create',
        );
        expect(fields.agent_id).toBe('9007199254740993');
    });
});

describe('buildWordTemplateCriteriaFields: update', () => {
    it('пустые списки уходят как "[]" — только так снимается ограничение', () => {
        const fields = buildWordTemplateCriteriaFields(
            { client_types: [], supply_types: [] },
            'update',
        );

        expect(fields.client_types).toBe('[]');
        expect(fields.supply_types).toBe('[]');
    });

    it('пустой agent_id уходит пустой строкой — «снять поставщика»', () => {
        expect(
            buildWordTemplateCriteriaFields({ agent_id: '' }, 'update').agent_id,
        ).toBe('');
    });

    it('null трактуется как сброс так же, как пустое значение', () => {
        const fields = buildWordTemplateCriteriaFields(
            { agent_id: null, client_types: null, supply_types: null },
            'update',
        );

        expect(fields.agent_id).toBe('');
        expect(fields.client_types).toBe('[]');
        expect(fields.supply_types).toBe('[]');
    });

    it('не переданное поле НЕ отправляется: отсутствие = «не менять»', () => {
        expect(
            buildWordTemplateCriteriaFields({ client_types: ['org'] }, 'update'),
        ).toEqual({ client_types: '["org"]' });
    });

    it('заполненные списки отправляются JSON-строкой без повторов', () => {
        const fields = buildWordTemplateCriteriaFields(
            { supply_types: ['proxima', 'proxima', 'internet'] },
            'update',
        );
        expect(fields.supply_types).toBe('["proxima","internet"]');
    });
});

describe('appendWordTemplateCriteria', () => {
    it('дописывает только непустые поля в уже собранную FormData', () => {
        const form = new FormData();
        form.append('name', 'КП');

        appendWordTemplateCriteria(
            form,
            { agent_id: '42', client_types: ['org'], supply_types: [] },
            'create',
        );

        expect(form.get('name')).toBe('КП');
        expect(form.get('agent_id')).toBe('42');
        expect(form.get('client_types')).toBe('["org"]');
        // create не отправляет пустой список: NULL ≠ пустой массив.
        expect(form.get('supply_types')).toBeNull();
    });

    it('в режиме update дописывает и сбросы', () => {
        const form = new FormData();
        appendWordTemplateCriteria(
            form,
            { agent_id: '', client_types: [], supply_types: [] },
            'update',
        );

        expect(form.get('agent_id')).toBe('');
        expect(form.get('client_types')).toBe('[]');
        expect(form.get('supply_types')).toBe('[]');
    });

    it('возвращает ту же FormData, что передали', () => {
        const form = new FormData();
        expect(appendWordTemplateCriteria(form, {}, 'create')).toBe(form);
    });
});
