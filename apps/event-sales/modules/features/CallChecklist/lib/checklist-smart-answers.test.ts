import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { answerKey } from '@/modules/entities/Questionnaire/lib/answer-key';
import { FALLBACK_CATALOG } from '@/modules/entities/Questionnaire/data/fallback-catalog';
import type {
    QuestionnaireCondition,
    QuestionnaireDef,
    QuestionnaireItem,
} from '@/modules/entities/Questionnaire/model/questionnaire.type';
import { selectChecklistSmartAnswers } from './checklist-smart-answers';
import {
    getChecklistMissing,
    resolveChecklistFields,
    selectInlineChecklists,
} from './checklist-selectors';

/**
 * Канал `smart`: ответ уезжает в поле ЭЛЕМЕНТА смарта — того, который
 * создаёт или закрывает поток этого отчёта (презентации, ЗПР, в том числе
 * спонтанные).
 *
 * Отличие от трёх прежних каналов ровно одно, и из него следует всё
 * остальное: элемента на момент вопроса ещё НЕ СУЩЕСТВУЕТ. Писать на лету
 * некуда, «сейчас: …» показывать неоткуда, носителя искать негде — ответ
 * копится в стейте и уезжает конвертом вместе с отчётом, а раскладывает его
 * по полям бэк, который один знает id элемента.
 */

/** Поле, заведённое в смарте презентаций; на портале оно живёт только там. */
const SMART_UF_KEY = 'UF_CRM_94_CLIENT_PROMISE';
const PRESENTATION_SMART = { kind: 'presentation', entityTypeId: 1058 };

const item = (over: Partial<QuestionnaireItem> = {}): QuestionnaireItem => ({
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
    // Носитель смарт-вопроса нормализатор ставит сам: элемент, а не строка CRM.
    target: { mode: 'entity', entity: 'smart' },
    smart: PRESENTATION_SMART,
    isNative: false,
    field: { name: SMART_UF_KEY, type: 'string' },
    legacyFieldCode: null,
    options: [],
    ...over,
});

const REPORT_PRESENTATION: QuestionnaireCondition[] = [
    { kind: 'reportType', values: ['presentation'] },
];

const def = (
    items: QuestionnaireItem[],
    conditions: QuestionnaireCondition[] = REPORT_PRESENTATION,
): QuestionnaireDef => ({
    code: 'presentation_survey',
    title: 'Анкета презентации',
    hint: null,
    purpose: 'report',
    presentation: 'inline',
    place: 'report',
    persist: 'onChange',
    conditions,
    configKey: null,
    legacyChecklistId: null,
    sort: 10,
    items,
});

const makeState = (over?: {
    defs?: QuestionnaireDef[];
    answers?: Record<string, string>;
    eventType?: string | null;
    isUnplannedPresentation?: boolean;
    companyRow?: Record<string, unknown> | null;
}): RootState =>
    ({
        app: {
            config: {},
            bitrix: {
                company: over?.companyRow ?? null,
                deal: { ID: '10' },
                lead: null,
            },
        },
        portal: { portal: null },
        eventPlan: { isActive: false, type: { current: null } },
        eventReport: { report: { workStatus: { current: null } } },
        eventTask: {
            current: over?.eventType ? { eventType: over.eventType } : null,
        },
        eventPresentation: {
            isPresentationDone: false,
            isUnplannedPresentation: over?.isUnplannedPresentation ?? false,
        },
        stagePredict: { result: null },
        questionnaireCatalog: { defs: over?.defs ?? [def([item()])] },
        callChecklist: {
            valueByKey: over?.answers ?? {},
            baselineByKey: {},
            baseDeal: { row: null },
        },
    }) as unknown as RootState;

const ANSWER = answerKey('presentation_survey', 'client_promise');

describe('Ответы канала smart — конверт отправки', () => {
    it('ответ уезжает кодами каталога: анкета, вопрос, значение', () => {
        // Ни UF-имени поля, ни id элемента справочника: это адреса чужой
        // системы, они меняются без нашего ведома — и фрейм, который их
        // везёт, начал бы врать молча. Адрес ответа — коды каталога.
        const state = makeState({ answers: { [ANSWER]: 'Оплатит в пятницу' } });

        expect(selectChecklistSmartAnswers(state)).toEqual([
            {
                questionnaire: 'presentation_survey',
                item: 'client_promise',
                value: 'Оплатит в пятницу',
            },
        ]);
    });

    it('значение — в каноне каталога, а не в формате Битрикса', () => {
        // Перевод в `DD.MM.YYYY`, `1`/`0` и числовой id элемента делает бэк
        // по ЖИВОМУ смарту портала: у фрейма этой правды нет.
        const state = makeState({
            defs: [
                def([
                    item({ code: 'meeting_at', control: 'date' }),
                    item({ code: 'is_lpr', control: 'boolean' }),
                    item({
                        code: 'result',
                        control: 'enumeration',
                        options: [
                            {
                                code: 'deal',
                                title: 'Договорились',
                                bitrixId: null,
                            },
                        ],
                    }),
                ]),
            ],
            answers: {
                [answerKey('presentation_survey', 'meeting_at')]: '2026-09-01',
                [answerKey('presentation_survey', 'is_lpr')]: 'Y',
                [answerKey('presentation_survey', 'result')]: 'deal',
            },
        });

        // Порядок в конверте — порядок показа вопросов (sort, при
        // равенстве код), поэтому сверяем по коду вопроса, а не по позиции.
        expect(
            Object.fromEntries(
                selectChecklistSmartAnswers(state).map(answer => [
                    answer.item,
                    answer.value,
                ]),
            ),
        ).toEqual({
            meeting_at: '2026-09-01',
            is_lpr: 'Y',
            result: 'deal',
        });
    });

    it('строка со своим списком уезжает названием варианта, а не кодом', () => {
        // Карточку элемента читают люди — `pay_now` в поле «Обещание
        // клиента» был бы мусором. То же правило уже действует на канале
        // `crm`, и разъезжаться двум каналам в одном вопросе незачем.
        const state = makeState({
            defs: [
                def([
                    item({
                        options: [
                            {
                                code: 'pay_now',
                                title: 'Оплатит сейчас',
                                bitrixId: null,
                            },
                            { code: 'think', title: 'Думает', bitrixId: null },
                        ],
                    }),
                ]),
            ],
            answers: { [ANSWER]: 'pay_now' },
        });

        expect(selectChecklistSmartAnswers(state)[0]?.value).toBe(
            'Оплатит сейчас',
        );
    });

    it('пустой ответ в конверт не попадает', () => {
        // Пустая строка уехала бы в элемент поверх поля, которое мог
        // заполнить кто-то другой.
        const state = makeState({ answers: { [ANSWER]: '   ' } });

        expect(selectChecklistSmartAnswers(state)).toEqual([]);
    });

    it('ответы других каналов в конверт не протекают', () => {
        const state = makeState({
            defs: [
                def([
                    item({ code: 'in_crm', channel: 'crm', smart: null }),
                    item({
                        code: 'in_dto',
                        channel: 'dto',
                        dtoPath: 'sale.opportunity',
                        field: null,
                        smart: null,
                    }),
                    item({
                        code: 'in_text',
                        channel: 'text',
                        field: null,
                        smart: null,
                    }),
                ]),
            ],
            answers: {
                [answerKey('presentation_survey', 'in_crm')]: 'в поле',
                [answerKey('presentation_survey', 'in_dto')]: '150000',
                [answerKey('presentation_survey', 'in_text')]: 'в комментарий',
            },
        });

        expect(selectChecklistSmartAnswers(state)).toEqual([]);
    });

    it('встроенный набор конверта не даёт — fallback цел', () => {
        // FALLBACK_CATALOG работает, пока портального каталога нет: смарт-
        // вопросов в нём нет вовсе, и появиться полю отправки от него
        // неоткуда.
        const state = makeState({ defs: FALLBACK_CATALOG });

        expect(selectChecklistSmartAnswers(state)).toEqual([]);
    });
});

describe('Вопрос смарта на экране', () => {
    it('тип события без смарта вопроса не показывает', () => {
        // Смарты сегодня есть у двух типов события. Анкета привязана к
        // презентации; отчёт по обычному звонку её не показывает — и
        // отправку она не блокирует, даже будучи обязательной.
        const state = makeState({
            defs: [def([item({ isRequired: true })])],
            eventType: 'warm',
        });

        expect(selectInlineChecklists(state)).toEqual([]);
    });

    it('отчёт по своему типу события вопрос показывает', () => {
        const state = makeState({ eventType: 'presentation' });

        expect(selectInlineChecklists(state)).toHaveLength(1);
        expect(
            resolveChecklistFields(state, def([item()])).map(
                field => field.def.code,
            ),
        ).toEqual(['client_promise']);
    });

    it('спонтанная презентация: тип задачи обычный, а анкета показана', () => {
        // Отметка «провёл презентацию» на непрезентационном событии — бэк
        // создаст элемент презентации, и ответы ему нужны. `reportType`
        // этого не ловит: он читает ТИП ЗАДАЧИ.
        const state = makeState({
            defs: [def([item()], [{ kind: 'presentationDone', values: [] }])],
            eventType: 'warm',
            isUnplannedPresentation: true,
        });

        expect(selectInlineChecklists(state)).toHaveLength(1);
    });

    it('презентации не было — анкета спонтанной презентации молчит', () => {
        const state = makeState({
            defs: [def([item()], [{ kind: 'presentationDone', values: [] }])],
            eventType: 'warm',
        });

        expect(selectInlineChecklists(state)).toEqual([]);
    });

    it('вопрос резолвится без носителя и без «сейчас»', () => {
        // Элемента ещё нет: показывать нечего, писать некуда. `entityId: 0`
        // и пустой `ufKey` — то самое, из-за чего движок в CRM не пойдёт.
        const [resolved] = resolveChecklistFields(makeState(), def([item()]));

        expect(resolved?.entityId).toBe(0);
        expect(resolved?.ufKey).toBe('');
        expect(resolved?.currentValue).toBe('');
    });

    it('одноимённое поле компании ответом смарта не становится', () => {
        // Имя поля из каталога адресует ЭЛЕМЕНТ. Носитель здесь оставлен
        // прежним (`auto`) намеренно: так выглядит анкета, которую
        // перевели на смарт, не тронув привязку. Решает КАНАЛ, а не
        // носитель, — иначе вопрос ушёл бы искать строку по имени поля,
        // нашёл одноимённое поле компании, показал его как «сейчас» и молча
        // закрыл обязательный пункт чужим значением.
        const required = def([
            item({
                isRequired: true,
                target: { mode: 'auto', entity: null },
            }),
        ]);
        const state = makeState({
            defs: [required],
            eventType: 'presentation',
            companyRow: { ID: '7', [SMART_UF_KEY]: 'Старое обещание' },
        });

        const [resolved] = resolveChecklistFields(state, required);
        expect(resolved?.currentValue).toBe('');
        expect(resolved?.entityId).toBe(0);
        expect(getChecklistMissing(state, required)).toHaveLength(1);
    });
});

describe('Обязательность вопроса смарта', () => {
    /**
     * «Требовать новое значение» на этом канале не бывает: прежнего значения
     * не существует вовсе, закрывать пункт нечем, кроме ответа этой сессии —
     * то есть флаг ничем не отличался бы от обычной обязательности.
     * Запрещают его в модели (бэк отказывает на сохранении), а нормализатор
     * фрейма гасит флаг вторым рубежом — иначе строка, сохранённая до
     * правила, заперла бы отправку неснимаемым требованием.
     */
    const required = def([item({ isRequired: true })]);

    it('незаполненный обязательный блокирует отправку', () => {
        const state = makeState({
            defs: [required],
            eventType: 'presentation',
        });

        expect(getChecklistMissing(state, required)).toHaveLength(1);
    });

    it('ответ этой сессии его закрывает', () => {
        const state = makeState({
            defs: [required],
            eventType: 'presentation',
            answers: { [ANSWER]: 'Оплатит в пятницу' },
        });

        expect(getChecklistMissing(state, required)).toEqual([]);
    });

    it('стёртый ответ снова блокирует отправку', () => {
        const state = makeState({
            defs: [required],
            eventType: 'presentation',
            answers: { [ANSWER]: '' },
        });

        expect(getChecklistMissing(state, required)).toHaveLength(1);
    });
});
