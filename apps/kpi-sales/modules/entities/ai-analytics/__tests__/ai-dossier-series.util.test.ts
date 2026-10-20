import { describe, expect, it } from 'vitest';
import type { AiDossierSeriesPoint } from '../model';
import {
    AI_DOSSIER_OBJECTIONS_TEXT,
    AI_DOSSIER_SERIES_TEXT,
    aiDossierPointNotes,
    aiDossierThresholdHint,
    formatAiDossierObjection,
} from '../lib/ai-dossier-series.util';
import { metric } from './ai-fixtures';

const point = (
    overrides: Partial<AiDossierSeriesPoint> = {},
): AiDossierSeriesPoint => ({
    periodKey: '2026-W38',
    n: 7,
    nBeforeComparable: 0,
    score: metric(null, 6),
    ...overrides,
});

const FORBIDDEN = /[→×≥≤σκβ↑↓]|n ?=|админк/i;

describe('ai-dossier-series.util — пометки точки ряда', () => {
    it('оценка скрыта по объёму — бэйдж порога «оценка с 8 звонков (сейчас 6)» и «оценено 6 из 7»', () => {
        const notes = aiDossierPointNotes(point());
        expect(notes.hiddenLabel).toBe('оценка с 8 звонков (сейчас 6)');
        expect(notes.scoredOf).toBe('оценено 6 из 7');
        expect(notes.beforeComparable).toBeNull();
        expect(notes.versionsMixed).toBe(false);
        // Порог портала из ответа важнее дефолта.
        expect(aiDossierPointNotes(point(), { none: 10 }).hiddenLabel).toBe(
            'оценка с 10 звонков (сейчас 6)',
        );
    });

    it('оценка показана — бэйджа порога нет; оценённых столько же — без «оценено»', () => {
        const notes = aiDossierPointNotes(point({ n: 12, score: metric(6.2, 12) }));
        expect(notes.hiddenLabel).toBeNull();
        expect(notes.scoredOf).toBeNull();
    });

    it('старый расчёт (legacy-snapshot) — бэйдж порога не ставим: его подпись у метрики', () => {
        const legacy = point({
            n: 40,
            score: {
                ...metric(null, 0),
                confidence: { level: 'none', reason: 'legacy-snapshot' },
            },
        });
        expect(aiDossierPointNotes(legacy).hiddenLabel).toBeNull();
        expect(aiDossierPointNotes(legacy).scoredOf).toBe('оценено 0 из 40');
    });

    it('разборы до смены версии и смешанные версии — пометки', () => {
        const notes = aiDossierPointNotes(
            point({ nBeforeComparable: 3, versionsMixed: true }),
        );
        expect(notes.beforeComparable).toBe('+3 до смены версии');
        expect(notes.versionsMixed).toBe(true);
    });

    it('подсказка порога называет минимум и границу пунктира', () => {
        const hint = aiDossierThresholdHint();
        expect(hint.lines.join(' ')).toContain('не меньше 8');
        expect(hint.lines.join(' ')).toContain('От 8 до 19');
        expect(aiDossierThresholdHint({ none: 10, lowScore: 25 }).lines.join(' ')).toContain(
            'От 10 до 24',
        );
    });

    it('тексты словаря по-русски, без стрелок и кодов', () => {
        const texts = [
            AI_DOSSIER_SERIES_TEXT.analyzed.hint.title,
            ...AI_DOSSIER_SERIES_TEXT.analyzed.hint.lines,
            ...AI_DOSSIER_SERIES_TEXT.score.hint.lines,
            ...AI_DOSSIER_SERIES_TEXT.scoredOfHint.lines,
            ...AI_DOSSIER_SERIES_TEXT.beforeComparableHint.lines,
            AI_DOSSIER_SERIES_TEXT.versionsMixed.label,
            ...AI_DOSSIER_SERIES_TEXT.versionsMixed.hint.lines,
            ...AI_DOSSIER_OBJECTIONS_TEXT.hint(8).lines,
        ];
        for (const text of texts) expect(text).not.toMatch(FORBIDDEN);
        expect(AI_DOSSIER_OBJECTIONS_TEXT.hint(8).lines.join(' ')).toContain(
            'не меньше 8',
        );
    });
});

describe('formatAiDossierObjection — возражения с долей отработанных', () => {
    it('с долей: «Цена: 5 раз в 4 звонках · отработано 60 %»', () => {
        expect(
            formatAiDossierObjection({
                category: 'price',
                n: 5,
                calls: 4,
                handledRatePct: metric(60, 30),
                outcomes: { continued: 2, converted: 1, disengaged: 1, other: 1 },
            }),
        ).toBe('Цена: 5 раз в 4 звонках · отработано 60 %');
    });

    it('доли нет — без хвоста; склонения «раза», «звонке»', () => {
        expect(
            formatAiDossierObjection({
                category: 'timing',
                n: 2,
                calls: 1,
                handledRatePct: metric(null, 2),
                outcomes: { continued: 0, converted: 0, disengaged: 0, other: 2 },
            }),
        ).toBe('Сроки: 2 раза в 1 звонке');
        expect(
            formatAiDossierObjection({
                category: 'brand-new',
                n: 1,
                calls: 1,
                handledRatePct: metric(null, 1),
                outcomes: { continued: 0, converted: 0, disengaged: 0, other: 1 },
            }),
        ).toBe('Другое: 1 раз в 1 звонке');
    });
});
