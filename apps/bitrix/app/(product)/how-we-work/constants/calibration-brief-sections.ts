/**
 * Структура брифа калибровки, общая для трёх его форм: печатного документа
 * (`calibration/brief/constants/brief-document.ts`), онлайн-анкеты
 * (`constants/calibration-questionnaire/`) и файла в `public/`.
 *
 * Заголовки разделов — единственный источник: анкета группирует вопросы по
 * ним, тест сверяет, что ни один раздел брифа не остался без вопросов.
 */
export const CALIBRATION_BRIEF_SECTIONS = {
    participants: '1. Кто участвует',
    process: '2. Процесс продаж',
    callTypes: '3. Типы звонков',
    definitions: '4. Определения',
    criteria: '5. Критерии оценки',
    checklists: '6. Чек-листы',
    materials: '7. Материалы',
    referenceCalls: '8. Эталонные звонки',
    exclusions: '9. Что не оцениваем',
    schedule: '10. Календарь работ',
    consents: '11. Согласия',
    notes: '12. Свободные примечания',
} as const;

export type CalibrationBriefSectionTitle =
    (typeof CALIBRATION_BRIEF_SECTIONS)[keyof typeof CALIBRATION_BRIEF_SECTIONS];

/** Наши типы звонков — по каждому клиент отвечает, как он называется у него. */
export const CALIBRATION_CALL_TYPES = [
    'Холодный выход на лицо, принимающее решение',
    'Звонок по заявке с сайта',
    'Обычный звонок (договориться о показе)',
    'Презентация / показ системы',
    'Доработка возражений',
    'Разговор по решению (условия, сроки)',
    'Разговор по оплате (счёт, договор)',
    'Другое (сопровождение, обучение, оргвопросы)',
    'Не по работе (личное, ошибочный набор)',
] as const;

export type CalibrationCallType = (typeof CALIBRATION_CALL_TYPES)[number];
