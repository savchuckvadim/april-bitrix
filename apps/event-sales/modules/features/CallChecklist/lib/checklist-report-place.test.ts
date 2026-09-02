import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { FALLBACK_CATALOG } from '@/modules/entities/Questionnaire/data/fallback-catalog';
import type { QuestionnaireDef } from '@/modules/entities/Questionnaire/model/questionnaire.type';
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
    defs?: QuestionnaireDef[];
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
        // Статус работы читает условие `workStatus` встроенной «Продажи».
        eventReport: {
            report: {
                [EV_REPORT_PROP.WORK_STATUS]: { current: { code: 'inJob' } },
            },
        },
        stagePredict: { status: 'idle', requestKey: null, result: null },
        // По умолчанию портального каталога нет — в сторе встроенный состав.
        questionnaireCatalog: { defs: over?.defs ?? FALLBACK_CATALOG },
        callChecklist: {
            valueByKey: {},
            draftByKey: {},
            savingKeys: {},
            baselineByKey: {},
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
        answerKey: 'pay:op_invoice_date',
        def: {
            code: 'op_invoice_date',
            control: 'date',
            title: 'Дата последнего счёта',
            isRequired: true,
            staleAfterDays: staleAfterDays ?? null,
        },
        currentValue: filledDaysAgo === null ? '' : dateInput(filledDaysAgo),
        entity: 'deal',
        entityId: 10,
        ufKey: 'UF_CRM_OP_INVOICE_DATE',
        options: [],
    }) as unknown as ResolvedChecklistField;

describe('Вопросы при отчёте: своя колонка', () => {
    it('отчёт по «Доработке» показывает набор в колонке ОТЧЁТА', () => {
        const state = makeState({ reportEventType: 'refine' });
        const report = selectInlineChecklistsAt(state, 'report');

        expect(report.map(def => def.code)).toContain('reportRefine');
    });

    it('набор отчёта НЕ протекает в колонку плана', () => {
        const state = makeState({ reportEventType: 'refine' });
        const plan = selectInlineChecklistsAt(state, 'plan');

        expect(plan.map(def => def.code)).not.toContain('reportRefine');
    });

    it('плановый чек-лист без `place` остаётся в колонке плана', () => {
        const state = makeState({ planCode: 'refine' });

        expect(
            selectInlineChecklistsAt(state, 'plan').map(d => d.code),
        ).toContain('refine');
        expect(
            selectInlineChecklistsAt(state, 'report').map(d => d.code),
        ).not.toContain('refine');
    });

    it('валидация отправки видит ОБЕ колонки', () => {
        const state = makeState({
            reportEventType: 'refine',
            planCode: 'refine',
        });
        const ids = selectInlineChecklists(state).map(def => def.code);

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

        expect(
            selectInlineChecklistsAt(hot, 'report').map(d => d.code),
        ).toEqual(['reportDecision']);
        expect(
            selectInlineChecklistsAt(pay, 'report').map(d => d.code),
        ).toEqual(['reportPay']);
    });

    it('место не задано — колонку берёт назначение анкеты (purpose)', () => {
        // Портал вправе не заполнять place: анкета отчётности живёт в
        // колонке отчёта, анкета планирования — в колонке плана. Место
        // показа приходит данными, в вёрстке его нет.
        const portalDef: QuestionnaireDef = {
            code: 'portalReport',
            title: 'Вопросы отчёта портала',
            hint: null,
            purpose: 'report',
            presentation: 'inline',
            place: null,
            persist: 'onChange',
            conditions: [{ kind: 'always', values: [] }],
            configKey: null,
            legacyChecklistId: null,
            sort: 10,
            items: [],
        };
        const state = makeState({
            defs: [
                portalDef,
                { ...portalDef, code: 'portalPlan', purpose: 'plan' },
            ],
        });

        expect(
            selectInlineChecklistsAt(state, 'report').map(d => d.code),
        ).toEqual(['portalReport']);
        expect(
            selectInlineChecklistsAt(state, 'plan').map(d => d.code),
        ).toEqual(['portalPlan']);
    });

    it('вопросы отчёта встроенного набора не обязательны', () => {
        // Свойство ВСТРОЕННОГО состава, а не движка: портальная анкета
        // вправе сделать вопрос отчёта обязательным, и тогда он заблокирует
        // отправку — движок к этому готов (валидация видит обе колонки).
        const reportDefs = FALLBACK_CATALOG.filter(
            def => def.place === 'report',
        );
        expect(reportDefs.length).toBeGreaterThan(0);
        for (const def of reportDefs) {
            expect(def.items.every(item => !item.isRequired)).toBe(true);
        }
    });
});

describe('Срок годности значения из CRM', () => {
    it('свежее значение закрывает обязательный пункт', () => {
        expect(
            isChecklistFieldMissing(
                resolvedDateField(5, 30),
                undefined,
                undefined,
            ),
        ).toBe(false);
    });

    it('просроченное значение снова требует ответа', () => {
        expect(
            isChecklistFieldMissing(
                resolvedDateField(400, 30),
                undefined,
                undefined,
            ),
        ).toBe(true);
    });

    it('ответ менеджера в этой сессии закрывает пункт даже при старом CRM-значении', () => {
        expect(
            isChecklistFieldMissing(
                resolvedDateField(400, 30),
                '2026-08-26',
                undefined,
            ),
        ).toBe(false);
    });

    it('без срока годности значение любой давности закрывает пункт', () => {
        expect(
            isChecklistFieldMissing(
                resolvedDateField(400),
                undefined,
                undefined,
            ),
        ).toBe(false);
    });

    it('пустое значение не закрывает пункт', () => {
        expect(
            isChecklistFieldMissing(
                resolvedDateField(null, 30),
                undefined,
                undefined,
            ),
        ).toBe(true);
    });

    /**
     * Срок годности — свойство ДАТЫ: у справочника и строки отметки времени
     * нет, и «протухание» там было бы выдумкой движка.
     */
    it('у справочника срок годности не действует', () => {
        const resolved = {
            ...resolvedDateField(400, 30),
            def: {
                code: 'op_objection_reason',
                control: 'enumeration',
                title: 'Возражение',
                isRequired: true,
                staleAfterDays: 30,
                requireChange: false,
                channel: 'crm',
            },
            currentValue: 'op_efield_fail_nomoney',
        } as unknown as ResolvedChecklistField;

        expect(isChecklistFieldMissing(resolved, undefined, undefined)).toBe(
            false,
        );
    });
});
