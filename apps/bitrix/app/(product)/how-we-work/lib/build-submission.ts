import type { CalibrationBriefSubmission } from '@/app/api/calibration/lib/calibration-submission';
import {
    HowQuestionnaire,
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
    return '';
};

/**
 * Тело запроса на отправку протокола нам. `website` — honeypot: человек его
 * не видит, поэтому у него всегда пусто.
 */
export const buildSubmission = (
    questionnaire: HowQuestionnaire,
    submit: HowQuestionnaireSubmit,
    state: HowQuestionnaireState,
    website: string,
): CalibrationBriefSubmission => ({
    company: state.company.trim(),
    respondent: state.respondent.trim(),
    domain: readSubmissionDomain(submit, state),
    protocol: buildProtocol(questionnaire, state),
    website,
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
