/**
 * Разбор ошибок бэка картинок поставщика: пользователю показывается
 * `errors[0]` из конверта 400, у 404 — `message`; 500 означает «база ещё
 * не обновлена».
 */

import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import {
    backErrorMessage,
    isProviderImagesUnavailable,
    providerImageErrorMessage,
} from './provider-image-error.util';

const FALLBACK = 'Не удалось сохранить картинку';

const axiosError = (status: number | undefined, data: unknown, code?: string) =>
    new AxiosError(
        'Request failed',
        code,
        undefined,
        undefined,
        status === undefined
            ? undefined
            : {
                  status,
                  statusText: '',
                  data,
                  headers: {},
                  config: { headers: new AxiosHeaders() },
              },
    );

describe('backErrorMessage', () => {
    it('400: пользователю уходит первая причина из errors', () => {
        expect(
            backErrorMessage({
                resultCode: 1,
                message: 'Validation failed',
                errors: ['Размер картинки больше 6000 px по стороне', 'Вторая причина'],
            }),
        ).toBe('Размер картинки больше 6000 px по стороне');
    });

    it('пустые элементы errors пропускаются, берётся первый непустой', () => {
        expect(
            backErrorMessage({ message: 'Validation failed', errors: ['', '  ', 'Файл повреждён'] }),
        ).toBe('Файл повреждён');
    });

    it('404: причина из message', () => {
        expect(backErrorMessage({ resultCode: 1, message: 'Картинка не найдена' })).toBe(
            'Картинка не найдена',
        );
    });

    it('нет errors и message, пустое тело и не объект — null', () => {
        expect(backErrorMessage({ resultCode: 1 })).toBeNull();
        expect(backErrorMessage('')).toBeNull();
        expect(backErrorMessage(null)).toBeNull();
        expect(backErrorMessage(undefined)).toBeNull();
    });
});

describe('providerImageErrorMessage', () => {
    it('400 с конвертом — русский текст из errors[0]', () => {
        expect(
            providerImageErrorMessage(
                axiosError(400, {
                    resultCode: 1,
                    message: 'Validation failed',
                    errors: ['Подходят только PNG и JPG'],
                }),
                FALLBACK,
            ),
        ).toBe('Подходят только PNG и JPG');
    });

    it('404 — message бэка', () => {
        expect(
            providerImageErrorMessage(
                axiosError(404, { resultCode: 1, message: 'Реквизиты не найдены' }),
                FALLBACK,
            ),
        ).toBe('Реквизиты не найдены');
    });

    it('413 от nginx и таймаут переводятся на русский', () => {
        expect(providerImageErrorMessage(axiosError(413, 'Payload Too Large'), FALLBACK)).toContain(
            '2,0 МБ',
        );
        expect(
            providerImageErrorMessage(axiosError(undefined, null, 'ECONNABORTED'), FALLBACK),
        ).toContain('по времени');
    });

    it('ответ без понятной причины — запасной текст', () => {
        expect(providerImageErrorMessage(axiosError(502, ''), FALLBACK)).toBe(FALLBACK);
        expect(providerImageErrorMessage('что-то', FALLBACK)).toBe(FALLBACK);
    });

    it('обычная ошибка (например, из конверта resultCode 1) — её message', () => {
        expect(providerImageErrorMessage(new Error('Backend error'), FALLBACK)).toBe('Backend error');
    });
});

describe('isProviderImagesUnavailable', () => {
    it('500 — раздел недоступен до обновления базы', () => {
        expect(isProviderImagesUnavailable(axiosError(500, { message: 'Internal' }))).toBe(true);
    });

    it('404, 400, обрыв сети и обычная ошибка — недоступностью не считаются', () => {
        expect(isProviderImagesUnavailable(axiosError(404, {}))).toBe(false);
        expect(isProviderImagesUnavailable(axiosError(400, {}))).toBe(false);
        expect(isProviderImagesUnavailable(axiosError(undefined, null, 'ERR_NETWORK'))).toBe(false);
        expect(isProviderImagesUnavailable(new Error('boom'))).toBe(false);
    });
});
