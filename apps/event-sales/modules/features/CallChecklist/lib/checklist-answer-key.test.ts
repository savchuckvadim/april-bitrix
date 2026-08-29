import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { answerKey } from '@/modules/entities/Questionnaire/lib/answer-key';
import { FALLBACK_CATALOG } from '@/modules/entities/Questionnaire/data/fallback-catalog';
import type { ChecklistDef } from '../type/call-checklist.type';
import { buildChecklistFieldViews } from './checklist-field-view';
import {
    getChecklistMissing,
    selectChecklistRows,
} from './checklist-selectors';

/**
 * Ключ ответа — «набор:вопрос», а не код поля.
 *
 * `op_invoice_date` спрашивается дважды: «Дата последнего счёта» в чек-листе
 * оплаты и «Направлен счёт» в наборе решения. По коду поля они делили одно
 * значение, один статус «сохранено» и один таймер записи — ответ на один
 * вопрос молча закрывал другой. С портальным каталогом это перестаёт быть
 * осознанным решением каталога и становится ошибкой данных.
 */
const INVOICE_CODE = 'op_invoice_date';
const INVOICE_UF_KEY = 'UF_CRM_OP_INVOICE_DATE';

const INVOICE_FIELD = {
    code: INVOICE_CODE,
    bitrixId: 'OP_INVOICE_DATE',
    items: [],
};

const PAY_ANSWER = '2026-08-26T10:00';

/** Счёт в CRM не проставлен: закрыть вопрос может только ответ менеджера. */
const makeState = (): RootState =>
    ({
        app: {
            config: {},
            bitrix: {
                company: null,
                deal: { ID: '10', [INVOICE_UF_KEY]: '' },
                lead: null,
            },
        },
        callChecklist: {
            valueByKey: { [answerKey('pay', INVOICE_CODE)]: PAY_ANSWER },
            draftByKey: {},
            savingKeys: {},
            baselineByKey: {},
            confirmed: {},
            error: null,
            baseDeal: { id: null, row: null, status: 'idle' },
        },
        portal: {
            portal: { bitrixDeal: { bitrixfields: [INVOICE_FIELD] } },
        },
    }) as unknown as RootState;

const defById = (id: string): ChecklistDef => {
    const def = FALLBACK_CATALOG.find(item => item.code === id);
    if (!def) throw new Error(`нет анкеты ${id} в каталоге`);
    return def;
};

const viewsOf = (state: RootState, def: ChecklistDef) =>
    buildChecklistFieldViews(def, {
        portal: state.portal.portal,
        rows: selectChecklistRows(state),
        saved: state.callChecklist.valueByKey,
        drafts: state.callChecklist.draftByKey,
        savingKeys: state.callChecklist.savingKeys,
        baseline: state.callChecklist.baselineByKey,
        onChange: () => {},
        onClear: () => {},
    });

describe('Ключ ответа: одно поле в двух наборах', () => {
    it('ответ в наборе оплаты не закрывает тот же вопрос в наборе решения', () => {
        const state = makeState();

        expect(getChecklistMissing(state, defById('pay'))).toEqual([]);
        expect(
            getChecklistMissing(state, defById('decision')).map(
                field => field.code,
            ),
        ).toContain(INVOICE_CODE);
    });

    it('значение и статус «сохранено» — у каждого вопроса свои', () => {
        const state = makeState();

        const payField = viewsOf(state, defById('pay'))[0];
        expect(payField?.answerKey).toBe('pay:op_invoice_date');
        expect(payField?.value).toBe(PAY_ANSWER);
        expect(payField?.isSaved).toBe(true);
        expect(payField?.isMissing).toBe(false);

        const decisionField = viewsOf(state, defById('decision')).find(
            field => field.def.code === INVOICE_CODE,
        );
        expect(decisionField?.answerKey).toBe('decision:op_invoice_date');
        expect(decisionField?.value).toBe('');
        expect(decisionField?.isSaved).toBe(false);
        expect(decisionField?.isMissing).toBe(true);
    });

    it('оба вопроса пишут в одно поле портала — адрес записи не разъехался', () => {
        const state = makeState();
        const pay = viewsOf(state, defById('pay'))[0];
        const decision = viewsOf(state, defById('decision')).find(
            field => field.def.code === INVOICE_CODE,
        );

        expect(pay?.ufKey).toBe(INVOICE_UF_KEY);
        expect(decision?.ufKey).toBe(INVOICE_UF_KEY);
    });
});
