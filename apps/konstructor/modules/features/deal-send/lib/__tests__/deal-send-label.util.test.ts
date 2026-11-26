import { describe, expect, it } from 'vitest';
import { dealSendLabel } from '../deal-send-label.util';

describe('подпись кнопки «Создать / Сохранить сделку»', () => {
    it('в покое: сделки нет — «Создать», сделка есть — «Сохранить»', () => {
        expect(dealSendLabel({ hasDeal: false, isSending: false, phase: null })).toBe('Создать сделку');
        expect(dealSendLabel({ hasDeal: true, isSending: false, phase: null })).toBe('Сохранить сделку');
    });

    it('идёт запрос: без сделки — создаём, со сделкой — отправляем', () => {
        expect(dealSendLabel({ hasDeal: false, isSending: true, phase: 'request' })).toBe('Создаю сделку…');
        expect(dealSendLabel({ hasDeal: true, isSending: true, phase: 'request' })).toBe('Отправляю…');
    });

    it('ждём запись полей в сделку', () => {
        expect(dealSendLabel({ hasDeal: true, isSending: true, phase: 'write' })).toBe(
            'Записываю в сделку…',
        );
    });
});
