import { describe, expect, it } from 'vitest';
import {
    AI_CALL_SECTION_CODES,
    AI_CALL_SECTION_LABELS,
} from '@/modules/entities/ai-analytics/lib/ai-call-sections.data';
import {
    AI_LEVER_CHECKLIST_LABELS,
    AI_LEVER_TARGET_OTHER,
    aiLeverSectionLabel,
} from '../ai-lever-target.util';

describe('aiLeverSectionLabel — адресат рычага по-русски', () => {
    it('разделы рубрики разбора — полные названия из общего справочника', () => {
        for (const code of AI_CALL_SECTION_CODES) {
            expect(aiLeverSectionLabel(code)).toBe(AI_CALL_SECTION_LABELS[code]);
        }
        expect(aiLeverSectionLabel('NEEDS')).toBe('Выявление потребностей');
        expect(aiLeverSectionLabel('PRICE')).toBe('Работа по цене');
        expect(aiLeverSectionLabel('REFUSAL')).toBe('Поведение при отказах');
    });

    it('пункты чек-листа: ключи ячейки и их варианты в кодах правил', () => {
        expect(aiLeverSectionLabel('nextStepDateRatePct')).toBe('Шаг с датой');
        expect(aiLeverSectionLabel('next_step_date')).toBe('Шаг с датой');
        expect(aiLeverSectionLabel('five_k')).toBe('«5К»');
        expect(aiLeverSectionLabel('handledRatePct')).toBe(
            AI_LEVER_CHECKLIST_LABELS.handled,
        );
    });

    it('незнакомый код — нейтрально, без самого кода', () => {
        expect(aiLeverSectionLabel('BRAND_NEW')).toBe(AI_LEVER_TARGET_OTHER);
        expect(AI_LEVER_TARGET_OTHER).not.toMatch(/[A-Z_]{3,}/);
    });
});
