/**
 * Транспорт загрузки шаблона договора: FormData обязана уйти multipart.
 *
 * Регрессия: у инстанса konstructor-API по умолчанию `application/json`, и
 * axios с таким заголовком перекладывает FormData в JSON — файл уезжал как
 * `{}`, бэк отвечал 400 «File is required». Тест держит заголовок у
 * создания и у правки с файлом; правка без файла остаётся JSON.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const customAxios = vi.fn();
vi.mock('@workspace/nest-konstructor-api', () => ({ customAxios }));

const { ContractTemplateHelper } = await import('./contract-template.helper');

const docxFile = (): File =>
    new File(['docx-bytes'], 'contract.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

const lastConfig = () => customAxios.mock.calls.at(-1)?.[0] as {
    data: unknown;
    headers?: Record<string, string>;
};

describe('загрузка шаблона договора', () => {
    const helper = new ContractTemplateHelper();

    beforeEach(() => {
        customAxios.mockReset();
        customAxios.mockResolvedValue({});
    });

    it('создание — FormData с файлом и multipart-заголовком', async () => {
        await helper.create({ name: 'Интернет', contract_type: 'service', file: docxFile() });

        const config = lastConfig();
        expect(config.data).toBeInstanceOf(FormData);
        expect((config.data as FormData).get('file')).toBeInstanceOf(File);
        expect(config.headers).toEqual({ 'Content-Type': 'multipart/form-data' });
    });

    it('правка с новым файлом — тоже multipart', async () => {
        await helper.update('7', { name: 'Интернет' }, { file: docxFile() });

        const config = lastConfig();
        expect(config.data).toBeInstanceOf(FormData);
        expect(config.headers).toEqual({ 'Content-Type': 'multipart/form-data' });
    });

    it('правка без файлов — обычный JSON без своего заголовка', async () => {
        await helper.update('7', { name: 'Интернет' });

        const config = lastConfig();
        expect(config.data).toEqual({ name: 'Интернет' });
        expect(config.headers).toBeUndefined();
    });
});
