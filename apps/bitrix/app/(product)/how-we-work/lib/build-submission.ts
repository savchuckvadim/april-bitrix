import type {
    QuestionnaireSubmission,
    SubmissionAnswer,
} from '@/app/api/calibration/lib/calibration-submission';
import {
    HowAnswer,
    HowQuestionnaire,
    HowQuestionnaireQuestion,
    HowQuestionnaireState,
    HowQuestionnaireSubmit,
} from '../constants/types';
import { HOW_QUESTIONNAIRE_COPY } from '../constants/questionnaire-copy';
import { buildProtocol } from './build-protocol';
import { isAnswered } from './is-answered.util';

/** Домен портала — из ответа на вопрос, указанный в `submit.domainQuestionId`. */
export const readSubmissionDomain = (
    submit: HowQuestionnaireSubmit,
    state: HowQuestionnaireState,
): string => state.answers[submit.domainQuestionId]?.custom?.trim() ?? '';

/**
 * Что мешает отправить: пустая строка — можно слать. Организация нужна для
 * темы сообщения, портал или имя — чтобы было с кем связаться, обязательные
 * вопросы (согласие, дата, ссылка на запись) — чтобы бриф вообще был о чём.
 * Последней идёт своя проверка анкеты (`questionnaire.validate`), если она
 * есть: шаблон ссылки, условно обязательные вопросы.
 *
 * Порядок проверок = порядок чтения анкеты: сначала подвал, потом первый
 * незаполненный обязательный вопрос сверху вниз.
 */
export const validateSubmission = (
    questionnaire: HowQuestionnaire,
    submit: HowQuestionnaireSubmit,
    state: HowQuestionnaireState,
): string => {
    if (!state.company.trim()) return 'Укажите организацию в подвале анкеты';
    const missing = questionnaire.questions.find(
        question =>
            question.required && !isAnswered(state.answers[question.id]),
    );
    if (missing) return HOW_QUESTIONNAIRE_COPY.requiredError(missing.title);
    if (!readSubmissionDomain(submit, state) && !state.respondent.trim()) {
        return 'Укажите адрес портала или кто заполнил — иначе нам не с кем связаться';
    }
    return questionnaire.validate?.(state) ?? '';
};

/** Значение ответа для структурной отправки: список у `multi`, строка у прочих. */
const answerValue = (
    question: HowQuestionnaireQuestion,
    answer: HowAnswer,
): string | string[] =>
    question.kind === 'multi'
        ? (answer.values ?? [])
        : answer.custom?.trim() || answer.choice || '';

/**
 * Структурные ответы по всем вопросам анкеты в её порядке: по ним маршрут
 * собирает JSON для бэка, не разбирая текст протокола. Неотвеченный вопрос
 * тоже на месте — с пустой строкой или пустым списком.
 */
export const buildSubmissionAnswers = (
    questionnaire: HowQuestionnaire,
    state: HowQuestionnaireState,
): SubmissionAnswer[] =>
    questionnaire.questions.map(question => ({
        id: question.id,
        value: answerValue(question, state.answers[question.id] ?? {}),
    }));

/**
 * Тело запроса на отправку протокола нам. `website` — honeypot: человек его
 * не видит, поэтому у него всегда пусто.
 */
export const buildSubmission = (
    questionnaire: HowQuestionnaire,
    submit: HowQuestionnaireSubmit,
    state: HowQuestionnaireState,
    website: string,
): QuestionnaireSubmission => ({
    company: state.company.trim(),
    respondent: state.respondent.trim(),
    domain: readSubmissionDomain(submit, state),
    protocol: buildProtocol(questionnaire, state),
    website,
    answers: buildSubmissionAnswers(questionnaire, state),
});

/**
 * Отпечаток заполнения без даты: по нему клиент понимает, что с момента
 * отправки ничего не изменилось и слать тот же бриф второй раз незачем.
 */
export const fingerprintState = (state: HowQuestionnaireState): string => {
    const text = JSON.stringify(state);
    let hash = 5381;
    for (let index = 0; index < text.length; index += 1) {
        hash = ((hash << 5) + hash + text.charCodeAt(index)) | 0;
    }
    return `${text.length}:${hash}`;
};
