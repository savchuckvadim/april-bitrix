import { describe, expect, it } from 'vitest';
import { shouldCleanAfterSend } from './clean-after-send';

describe('shouldCleanAfterSend', () => {
    it('менеджер на экране финиша — форма отправленного отчёта, чистим', () => {
        expect(
            shouldCleanAfterSend({
                isFinishOpen: true,
                sentTaskId: 10,
                currentTaskId: 10,
                isItemMenuOpen: true,
            }),
        ).toBe(true);
    });

    it('открыта карточка ДРУГОЙ задачи — новый отчёт не трогаем', () => {
        expect(
            shouldCleanAfterSend({
                isFinishOpen: false,
                sentTaskId: 10,
                currentTaskId: 11,
                isItemMenuOpen: true,
            }),
        ).toBe(false);
    });

    it('после отчёта по задаче открыто меню NEW (без задачи) — не трогаем', () => {
        expect(
            shouldCleanAfterSend({
                isFinishOpen: false,
                sentTaskId: 10,
                currentTaskId: null,
                isItemMenuOpen: true,
            }),
        ).toBe(false);
    });

    it('вернулся к списку, ничего не открывал — остатки отправленного чистим', () => {
        expect(
            shouldCleanAfterSend({
                isFinishOpen: false,
                sentTaskId: 10,
                currentTaskId: 10,
                isItemMenuOpen: true,
            }),
        ).toBe(true);
    });

    it('отчёт шёл из меню NEW, меню снова открыто — возможно заполняют заново', () => {
        expect(
            shouldCleanAfterSend({
                isFinishOpen: false,
                sentTaskId: null,
                currentTaskId: null,
                isItemMenuOpen: true,
            }),
        ).toBe(false);
    });

    it('отчёт из меню NEW, меню закрыто — чистим', () => {
        expect(
            shouldCleanAfterSend({
                isFinishOpen: false,
                sentTaskId: null,
                currentTaskId: null,
                isItemMenuOpen: false,
            }),
        ).toBe(true);
    });

    it('после отчёта из NEW открыли карточку задачи — не трогаем', () => {
        expect(
            shouldCleanAfterSend({
                isFinishOpen: false,
                sentTaskId: null,
                currentTaskId: 7,
                isItemMenuOpen: true,
            }),
        ).toBe(false);
    });

    it('id сверяются с приведением типов (строка из legacy против числа)', () => {
        expect(
            shouldCleanAfterSend({
                isFinishOpen: false,
                sentTaskId: '10',
                currentTaskId: 10,
                isItemMenuOpen: true,
            }),
        ).toBe(true);
    });
});
