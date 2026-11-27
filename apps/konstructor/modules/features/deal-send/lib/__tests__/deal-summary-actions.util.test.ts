import { describe, expect, it } from 'vitest';
import { dealSummaryActions } from '../deal-summary-actions.util';

describe('кнопки «Итога» на шаге «Цены»', () => {
    it('сделка есть: «Сохранить сделку» рядом с «Далее», сохранение запасное', () => {
        expect(dealSummaryActions({ hasDeal: true, canSend: true })).toEqual({
            showDealSend: true,
            dealSendVariant: 'outline',
            showNext: true,
        });
    });

    it('сделки нет: «Создать сделку» вместо «Далее», кнопка главная', () => {
        expect(dealSummaryActions({ hasDeal: false, canSend: true })).toEqual({
            showDealSend: true,
            dealSendVariant: 'default',
            showNext: false,
        });
    });

    it('главного товара нет: кнопки сделки нет, «Далее» не пропадает', () => {
        expect(dealSummaryActions({ hasDeal: false, canSend: false })).toMatchObject({
            showDealSend: false,
            showNext: true,
        });
        expect(dealSummaryActions({ hasDeal: true, canSend: false })).toMatchObject({
            showDealSend: false,
            showNext: true,
        });
    });
});
