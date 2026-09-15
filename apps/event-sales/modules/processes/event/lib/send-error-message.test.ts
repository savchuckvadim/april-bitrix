import { describe, expect, it } from 'vitest';
import { toSendErrorMessage } from './send-error-message';

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
