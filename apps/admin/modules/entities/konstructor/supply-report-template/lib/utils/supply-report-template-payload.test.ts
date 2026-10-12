import { describe, expect, it } from 'vitest';
import {
    buildCreatePayload,
    buildUpdatePayload,
    emptyFormValues,
    findUnknownSupplyReportFieldCodes,
    formValuesOfTemplate,
    normalizeCodeList,
    resolveScopeIds,
    scopeOfTemplate,
} from './supply-report-template-payload';
import type {
    ISupplyReportTemplate,
    ISupplyReportTemplateFormValues,
} from '../../model';

/**
 * Файл не импортирует React: `vitest.config.ts` собирает только
 * `modules/**\/*.test.ts` в окружении `node`, поэтому тестируется чистая
 * логика нормализации, а не компоненты.
 */

/** Заглушка File: в окружении node конструктор File доступен (undici). */
const fakeFile = (name = 'template.docx'): File =>
    new File(['docx'], name, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

const formValues = (
    overrides: Partial<ISupplyReportTemplateFormValues> = {},
): ISupplyReportTemplateFormValues => ({
    name: 'Отчёт о поставке',
    scope: 'common',
    portal_id: '',
    agent_id: '',
    client_types: [],
    supply_types: [],
    required_fields: [],
    optional_fields: [],
    description: '',
    is_default: false,
    is_active: true,
    file: null,
    demo: null,
    ...overrides,
});

const template = (
    overrides: Partial<ISupplyReportTemplate> = {},
): ISupplyReportTemplate => ({
    id: '42',
    name: 'Отчёт о поставке',
    code: 'supply-report-3f2a',
    client_types: null,
    supply_types: null,
    required_fields: null,
    optional_fields: null,
    description: null,
    is_default: false,
    is_active: true,
    is_archived: false,
    archived_at: null,
    portal_id: null,
    agent_id: null,
    creator_bitrix_user_id: null,
    created_at: null,
    updated_at: null,
    template_url: 'https://example.test/api/supply-report-templates/42/download',
    demo_url: null,
    ...overrides,
});

describe('normalizeCodeList', () => {
    it('пустой список, null и undefined дают undefined', () => {
        expect(normalizeCodeList([])).toBeUndefined();
        expect(normalizeCodeList(null)).toBeUndefined();
        expect(normalizeCodeList(undefined)).toBeUndefined();
    });

    it('повторы убираются, порядок выбора сохраняется', () => {
        expect(normalizeCodeList(['ip', 'org', 'ip'])).toEqual(['ip', 'org']);
    });

    it('пустые строки отбрасываются; список из одних пустых даёт undefined', () => {
        expect(normalizeCodeList(['', 'org', ''])).toEqual(['org']);
        expect(normalizeCodeList(['', ''])).toBeUndefined();
    });
});

describe('findUnknownSupplyReportFieldCodes', () => {
    it('известные коды формы проходят', () => {
        expect(
            findUnknownSupplyReportFieldCodes(['sale_date', 'situation_comments']),
        ).toEqual([]);
    });

    it('коды не из формы возвращаются без повторов', () => {
        expect(
            findUnknownSupplyReportFieldCodes([
                'sale_date',
                'made_up',
                'made_up',
            ]),
        ).toEqual(['made_up']);
    });

    it('пустой ввод не считается ошибкой', () => {
        expect(findUnknownSupplyReportFieldCodes([])).toEqual([]);
        expect(findUnknownSupplyReportFieldCodes(null)).toEqual([]);
    });

    it('«type» не код поля отчёта и отвергается до отправки', () => {
        expect(findUnknownSupplyReportFieldCodes(['type'])).toEqual(['type']);
    });
});

describe('resolveScopeIds: уровень привязки → пара (portal_id, agent_id)', () => {
    it('common обнуляет и портал, и поставщика — «Общий» это portal_id IS NULL', () => {
        expect(
            resolveScopeIds({ scope: 'common', portal_id: '7', agent_id: '42' }),
        ).toEqual({});
    });

    it('portal оставляет только портал', () => {
        expect(
            resolveScopeIds({ scope: 'portal', portal_id: '7', agent_id: '42' }),
        ).toEqual({ portal_id: '7' });
    });

    it('provider берёт и портал, и поставщика', () => {
        expect(
            resolveScopeIds({ scope: 'provider', portal_id: '7', agent_id: '42' }),
        ).toEqual({ portal_id: '7', agent_id: '42' });
    });

    it('пробелы обрезаются, пустая строка становится undefined', () => {
        expect(
            resolveScopeIds({
                scope: 'provider',
                portal_id: ' 7 ',
                agent_id: '   ',
            }),
        ).toEqual({ portal_id: '7', agent_id: undefined });
    });
});

describe('scopeOfTemplate: обратный вывод уровня из строки', () => {
    it('portal_id null ⇒ common', () => {
        expect(scopeOfTemplate({ portal_id: null, agent_id: null })).toBe('common');
    });

    it('портал без поставщика ⇒ portal', () => {
        expect(scopeOfTemplate({ portal_id: '7', agent_id: null })).toBe('portal');
    });

    it('портал с поставщиком ⇒ provider', () => {
        expect(scopeOfTemplate({ portal_id: '7', agent_id: '42' })).toBe(
            'provider',
        );
    });

    it('common «перебивает» заполненного поставщика: решает именно portal_id', () => {
        expect(scopeOfTemplate({ portal_id: null, agent_id: '42' })).toBe('common');
    });
});

describe('buildCreatePayload: пустой выбор НЕ отправляется', () => {
    it('пустые списки отсутствуют в теле — на бэке это NULL («любой» / «из кода»)', () => {
        const dto = buildCreatePayload(formValues(), fakeFile());

        expect(dto).not.toHaveProperty('client_types');
        expect(dto).not.toHaveProperty('supply_types');
        expect(dto).not.toHaveProperty('required_fields');
        expect(dto).not.toHaveProperty('optional_fields');
    });

    it('заполненные списки отправляются без повторов', () => {
        const dto = buildCreatePayload(
            formValues({
                client_types: ['org', 'ip', 'org'],
                supply_types: ['internet'],
                required_fields: ['sale_date', 'sale_date'],
                optional_fields: ['invoice_number'],
            }),
            fakeFile(),
        );

        expect(dto.client_types).toEqual(['org', 'ip']);
        expect(dto.supply_types).toEqual(['internet']);
        expect(dto.required_fields).toEqual(['sale_date']);
        expect(dto.optional_fields).toEqual(['invoice_number']);
    });

    it('common не отправляет portal_id и agent_id', () => {
        const dto = buildCreatePayload(
            formValues({ scope: 'common', portal_id: '7', agent_id: '42' }),
            fakeFile(),
        );

        expect(dto).not.toHaveProperty('portal_id');
        expect(dto).not.toHaveProperty('agent_id');
        expect(dto.scope).toBe('common');
    });

    it('provider отправляет оба id строками', () => {
        const dto = buildCreatePayload(
            formValues({ scope: 'provider', portal_id: '7', agent_id: '42' }),
            fakeFile(),
        );

        expect(dto.portal_id).toBe('7');
        expect(dto.agent_id).toBe('42');
        // id остаются строками: в БД это BIGINT.
        expect(typeof dto.portal_id).toBe('string');
    });

    it('название обрезается, пустое описание не отправляется', () => {
        const dto = buildCreatePayload(
            formValues({ name: '  Отчёт  ', description: '   ' }),
            fakeFile(),
        );

        expect(dto.name).toBe('Отчёт');
        expect(dto).not.toHaveProperty('description');
    });

    it('файл шаблона обязателен и попадает в тело; демо — только если выбрано', () => {
        const file = fakeFile();
        const withoutDemo = buildCreatePayload(formValues(), file);
        expect(withoutDemo.file).toBe(file);
        expect(withoutDemo).not.toHaveProperty('demo');

        const demo = fakeFile('demo.docx');
        const withDemo = buildCreatePayload(formValues({ demo }), file);
        expect(withDemo.demo).toBe(demo);
    });

    it('флаги передаются как есть', () => {
        const dto = buildCreatePayload(
            formValues({ is_default: true, is_active: false }),
            fakeFile(),
        );
        expect(dto.is_default).toBe(true);
        expect(dto.is_active).toBe(false);
    });
});

describe('buildUpdatePayload: пустой выбор ОТПРАВЛЯЕТСЯ как сброс', () => {
    it('пустые списки уходят как [] — иначе снять ограничение невозможно', () => {
        const dto = buildUpdatePayload(formValues());

        expect(dto.client_types).toEqual([]);
        expect(dto.supply_types).toEqual([]);
        expect(dto.required_fields).toEqual([]);
        expect(dto.optional_fields).toEqual([]);
    });

    it('common отправляет пустые строки: «перевести в общие», «снять поставщика»', () => {
        const dto = buildUpdatePayload(
            formValues({ scope: 'common', portal_id: '7', agent_id: '42' }),
        );

        expect(dto.portal_id).toBe('');
        expect(dto.agent_id).toBe('');
    });

    it('portal отправляет портал и пустого поставщика', () => {
        const dto = buildUpdatePayload(
            formValues({ scope: 'portal', portal_id: '7', agent_id: '42' }),
        );

        expect(dto.portal_id).toBe('7');
        expect(dto.agent_id).toBe('');
    });

    it('пустое описание отправляется пустой строкой (сброс), а не опускается', () => {
        expect(buildUpdatePayload(formValues({ description: '' })).description).toBe(
            '',
        );
    });

    it('файлы отправляются только если выбраны: иначе текущие остаются', () => {
        const dto = buildUpdatePayload(formValues());
        expect(dto).not.toHaveProperty('file');
        expect(dto).not.toHaveProperty('demo');

        const file = fakeFile();
        const withFile = buildUpdatePayload(formValues({ file }));
        expect(withFile.file).toBe(file);
    });

    it('списки нормализуются от повторов и при обновлении', () => {
        const dto = buildUpdatePayload(
            formValues({ supply_types: ['proxima', 'proxima'] }),
        );
        expect(dto.supply_types).toEqual(['proxima']);
    });
});

describe('formValuesOfTemplate: строка → начальные значения формы', () => {
    it('null-списки превращаются в пустые массивы, не в undefined', () => {
        const values = formValuesOfTemplate(template());

        expect(values.client_types).toEqual([]);
        expect(values.supply_types).toEqual([]);
        expect(values.required_fields).toEqual([]);
        expect(values.optional_fields).toEqual([]);
    });

    it('общий шаблон открывается на уровне common с пустыми id', () => {
        const values = formValuesOfTemplate(template());

        expect(values.scope).toBe('common');
        expect(values.portal_id).toBe('');
        expect(values.agent_id).toBe('');
    });

    it('портальный шаблон с поставщиком открывается на уровне provider', () => {
        const values = formValuesOfTemplate(
            template({ portal_id: '7', agent_id: '42' }),
        );

        expect(values.scope).toBe('provider');
        expect(values.portal_id).toBe('7');
        expect(values.agent_id).toBe('42');
    });

    it('круговой проход: строка → форма → тело обновления сохраняет выбор', () => {
        const row = template({
            portal_id: '7',
            agent_id: '42',
            client_types: ['org', 'ip'],
            supply_types: ['internet'],
            required_fields: ['sale_date'],
            optional_fields: ['invoice_number'],
            description: 'Редакция',
        });

        const dto = buildUpdatePayload(formValuesOfTemplate(row));

        expect(dto.portal_id).toBe('7');
        expect(dto.agent_id).toBe('42');
        expect(dto.client_types).toEqual(['org', 'ip']);
        expect(dto.supply_types).toEqual(['internet']);
        expect(dto.required_fields).toEqual(['sale_date']);
        expect(dto.optional_fields).toEqual(['invoice_number']);
        expect(dto.description).toBe('Редакция');
    });
});

describe('emptyFormValues', () => {
    it('в глобальном дереве уровень по умолчанию — common', () => {
        const values = emptyFormValues();
        expect(values.scope).toBe('common');
        expect(values.portal_id).toBe('');
    });

    it('в портальном дереве портал подставлен, уровень — portal', () => {
        const values = emptyFormValues('7');
        expect(values.scope).toBe('portal');
        expect(values.portal_id).toBe('7');
    });

    it('новый шаблон активен, но не «по умолчанию»', () => {
        expect(emptyFormValues().is_active).toBe(true);
        expect(emptyFormValues().is_default).toBe(false);
    });
});
