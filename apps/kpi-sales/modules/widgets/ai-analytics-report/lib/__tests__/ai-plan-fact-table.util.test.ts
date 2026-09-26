import { describe, expect, it } from 'vitest';
import {
    AI_PLAN_FACT_COLUMNS,
    AI_PLAN_FACT_FACT_ONLY_COLUMNS,
    AI_PLAN_FACT_NO_TARGETS_CAPTION,
    AI_PLAN_FACT_PLAN_SPAN,
    aiPlanFactGroupsHavePlan,
    aiPlanFactReasonLines,
    buildAiPlanFactGroups,
    resolveAiPlanFactTableMode,
} from '../ai-plan-fact-view.util';
import {
    managerName,
    planFact,
    singleGroup,
    withoutPlan,
    withPlan,
} from './ai-plan-fact.fixtures';

describe('группы и наличие плана в группах', () => {
    it('свод отдела первым, менеджеры по имени', () => {
        const groups = buildAiPlanFactGroups(
            planFact({
                rows: [withPlan('1'), withPlan('2'), withoutPlan('3')],
            }),
            managerName,
        );
        expect(groups.map(group => group.title)).toEqual([
            'Отдел (свод)',
            'Алексеева',
            'Борисов',
            'Яковлев',
        ]);
    });

    it('без свода — только менеджеры', () => {
        const groups = buildAiPlanFactGroups(
            planFact({ team: [] }),
            managerName,
        );
        expect(groups.map(group => group.key)).toEqual(['2', '1']);
    });

    it('план в группах: есть хоть одна строка с целью (досье без плана — нет)', () => {
        expect(aiPlanFactGroupsHavePlan(singleGroup(withPlan('1')))).toBe(true);
        expect(aiPlanFactGroupsHavePlan(singleGroup(withoutPlan('1')))).toBe(
            false,
        );
        expect(aiPlanFactGroupsHavePlan([])).toBe(false);
    });
});

describe('режим таблицы (карточка и досье)', () => {
    it('factOnly передан — как есть и без своей подписи', () => {
        expect(
            resolveAiPlanFactTableMode(singleGroup(withPlan('1')), true),
        ).toEqual({ factOnly: true, caption: null });
        expect(
            resolveAiPlanFactTableMode(singleGroup(withoutPlan('1')), false),
        ).toEqual({ factOnly: false, caption: null });
    });

    it('не передан (досье) — по целям; без целей — подпись, почему плана нет', () => {
        expect(resolveAiPlanFactTableMode(singleGroup(withPlan('1')))).toEqual({
            factOnly: false,
            caption: null,
        });
        expect(
            resolveAiPlanFactTableMode(singleGroup(withoutPlan('1'))),
        ).toEqual({
            factOnly: true,
            caption: AI_PLAN_FACT_NO_TARGETS_CAPTION,
        });
        expect(resolveAiPlanFactTableMode([])).toEqual({
            factOnly: true,
            caption: null,
        });
    });
});

describe('колонки и причины', () => {
    it('факт сразу за показателем; «плана нет» занимает колонки от «План» до «Статус»', () => {
        expect(AI_PLAN_FACT_COLUMNS.map(column => column.label)).toEqual([
            'Показатель',
            'Факт',
            'План',
            'Темп',
            'Прогноз',
            'Разрыв',
            'В день надо',
            'Статус',
        ]);
        expect(AI_PLAN_FACT_PLAN_SPAN).toBe(6);
        expect(
            AI_PLAN_FACT_FACT_ONLY_COLUMNS.map(column => column.label),
        ).toEqual(['Показатель', 'Факт']);
    });

    it('у расчётных колонок есть подсказка «что это», без жаргона', () => {
        const hinted = AI_PLAN_FACT_COLUMNS.filter(column => column.hint);
        expect(hinted.map(column => column.key)).toEqual(
            expect.arrayContaining(['pace', 'forecast', 'gap', 'perDay']),
        );
        for (const column of AI_PLAN_FACT_COLUMNS) {
            expect(column.hint ?? '').not.toMatch(/P50|медиан/i);
        }
    });

    it('причины: текст бэка, а без него — подпись кода', () => {
        const data = planFact({
            reasons: ['plan-snapshot-missing', 'daily-plan-disabled'],
            reasonTexts: ['Снимка целей нет'],
        });
        expect(aiPlanFactReasonLines(data)).toEqual([
            'Снимка целей нет',
            'план дня выключен на портале',
        ]);
    });

    it('«только факт» — без «план дня выключен»: колонки «в день» там нет', () => {
        const data = planFact({
            reasons: ['plan-snapshot-missing', 'daily-plan-disabled'],
            reasonTexts: ['Снимка целей нет', 'План дня выключен'],
        });
        expect(aiPlanFactReasonLines(data, 'fact-only')).toEqual([
            'Снимка целей нет',
        ]);
        expect(aiPlanFactReasonLines(data, 'partial')).toHaveLength(2);
    });
});
