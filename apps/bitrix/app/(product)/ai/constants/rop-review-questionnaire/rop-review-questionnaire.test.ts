/**
 * Отзыв руководителя на разбор: регистрация в реестре, состав и виды
 * вопросов, карты подписей → кодов, шаблон ссылки, обязательность и
 * условный комментарий, протокол с группой чекбоксов.
 *
 * Форма — публичная дверь в бэк: ссылка не на карточку разбора означает
 * отзыв, который некуда положить, а несогласие без комментария — отзыв,
 * который нечем разбирать.
 */

import { describe, expect, it } from 'vitest';
import { HOW_QUESTIONNAIRES } from '../../../how-we-work/constants/questionnaires';
import { HOW_QUESTIONNAIRE_COPY } from '../../../how-we-work/constants/questionnaire-copy';
import type {
    HowQuestionnaireState,
    HowQuestionnaireSubmit,
} from '../../../how-we-work/constants/types';
import { buildProtocol } from '../../../how-we-work/lib/build-protocol';
import {
    buildSubmission,
    validateSubmission,
} from '../../../how-we-work/lib/build-submission';
import {
    ROP_REVIEW_AUTHOR_ROLE,
    ROP_REVIEW_ERROR,
    ROP_REVIEW_ISSUE,
    ROP_REVIEW_LIMITS,
    ROP_REVIEW_LINK_PATTERN,
    ROP_REVIEW_QUESTION_ID,
    ROP_REVIEW_QUESTIONNAIRE,
    ROP_REVIEW_SECTIONS,
    ROP_REVIEW_SUBMIT_PATH,
    ROP_REVIEW_VERDICT,
    validateRopReview,
} from './index';

const ID = ROP_REVIEW_QUESTION_ID;
const questions = ROP_REVIEW_QUESTIONNAIRE.questions;
const byId = (id: string) => questions.find(question => question.id === id);

const LINK = 'https://romashka.bitrix24.ru/crm/type/1036/details/42/';

const EMPTY: HowQuestionnaireState = {
    company: '',
    respondent: '',
    answers: {},
};

/** Заполнение, которое проходит проверку целиком. */
const FILLED: HowQuestionnaireState = {
    company: 'ООО Ромашка',
    respondent: 'Иванова, РОП',
    answers: {
        [ID.analysisLink]: { custom: LINK },
        [ID.authorName]: { custom: 'Мария' },
        [ID.authorRole]: { choice: 'руководитель отдела продаж' },
        [ID.verdict]: { choice: 'не согласен' },
        [ID.issues]: {
            values: [
                'тип звонка определён неверно',
                'оценка завышена или занижена',
            ],
        },
        [ID.comment]: {
            custom: 'Это не презентация, а повторный созвон.\nПоказа не было.',
        },
        [ID.contact]: { custom: '+7 900 000-00-00' },
    },
};

const withAnswers = (
    patch: HowQuestionnaireState['answers'],
): HowQuestionnaireState => ({
    ...FILLED,
    answers: { ...FILLED.answers, ...patch },
});

const submit = (): HowQuestionnaireSubmit => {
    const config = ROP_REVIEW_QUESTIONNAIRE.submit;
    if (!config) throw new Error('у отзыва руководителя нет отправки');
    return config;
};

describe('реестр анкет', () => {
    it('содержит отзыв руководителя под своим ключом', () => {
        expect(HOW_QUESTIONNAIRES['rop-review']).toBe(ROP_REVIEW_QUESTIONNAIRE);
        expect(HOW_QUESTIONNAIRES['rop-review'].id).toBe('rop-review');
    });

    it('отправляется своим маршрутом, домен берёт из ссылки на разбор', () => {
        expect(submit().path).toBe(ROP_REVIEW_SUBMIT_PATH);
        expect(ROP_REVIEW_SUBMIT_PATH).toBe('/api/rop-review');
        expect(submit().domainQuestionId).toBe(ID.analysisLink);
        expect(ROP_REVIEW_QUESTIONNAIRE.validate).toBe(validateRopReview);
    });
});

describe('состав анкеты', () => {
    it('идентификаторы вопросов уникальны и все семь на месте', () => {
        const ids = questions.map(question => question.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids).toEqual(Object.values(ID));
    });

    it('вопросы разделов идут подряд и в порядке анкеты', () => {
        const order: string[] = [];
        questions.forEach(question => {
            if (order[order.length - 1] !== question.group) {
                order.push(question.group ?? '');
            }
        });
        expect(order).toEqual(Object.values(ROP_REVIEW_SECTIONS));
    });

    it.each([
        [ID.analysisLink, 'link'],
        [ID.authorName, 'text'],
        [ID.authorRole, 'choice'],
        [ID.verdict, 'choice'],
        [ID.issues, 'multi'],
        [ID.comment, 'text'],
        [ID.contact, 'text'],
    ])('вопрос %s имеет вид %s', (id, kind) => {
        expect(byId(id)?.kind ?? 'choice').toBe(kind);
    });

    it('обязательны ссылка, имя, роль и вердикт; остальное — нет', () => {
        const required = questions
            .filter(question => question.required)
            .map(question => question.id);
        expect(required).toEqual([
            ID.analysisLink,
            ID.authorName,
            ID.authorRole,
            ID.verdict,
        ]);
    });

    it('варианты вопросов — подписи карт кодов, в их порядке', () => {
        const values = (id: string) =>
            byId(id)?.options.map(option => option.value);
        expect(values(ID.authorRole)).toEqual(
            Object.keys(ROP_REVIEW_AUTHOR_ROLE),
        );
        expect(values(ID.verdict)).toEqual(Object.keys(ROP_REVIEW_VERDICT));
        expect(values(ID.issues)).toEqual(Object.keys(ROP_REVIEW_ISSUE));
    });

    it('коды для бэка — те, что ждёт ручка', () => {
        expect(Object.values(ROP_REVIEW_AUTHOR_ROLE)).toEqual([
            'rop',
            'group_head',
            'director',
            'other',
        ]);
        expect(Object.values(ROP_REVIEW_VERDICT)).toEqual([
            'agree',
            'partly',
            'disagree',
        ]);
        expect(Object.values(ROP_REVIEW_ISSUE)).toEqual([
            'call_type',
            'score',
            'facts',
            'recommendations',
            'links',
            'transcript',
            'other',
        ]);
    });

    it('комментарий ограничен 2000 символами, контакт и имя — 200', () => {
        expect(byId(ID.comment)?.maxLength).toBe(2000);
        expect(byId(ID.contact)?.maxLength).toBe(200);
        expect(byId(ID.authorName)?.maxLength).toBe(200);
        expect(ROP_REVIEW_LIMITS.comment).toBe(2000);
    });
});

describe('шаблон ссылки на карточку разбора', () => {
    it.each([
        'https://romashka.bitrix24.ru/crm/type/1036/details/42/',
        'https://romashka.bitrix24.ru/crm/type/1036/details/42',
        'HTTPS://Romashka.Bitrix24.RU/crm/type/7/details/1/',
        'https://crm.my-company.com/crm/type/1036/details/42/',
    ])('принимает %s', link => {
        expect(ROP_REVIEW_LINK_PATTERN.test(link)).toBe(true);
    });

    it.each([
        'http://romashka.bitrix24.ru/crm/type/1036/details/42/',
        'https://romashka.bitrix24.ru/crm/deal/details/42/',
        'https://romashka.bitrix24.ru/crm/type/1036/details/',
        'https://romashka.bitrix24.ru/crm/type/1036/details/42/?tab=1',
        'romashka.bitrix24.ru/crm/type/1036/details/42/',
        'https://romashka.bitrix24.ru/crm/type/abc/details/42/',
    ])('отвергает %s', link => {
        expect(ROP_REVIEW_LINK_PATTERN.test(link)).toBe(false);
    });
});

describe('проверка перед отправкой', () => {
    it('без организации не отправляем', () => {
        expect(
            validateSubmission(ROP_REVIEW_QUESTIONNAIRE, submit(), EMPTY),
        ).toBe('Укажите организацию в подвале анкеты');
    });

    it('первым называет первый незаполненный обязательный вопрос', () => {
        expect(
            validateSubmission(ROP_REVIEW_QUESTIONNAIRE, submit(), {
                ...EMPTY,
                company: 'ООО Ромашка',
            }),
        ).toBe(
            HOW_QUESTIONNAIRE_COPY.requiredError(
                'Ссылка на карточку разбора звонка',
            ),
        );
    });

    it('ссылка не на карточку разбора — своя ошибка анкеты', () => {
        expect(
            validateSubmission(
                ROP_REVIEW_QUESTIONNAIRE,
                submit(),
                withAnswers({
                    [ID.analysisLink]: {
                        custom: 'https://romashka.bitrix24.ru/crm/deal/details/42/',
                    },
                }),
            ),
        ).toBe(ROP_REVIEW_ERROR.link);
    });

    it.each(['согласен частично', 'не согласен'])(
        '«%s» без комментария не отправляем',
        verdict => {
            expect(
                validateRopReview(
                    withAnswers({
                        [ID.verdict]: { choice: verdict },
                        [ID.comment]: { custom: '   ' },
                    }),
                ),
            ).toBe(ROP_REVIEW_ERROR.commentRequired);
        },
    );

    it('«согласен с разбором» проходит без комментария и без пунктов', () => {
        expect(
            validateSubmission(
                ROP_REVIEW_QUESTIONNAIRE,
                submit(),
                withAnswers({
                    [ID.verdict]: { choice: 'согласен с разбором' },
                    [ID.issues]: {},
                    [ID.comment]: {},
                    [ID.contact]: {},
                }),
            ),
        ).toBe('');
    });

    it('комментарий длиннее потолка не проходит', () => {
        expect(
            validateRopReview(
                withAnswers({
                    [ID.comment]: {
                        custom: 'x'.repeat(ROP_REVIEW_LIMITS.comment + 1),
                    },
                }),
            ),
        ).toBe(ROP_REVIEW_ERROR.commentTooLong);
    });

    it('полностью заполненная анкета проходит', () => {
        expect(
            validateSubmission(ROP_REVIEW_QUESTIONNAIRE, submit(), FILLED),
        ).toBe('');
    });
});

describe('протокол и тело отправки', () => {
    it('пустая анкета: разделы на месте, ответы подписаны по виду', () => {
        const protocol = buildProtocol(ROP_REVIEW_QUESTIONNAIRE, EMPTY);
        Object.values(ROP_REVIEW_SECTIONS).forEach(title => {
            expect(protocol, title).toContain(`== ${title} ==`);
        });
        expect(protocol).toMatch(
            /Ссылка на карточку разбора звонка: НЕ ЗАПОЛНЕНО/,
        );
        expect(protocol).toMatch(/Что в разборе не так: НЕ ВЫБРАНО/);
        expect(protocol).toContain(
            '«AI для отдела продаж → Что нужно от руководителя»',
        );
    });

    it('чекбоксы перечисляются через запятую, многострочный текст — с отступом', () => {
        const protocol = buildProtocol(ROP_REVIEW_QUESTIONNAIRE, FILLED);
        expect(protocol).toContain(
            'Что в разборе не так: тип звонка определён неверно, оценка завышена или занижена',
        );
        expect(protocol).toContain(
            'Это не презентация, а повторный созвон.\n   Показа не было.',
        );
        expect(protocol).toContain(
            `Ссылка на карточку разбора звонка: ${LINK}`,
        );
    });

    it('тело отправки несёт структурные ответы: список у чекбоксов, строки у прочих', () => {
        const body = buildSubmission(
            ROP_REVIEW_QUESTIONNAIRE,
            submit(),
            FILLED,
            '',
        );
        expect(body.domain).toBe(LINK);
        expect(body.answers).toEqual([
            { id: ID.analysisLink, value: LINK },
            { id: ID.authorName, value: 'Мария' },
            { id: ID.authorRole, value: 'руководитель отдела продаж' },
            { id: ID.verdict, value: 'не согласен' },
            {
                id: ID.issues,
                value: [
                    'тип звонка определён неверно',
                    'оценка завышена или занижена',
                ],
            },
            {
                id: ID.comment,
                value: 'Это не презентация, а повторный созвон.\nПоказа не было.',
            },
            { id: ID.contact, value: '+7 900 000-00-00' },
        ]);
    });
});
