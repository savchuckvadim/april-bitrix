/**
 * Тесты нормализации тел запросов шаблона договора.
 *
 * `.test.ts`, а НЕ `.test.tsx`: `vitest.config.ts` собирает только
 * `modules/**\/*.test.ts` при `environment: 'node'`, поэтому `.tsx`-файл
 * просто не попал бы в прогон и «зелёные» тесты ничего бы не проверяли.
 * Здесь чистая логика без React — ограничение не мешает.
 */
import { describe, expect, it } from 'vitest';
import type { IContractTemplate, IContractTemplateFormValues } from '../../model';
import {
    buildCreateContractTemplatePayload,
    buildUpdateContractTemplatePayload,
    contractTemplateToFormValues,
    emptyContractTemplateFormValues,
    isContractTemplateFormValid,
    scopeOfTemplate,
    validateContractTemplateForm,
} from './contract-template-payload.util';

/** Заглушка файла: в node-окружении vitest `File` есть (undici). */
const docxFile = (name = 'contract.docx'): File =>
    new File(['docx-bytes'], name, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

const formValues = (
    overrides: Partial<IContractTemplateFormValues> = {},
): IContractTemplateFormValues => ({
    name: 'Договор услуг, бюджетники',
    contract_type: 'service',
    scope: 'common',
    portal_id: '',
    agent_id: '',
    client_types: [],
    supply_types: [],
    description: '',
    is_default: false,
    is_active: true,
    file: docxFile(),
    demo: null,
    ...overrides,
});

describe('contract_type обязателен', () => {
    it('пустой тип договора — ошибка у поля, submit заблокирован', () => {
        const values = formValues({ contract_type: '' });

        const errors = validateContractTemplateForm(values);

        expect(errors.contract_type).toBeTruthy();
        expect(isContractTemplateFormValid(values)).toBe(false);
    });

    it('тело запроса НЕ собирается без типа договора', () => {
        expect(
            buildCreateContractTemplatePayload(formValues({ contract_type: '' })),
        ).toBeNull();
        expect(
            buildUpdateContractTemplatePayload(formValues({ contract_type: '' })),
        ).toBeNull();
    });

    it('заполненный тип договора попадает в оба тела', () => {
        const values = formValues({ contract_type: 'lic' });

        expect(buildCreateContractTemplatePayload(values)?.contract_type).toBe('lic');
        expect(buildUpdateContractTemplatePayload(values)?.contract_type).toBe('lic');
    });
});

describe('scope → portal_id / agent_id', () => {
    it('common: ни портала, ни поставщика (portal_id IS NULL = «Общий»)', () => {
        const payload = buildCreateContractTemplatePayload(
            // Значения в полях остались от прежнего выбора — они обязаны быть отброшены.
            formValues({
                scope: 'common',
                portal_id: '7',
                agent_id: '42',
            }),
        );

        expect(payload).not.toBeNull();
        expect(payload).not.toHaveProperty('portal_id');
        expect(payload).not.toHaveProperty('agent_id');
        expect(payload?.scope).toBe('common');
    });

    it('portal: портал есть, поставщика нет', () => {
        const payload = buildCreateContractTemplatePayload(
            formValues({
                scope: 'portal',
                portal_id: '7',
                agent_id: '42',
            }),
        );

        expect(payload?.portal_id).toBe('7');
        expect(payload).not.toHaveProperty('agent_id');
    });

    it('provider: и портал, и поставщик', () => {
        const payload = buildCreateContractTemplatePayload(
            formValues({
                scope: 'provider',
                portal_id: '7',
                agent_id: '42',
            }),
        );

        expect(payload?.portal_id).toBe('7');
        expect(payload?.agent_id).toBe('42');
    });

    it('portal без портала — ошибка у portal_id', () => {
        const errors = validateContractTemplateForm(
            formValues({ scope: 'portal', portal_id: '  ' }),
        );

        expect(errors.portal_id).toBeTruthy();
    });

    it('provider без поставщика — ошибка у agent_id', () => {
        const errors = validateContractTemplateForm(
            formValues({
                scope: 'provider',
                portal_id: '7',
                agent_id: '',
            }),
        );

        expect(errors.agent_id).toBeTruthy();
    });

    it('id остаются СТРОКАМИ: в БД это BIGINT, > 2^53 не влезает в number', () => {
        const hugeId = '9007199254740993';
        const payload = buildCreateContractTemplatePayload(
            formValues({ scope: 'portal', portal_id: hugeId }),
        );

        expect(payload?.portal_id).toBe(hugeId);
        expect(typeof payload?.portal_id).toBe('string');
    });
});

describe('пустые списки признаков', () => {
    it('create: пустые client_types/supply_types ОПУСКАЮТСЯ («подходит любому»)', () => {
        const payload = buildCreateContractTemplatePayload(
            formValues({ client_types: [], supply_types: [] }),
        );

        expect(payload).not.toBeNull();
        expect(payload).not.toHaveProperty('client_types');
        expect(payload).not.toHaveProperty('supply_types');
    });

    it('create: заполненные списки отправляются', () => {
        const payload = buildCreateContractTemplatePayload(
            formValues({
                client_types: ['org_state', 'ip'],
                supply_types: ['internet'],
            }),
        );

        expect(payload?.client_types).toEqual(['org_state', 'ip']);
        expect(payload?.supply_types).toEqual(['internet']);
    });

    it('create: дубликаты кодов снимаются', () => {
        const payload = buildCreateContractTemplatePayload(
            formValues({
                client_types: ['org', 'org'],
            }),
        );

        expect(payload?.client_types).toEqual(['org']);
    });

    it('update: пустой массив ОТПРАВЛЯЕТСЯ — это сброс обратно в «любой»', () => {
        // Отсутствие поля в PATCH означает «не менять», поэтому опустить его
        // здесь нельзя: сброс стал бы невыразимым.
        const payload = buildUpdateContractTemplatePayload(
            formValues({ client_types: [], supply_types: [] }),
        );

        expect(payload?.client_types).toEqual([]);
        expect(payload?.supply_types).toEqual([]);
    });
});

describe('update: сужение области', () => {
    it('перевод в общие отправляет ПУСТЫЕ строки portal_id и agent_id', () => {
        const payload = buildUpdateContractTemplatePayload(
            formValues({
                scope: 'common',
                portal_id: '7',
                agent_id: '42',
            }),
        );

        expect(payload?.portal_id).toBe('');
        expect(payload?.agent_id).toBe('');
    });

    it('снятие поставщика при scope=portal оставляет портал', () => {
        const payload = buildUpdateContractTemplatePayload(
            formValues({
                scope: 'portal',
                portal_id: '7',
                agent_id: '42',
            }),
        );

        expect(payload?.portal_id).toBe('7');
        expect(payload?.agent_id).toBe('');
    });

    it('файл не обязателен при редактировании, но обязателен при создании', () => {
        const withoutFile = formValues({ file: null });

        expect(validateContractTemplateForm(withoutFile, { mode: 'create' }).file)
            .toBeTruthy();
        expect(validateContractTemplateForm(withoutFile, { mode: 'edit' }).file)
            .toBeUndefined();
    });
});

describe('create: прочие поля', () => {
    it('название обрезается, пустое описание опускается', () => {
        const payload = buildCreateContractTemplatePayload(
            formValues({ name: '  Абонентский  ', description: '   ' }),
        );

        expect(payload?.name).toBe('Абонентский');
        expect(payload).not.toHaveProperty('description');
    });

    it('demo попадает в тело только если файл выбран', () => {
        expect(buildCreateContractTemplatePayload(formValues())).not.toHaveProperty(
            'demo',
        );
        expect(
            buildCreateContractTemplatePayload(formValues({ demo: docxFile('demo.docx') }))
                ?.demo,
        ).toBeInstanceOf(File);
    });

    it('пустое название — ошибка', () => {
        expect(validateContractTemplateForm(formValues({ name: ' ' })).name).toBeTruthy();
    });
});

describe('обратный вывод scope из сохранённой строки', () => {
    const template = (
        overrides: Partial<IContractTemplate> = {},
    ): IContractTemplate => ({
        id: '42',
        name: 'Лицензионный',
        code: 'contract-lic-1',
        contract_type: 'lic',
        client_types: null,
        supply_types: ['proxima'],
        description: null,
        is_default: true,
        is_active: true,
        is_archived: false,
        archived_at: null,
        portal_id: null,
        agent_id: null,
        creator_bitrix_user_id: null,
        created_at: null,
        updated_at: null,
        template_url: '/api/contract-templates/42/download',
        demo_url: null,
        ...overrides,
    });

    it('portal_id IS NULL → common', () => {
        expect(scopeOfTemplate(template())).toBe('common');
    });

    it('портал без поставщика → portal', () => {
        expect(scopeOfTemplate(template({ portal_id: '7' }))).toBe('portal');
    });

    it('портал с поставщиком → provider', () => {
        expect(scopeOfTemplate(template({ portal_id: '7', agent_id: '42' }))).toBe(
            'provider',
        );
    });

    it('null-списки превращаются в пустые массивы формы (пустой multiselect = «любой»)', () => {
        const values = contractTemplateToFormValues(template());

        expect(values.client_types).toEqual([]);
        expect(values.supply_types).toEqual(['proxima']);
        expect(values.scope).toBe('common');
        expect(values.portal_id).toBe('');
    });

    it('круговой обход: строка → форма → тело PATCH сохраняет область', () => {
        const values = contractTemplateToFormValues(
            template({ portal_id: '7', agent_id: '42' }),
        );
        const payload = buildUpdateContractTemplatePayload(values);

        expect(payload?.portal_id).toBe('7');
        expect(payload?.agent_id).toBe('42');
        expect(payload?.contract_type).toBe('lic');
    });
});

describe('значения формы по умолчанию', () => {
    it('в глобальном дереве — общий шаблон, активен, без типа договора', () => {
        const values = emptyContractTemplateFormValues();

        expect(values.scope).toBe('common');
        expect(values.portal_id).toBe('');
        expect(values.is_active).toBe(true);
        // Тип договора не подставляется: «по умолчанию» здесь не бывает.
        expect(values.contract_type).toBe('');
    });

    it('в портальном дереве — портальный шаблон с подставленным порталом', () => {
        const values = emptyContractTemplateFormValues('7');

        expect(values.scope).toBe('portal');
        expect(values.portal_id).toBe('7');
    });
});
