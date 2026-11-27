import { describe, expect, it } from 'vitest';
import { INVOICE_CLIENT_TYPE_CODES } from '../invoice-template-criteria.util';
import {
    FILE_REQUIRED,
    NAME_REQUIRED,
    applyBindMode,
    emptyInvoiceTemplateForm,
    formValuesOfTemplate,
    toCreateInput,
    toUpdateInput,
    toggleCode,
    validateInvoiceTemplateForm,
} from '../invoice-template-form.util';
import { makeTemplate } from './fixtures';

const docx = (): File => new File(['docx'], 'invoice.docx');

describe('форма', () => {
    it('новая форма: активный шаблон без ограничений, поставщик только у режима «поставщик»', () => {
        expect(emptyInvoiceTemplateForm('portal', '3')).toMatchObject({
            bindMode: 'portal',
            agentId: null,
            clientTypes: [],
            supplyTypes: [],
            isActive: true,
            isDefault: false,
            file: null,
        });
        expect(emptyInvoiceTemplateForm('provider', '3').agentId).toBe('3');
    });

    it('значения для правки берутся из шаблона, null-критерии становятся пустыми списками', () => {
        const values = formValuesOfTemplate(
            makeTemplate({
                name: 'Счёт ИП',
                description: 'для ИП',
                visibility: 'provider',
                agentId: '3',
                clientTypes: ['ip'],
                supplyTypes: null,
                isDefault: true,
            }),
        );

        expect(values).toMatchObject({
            name: 'Счёт ИП',
            description: 'для ИП',
            bindMode: 'provider',
            agentId: '3',
            clientTypes: ['ip'],
            supplyTypes: [],
            isDefault: true,
            isActive: true,
            file: null,
        });
    });
});

describe('validateInvoiceTemplateForm', () => {
    const context = {
        isEditing: false,
        availableModes: ['portal', 'provider'] as const,
    };

    it('создание без названия и файла: две ошибки', () => {
        const errors = validateInvoiceTemplateForm(
            emptyInvoiceTemplateForm('portal'),
            context,
        );

        expect(errors).toEqual({ name: NAME_REQUIRED, file: FILE_REQUIRED });
    });

    it('правка без нового файла допустима', () => {
        const values = { ...emptyInvoiceTemplateForm('portal'), name: 'Счёт' };

        expect(
            validateInvoiceTemplateForm(values, { ...context, isEditing: true }),
        ).toEqual({});
    });

    it('название из одних пробелов не считается заполненным', () => {
        const values = {
            ...emptyInvoiceTemplateForm('portal'),
            name: '   ',
            file: docx(),
        };

        expect(validateInvoiceTemplateForm(values, context)).toEqual({
            name: NAME_REQUIRED,
        });
    });

    it('режим «поставщик» без поставщика: ошибка поля', () => {
        const values = {
            ...emptyInvoiceTemplateForm('provider'),
            name: 'Счёт',
            file: docx(),
        };

        expect(validateInvoiceTemplateForm(values, context).agentId).toBeTruthy();
    });

    it('недоступный режим привязки: ошибка режима', () => {
        const values = {
            ...emptyInvoiceTemplateForm('public'),
            name: 'Счёт',
            file: docx(),
        };

        expect(validateInvoiceTemplateForm(values, context).bindMode).toBeTruthy();
    });
});

describe('applyBindMode', () => {
    const base = { ...emptyInvoiceTemplateForm('portal'), name: 'Счёт' };

    it('«поставщик» подставляет первого поставщика портала', () => {
        const next = applyBindMode(base, 'provider', ['3', '5']);

        expect(next).toMatchObject({ bindMode: 'provider', agentId: '3' });
    });

    it('«поставщик» сохраняет прежний выбор, если он есть среди поставщиков', () => {
        const chosen = { ...base, bindMode: 'provider' as const, agentId: '5' };

        expect(applyBindMode(chosen, 'provider', ['3', '5']).agentId).toBe('5');
    });

    it('прежний выбор, которого нет среди поставщиков, заменяется первым', () => {
        const stale = { ...base, bindMode: 'provider' as const, agentId: '99' };

        expect(applyBindMode(stale, 'provider', ['3', '5']).agentId).toBe('3');
    });

    it('у портала без поставщиков поставщик null', () => {
        expect(applyBindMode(base, 'provider', []).agentId).toBeNull();
    });

    it('портал и общий режим сбрасывают поставщика, остальные поля остаются', () => {
        const chosen = { ...base, bindMode: 'provider' as const, agentId: '5' };

        expect(applyBindMode(chosen, 'portal', ['5'])).toMatchObject({
            bindMode: 'portal',
            agentId: null,
            name: 'Счёт',
        });
        expect(applyBindMode(chosen, 'public', ['5']).agentId).toBeNull();
    });
});

describe('toggleCode', () => {
    it('добавляет код в каноническом порядке, а не в порядке кликов', () => {
        const afterIp = toggleCode(INVOICE_CLIENT_TYPE_CODES, [], 'ip');
        const afterOrg = toggleCode(INVOICE_CLIENT_TYPE_CODES, afterIp, 'org');

        expect(afterOrg).toEqual(['org', 'ip']);
    });

    it('повторный выбор снимает код', () => {
        expect(
            toggleCode(INVOICE_CLIENT_TYPE_CODES, ['org', 'ip'], 'org'),
        ).toEqual(['ip']);
    });
});

describe('форма в данные запроса', () => {
    const values = {
        ...emptyInvoiceTemplateForm('provider', '3'),
        name: '  Счёт  ',
        description: '  описание  ',
        clientTypes: ['ip' as const],
        isDefault: true,
        file: docx(),
    };

    it('создание: привязка из режима, название и описание обрезаны, автор строкой', () => {
        expect(toCreateInput(values, 7, 15)).toMatchObject({
            visibility: 'provider',
            portalId: '7',
            agentId: '3',
            name: 'Счёт',
            description: 'описание',
            clientTypes: ['ip'],
            supplyTypes: [],
            isDefault: true,
            isActive: true,
            creatorBitrixUserId: '15',
        });
    });

    it('создание без пользователя Битрикса: автор null', () => {
        expect(toCreateInput(values, 7, 0)?.creatorBitrixUserId).toBeNull();
    });

    it('создание без файла не собирается', () => {
        expect(toCreateInput({ ...values, file: null }, 7, 15)).toBeNull();
    });

    it('правка: общий режим снимает портал и поставщика', () => {
        const input = toUpdateInput(
            { ...values, bindMode: 'public', agentId: '3' },
            7,
        );

        expect(input).toMatchObject({
            visibility: 'public',
            portalId: null,
            agentId: null,
        });
    });

    it('правка без нового файла: file null', () => {
        expect(toUpdateInput({ ...values, file: null }, 7).file).toBeNull();
    });

    it('снятые критерии остаются пустыми списками', () => {
        const input = toUpdateInput({ ...values, clientTypes: [] }, 7);

        expect(input.clientTypes).toEqual([]);
        expect(input.supplyTypes).toEqual([]);
    });
});
