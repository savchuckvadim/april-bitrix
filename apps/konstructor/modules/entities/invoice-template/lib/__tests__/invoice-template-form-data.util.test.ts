import { describe, expect, it } from 'vitest';
import type {
    InvoiceTemplateCreateInput,
    InvoiceTemplateUpdateInput,
} from '../../model';
import {
    buildCreateFormData,
    buildUpdateFormData,
} from '../invoice-template-form-data.util';

const docx = (): File => new File(['docx-bytes'], 'invoice.docx');

const createInput = (
    patch: Partial<InvoiceTemplateCreateInput> = {},
): InvoiceTemplateCreateInput => ({
    name: 'Счёт',
    description: '',
    visibility: 'portal',
    portalId: '7',
    agentId: null,
    clientTypes: [],
    supplyTypes: [],
    isDefault: false,
    isActive: true,
    creatorBitrixUserId: null,
    file: docx(),
    ...patch,
});

const updateInput = (
    patch: Partial<InvoiceTemplateUpdateInput> = {},
): InvoiceTemplateUpdateInput => ({
    name: 'Счёт',
    description: '',
    visibility: 'portal',
    portalId: '7',
    agentId: null,
    clientTypes: [],
    supplyTypes: [],
    isDefault: false,
    isActive: true,
    file: null,
    ...patch,
});

describe('multipart создания', () => {
    it('пустые списки критериев опускаются: отсутствие поля значит «подходит любому»', () => {
        const form = buildCreateFormData(createInput());

        expect(form.has('client_types')).toBe(false);
        expect(form.has('supply_types')).toBe(false);
    });

    it('заполненные списки уходят JSON-строкой', () => {
        const form = buildCreateFormData(
            createInput({
                clientTypes: ['org', 'ip'],
                supplyTypes: ['proxima'],
            }),
        );

        expect(form.get('client_types')).toBe('["org","ip"]');
        expect(form.get('supply_types')).toBe('["proxima"]');
    });

    it('обязательные поля на месте, файл приложен', () => {
        const form = buildCreateFormData(createInput());

        expect(form.get('name')).toBe('Счёт');
        expect(form.get('visibility')).toBe('portal');
        expect(form.get('portal_id')).toBe('7');
        expect(form.get('is_default')).toBe('false');
        expect(form.get('is_active')).toBe('true');
        expect(form.get('file')).toBeInstanceOf(File);
    });

    it('общий шаблон: без портала и поставщика', () => {
        const form = buildCreateFormData(
            createInput({ visibility: 'public', portalId: null }),
        );

        expect(form.has('portal_id')).toBe(false);
        expect(form.has('agent_id')).toBe(false);
    });

    it('поставщик и автор уходят, когда заданы; пустое описание нет', () => {
        const form = buildCreateFormData(
            createInput({
                visibility: 'provider',
                agentId: '3',
                creatorBitrixUserId: '15',
            }),
        );

        expect(form.get('agent_id')).toBe('3');
        expect(form.get('creator_bitrix_user_id')).toBe('15');
        expect(form.has('description')).toBe(false);
    });

    it('id остаются строками: значение выше 2^53 не искажается', () => {
        const form = buildCreateFormData(
            createInput({ portalId: '9007199254740993' }),
        );

        expect(form.get('portal_id')).toBe('9007199254740993');
    });
});

describe('multipart правки', () => {
    // РЕГРЕССИЯ из админки: пустой список терялся, и ограничение нельзя было снять.
    it('пустые списки критериев уходят как "[]": это сброс в «любой»', () => {
        const form = buildUpdateFormData(updateInput());

        expect(form.get('client_types')).toBe('[]');
        expect(form.get('supply_types')).toBe('[]');
    });

    it('"[]" начинается с "[": parseMultipartList бэка вернёт пустой массив', () => {
        const raw = buildUpdateFormData(updateInput()).get('client_types');

        expect(typeof raw).toBe('string');
        expect(raw as string).toMatch(/^\[/);
        expect(JSON.parse(raw as string)).toEqual([]);
    });

    it('снятие одного ограничения не трогает второе', () => {
        const form = buildUpdateFormData(
            updateInput({ clientTypes: [], supplyTypes: ['internet'] }),
        );

        expect(form.get('client_types')).toBe('[]');
        expect(form.get('supply_types')).toBe('["internet"]');
    });

    it('файл приложен только новый', () => {
        expect(buildUpdateFormData(updateInput()).has('file')).toBe(false);
        expect(
            buildUpdateFormData(updateInput({ file: docx() })).has('file'),
        ).toBe(true);
    });

    it('пустое описание уходит пустой строкой: так его можно стереть', () => {
        const form = buildUpdateFormData(updateInput({ description: '' }));

        expect(form.get('description')).toBe('');
    });

    it('привязка: общий без портала, поставщик с обоими', () => {
        const publicForm = buildUpdateFormData(
            updateInput({ visibility: 'public', portalId: null }),
        );
        const providerForm = buildUpdateFormData(
            updateInput({ visibility: 'provider', agentId: '3' }),
        );

        expect(publicForm.get('visibility')).toBe('public');
        expect(publicForm.has('portal_id')).toBe(false);
        expect(providerForm.get('portal_id')).toBe('7');
        expect(providerForm.get('agent_id')).toBe('3');
    });
});
