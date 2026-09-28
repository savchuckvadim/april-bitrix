import { describe, expect, it } from 'vitest';
import { AI_CALL_SECTION_FALLBACK } from '../lib/ai-call-sections.data';
import {
    AI_DOSSIER_FEEDBACK_OTHER,
    aiDossierFeedbackKindLabel,
    aiDossierMetricLabel,
    aiDossierReasonBadge,
    aiDossierSinceSourceLabel,
    aiDossierStatusLabel,
    aiDossierYoyReasonLabel,
    formatAiDossierRopSections,
    formatAiTenureBand,
} from '../lib/ai-dossier.util';

describe('паспорт и своды: без сырых кодов', () => {
    it('причина пустого раздела — бэйдж только для известного кода', () => {
        expect(aiDossierReasonBadge('too-few-data')).toBe('мало данных');
        expect(aiDossierReasonBadge('no-snapshots')).toBe('нет расчёта');
        expect(aiDossierReasonBadge('no-history')).toBe('нет истории');
        expect(aiDossierReasonBadge('section-failed')).toBe('ошибка раздела');
        expect(aiDossierReasonBadge('style-opt-out')).toBe('отказ от профиля');
        expect(aiDossierReasonBadge('weird')).toBeNull();
    });

    it('группа стажа: диапазон, открытая полоса, иное — нейтрально', () => {
        expect(formatAiTenureBand('6-18')).toBe('группа стажа 6–18 мес.');
        expect(formatAiTenureBand('18+')).toBe('группа стажа от 18 мес.');
        expect(formatAiTenureBand('senior')).toBe('группа стажа не определена');
    });

    it('статус, источник даты и вид реакции: незнакомые коды не показываются как есть', () => {
        expect(aiDossierStatusLabel(null)).toBe('—');
        expect(aiDossierStatusLabel('weird')).toBe('не определён');
        expect(aiDossierSinceSourceLabel('proxy')).toBe(
            'по первому событию (приблизительно)',
        );
        expect(aiDossierSinceSourceLabel('weird')).toBe('');
        expect(aiDossierFeedbackKindLabel('custom')).toBe(
            AI_DOSSIER_FEEDBACK_OTHER,
        );
    });

    it('разделы рубрики в метках — полные названия из общего справочника, без повторов', () => {
        expect(
            formatAiDossierRopSections(['GREETING', 'PRICE', 'GREETING', 'X', 'Y']),
        ).toBe(`Приветствие, Работа по цене, ${AI_CALL_SECTION_FALLBACK}`);
    });

    it('метрика тренда и причина «год назад» — известный код словами, незнакомый — без кода', () => {
        expect(aiDossierMetricLabel('quality')).toBe('оценка');
        expect(aiDossierMetricLabel('zzz_metric')).not.toContain('zzz');
        expect(aiDossierMetricLabel('zzz_metric')).toMatch(/^[а-яё]/i);
        expect(aiDossierYoyReasonLabel('department-changed')).not.toBe(
            'department-changed',
        );
        expect(aiDossierYoyReasonLabel('zzz_reason')).not.toContain('zzz');
        expect(aiDossierYoyReasonLabel('zzz_reason')).toMatch(/^[а-яё]/i);
    });
});
