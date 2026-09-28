import { describe, expect, it } from 'vitest';
import type {
    AiDailyPlan,
    AiDailyPlanItem,
} from '@/modules/entities/ai-analytics';
import {
    AI_DAILY_PLAN_BETA_SOURCE,
    AI_DAILY_PLAN_CAP_UNKNOWN,
    AI_DAILY_PLAN_EDGE,
    AI_DAILY_PLAN_NO_STAGE_HISTORY,
    AI_DAILY_PLAN_REASON,
    AI_DAILY_PLAN_STEP_LABEL,
    AI_DAILY_PLAN_TARGET_SOURCE,
    AI_DAILY_PLAN_TARGET_WARNING,
    AI_DAILY_PLAN_UNREACHABLE,
    aiBindingConstraintLabel,
    aiDailyPlanCallCap,
    aiSalesLeft,
    aiSalesToClose,
    buildAiPlanManagerOptions,
    formatAiPipelineExpected,
    formatAiPlanCap,
    formatAiPlanDate,
    formatAiPlanNumber,
    isAiPlanDate,
    pickAiPlanManager,
} from '../ai-daily-plan.util';

/* Локальные фикстуры: форма AiDailyPlanDto как её отдаёт бэк. */
const dailyPlanItem = (
    overrides: Partial<AiDailyPlanItem> = {},
): AiDailyPlanItem => ({
    callType: 'call_to_presentation',
    title: 'Звонки',
    requiredToday: 12,
    doneToday: 0,
    monthPlan: 180,
    monthDone: 96,
    cap: 20,
    priority: 1,
    ...overrides,
});

const dailyPlan = (overrides: Partial<AiDailyPlan> = {}): AiDailyPlan => ({
    managerId: '7',
    date: '2026-09-22',
    target: { sales: 10, source: 'plan', warnings: [] },
    doneSales: 4,
    pipelineExpected: 1.5,
    requiredVolume: 120,
    daysLeft: 7,
    items: [dailyPlanItem()],
    explanation: { steps: [], text: '' },
    reason: null,
    ...overrides,
});

describe('подписи кодов плана дня', () => {
    it('карты покрывают все коды DTO', () => {
        expect(Object.keys(AI_DAILY_PLAN_TARGET_SOURCE).sort()).toEqual([
            'levelTarget',
            'median',
            'plan',
        ]);
        expect(Object.keys(AI_DAILY_PLAN_TARGET_WARNING).sort()).toEqual([
            'target-empty',
            'unreachable-by-volume',
            'wish',
        ]);
        expect(Object.keys(AI_DAILY_PLAN_REASON).sort()).toEqual([
            'forecast-missing',
            'manager-month-missing',
            'portal-model-missing',
        ]);
        expect(Object.keys(AI_DAILY_PLAN_BETA_SOURCE).sort()).toEqual([
            'data',
            'hypothesis',
            'none',
        ]);
        expect(Object.keys(AI_DAILY_PLAN_UNREACHABLE).sort()).toEqual([
            'cap-exceeded',
            'edge-theta-zero',
            'no-days-left',
        ]);
        expect(Object.keys(AI_DAILY_PLAN_EDGE)).toEqual([
            'call_to_presentation',
            'presentation_to_offer',
            'offer_to_invoice',
            'invoice_to_sale',
        ]);
        expect(Object.keys(AI_DAILY_PLAN_STEP_LABEL)).toEqual([
            'target',
            'done_sales',
            'pipeline_expected',
            'required_volume',
            'unwind',
            'ceiling',
        ]);
    });

    it('подписи шагов и причин — словами, без обозначений формул', () => {
        const texts = [
            ...Object.values(AI_DAILY_PLAN_STEP_LABEL),
            ...Object.values(AI_DAILY_PLAN_UNREACHABLE),
            ...Object.values(AI_DAILY_PLAN_TARGET_WARNING),
        ];
        for (const text of texts) {
            expect(text).not.toMatch(/λ|θ|Y₀|N_req|×|\bG\b/);
        }
        expect(AI_DAILY_PLAN_STEP_LABEL.pipeline_expected).toBe(
            'Принесут сделки в работе',
        );
    });
});

describe('день плана', () => {
    it('isAiPlanDate: только YYYY-MM-DD с реальной датой', () => {
        expect(isAiPlanDate('2026-09-22')).toBe(true);
        expect(isAiPlanDate('22.09.2026')).toBe(false);
        expect(isAiPlanDate('')).toBe(false);
        expect(isAiPlanDate('2026-13-01')).toBe(false);
    });

    it('formatAiPlanDate: YYYY-MM-DD → ДД.ММ.ГГГГ, битое — как есть', () => {
        expect(formatAiPlanDate('2026-09-22')).toBe('22.09.2026');
        expect(formatAiPlanDate('2026-09-22T10:00:00Z')).toBe('22.09.2026');
        expect(formatAiPlanDate('битая')).toBe('битая');
    });
});

describe('честные подписи null-полей', () => {
    it('число плана: один знак после запятой', () => {
        expect(formatAiPlanNumber(4.5)).toBe('4,5');
        expect(formatAiPlanNumber(10)).toBe('10');
        expect(formatAiPlanNumber(1.26)).toBe('1,3');
    });

    it('λ_pipe: null — «истории стадий нет», не ноль', () => {
        expect(formatAiPipelineExpected(null)).toBe(
            AI_DAILY_PLAN_NO_STAGE_HISTORY,
        );
        expect(formatAiPipelineExpected(1.5)).toBe('1,5');
        expect(formatAiPipelineExpected(0)).toBe('0');
    });

    it('потолок дневного темпа: null — не оценён', () => {
        expect(formatAiPlanCap(null)).toBe(AI_DAILY_PLAN_CAP_UNKNOWN);
        expect(formatAiPlanCap(20)).toBe('20');
    });
});

describe('до цели', () => {
    it('G − Y₀ − λ_pipe по фикстуре = 4,5', () => {
        expect(aiSalesLeft(dailyPlan())).toBe(4.5);
    });

    it('без истории стадий пайплайн не вычитается', () => {
        expect(aiSalesLeft(dailyPlan({ pipelineExpected: null }))).toBe(6);
    });

    it('перевыполнение — 0, а не отрицательное', () => {
        expect(aiSalesLeft(dailyPlan({ doneSales: 12 }))).toBe(0);
    });

    it('осталось закрыть: G − Y₀ целыми сделками, без пайплайна', () => {
        expect(aiSalesToClose(dailyPlan())).toBe(6);
        expect(
            aiSalesToClose(
                dailyPlan({
                    target: { sales: 2.5, source: 'median', warnings: [] },
                    doneSales: 1,
                }),
            ),
        ).toBe(2);
        expect(aiSalesToClose(dailyPlan({ doneSales: 12 }))).toBe(0);
    });
});

describe('строки плана', () => {
    it('потолок дня — со строки звонков (бэк копирует его во все рёбра)', () => {
        const offer = dailyPlanItem({ callType: 'offer_to_invoice', cap: 3 });
        expect(aiDailyPlanCallCap([offer, dailyPlanItem({ cap: 25 })])).toBe(
            25,
        );
        expect(aiDailyPlanCallCap([offer])).toBe(3);
        expect(aiDailyPlanCallCap([dailyPlanItem({ cap: null })])).toBeNull();
        expect(aiDailyPlanCallCap([])).toBeNull();
    });

    it('связующее ограничение: название строки плана, иначе код по-русски', () => {
        const items = [
            dailyPlanItem({
                callType: 'call_to_presentation',
                title: 'Звонки',
            }),
        ];
        expect(aiBindingConstraintLabel('call_to_presentation', items)).toBe(
            'Звонки',
        );
        expect(aiBindingConstraintLabel('invoice_to_sale', items)).toBe(
            AI_DAILY_PLAN_EDGE.invoice_to_sale,
        );
    });
});

describe('менеджер плана', () => {
    const NAMES: Record<string, string> = {
        '7': 'Яна',
        '8': 'Антон',
        '9': 'Борис',
    };
    const name = (managerId: string) => NAMES[managerId] ?? `#${managerId}`;

    it('опции без дублей и по имени', () => {
        expect(buildAiPlanManagerOptions(['7', '8', '7', '9'], name)).toEqual([
            { value: '8', label: 'Антон' },
            { value: '9', label: 'Борис' },
            { value: '7', label: 'Яна' },
        ]);
        expect(buildAiPlanManagerOptions([], name)).toEqual([]);
    });

    it('первый предпочтительный из периметра, иначе первая опция, иначе null', () => {
        const options = buildAiPlanManagerOptions(['7', '8'], name);
        expect(pickAiPlanManager(options, ['42', null, '7'])).toBe('7');
        expect(pickAiPlanManager(options, [undefined, '42'])).toBe('8');
        expect(pickAiPlanManager([], ['7'])).toBeNull();
    });
});
