/**
 * Вид вопроса `multi` в движке анкет и структурная отправка `answers`.
 *
 * Проверяем на синтетической анкете, а не на живой: движок обязан вести
 * себя одинаково для любой анкеты, и тест не должен ломаться от правки
 * текста вопросов. Плюс регрессия: маршруты брифов поле `answers` не
 * читают — их парсер обязан работать с новым телом как со старым.
 */

import { describe, expect, it } from 'vitest';
import { parseSubmission } from '@/app/api/calibration/lib/calibration-submission';
import { questionFactories } from '../constants/calibration-questionnaire/question-factories';
import { HOW_QUESTIONNAIRE_COPY } from '../constants/questionnaire-copy';
import type {
    HowQuestionnaire,
    HowQuestionnaireState,
    HowQuestionnaireSubmit,
} from '../constants/types';
import { buildProtocol } from './build-protocol';
import {
    buildSubmission,
    buildSubmissionAnswers,
    validateSubmission,
} from './build-submission';
import { isAnswered } from './is-answered.util';

const make = questionFactories('Раздел');

const ISSUES = ['тип', 'оценка', 'факты'] as const;

/** Синтетическая анкета: по одному вопросу каждого вида. */
const QUESTIONNAIRE: HowQuestionnaire = {
    id: 'process',
    title: 'Тестовая анкета',
    description: '',
    protocolTitle: 'ТЕСТ',
    questions: [
        make.link('site', 'Адрес портала'),
        make.choice('mode', 'Режим', ['A', 'B'], { required: true }),
        make.multi('issues', 'Что не так', ISSUES, {
            hint: 'подсказка',
            required: true,
        }),
        make.text('note', 'Комментарий', { maxLength: 10 }),
    ],
    validate: state =>
        state.answers.note?.custom === 'стоп' ? 'своя ошибка анкеты' : '',
};

const SUBMIT: HowQuestionnaireSubmit = {
    path: '/api/test',
    domainQuestionId: 'site',
};

const state = (
    answers: HowQuestionnaireState['answers'],
): HowQuestionnaireState => ({
    company: 'ООО Ромашка',
    respondent: 'Иванова',
    answers,
});

describe('фабрика multi', () => {
    it('строит вопрос вида multi с вариантами, разделом и дополнениями', () => {
        const question = QUESTIONNAIRE.questions[2];
        expect(question?.kind).toBe('multi');
        expect(question?.group).toBe('Раздел');
        expect(question?.options.map(option => option.value)).toEqual([
            ...ISSUES,
        ]);
        expect(question?.hint).toBe('подсказка');
        expect(question?.required).toBe(true);
        expect(question?.allowCustom).toBeUndefined();
    });

    it('текстовый вопрос несёт потолок длины', () => {
        expect(QUESTIONNAIRE.questions[3]?.maxLength).toBe(10);
    });
});

describe('отвечен ли multi', () => {
    it('отмеченный чекбокс — ответ, пустой список — нет', () => {
        expect(isAnswered({ values: ['тип'] })).toBe(true);
        expect(isAnswered({ values: [] })).toBe(false);
        expect(isAnswered({})).toBe(false);
    });
});

describe('multi в протоколе', () => {
    it('отмеченные варианты идут через запятую в порядке отметки', () => {
        const protocol = buildProtocol(
            QUESTIONNAIRE,
            state({ issues: { values: ['факты', 'тип'] } }),
        );
        expect(protocol).toContain('3. Что не так: факты, тип');
    });

    it('без отметок подписан как НЕ ВЫБРАНО', () => {
        const protocol = buildProtocol(QUESTIONNAIRE, state({}));
        expect(protocol).toContain('3. Что не так: НЕ ВЫБРАНО');
    });
});

describe('обязательный multi и своя проверка анкеты', () => {
    it('обязательный multi без отметок не пускает отправку', () => {
        expect(
            validateSubmission(
                QUESTIONNAIRE,
                SUBMIT,
                state({ mode: { choice: 'A' }, issues: { values: [] } }),
            ),
        ).toBe(HOW_QUESTIONNAIRE_COPY.requiredError('Что не так'));
    });

    it('своя проверка анкеты идёт после общих и возвращает свой текст', () => {
        const filled = state({
            mode: { choice: 'A' },
            issues: { values: ['тип'] },
            note: { custom: 'стоп' },
        });
        expect(validateSubmission(QUESTIONNAIRE, SUBMIT, filled)).toBe(
            'своя ошибка анкеты',
        );
        expect(
            validateSubmission(QUESTIONNAIRE, SUBMIT, {
                ...filled,
                answers: { ...filled.answers, note: { custom: 'ок' } },
            }),
        ).toBe('');
    });
});

describe('структурные ответы в теле отправки', () => {
    const filled = state({
        site: { custom: ' romashka.bitrix24.ru ' },
        mode: { choice: 'B', comment: 'пояснение' },
        issues: { values: ['оценка', 'факты'] },
    });

    it('список у multi, строка у прочих, неотвеченный — пустое значение', () => {
        expect(buildSubmissionAnswers(QUESTIONNAIRE, filled)).toEqual([
            { id: 'site', value: 'romashka.bitrix24.ru' },
            { id: 'mode', value: 'B' },
            { id: 'issues', value: ['оценка', 'факты'] },
            { id: 'note', value: '' },
        ]);
        expect(
            buildSubmissionAnswers(QUESTIONNAIRE, state({})).map(
                answer => answer.value,
            ),
        ).toEqual(['', '', [], '']);
    });

    it('тело отправки — прежние поля плюс answers', () => {
        const body = buildSubmission(QUESTIONNAIRE, SUBMIT, filled, '');
        expect(body.company).toBe('ООО Ромашка');
        expect(body.respondent).toBe('Иванова');
        expect(body.domain).toBe('romashka.bitrix24.ru');
        expect(body.website).toBe('');
        expect(body.protocol).toContain('3. Что не так: оценка, факты');
        expect(body.answers).toHaveLength(4);
    });

    it('парсер маршрутов брифов новое поле не замечает', () => {
        const body = buildSubmission(QUESTIONNAIRE, SUBMIT, filled, '');
        const parsed = parseSubmission(body);
        expect(parsed).toEqual({
            company: 'ООО Ромашка',
            respondent: 'Иванова',
            domain: 'romashka.bitrix24.ru',
            protocol: body.protocol,
            website: '',
        });
        expect(parsed && 'answers' in parsed).toBe(false);
    });
});
