import { describe, expect, it } from 'vitest';
import { attentionItem } from './ai-fixtures';
import {
    AI_ATTENTION_NO_BASIS,
    aiAttentionActionLine,
    aiAttentionBasisLines,
    aiAttentionHintLines,
} from '../lib/ai-attention.util';
import {
    AI_LONG_KIND,
    AI_SIGNAL,
    AI_SIGNAL_NO_DATA_EXPLANATION,
} from '../lib/ai-overview.data';

describe('AI_SIGNAL — у каждого сигнала есть «что сделать»', () => {
    it('действия по-русски, без кодов; «Нет данных» объясняет, что такое разбор', () => {
        for (const view of Object.values(AI_SIGNAL)) {
            expect(view.action).toMatch(/^[А-ЯЁ]/);
            expect(view.action).not.toMatch(/[a-z_]{4,}/);
        }
        expect(AI_SIGNAL.no_data.hint).toContain(AI_SIGNAL_NO_DATA_EXPLANATION);
        expect(AI_SIGNAL.no_data.action).toContain('Готовность витрины');
        expect(AI_SIGNAL.trend_shift.action).toBe(AI_SIGNAL.trend_drift.action);
    });

    it('бейджи без жаргона: отставание от плана, стало ниже, постепенно снижается', () => {
        expect(AI_SIGNAL.discipline.label).toBe('Отставание от плана');
        expect(AI_SIGNAL.trend_shift.label).toBe('Стало ниже');
        expect(AI_SIGNAL.trend_drift.label).toBe('Постепенно снижается');
        const texts = Object.values(AI_SIGNAL).flatMap(view => [
            view.label,
            view.hint,
            view.action,
        ]);
        for (const text of texts) {
            expect(text).not.toMatch(/Дисциплина|Дрейф|Сдвиг|сместился|норм[аеуой] уровня|[→×≥]/);
        }
    });

    it('«KPI» в длинной раскладке — «Показатель CRM»', () => {
        expect(AI_LONG_KIND.kpi.label).toBe('Показатель CRM');
    });
});

describe('aiAttentionHintLines — смысл, действие, основание', () => {
    it('порядок строк: что значит сигнал → «Что сделать» → опоры с числами', () => {
        const item = attentionItem();
        expect(aiAttentionHintLines(item)).toEqual([
            AI_SIGNAL.risk.hint,
            'Что сделать: Прослушайте риск-звонки и обсудите с менеджером',
            'Риск-звонков: 2 · звонков: 2',
        ]);
        expect(aiAttentionActionLine('discipline')).toBe(
            'Что сделать: Разберите с менеджером, почему план по звонкам и презентациям отстаёт, и напомните фиксировать их в CRM',
        );
    });

    it('без опор — «Чисел к сигналу нет», действие остаётся', () => {
        const item = attentionItem({ signal: 'plan_gap', basis: [] });
        expect(aiAttentionBasisLines(item)).toEqual([AI_ATTENTION_NO_BASIS]);
        expect(aiAttentionHintLines(item)).toEqual([
            AI_SIGNAL.plan_gap.hint,
            aiAttentionActionLine('plan_gap'),
            AI_ATTENTION_NO_BASIS,
        ]);
    });
});
