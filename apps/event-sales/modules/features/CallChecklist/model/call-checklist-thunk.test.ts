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
import type { ChecklistFieldDef } from '../type/call-checklist.type';
import { cancelAllChecklistSaves } from '../lib/checklist-save-queue';
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

const DATETIME_DEF: ChecklistFieldDef = {
    code: 'op_invoice_date',
    type: 'datetime',
    title: 'Дата последнего счёта',
    required: true,
};

const DATE_DEF: ChecklistFieldDef = { ...DATETIME_DEF, type: 'date' };

const ENUM_DEF: ChecklistFieldDef = {
    code: 'op_reason',
    type: 'enumeration',
    title: 'Причина возражения',
    required: true,
};

const DTO_DEF: ChecklistFieldDef = {
    code: 'first_pay_date',
    type: 'date',
    title: 'Дата первой оплаты',
    required: true,
    channel: 'dto',
};

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
const makeStore = () => {
    const actions: Array<{ type: string; payload?: unknown }> = [];
    const dispatch = ((action: unknown) =>
        typeof action === 'function'
            ? (action as (d: unknown, g: () => RootState) => unknown)(
                  dispatch,
                  () => state,
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
    reportFrontError.mockClear();
});

afterEach(() => {
    cancelAllChecklistSaves();
    vi.useRealTimers();
});

describe('чек-лист: пустое значение не стирает дату в CRM', () => {
    it('незавершённый ввод («») в портал не уходит', async () => {
        const { dispatch, actions } = makeStore();
        dispatch(changeChecklistField(DATE_DEF, ''));
        await vi.advanceTimersByTimeAsync(2000);

        expect(dealUpdate).not.toHaveBeenCalled();
        expect(types(actions)).toEqual(['callChecklist/setDraft']);
    });

    it('явная очистка — единственный путь пустоты в портал', async () => {
        const { dispatch } = makeStore();
        await dispatch(clearChecklistField(DATE_DEF));

        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_INVOICE_DATE: '',
        });
    });

    it('очистка отменяет отложенную запись прежнего значения', async () => {
        const { dispatch } = makeStore();
        dispatch(changeChecklistField(DATE_DEF, '2026-08-26'));
        await dispatch(clearChecklistField(DATE_DEF));
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
        dispatch(changeChecklistField(DATE_DEF, '2026-08-2'));
        await vi.advanceTimersByTimeAsync(200);
        dispatch(changeChecklistField(DATE_DEF, '2026-08-26'));
        await vi.advanceTimersByTimeAsync(200);
        dispatch(changeChecklistField(DATE_DEF, '2026-08-27'));
        expect(dealUpdate).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(600);
        expect(dealUpdate).toHaveBeenCalledTimes(1);
        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_INVOICE_DATE: '27.08.2026',
        });
    });

    it('черновик виден сразу, «сохранено» — только после ответа портала', async () => {
        const { dispatch, actions } = makeStore();
        dispatch(changeChecklistField(DATE_DEF, '2026-08-26'));
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
        dispatch(changeChecklistField(DATE_DEF, '2026-08-26'));
        await vi.advanceTimersByTimeAsync(600);

        expect(types(actions)).toContain('callChecklist/saveFailed');
        expect(types(actions)).not.toContain('callChecklist/saveSucceeded');
        expect(reportFrontError).toHaveBeenCalledTimes(1);
    });
});

describe('чек-лист: формат значения для портала', () => {
    it('datetime пишется каноном CRM со временем', async () => {
        const { dispatch } = makeStore();
        dispatch(changeChecklistField(DATETIME_DEF, '2026-08-26T15:04'));
        await vi.advanceTimersByTimeAsync(600);

        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_INVOICE_DATE: '26.08.2026 15:04:00',
        });
    });

    it('date пишется без времени', async () => {
        const { dispatch } = makeStore();
        dispatch(changeChecklistField(DATE_DEF, '2026-08-26'));
        await vi.advanceTimersByTimeAsync(600);

        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_INVOICE_DATE: '26.08.2026',
        });
    });

    it('enum пишется bitrixId элемента', async () => {
        const { dispatch } = makeStore();
        dispatch(changeChecklistField(ENUM_DEF, 'expensive'));
        await vi.advanceTimersByTimeAsync(600);

        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_REASON: '555',
        });
    });

    it('dto-поле пишется мгновенно и никуда не ходит', async () => {
        const { dispatch, actions } = makeStore();
        dispatch(changeChecklistField(DTO_DEF, '2026-09-01'));

        expect(dealUpdate).not.toHaveBeenCalled();
        expect(types(actions)).toEqual([
            'callChecklist/setDraft',
            'callChecklist/saveSucceeded',
        ]);
        // Формат dto — как в контроле: значение уедет в payload отправки.
        expect(actions[1]?.payload).toEqual({
            code: 'first_pay_date',
            value: '2026-09-01',
        });
    });
});
