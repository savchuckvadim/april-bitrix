import type {
    AiPlanFact,
    AiPlanFactManager,
    AiPlanFactRow,
} from '@/modules/entities/ai-analytics/model';
import type { AiPlanFactGroup } from '../ai-plan-fact-view.util';

/*
 * Локальные фикстуры тестов план-факта: строка с целью, строка без цели,
 * менеджер с планом и без, ответ ручки, снимок целей не сделан.
 */

export const row = (overrides: Partial<AiPlanFactRow> = {}): AiPlanFactRow => ({
    indicator: 'sales',
    plan: 10,
    fact: 3,
    pace: 0.6,
    forecastP50: 7,
    gap: 3,
    perDayNeeded: 0.7,
    status: 'behind',
    reasons: [],
    ...overrides,
});

export const noPlanRow = (
    indicator: AiPlanFactRow['indicator'],
    reason: AiPlanFactRow['reasons'][number] = 'plan-missing',
): AiPlanFactRow =>
    row({
        indicator,
        plan: null,
        pace: null,
        forecastP50: null,
        gap: null,
        perDayNeeded: null,
        status: 'no-plan',
        reasons: [reason],
    });

export const withPlan = (managerId: string): AiPlanFactManager => ({
    managerId,
    rows: [row(), row({ indicator: 'calls', plan: 200, fact: 90 })],
});

export const withoutPlan = (managerId: string): AiPlanFactManager => ({
    managerId,
    rows: [noPlanRow('sales'), noPlanRow('calls'), noPlanRow('presentations')],
});

export const planFact = (overrides: Partial<AiPlanFact> = {}): AiPlanFact => ({
    period: {
        monthKey: '2026-09',
        workdaysInMonth: 22,
        workdaysElapsed: 18,
        today: '2026-09-24',
        closed: false,
    },
    rows: [withPlan('1'), withPlan('2')],
    team: [row({ plan: 20, fact: 6 })],
    reasons: [],
    reasonTexts: [],
    ...overrides,
});

/** Снимка целей нет: у всех строк no-plan, чисел плана нет. */
export const snapshotMissing = (): AiPlanFact =>
    planFact({
        rows: [withoutPlan('1'), withoutPlan('2')],
        team: [noPlanRow('sales'), noPlanRow('calls')],
        reasons: ['plan-snapshot-missing'],
        reasonTexts: ['Снимка целей за месяц нет'],
    });

/** Одна группа менеджера — как в досье (flat). */
export const singleGroup = (manager: AiPlanFactManager): AiPlanFactGroup[] => [
    { key: manager.managerId, title: '', rows: manager.rows },
];

const NAMES: Record<string, string> = {
    '1': 'Яковлев',
    '2': 'Алексеева',
    '3': 'Борисов',
};

export const managerName = (id: string): string => NAMES[id] ?? id;
