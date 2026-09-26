import { describe, expect, it } from 'vitest';
import type {
    AiDailyPlan,
    AiDailyPlanItem,
    AiDailyPlanRopOnly,
} from '@/modules/entities/ai-analytics';
import {
    aiDailyPlanHasGoal,
    aiDailyPlanHeadline,
    aiDailyPlanState,
    aiDailyPlanTodayList,
    buildAiDailyPlanView,
} from '../ai-daily-plan-view.util';

// Состояние, заголовок и модель карточки; счёт, строки и прогноз — ai-daily-plan-rows.util.test.

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
    }),
    item({ priority: 2, monthDone: 144, monthPlan: 200 }),
    item({
        callType: 'invoice_to_sale',
        title: 'Счета',
        requiredToday: 0,
        monthPlan: 6,
        monthDone: 3,
        priority: 3,
    }),
    item({
        callType: 'presentation_to_offer',
        title: 'Презентации (уникальные по компании)',
        requiredToday: 3,
        monthPlan: 40,
        monthDone: 30,
        priority: 4,
    }),
];

const ropOnly = (
    overrides: Partial<AiDailyPlanRopOnly> = {},
): AiDailyPlanRopOnly => ({
    norm: { value: 0.2, n: 120, w: 0.6, confidence: { level: 'ok' } },
    normAtRefQuality: null,
    betaSource: 'none',
    gExpected: 2.1,
    gCeiling: 4.4,
    ...overrides,
});

const plan = (overrides: Partial<AiDailyPlan> = {}): AiDailyPlan => ({
    managerId: '7',
    date: '2026-09-22',
    target: { sales: 10, source: 'plan', warnings: [] },
    doneSales: 4,
    pipelineExpected: 1.5,
    requiredVolume: 120,
    daysLeft: 7,
    items: leakOrderedItems(),
    explanation: {
        steps: [{ code: 'target', value: 10, text: 'Цель месяца G = 10' }],
        text: 'G = 10, Y₀ = 4, λ_pipe = 1,5, N_req = 120',
    },
    reason: null,
    ...overrides,
});

/** Как сегодня отдаёт бэк без цели: 0, «медиана», target-empty. */
const noTargetPlan = (overrides: Partial<AiDailyPlan> = {}): AiDailyPlan =>
    plan({
        target: { sales: 0, source: 'median', warnings: ['target-empty'] },
        doneSales: 2,
        ...overrides,
    });

describe('состояние плана', () => {
    it('no-target: target-empty или цель ≤ 0', () => {
        expect(aiDailyPlanState(noTargetPlan())).toBe('no-target');
        expect(
            aiDailyPlanState(
                plan({
                    target: { sales: 0, source: 'levelTarget', warnings: [] },
                }),
            ),
        ).toBe('no-target');
        expect(
            aiDailyPlanHasGoal(
                plan({
                    target: {
                        sales: 5,
                        source: 'median',
                        warnings: ['target-empty'],
                    },
                }),
            ),
        ).toBe(false);
        expect(aiDailyPlanHasGoal(plan())).toBe(true);
    });

    it('reached: цель закрыта или остаток покрывают сделки в работе', () => {
        expect(aiDailyPlanState(plan({ doneSales: 12 }))).toBe('reached');
        expect(
            aiDailyPlanState(plan({ doneSales: 9, pipelineExpected: 1.5 })),
        ).toBe('reached');
    });

    it('active: до цели ещё есть что добирать', () => {
        expect(aiDailyPlanState(plan())).toBe('active');
        expect(
            aiDailyPlanState(plan({ doneSales: 9, pipelineExpected: null })),
        ).toBe('active');
    });
});

describe('заголовок простыми словами', () => {
    it('цели нет — план дня не считается', () => {
        expect(aiDailyPlanHeadline(noTargetPlan())).toBe(
            'Цель на месяц не задана — план дня не считается.',
        );
    });

    it('active: сколько до цели и что сделать сегодня по воронке', () => {
        expect(aiDailyPlanHeadline(plan())).toBe(
            'До цели 6 сделок: сегодня нужно 12 звонков, 3 презентации и <1 КП.',
        );
    });

    it('active без рабочих дней и без строк на сегодня', () => {
        expect(aiDailyPlanHeadline(plan({ daysLeft: 0 }))).toBe(
            'До цели 6 сделок, а рабочих дней в месяце не осталось.',
        );
        expect(
            aiDailyPlanHeadline(
                plan({
                    doneSales: 9,
                    pipelineExpected: null,
                    items: [item({ requiredToday: 0 })],
                }),
            ),
        ).toBe('До цели 1 сделка: на сегодня активности в плане нет.');
    });

    it('reached: цель выполнена', () => {
        const done = plan({
            doneSales: 12,
            items: [item({ requiredToday: 0 })],
        });
        expect(aiDailyPlanHeadline(done)).toBe(
            'Цель месяца выполнена: 12 сделок при цели 10.',
        );
    });

    it('reached: обучающий минимум на сегодня дописывается', () => {
        const done = plan({
            doneSales: 10,
            items: [
                item({ requiredToday: 0 }),
                item({
                    callType: 'presentation_to_offer',
                    requiredToday: 2,
                    priority: 2,
                }),
            ],
        });
        expect(aiDailyPlanHeadline(done)).toBe(
            'Цель месяца выполнена: 10 сделок при цели 10. Сегодня по плану: 2 презентации.',
        );
    });

    it('reached: остаток закроют сделки в работе', () => {
        const covered = plan({
            doneSales: 9,
            pipelineExpected: 1.5,
            items: [item({ requiredToday: 0 })],
        });
        expect(aiDailyPlanHeadline(covered)).toBe(
            'Осталось закрыть 1 сделку — это ожидаем от сделок в работе. Держите обычный темп.',
        );
    });

    it('список на сегодня — в порядке воронки, нули пропускаются', () => {
        expect(aiDailyPlanTodayList(leakOrderedItems())).toBe(
            '12 звонков, 3 презентации и <1 КП',
        );
        expect(aiDailyPlanTodayList([])).toBe('');
    });
});

describe('модель карточки', () => {
    it('цели нет: заголовок, факт месяца, прогноз руководителю, строки без плана', () => {
        const view = buildAiDailyPlanView(noTargetPlan({ ropOnly: ropOnly() }));
        expect(view.state).toBe('no-target');
        expect(view.headline).toBe(
            'Цель на месяц не задана — план дня не считается.',
        );
        expect(view.monthFacts).toContain('2 сделки');
        expect(view.pipelineFact).toContain('≈2 продажи');
        expect(view.forecast?.expected).toBe('≈2 продажи');
        expect(view.rows.every(row => row.monthPlan === null)).toBe(true);
    });

    it('менеджеру прогноза нет — блока ropOnly он не получает', () => {
        expect(buildAiDailyPlanView(noTargetPlan()).forecast).toBeNull();
    });

    it('без истории стадий строки про сделки в работе нет (не ноль)', () => {
        const view = buildAiDailyPlanView(
            noTargetPlan({ pipelineExpected: null }),
        );
        expect(view.pipelineFact).toBeNull();
    });

    it('план на сегодня: строки в порядке воронки с планом месяца', () => {
        const view = buildAiDailyPlanView(plan());
        expect(view.state).toBe('active');
        expect(view.headline).toBe(aiDailyPlanHeadline(plan()));
        expect(view.rows[0]).toMatchObject({
            callType: 'call_to_presentation',
            monthDone: '144',
            monthPlan: '200',
        });
    });
});
