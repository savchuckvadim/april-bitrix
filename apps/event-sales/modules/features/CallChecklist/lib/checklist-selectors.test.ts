import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import {
    selectIncompleteInlineChecklists,
    selectInlineChecklists,
    selectNextPendingChecklist,
} from './checklist-selectors';

/**
 * Движок чек-листов: активация настройкой портала + типом плана,
 * обязательность закрывается текущим CRM-значением или сохранённым ответом,
 * неустановленное на портале поле не блокирует отправку (самогейт).
 */
const FAIL_REASON_FIELD = {
    code: 'op_efield_fail_reason',
    bitrixId: 'OP_EFIELD_FAIL_REASON',
    items: [
        { code: 'op_efield_fail_nomoney', name: 'Нет денег', bitrixId: 555 },
        { code: 'op_efield_fail_lpr', name: 'ЛПР против', bitrixId: 556 },
    ],
};

const makeState = (over?: {
    enabled?: boolean;
    planCode?: string | null;
    isPlanActive?: boolean;
    dealValue?: unknown;
    override?: string;
    withDealField?: boolean;
    config?: Record<string, boolean>;
    targetStageCode?: string | null;
    values?: Record<string, string>;
    confirmed?: Record<string, boolean>;
    dealRow?: Record<string, unknown> | null;
}): RootState =>
    ({
        app: {
            config: {
                withChecklistRefine: over?.enabled ?? true,
                ...(over?.config ?? {}),
            },
            bitrix: {
                company: null,
                deal:
                    over?.dealRow !== undefined
                        ? over.dealRow
                        : {
                              ID: '10',
                              UF_CRM_OP_EFIELD_FAIL_REASON:
                                  over?.dealValue ?? '',
                          },
                lead: null,
            },
        },
        eventPlan: {
            isActive: over?.isPlanActive ?? true,
            type: {
                current:
                    over?.planCode === null
                        ? null
                        : { id: 6, code: over?.planCode ?? 'refine' },
            },
        },
        eventTask: { current: null },
        stagePredict: {
            status: over?.targetStageCode ? 'ready' : 'idle',
            requestKey: null,
            result: over?.targetStageCode
                ? { targetStageCode: over.targetStageCode, baseDealId: 10 }
                : null,
        },
        callChecklist: {
            valueByCode: {
                ...(over?.override
                    ? { op_efield_fail_reason: over.override }
                    : {}),
                ...(over?.values ?? {}),
            },
            confirmed: over?.confirmed ?? {},
            error: null,
            baseDeal: { id: null, row: null, status: 'idle' },
        },
        portal: {
            portal: {
                bitrixDeal: {
                    bitrixfields:
                        (over?.withDealField ?? true)
                            ? [FAIL_REASON_FIELD]
                            : [],
                },
            },
        },
    }) as unknown as RootState;

describe('CallChecklist: активация и обязательность', () => {
    it('настройка выключена — чек-листа нет', () => {
        expect(selectInlineChecklists(makeState({ enabled: false }))).toEqual(
            [],
        );
    });

    it('план «Доработка» + настройка — чек-лист активен и незакрыт', () => {
        const state = makeState();
        expect(selectInlineChecklists(state).map(def => def.id)).toEqual([
            'refine',
        ]);
        expect(
            selectIncompleteInlineChecklists(state).map(def => def.id),
        ).toEqual(['refine']);
    });

    it('другой тип плана — чек-лист доработки не активен', () => {
        expect(selectInlineChecklists(makeState({ planCode: 'warm' }))).toEqual(
            [],
        );
    });

    it('«Без плана» — чек-лист не требуется', () => {
        expect(
            selectInlineChecklists(makeState({ isPlanActive: false })),
        ).toEqual([]);
    });

    it('текущее значение в CRM закрывает обязательность', () => {
        const state = makeState({ dealValue: 555 });
        expect(selectIncompleteInlineChecklists(state)).toEqual([]);
    });

    it('сохранённый ответ закрывает обязательность', () => {
        const state = makeState({ override: 'op_efield_fail_lpr' });
        expect(selectIncompleteInlineChecklists(state)).toEqual([]);
    });

    it('поле не установлено на портале — отправка не блокируется', () => {
        const state = makeState({ withDealField: false });
        expect(selectIncompleteInlineChecklists(state)).toEqual([]);
    });
});

describe('CallChecklist: стадийные модалки (по предикту)', () => {
    const saleConfig = { withChecklistSale: true };

    it('предикт «Продажа» + настройка → модалка sale в очереди', () => {
        const state = makeState({
            enabled: false,
            config: saleConfig,
            targetStageCode: 'sales_success',
        });
        expect(selectNextPendingChecklist(state)?.id).toBe('sale');
    });

    it('без предикта модалок нет', () => {
        const state = makeState({ enabled: false, config: saleConfig });
        expect(selectNextPendingChecklist(state)).toBeNull();
    });

    it('заполненные dto-поля не закрывают шаг без confirm, confirm закрывает', () => {
        const filled = {
            OPPORTUNITY: '150000',
            first_pay_date: '2026-09-01',
        };
        const notConfirmed = makeState({
            enabled: false,
            config: saleConfig,
            targetStageCode: 'sales_success',
            values: filled,
        });
        // Значения есть, но шаг-подтверждение ещё не пройден.
        expect(selectNextPendingChecklist(notConfirmed)?.id).toBe('sale');

        const confirmed = makeState({
            enabled: false,
            config: saleConfig,
            targetStageCode: 'sales_success',
            values: filled,
            confirmed: { sale: true },
        });
        expect(selectNextPendingChecklist(confirmed)).toBeNull();
    });

    it('confirm без заполненных обязательных не снимает шаг', () => {
        const state = makeState({
            enabled: false,
            config: saleConfig,
            targetStageCode: 'sales_success',
            confirmed: { sale: true },
        });
        expect(selectNextPendingChecklist(state)?.id).toBe('sale');
    });

    it('сделки в сторе нет (встройка-компания) — sale всё равно требуется (dto-канал)', () => {
        const state = makeState({
            enabled: false,
            config: saleConfig,
            targetStageCode: 'sales_success',
            dealRow: null,
        });
        expect(selectNextPendingChecklist(state)?.id).toBe('sale');
    });
});
