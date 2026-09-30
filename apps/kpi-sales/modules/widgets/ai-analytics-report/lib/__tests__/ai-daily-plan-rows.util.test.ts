import { describe, expect, it } from 'vitest';
import type {
    AiDailyPlanItem,
    AiDailyPlanItemCallType,
} from '@/modules/entities/ai-analytics';
import {
    AI_DAILY_PLAN_ACTIVITY,
    AI_DAILY_PLAN_FUNNEL_ORDER,
} from '../ai-daily-plan-activity.data';
import {
    aiDailyPlanActivity,
    aiDailyPlanMonthFacts,
    aiDailyPlanPipelineFact,
    aiDailyPlanTopLeak,
    buildAiDailyPlanRows,
    sortAiDailyPlanFunnel,
} from '../ai-daily-plan-view.util';
import {
    formatAiDailyCount,
    formatAiDailyCountWith,
    formatAiDailyForecast,
    joinAiList,
} from '../ai-daily-plan-format.util';

// Неразрывный пробел ru-RU: сравниваем без учёта вида пробелов.
const plain = (value: string) => value.replace(/\s/g, ' ');

/* Локальные фикстуры: форма AiDailyPlanDto как её отдаёт бэк. */
const item = (overrides: Partial<AiDailyPlanItem> = {}): AiDailyPlanItem => ({
    callType: 'call_to_presentation',
    title: 'Звонки',
    requiredToday: 12,
    doneToday: 0,
    monthPlan: 180,
    monthDone: 96,
    cap: 25,
    priority: 1,
    ...overrides,
});

/** Бэк сортирует строки по утечке, а не по воронке. */
const leakOrderedItems = (): AiDailyPlanItem[] => [
    item({
        callType: 'offer_to_invoice',
        title: 'КП',
        requiredToday: 0.4,
        monthPlan: 8,
        monthDone: 5,
        priority: 1,
        leak: 1.4,
    }),
    item({ priority: 2, monthDone: 144, monthPlan: 200, leak: 0.9 }),
    item({
        callType: 'invoice_to_sale',
        title: 'Счета',
        requiredToday: 0,
        monthPlan: 6,
        monthDone: 3,
        priority: 3,
        leak: 0.5,
    }),
    item({
        callType: 'presentation_to_offer',
        title: 'Презентации (уникальные по компании)',
        requiredToday: 3,
        monthPlan: 40,
        monthDone: 30,
        priority: 4,
        leak: 0.2,
    }),
];

describe('счёт плана дня', () => {
    it('0 < x < 1 — «<1», а не «0»; иначе округление половины вверх', () => {
        expect(formatAiDailyCount(0)).toBe('0');
        expect(formatAiDailyCount(0.4)).toBe('<1');
        expect(formatAiDailyCount(0.5)).toBe('<1');
        expect(formatAiDailyCount(1)).toBe('1');
        expect(formatAiDailyCount(1.5)).toBe('2');
        expect(formatAiDailyCount(2.4)).toBe('2');
        expect(formatAiDailyCount(2.5)).toBe('3');
        expect(plain(formatAiDailyCount(1234.5))).toBe('1 235');
    });

    it('не число — «—», отрицательное — 0', () => {
        expect(formatAiDailyCount(Number.NaN)).toBe('—');
        expect(formatAiDailyCount(Number.POSITIVE_INFINITY)).toBe('—');
        expect(formatAiDailyCount(-3)).toBe('0');
    });

    it('с существительным: «<1» берёт родительный падеж', () => {
        const calls = AI_DAILY_PLAN_ACTIVITY.call_to_presentation.forms;
        expect(formatAiDailyCountWith(0.3, calls)).toBe('<1 звонка');
        expect(formatAiDailyCountWith(21, calls)).toBe('21 звонок');
        expect(formatAiDailyCountWith(144, calls)).toBe('144 звонка');
        expect(formatAiDailyCountWith(11, calls)).toBe('11 звонков');
        expect(
            formatAiDailyCountWith(
                0.4,
                AI_DAILY_PLAN_ACTIVITY.offer_to_invoice.forms,
            ),
        ).toBe('<1 КП');
    });

    it('список: «a», «a и b», «a, b и c»', () => {
        expect(joinAiList([])).toBe('');
        expect(joinAiList(['a'])).toBe('a');
        expect(joinAiList(['a', 'b'])).toBe('a и b');
        expect(joinAiList(['a', 'b', 'c'])).toBe('a, b и c');
    });
});

describe('строки плана', () => {
    it('порядок воронки задаёт словарь активностей', () => {
        expect([...AI_DAILY_PLAN_FUNNEL_ORDER]).toEqual(
            Object.keys(AI_DAILY_PLAN_ACTIVITY),
        );
    });

    it('в порядке воронки, исходный массив не меняется', () => {
        const items = leakOrderedItems();
        expect(sortAiDailyPlanFunnel(items).map(row => row.callType)).toEqual([
            'call_to_presentation',
            'presentation_to_offer',
            'offer_to_invoice',
            'invoice_to_sale',
        ]);
        expect(items[0]?.callType).toBe('offer_to_invoice');
    });

    it('подпись — вход ребра, «<1» сегодня, узкое место — priority 1 с утечкой', () => {
        const rows = buildAiDailyPlanRows(leakOrderedItems(), true);
        expect(rows.map(row => row.label)).toEqual([
            'Звонки',
            'Презентации',
            'КП',
            'Счета',
        ]);
        expect(rows.map(row => row.today)).toEqual(['12', '3', '<1', '0']);
        expect(rows.map(row => row.topLeak)).toEqual([
            false,
            false,
            true,
            false,
        ]);
        expect(rows[1]?.hint).toContain('Уникальные по компании');
    });

    it('план по объёму (leak = null, priority лишь порядок) — «узкого места» нет', () => {
        const rows = buildAiDailyPlanRows(
            leakOrderedItems().map(row => ({ ...row, leak: null })),
            true,
        );
        expect(rows.some(row => row.topLeak)).toBe(false);
    });

    it('старый ответ без поля leak — «узкого места» нет', () => {
        const legacy = leakOrderedItems().map(row => {
            const copy = { ...row };
            delete copy.leak;
            return copy;
        });
        expect(legacy.every(row => !('leak' in row))).toBe(true);
        const rows = buildAiDailyPlanRows(legacy, true);
        expect(rows.some(row => row.topLeak)).toBe(false);
    });

    it('aiDailyPlanTopLeak: утечка больше нуля, priority 1 и больше одной строки', () => {
        expect(aiDailyPlanTopLeak({ leak: 0.3, priority: 1 }, 2)).toBe(true);
        // Нулевая утечка на первом месте — теряем везде ноль, «узкого места» нет.
        expect(aiDailyPlanTopLeak({ leak: 0, priority: 1 }, 2)).toBe(false);
        expect(aiDailyPlanTopLeak({ leak: 0.3, priority: 2 }, 2)).toBe(false);
        expect(aiDailyPlanTopLeak({ leak: 0.3, priority: 1 }, 1)).toBe(false);
        expect(aiDailyPlanTopLeak({ leak: null, priority: 1 }, 3)).toBe(false);
        expect(aiDailyPlanTopLeak({ priority: 1 }, 3)).toBe(false);
    });

    it('незнакомый код ребра — не падаем: подпись из title, в конце воронки', () => {
        const code: string = 'deal_to_upsell';
        const extra = item({
            callType: code as AiDailyPlanItemCallType,
            title: 'Допродажи',
            requiredToday: 2,
            monthDone: 5,
        });
        expect(aiDailyPlanActivity(extra).label).toBe('Допродажи');
        const rows = buildAiDailyPlanRows([extra, item()], true);
        expect(rows.map(row => row.label)).toEqual(['Звонки', 'Допродажи']);
        expect(aiDailyPlanMonthFacts({ doneSales: 0, items: [extra] })).toBe(
            'За месяц: 0 сделок и 5 действий.',
        );
    });

    it('с целью: «сделано из плана» и доля; без цели — только сделано', () => {
        const [calls] = buildAiDailyPlanRows([item()], true);
        expect(calls).toMatchObject({
            monthDone: '96',
            monthPlan: '180',
            topLeak: false,
        });
        expect(calls?.monthShare).toBeCloseTo(96 / 180);

        const [noGoal] = buildAiDailyPlanRows(
            [item({ monthPlan: 96 })],
            false,
        );
        expect(noGoal?.monthPlan).toBeNull();
        expect(noGoal?.monthShare).toBeNull();
    });
});

describe('факт и прогноз месяца', () => {
    it('факт месяца: сделки и активность по воронке', () => {
        expect(
            aiDailyPlanMonthFacts({ doneSales: 2, items: leakOrderedItems() }),
        ).toBe(
            'За месяц: 2 сделки, 144 звонка, 30 презентаций, 5 КП и 3 счёта.',
        );
        expect(aiDailyPlanMonthFacts({ doneSales: 1, items: [] })).toBe(
            'За месяц: 1 сделка.',
        );
    });

    it('прогноз: «≈N продаж», меньше одной — «<1», ноль — без «≈»', () => {
        expect(formatAiDailyForecast(2.1)).toBe('≈2 продажи');
        expect(formatAiDailyForecast(5)).toBe('≈5 продаж');
        expect(formatAiDailyForecast(0.4)).toBe('<1 продажи');
        expect(formatAiDailyForecast(0)).toBe('0 продаж');
    });

    it('сделки в работе: λ_pipe простыми словами, null — строки нет', () => {
        expect(aiDailyPlanPipelineFact(1.5)).toBe(
            'Сделки в работе ещё принесут ≈2 продажи до конца месяца.',
        );
        expect(aiDailyPlanPipelineFact(0)).toBe(
            'Сделки в работе ещё принесут 0 продаж до конца месяца.',
        );
        expect(aiDailyPlanPipelineFact(null)).toBeNull();
    });
});
