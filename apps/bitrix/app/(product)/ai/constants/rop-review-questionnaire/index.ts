/**
 * Отзыв руководителя на готовый разбор звонка: ссылка на карточку разбора в
 * Битрикс24, вердикт, что не так и как должно быть.
 *
 * Анкета живёт в константах раздела AI (страница «Что нужно от
 * руководителя»), исполняет её общий движок анкет `how-we-work`, а маршрут
 * `/api/rop-review` переводит подписи вариантов в коды по картам из этого
 * файла и передаёт отзыв в бэк `kpi-sales`: там он ложится рядом с разбором
 * и уходит нам в чат. Звонок загружать нельзя и не нужно — запись и
 * транскрипт уже лежат в карточке разбора.
 */

import { questionFactories } from '../../../how-we-work/constants/calibration-questionnaire/question-factories';
import type {
    HowQuestionnaire,
    HowQuestionnaireState,
} from '../../../how-we-work/constants/types';

/** Маршрут приложения, передающий отзыв в бэк `kpi-sales`. */
export const ROP_REVIEW_SUBMIT_PATH = '/api/rop-review';

/** Разделы анкеты — заголовки групп вопросов. */
export const ROP_REVIEW_SECTIONS = {
    analysis: '1. Разбор',
    author: '2. Кто пишет',
    review: '3. Отзыв',
} as const;

/** Идентификаторы вопросов, на которые ссылаются маршрут и тесты. */
export const ROP_REVIEW_QUESTION_ID = {
    analysisLink: 'analysis-link',
    authorName: 'author-name',
    authorRole: 'author-role',
    verdict: 'verdict',
    issues: 'issues',
    comment: 'comment',
    contact: 'contact',
} as const;

/**
 * Адрес карточки элемента смарт-процесса в Битрикс24:
 * `https://портал/crm/type/<тип>/details/<id>/`. Регистр не важен.
 */
export const ROP_REVIEW_LINK_PATTERN =
    /^https:\/\/[a-z0-9.-]+\/crm\/type\/\d+\/details\/\d+\/?$/i;

/** Роль автора отзыва: подпись варианта → код для бэка. */
export const ROP_REVIEW_AUTHOR_ROLE = {
    'руководитель отдела продаж': 'rop',
    'руководитель группы': 'group_head',
    директор: 'director',
    другое: 'other',
} as const;

/** Вердикт по разбору: подпись варианта → код для бэка. */
export const ROP_REVIEW_VERDICT = {
    'согласен с разбором': 'agree',
    'согласен частично': 'partly',
    'не согласен': 'disagree',
} as const;

/** Что в разборе не так: подпись чекбокса → код для бэка. */
export const ROP_REVIEW_ISSUE = {
    'тип звонка определён неверно': 'call_type',
    'оценка завышена или занижена': 'score',
    'факты, хвост или 5К не совпадают': 'facts',
    'рекомендации не по делу': 'recommendations',
    'связь со сделкой/лидом неверная': 'links',
    'транскрипт с ошибками': 'transcript',
    другое: 'other',
} as const;

export type RopReviewAuthorRole =
    (typeof ROP_REVIEW_AUTHOR_ROLE)[keyof typeof ROP_REVIEW_AUTHOR_ROLE];
export type RopReviewVerdict =
    (typeof ROP_REVIEW_VERDICT)[keyof typeof ROP_REVIEW_VERDICT];
export type RopReviewIssue =
    (typeof ROP_REVIEW_ISSUE)[keyof typeof ROP_REVIEW_ISSUE];

/** Подписи вариантов карты в порядке объявления — из них строятся вопросы. */
const labels = <T extends Record<string, string>>(
    map: T,
): (keyof T & string)[] => Object.keys(map) as (keyof T & string)[];

/**
 * Вердикты, при которых комментарий обязателен: несогласие без «что именно»
 * разобрать нельзя.
 */
export const ROP_REVIEW_VERDICTS_NEEDING_COMMENT: readonly string[] = [
    'согласен частично',
    'не согласен',
];

/** Потолки длины свободных полей — как у DTO бэка. */
export const ROP_REVIEW_LIMITS = {
    authorName: 200,
    comment: 2000,
    contact: 200,
} as const;

/** Ошибки своей проверки анкеты; те же тексты отдаёт маршрут на кривое тело. */
export const ROP_REVIEW_ERROR = {
    link: 'Ссылка должна вести на карточку разбора: https://ваш-портал.bitrix24.ru/crm/type/123/details/456/',
    commentRequired:
        'При «согласен частично» и «не согласен» напишите, что именно не так и как должно быть',
    commentTooLong: `Комментарий длиннее ${ROP_REVIEW_LIMITS.comment} символов — сократите`,
} as const;

const trimmedCustom = (state: HowQuestionnaireState, id: string): string =>
    state.answers[id]?.custom?.trim() ?? '';

/**
 * Своя проверка анкеты сверх общих правил движка: ссылка по шаблону
 * карточки разбора, комментарий обязателен при несогласии и не длиннее
 * потолка. Пустая строка — можно слать.
 */
export const validateRopReview = (state: HowQuestionnaireState): string => {
    const link = trimmedCustom(state, ROP_REVIEW_QUESTION_ID.analysisLink);
    if (!ROP_REVIEW_LINK_PATTERN.test(link)) return ROP_REVIEW_ERROR.link;
    const verdict = state.answers[ROP_REVIEW_QUESTION_ID.verdict]?.choice ?? '';
    const comment = trimmedCustom(state, ROP_REVIEW_QUESTION_ID.comment);
    if (ROP_REVIEW_VERDICTS_NEEDING_COMMENT.includes(verdict) && !comment) {
        return ROP_REVIEW_ERROR.commentRequired;
    }
    if (comment.length > ROP_REVIEW_LIMITS.comment) {
        return ROP_REVIEW_ERROR.commentTooLong;
    }
    return '';
};

const analysis = questionFactories(ROP_REVIEW_SECTIONS.analysis);
const author = questionFactories(ROP_REVIEW_SECTIONS.author);
const review = questionFactories(ROP_REVIEW_SECTIONS.review);

export const ROP_REVIEW_QUESTIONNAIRE: HowQuestionnaire = {
    id: 'rop-review',
    title: 'Отзыв на разбор звонка',
    description:
        'Ссылка на карточку разбора, вердикт, что не так и как должно быть. Ответы сохраняются в вашем браузере и уходят к нам только по кнопке «Отправить нам». Обязательные пункты помечены.',
    protocolTitle: 'ОТЗЫВ — разбор звонка руководителем (April)',
    sourceSection: 'AI для отдела продаж',
    sourcePage: 'Что нужно от руководителя',
    submit: {
        path: ROP_REVIEW_SUBMIT_PATH,
        domainQuestionId: ROP_REVIEW_QUESTION_ID.analysisLink,
        sentMessage: 'Отзыв отправлен — ответим по указанному контакту.',
    },
    validate: validateRopReview,
    questions: [
        analysis.link(
            ROP_REVIEW_QUESTION_ID.analysisLink,
            'Ссылка на карточку разбора звонка',
            {
                hint: 'Откройте разбор в Битрикс24 (смарт-процесс «AI-анализ звонков» или вкладка в карточке сделки/лида) и скопируйте адрес вида https://ваш-портал.bitrix24.ru/crm/type/123/details/456/',
                placeholder:
                    'https://ваш-портал.bitrix24.ru/crm/type/123/details/456/',
                required: true,
            },
        ),
        author.text(ROP_REVIEW_QUESTION_ID.authorName, 'Как к вам обращаться', {
            placeholder: 'Имя',
            required: true,
            maxLength: ROP_REVIEW_LIMITS.authorName,
        }),
        author.choice(
            ROP_REVIEW_QUESTION_ID.authorRole,
            'Ваша роль',
            labels(ROP_REVIEW_AUTHOR_ROLE),
            {
                commentPlaceholder: 'Если «другое» — какая (необязательно)',
                required: true,
            },
        ),
        review.choice(
            ROP_REVIEW_QUESTION_ID.verdict,
            'Ваш вердикт',
            labels(ROP_REVIEW_VERDICT),
            {
                hint: 'При «согласен частично» и «не согласен» нужен комментарий ниже: что именно и как должно быть.',
                required: true,
            },
        ),
        review.multi(
            ROP_REVIEW_QUESTION_ID.issues,
            'Что в разборе не так',
            labels(ROP_REVIEW_ISSUE),
            {
                hint: 'Отметьте всё, что подходит. Если с разбором согласны — пропустите.',
            },
        ),
        review.text(
            ROP_REVIEW_QUESTION_ID.comment,
            'Что именно и как должно быть',
            {
                hint: 'Обязательно при «согласен частично» и «не согласен». Двух-трёх фраз достаточно: «это не презентация, а повторный созвон — показа не было, менеджер уточнял состав заказа».',
                maxLength: ROP_REVIEW_LIMITS.comment,
            },
        ),
        review.text(
            ROP_REVIEW_QUESTION_ID.contact,
            'Как с вами связаться, если нужно уточнить',
            {
                hint: 'Телефон, почта или мессенджер. Необязательно.',
                placeholder: 'Телефон, почта, Telegram',
                maxLength: ROP_REVIEW_LIMITS.contact,
            },
        ),
    ],
};
