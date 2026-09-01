import { describe, expect, it, vi } from 'vitest';

// Хвост опросника к блоку продажи отношения не имеет, а его барель тянет UI.
vi.mock('@/modules/features/AfterPresentation', () => ({
    selectIsCheckPresentationApplicable: () => false,
    selectCheckPresentationComment: () => '',
}));

import type { RootState } from '@/modules/app/model/store';
import { answerKey } from '@/modules/entities/Questionnaire/lib/answer-key';
import { FALLBACK_CATALOG } from '@/modules/entities/Questionnaire/data/fallback-catalog';
import type { QuestionnaireDef } from '@/modules/entities/Questionnaire/model/questionnaire.type';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { PresentationProp } from '@/modules/entities/EventPresentation/model/PresSlice';
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
} from '@/modules/features/Departament/type/department-type';
// Прямой путь: барель фичи в этом файле замокан ради UI-диалога.
import { checkPresentationData } from '@/modules/features/AfterPresentation/data/check-presentation';
import { buildFlowPayload } from './build-flow-payload';

/**
 * Блок продажи: ответы dto-канала уезжают по `dtoPath` каталога, а не по
 * коду поля.
 *
 * Раньше сборка читала `valueByCode['OPPORTUNITY']` и
 * `['first_pay_date']` строковыми литералами. С портальным каталогом это
 * ломается молча в обе стороны: переименовали вопрос — сумма сделки уехала
 * пустой; завели чужой вопрос с кодом `OPPORTUNITY` — он подменил сумму.
 * Проверяется и то, что на встроенном каталоге payload остался прежним.
 */
const SALE_AMOUNT_KEY = answerKey('sale', 'OPPORTUNITY');
const SALE_DATE_KEY = answerKey('sale', 'first_pay_date');

const makeState = (over?: {
    workStatus?: string;
    answers?: Record<string, string>;
    comment?: string;
    defs?: QuestionnaireDef[];
    /** подтверждённые ответы опросника «5К»/«Хвост» */
    survey?: Record<string, string>;
}): RootState =>
    ({
        app: {
            domain: 'demo.bitrix24.ru',
            config: { withCheckPresentation: true },
            bitrix: {
                from: 'CRM_DEAL_DETAIL_ACTIVITY',
                company: null,
                deal: { ID: '10' },
                lead: null,
                task: null,
                user: null,
                placement: null,
            },
        },
        eventReport: {
            report: {
                [EV_REPORT_PROP.COMMENT]: over?.comment ?? 'поговорили',
                [EV_REPORT_PROP.WORK_STATUS]: {
                    current: { code: over?.workStatus ?? 'success' },
                },
                [EV_REPORT_PROP.NORESULT_REASON]: { current: null },
                [EV_REPORT_PROP.FAIL_TYPE]: { current: null },
                [EV_REPORT_PROP.FAIL_REASON]: { current: null },
            },
        },
        eventPlan: {
            [EV_PLAN_PROP.IS_ACTIVE]: false,
            [EV_PLAN_PROP.IS_IMPORTANT]: false,
            [EV_PLAN_PROP.NAME]: '',
            [EV_PLAN_PROP.DATE]: null,
            [EV_PLAN_PROP.TYPE]: { items: [], current: null },
        },
        department: {
            [DEPARTAMENT_STATE_PROP.MODE]: { current: null },
            [DEPARTAMENT_STATE_PROP.PLAN]: {
                [DUSER_ROLE.RESPONSIBLE]: { current: null },
                [DUSER_ROLE.CREATED_BY]: { current: null },
            },
        },
        eventPresentation: {
            [PresentationProp.COUNT]: 0,
            [PresentationProp.IS_PRESENTATION_DONE]: Boolean(over?.survey),
            [PresentationProp.IS_UNPLANNED_PRESENTATION]: false,
        },
        // Опросник «5К»/«Хвост»: инициализирован ровно тогда, когда кейс о
        // нём — иначе payload остаётся прежним (старое поведение).
        afterPresentation: {
            initialized: Boolean(over?.survey),
            checkPresentation: {
                items: checkPresentationData,
                committed: over?.survey ?? {},
            },
        },
        portal: { portal: null },
        contact: { current: { plan: null, report: null } },
        eventSale: { presDeals: { current: null } },
        eventItemMenu: { type: 'result' },
        eventTask: { current: null, tasks: [] },
        taskLeadLinks: { selectedIds: [] },
        presentationLeadLink: {
            resolved: false,
            noLink: false,
            selectedLeadId: null,
            siteStatusCode: null,
        },
        leadRequest: { finalSync: { notCaTypeCode: null, note: '' } },
        eventLead: { lead: null },
        eventPostFail: { postFailDate: null },
        returnToTmc: { menu: { isActive: false }, tmcDeals: [] },
        callChecklist: { valueByKey: over?.answers ?? {} },
        // Состав анкет движок читает из стора; каталога портала нет —
        // работает встроенный набор.
        questionnaireCatalog: { defs: over?.defs ?? FALLBACK_CATALOG },
    }) as unknown as RootState;

const saleOf = (state: RootState) =>
    buildFlowPayload(state).sale as {
        opportunity?: number;
        firstPayDate?: string;
    };

describe('payload отправки: чек-лист продажи (dto-канал)', () => {
    it('ответы уезжают по dtoPath каталога', () => {
        const sale = saleOf(
            makeState({
                answers: {
                    [SALE_AMOUNT_KEY]: '150000',
                    [SALE_DATE_KEY]: '2026-09-01',
                },
            }),
        );

        expect(sale.opportunity).toBe(150000);
        expect(sale.firstPayDate).toBe('2026-09-01');
    });

    it('ответ по коду поля (прежний ключ) в payload не попадает', () => {
        const sale = saleOf(
            makeState({
                answers: {
                    OPPORTUNITY: '999999',
                    first_pay_date: '2026-01-01',
                },
            }),
        );

        expect(sale.opportunity).toBeUndefined();
        expect(sale.firstPayDate).toBeUndefined();
    });

    it('чужой вопрос с кодом OPPORTUNITY сумму сделки не подменяет', () => {
        const sale = saleOf(
            makeState({
                answers: {
                    [answerKey('refine', 'OPPORTUNITY')]: '1',
                    [SALE_AMOUNT_KEY]: '150000',
                },
            }),
        );

        expect(sale.opportunity).toBe(150000);
    });

    it('ноль и мусор не уезжают — бэк не должен обнулять сумму', () => {
        expect(
            saleOf(makeState({ answers: { [SALE_AMOUNT_KEY]: '0' } }))
                .opportunity,
        ).toBeUndefined();
        expect(
            saleOf(makeState({ answers: { [SALE_AMOUNT_KEY]: 'нет' } }))
                .opportunity,
        ).toBeUndefined();
        expect(
            saleOf(makeState({ answers: { [SALE_DATE_KEY]: '' } }))
                .firstPayDate,
        ).toBeUndefined();
    });

    it('у каждого вопроса dto-канала объявлен адрес в payload', () => {
        // Вопрос без `dtoPath` рисуется, требует ответа — и никуда его не
        // отправляет: ответ теряется молча.
        const dtoFields = FALLBACK_CATALOG.flatMap(def => def.items).filter(
            field => field.channel === 'dto',
        );

        expect(dtoFields.length).toBeGreaterThan(0);
        for (const field of dtoFields) {
            expect(field.dtoPath).toBeTruthy();
        }
    });

    it('статус работы не «Продажа» — блока значений нет вовсе', () => {
        const sale = saleOf(
            makeState({
                workStatus: 'inJob',
                answers: {
                    [SALE_AMOUNT_KEY]: '150000',
                    [SALE_DATE_KEY]: '2026-09-01',
                },
            }),
        );

        expect(sale).not.toHaveProperty('opportunity');
        expect(sale).not.toHaveProperty('firstPayDate');
    });
});

/**
 * Канал `text`: ответ уходит в комментарий события. Порядок частей —
 * слова менеджера, ответы анкет, хвост презентации: запись истории
 * начинается с живого комментария, а не с заголовка блока.
 */
describe('payload отправки: ответы канала text в комментарии', () => {
    const TEXT_DEF: QuestionnaireDef = {
        code: 'report_call',
        title: 'Итог звонка',
        hint: null,
        purpose: 'report',
        presentation: 'inline',
        place: 'report',
        persist: 'onChange',
        conditions: [{ kind: 'always', values: [] }],
        configKey: null,
        legacyChecklistId: null,
        sort: 10,
        items: [
            {
                code: 'client_words',
                title: 'Слова клиента',
                placeholder: null,
                hint: null,
                groupTitle: null,
                sort: 10,
                control: 'text',
                isRequired: false,
                requireChange: false,
                staleAfterDays: null,
                channel: 'text',
                dtoPath: null,
                target: { mode: 'auto', entity: null },
                smart: null,
                isNative: false,
                field: null,
                legacyFieldCode: null,
                options: [],
            },
        ],
    };

    const descriptionOf = (state: RootState): string =>
        (buildFlowPayload(state).report as { description: string }).description;

    it('ответ приписан к комментарию менеджера блоком', () => {
        const description = descriptionOf(
            makeState({
                defs: [TEXT_DEF],
                answers: {
                    [answerKey('report_call', 'client_words')]: 'дорого',
                },
            }),
        );

        expect(description).toBe(
            'поговорили\n\n— Итог звонка —\n· Слова клиента: дорого',
        );
    });

    it('ответов нет — комментарий ровно тот, что написал менеджер', () => {
        expect(descriptionOf(makeState({ defs: [TEXT_DEF] }))).toBe(
            'поговорили',
        );
    });

    it('менеджер ничего не написал — уезжает только блок ответов', () => {
        const description = descriptionOf(
            makeState({
                comment: '',
                defs: [TEXT_DEF],
                answers: {
                    [answerKey('report_call', 'client_words')]: 'дорого',
                },
            }),
        );

        expect(description).toBe('— Итог звонка —\n· Слова клиента: дорого');
    });
});

/**
 * Ответы канала `smart` — отдельным конвертом верхнего уровня.
 *
 * Их адресат — поле ЭЛЕМЕНТА смарта (презентации, ЗПР), которого на момент
 * ответа ещё нет: элемент создаёт или закрывает сам поток этого отчёта, он
 * же и раскладывает ответы. Поэтому конверт адресуется КОДАМИ каталога, а не
 * UF-именами и не идентификаторами Битрикса, и уезжает рядом с отчётом, а не
 * внутри блока `sale` (анкета бывает и планировочной).
 */
describe('payload: ответы анкет в элемент смарта', () => {
    const SMART_DEF: QuestionnaireDef = {
        code: 'presentation_survey',
        title: 'Анкета презентации',
        hint: null,
        purpose: 'report',
        presentation: 'inline',
        place: 'report',
        persist: 'onChange',
        conditions: [{ kind: 'always', values: [] }],
        configKey: null,
        legacyChecklistId: null,
        sort: 10,
        items: [
            {
                code: 'client_promise',
                title: 'Обещание клиента',
                placeholder: null,
                hint: null,
                groupTitle: null,
                sort: 10,
                control: 'string',
                isRequired: false,
                requireChange: false,
                staleAfterDays: null,
                channel: 'smart',
                dtoPath: null,
                target: { mode: 'entity', entity: 'smart' },
                smart: { kind: 'presentation', entityTypeId: 1058 },
                isNative: false,
                field: { name: 'UF_CRM_94_CLIENT_PROMISE', type: 'string' },
                legacyFieldCode: null,
                options: [],
            },
        ],
    };

    const descriptionOf = (state: RootState): string =>
        (buildFlowPayload(state).report as { description: string }).description;

    const answersOf = (state: RootState) =>
        (
            buildFlowPayload(state) as unknown as {
                questionnaireAnswers?: unknown;
            }
        ).questionnaireAnswers;

    it('ответ уезжает конвертом «анкета — вопрос — значение»', () => {
        expect(
            answersOf(
                makeState({
                    defs: [SMART_DEF],
                    answers: {
                        [answerKey('presentation_survey', 'client_promise')]:
                            'Оплатит в пятницу',
                    },
                }),
            ),
        ).toEqual([
            {
                questionnaire: 'presentation_survey',
                item: 'client_promise',
                value: 'Оплатит в пятницу',
            },
        ]);
    });

    it('ответов нет — поля нет вовсе, а не пустой список', () => {
        // Бэк отличает «не прислали» (прежнее поведение) от «прислали
        // пусто»: старый фрейм этого поля не шлёт совсем и обязан работать
        // как раньше.
        expect(answersOf(makeState({ defs: [SMART_DEF] }))).toBeUndefined();
    });

    it('встроенный каталог payload не меняет — fallback цел', () => {
        expect(answersOf(makeState())).toBeUndefined();
    });

    it('ответ смарта в блок продажи и в комментарий не протекает', () => {
        // Каждый канал уезжает своей дорогой: подмешать смарт-ответ в сумму
        // сделки или в текст события значило бы разослать один ответ дважды.
        const state = makeState({
            defs: [SMART_DEF],
            answers: {
                [answerKey('presentation_survey', 'client_promise')]:
                    'Оплатит в пятницу',
            },
        });

        expect(saleOf(state).opportunity).toBeUndefined();
        expect(descriptionOf(state)).toBe('поговорили');
    });
});

/**
 * Опросник «5К»/«Хвост» — внутри блока презентации.
 *
 * Он такой же ответ при отчёте, как портальная анкета: раскладывает его сам
 * поток, который создаёт презентационные сделки и элемент смарта. Отдельный
 * серверный запрос ручки уходил своим порядком — и опросник, отправленный
 * ПОСЛЕ отчёта, снимку смарта было нечего дать.
 */
describe('payload: ответы опросника презентации', () => {
    const surveyOf = (state: RootState) =>
        (
            buildFlowPayload(state).presentation as unknown as {
                survey?: {
                    fiveK?: Record<string, string>;
                    talk?: Record<string, string>;
                    xvost?: string;
                    fiveKSummary?: string;
                };
            }
        ).survey;

    it('ответы едут кодами реестра и со сводкой «Пять К»', () => {
        const survey = surveyOf(
            makeState({
                survey: {
                    // Код опросника: в реестре полей его нет, перевод —
                    // на границе payload.
                    xo_impression: 'слушали',
                    op_5k_client_what: 'нормативка',
                    op_presentation_xvost: 'дожать цену',
                },
            }),
        );

        expect(survey).toEqual({
            talk: { op_talk_impression: 'слушали' },
            fiveK: { op_5k_client_what: 'нормативка' },
            xvost: 'дожать цену',
            fiveKSummary: 'КЛИЕНТ: Что хочет?: нормативка',
        });
    });

    it('пустые ответы в payload не попадают', () => {
        const survey = surveyOf(
            makeState({
                survey: {
                    xo_impression: '   ',
                    op_5k_client_what: 'нормативка',
                },
            }),
        );

        expect(survey).toEqual({
            fiveK: { op_5k_client_what: 'нормативка' },
            fiveKSummary: 'КЛИЕНТ: Что хочет?: нормативка',
        });
    });

    it('опросник не заполняли — блока survey нет вовсе', () => {
        // Прежнее поведение: старые сборки фрейма его не шлют, и поток
        // обязан работать как раньше.
        expect(surveyOf(makeState())).toBeUndefined();
    });
});
