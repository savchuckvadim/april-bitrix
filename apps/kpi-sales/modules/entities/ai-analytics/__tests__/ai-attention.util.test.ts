import { describe, expect, it } from 'vitest';
import { attentionItem } from './ai-fixtures';
import {
    AI_ATTENTION_NO_BASIS,
    aiAttentionActionLine,
    aiAttentionBasisLines,
    aiAttentionCallsLabel,
    aiAttentionHintLines,
    formatAiBasisLine,
} from '../lib/ai-attention.util';
import {
    AI_LONG_KIND,
    AI_SIGNAL,
    AI_SIGNAL_NO_DATA_EXPLANATION,
    AI_SIGNAL_UNKNOWN,
    aiSignalView,
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

    it('сигналы этапа 2: слабые презентации, слабая доработка, звонки с низкой оценкой; риск без обещаний и негатива', () => {
        expect(AI_SIGNAL.weak_presentation.label).toBe('Слабые презентации');
        expect(AI_SIGNAL.weak_followup.label).toBe('Слабая доработка');
        expect(AI_SIGNAL.low_score_calls.label).toBe('Звонки с низкой оценкой');
        expect(AI_SIGNAL.risk.hint).not.toMatch(/обещани|негатив/i);
        expect(AI_SIGNAL.risk.hint).toMatch(/цитат/);
        // Незнакомый сигнал из старого кэша — запасная подпись, не падение.
        expect(aiSignalView('promise_calls')).toBe(AI_SIGNAL_UNKNOWN);
        expect(aiSignalView('risk')).toBe(AI_SIGNAL.risk);
        expect(aiAttentionActionLine('weak_followup')).toBe(
            `Что сделать: ${AI_SIGNAL.weak_followup.action}`,
        );
    });

    it('опоры этапа 2: средняя раздела — «из 10», доли — в процентах, подписи по-русски', () => {
        expect(
            formatAiBasisLine({
                code: 'needs_section_mean',
                value: 4.25,
                norm: 5,
                n: 12,
            }),
        ).toBe('Выявление потребностей, средняя: 4,3 из 10 (норма 5 из 10) · звонков: 12');
        expect(
            formatAiBasisLine({
                code: 'objection_unhandled_share',
                value: 0.6,
                norm: 0.5,
                n: 10,
            }),
        ).toBe('Возражений не отработано: 60 % (норма 50 %) · звонков: 10');
        expect(
            formatAiBasisLine({ code: 'low_score_calls', value: 3, norm: 4, n: 30 }),
        ).toBe('Звонков с низкой оценкой: 3 (норма 4) · звонков: 30');
        expect(aiAttentionCallsLabel('risk', 2)).toBe('риск-звонков: 2');
        expect(aiAttentionCallsLabel('weak_presentation', 3)).toBe('звонков: 3');
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
