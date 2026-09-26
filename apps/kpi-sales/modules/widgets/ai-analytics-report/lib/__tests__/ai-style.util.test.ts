import { describe, expect, it } from 'vitest';
import { styleCard } from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import {
    AI_STYLE_LOW_CONFIDENCE_TEXT,
    AI_STYLE_STATUS_TEXT,
    aiFunnelShapeLabel,
    aiStyleAxisHintLines,
    aiStyleAxisShare,
    aiStyleAxisSide,
    aiStyleCi80Band,
    aiStyleConfidence,
    aiStyleProfileNote,
    aiStyleReasonLabel,
    aiStyleStatusNote,
    aiStyleTagHintLines,
    formatAiSigma,
    formatAiStyleCi80,
    formatAiStyleMonth,
    formatAiStyleWindow,
} from '../ai-style.util';

describe('ai-style.util — состояния карточки', () => {
    it('ready — оговорки нет; few_data / opt_out — note бэка либо запасной текст', () => {
        expect(aiStyleStatusNote(styleCard())).toBeNull();
        expect(
            aiStyleStatusNote({ status: 'few_data', note: 'мало разборов' }),
        ).toBe('мало разборов');
        expect(aiStyleStatusNote({ status: 'few_data', note: null })).toBe(
            AI_STYLE_STATUS_TEXT.few_data,
        );
        expect(aiStyleStatusNote({ status: 'opt_out', note: '' })).toBe(
            AI_STYLE_STATUS_TEXT.opt_out,
        );
    });

    it('оговорка профиля при низком доверии', () => {
        expect(aiStyleProfileNote(null)).toBeNull();
        expect(aiStyleProfileNote(styleCard().profile)).toBeNull();
        const profile = styleCard().profile;
        expect(
            aiStyleProfileNote(
                profile ? { ...profile, confidence: 'low' } : null,
            ),
        ).toBe(AI_STYLE_LOW_CONFIDENCE_TEXT);
    });

    it('доверие: подпись и тон, неизвестный уровень — как есть', () => {
        expect(aiStyleConfidence('ok')).toEqual({
            label: 'уверенно',
            tone: 'success',
        });
        expect(aiStyleConfidence('low').tone).toBe('warning');
        expect(aiStyleConfidence('none').tone).toBe('muted');
        expect(aiStyleConfidence('weird')).toEqual({
            label: 'weird',
            tone: 'muted',
        });
    });

    it('причины пониженного доверия по-русски', () => {
        expect(aiStyleReasonLabel(null)).toBeNull();
        expect(aiStyleReasonLabel(undefined)).toBeNull();
        expect(aiStyleReasonLabel('few-calls')).toBe('мало звонков');
        expect(aiStyleReasonLabel('few-peers')).toBe(
            'мало коллег для сравнения',
        );
        expect(aiStyleReasonLabel('unknown-code')).toBe('unknown-code');
    });
});

describe('ai-style.util — σ и шкала оси', () => {
    it('formatAiSigma: знак, одна цифра, типографский минус', () => {
        expect(formatAiSigma(1.23)).toBe('+1,2 σ');
        expect(formatAiSigma(-0.44)).toBe('−0,4 σ');
        expect(formatAiSigma(0)).toBe('0,0 σ');
        expect(formatAiSigma(-0.04)).toBe('0,0 σ');
    });

    it('formatAiStyleCi80: «+0,6…+1,8 σ», без двух границ — пусто', () => {
        expect(formatAiStyleCi80([0.6, 1.8])).toBe('+0,6…+1,8 σ');
        expect(formatAiStyleCi80([-1.2, -0.3])).toBe('−1,2…−0,3 σ');
        expect(formatAiStyleCi80([1])).toBe('');
        expect(formatAiStyleCi80(undefined)).toBe('');
    });

    it('aiStyleAxisShare: −3 → 0, 0 → 0,5, +3 → 1, за пределами — упор', () => {
        expect(aiStyleAxisShare(-3)).toBe(0);
        expect(aiStyleAxisShare(0)).toBe(0.5);
        expect(aiStyleAxisShare(3)).toBe(1);
        expect(aiStyleAxisShare(1.5)).toBe(0.75);
        expect(aiStyleAxisShare(-9)).toBe(0);
        expect(aiStyleAxisShare(9)).toBe(1);
    });

    it('aiStyleCi80Band: полоса интервала на шкале, порядок границ не важен', () => {
        expect(aiStyleCi80Band([0, 3])).toEqual({ left: 0.5, width: 0.5 });
        expect(aiStyleCi80Band([3, 0])).toEqual({ left: 0.5, width: 0.5 });
        expect(aiStyleCi80Band([-3, -1.5])).toEqual({ left: 0, width: 0.25 });
        expect(aiStyleCi80Band([1])).toBeNull();
        expect(aiStyleCi80Band(undefined)).toBeNull();
    });

    it('aiStyleAxisSide: центр при |σ| < 0,5', () => {
        expect(aiStyleAxisSide(0.3)).toBe('center');
        expect(aiStyleAxisSide(-0.49)).toBe('center');
        expect(aiStyleAxisSide(-0.5)).toBe('minus');
        expect(aiStyleAxisSide(1.2)).toBe('plus');
    });

    it('строки подсказки оси: отклонение, интервал, n, доверие, причина', () => {
        const axis = styleCard().axes[0];
        expect(axis).toBeDefined();
        if (!axis) return;
        expect(aiStyleAxisHintLines(axis)).toEqual([
            'Отклонение: +1,2 σ',
            '80 %: +0,6…+1,8 σ',
            'Наблюдений: n = 40',
            'Доверие: уверенно',
        ]);
        expect(
            aiStyleAxisHintLines({
                ...axis,
                ci80: [],
                confidence: 'low',
                reason: 'few-calls',
            }),
        ).toEqual([
            'Отклонение: +1,2 σ',
            'Наблюдений: n = 40',
            'Доверие: мало данных',
            'Причина: мало звонков',
        ]);
    });

    it('строки подсказки подписи: опора, n, пометка об оспаривании', () => {
        const tag = {
            code: 'long_calls',
            title: 'Долгие разговоры',
            basis: 'Медиана 9 мин против 6 у коллег',
            n: 40,
        };
        expect(aiStyleTagHintLines(tag)).toEqual([
            'Медиана 9 мин против 6 у коллег',
            'n = 40',
        ]);
        expect(aiStyleTagHintLines({ ...tag, disputed: true })).toHaveLength(3);
    });
});

describe('ai-style.util — месяцы и воронка', () => {
    it('formatAiStyleMonth: «август 2026», пусто — «—», мусор — как есть', () => {
        expect(formatAiStyleMonth('2026-08')).toBe('август 2026');
        expect(formatAiStyleMonth('2026-01')).toBe('январь 2026');
        expect(formatAiStyleMonth(null)).toBe('—');
        expect(formatAiStyleMonth('')).toBe('—');
        expect(formatAiStyleMonth('2026-13')).toBe('2026-13');
    });

    it('formatAiStyleWindow: диапазон, один месяц, пусто', () => {
        expect(formatAiStyleWindow(['2026-06', '2026-07', '2026-08'])).toBe(
            'июнь 2026 — август 2026',
        );
        expect(formatAiStyleWindow(['2026-08'])).toBe('август 2026');
        expect(formatAiStyleWindow([])).toBe('—');
    });

    it('форма воронки как контекст; неизвестная — как есть', () => {
        expect(aiFunnelShapeLabel('balanced')).toBe('Сбалансирован');
        expect(aiFunnelShapeLabel('closer')).toBe('Закрыватель');
        expect(aiFunnelShapeLabel('toString')).toBe('toString');
        expect(aiFunnelShapeLabel('odd')).toBe('odd');
    });
});
