import { describe, expect, it, vi } from 'vitest';

// Транспорт здесь не участвует, но thunk-модуль тянет клиента портала.
vi.mock('@workspace/bitrix', () => ({
    Bitrix: { getService: () => ({}) },
}));

import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { answerKey } from '@/modules/entities/Questionnaire/lib/answer-key';
import type {
    QuestionnaireDef,
    QuestionnaireItem,
} from '@/modules/entities/Questionnaire/model/questionnaire.type';
import {
    callChecklistActions,
    callChecklistReducer,
} from '../model/CallChecklistSlice';
import {
    captureChecklistBaseline,
    openCallChecklist,
} from '../model/CallChecklistThunk';
import { getChecklistMissing } from './checklist-selectors';

/**
 * «Обязательность изменения» — дословное требование владельца: есть вопросы,
 * на которые ответ обязан быть свежим («что клиент сказал СЕЙЧАС»), и запись,
 * стоящая в поле с прошлого раза, ответом на сегодняшний звонок не является.
 *
 * Механика: снимок значения на момент показа вопроса (`baselineByKey`) и
 * первая ветка в «не заполнено». Без снимка «требовать новое значение»
 * означало бы «перезаписать поле хоть чем-нибудь, в том числе тем же самым».
 */
const MANUAL_UF_KEY = 'UF_CRM_1712345678';
const QUESTION_CODE = 'objection';
const ANSWER_KEY = answerKey('refine_call', QUESTION_CODE);
const OLD_VALUE = 'Дорого';

const item = (over: Partial<QuestionnaireItem> = {}): QuestionnaireItem => ({
    code: QUESTION_CODE,
    title: 'Что мешает купить',
    placeholder: null,
    hint: null,
    groupTitle: null,
    sort: 10,
    control: 'string',
    isRequired: true,
    requireChange: true,
    staleAfterDays: null,
    channel: 'crm',
    dtoPath: null,
    target: { mode: 'auto', entity: null },
    smart: null,
    isNative: false,
    field: { name: MANUAL_UF_KEY, type: 'string' },
    legacyFieldCode: null,
    options: [],
    ...over,
});

const def = (over: Partial<QuestionnaireItem> = {}): QuestionnaireDef => ({
    code: 'refine_call',
    title: 'Звонок по доработке',
    hint: null,
    purpose: 'plan',
    presentation: 'inline',
    place: 'plan',
    persist: 'onChange',
    conditions: [{ kind: 'always', values: [] }],
    configKey: null,
    legacyChecklistId: null,
    sort: 10,
    items: [item(over)],
});

const makeState = (over?: {
    answer?: string;
    baseline?: Record<string, string>;
    item?: Partial<QuestionnaireItem>;
}): RootState =>
    ({
        app: { config: {}, bitrix: { company: null, lead: null, deal: null } },
        questionnaireCatalog: { defs: [def(over?.item)] },
        callChecklist: {
            valueByKey: over?.answer ? { [ANSWER_KEY]: over.answer } : {},
            draftByKey: {},
            savingKeys: {},
            baselineByKey: over?.baseline ?? {},
            confirmed: {},
            error: null,
            baseDeal: { id: null, row: null, status: 'idle' },
        },
        portal: { portal: { bitrixDeal: { bitrixfields: [] } } },
    }) as unknown as RootState;

/** Строка сделки с прежним значением поля — общий носитель всех кейсов. */
const withDeal = (state: RootState, crmValue: string): RootState => {
    (state.app.bitrix as unknown as { deal: unknown }).deal = {
        ID: '10',
        [MANUAL_UF_KEY]: crmValue,
    };
    return state;
};

const missingCodes = (state: RootState): string[] =>
    getChecklistMissing(state, state.questionnaireCatalog.defs[0]!).map(
        field => field.code,
    );

describe('Обязательность изменения: значение из CRM не считается ответом', () => {
    it('поле заполнено в CRM, но пункт не закрыт', () => {
        const state = withDeal(makeState(), OLD_VALUE);
        expect(missingCodes(state)).toEqual([QUESTION_CODE]);
    });

    it('без флага то же самое значение пункт закрывает', () => {
        const state = withDeal(
            makeState({ item: { requireChange: false } }),
            OLD_VALUE,
        );
        expect(missingCodes(state)).toEqual([]);
    });

    it('ответ, совпавший со снимком, ответом не считается', () => {
        const state = withDeal(
            makeState({
                answer: OLD_VALUE,
                baseline: { [ANSWER_KEY]: OLD_VALUE },
            }),
            OLD_VALUE,
        );
        expect(missingCodes(state)).toEqual([QUESTION_CODE]);
    });

    it('новый ответ закрывает пункт', () => {
        const state = withDeal(
            makeState({
                answer: 'Ушёл думать',
                baseline: { [ANSWER_KEY]: OLD_VALUE },
            }),
            OLD_VALUE,
        );
        expect(missingCodes(state)).toEqual([]);
    });

    it('снимка нет — сравниваем с текущим значением поля', () => {
        // Карточка ещё не показывалась (снимок не сделан): строже, чем
        // нужно, но не мягче — прежнее значение пункт не закроет.
        const same = withDeal(makeState({ answer: OLD_VALUE }), OLD_VALUE);
        expect(missingCodes(same)).toEqual([QUESTION_CODE]);

        const other = withDeal(makeState({ answer: 'Другое' }), OLD_VALUE);
        expect(missingCodes(other)).toEqual([]);
    });

    it('пустое поле: любой ответ закрывает пункт', () => {
        const state = withDeal(
            makeState({ answer: OLD_VALUE, baseline: { [ANSWER_KEY]: '' } }),
            '',
        );
        expect(missingCodes(state)).toEqual([]);
    });

    it('необязательный вопрос отправку не блокирует', () => {
        const state = withDeal(
            makeState({ item: { isRequired: false } }),
            OLD_VALUE,
        );
        expect(missingCodes(state)).toEqual([]);
    });

    it('канал не crm: прежнего значения нет, флаг не действует', () => {
        // У dto/text ответ нигде не хранится между звонками — «измени» там
        // ничем не отличалось бы от обычной обязательности.
        const state = withDeal(
            makeState({
                answer: '150000',
                item: {
                    channel: 'dto',
                    dtoPath: 'sale.opportunity',
                    field: null,
                },
            }),
            OLD_VALUE,
        );
        expect(missingCodes(state)).toEqual([]);
    });
});

describe('Снимок значений: первый побеждает', () => {
    it('повторный снимок не затирает исходное значение', () => {
        const captured = callChecklistReducer(
            undefined,
            callChecklistActions.baselineCaptured({
                entries: { [ANSWER_KEY]: OLD_VALUE },
            }),
        );
        const answered = callChecklistReducer(
            captured,
            callChecklistActions.saveSucceeded({
                key: ANSWER_KEY,
                value: 'Ушёл думать',
            }),
        );
        // Карточка перерисовалась и сняла бы значение заново — иначе данный
        // ответ стал бы равен снимку, и пункт снова оказался бы незакрытым.
        const again = callChecklistReducer(
            answered,
            callChecklistActions.baselineCaptured({
                entries: { [ANSWER_KEY]: 'Ушёл думать' },
            }),
        );

        expect(again.baselineByKey[ANSWER_KEY]).toBe(OLD_VALUE);
    });

    it('сброс ответов сбрасывает и снимок', () => {
        const captured = callChecklistReducer(
            undefined,
            callChecklistActions.baselineCaptured({
                entries: { [ANSWER_KEY]: OLD_VALUE },
            }),
        );

        expect(
            callChecklistReducer(captured, callChecklistActions.reset())
                .baselineByKey,
        ).toEqual({});
    });
});

describe('Снимок значений: сборка', () => {
    /** Мини-стор: thunk исполняется, простые экшены копятся. */
    const makeStore = (state: RootState) => {
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

    it('снимает текущее значение вопроса с «обязательностью изменения»', () => {
        const state = withDeal(makeState(), OLD_VALUE);
        const { dispatch, actions } = makeStore(state);

        dispatch(captureChecklistBaseline(state.questionnaireCatalog.defs));

        expect(actions).toEqual([
            {
                type: 'callChecklist/baselineCaptured',
                payload: { entries: { [ANSWER_KEY]: OLD_VALUE } },
            },
        ]);
    });

    it('вопросы без флага в снимок не попадают — экшена нет вовсе', () => {
        const state = withDeal(
            makeState({ item: { requireChange: false } }),
            OLD_VALUE,
        );
        const { dispatch, actions } = makeStore(state);

        dispatch(captureChecklistBaseline(state.questionnaireCatalog.defs));

        expect(actions).toEqual([]);
    });

    it('уже снятый ключ повторно не снимается', () => {
        const state = withDeal(
            makeState({ baseline: { [ANSWER_KEY]: OLD_VALUE } }),
            'Другое значение',
        );
        const { dispatch, actions } = makeStore(state);

        dispatch(captureChecklistBaseline(state.questionnaireCatalog.defs));

        expect(actions).toEqual([]);
    });
});

describe('Снимок значений: модалка снимает его до показа', () => {
    it('открытие анкеты сначала снимает значения, потом открывает окно', async () => {
        const state = withDeal(makeState(), OLD_VALUE);
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

        await dispatch(openCallChecklist('refine_call'));

        // Порядок важен: снимок после показа зафиксировал бы значение,
        // которое менеджер уже успел бы поменять.
        expect(actions.map(action => action.type)).toEqual([
            'callChecklist/baselineCaptured',
            'callChecklist/modalOpened',
        ]);
        expect(actions[0]?.payload).toEqual({
            entries: { [ANSWER_KEY]: OLD_VALUE },
        });
    });
});
