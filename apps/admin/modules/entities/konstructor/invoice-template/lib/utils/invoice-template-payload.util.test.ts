import { describe, expect, it } from 'vitest';
import {
    AGENT_ID_REQUIRED_MESSAGE,
    FILE_REQUIRED_MESSAGE,
    PORTAL_ID_REQUIRED_MESSAGE,
    buildCreateInvoiceTemplatePayload,
    buildInvoiceTemplateListParams,
    buildUpdateInvoiceTemplatePayload,
    normalizeCriteriaList,
    validateInvoiceTemplateScope,
} from './invoice-template-payload.util';
import type { IInvoiceTemplateFormValues } from '../../model';

/** Минимально валидные значения формы: общий шаблон с файлом. */
const baseValues = (
    patch: Partial<IInvoiceTemplateFormValues> = {},
): IInvoiceTemplateFormValues => ({
    name: 'Счёт на оплату',
    visibility: 'public',
    portal_id: '',
    agent_id: '',
    client_types: [],
    supply_types: [],
    description: '',
    type: 'word',
    is_default: false,
    is_active: true,
    file: new Blob(['docx']),
    ...patch,
});

describe('normalizeCriteriaList: пустой выбор = «подходит любому»', () => {
    it('пустой список, null и undefined дают undefined — поле опускается', () => {
        expect(normalizeCriteriaList([])).toBeUndefined();
        expect(normalizeCriteriaList(null)).toBeUndefined();
        expect(normalizeCriteriaList(undefined)).toBeUndefined();
    });

    it('непустой список остаётся списком', () => {
        expect(normalizeCriteriaList(['ip', 'org'])).toEqual(['ip', 'org']);
    });

    it('повторы из multiselect`а не уезжают на бэк', () => {
        expect(normalizeCriteriaList(['ip', 'ip', 'org'])).toEqual([
            'ip',
            'org',
        ]);
    });
});

describe('validateInvoiceTemplateScope: зеркало проверки бэкенда', () => {
    it('для «Общий» ни портал, ни поставщик не обязательны', () => {
        expect(
            validateInvoiceTemplateScope({ visibility: 'public' }),
        ).toEqual([]);
    });

    it('для «Портал» без портала даёт ошибку поля portal_id', () => {
        expect(validateInvoiceTemplateScope({ visibility: 'portal' })).toEqual([
            { field: 'portal_id', message: PORTAL_ID_REQUIRED_MESSAGE },
        ]);
    });

    it('для «Портал» с порталом ошибок нет; поставщик не требуется', () => {
        expect(
            validateInvoiceTemplateScope({
                visibility: 'portal',
                portal_id: '42',
            }),
        ).toEqual([]);
    });

    it('для «Поставщик» без портала и поставщика даёт ОБЕ ошибки', () => {
        expect(
            validateInvoiceTemplateScope({ visibility: 'provider' }),
        ).toEqual([
            { field: 'portal_id', message: PORTAL_ID_REQUIRED_MESSAGE },
            { field: 'agent_id', message: AGENT_ID_REQUIRED_MESSAGE },
        ]);
    });

    it('для «Поставщик» с порталом, но без поставщика — ошибка agent_id', () => {
        expect(
            validateInvoiceTemplateScope({
                visibility: 'provider',
                portal_id: '42',
            }),
        ).toEqual([
            { field: 'agent_id', message: AGENT_ID_REQUIRED_MESSAGE },
        ]);
    });

    it('строка из одних пробелов не считается заполненным полем', () => {
        expect(
            validateInvoiceTemplateScope({
                visibility: 'portal',
                portal_id: '   ',
            }),
        ).toEqual([
            { field: 'portal_id', message: PORTAL_ID_REQUIRED_MESSAGE },
        ]);
    });
});

describe('buildCreateInvoiceTemplatePayload', () => {
    it('пустые критерии ОПУСКАЮТСЯ, а не уезжают как []', () => {
        const result = buildCreateInvoiceTemplatePayload(baseValues());

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect('client_types' in result.dto).toBe(false);
        expect('supply_types' in result.dto).toBe(false);
    });

    it('выбранные критерии попадают в DTO', () => {
        const result = buildCreateInvoiceTemplatePayload(
            baseValues({
                client_types: ['ip', 'org'],
                supply_types: ['internet'],
            }),
        );

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.dto.client_types).toEqual(['ip', 'org']);
        expect(result.dto.supply_types).toEqual(['internet']);
    });

    it('пустые необязательные строки опускаются, а не уезжают пустыми', () => {
        const result = buildCreateInvoiceTemplatePayload(baseValues());

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect('portal_id' in result.dto).toBe(false);
        expect('agent_id' in result.dto).toBe(false);
        expect('description' in result.dto).toBe(false);
    });

    it('ID остаются СТРОКАМИ и не приводятся к числу', () => {
        const result = buildCreateInvoiceTemplatePayload(
            baseValues({
                visibility: 'provider',
                // Значение больше 2^53: приведение к number потеряло бы точность.
                portal_id: '9007199254740993',
                agent_id: '7',
            }),
        );

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.dto.portal_id).toBe('9007199254740993');
        expect(result.dto.agent_id).toBe('7');
    });

    it('без файла — ошибка поля file, а не запрос без файла', () => {
        const result = buildCreateInvoiceTemplatePayload(
            baseValues({ file: undefined }),
        );

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.errors).toContainEqual({
            field: 'file',
            message: FILE_REQUIRED_MESSAGE,
        });
    });

    it('нарушение области видимости не доходит до запроса', () => {
        const result = buildCreateInvoiceTemplatePayload(
            baseValues({ visibility: 'portal', portal_id: '' }),
        );

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.errors).toContainEqual({
            field: 'portal_id',
            message: PORTAL_ID_REQUIRED_MESSAGE,
        });
    });

    it('название обрезается по краям', () => {
        const result = buildCreateInvoiceTemplatePayload(
            baseValues({ name: '  Счёт  ' }),
        );

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.dto.name).toBe('Счёт');
    });
});

describe('buildUpdateInvoiceTemplatePayload', () => {
    it('без файла обновление проходит: текущий файл остаётся', () => {
        const result = buildUpdateInvoiceTemplatePayload(
            baseValues({ file: undefined }),
        );

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect('file' in result.dto).toBe(false);
    });

    it('переданный файл попадает в DTO', () => {
        const file = new Blob(['docx']);
        const result = buildUpdateInvoiceTemplatePayload(baseValues({ file }));

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.dto.file).toBe(file);
    });

    it('область видимости проверяется так же, как при создании', () => {
        const result = buildUpdateInvoiceTemplatePayload(
            baseValues({ visibility: 'provider', portal_id: '42' }),
        );

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.errors).toEqual([
            { field: 'agent_id', message: AGENT_ID_REQUIRED_MESSAGE },
        ]);
    });

    it('пустые критерии опускаются — на бэке это NULL, «подходит любому»', () => {
        const result = buildUpdateInvoiceTemplatePayload(baseValues());

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect('client_types' in result.dto).toBe(false);
    });
});

describe('buildInvoiceTemplateListParams: серверная фильтрация', () => {
    it('пустые фильтры дают пустые параметры, а не visibility=""', () => {
        expect(
            buildInvoiceTemplateListParams({
                visibility: '',
                portal_id: '',
                agent_id: '',
                search: '',
                is_archived: false,
            }),
        ).toEqual({});
    });

    it('заполненные фильтры уезжают в query', () => {
        expect(
            buildInvoiceTemplateListParams({
                visibility: 'portal',
                portal_id: '42',
                agent_id: '7',
                is_active: true,
                is_archived: true,
                search: 'счёт',
            }),
        ).toEqual({
            visibility: 'portal',
            portal_id: '42',
            agent_id: '7',
            is_active: true,
            is_archived: true,
            search: 'счёт',
        });
    });

    it('is_active=false — осмысленное значение и передаётся', () => {
        expect(
            buildInvoiceTemplateListParams({ is_active: false }),
        ).toEqual({ is_active: false });
    });

    it('is_archived=false опускается: бэк и так скрывает архив', () => {
        expect(
            buildInvoiceTemplateListParams({ is_archived: false }),
        ).toEqual({});
    });

    it('поиск обрезается по краям', () => {
        expect(buildInvoiceTemplateListParams({ search: '  счёт  ' })).toEqual({
            search: 'счёт',
        });
    });
});
