import { CALIBRATION_BRIEF_SECTIONS } from '../calibration-brief-sections';
import { HowQuestionnaireQuestion } from '../types';
import { questionFactories } from './question-factories';

const references = questionFactories(
    CALIBRATION_BRIEF_SECTIONS.referenceCalls,
);

const REFERENCE_VERDICTS = [
    'как надо',
    'как не надо — система завысила',
    'как не надо — заведомо провальный',
] as const;

/** Пара вопросов по одному эталонному звонку: ссылка + оценка с комментарием. */
const referenceCall = (index: number): HowQuestionnaireQuestion[] => [
    references.link(
        `reference-${index}-link`,
        `Эталон ${index}: ссылка на звонок, дело в Битриксе или расшифровку`,
        {
            hint: 'Ссылки нет — напишите дату, менеджера и клиента: найдём звонок в портале сами.',
            placeholder: 'https://company.bitrix24.ru/… или «12.08, Иванова, ООО Ромашка»',
        },
    ),
    references.choice(
        `reference-${index}-verdict`,
        `Эталон ${index}: это пример «как надо» или «как не надо»?`,
        REFERENCE_VERDICTS,
        {
            commentPlaceholder:
                'Тип звонка; почему и какая фраза была бы правильной',
        },
    ),
];

/** Раздел 8: два эталонных звонка. */
export const REFERENCE_CALLS_QUESTIONS: HowQuestionnaireQuestion[] = [
    ...referenceCall(1),
    ...referenceCall(2),
];

const exclusions = questionFactories(CALIBRATION_BRIEF_SECTIONS.exclusions);

/** Раздел 9: кого и что не оцениваем. */
export const EXCLUSIONS_QUESTIONS: HowQuestionnaireQuestion[] = [
    exclusions.text(
        'exclude-departments',
        'Сотрудники и направления вне продаж (сервис, поддержка, бухгалтерия)',
    ),
    exclusions.text(
        'mixed-roles',
        'Кто ведёт и продажи, и сопровождение',
        { hint: 'Их звонки делим по типу, а не исключаем целиком.' },
    ),
    exclusions.choice(
        'exclude-other',
        'Ещё не оцениваем',
        ['внутренние разговоры', 'личные звонки'],
        { allowCustom: true },
    ),
];

const schedule = questionFactories(CALIBRATION_BRIEF_SECTIONS.schedule);

/** Раздел 10: кто участвует и когда. */
export const SCHEDULE_QUESTIONS: HowQuestionnaireQuestion[] = [
    schedule.text('schedule', 'Удобные даты шагов настройки', {
        hint: 'Настройка доступа, записи и привязки звонков — администратор, 30–60 мин. Созвон на планёрке при менеджерах — руководитель + менеджеры, 45 мин. Два эталонных разбора — руководитель, 40 мин. Разметка типов на 30 звонках — руководитель или заместитель, 1–1,5 ч.',
    }),
    schedule.choice(
        'weekly-day',
        'День еженедельных отметок руководителя (15 минут)',
        ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'],
    ),
];
