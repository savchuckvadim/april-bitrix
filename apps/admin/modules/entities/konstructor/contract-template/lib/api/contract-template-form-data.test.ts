/**
 * Тесты СЕРИАЛИЗАЦИИ multipart-тел шаблона договора.
 *
 * Зачем отдельно от `contract-template-payload.test.ts`: тот проверяет
 * нормализацию значений формы в DTO, но НЕ проверяет, доезжает ли DTO до
 * бэкенда без потерь. Регрессия была именно на этом стыке: пустой
 * `client_types` корректно попадал в тело PATCH, а затем молча исчезал при
 * сборке multipart, если пользователь заодно заменял файл шаблона.
 *
 * `.test.ts`, а НЕ `.test.tsx`: `vitest.config.ts` собирает только
 * `modules/**\/*.test.ts`. Чистая логика без React.
 */
import { describe, expect, it } from 'vitest';
import { buildCreateFormData, buildUpdateFormData } from './contract-template.helper';

const docxFile = (name = 'contract.docx'): File =>
    new File(['docx-bytes'], name, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

describe('multipart создания', () => {
    it('пустые списки признаков ОПУСКАЮТСЯ: отсутствие поля = «подходит любому»', () => {
        const formData = buildCreateFormData({
            name: 'Договор услуг',
            contract_type: 'service',
            client_types: undefined,
            supply_types: undefined,
            file: docxFile(),
        });

        expect(formData.has('client_types')).toBe(false);
        expect(formData.has('supply_types')).toBe(false);
    });

    it('заполненные списки уходят JSON-строкой', () => {
        const formData = buildCreateFormData({
            name: 'Договор услуг',
            contract_type: 'service',
            client_types: ['org', 'ip'],
            supply_types: ['proxima'],
            file: docxFile(),
        });

        expect(formData.get('client_types')).toBe('["org","ip"]');
        expect(formData.get('supply_types')).toBe('["proxima"]');
    });

    it('обязательные поля на месте, demo — только при наличии файла', () => {
        const withoutDemo = buildCreateFormData({
            name: 'Лицензионный',
            contract_type: 'lic',
            file: docxFile(),
        });

        expect(withoutDemo.get('name')).toBe('Лицензионный');
        expect(withoutDemo.get('contract_type')).toBe('lic');
        expect(withoutDemo.has('file')).toBe(true);
        expect(withoutDemo.has('demo')).toBe(false);

        const withDemo = buildCreateFormData({
            name: 'Лицензионный',
            contract_type: 'lic',
            file: docxFile(),
            demo: docxFile('demo.docx'),
        });
        expect(withDemo.has('demo')).toBe(true);
    });

    it('boolean приводится к строке, undefined не попадает в тело', () => {
        const formData = buildCreateFormData({
            name: 'Абонентский',
            contract_type: 'abon',
            is_default: false,
            is_active: true,
            file: docxFile(),
        });

        expect(formData.get('is_default')).toBe('false');
        expect(formData.get('is_active')).toBe('true');
        expect(formData.has('description')).toBe(false);
    });
});

describe('multipart обновления (замена файла)', () => {
    // РЕГРЕССИЯ: до исправления пустой массив молча терялся, и сброс
    // признаков в «любой» не применялся, если заодно заменяли .docx.
    it('ПУСТОЙ список признаков отправляется как "[]" — это сброс в «любой»', () => {
        const formData = buildUpdateFormData(
            {
                name: 'Договор услуг',
                contract_type: 'service',
                client_types: [],
                supply_types: [],
            },
            { file: docxFile() },
        );

        expect(formData.get('client_types')).toBe('[]');
        expect(formData.get('supply_types')).toBe('[]');
    });

    it('"[]" начинается с "[", значит parseMultipartList вернёт массив, а не undefined', () => {
        const formData = buildUpdateFormData(
            { client_types: [] },
            { file: docxFile() },
        );

        const raw = formData.get('client_types');
        expect(typeof raw).toBe('string');
        expect(raw as string).toMatch(/^\[/);
        expect(JSON.parse(raw as string)).toEqual([]);
    });

    it('незаданный список (undefined) НЕ отправляется — «не менять»', () => {
        const formData = buildUpdateFormData(
            { name: 'Только имя' },
            { file: docxFile() },
        );

        expect(formData.has('client_types')).toBe(false);
        expect(formData.has('supply_types')).toBe(false);
        expect(formData.get('name')).toBe('Только имя');
    });

    it('заполненные списки по-прежнему уходят JSON-строкой', () => {
        const formData = buildUpdateFormData(
            { client_types: ['org_state'], supply_types: ['internet'] },
            { file: docxFile() },
        );

        expect(formData.get('client_types')).toBe('["org_state"]');
        expect(formData.get('supply_types')).toBe('["internet"]');
    });

    it('пустые строки portal_id/agent_id отправляются — перевод в общие', () => {
        const formData = buildUpdateFormData(
            { portal_id: '', agent_id: '' },
            { file: docxFile() },
        );

        expect(formData.get('portal_id')).toBe('');
        expect(formData.get('agent_id')).toBe('');
    });

    it('файлы добавляются только когда переданы', () => {
        const onlyFile = buildUpdateFormData({ name: 'x' }, { file: docxFile() });
        expect(onlyFile.has('file')).toBe(true);
        expect(onlyFile.has('demo')).toBe(false);

        const noFiles = buildUpdateFormData({ name: 'x' }, {});
        expect(noFiles.has('file')).toBe(false);
        expect(noFiles.has('demo')).toBe(false);
    });
});
