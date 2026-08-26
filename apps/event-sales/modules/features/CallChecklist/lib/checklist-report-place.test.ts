import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { CHECKLIST_CATALOG } from '../data/checklist-catalog';
import {
    isChecklistFieldMissing,
    selectInlineChecklists,
    selectInlineChecklistsAt,
} from './checklist-selectors';
import type { ResolvedChecklistField } from './checklist-values';

/**
 * Вопросы ПРИ ОТЧЁТЕ (25.08) и срок годности значения.
 *
 * Первое: тип отчётного события до сих пор ни на что не влиял, хотя триггер
 * `reportType` в движке был. Наборы отчёта живут в своей колонке и не должны
 * протекать в колонку плана.
 * Второе: обязательное поле закрывалось значением ЛЮБОЙ давности — счёт
 * годичной давности закрывал чек-лист оплаты.
 */
const DAY_MS = 24 * 60 * 60 * 1000;

const dateInput = (offsetDays: number): string => {
    const d = new Date(Date.now() - offsetDays * DAY_MS);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const makeState = (over?: {
    reportEventType?: string | null;
    planCode?: string | null;
    withReportQuestions?: boolean;
}): RootState =>
    ({
        app: {
            config: {
                withReportQuestions: over?.withReportQuestions ?? true,
                withChecklistRefine: true,
                withChecklistPay: true,
            },
            bitrix: { company: null, deal: null, lead: null },
        },
        eventPlan: {
            isActive: Boolean(over?.planCode),
            type: {
                current: over?.planCode ? { id: 6, code: over.planCode } : null,
            },
        },
        eventTask: {
            current: over?.reportEventType
                ? { eventType: over.reportEventType }
                : null,
        },
        stagePredict: { status: 'idle', requestKey: null, result: null },
        callChecklist: {
            valueByCode: {},
            draftByCode: {},
            savingCodes: {},
            confirmed: {},
            error: null,
            baseDeal: { id: null, row: null, status: 'idle' },
        },
        portal: { portal: { bitrixDeal: { bitrixfields: [] } } },
    }) as unknown as RootState;

/** Резолвнутое поле с датой заданной давности в CRM. */
const resolvedDateField = (
    filledDaysAgo: number | null,
    staleAfterDays?: number,
): ResolvedChecklistField =>
    ({
        def: {
            code: 'op_invoice_date',
            type: 'date',
            title: 'Дата последнего счёта',
            required: true,
            staleAfterDays,
        },
        currentValue: filledDaysAgo === null ? '' : dateInput(filledDaysAgo),
        entity: 'deal',
        entityId: 10,
        ufKey: 'UF_CRM_OP_INVOICE_DATE',
        field: null,
    }) as unknown as ResolvedChecklistField;

describe('Вопросы при отчёте: своя колонка', () => {
    it('отчёт по «Доработке» показывает набор в колонке ОТЧЁТА', () => {
        const state = makeState({ reportEventType: 'refine' });
        const report = selectInlineChecklistsAt(state, 'report');

        expect(report.map(def => def.id)).toContain('reportRefine');
    });

    it('набор отчёта НЕ протекает в колонку плана', () => {
        const state = makeState({ reportEventType: 'refine' });
        const plan = selectInlineChecklistsAt(state, 'plan');

        expect(plan.map(def => def.id)).not.toContain('reportRefine');
    });

    it('плановый чек-лист без `place` остаётся в колонке плана', () => {
        const state = makeState({ planCode: 'refine' });

        expect(selectInlineChecklistsAt(state, 'plan').map(d => d.id)).toContain(
            'refine',
        );
        expect(
            selectInlineChecklistsAt(state, 'report').map(d => d.id),
        ).not.toContain('refine');
    });

    it('валидация отправки видит ОБЕ колонки', () => {
        const state = makeState({
            reportEventType: 'refine',
            planCode: 'refine',
        });
        const ids = selectInlineChecklists(state).map(def => def.id);

        expect(ids).toContain('refine');
        expect(ids).toContain('reportRefine');
    });

    it('настройка выключена — вопросов отчёта нет', () => {
        const state = makeState({
            reportEventType: 'refine',
            withReportQuestions: false,
        });

        expect(selectInlineChecklistsAt(state, 'report')).toEqual([]);
    });

    it('другой тип отчётного события — свой набор', () => {
        const hot = makeState({ reportEventType: 'hot' });
        const pay = makeState({ reportEventType: 'moneyAwait' });

        expect(selectInlineChecklistsAt(hot, 'report').map(d => d.id)).toEqual([
            'reportDecision',
        ]);
        expect(selectInlineChecklistsAt(pay, 'report').map(d => d.id)).toEqual([
            'reportPay',
        ]);
    });

    it('вопросы отчёта не обязательны — отправку не блокируют', () => {
        const reportDefs = CHECKLIST_CATALOG.filter(
            def => def.place === 'report',
        );
        expect(reportDefs.length).toBeGreaterThan(0);
        for (const def of reportDefs) {
            expect(def.fields.every(field => !field.required)).toBe(true);
        }
    });
});

describe('Срок годности значения из CRM', () => {
    it('свежее значение закрывает обязательный пункт', () => {
        expect(
            isChecklistFieldMissing(resolvedDateField(5, 30), undefined),
        ).toBe(false);
    });

    it('просроченное значение снова требует ответа', () => {
        expect(
            isChecklistFieldMissing(resolvedDateField(400, 30), undefined),
        ).toBe(true);
    });

    it('ответ менеджера в этой сессии закрывает пункт даже при старом CRM-значении', () => {
        expect(
            isChecklistFieldMissing(resolvedDateField(400, 30), '2026-08-26'),
        ).toBe(false);
    });

    it('без срока годности значение любой давности закрывает пункт', () => {
        expect(
            isChecklistFieldMissing(resolvedDateField(400), undefined),
        ).toBe(false);
    });

    it('пустое значение не закрывает пункт', () => {
        expect(
            isChecklistFieldMissing(resolvedDateField(null, 30), undefined),
        ).toBe(true);
    });
});
