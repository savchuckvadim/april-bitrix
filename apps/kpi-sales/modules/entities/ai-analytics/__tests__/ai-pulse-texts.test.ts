import { describe, expect, it } from 'vitest';
import {
    AI_PULSE_MANAGER_MIN_N_FALLBACK,
    AI_PULSE_TEXT,
    aiPulseShortWord,
} from '../lib/ai-pulse.texts';
import { AI_ATTENTION_TEXT } from '../lib/ai-attention.texts';

const FORBIDDEN = /[→×≥≤σκβ↑↓]|n ?=|админк|значимо/i;

const flatten = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') return [];
    if (Array.isArray(value)) return value.flatMap(flatten);
    if (value && typeof value === 'object') {
        return Object.values(value).flatMap(flatten);
    }
    return [];
};

describe('ai-pulse.texts — пороги из ответа, подписи по-русски', () => {
    it('«короче N сек» из ответа; порога нет — словами, без вшитых «5 минут»', () => {
        expect(aiPulseShortWord(300)).toBe('короче 300 сек');
        expect(aiPulseShortWord(null)).toBe('короче порога длительности');
        expect(AI_PULSE_TEXT.short.text(12.4, 300)).toBe(
            '12 % звонков короче 300 сек — AI их не разбирает',
        );
        expect(AI_PULSE_TEXT.short.hint(300).lines.join(' ')).toContain(
            'сейчас: 300 сек',
        );
        expect(AI_PULSE_TEXT.short.hint(null).lines.join(' ')).not.toMatch(/\d сек/);
    });

    it('пустая таблица «По менеджерам»: окно датами, порог строки и порог длительности', () => {
        const text = AI_PULSE_TEXT.managers.empty('2026-09-07', '2026-09-11', 8, 300);
        expect(text).toContain('За 07.09–11.09 (последние 5 рабочих дней)');
        expect(text).toContain('ни у кого нет 8 разобранных звонков');
        expect(text).toContain('не зависит от периода отчёта');
        expect(text).toContain('короче 300 сек');
        expect(AI_PULSE_MANAGER_MIN_N_FALLBACK).toBe(20);
    });

    it('подсказка «Шаг с датой»: порог строки и порог пунктира для долей', () => {
        const hint = AI_PULSE_TEXT.managers.rateHint(8, 30);
        expect(hint.lines.join(' ')).toContain('не меньше 8 разобранных звонков');
        expect(hint.lines.join(' ')).toContain('звонков меньше 30');
    });

    it('«Отработано»: что изменится, кто видит, отменить нельзя, в Битрикс24 ничего не уходит', () => {
        const text = AI_PULSE_TEXT.handled.hint.lines.join(' ');
        expect(text).toContain('«Не отработано»');
        expect(text).toContain('«Итогах периода»');
        expect(text).toContain('отменить её нельзя');
        expect(text).toContain('в Битрикс24 ничего не отправляется');
        expect(AI_PULSE_TEXT.handled.managerWaitHint.lines[0]).toContain(
            'Руководитель отметит',
        );
    });

    it('все тексты пульса и «Внимания» — по-русски, без стрелок, формул и «админки»', () => {
        for (const text of [
            ...flatten(AI_PULSE_TEXT),
            ...flatten(AI_ATTENTION_TEXT),
            AI_PULSE_TEXT.managers.empty('2026-09-07', '2026-09-11', 8, null),
            ...AI_PULSE_TEXT.analyzed.hint(null).lines,
        ]) {
            expect(text).not.toMatch(FORBIDDEN);
        }
        expect(AI_ATTENTION_TEXT.considered.hint.lines.join(' ')).toContain(
            'не больше 7 карточек',
        );
        expect(AI_ATTENTION_TEXT.openType.label).not.toContain('→');
    });
});
