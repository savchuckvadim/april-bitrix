/**
 * Проверка файла до отправки и форматирование веса и размеров: тип и вес
 * отсекаются на клиенте, остальное проверяет бэк.
 */

import { describe, expect, it } from 'vitest';
import {
    PROVIDER_IMAGE_ACCEPT,
    PROVIDER_IMAGE_MAX_BYTES,
    type ProviderImage,
} from '../model';
import {
    checkProviderImageFile,
    describeProviderImage,
    formatFileSize,
    formatImageDimensions,
} from './provider-image-file.util';

const KB = 1024;
const MB = KB * KB;

const file = (name: string, type: string, size: number) => ({ name, type, size });

describe('checkProviderImageFile', () => {
    it('PNG и JPG в пределах 2 МБ подходят', () => {
        expect(checkProviderImageFile(file('stamp.png', 'image/png', 300 * KB))).toBeNull();
        expect(checkProviderImageFile(file('sign.jpg', 'image/jpeg', MB))).toBeNull();
    });

    it('ровно 2 МБ подходит, на байт больше — отказ с весом и пределом', () => {
        expect(
            checkProviderImageFile(file('a.png', 'image/png', PROVIDER_IMAGE_MAX_BYTES)),
        ).toBeNull();
        const message = checkProviderImageFile(
            file('a.png', 'image/png', PROVIDER_IMAGE_MAX_BYTES + 1),
        );
        expect(message).toContain('2,0 МБ');
        expect(message).toContain('предел');
    });

    it('WebP, GIF, SVG, PDF — отказ с подсказкой про PNG и JPG', () => {
        for (const type of ['image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']) {
            expect(checkProviderImageFile(file('f', type, KB)), type).toContain('PNG и JPG');
        }
    });

    it('MIME-типа нет: тип берётся по расширению имени', () => {
        expect(checkProviderImageFile(file('печать.PNG', '', KB))).toBeNull();
        expect(checkProviderImageFile(file('печать.jpeg', '', KB))).toBeNull();
        expect(checkProviderImageFile(file('печать.heic', '', KB))).toContain('PNG и JPG');
        expect(checkProviderImageFile(file('без-расширения', '', KB))).toContain('PNG и JPG');
    });

    it('пустой файл — отказ', () => {
        expect(checkProviderImageFile(file('a.png', 'image/png', 0))).toContain('пустой');
    });

    it('диалог выбора файла показывает только PNG и JPG', () => {
        expect(PROVIDER_IMAGE_ACCEPT).toBe('image/png,image/jpeg');
    });
});

describe('formatFileSize', () => {
    it('мегабайты с запятой, мелкое — в килобайтах и байтах', () => {
        expect(formatFileSize(2 * MB)).toBe('2,0 МБ');
        expect(formatFileSize(2.45 * MB)).toBe('2,5 МБ');
        expect(formatFileSize(640 * KB)).toBe('640 КБ');
        expect(formatFileSize(KB)).toBe('1 КБ');
        expect(formatFileSize(512)).toBe('512 Б');
        expect(formatFileSize(0)).toBe('0 Б');
    });
});

describe('formatImageDimensions и describeProviderImage', () => {
    const image: Pick<ProviderImage, 'format' | 'width' | 'height' | 'size'> = {
        format: 'png',
        width: 600,
        height: 400,
        size: 84 * KB,
    };

    it('размеры в пикселях через знак умножения', () => {
        expect(formatImageDimensions(600, 400)).toBe('600 × 400 px');
    });

    it('сводка: формат, размеры и вес', () => {
        expect(describeProviderImage(image)).toBe('PNG · 600 × 400 px · 84 КБ');
        expect(describeProviderImage({ ...image, format: 'jpg', size: 1.5 * MB })).toBe(
            'JPG · 600 × 400 px · 1,5 МБ',
        );
    });
});
