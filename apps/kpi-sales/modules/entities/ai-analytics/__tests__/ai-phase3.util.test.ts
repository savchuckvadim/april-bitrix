import { describe, expect, it } from 'vitest';
import {
    AI_TREND_KIND,
    AI_TREND_METRIC_LABELS,
    aiTrendMetricLabel,
    aiTrendsHintLines,
    aiTrendsTone,
    formatAiGoodhartFlag,
    formatAiTrendMagnitude,
    formatAiTrendSignal,
} from '../lib/ai-trend.util';
import {
    AI_PLAN_FACT_INDICATOR,
    AI_PLAN_FACT_NOT_COUNTED_STATUS,
    AI_PLAN_FACT_REASON_LABELS,
    AI_PLAN_FACT_STATUS,
    aiPlanFactIndicatorLabel,
    aiPlanFactMonthKey,
    aiPlanFactReasonLabel,
    aiPlanFactRowHasPlan,
    aiPlanFactRowStatusView,
    formatAiPlanFactGap,
    formatAiPlanFactPace,
    formatAiPlanFactPerDay,
    formatAiPlanFactPeriod,
    formatAiPlanFactValue,
    sortAiPlanFactRows,
} from '../lib/ai-plan-fact.util';
import {
    AI_YOY_REASON_LABELS,
    AI_YOY_REASON_OTHER,
    aiYoyBadgeLabel,
    aiYoyHintLines,
    aiYoyReasonLabel,
    aiYoyTone,
    formatAiYoyDelta,
    formatAiYoyLine,
    formatAiYoyPeriods,
} from '../lib/ai-yoy.util';
import {
    AI_DOSSIER_MONTH_OPTIONS,
    AI_DOSSIER_MONTHS,
    AI_DOSSIER_SECTION_LABELS,
    aiDossierFeedbackKindLabel,
    aiDossierFilledCount,
    aiDossierSinceSourceLabel,
    aiDossierStatusLabel,
    formatAiDossierReason,
} from '../lib/ai-dossier.util';
import {
    dossier,
    managerTrends,
    metric,
    planFact,
    planFactRow,
    yoy,
} from './ai-fixtures';

describe('ai-trend.util — сигналы трендов и флаги Гудхарта', () => {
    it('подписи метрик: известный код по-русски, чужой — «показатель» без кода', () => {
        expect(aiTrendMetricLabel('quality')).toBe(
            AI_TREND_METRIC_LABELS.quality,
        );
        expect(aiTrendMetricLabel('unknown_metric')).toBe('показатель');
    });

    it('величина: доли рёбер — в п.п., оценка — с одним знаком и знаком минус', () => {
        const [signal] = managerTrends().signals;
        expect(formatAiTrendMagnitude(signal!)).toBe('−0,8');
        expect(
            formatAiTrendMagnitude({
                ...signal!,
                metric: 'edge_call_to_presentation',
                magnitude: 0.15,
            }),
        ).toBe('+15 п.п.');
    });

    it('строка сигнала собирает метрику, стрелку, вид, величину и неделю датами', () => {
        const [signal] = managerTrends().signals;
        const line = formatAiTrendSignal(signal!);
        expect(line).toContain(AI_TREND_METRIC_LABELS.quality);
        expect(line).toContain('↓');
        expect(line).toContain(AI_TREND_KIND.shift.label);
        expect(line).toContain('с недели 31.08–06.09');
        expect(line).not.toContain('W36');
        expect(
            formatAiTrendSignal({ ...signal!, sinceWeek: 'garbage' }),
        ).not.toContain('с недели');
    });

    it('тон: сдвиг вниз — warning, дрейф вверх — success/info, пусто — muted', () => {
        expect(aiTrendsTone(managerTrends())).toBe('warning');
        expect(aiTrendsTone(managerTrends({ signals: [], goodhart: null }))).toBe(
            'muted',
        );
    });

    it('флаг «показатель растёт, результат — нет» нейтрален, месяцы словами', () => {
        const [flag] = managerTrends().goodhart ?? [];
        const text = formatAiGoodhartFlag(flag!);
        expect(text).toContain('(июнь – август 2026)');
        expect(text).not.toContain('2026-0');
        expect(text.toLowerCase()).not.toMatch(/накрут|обман/);
    });

    it('подсказка ячейки: сигналы, флаги и неделя расчёта датами', () => {
        const lines = aiTrendsHintLines(managerTrends());
        expect(lines.length).toBeGreaterThanOrEqual(3);
        const text = lines.join('\n');
        expect(text).toContain('Посчитано на неделе 14.09–20.09');
        expect(text).not.toContain('W38');
    });
});

describe('ai-plan-fact.util — план-факт месяца', () => {
    it('месяц из даты конца периода; пусто — null', () => {
        expect(aiPlanFactMonthKey('2026-08-31')).toBe('2026-08');
        expect(aiPlanFactMonthKey(null)).toBeNull();
        expect(aiPlanFactMonthKey('')).toBeNull();
    });

    it('форматы: значение, темп в %, разрыв со знаком, «в день надо»; null — прочерк', () => {
        expect(formatAiPlanFactValue(10)).toBe('10');
        expect(formatAiPlanFactValue(null)).toBe('—');
        expect(formatAiPlanFactPace(0.5)).toContain('50');
        expect(formatAiPlanFactPace(null)).toBe('—');
        expect(formatAiPlanFactGap(-4)).toContain('−4');
        expect(formatAiPlanFactGap(3)).toContain('+3');
        expect(formatAiPlanFactGap(null)).toBe('—');
        expect(formatAiPlanFactPerDay(0.7)).toBe('1');
        expect(formatAiPlanFactPerDay(2)).toBe('2');
        expect(formatAiPlanFactPerDay(null)).toBe('—');
    });

    it('строки сортируются в порядке справочника показателей', () => {
        const rows = sortAiPlanFactRows([
            planFactRow({ indicator: 'presentations' }),
            planFactRow({ indicator: 'sales' }),
            planFactRow({ indicator: 'calls' }),
        ]);
        expect(rows.map(row => row.indicator)).toEqual([
            'sales',
            'calls',
            'presentations',
        ]);
    });

    it('период: месяц словами, рабочие дни прошло/всего', () => {
        const text = formatAiPlanFactPeriod(planFact());
        expect(text).toContain('август 2026');
        expect(text).toContain('10 из 21');
    });

    it('коды причин бэка (ручки и строки) подписаны по-русски', () => {
        for (const code of [
            'plan-snapshot-missing',
            'manager-month-missing',
            'daily-plan-disabled',
            'plan-missing',
            'target-empty',
            'fact-missing',
            'no-workdays',
            'no-days-left',
        ]) {
            expect(AI_PLAN_FACT_REASON_LABELS[code]).toBeTruthy();
        }
        expect(aiPlanFactReasonLabel('unknown')).toBe(
            'причина не описана — уточните у разработчика',
        );
    });

    it('подпись показателя с единицей одним текстом; звонки — из CRM', () => {
        expect(aiPlanFactIndicatorLabel('sales')).toBe('Продажи, шт.');
        expect(aiPlanFactIndicatorLabel('calls')).toBe('Звонки (CRM), шт.');
        expect(aiPlanFactIndicatorLabel('presentations')).toBe(
            'Презентации, шт.',
        );
        for (const indicator of ['sales', 'calls', 'presentations'] as const) {
            expect(aiPlanFactIndicatorLabel(indicator)).toBe(
                `${AI_PLAN_FACT_INDICATOR[indicator].label}, ${AI_PLAN_FACT_INDICATOR[indicator].unit}`,
            );
        }
    });

    it('цель в строке: план больше нуля; null и 0 — цели нет', () => {
        expect(aiPlanFactRowHasPlan(planFactRow())).toBe(true);
        expect(aiPlanFactRowHasPlan(planFactRow({ plan: null }))).toBe(false);
        expect(aiPlanFactRowHasPlan(planFactRow({ plan: 0 }))).toBe(false);
    });

    it('статус: no-plan без цели — «плана нет», при цели — «не посчитано»', () => {
        expect(aiPlanFactRowStatusView(planFactRow())).toBe(
            AI_PLAN_FACT_STATUS.behind,
        );
        expect(
            aiPlanFactRowStatusView(
                planFactRow({ plan: null, status: 'no-plan' }),
            ),
        ).toBe(AI_PLAN_FACT_STATUS['no-plan']);
        expect(
            aiPlanFactRowStatusView(
                planFactRow({ fact: null, status: 'no-plan' }),
            ),
        ).toBe(AI_PLAN_FACT_NOT_COUNTED_STATUS);
    });
});

describe('ai-yoy.util — «тот же месяц год назад»', () => {
    it('периоды словами: «август 2026 против августа 2025», без ключей; незнакомая оговорка — нейтрально', () => {
        expect(formatAiYoyPeriods(yoy())).toBe('август 2026 против августа 2025');
        const text = aiYoyHintLines(yoy()).join('\n');
        expect(text).toContain('август 2026 против августа 2025');
        expect(text).not.toContain('2026-08');
        expect(aiYoyReasonLabel('brand-new')).toBe(AI_YOY_REASON_OTHER);
        expect(AI_YOY_REASON_LABELS['no-history']).not.toContain('снапшот');
    });

    it('строка и разница величины: оценка с одним знаком, счётчики — целые', () => {
        const [quality, sales] = yoy().metrics;
        expect(formatAiYoyLine(quality!)).toContain('6,4');
        expect(formatAiYoyDelta(quality!)).toBe('+0,5');
        expect(formatAiYoyDelta(sales!)).toBe('+1');
        expect(formatAiYoyDelta({ ...sales!, delta: null })).toBe('—');
    });

    it('бэйдж: разница оценки; тон success при сопоставимости, warning — с оговорками', () => {
        expect(aiYoyBadgeLabel(yoy())).toContain('+0,5');
        expect(aiYoyTone(yoy())).toBe('success');
        const withReasons = yoy({
            comparable: false,
            reasons: ['department-changed'],
        });
        expect(aiYoyTone(withReasons)).toBe('warning');
        expect(aiYoyHintLines(withReasons).join('\n')).toContain(
            AI_YOY_REASON_LABELS['department-changed'],
        );
    });

    it('без оценки год назад бэйдж честно говорит «мало данных»', () => {
        const noBase = yoy({
            metrics: [
                {
                    metric: 'quality',
                    current: metric(6.4, 30),
                    base: metric(null, 3),
                    delta: null,
                },
            ],
        });
        expect(aiYoyBadgeLabel(noBase)).toContain('мало данных');
    });

    it('все коды причин бэка подписаны', () => {
        for (const code of [
            'period-not-month',
            'no-history',
            'versions-changed',
            'before-comparable',
            'department-changed',
            'level-changed',
            'tenure-band-changed',
            'portal-event',
        ]) {
            expect(aiYoyReasonLabel(code)).not.toBe(code);
        }
    });
});

describe('ai-dossier.util — досье менеджера', () => {
    it('окно: умолчание 3 входит в варианты и в границы', () => {
        expect(AI_DOSSIER_MONTH_OPTIONS).toContain(AI_DOSSIER_MONTHS.default);
        expect(AI_DOSSIER_MONTHS.min).toBeLessThanOrEqual(
            AI_DOSSIER_MONTHS.default,
        );
        expect(AI_DOSSIER_MONTHS.max).toBeGreaterThanOrEqual(
            Math.max(...AI_DOSSIER_MONTH_OPTIONS),
        );
    });

    it('собранных разделов = всего минус причины; причина — подпись раздела + текст бэка', () => {
        const data = dossier();
        expect(aiDossierFilledCount(data)).toBe(
            Object.keys(AI_DOSSIER_SECTION_LABELS).length - 2,
        );
        expect(formatAiDossierReason(data.reasons[0]!)).toBe(
            `${AI_DOSSIER_SECTION_LABELS.trends} — разборов меньше порога`,
        );
    });

    it('подписи паспорта и обратной связи: известные коды по-русски, чужие — нейтрально', () => {
        expect(aiDossierStatusLabel('active')).not.toBe('active');
        expect(aiDossierStatusLabel(null)).toBe('—');
        expect(aiDossierSinceSourceLabel('employment')).not.toBe('employment');
        expect(aiDossierSinceSourceLabel(null)).toBe('');
        expect(aiDossierFeedbackKindLabel('useful')).not.toBe('useful');
        expect(aiDossierFeedbackKindLabel('custom')).toBe('прочее');
    });
});
