/**
 * Проверка файла до отправки: не тот формат или слишком большой файл
 * отсекается сразу, а не после минуты загрузки ролика.
 */

import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { acceptFor, checkMediaFile, formatFileSize } from './check-media-file';
import { siteMediaErrorMessage } from './site-media-error';

const MB = 1024 * 1024;

describe('checkMediaFile', () => {
    it('скрин PNG/JPG/WebP и ролик MP4 в пределах лимита — подходят', () => {
        for (const type of ['image/png', 'image/jpeg', 'image/webp']) {
            expect(checkMediaFile({ type, size: MB }, 'image'), type).toBeNull();
            expect(checkMediaFile({ type, size: MB }, 'poster'), type).toBeNull();
        }
        expect(checkMediaFile({ type: 'video/mp4', size: 50 * MB }, 'video')).toBeNull();
    });

    it('MOV, HEIC и видео вместо постера — отказ с подсказкой, чем пересохранить', () => {
        expect(checkMediaFile({ type: 'video/quicktime', size: MB }, 'video')).toContain('MP4');
        expect(checkMediaFile({ type: 'image/heic', size: MB }, 'image')).toContain('HEIC');
        expect(checkMediaFile({ type: '', size: MB }, 'image')).toContain('PNG');
        expect(checkMediaFile({ type: 'video/mp4', size: MB }, 'poster')).toContain('PNG');
    });

    it('больше лимита — отказ: картинка до 10 МБ, видео до 80 МБ', () => {
        expect(checkMediaFile({ type: 'image/png', size: 10 * MB + 1 }, 'image')).toContain('10 МБ');
        expect(checkMediaFile({ type: 'video/mp4', size: 80 * MB + 1 }, 'video')).toContain('80 МБ');
    });

    it('диалог выбора показывает только нужные форматы', () => {
        expect(acceptFor('video')).toBe('video/mp4');
        expect(acceptFor('poster')).toBe('image/png,image/jpeg,image/webp');
    });
});

describe('formatFileSize', () => {
    it('мегабайты с запятой, мелкое — в килобайтах', () => {
        expect(formatFileSize(2.45 * MB)).toBe('2,5 МБ');
        expect(formatFileSize(640 * 1024)).toBe('640 КБ');
        expect(formatFileSize(10)).toBe('1 КБ');
    });
});

describe('siteMediaErrorMessage', () => {
    const axiosError = (status: number | undefined, data: unknown, code?: string) =>
        new AxiosError(
            'Request failed',
            code,
            undefined,
            undefined,
            status === undefined
                ? undefined
                : { status, statusText: '', data, headers: {}, config: { headers: new AxiosHeaders() } },
        );

    it('400: причина из errors, без английского «Validation failed»', () => {
        expect(
            siteMediaErrorMessage(
                axiosError(400, {
                    resultCode: 1,
                    message: 'Validation failed',
                    errors: ['Постер ставится к видео: сначала загрузите ролик'],
                }),
            ),
        ).toBe('Постер ставится к видео: сначала загрузите ролик');
    });

    it('404: причина из message; пустой ответ — общий текст', () => {
        expect(
            siteMediaErrorMessage(axiosError(404, { resultCode: 1, message: 'На этом месте ничего не загружено' })),
        ).toBe('На этом месте ничего не загружено');
        expect(siteMediaErrorMessage(axiosError(502, ''))).toBe('Не удалось сохранить файл');
    });

    it('слишком большое тело (413 от nginx или multer) и таймаут — переводим', () => {
        expect(siteMediaErrorMessage(axiosError(413, 'File too large'))).toContain('до 80 МБ');
        expect(siteMediaErrorMessage(axiosError(undefined, null, 'ECONNABORTED'))).toContain('по времени');
    });
});
