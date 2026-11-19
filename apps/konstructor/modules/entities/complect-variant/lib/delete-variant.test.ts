import { describe, expect, it } from 'vitest';
import {
    describeVariantDeleteResult,
    isBitrixDeleteConfirmed,
    isVariantDeletable,
    readDeleteErrorMessage,
    VARIANT_DELETE_BLOCKED_HINT,
    VARIANT_DELETE_MANUAL_TOAST_MS,
} from './delete-variant';

describe('удаление варианта: можно ли', () => {
    it('закрытый вариант удалять можно', () => {
        expect(isVariantDeletable(5001, null)).toBe(true);
        expect(isVariantDeletable(5001, 5002)).toBe(true);
    });

    it('вариант, открытый в редакторе, удалять нельзя', () => {
        expect(isVariantDeletable(5001, 5001)).toBe(false);
    });

    it('без идентификатора смарта удалять нечего', () => {
        expect(isVariantDeletable(null, null)).toBe(false);
        expect(isVariantDeletable(0, null)).toBe(false);
        expect(isVariantDeletable(-3, null)).toBe(false);
        expect(isVariantDeletable(1.5, null)).toBe(false);
    });
});

describe('удаление варианта: ответ Битрикса', () => {
    it('пустой массив — успех crm.item.delete', () => {
        expect(isBitrixDeleteConfirmed([])).toBe(true);
        expect(isBitrixDeleteConfirmed(true)).toBe(true);
    });

    it('нет результата или false — сбой', () => {
        expect(isBitrixDeleteConfirmed(undefined)).toBe(false);
        expect(isBitrixDeleteConfirmed(null)).toBe(false);
        expect(isBitrixDeleteConfirmed(false)).toBe(false);
    });
});

describe('удаление варианта: текст ошибки', () => {
    it('берёт русский текст из ответа бэка', () => {
        const error = {
            response: { data: { message: 'variantSmartId обязателен' } },
        };
        expect(readDeleteErrorMessage(error, 'запасной')).toBe(
            'variantSmartId обязателен',
        );
    });

    it('склеивает список сообщений валидатора', () => {
        const error = { response: { data: { message: ['первое', 'второе'] } } };
        expect(readDeleteErrorMessage(error, 'запасной')).toBe(
            'первое; второе',
        );
    });

    it('без ответа бэка берёт message ошибки, потом запасной текст', () => {
        expect(
            readDeleteErrorMessage(new Error('Network Error'), 'запасной'),
        ).toBe('Network Error');
        expect(readDeleteErrorMessage('что-то', 'запасной')).toBe('запасной');
        expect(readDeleteErrorMessage(null, 'запасной')).toBe('запасной');
    });
});

describe('удаление варианта: уведомление', () => {
    it('успех', () => {
        expect(
            describeVariantDeleteResult({ status: 'deleted' }, 'Вариант 1'),
        ).toEqual({
            kind: 'success',
            text: 'Вариант «Вариант 1» удалён',
        });
    });

    it('сбой Битрикса: запись удалена, элемент остался', () => {
        const toast = describeVariantDeleteResult(
            { status: 'bitrix-failed', message: 'Доступ запрещён' },
            'Вариант 1',
        );
        expect(toast.kind).toBe('error');
        expect(toast.text).toContain('удалён из конструктора');
        expect(toast.text).toContain('элемент в Битриксе остался');
        expect(toast.text).toContain('Доступ запрещён');
        expect(toast.durationMs).toBe(VARIANT_DELETE_MANUAL_TOAST_MS);
    });

    it('отказ сервера', () => {
        const toast = describeVariantDeleteResult(
            { status: 'failed', message: 'нет связи' },
            'Вариант 1',
        );
        expect(toast).toEqual({
            kind: 'error',
            text: 'Вариант «Вариант 1» не удалён: нет связи',
        });
    });

    it('открытый вариант: тот же текст, что у подсказки кнопки', () => {
        expect(
            describeVariantDeleteResult({ status: 'blocked' }, 'Вариант 1')
                .text,
        ).toBe(VARIANT_DELETE_BLOCKED_HINT);
    });
});
