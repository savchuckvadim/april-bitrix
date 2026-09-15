/**
 * Бриф оценки звонка: состав вопросов, сборка протокола и правила отправки.
 *
 * Эта форма — публичная дверь: пустая отправка без согласия или без ссылки на
 * запись означает заявку, по которой нечего делать, а расхождение реестра и
 * анкеты — форму, которую страница не найдёт.
 */

import { describe, expect, it } from 'vitest';
import { CALIBRATION_CALL_TYPES } from '../../../how-we-work/constants/calibration-brief-sections';
import { HOW_QUESTIONNAIRES } from '../../../how-we-work/constants/questionnaires';
import { HOW_QUESTIONNAIRE_COPY } from '../../../how-we-work/constants/questionnaire-copy';
import type {
    HowQuestionnaireState,
    HowQuestionnaireSubmit,
} from '../../../how-we-work/constants/types';
import { buildProtocol } from '../../../how-we-work/lib/build-protocol';
import { validateSubmission } from '../../../how-we-work/lib/build-submission';
import {
    CALL_REVIEW_CONSENT_OPTION,
    CALL_REVIEW_QUESTION_ID,
    CALL_REVIEW_QUESTIONNAIRE,
    CALL_REVIEW_SECTIONS,
    CALL_REVIEW_SUBMIT_PATH,
} from './index';

const questions = CALL_REVIEW_QUESTIONNAIRE.questions;
const byId = (id: string) => questions.find(question => question.id === id);

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
        [CALL_REVIEW_QUESTION_ID.portalDomain]: {
            custom: 'romashka.bitrix24.ru',
        },
        [CALL_REVIEW_QUESTION_ID.manager]: {
            custom: 'Менеджер, третий месяц',
        },
        [CALL_REVIEW_QUESTION_ID.callDate]: { custom: '12.09.2026' },
        [CALL_REVIEW_QUESTION_ID.callType]: {
            choice: CALIBRATION_CALL_TYPES[3],
            comment: 'показывали систему',
        },
        [CALL_REVIEW_QUESTION_ID.recordLink]: {
            custom: 'https://romashka.bitrix24.ru/crm/deal/details/10/',
        },
        [CALL_REVIEW_QUESTION_ID.situation]: {
            custom: 'Клиент второй раз просит подумать.\nНе понимаю почему.',
        },
        [CALL_REVIEW_QUESTION_ID.expectation]: {
            custom: 'Поймать обещания клиенту',
        },
        [CALL_REVIEW_QUESTION_ID.consentRecord]: {
            choice: CALL_REVIEW_CONSENT_OPTION,
        },
    },
};

const submit = (): HowQuestionnaireSubmit => {
    const config = CALL_REVIEW_QUESTIONNAIRE.submit;
    if (!config) throw new Error('у брифа оценки звонка нет отправки');
    return config;
};

describe('состав брифа оценки звонка', () => {
    it('отправляется своим маршрутом и берёт домен из существующего вопроса', () => {
        expect(submit().path).toBe(CALL_REVIEW_SUBMIT_PATH);
        expect(CALL_REVIEW_SUBMIT_PATH).toBe('/api/call-review');
        expect(byId(submit().domainQuestionId)).toBeDefined();
    });

    it('идентификаторы вопросов уникальны', () => {
        const ids = questions.map(question => question.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('вопросы разделов идут подряд и в порядке брифа', () => {
        const order: string[] = [];
        questions.forEach(question => {
            if (order[order.length - 1] !== question.group) {
                order.push(question.group ?? '');
            }
        });
        expect(order).toEqual(Object.values(CALL_REVIEW_SECTIONS));
    });

    it.each([
        [CALL_REVIEW_QUESTION_ID.portalDomain, 'link'],
        [CALL_REVIEW_QUESTION_ID.manager, 'text'],
        [CALL_REVIEW_QUESTION_ID.callDate, 'text'],
        [CALL_REVIEW_QUESTION_ID.callType, 'choice'],
        [CALL_REVIEW_QUESTION_ID.recordLink, 'link'],
        [CALL_REVIEW_QUESTION_ID.situation, 'text'],
        [CALL_REVIEW_QUESTION_ID.crmLink, 'link'],
        [CALL_REVIEW_QUESTION_ID.expectation, 'text'],
        [CALL_REVIEW_QUESTION_ID.consentRecord, 'choice'],
    ])('вопрос %s есть и имеет вид %s', (id, kind) => {
        const question = byId(id);
        expect(question).toBeDefined();
        expect(question?.kind ?? 'choice').toBe(kind);
    });

    it('тип звонка выбирается из девяти наших типов', () => {
        const options = byId(CALL_REVIEW_QUESTION_ID.callType)?.options ?? [];
        expect(options.map(option => option.value)).toEqual([
            ...CALIBRATION_CALL_TYPES,
        ]);
        expect(options).toHaveLength(9);
    });

    it('согласие — единственный вариант: не согласны, значит не отправляем', () => {
        const consent = byId(CALL_REVIEW_QUESTION_ID.consentRecord);
        expect(consent?.options.map(option => option.value)).toEqual([
            CALL_REVIEW_CONSENT_OPTION,
        ]);
        expect(consent?.required).toBe(true);
    });

    it('обязательны дата, тип, ссылка на запись, описание, ожидания и согласие', () => {
        const required = questions
            .filter(question => question.required)
            .map(question => question.id);
        expect(required).toEqual([
            CALL_REVIEW_QUESTION_ID.callDate,
            CALL_REVIEW_QUESTION_ID.callType,
            CALL_REVIEW_QUESTION_ID.recordLink,
            CALL_REVIEW_QUESTION_ID.situation,
            CALL_REVIEW_QUESTION_ID.expectation,
            CALL_REVIEW_QUESTION_ID.consentRecord,
        ]);
    });

    it('ссылка на компанию или сделку остаётся необязательной', () => {
        expect(byId(CALL_REVIEW_QUESTION_ID.crmLink)?.required).toBeUndefined();
    });

    it('у свободных вопросов нет вариантов, у вопросов с выбором — есть', () => {
        questions.forEach(question => {
            const free = question.kind === 'text' || question.kind === 'link';
            expect(question.options.length > 0, question.id).toBe(!free);
        });
    });
});

describe('протокол брифа оценки звонка', () => {
    it('пустая анкета: заголовки разделов на месте, ответы подписаны по виду', () => {
        const protocol = buildProtocol(CALL_REVIEW_QUESTIONNAIRE, EMPTY);
        Object.values(CALL_REVIEW_SECTIONS).forEach(title => {
            expect(protocol, title).toContain(`== ${title} ==`);
        });
        expect(protocol).toContain('Организация: —');
        expect(protocol).toMatch(/Дата звонка: НЕ ЗАПОЛНЕНО/);
        expect(protocol).toMatch(
            /Согласие на обработку записи: НЕ ВЫБРАНО/,
        );
    });

    it('заполненная анкета: ответы, комментарий и многострочный текст с отступом', () => {
        const protocol = buildProtocol(CALL_REVIEW_QUESTIONNAIRE, FILLED);
        expect(protocol).toContain('Организация: ООО Ромашка');
        expect(protocol).toContain('Заполнил: Иванова, РОП');
        expect(protocol).toContain('romashka.bitrix24.ru');
        expect(protocol).toContain(CALIBRATION_CALL_TYPES[3]);
        expect(protocol).toContain('   Комментарий: показывали систему');
        expect(protocol).toContain(
            'Клиент второй раз просит подумать.\n   Не понимаю почему.',
        );
        expect(protocol).toContain(
            `Согласие на обработку записи: ${CALL_REVIEW_CONSENT_OPTION}`,
        );
    });

    it('подписан адресом страницы, на которой его заполняли', () => {
        expect(buildProtocol(CALL_REVIEW_QUESTIONNAIRE, FILLED)).toContain(
            '«AI для отдела продаж → Брифы»',
        );
    });
});

describe('проверка перед отправкой', () => {
    it('без организации не отправляем', () => {
        expect(
            validateSubmission(CALL_REVIEW_QUESTIONNAIRE, submit(), EMPTY),
        ).toBe('Укажите организацию в подвале анкеты');
    });

    it('первым называет первый незаполненный обязательный вопрос', () => {
        const error = validateSubmission(CALL_REVIEW_QUESTIONNAIRE, submit(), {
            ...EMPTY,
            company: 'ООО Ромашка',
        });
        expect(error).toBe(
            HOW_QUESTIONNAIRE_COPY.requiredError('Дата звонка'),
        );
    });

    it('без согласия не отправляем, даже когда всё остальное заполнено', () => {
        const answers = { ...FILLED.answers };
        delete answers[CALL_REVIEW_QUESTION_ID.consentRecord];
        expect(
            validateSubmission(CALL_REVIEW_QUESTIONNAIRE, submit(), {
                ...FILLED,
                answers,
            }),
        ).toBe(
            HOW_QUESTIONNAIRE_COPY.requiredError(
                'Согласие на обработку записи',
            ),
        );
    });

    it('пробелы в свободном ответе ответом не считаются', () => {
        expect(
            validateSubmission(CALL_REVIEW_QUESTIONNAIRE, submit(), {
                ...FILLED,
                answers: {
                    ...FILLED.answers,
                    [CALL_REVIEW_QUESTION_ID.recordLink]: { custom: '   ' },
                },
            }),
        ).toBe(
            HOW_QUESTIONNAIRE_COPY.requiredError(
                'Ссылка на запись разговора',
            ),
        );
    });

    it('полностью заполненная анкета проходит', () => {
        expect(
            validateSubmission(CALL_REVIEW_QUESTIONNAIRE, submit(), FILLED),
        ).toBe('');
    });

    it('анкета калибровки обязательных вопросов не приобрела', () => {
        const calibration = HOW_QUESTIONNAIRES.calibration;
        expect(
            calibration.questions.some(question => question.required),
        ).toBe(false);
        expect(
            validateSubmission(calibration, submit(), {
                company: 'ООО Ромашка',
                respondent: 'Иванова',
                answers: {},
            }),
        ).toBe('');
    });
});

describe('реестр анкет', () => {
    it('содержит бриф оценки звонка под своим ключом', () => {
        expect(HOW_QUESTIONNAIRES['call-review']).toBe(
            CALL_REVIEW_QUESTIONNAIRE,
        );
        expect(HOW_QUESTIONNAIRES['call-review'].id).toBe('call-review');
    });
});
