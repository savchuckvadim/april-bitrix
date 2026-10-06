import { describe, expect, it } from 'vitest';
import {
    shouldLeaveQuickOutcome,
    shouldResetItemForm,
} from './should-reset-item-form';

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

describe('shouldLeaveQuickOutcome', () => {
    it('вернулись с финиша к списку — итог закончен', () => {
        expect(
            shouldLeaveQuickOutcome({
                from: '/finish',
                to: '/',
                isQuickOutcome: true,
            }),
        ).toBe(true);
    });

    it('ушли из формы дела (после ошибки отправки) — итог закончен', () => {
        expect(
            shouldLeaveQuickOutcome({
                from: '/item',
                to: '/',
                isQuickOutcome: true,
            }),
        ).toBe(true);
    });

    it('итог открыли на списке: роут не менялся — НЕ заканчиваем', () => {
        expect(
            shouldLeaveQuickOutcome({
                from: '/',
                to: '/',
                isQuickOutcome: true,
            }),
        ).toBe(false);
    });

    it('отправка увела на финиш — режим ещё нужен повтору', () => {
        expect(
            shouldLeaveQuickOutcome({
                from: '/',
                to: '/finish',
                isQuickOutcome: true,
            }),
        ).toBe(false);
    });

    it('первый рендер (прошлого роута нет) — НЕ заканчиваем', () => {
        expect(
            shouldLeaveQuickOutcome({
                from: null,
                to: '/',
                isQuickOutcome: true,
            }),
        ).toBe(false);
    });

    it('быстрого итога нет — заканчивать нечего', () => {
        expect(
            shouldLeaveQuickOutcome({
                from: '/finish',
                to: '/',
                isQuickOutcome: false,
            }),
        ).toBe(false);
    });
});
