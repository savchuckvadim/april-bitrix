import { CALIBRATION_BRIEF_SECTIONS } from '../calibration-brief-sections';
import { HowQuestionnaireQuestion } from '../types';
import { questionFactories } from './question-factories';

const consents = questionFactories(CALIBRATION_BRIEF_SECTIONS.consents);

/** Раздел 11: согласия и рамка. */
export const CONSENTS_QUESTIONS: HowQuestionnaireQuestion[] = [
    consents.choice(
        'consent-frame',
        'Подтверждаем рамку',
        ['подтверждаем', 'обсудим'],
        {
            hint: 'Агрегаты по отделу первым видит руководитель отдела; первые три месяца оценки не влияют на премии и аттестацию; наверх уходит динамика поведения, а не средний балл; менеджер видит только себя.',
        },
    ),
    consents.choice(
        'consent-access',
        'Разрешаем читать записи и данные CRM по ключу портала и писать результат разбора обратно в карточку звонка',
        ['разрешаем', 'обсудим'],
        { hint: 'Ключ отзывается вами в любой момент.' },
    ),
    consents.choice(
        'consent-pooling',
        'Обезличенное объединение сводной статистики с другими компаниями-партнёрами',
        ['да', 'нет', 'решим позже'],
        {
            hint: 'Только числа — без записей, расшифровок, имён сотрудников и названий клиентов. По умолчанию выключено.',
            commentPlaceholder: 'Кто согласовал и дата',
        },
    ),
    consents.text(
        'no-transfer',
        'Что передавать нельзя (направления, сотрудники, категории клиентов)',
    ),
];

const notes = questionFactories(CALIBRATION_BRIEF_SECTIONS.notes);

/** Раздел 12: свободные примечания. */
export const NOTES_QUESTIONS: HowQuestionnaireQuestion[] = [
    notes.text('notes', 'Примечания и вопросы к нам', {
        hint: 'Сезонность, недавняя смена скрипта или прайса, новички, ваши опасения.',
    }),
];
