import { HowQuestionnaire } from '../types';
import { CALIBRATION_SUBMIT_PATH } from '../calibration-contacts';
import {
    CALIBRATION_QUESTION_ID,
    PARTICIPANTS_QUESTIONS,
    PROCESS_QUESTIONS,
} from './participants-process';
import {
    CALL_TYPES_QUESTIONS,
    DEFINITIONS_QUESTIONS,
} from './call-types-definitions';
import {
    CHECKLISTS_QUESTIONS,
    CRITERIA_QUESTIONS,
    MATERIALS_QUESTIONS,
} from './criteria-checklists-materials';
import {
    EXCLUSIONS_QUESTIONS,
    REFERENCE_CALLS_QUESTIONS,
    SCHEDULE_QUESTIONS,
} from './references-exclusions-schedule';
import { CONSENTS_QUESTIONS, NOTES_QUESTIONS } from './consents-notes';

export { CALIBRATION_QUESTION_ID } from './participants-process';
export { CALL_TYPE_QUESTION_PREFIX } from './call-types-definitions';

/**
 * Онлайн-бриф калибровки AI-аналитики звонков: те же двенадцать разделов,
 * что в печатном брифе, но с отправкой протокола нам прямо со страницы.
 *
 * Анкета показывается в разделе «AI для отдела продаж» на `/ai/briefs` —
 * оттуда и подпись протокола: по ней видно, где бриф заполняли.
 */
export const CALIBRATION_QUESTIONNAIRE: HowQuestionnaire = {
    id: 'calibration',
    title: 'Бриф калибровки онлайн',
    description:
        'Двенадцать разделов печатного брифа в виде анкеты. Отвечайте коротко и своими словами; пустое поле и «такого нет» — тоже ответ. Ответы сохраняются в вашем браузере, отправляются только по кнопке «Отправить нам».',
    protocolTitle: 'БРИФ — калибровка AI-аналитики звонков (April)',
    sourceSection: 'AI для отдела продаж',
    sourcePage: 'Брифы',
    submit: {
        path: CALIBRATION_SUBMIT_PATH,
        domainQuestionId: CALIBRATION_QUESTION_ID.portalDomain,
    },
    questions: [
        ...PARTICIPANTS_QUESTIONS,
        ...PROCESS_QUESTIONS,
        ...CALL_TYPES_QUESTIONS,
        ...DEFINITIONS_QUESTIONS,
        ...CRITERIA_QUESTIONS,
        ...CHECKLISTS_QUESTIONS,
        ...MATERIALS_QUESTIONS,
        ...REFERENCE_CALLS_QUESTIONS,
        ...EXCLUSIONS_QUESTIONS,
        ...SCHEDULE_QUESTIONS,
        ...CONSENTS_QUESTIONS,
        ...NOTES_QUESTIONS,
    ],
};
