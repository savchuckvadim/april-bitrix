import { CALIBRATION_BRIEF_SECTIONS } from '../calibration-brief-sections';
import { HowQuestionnaireQuestion } from '../types';
import { questionFactories } from './question-factories';

const criteria = questionFactories(CALIBRATION_BRIEF_SECTIONS.criteria);

/** Раздел 5: критерии оценки и красные линии. */
export const CRITERIA_QUESTIONS: HowQuestionnaireQuestion[] = [
    criteria.text('must-say', 'Что обязано прозвучать в любом звонке', {
        hint: 'Представление, легализация звонка, фиксация договорённости — своими словами.',
    }),
    criteria.text('red-lines', 'Красные линии и потолки', {
        hint: 'Строка на правило: «если в разговоре… → раздел… → не выше… → сигнал руководителю да/нет». Примеры: нет даты следующего контакта → закрытие не выше 5; цена без комплекта и числа пользователей → цена не выше 4; сам предложил скидку → не выше 3 и сигнал руководителю.',
    }),
    criteria.text('stop-words', 'Стоп-слова и запрещённые обещания', {
        placeholder:
            '«гарантирую», «сделаю скидку, я договорюсь», «директор точно согласует»…',
    }),
    criteria.text(
        'top-score',
        'Что обязано прозвучать дословно, чтобы раздел получил 9–10',
    ),
    criteria.text(
        'skip-sections',
        'Какие разделы в каком типе звонка не оцениваем вообще',
        { placeholder: 'Например: презентацию в холодном звонке не считаем' },
    ),
];

const checklists = questionFactories(CALIBRATION_BRIEF_SECTIONS.checklists);

const CHECKLIST_OPTIONS = ['есть', 'нет', 'называется иначе'] as const;
const CHECKLIST_COMMENT =
    'Где лежит; совпадает ли с анкетой менеджера в CRM; как называется у вас';

/** Раздел 6: чек-листы отдела. */
export const CHECKLISTS_QUESTIONS: HowQuestionnaireQuestion[] = [
    checklists.choice(
        'checklist-tail',
        'Чек-лист «хвост» после презентации: КП предложено, наполнение и цена озвучены, дата решения назначена и согласована',
        CHECKLIST_OPTIONS,
        { commentPlaceholder: CHECKLIST_COMMENT },
    ),
    checklists.choice(
        'checklist-5k',
        'Чек-лист «5К»: клиент, компания, коллеги, конкурент, критерии выбора',
        CHECKLIST_OPTIONS,
        { commentPlaceholder: CHECKLIST_COMMENT },
    ),
    checklists.text(
        'own-checklist',
        'Свой лист оценки звонка или аттестации',
        {
            hint: 'Если чек-лист есть только в голове — перечислите 5–9 пунктов: каждый как вопрос плюс признак «как понять, что пункт закрыт».',
        },
    ),
    checklists.text(
        'objection-handled',
        'Что для вас значит «возражение отработано»',
        {
            hint: 'Не «клиент согласился». Пример: «назвал возражение вслух, вернул ценность и договорился о следующем шаге».',
        },
    ),
];

const materials = questionFactories(CALIBRATION_BRIEF_SECTIONS.materials);

/** Раздел 7: материалы отдела. */
export const MATERIALS_QUESTIONS: HowQuestionnaireQuestion[] = [
    materials.link('materials-folder', 'Ссылка на папку с материалами', {
        hint: 'Скрипты холодного звонка и звонка под презентацию, сценарий показа и «хвоста», книга возражений, регламент CRM, комплекты и цены, чек-листы, лист оценки, категории отказов, список типов звонков. Как есть — Word, PDF, Excel, фото распечатки; важна дата версии.',
        placeholder: 'https://…',
    }),
    materials.text(
        'materials-status',
        'Что из материалов актуально, что устарело, чего нет',
        { placeholder: 'Документ — актуально / устарело / такого нет — дата версии' },
    ),
    materials.text('glossary', 'Глоссарий отдела', {
        hint: '10–20 строк «как говорим — что имеем в виду»: продукты, пакеты, акции, внутренние события.',
    }),
];
