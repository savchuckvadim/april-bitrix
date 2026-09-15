/**
 * Бриф оценки звонка: «пришлите один разговор — покажем, как его разберёт
 * система».
 *
 * Анкета живёт в константах раздела AI, потому что это его содержание, а
 * исполняет её общий движок анкет `how-we-work` (типы, компоненты, протокол,
 * отправка). Регистрируется в общем реестре `HOW_QUESTIONNAIRES`.
 *
 * Факты — карта `back/ai/tasks/ai-kb-facts.md`, 3.15.4–3.15.6: поля брифа,
 * запись только ссылкой (загрузка файла в постановке не принята), защита от
 * повторной отправки и метка источника в сообщении.
 */

import { CALIBRATION_CALL_TYPES } from '../../../how-we-work/constants/calibration-brief-sections';
import type { HowQuestionnaire } from '../../../how-we-work/constants/types';
import { questionFactories } from '../../../how-we-work/constants/calibration-questionnaire/question-factories';

/** Маршрут приложения, пересылающий бриф оценки звонка нам в Telegram. */
export const CALL_REVIEW_SUBMIT_PATH = '/api/call-review';

/** Разделы брифа оценки звонка — заголовки групп вопросов. */
export const CALL_REVIEW_SECTIONS = {
    call: '1. Звонок',
    record: '2. Запись разговора',
    request: '3. Что разобрать',
    consent: '4. Согласие',
} as const;

/** Идентификаторы вопросов, на которые ссылается отправка и тесты. */
export const CALL_REVIEW_QUESTION_ID = {
    portalDomain: 'portal-domain',
    manager: 'manager',
    callDate: 'call-date',
    callType: 'call-type',
    recordLink: 'record-link',
    situation: 'situation',
    crmLink: 'crm-link',
    expectation: 'expectation',
    consentRecord: 'consent-record',
} as const;

const call = questionFactories(CALL_REVIEW_SECTIONS.call);
const record = questionFactories(CALL_REVIEW_SECTIONS.record);
const request = questionFactories(CALL_REVIEW_SECTIONS.request);
const consent = questionFactories(CALL_REVIEW_SECTIONS.consent);

/** Единственный вариант согласия: не согласны — бриф просто не отправляется. */
export const CALL_REVIEW_CONSENT_OPTION = 'даю согласие';

export const CALL_REVIEW_QUESTIONNAIRE: HowQuestionnaire = {
    id: 'call-review',
    title: 'Бриф оценки звонка',
    description:
        'Один разговор, восемь полей и согласие. Ответы сохраняются в вашем браузере и уходят к нам только по кнопке «Отправить нам». Обязательные пункты помечены.',
    protocolTitle: 'БРИФ — оценка одного звонка (April)',
    sourceSection: 'AI для отдела продаж',
    sourcePage: 'Брифы',
    submit: {
        path: CALL_REVIEW_SUBMIT_PATH,
        domainQuestionId: CALL_REVIEW_QUESTION_ID.portalDomain,
    },
    questions: [
        call.link(
            CALL_REVIEW_QUESTION_ID.portalDomain,
            'Адрес портала Битрикс24',
            {
                hint: 'Если звонок лежит в вашей CRM, по адресу портала мы поймём, о ком речь. Запись из облака без портала — оставьте поле пустым и укажите себя в подвале анкеты.',
                placeholder: 'company.bitrix24.ru',
            },
        ),
        call.text(
            CALL_REVIEW_QUESTION_ID.manager,
            'Кто говорил со стороны отдела продаж',
            {
                hint: 'Имя можно не называть. Разбору важны роль и стаж: «менеджер, третий месяц» или «старший менеджер» — достаточный ответ.',
                placeholder: 'Менеджер, третий месяц работы',
            },
        ),
        call.text(CALL_REVIEW_QUESTION_ID.callDate, 'Дата звонка', {
            hint: 'По дате мы находим запись в карточке и понимаем, что происходило вокруг разговора: какая была стадия, что обещали до него.',
            placeholder: '12.09.2026',
            required: true,
        }),
        call.choice(
            CALL_REVIEW_QUESTION_ID.callType,
            'Тип звонка по вашему мнению',
            CALIBRATION_CALL_TYPES,
            {
                hint: 'Выберите тот, к которому разговор ближе. Система ставит тип сама, и расхождение с вашим выбором — не ошибка, а разное понимание этапа: мы объясним, из чего сложился её выбор.',
                commentPlaceholder: 'Почему вы считаете так (необязательно)',
                required: true,
            },
        ),
        record.link(
            CALL_REVIEW_QUESTION_ID.recordLink,
            'Ссылка на запись разговора',
            {
                hint: 'Карточка звонка в Битрикс24 или файл в облаке — Диск Битрикс24, Яндекс.Диск, Google Drive. Проверьте, что ссылка открывается у человека без доступа к вашему порталу: иначе запись до нас не дойдёт. Загрузку файла прямо в форму мы не делаем.',
                placeholder: 'https://…',
                required: true,
            },
        ),
        request.text(
            CALL_REVIEW_QUESTION_ID.situation,
            'Что происходило и что вас смущает',
            {
                hint: 'Двух фраз достаточно: «клиент второй раз просит подумать», «менеджер сам предложил скидку», «не понимаю, почему сделка встала после показа».',
                required: true,
            },
        ),
        request.link(
            CALL_REVIEW_QUESTION_ID.crmLink,
            'Ссылка на компанию или сделку в воронке «ОП Основная»',
            {
                hint: 'Из карточки видно стадию, историю и прежние обещания — с ними разбор точнее. Поле необязательное: без ссылки разберём разговор как есть.',
                placeholder: 'https://company.bitrix24.ru/crm/deal/details/…/',
            },
        ),
        request.text(
            CALL_REVIEW_QUESTION_ID.expectation,
            'Чего вы ждёте от разбора',
            {
                hint: 'Например: «оценку по нашим критериям», «поймать все обещания клиенту», «сравнить с тем, как этот разговор оценил бы руководитель».',
                required: true,
            },
        ),
        consent.choice(
            CALL_REVIEW_QUESTION_ID.consentRecord,
            'Согласие на обработку записи',
            [CALL_REVIEW_CONSENT_OPTION],
            {
                hint: 'Мы распознаём запись и разбираем её теми же сервисами, что работают на портале, а результат показываем только вам. Без отметки бриф не отправляется, и запись мы не слушаем.',
                commentPlaceholder: 'Кто согласовал (необязательно)',
                required: true,
            },
        ),
    ],
};
