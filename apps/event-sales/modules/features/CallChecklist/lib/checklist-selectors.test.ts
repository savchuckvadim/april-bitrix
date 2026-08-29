import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { answerKey } from '@/modules/entities/Questionnaire/lib/answer-key';
import { FALLBACK_CATALOG } from '@/modules/entities/Questionnaire/data/fallback-catalog';
import {
    resolveChecklistFields,
    selectChecklistRows,
    selectIncompleteInlineChecklists,
    selectInlineChecklists,
    selectNextPendingChecklist,
} from './checklist-selectors';

/**
 * Движок анкет: активация настройкой портала + условием, обязательность
 * закрывается текущим CRM-значением или сохранённым ответом, неустановленное
 * на портале поле не блокирует отправку (самогейт).
 *
 * Состав берётся из стора — здесь встроенный (`FALLBACK_CATALOG`), тот же,
 * что стоит в сторе, пока портальный каталог не приехал.
 */
/**
 * Код поля берётся ИЗ КАТАЛОГА, а не пишется здесь руками: тест проверяет
 * движок (активацию и обязательность), а какое поле стоит у «Доработки» —
 * решение каталога, и его смена не должна ронять проверку движка.
 */
const REFINE_FIELD_CODE =
    FALLBACK_CATALOG.find(def => def.code === 'refine')?.items[0]?.code ?? '';
const REFINE_BITRIX_ID = REFINE_FIELD_CODE.toUpperCase();
const REFINE_UF_KEY = `UF_CRM_${REFINE_BITRIX_ID}`;

const REASON_FIELD = {
    code: REFINE_FIELD_CODE,
    bitrixId: REFINE_BITRIX_ID,
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
    /** Рубильник портала «анкеты выключены для типов события» (CSV кодов). */
    disabledEventTypes?: string;
    targetStageCode?: string | null;
    values?: Record<string, string>;
    confirmed?: Record<string, boolean>;
    dealRow?: Record<string, unknown> | null;
}): RootState =>
    ({
        app: {
            config: {
                withChecklistRefine: over?.enabled ?? true,
                questionnairesDisabledEventTypes:
                    over?.disabledEventTypes ?? '',
                ...(over?.config ?? {}),
            },
            bitrix: {
                company: null,
                deal:
                    over?.dealRow !== undefined
                        ? over.dealRow
                        : {
                              ID: '10',
                              [REFINE_UF_KEY]: over?.dealValue ?? '',
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
        // Портального каталога нет — в сторе встроенный состав.
        questionnaireCatalog: { defs: FALLBACK_CATALOG },
        callChecklist: {
            valueByKey: {
                // Ключ ответа — «анкета:вопрос», не код поля.
                ...(over?.override
                    ? {
                          [answerKey('refine', REFINE_FIELD_CODE)]:
                              over.override,
                      }
                    : {}),
                ...(over?.values ?? {}),
            },
            draftByKey: {},
            savingKeys: {},
            baselineByKey: {},
            confirmed: over?.confirmed ?? {},
            error: null,
            baseDeal: { id: null, row: null, status: 'idle' },
        },
        portal: {
            portal: {
                bitrixDeal: {
                    bitrixfields:
                        (over?.withDealField ?? true) ? [REASON_FIELD] : [],
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
        expect(selectInlineChecklists(state).map(def => def.code)).toEqual([
            'refine',
        ]);
        expect(
            selectIncompleteInlineChecklists(state).map(def => def.code),
        ).toEqual(['refine']);
    });

    /**
     * Рубильник портала `questionnaires_disabled_event_types`. Считать его
     * обязан фрейм: бэк ответы погашенной анкеты выбрасывает молча, и без
     * этой проверки менеджер отвечал бы в пустоту, обязательный вопрос
     * запирал бы отправку, а ответ канала `crm` уехал бы прямо в сделку.
     */
    it('тип события выключен рубильником — анкеты нет и отправку она не держит', () => {
        const state = makeState({ disabledEventTypes: 'refine' });
        expect(selectInlineChecklists(state)).toEqual([]);
        expect(selectIncompleteInlineChecklists(state)).toEqual([]);
    });

    it('рубильник на чужой тип события анкету не трогает', () => {
        const state = makeState({ disabledEventTypes: 'presentation, hot' });
        expect(selectInlineChecklists(state).map(def => def.code)).toEqual([
            'refine',
        ]);
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

    /**
     * Ластик стирает значение и в CRM, и в ответах, а строки сущностей в
     * сторе не перечитываются: по устаревшему значению строки пункт
     * выглядел бы закрытым, и отчёт уехал бы с пустым обязательным полем.
     */
    it('ластик стёр значение — обязательность снова не закрыта', () => {
        const state = makeState({
            dealValue: 555,
            values: { [answerKey('refine', REFINE_FIELD_CODE)]: '' },
        });
        expect(
            selectIncompleteInlineChecklists(state).map(def => def.code),
        ).toEqual(['refine']);
    });

    it('поле не установлено на портале — отправка не блокируется', () => {
        const state = makeState({ withDealField: false });
        expect(selectIncompleteInlineChecklists(state)).toEqual([]);
    });
});

/**
 * Дедлок, ради которого триггеры свели в один источник: у инлайн-хука была
 * СВОЯ копия резолва без фолбэка на базовую сделку. Во встройке-компании
 * (сделки в сторе нет) карточка не показывала чек-лист, а окно предпроверки
 * требовало его заполнить — отправить было нельзя, заполнить негде.
 */
describe('CallChecklist: один источник для карточки и предпроверки', () => {
    const companyEmbed = (): RootState => {
        const state = makeState({ dealRow: null });
        state.callChecklist.baseDeal = {
            id: 10,
            row: { ID: '10', [REFINE_UF_KEY]: '' },
            status: 'ready',
        };
        return state;
    };

    it('встройка-компания: чек-лист активен и его поля резолвятся', () => {
        const state = companyEmbed();
        // Предпроверка (валидация отправки) требует чек-лист…
        expect(
            selectIncompleteInlineChecklists(state).map(def => def.code),
        ).toEqual(['refine']);

        // …и ровно то же видит карточка: те же поля, из той же строки.
        const def = selectInlineChecklists(state)[0]!;
        expect(resolveChecklistFields(state, def)).toHaveLength(1);
        expect(selectChecklistRows(state).deal).toMatchObject({ ID: '10' });
    });

    it('значение базовой сделки закрывает обязательность так же, как своей', () => {
        const state = companyEmbed();
        state.callChecklist.baseDeal.row = { ID: '10', [REFINE_UF_KEY]: 555 };
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
        expect(selectNextPendingChecklist(state)?.code).toBe('sale');
    });

    it('без предикта модалок нет', () => {
        const state = makeState({ enabled: false, config: saleConfig });
        expect(selectNextPendingChecklist(state)).toBeNull();
    });

    it('заполненные dto-поля не закрывают шаг без confirm, confirm закрывает', () => {
        const filled = {
            [answerKey('sale', 'OPPORTUNITY')]: '150000',
            [answerKey('sale', 'first_pay_date')]: '2026-09-01',
        };
        const notConfirmed = makeState({
            enabled: false,
            config: saleConfig,
            targetStageCode: 'sales_success',
            values: filled,
        });
        // Значения есть, но шаг-подтверждение ещё не пройден.
        expect(selectNextPendingChecklist(notConfirmed)?.code).toBe('sale');

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
        expect(selectNextPendingChecklist(state)?.code).toBe('sale');
    });

    it('сделки в сторе нет (встройка-компания) — sale всё равно требуется (dto-канал)', () => {
        const state = makeState({
            enabled: false,
            config: saleConfig,
            targetStageCode: 'sales_success',
            dealRow: null,
        });
        expect(selectNextPendingChecklist(state)?.code).toBe('sale');
    });
});
