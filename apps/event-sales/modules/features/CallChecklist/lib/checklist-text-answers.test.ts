import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { answerKey } from '@/modules/entities/Questionnaire/lib/answer-key';
import type {
    QuestionnaireDef,
    QuestionnaireItem,
} from '@/modules/entities/Questionnaire/model/questionnaire.type';
import { selectChecklistTextComment } from './checklist-text-answers';

/**
 * Канал `text`: ответ уходит в КОММЕНТАРИЙ события, а не в поле CRM.
 *
 * Третий канал наравне с `crm` и `dto` — для вопросов, под которые поле в
 * Битриксе заводить незачем: ответ нужен людям в ленте, а не аналитике.
 * До этого канал был объявлен в контракте, но исполнителя во фрейме не имел:
 * вопрос рисовался, ответ жил в стейте и никуда не уезжал.
 */
const item = (over: Partial<QuestionnaireItem> = {}): QuestionnaireItem => ({
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
    ...over,
});

const def = (
    code: string,
    title: string,
    items: QuestionnaireItem[],
): QuestionnaireDef => ({
    code,
    title,
    hint: null,
    purpose: 'report',
    presentation: 'inline',
    place: 'report',
    persist: 'onChange',
    conditions: [{ kind: 'always', values: [] }],
    configKey: null,
    legacyChecklistId: null,
    sort: 10,
    items,
});

const makeState = (
    defs: QuestionnaireDef[],
    answers: Record<string, string> = {},
): RootState =>
    ({
        questionnaireCatalog: { defs },
        callChecklist: { valueByKey: answers },
    }) as unknown as RootState;

describe('Ответы канала text — блок комментария', () => {
    it('вопрос и ответ строкой под заголовком анкеты', () => {
        const state = makeState([def('report_call', 'Итог звонка', [item()])], {
            [answerKey('report_call', 'client_words')]: 'Дорого, но думает',
        });

        expect(selectChecklistTextComment(state)).toBe(
            '— Итог звонка —\n· Слова клиента: Дорого, но думает',
        );
    });

    it('без ответов блока нет вовсе — пустой строки в комментарии не будет', () => {
        const state = makeState([def('report_call', 'Итог звонка', [item()])]);

        expect(selectChecklistTextComment(state)).toBe('');
    });

    it('пробелы ответом не считаются', () => {
        const state = makeState([def('report_call', 'Итог', [item()])], {
            [answerKey('report_call', 'client_words')]: '   ',
        });

        expect(selectChecklistTextComment(state)).toBe('');
    });

    it('ответы других каналов в комментарий не протекают', () => {
        // crm-ответ уже лежит в поле сущности, dto — уедет payload'ом:
        // дублировать их в тексте значило бы разослать один ответ трижды.
        const state = makeState(
            [
                def('report_call', 'Итог', [
                    item({ code: 'in_crm', channel: 'crm' }),
                    item({
                        code: 'in_dto',
                        channel: 'dto',
                        dtoPath: 'sale.opportunity',
                    }),
                ]),
            ],
            {
                [answerKey('report_call', 'in_crm')]: 'в поле',
                [answerKey('report_call', 'in_dto')]: '150000',
            },
        );

        expect(selectChecklistTextComment(state)).toBe('');
    });

    it('в текст уходит человекочитаемый ответ, а не код', () => {
        const state = makeState(
            [
                def('report_call', 'Итог', [
                    item({
                        code: 'promise',
                        title: 'Обещание',
                        control: 'string',
                        options: [
                            {
                                code: 'pay_now',
                                title: 'Оплатит сейчас',
                                bitrixId: null,
                            },
                        ],
                    }),
                    item({
                        code: 'pay_date',
                        title: 'Когда оплатит',
                        control: 'date',
                        sort: 20,
                    }),
                    item({
                        code: 'is_ready',
                        title: 'Готов работать',
                        control: 'boolean',
                        sort: 30,
                    }),
                ]),
            ],
            {
                [answerKey('report_call', 'promise')]: 'pay_now',
                [answerKey('report_call', 'pay_date')]: '2026-09-01',
                [answerKey('report_call', 'is_ready')]: 'Y',
            },
        );

        expect(selectChecklistTextComment(state)).toBe(
            [
                '— Итог —',
                '· Обещание: Оплатит сейчас',
                '· Когда оплатит: 01.09.2026',
                '· Готов работать: Да',
            ].join('\n'),
        );
    });

    it('несколько анкет — несколько блоков подряд', () => {
        const state = makeState(
            [
                def('first', 'Первая', [item()]),
                def('second', 'Вторая', [item()]),
            ],
            {
                [answerKey('first', 'client_words')]: 'раз',
                [answerKey('second', 'client_words')]: 'два',
            },
        );

        expect(selectChecklistTextComment(state)).toBe(
            '— Первая —\n· Слова клиента: раз\n\n— Вторая —\n· Слова клиента: два',
        );
    });
});
