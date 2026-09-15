import {
    CALIBRATION_BRIEF_SECTIONS,
    CALIBRATION_CALL_TYPES,
} from '../calibration-brief-sections';
import { HowQuestionnaireQuestion } from '../types';
import { questionFactories } from './question-factories';

const callTypes = questionFactories(CALIBRATION_BRIEF_SECTIONS.callTypes);

/** Префикс идентификатора вопроса по одному нашему типу звонка. */
export const CALL_TYPE_QUESTION_PREFIX = 'call-type-';

/** Раздел 3: по каждому нашему типу — есть ли у клиента и фиксируется ли в CRM. */
export const CALL_TYPES_QUESTIONS: HowQuestionnaireQuestion[] = [
    ...CALIBRATION_CALL_TYPES.map((callType, index) =>
        callTypes.choice(
            `${CALL_TYPE_QUESTION_PREFIX}${index + 1}`,
            `Тип «${callType}»: фиксируете в CRM?`,
            ['да', 'нет', 'такого типа у нас нет'],
            { commentPlaceholder: 'Как называется у вас, примечания' },
        ),
    ),
    callTypes.text('own-call-type', 'Свой тип звонка, которого нет в списке', {
        placeholder: 'Название, когда случается, фиксируете ли в CRM',
    }),
    callTypes.text('refine-vs-decision', 'Граница «доработка / решение»', {
        hint: 'Наше правило: клиент внутренне согласился и обсуждает условия — «решение»; согласия нет и менеджер возвращает интерес — «доработка». Напишите своё правило, если оно другое.',
    }),
];

const definitions = questionFactories(CALIBRATION_BRIEF_SECTIONS.definitions);

/** Раздел 4: определения, которые прямо влияют на цифры в отчёте. */
export const DEFINITIONS_QUESTIONS: HowQuestionnaireQuestion[] = [
    definitions.choice(
        'effective-call',
        'Результативный звонок',
        [
            'отметка менеджера в CRM',
            'положительный результат в карточке',
            'длительность от N секунд',
            'названа дата следующего контакта',
        ],
        {
            allowCustom: true,
            hint: 'Лучше «обсудим», чем угадать: этот ответ меняет цифры в отчёте.',
            commentPlaceholder:
                'Если признаков несколько — перечислите; для длительности укажите N',
        },
    ),
    definitions.choice('unique-presentation', 'Уникальная презентация', [
        'любая',
        'уникальная по клиенту',
        'только подтверждённые',
    ]),
    definitions.choice(
        'hot-client',
        'Горячий клиент',
        [
            'событие «Решение»',
            'стадия «Презентация»',
            'стадия «Документы отправлены»',
        ],
        {
            allowCustom: true,
            commentPlaceholder:
                'Если для планёрки и для денег в воронке ответы разные — напишите оба',
        },
    ),
    definitions.text(
        'min-duration',
        'Минимальная длительность засчитанного звонка, секунд',
        {
            hint: 'По типам: холодный, обычный, презентация, доработка, решение, оплата.',
            placeholder: 'холодный 20, обычный 30, презентация 300…',
        },
    ),
    definitions.choice(
        'short-calls-threshold',
        'Порог разбора коротких звонков (это другое решение)',
        [
            'от 5 минут',
            'пилот от 1 минуты на две недели, потом пересмотр по факту',
        ],
    ),
];
