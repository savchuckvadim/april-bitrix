import { describe, expect, it } from 'vitest';
import {
    buildRenewalPdfDisposition,
    buildRenewalPdfFileName,
} from './renewal-pdf.name';

describe('buildRenewalPdfFileName', () => {
    it('подставляет имя клиента', () => {
        expect(buildRenewalPdfFileName('ООО Ромашка')).toBe(
            'Коммерческое предложение — ООО Ромашка.pdf',
        );
    });

    it('без имени клиента даёт обезличенное название', () => {
        expect(buildRenewalPdfFileName('')).toBe(
            'Коммерческое предложение.pdf',
        );
        expect(buildRenewalPdfFileName('   ')).toBe(
            'Коммерческое предложение.pdf',
        );
    });

    it('убирает символы, недопустимые в имени файла', () => {
        // Слэш из названия клиента иначе увёл бы файл в другой каталог.
        expect(buildRenewalPdfFileName('ООО "Ромашка"/Сервис')).toBe(
            'Коммерческое предложение — ООО Ромашка Сервис.pdf',
        );
    });

    it('не оставляет точку перед расширением', () => {
        expect(buildRenewalPdfFileName('ООО Ромашка.')).toBe(
            'Коммерческое предложение — ООО Ромашка.pdf',
        );
    });

    it('обрезает слишком длинное название', () => {
        const name = buildRenewalPdfFileName('Я'.repeat(200));
        expect(name.length).toBeLessThan(120);
        expect(name.endsWith('.pdf')).toBe(true);
    });
});

describe('buildRenewalPdfDisposition', () => {
    it('отдаёт кириллицу в filename* и ASCII-запас в filename', () => {
        const value = buildRenewalPdfDisposition('ООО Ромашка');
        expect(value).toContain('attachment;');
        expect(value).toContain('filename="offer.pdf"');
        expect(value).toContain("filename*=UTF-8''");
        // Сырая кириллица в заголовке ломает выдачу — только проценты.
        expect(value).toMatch(/^[\x20-\x7e]+$/);
    });
});
