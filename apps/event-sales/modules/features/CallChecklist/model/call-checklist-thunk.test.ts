import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const dealUpdate = vi.fn().mockResolvedValue(true);
const companyUpdate = vi.fn().mockResolvedValue(true);
const leadUpdate = vi.fn().mockResolvedValue(true);

vi.mock('@workspace/bitrix', () => ({
    Bitrix: {
        getService: () => ({
            deal: { update: dealUpdate },
            company: { update: companyUpdate },
            lead: { update: leadUpdate },
        }),
    },
}));

const reportFrontError = vi.fn();
vi.mock('@/modules/shared/front-error', () => ({
    reportFrontError: (input: unknown) => reportFrontError(input),
}));

import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { answerKey } from '@/modules/entities/Questionnaire/lib/answer-key';
import type {
    ChecklistFieldDef,
    ChecklistFieldRef,
} from '../type/call-checklist.type';
import {
    cancelAllChecklistSaves,
    hasPendingChecklistSave,
} from '../lib/checklist-save-queue';
import {
    changeChecklistField,
    clearChecklistField,
} from './CallChecklistThunk';

const INVOICE_FIELD = {
    code: 'op_invoice_date',
    bitrixId: 'OP_INVOICE_DATE',
    items: [],
};

const REASON_FIELD = {
    code: 'op_reason',
    bitrixId: 'OP_REASON',
    items: [{ code: 'expensive', name: 'Дорого', bitrixId: 555 }],
};

/** Вопрос анкеты: дефолты встроенного набора + отличия кейса. */
const item = (
    code: string,
    control: ChecklistFieldDef['control'],
    over: Partial<ChecklistFieldDef> = {},
): ChecklistFieldDef => ({
    code,
    title: code,
    placeholder: null,
    hint: null,
    groupTitle: null,
    sort: 0,
    control,
    isRequired: true,
    requireChange: false,
    staleAfterDays: null,
    channel: 'crm',
    dtoPath: null,
    target: { mode: 'auto', entity: null },
    smart: null,
    isNative: false,
    field: null,
    legacyFieldCode: code,
    options: [],
    ...over,
});

const DATETIME_DEF = item('op_invoice_date', 'datetime', {
    title: 'Дата последнего счёта',
});

const DATE_DEF: ChecklistFieldDef = { ...DATETIME_DEF, control: 'date' };

const ENUM_DEF = item('op_reason', 'enumeration', {
    title: 'Причина возражения',
});

const DTO_DEF = item('first_pay_date', 'date', {
    title: 'Дата первой оплаты',
    channel: 'dto',
    dtoPath: 'sale.firstPayDate',
    legacyFieldCode: null,
});

/** Вопрос ПОРТАЛЬНОЙ анкеты: имя поля и варианты приехали каталогом. */
const PORTAL_MANUAL_DEF = item('client_promise', 'enumeration', {
    title: 'Обещание клиента',
    // Поля нет ни в слепке портала, ни в pbx-реестре: менеджер завёл его в
    // Битриксе руками, и адресуется оно ровно этим именем.
    field: { name: 'UF_CRM_1712345678', type: 'enumeration' },
    legacyFieldCode: null,
    options: [
        { code: 'pay_now', title: 'Оплатит сейчас', bitrixId: 777 },
        { code: 'think', title: 'Думает', bitrixId: 778 },
    ],
});

/**
 * Вопрос на ШТАТНОМ поле сделки: пользовательского типа у него нет, поэтому
 * справочник задаётся вариантами каталога — как и у UF-поля.
 */
const NATIVE_ENUM_DEF = item('source', 'enumeration', {
    title: 'Источник обращения',
    isNative: true,
    field: { name: 'SOURCE_ID', type: null },
    legacyFieldCode: null,
    options: [
        { code: 'call', title: 'Звонок', bitrixId: 7 },
        { code: 'web', title: 'Сайт', bitrixId: 8 },
    ],
});

/**
 * Вопрос в контексте набора: thunk'и работают с ключом ответа
 * («набор:вопрос»), а не с кодом поля.
 */
const ref = (
    checklistId: string,
    def: ChecklistFieldDef,
): ChecklistFieldRef => ({
    answerKey: answerKey(checklistId, def.code),
    def,
});

const DATE_REF = ref('pay', DATE_DEF);
const DATETIME_REF = ref('pay', DATETIME_DEF);
const ENUM_REF = ref('refine', ENUM_DEF);
const NATIVE_ENUM_REF = ref('refine', NATIVE_ENUM_DEF);
const DTO_REF = ref('sale', DTO_DEF);

const state = {
    app: {
        bitrix: {
            company: null,
            deal: { ID: '10', UF_CRM_OP_INVOICE_DATE: '01.07.2026 09:00:00' },
            lead: null,
        },
    },
    callChecklist: { baseDeal: { row: null } },
    portal: {
        portal: {
            bitrixDeal: { bitrixfields: [INVOICE_FIELD, REASON_FIELD] },
        },
    },
} as unknown as RootState;

/** Мини-стор: thunk'и исполняются, простые экшены копятся. */
const makeStore = (current: RootState = state) => {
    const actions: Array<{ type: string; payload?: unknown }> = [];
    const dispatch = ((action: unknown) =>
        typeof action === 'function'
            ? (action as (d: unknown, g: () => RootState) => unknown)(
                  dispatch,
                  () => current,
              )
            : actions.push(
                  action as { type: string; payload?: unknown },
              )) as unknown as AppDispatch;
    return { dispatch, actions };
};

const types = (actions: Array<{ type: string }>) => actions.map(a => a.type);

beforeEach(() => {
    vi.useFakeTimers();
    dealUpdate.mockClear();
    companyUpdate.mockClear();
    leadUpdate.mockClear();
    reportFrontError.mockClear();
});

afterEach(() => {
    cancelAllChecklistSaves();
    vi.useRealTimers();
});

describe('чек-лист: пустое значение не стирает дату в CRM', () => {
    it('незавершённый ввод («») в портал не уходит', async () => {
        const { dispatch, actions } = makeStore();
        dispatch(changeChecklistField(DATE_REF, ''));
        await vi.advanceTimersByTimeAsync(2000);

        expect(dealUpdate).not.toHaveBeenCalled();
        expect(types(actions)).toEqual(['callChecklist/setDraft']);
    });

    it('явная очистка — единственный путь пустоты в портал', async () => {
        const { dispatch } = makeStore();
        await dispatch(clearChecklistField(DATE_REF));

        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_INVOICE_DATE: '',
        });
    });

    it('очистка отменяет отложенную запись прежнего значения', async () => {
        const { dispatch } = makeStore();
        dispatch(changeChecklistField(DATE_REF, '2026-08-26'));
        await dispatch(clearChecklistField(DATE_REF));
        await vi.advanceTimersByTimeAsync(2000);

        expect(dealUpdate).toHaveBeenCalledTimes(1);
        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_INVOICE_DATE: '',
        });
    });
});

describe('чек-лист: дебаунс записи', () => {
    it('серия правок даёт один запрос — с последним значением', async () => {
        const { dispatch } = makeStore();
        dispatch(changeChecklistField(DATE_REF, '2026-08-2'));
        await vi.advanceTimersByTimeAsync(200);
        dispatch(changeChecklistField(DATE_REF, '2026-08-26'));
        await vi.advanceTimersByTimeAsync(200);
        dispatch(changeChecklistField(DATE_REF, '2026-08-27'));
        expect(dealUpdate).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(600);
        expect(dealUpdate).toHaveBeenCalledTimes(1);
        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_INVOICE_DATE: '27.08.2026',
        });
    });

    it('черновик виден сразу, «сохранено» — только после ответа портала', async () => {
        const { dispatch, actions } = makeStore();
        dispatch(changeChecklistField(DATE_REF, '2026-08-26'));
        expect(types(actions)).toEqual(['callChecklist/setDraft']);

        await vi.advanceTimersByTimeAsync(600);
        expect(types(actions)).toEqual([
            'callChecklist/setDraft',
            'callChecklist/saveStarted',
            'callChecklist/saveSucceeded',
        ]);
    });

    it('ошибка портала — saveFailed и reportFrontError, черновик остаётся', async () => {
        dealUpdate.mockRejectedValueOnce(new Error('403'));
        const { dispatch, actions } = makeStore();
        dispatch(changeChecklistField(DATE_REF, '2026-08-26'));
        await vi.advanceTimersByTimeAsync(600);

        expect(types(actions)).toContain('callChecklist/saveFailed');
        expect(types(actions)).not.toContain('callChecklist/saveSucceeded');
        expect(reportFrontError).toHaveBeenCalledTimes(1);
    });
});

describe('чек-лист: формат значения для портала', () => {
    it('datetime пишется каноном CRM со временем', async () => {
        const { dispatch } = makeStore();
        dispatch(changeChecklistField(DATETIME_REF, '2026-08-26T15:04'));
        await vi.advanceTimersByTimeAsync(600);

        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_INVOICE_DATE: '26.08.2026 15:04:00',
        });
    });

    it('date пишется без времени', async () => {
        const { dispatch } = makeStore();
        dispatch(changeChecklistField(DATE_REF, '2026-08-26'));
        await vi.advanceTimersByTimeAsync(600);

        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_INVOICE_DATE: '26.08.2026',
        });
    });

    it('enum пишется bitrixId элемента', async () => {
        const { dispatch } = makeStore();
        dispatch(changeChecklistField(ENUM_REF, 'expensive'));
        await vi.advanceTimersByTimeAsync(600);

        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_REASON: '555',
        });
    });

    it('enum ШТАТНОГО поля пишется bitrixId варианта из каталога', async () => {
        const { dispatch } = makeStore();
        dispatch(changeChecklistField(NATIVE_ENUM_REF, 'call'));
        await vi.advanceTimersByTimeAsync(600);

        // Без вариантов в резолве запись отменялась бы молча: варианта нет
        // → писать нечего → ни запроса, ни ошибки на экране.
        expect(dealUpdate).toHaveBeenCalledWith(10, { SOURCE_ID: '7' });
    });

    it('dto-поле пишется мгновенно и никуда не ходит', async () => {
        const { dispatch, actions } = makeStore();
        dispatch(changeChecklistField(DTO_REF, '2026-09-01'));

        expect(dealUpdate).not.toHaveBeenCalled();
        expect(types(actions)).toEqual([
            'callChecklist/setDraft',
            'callChecklist/saveSucceeded',
        ]);
        // Формат dto — как в контроле: значение уедет в payload отправки.
        // Ключ — ответа, а не поля: по нему сборка payload найдёт значение
        // через dtoPath каталога.
        expect(actions[1]?.payload).toEqual({
            key: 'sale:first_pay_date',
            value: '2026-09-01',
        });
    });
});

/**
 * Портальная анкета: поле заведено на портале РУКАМИ, в слепке (и в
 * pbx-реестре) его нет вовсе. Адрес записи — строка `field.name` из
 * каталога как есть, значение справочника — `bitrixId` варианта оттуда же.
 */
describe('чек-лист: адрес и вариант из портального каталога', () => {
    const MANUAL_UF_KEY = 'UF_CRM_1712345678';

    /** Ключ поля есть в строках всех трёх сущностей — носителя выбирает анкета. */
    const portalState = () =>
        ({
            app: {
                bitrix: {
                    company: { ID: '5', [MANUAL_UF_KEY]: '' },
                    deal: { ID: '10', [MANUAL_UF_KEY]: '' },
                    lead: { ID: '7', [MANUAL_UF_KEY]: '' },
                },
            },
            callChecklist: { baseDeal: { row: null } },
            // Слепок пуст: поле заведено вручную и в него не попало.
            portal: { portal: { bitrixDeal: { bitrixfields: [] } } },
        }) as unknown as RootState;

    it('пишем по имени поля из каталога, значением — bitrixId варианта', async () => {
        const { dispatch } = makeStore(portalState());
        dispatch(
            changeChecklistField(ref('pay_call', PORTAL_MANUAL_DEF), 'pay_now'),
        );
        await vi.advanceTimersByTimeAsync(600);

        // Ключ — ровно та строка, что пришла в каталоге: ни слепка, ни
        // сборки `UF_CRM_` + bitrixId.
        expect(companyUpdate).toHaveBeenCalledWith(5, {
            [MANUAL_UF_KEY]: '777',
        });
    });

    it('target.mode «entity» пишет в названный носитель, а не в первый по приоритету', async () => {
        const def: ChecklistFieldDef = {
            ...PORTAL_MANUAL_DEF,
            target: { mode: 'entity', entity: 'lead' },
        };
        const { dispatch } = makeStore(portalState());
        dispatch(changeChecklistField(ref('pay_call', def), 'think'));
        await vi.advanceTimersByTimeAsync(600);

        expect(leadUpdate).toHaveBeenCalledWith(7, { [MANUAL_UF_KEY]: '778' });
        // Приоритет компания → сделка → лид работает только при `auto`.
        expect(companyUpdate).not.toHaveBeenCalled();
        expect(dealUpdate).not.toHaveBeenCalled();
    });

    it('варианта нет в каталоге — в портал не пишем вовсе', async () => {
        const { dispatch } = makeStore(portalState());
        dispatch(
            changeChecklistField(ref('pay_call', PORTAL_MANUAL_DEF), 'unknown'),
        );
        await vi.advanceTimersByTimeAsync(600);

        // Записать нечего (bitrixId неизвестен) — чужое значение не трогаем.
        expect(companyUpdate).not.toHaveBeenCalled();
    });
});

/**
 * Одно поле в двух наборах (`op_invoice_date` спрашивается и в «Оплате», и
 * в «Клиент на решении»). По коду поля они делили ключ — второй ответ
 * отменял таймер первого и подменял его статус «сохранено».
 */
describe('чек-лист: запись во всех носителей поля', () => {
    // Доктрина полей-истин (EntityFieldsDialog): значение живёт на сделке
    // И компании разом — запись в одного носителя их разъезжала бы, а
    // чтение «сделка точнее» показывало бы устаревшее.
    const PORTAL_DATE_DUAL_DEF = item('purchase_date', 'date', {
        title: 'Плановая дата покупки',
        field: { name: 'UF_CRM_SALE_DATE_PROGNOZ', type: 'date' },
        legacyFieldCode: null,
    });
    const DUAL_REF = ref('refine_plan', PORTAL_DATE_DUAL_DEF);
    const dualState = {
        app: {
            bitrix: {
                company: { ID: '7', UF_CRM_SALE_DATE_PROGNOZ: '' },
                deal: { ID: '10', UF_CRM_SALE_DATE_PROGNOZ: '' },
                lead: null,
            },
        },
        callChecklist: { baseDeal: { row: null } },
        portal: { portal: { bitrixDeal: { bitrixfields: [] } } },
    } as unknown as RootState;

    it('date-вопрос анкеты уходит и в компанию, и в сделку одним значением', async () => {
        const { dispatch } = makeStore(dualState);
        dispatch(changeChecklistField(DUAL_REF, '2026-09-05'));
        await vi.advanceTimersByTimeAsync(2000);

        expect(companyUpdate).toHaveBeenCalledWith(7, {
            UF_CRM_SALE_DATE_PROGNOZ: '05.09.2026',
        });
        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_SALE_DATE_PROGNOZ: '05.09.2026',
        });
    });

    it('справочник пишется только главному носителю: bitrixId варианта у каждой сущности свой', async () => {
        const enumDualState = {
            ...dualState,
            app: {
                bitrix: {
                    company: { ID: '7', UF_CRM_1712345678: '' },
                    deal: { ID: '10', UF_CRM_1712345678: '' },
                    lead: null,
                },
            },
        } as unknown as RootState;
        const { dispatch } = makeStore(enumDualState);
        dispatch(
            changeChecklistField(
                ref('refine_plan', PORTAL_MANUAL_DEF),
                'pay_now',
            ),
        );
        await vi.advanceTimersByTimeAsync(2000);

        expect(companyUpdate).toHaveBeenCalledWith(7, {
            UF_CRM_1712345678: '777',
        });
        expect(dealUpdate).not.toHaveBeenCalled();
    });

    it('встроенный вопрос: свой UF-ключ у каждого носителя из слепка', async () => {
        const builtinDualState = {
            app: {
                bitrix: {
                    company: { ID: '7' },
                    deal: { ID: '10' },
                    lead: null,
                },
            },
            callChecklist: { baseDeal: { row: null } },
            portal: {
                portal: {
                    company: { bitrixfields: [INVOICE_FIELD] },
                    bitrixDeal: { bitrixfields: [INVOICE_FIELD] },
                },
            },
        } as unknown as RootState;
        const { dispatch } = makeStore(builtinDualState);
        dispatch(changeChecklistField(DATE_REF, '2026-07-01'));
        await vi.advanceTimersByTimeAsync(2000);

        expect(companyUpdate).toHaveBeenCalledWith(7, {
            UF_CRM_OP_INVOICE_DATE: '01.07.2026',
        });
        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_INVOICE_DATE: '01.07.2026',
        });
    });
});

describe('чек-лист: два вопроса одного поля не делят состояние', () => {
    const PAY_REF = ref('pay', DATETIME_DEF);
    const DECISION_REF = ref('decision', DATETIME_DEF);

    it('таймеры независимы — обе записи доходят до портала', async () => {
        const { dispatch, actions } = makeStore();
        dispatch(changeChecklistField(PAY_REF, '2026-08-26T10:00'));
        dispatch(changeChecklistField(DECISION_REF, '2026-08-27T11:00'));

        expect(hasPendingChecklistSave('pay:op_invoice_date')).toBe(true);
        expect(hasPendingChecklistSave('decision:op_invoice_date')).toBe(true);

        await vi.advanceTimersByTimeAsync(600);
        expect(dealUpdate).toHaveBeenCalledTimes(2);
        expect(dealUpdate).toHaveBeenNthCalledWith(1, 10, {
            UF_CRM_OP_INVOICE_DATE: '26.08.2026 10:00:00',
        });
        expect(dealUpdate).toHaveBeenNthCalledWith(2, 10, {
            UF_CRM_OP_INVOICE_DATE: '27.08.2026 11:00:00',
        });

        // Черновики и статусы «сохранено» — по своим ключам.
        expect(actions.map(a => (a.payload as { key?: string })?.key)).toEqual([
            'pay:op_invoice_date',
            'decision:op_invoice_date',
            'pay:op_invoice_date',
            'pay:op_invoice_date',
            'decision:op_invoice_date',
            'decision:op_invoice_date',
        ]);
    });

    it('очистка одного вопроса не отменяет запись другого', async () => {
        const { dispatch } = makeStore();
        dispatch(changeChecklistField(PAY_REF, '2026-08-26T10:00'));
        await dispatch(clearChecklistField(DECISION_REF));
        await vi.advanceTimersByTimeAsync(600);

        expect(dealUpdate).toHaveBeenCalledTimes(2);
        expect(dealUpdate).toHaveBeenNthCalledWith(1, 10, {
            UF_CRM_OP_INVOICE_DATE: '',
        });
        expect(dealUpdate).toHaveBeenNthCalledWith(2, 10, {
            UF_CRM_OP_INVOICE_DATE: '26.08.2026 10:00:00',
        });
    });
});

/**
 * Новые контролы на записи: «да/нет» и строка со своим списком ответов.
 * Значение контрола — код, в портал уезжает то, что поле умеет хранить.
 */
describe('чек-лист: запись новых контролов', () => {
    const BOOL_UF_KEY = 'UF_CRM_READY';
    const CHOICE_UF_KEY = 'UF_CRM_PROMISE';

    const BOOL_DEF = item('client_ready', 'boolean', {
        title: 'Клиент готов купить',
        field: { name: BOOL_UF_KEY, type: 'boolean' },
        legacyFieldCode: null,
    });

    const CHOICE_DEF = item('promise', 'string', {
        title: 'Что обещал клиент',
        field: { name: CHOICE_UF_KEY, type: 'string' },
        legacyFieldCode: null,
        options: [
            { code: 'pay_now', title: 'Оплатит сейчас', bitrixId: null },
            { code: 'think', title: 'Думает', bitrixId: null },
        ],
    });

    const controlsState = () =>
        ({
            app: {
                bitrix: {
                    company: null,
                    deal: {
                        ID: '10',
                        [BOOL_UF_KEY]: '',
                        [CHOICE_UF_KEY]: '',
                    },
                    lead: null,
                },
            },
            callChecklist: { baseDeal: { row: null } },
            portal: { portal: { bitrixDeal: { bitrixfields: [] } } },
        }) as unknown as RootState;

    it('«Да» и «Нет» пишутся как 1 и 0', async () => {
        const { dispatch } = makeStore(controlsState());
        dispatch(changeChecklistField(ref('call', BOOL_DEF), 'Y'));
        await vi.advanceTimersByTimeAsync(600);
        expect(dealUpdate).toHaveBeenCalledWith(10, { [BOOL_UF_KEY]: '1' });

        dispatch(changeChecklistField(ref('call', BOOL_DEF), 'N'));
        await vi.advanceTimersByTimeAsync(600);
        expect(dealUpdate).toHaveBeenLastCalledWith(10, {
            [BOOL_UF_KEY]: '0',
        });
    });

    it('вариант «из пункта» уезжает в строковое поле текстом', async () => {
        // В карточке Битрикса ответ читают люди — код `pay_now` там был бы
        // шумом; значение контрола при этом остаётся кодом.
        const { dispatch } = makeStore(controlsState());
        dispatch(changeChecklistField(ref('call', CHOICE_DEF), 'pay_now'));
        await vi.advanceTimersByTimeAsync(600);

        expect(dealUpdate).toHaveBeenCalledWith(10, {
            [CHOICE_UF_KEY]: 'Оплатит сейчас',
        });
    });

    it('свободный текст (контрол без списка) пишется как есть', async () => {
        const plain = item('client_words', 'text', {
            title: 'Слова клиента',
            field: { name: CHOICE_UF_KEY, type: 'string' },
            legacyFieldCode: null,
        });
        const { dispatch } = makeStore(controlsState());
        dispatch(
            changeChecklistField(ref('call', plain), 'сказал, что дорого'),
        );
        await vi.advanceTimersByTimeAsync(600);

        expect(dealUpdate).toHaveBeenCalledWith(10, {
            [CHOICE_UF_KEY]: 'сказал, что дорого',
        });
    });
});

/**
 * Канал `smart`: ответ адресован полю ЭЛЕМЕНТА смарта, который создаст или
 * закроет поток отчёта. Элемента сейчас нет — писать некуда, и движок в CRM
 * не идёт вовсе: ответ остаётся в стейте и уедет конвертом отправки.
 *
 * Проверка именно на записи: у смарт-вопроса, в отличие от dto- и
 * text-вопросов, есть готовое имя поля — и если бы движок пошёл искать под
 * него носителя, ответ уехал бы в одноимённое поле компании или сделки.
 */
describe('чек-лист: ответ смарта в CRM не уходит', () => {
    const SMART_DEF = item('client_promise', 'string', {
        title: 'Обещание клиента',
        channel: 'smart',
        target: { mode: 'entity', entity: 'smart' },
        smart: { kind: 'presentation', entityTypeId: 1058 },
        // Имя поля есть — но принадлежит оно элементу смарта, а не сделке.
        field: { name: 'UF_CRM_OP_INVOICE_DATE', type: 'string' },
        legacyFieldCode: null,
    });

    const SMART_REF = ref('presentation_survey', SMART_DEF);

    it('пишется мгновенно и никуда не ходит', async () => {
        const { dispatch, actions } = makeStore();
        dispatch(changeChecklistField(SMART_REF, 'Оплатит в пятницу'));
        await vi.advanceTimersByTimeAsync(2000);

        expect(dealUpdate).not.toHaveBeenCalled();
        expect(companyUpdate).not.toHaveBeenCalled();
        expect(leadUpdate).not.toHaveBeenCalled();
        expect(types(actions)).toEqual([
            'callChecklist/setDraft',
            'callChecklist/saveSucceeded',
        ]);
        // Значение легло в стейт в каноне каталога и под ключом ОТВЕТА —
        // по нему сборка payload и соберёт конверт.
        expect(actions[1]?.payload).toEqual({
            key: 'presentation_survey:client_promise',
            value: 'Оплатит в пятницу',
        });
    });

    it('явная очистка тоже не трогает CRM', async () => {
        const { dispatch } = makeStore();
        await dispatch(clearChecklistField(SMART_REF));

        expect(dealUpdate).not.toHaveBeenCalled();
        expect(companyUpdate).not.toHaveBeenCalled();
        expect(leadUpdate).not.toHaveBeenCalled();
    });
});
