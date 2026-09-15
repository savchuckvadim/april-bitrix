import { CALIBRATION_BRIEF_SECTIONS } from '../calibration-brief-sections';
import { HowQuestionnaireQuestion } from '../types';
import { questionFactories } from './question-factories';

/** Идентификаторы вопросов, на которые ссылается отправка протокола. */
export const CALIBRATION_QUESTION_ID = {
    portalDomain: 'portal-domain',
    contact: 'contact',
} as const;

const participants = questionFactories(
    CALIBRATION_BRIEF_SECTIONS.participants,
);

/** Раздел 1: реквизиты и участники. */
export const PARTICIPANTS_QUESTIONS: HowQuestionnaireQuestion[] = [
    participants.link(
        CALIBRATION_QUESTION_ID.portalDomain,
        'Адрес портала Битрикс24',
        { placeholder: 'company.bitrix24.ru' },
    ),
    participants.text(
        CALIBRATION_QUESTION_ID.contact,
        'Контактное лицо и роль',
        {
            hint: 'ФИО, должность, телефон или почта. Если это вы — так и напишите.',
            placeholder: 'Иванова Ирина, руководитель отдела продаж, +7…',
        },
    ),
    participants.text('participants', 'Кто участвует', {
        hint: 'Руководитель отдела продаж — определения, эталоны, еженедельные отметки. Администратор Битрикс24 — ключ, запись разговоров, привязка звонков. Помощник — папка материалов. Коммерческий директор / владелец — рамка, согласия. По каждому: ФИО и как связаться.',
    }),
    participants.text(
        'managers-count',
        'Менеджеров в отделе, из них новичков (меньше 6 месяцев)',
        { placeholder: 'Например: 8, из них 2 новичка' },
    ),
];

const process = questionFactories(CALIBRATION_BRIEF_SECTIONS.process);

/** Раздел 2: процесс продаж. */
export const PROCESS_QUESTIONS: HowQuestionnaireQuestion[] = [
    process.text(
        'stages',
        'Этапы продаж: как называете у вас → стадия в CRM → какой разговор там типичен',
        {
            hint: 'Одна строка на этап, как их называют на планёрке. Третья часть важнее первых двух — из неё система понимает, какой звонок ожидать. Пример: «Показ» → «Презентация» → показ системы по задачам клиента.',
        },
    ),
    process.text('funnels', 'Сколько у вас воронок и какие'),
    process.text(
        'junk-stages',
        'Служебные или «мусорные» стадии, куда сделка попадает не по смыслу',
    ),
    process.choice(
        'lead-distribution',
        'Как распределяются заявки',
        ['по очереди автоматически', 'вручную руководителем'],
        { allowCustom: true },
    ),
    process.choice(
        'lead-kind-field',
        'Заполняется ли поле «вид лида» (заявка с сайта / холодный)?',
        ['да', 'нет', 'не всегда'],
    ),
    process.text(
        'stage-deadlines',
        'Регламентные сроки этапов: сколько дней сделка может стоять в каждом',
    ),
];
