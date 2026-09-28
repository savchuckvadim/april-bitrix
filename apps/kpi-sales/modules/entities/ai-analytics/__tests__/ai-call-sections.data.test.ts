import { describe, expect, it } from 'vitest';
import {
    AI_CALL_SECTION_CODES,
    AI_CALL_SECTION_FALLBACK,
    AI_CALL_SECTION_LABELS,
    AI_CALL_SECTION_SHORT_LABELS,
    aiCallSectionLabel,
    aiCallSectionShortLabel,
    isAiCallSectionCode,
} from '../lib/ai-call-sections.data';

describe('ai-call-sections.data — единый справочник разделов рубрики', () => {
    it('семь разделов в порядке разговора, у каждого полное и короткое название', () => {
        expect(AI_CALL_SECTION_CODES).toEqual([
            'GREETING',
            'NEEDS',
            'PRESENTATION',
            'OBJECTIONS',
            'PRICE',
            'CLOSING',
            'REFUSAL',
        ]);
        for (const code of AI_CALL_SECTION_CODES) {
            expect(AI_CALL_SECTION_LABELS[code]).toMatch(/^[А-ЯЁ]/);
            expect(AI_CALL_SECTION_SHORT_LABELS[code]).toMatch(/^[А-ЯЁ]/);
            expect(AI_CALL_SECTION_SHORT_LABELS[code].length).toBeLessThanOrEqual(
                AI_CALL_SECTION_LABELS[code].length,
            );
        }
    });

    it('полные названия — из справочника разбора', () => {
        expect(Object.values(AI_CALL_SECTION_LABELS)).toEqual([
            'Приветствие',
            'Выявление потребностей',
            'Презентация под потребности',
            'Работа с возражениями',
            'Работа по цене',
            'Закрытие разговора',
            'Поведение при отказах',
        ]);
    });

    it('подписи по коду; незнакомый — нейтрально, без самого кода', () => {
        expect(aiCallSectionLabel('NEEDS')).toBe('Выявление потребностей');
        expect(aiCallSectionShortLabel('NEEDS')).toBe('Потребности');
        expect(aiCallSectionLabel('X')).toBe(AI_CALL_SECTION_FALLBACK);
        expect(aiCallSectionShortLabel('X')).toBe(AI_CALL_SECTION_FALLBACK);
        expect(isAiCallSectionCode('PRICE')).toBe(true);
        expect(isAiCallSectionCode('toString')).toBe(false);
    });
});
