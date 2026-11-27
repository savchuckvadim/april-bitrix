/**
 * Тесты СЕРИАЛИЗАЦИИ multipart-тел шаблона счёта.
 *
 * Отдельно от `invoice-template-payload.util.test.ts`: тот проверяет
 * нормализацию значений формы в DTO, а здесь проверяется, доезжает ли DTO до
 * бэкенда без потерь. Регрессия была на этом стыке: пустой список критериев
 * не попадал в тело PUT, и ограничение нельзя было снять обратно в «любой».
 *
 * `.test.ts`, а НЕ `.test.tsx`: `vitest.config.ts` собирает только
 * `modules/**\/*.test.ts`. Чистая логика без React.
 */
import { describe, expect, it } from 'vitest';
import {
    buildCreateInvoiceTemplateFormData,
    buildUpdateInvoiceTemplateFormData,
} from './invoice-template-form-data.util';
import { buildUpdateInvoiceTemplatePayload } from './invoice-template-payload.util';
import type { IInvoiceTemplateFormValues } from '../../model';

const docxFile = (name = 'invoice.docx'): File =>
    new File(['docx-bytes'], name, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

describe('multipart создания', () => {
    it('пустые списки критериев ОПУСКАЮТСЯ: отсутствие поля = «подходит любому»', () => {
        const form = buildCreateInvoiceTemplateFormData({
            name: 'Счёт',
            client_types: [],
            supply_types: undefined,
            file: docxFile(),
        });

        expect(form.has('client_types')).toBe(false);
        expect(form.has('supply_types')).toBe(false);
    });

    it('заполненные списки уходят JSON-строкой', () => {
        const form = buildCreateInvoiceTemplateFormData({
            name: 'Счёт',
            client_types: ['org', 'ip'],
            supply_types: ['proxima'],
            file: docxFile(),
        });

        expect(form.get('client_types')).toBe('["org","ip"]');
        expect(form.get('supply_types')).toBe('["proxima"]');
    });

    it('название и файл на месте, пустые необязательные поля не уходят', () => {
        const form = buildCreateInvoiceTemplateFormData({
            name: 'Счёт',
            description: '',
            file: docxFile(),
        });

        expect(form.get('name')).toBe('Счёт');
        expect(form.has('file')).toBe(true);
        expect(form.has('description')).toBe(false);
        expect(form.has('portal_id')).toBe(false);
    });

    it('булевы флаги уходят строками', () => {
        const form = buildCreateInvoiceTemplateFormData({
            name: 'Счёт',
            is_default: false,
            is_active: true,
            file: docxFile(),
        });

        expect(form.get('is_default')).toBe('false');
        expect(form.get('is_active')).toBe('true');
    });
});

describe('multipart обновления', () => {
    // РЕГРЕССИЯ: до исправления пустой список молча терялся, и сброс
    // критериев в «любой» не применялся.
    it('ПУСТОЙ список критериев отправляется как "[]" — это сброс в «любой»', () => {
        const form = buildUpdateInvoiceTemplateFormData({
            name: 'Счёт',
            client_types: [],
            supply_types: [],
        });

        expect(form.get('client_types')).toBe('[]');
        expect(form.get('supply_types')).toBe('[]');
    });

    it('"[]" начинается с "[", значит parseMultipartList вернёт массив, а не undefined', () => {
        const form = buildUpdateInvoiceTemplateFormData({ client_types: [] });

        const raw = form.get('client_types');
        expect(typeof raw).toBe('string');
        expect(raw as string).toMatch(/^\[/);
        expect(JSON.parse(raw as string)).toEqual([]);
    });

    it('незаданный список (undefined, null) НЕ отправляется — «не менять»', () => {
        const form = buildUpdateInvoiceTemplateFormData({
            name: 'Только имя',
            client_types: undefined,
            supply_types: null,
        });

        expect(form.has('client_types')).toBe(false);
        expect(form.has('supply_types')).toBe(false);
    });

    it('заполненный список уходит JSON-строкой', () => {
        const form = buildUpdateInvoiceTemplateFormData({
            supply_types: ['internet', 'proxima'],
        });

        expect(form.get('supply_types')).toBe('["internet","proxima"]');
    });

    it('файл добавляется только когда передан', () => {
        expect(
            buildUpdateInvoiceTemplateFormData({ name: 'А' }).has('file'),
        ).toBe(false);
        expect(
            buildUpdateInvoiceTemplateFormData({
                name: 'А',
                file: docxFile(),
            }).has('file'),
        ).toBe(true);
    });

    it('снятые в форме критерии доезжают до тела как "[]" (форма, DTO, multipart)', () => {
        const values: IInvoiceTemplateFormValues = {
            name: 'Счёт',
            visibility: 'public',
            portal_id: '',
            agent_id: '',
            client_types: [],
            supply_types: [],
            description: '',
            type: 'word',
            is_default: false,
            is_active: true,
        };

        const result = buildUpdateInvoiceTemplatePayload(values);
        expect(result.ok).toBe(true);
        if (!result.ok) return;

        const form = buildUpdateInvoiceTemplateFormData(result.dto);
        expect(form.get('client_types')).toBe('[]');
        expect(form.get('supply_types')).toBe('[]');
    });
});
