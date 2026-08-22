import { describe, expect, it } from 'vitest';
import { shouldResetItemForm } from './should-reset-item-form';

describe('shouldResetItemForm', () => {
    it('уход с дела в список — сбрасываем', () => {
        expect(
            shouldResetItemForm({
                from: '/item',
                to: '/',
                isMenuActive: true,
            }),
        ).toBe(true);
    });

    it('открытие дела: состояние уже поставлено, но роут ещё список — НЕ сбрасываем', () => {
        expect(
            shouldResetItemForm({
                from: '/',
                to: '/',
                isMenuActive: true,
            }),
        ).toBe(false);
    });

    it('переход список → дело не сбрасывает', () => {
        expect(
            shouldResetItemForm({
                from: '/',
                to: '/item',
                isMenuActive: true,
            }),
        ).toBe(false);
    });

    it('возврат с финиша не сбрасывает (форму уже погасила отправка)', () => {
        expect(
            shouldResetItemForm({
                from: '/finish',
                to: '/',
                isMenuActive: true,
            }),
        ).toBe(false);
    });

    it('сбрасывать нечего — меню закрыто', () => {
        expect(
            shouldResetItemForm({
                from: '/item',
                to: '/',
                isMenuActive: false,
            }),
        ).toBe(false);
    });
});
