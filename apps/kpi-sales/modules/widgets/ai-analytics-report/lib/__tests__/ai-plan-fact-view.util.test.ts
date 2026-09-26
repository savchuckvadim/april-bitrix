import { describe, expect, it } from 'vitest';
import {
    AI_PLAN_FACT_FACT_ONLY_NOTE,
    aiPlanFactCoverage,
    aiPlanFactViewMode,
    buildAiPlanFactView,
    formatAiPlanFactCoverage,
} from '../ai-plan-fact-view.util';
import {
    managerName,
    noPlanRow,
    planFact,
    row,
    snapshotMissing,
    withoutPlan,
    withPlan,
} from './ai-plan-fact.fixtures';

describe('режим таблицы план-факт', () => {
    it('снимка целей нет — только факт, даже если где-то пришёл план', () => {
        expect(aiPlanFactViewMode(snapshotMissing())).toBe('fact-only');
        expect(
            aiPlanFactViewMode(
                planFact({ reasons: ['plan-snapshot-missing'] }),
            ),
        ).toBe('fact-only');
    });

    it('все строки no-plan без цели (снимок есть) — только факт', () => {
        const data = planFact({
            rows: [withoutPlan('1')],
            team: [noPlanRow('sales', 'target-empty')],
        });
        expect(aiPlanFactViewMode(data)).toBe('fact-only');
    });

    it('цель 0 (target-empty) планом не считается', () => {
        const zero = row({
            plan: 0,
            status: 'no-plan',
            reasons: ['target-empty'],
        });
        const data = planFact({
            rows: [{ managerId: '1', rows: [zero] }],
            team: [zero],
        });
        expect(aiPlanFactViewMode(data)).toBe('fact-only');
    });

    it('цели не у всех менеджеров — partial, у всех — full', () => {
        expect(
            aiPlanFactViewMode(
                planFact({ rows: [withPlan('1'), withoutPlan('2')] }),
            ),
        ).toBe('partial');
        expect(aiPlanFactViewMode(planFact())).toBe('full');
    });

    it('no-plan из-за факта при заданной цели — план есть, режим полный', () => {
        const noFact = row({
            fact: null,
            status: 'no-plan',
            reasons: ['fact-missing'],
        });
        const data = planFact({ rows: [{ managerId: '1', rows: [noFact] }] });
        expect(aiPlanFactViewMode(data)).toBe('full');
    });
});

describe('покрытие планами', () => {
    it('считает менеджеров хотя бы с одной целью', () => {
        const data = planFact({
            rows: [withPlan('1'), withoutPlan('2'), withoutPlan('3')],
        });
        expect(aiPlanFactCoverage(data)).toEqual({ withPlan: 1, total: 3 });
    });

    it('строка «План задан у N из M менеджеров» с падежом после «из»', () => {
        expect(formatAiPlanFactCoverage({ withPlan: 3, total: 18 })).toBe(
            'План задан у 3 из 18 менеджеров',
        );
        expect(formatAiPlanFactCoverage({ withPlan: 0, total: 1 })).toBe(
            'План задан у 0 из 1 менеджера',
        );
        expect(formatAiPlanFactCoverage({ withPlan: 5, total: 21 })).toBe(
            'План задан у 5 из 21 менеджера',
        );
        expect(formatAiPlanFactCoverage({ withPlan: 5, total: 11 })).toBe(
            'План задан у 5 из 11 менеджеров',
        );
    });
});

describe('вид карточки', () => {
    it('только факт: подсказка «что сделать», причины бэка вторичны, покрытия нет', () => {
        const view = buildAiPlanFactView(snapshotMissing(), managerName);
        expect(view.mode).toBe('fact-only');
        expect(view.note).toBe(
            'Планы этого месяца не зафиксированы — сверка по планам появится со следующего месяца, если задать планы («Планы» в шапке отчёта) до 1-го числа.',
        );
        expect(view.reasonLines).toEqual(['Снимка целей за месяц нет']);
        expect(view.coverageText).toBeNull();
        expect(view.groups[0]?.key).toBe('team');
        expect(view.empty).toBe(false);
    });

    it('часть менеджеров с планом: строка покрытия, подсказки нет', () => {
        const view = buildAiPlanFactView(
            planFact({
                rows: [withPlan('1'), withoutPlan('2'), withoutPlan('3')],
            }),
            managerName,
        );
        expect(view.mode).toBe('partial');
        expect(view.coverageText).toBe('План задан у 1 из 3 менеджеров');
        expect(view.note).toBeNull();
    });

    it('у всех план: ни покрытия, ни подсказки; пустой периметр помечен', () => {
        const full = buildAiPlanFactView(planFact(), managerName);
        expect(full.mode).toBe('full');
        expect(full.coverageText).toBeNull();
        expect(full.note).toBeNull();
        const empty = buildAiPlanFactView(
            planFact({ rows: [], team: [] }),
            managerName,
        );
        expect(empty.empty).toBe(true);
    });

    it('пустой периметр при целом снимке — не пишем «цели не зафиксированы»', () => {
        const empty = buildAiPlanFactView(
            planFact({ rows: [], team: [] }),
            managerName,
        );
        expect(empty.note).toBeNull();
        const emptyNoSnapshot = buildAiPlanFactView(
            planFact({
                rows: [],
                team: [],
                reasons: ['plan-snapshot-missing'],
                reasonTexts: ['Снимка целей нет'],
            }),
            managerName,
        );
        expect(emptyNoSnapshot.note).toBe(AI_PLAN_FACT_FACT_ONLY_NOTE.current);
    });

    it('закрытый месяц без снимка — только констатация, без совета', () => {
        const missing = snapshotMissing();
        const view = buildAiPlanFactView(
            { ...missing, period: { ...missing.period, closed: true } },
            managerName,
        );
        expect(view.note).toBe('Планы за месяц не были зафиксированы.');
        expect(view.note).toBe(AI_PLAN_FACT_FACT_ONLY_NOTE.closed);
    });

    it('«только факт» с выключенным планом дня: эта причина не показывается', () => {
        const view = buildAiPlanFactView(
            {
                ...snapshotMissing(),
                reasons: ['plan-snapshot-missing', 'daily-plan-disabled'],
                reasonTexts: ['Снимка целей нет', 'План дня выключен'],
            },
            managerName,
        );
        expect(view.reasonLines).toEqual(['Снимка целей нет']);
    });
});
