import { describe, expect, it } from 'vitest';
import {
    ropMark,
    ropMarkCall,
    ropMarkWeek,
} from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import {
    AI_ROP_MARK_AGREE_REQUIRED,
    AI_ROP_MARK_SAVE_NOTES,
    AI_ROP_MARK_SCORES,
    AI_ROP_MARK_SECTIONS,
    AI_ROP_MARK_TEXT_MAX,
    aiRopMarkFormFromMark,
    aiRopMarkProgress,
    aiRopMarkSaveNotes,
    aiRopMarkSectionLabel,
    buildAiRopMarkInput,
    clampAiRopMarkText,
    emptyAiRopMarkForm,
    formatAiRopMarkAiScore,
    formatAiRopMarkPeriod,
    formatAiRopMarkProgress,
    isAiRopMarkScore,
    toggleAiRopMarkSection,
    validateAiRopMarkForm,
} from '../ai-rop-mark.util';

describe('ai-rop-mark.util — разделы и шкала', () => {
    it('семь разделов рубрики в порядке разговора, подписи по-русски', () => {
        expect(AI_ROP_MARK_SECTIONS.map(section => section.code)).toEqual([
            'GREETING',
            'NEEDS',
            'PRESENTATION',
            'OBJECTIONS',
            'PRICE',
            'CLOSING',
            'REFUSAL',
        ]);
        expect(aiRopMarkSectionLabel('NEEDS')).toBe('Потребности');
        expect(aiRopMarkSectionLabel('REFUSAL')).toBe('Отказ');
    });

    it('шкала 1…10', () => {
        expect(AI_ROP_MARK_SCORES).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(isAiRopMarkScore(1)).toBe(true);
        expect(isAiRopMarkScore(10)).toBe(true);
        expect(isAiRopMarkScore(0)).toBe(false);
        expect(isAiRopMarkScore(11)).toBe(false);
        expect(isAiRopMarkScore(7.5)).toBe(false);
        expect(isAiRopMarkScore(null)).toBe(false);
    });

    it('toggleAiRopMarkSection добавляет/убирает раздел и держит порядок рубрики', () => {
        expect(toggleAiRopMarkSection([], 'PRICE')).toEqual(['PRICE']);
        expect(toggleAiRopMarkSection(['PRICE'], 'GREETING')).toEqual([
            'GREETING',
            'PRICE',
        ]);
        expect(toggleAiRopMarkSection(['GREETING', 'PRICE'], 'PRICE')).toEqual([
            'GREETING',
        ]);
    });

    it('clampAiRopMarkText обрезает до 2000', () => {
        expect(AI_ROP_MARK_TEXT_MAX).toBe(2000);
        expect(clampAiRopMarkText('а'.repeat(2500))).toHaveLength(2000);
        expect(clampAiRopMarkText('коротко')).toBe('коротко');
    });
});

describe('ai-rop-mark.util — форма и тело save', () => {
    it('пустая форма не проходит: нужно согласие', () => {
        expect(validateAiRopMarkForm(emptyAiRopMarkForm())).toBe(
            AI_ROP_MARK_AGREE_REQUIRED,
        );
        expect(buildAiRopMarkInput('t-1', emptyAiRopMarkForm())).toBeNull();
    });

    it('оценка вне шкалы — ошибка', () => {
        const form = { ...emptyAiRopMarkForm(), agree: true, ropScore: 12 };
        expect(validateAiRopMarkForm(form)).toMatch(/от 1 до 10/);
        expect(buildAiRopMarkInput('t-1', form)).toBeNull();
    });

    it('минимальная метка: только согласие, пустые поля не шлём', () => {
        const form = { ...emptyAiRopMarkForm(), agree: false };
        expect(buildAiRopMarkInput('t-1', form)).toStrictEqual({
            transcriptionId: 't-1',
            agree: false,
        });
    });

    it('полная метка: оценка, разделы, тексты без крайних пробелов, неделя из запроса', () => {
        const form = {
            agree: true,
            ropScore: 8,
            sections: ['NEEDS', 'PRICE'] as const,
            why: '  потребность выявлена  ',
            howTo: 'закрывать раньше',
        };
        expect(
            buildAiRopMarkInput(
                't-1',
                { ...form, sections: [...form.sections] },
                { weekKey: '2026-W38' },
            ),
        ).toStrictEqual({
            transcriptionId: 't-1',
            agree: true,
            ropScore: 8,
            sections: ['NEEDS', 'PRICE'],
            why: 'потребность выявлена',
            howTo: 'закрывать раньше',
            weekKey: '2026-W38',
        });
    });

    it('дата недели из запроса, текст из одних пробелов не уходит', () => {
        const form = { ...emptyAiRopMarkForm(), agree: true, why: '   ' };
        expect(
            buildAiRopMarkInput('t-1', form, { date: '2026-09-16' }),
        ).toStrictEqual({
            transcriptionId: 't-1',
            agree: true,
            date: '2026-09-16',
        });
    });

    it('aiRopMarkFormFromMark — повторная метка стартует с прежних значений', () => {
        const form = aiRopMarkFormFromMark(
            ropMark({ agree: false, ropScore: null, sections: ['CLOSING'] }),
        );
        expect(form).toEqual({
            agree: false,
            ropScore: null,
            sections: ['CLOSING'],
            why: 'Потребность выявлена',
            howTo: 'Закрывать раньше',
        });
        expect(validateAiRopMarkForm(form)).toBeNull();
    });
});

describe('ai-rop-mark.util — подписи недели и сохранения', () => {
    it('период недели «14.09–20.09»', () => {
        expect(formatAiRopMarkPeriod(ropMarkWeek())).toBe('14.09–20.09');
    });

    it('прогресс «оценено N из M»', () => {
        const week = ropMarkWeek({
            calls: [
                ropMarkCall({ transcriptionId: 'a', marked: true }),
                ropMarkCall({ transcriptionId: 'b' }),
                ropMarkCall({ transcriptionId: 'c' }),
            ],
        });
        expect(aiRopMarkProgress(week)).toEqual({ marked: 1, total: 3 });
        expect(formatAiRopMarkProgress(aiRopMarkProgress(week))).toBe(
            'оценено 1 из 3',
        );
    });

    it('заметки после сохранения: замена и не слепая', () => {
        expect(aiRopMarkSaveNotes(null)).toEqual([]);
        expect(
            aiRopMarkSaveNotes({ id: '1', replaced: false, blind: true }),
        ).toEqual([]);
        expect(
            aiRopMarkSaveNotes({ id: '1', replaced: true, blind: false }),
        ).toEqual([
            AI_ROP_MARK_SAVE_NOTES.replaced,
            AI_ROP_MARK_SAVE_NOTES.notBlind,
        ]);
    });

    it('оценка AI после раскрытия: одна цифра после запятой, null → «—»', () => {
        expect(formatAiRopMarkAiScore(null)).toBe('—');
        expect(formatAiRopMarkAiScore(undefined)).toBe('—');
        expect(formatAiRopMarkAiScore(7.25)).toBe('7,3');
        expect(formatAiRopMarkAiScore(74)).toBe('74');
    });
});
