import { describe, expect, it } from 'vitest';
import {
    createIndicatorLabeler,
    defaultIndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';
import {
    insertPlanColumns,
    planCellValue,
    planColumnHint,
    planColumnLabel,
    planColumnSpecs,
    planTotalValue,
    tablePlanColumnSpecs,
    type PlanColumnSpec,
    type PlanColumnsGate,
} from '../plan-columns.util';
import { planScopeUserIds } from '../plan-achievement.util';
import { INDICATORS, IVANOV, PETROV } from './plan-columns.fixtures';

const GATE_ON: PlanColumnsGate = {
    isPublic: false,
    canView: true,
    canViewAll: true,
    flags: { plansEvents: true, plansMerged: true, plansCallings: true },
    hiddenCodes: [],
};

const specOf = (code: string): PlanColumnSpec => {
    const spec = planColumnSpecs(INDICATORS, []).find(
        item => item.planCode === code,
    );
    if (!spec) throw new Error(`нет колонки плана ${code}`);
    return spec;
};

describe('planColumnSpecs', () => {
    it('колонки только у показателей с фактом в событиях и звонках: финансов и эфира нет', () => {
        expect(planColumnSpecs(INDICATORS, []).map(spec => spec.planCode)).toEqual([
            'calls_done',
            'presentations_done',
            'calls_over_30s',
            'offers_sent',
        ]);
    });

    it('поля: код плана, код факта, ключи названий, индекс показателя', () => {
        expect(specOf('calls_over_30s')).toEqual({
            planCode: 'calls_over_30s',
            factKey: '30',
            factSource: 'calling',
            labelKey: 'plan:calls_over_30s',
            factLabelKey: 'call:30',
            indicatorIndex: 4,
            periodType: 'month',
        });
        expect(specOf('presentations_done')).toMatchObject({
            factKey: 'presentation_done',
            factLabelKey: 'ev:presentation_done',
            labelKey: 'plan:presentations_done',
            indicatorIndex: 1,
        });
    });

    it('скрытые настройкой портала коды колонок не дают', () => {
        expect(
            planColumnSpecs(INDICATORS, ['calls_done', 'calls_over_30s']).map(
                spec => spec.planCode,
            ),
        ).toEqual(['presentations_done', 'offers_sent']);
    });
});

describe('tablePlanColumnSpecs', () => {
    const codes = (specs: PlanColumnSpec[]): string[] =>
        specs.map(spec => spec.planCode);

    it('события — только показатели событий, звонки — только бакеты, объединённый — оба', () => {
        expect(codes(tablePlanColumnSpecs('events', INDICATORS, GATE_ON))).toEqual([
            'calls_done',
            'presentations_done',
            'offers_sent',
        ]);
        expect(codes(tablePlanColumnSpecs('callings', INDICATORS, GATE_ON))).toEqual([
            'calls_over_30s',
        ]);
        expect(codes(tablePlanColumnSpecs('merged', INDICATORS, GATE_ON))).toEqual([
            'calls_done',
            'presentations_done',
            'calls_over_30s',
            'offers_sent',
        ]);
    });

    it('выключенный флаг таблицы — колонок нет, остальные таблицы не задеты', () => {
        const gate: PlanColumnsGate = {
            ...GATE_ON,
            flags: { plansEvents: false, plansMerged: true, plansCallings: false },
        };
        expect(tablePlanColumnSpecs('events', INDICATORS, gate)).toEqual([]);
        expect(tablePlanColumnSpecs('callings', INDICATORS, gate)).toEqual([]);
        expect(tablePlanColumnSpecs('merged', INDICATORS, gate)).toHaveLength(4);
    });

    it('публичная страница — колонок нет', () => {
        expect(
            tablePlanColumnSpecs('merged', INDICATORS, { ...GATE_ON, isPublic: true }),
        ).toEqual([]);
    });

    it('без доступа к планам или без показателей — колонок нет', () => {
        expect(
            tablePlanColumnSpecs('events', INDICATORS, { ...GATE_ON, canView: false }),
        ).toEqual([]);
        expect(tablePlanColumnSpecs('events', [], GATE_ON)).toEqual([]);
    });

    it('рядовой (без доступа к планам всех) колонок не видит — свой план у него подписью под фактом', () => {
        expect(
            tablePlanColumnSpecs('events', INDICATORS, { ...GATE_ON, canViewAll: false }),
        ).toEqual([]);
        expect(
            tablePlanColumnSpecs('merged', INDICATORS, { ...GATE_ON, canViewAll: false }),
        ).toEqual([]);
    });

    it('скрытые коды учитываются', () => {
        expect(
            codes(
                tablePlanColumnSpecs('events', INDICATORS, {
                    ...GATE_ON,
                    hiddenCodes: ['presentations_done'],
                }),
            ),
        ).toEqual(['calls_done', 'offers_sent']);
    });
});

describe('insertPlanColumns', () => {
    const specs = planColumnSpecs(INDICATORS, []);
    const insert = (codes: string[]): string[] =>
        insertPlanColumns(
            codes,
            code => code,
            specs,
            spec => spec.labelKey,
        );

    it('колонка плана — вплотную слева от своего факта, прочие колонки на месте', () => {
        expect(
            insert(['all', '30', 'call_done', 'ev_success_done', 'presentation_done']),
        ).toEqual([
            'all',
            'plan:calls_over_30s',
            '30',
            'plan:calls_done',
            'call_done',
            'ev_success_done',
            'plan:presentations_done',
            'presentation_done',
        ]);
    });

    it('нет колонки факта (скрыта «Колонками») — нет и колонки плана', () => {
        expect(insert(['call_done', 'ev_success_done'])).toEqual([
            'plan:calls_done',
            'call_done',
            'ev_success_done',
        ]);
    });

    it('колонки без кода не трогаются, входной массив не меняется', () => {
        const columns: { code?: string }[] = [{}, { code: 'call_done' }];
        const result = insertPlanColumns(
            columns,
            column => column.code,
            specs,
            spec => ({ code: spec.labelKey }),
        );
        expect(result).toEqual([{}, { code: 'plan:calls_done' }, { code: 'call_done' }]);
        expect(columns).toHaveLength(2);
    });

    it('без колонок планов — те же колонки', () => {
        expect(
            insertPlanColumns(['call_done'], code => code, [], spec => spec.labelKey),
        ).toEqual(['call_done']);
    });
});

describe('подпись и подсказка колонки плана', () => {
    const presentations = specOf('presentations_done');

    it('по умолчанию — «План: <название факта>» без лишних пробелов', () => {
        expect(
            planColumnLabel(presentations, '  Презентация  проведена', defaultIndicatorLabeler),
        ).toBe('План: Презентация проведена');
    });

    it('переименованный факт меняет подпись плана по умолчанию', () => {
        const labelOf = createIndicatorLabeler({
            'ev:presentation_done': 'Встреча',
            'call:30': 'Дозвоны',
        });
        expect(planColumnLabel(presentations, 'Презентация проведена', labelOf)).toBe(
            'План: Встреча',
        );
        expect(planColumnLabel(specOf('calls_over_30s'), 'Звонки > 30 сек', labelOf)).toBe(
            'План: Дозвоны',
        );
    });

    it('своё название колонки плана главнее', () => {
        const labelOf = createIndicatorLabeler({
            'ev:presentation_done': 'Встреча',
            'plan:presentations_done': 'План',
        });
        expect(planColumnLabel(presentations, 'Презентация проведена', labelOf)).toBe(
            'План',
        );
    });

    it('подсказка: к какому показателю план и на какой период он задан', () => {
        const labelOf = createIndicatorLabeler({ 'ev:presentation_done': 'Встреча' });
        expect(planColumnHint(presentations, 'Презентация проведена', labelOf)).toBe(
            'План по показателю «Встреча» (на квартал), пересчитан на выбранный период',
        );
        expect(
            planColumnHint(specOf('offers_sent'), 'КП', defaultIndicatorLabeler),
        ).toBe('План по показателю «КП» (на год), пересчитан на выбранный период');
    });
});

describe('значение колонки плана', () => {
    it('план на период округляется до целого', () => {
        expect(planCellValue(specOf('calls_done'), IVANOV)).toBe(10);
        expect(planCellValue(specOf('presentations_done'), IVANOV)).toBe(5);
    });

    it('план не задан — null («—»), сотрудник вне области видимости — undefined (пусто)', () => {
        expect(planCellValue(specOf('offers_sent'), IVANOV)).toBeNull();
        expect(planCellValue(specOf('calls_done'), undefined)).toBeUndefined();
    });

    it('итог — сумма планов области видимости (тех же целых, что в строках)', () => {
        expect(planTotalValue(specOf('calls_done'), [IVANOV, PETROV])).toBe(30);
        expect(planTotalValue(specOf('presentations_done'), [IVANOV, PETROV, undefined])).toBe(
            5,
        );
        expect(planTotalValue(specOf('offers_sent'), [IVANOV, PETROV])).toBeNull();
        expect(planTotalValue(specOf('calls_done'), [undefined])).toBeUndefined();
    });
});

describe('planScopeUserIds', () => {
    it('с правом видеть всех — все сотрудники отчёта, рядовой — только свой', () => {
        expect(planScopeUserIds([1, 2, 3], true, 2)).toEqual([1, 2, 3]);
        expect(planScopeUserIds([1, 2, 3], false, 2)).toEqual([2]);
        expect(planScopeUserIds([1, 3], false, 2)).toEqual([]);
    });
});
