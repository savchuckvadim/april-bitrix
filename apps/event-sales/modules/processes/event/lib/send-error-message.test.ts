import { describe, expect, it } from 'vitest';
import {
    isDuplicateSendRejection,
    toSendErrorMessage,
} from './send-error-message';

describe('текст ошибки отправки', () => {
    it('причина бэка доходит до экрана', () => {
        expect(
            toSendErrorMessage(
                'HTTP 400: Продажа: заполните сумму сделки и дату первой оплаты',
            ),
        ).toBe(
            'Не удалось отправить отчёт: Продажа: заполните сумму сделки и ' +
                'дату первой оплаты. Данные никуда не делись — можно повторить.',
        );
    });

    it('сообщение транспорта на экран не пускаем', () => {
        const generic =
            'Не удалось отправить отчёт. Данные никуда не делись — можно повторить.';
        expect(
            toSendErrorMessage('HTTP 400: Request failed with status code 400'),
        ).toBe(generic);
        expect(toSendErrorMessage('Network Error')).toBe(generic);
        expect(toSendErrorMessage(undefined)).toBe(generic);
        expect(toSendErrorMessage('   ')).toBe(generic);
    });
});

describe('отказ второму отчёту по тому же делу (HTTP 409)', () => {
    const detail =
        'HTTP 409: Отчёт по этому делу уже принят 2 мин назад. Второй не ' +
        'записан — обновите список событий';

    it('распознаётся по коду ответа', () => {
        expect(isDuplicateSendRejection(detail)).toBe(true);
        expect(isDuplicateSendRejection('HTTP 400: что-то не так')).toBe(false);
        expect(isDuplicateSendRejection(undefined)).toBe(false);
    });

    it('показывается как есть: без «не удалось» и «можно повторить»', () => {
        expect(toSendErrorMessage(detail)).toBe(
            'Отчёт по этому делу уже принят 2 мин назад. Второй не записан — ' +
                'обновите список событий.',
        );
    });
});
