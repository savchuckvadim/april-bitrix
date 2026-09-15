/**
 * ЕДИНСТВЕННОЕ место с контактами-плейсхолдерами калибровки.
 *
 * Владелец заменяет значения здесь — они подставляются и в главы «Калибровка»
 * и «Брифы» раздела `/ai`, и в печатный бриф
 * `/how-we-work/calibration/brief`. Файл брифа для скачивания
 * (`public/brief-ai-analytics-calibration.md`) правится отдельно.
 */
export const CALIBRATION_CONTACTS = {
    /** Имя менеджера внедрения */
    managerName: '[имя менеджера внедрения]',
    /** Почта менеджера внедрения */
    managerEmail: '[почта менеджера внедрения]',
    /** Телефон или мессенджер менеджера внедрения */
    managerPhone: '[телефон менеджера внедрения]',
    /** Папка для больших файлов */
    filesFolder: '[ссылка на папку для файлов]',
    /** Контакт технической поддержки по доступам и телефонии */
    techSupport: '[контакт технической поддержки]',
} as const;

/** Путь к файлу брифа в `public/` и имя файла при сохранении */
export const CALIBRATION_BRIEF_FILE = {
    href: '/brief-ai-analytics-calibration.md',
    fileName: 'brief-ai-analytics-calibration.md',
} as const;

/**
 * Адрес печатной версии брифа. Осталась в `how-we-work`: это отдельный
 * печатный документ со своей вёрсткой и своим `@media print`, ссылаются на
 * него кнопкой, а не поиском — переносить маршрут ради красоты дерева значит
 * ломать разосланные ссылки без выгоды.
 */
export const CALIBRATION_BRIEF_PATH = '/how-we-work/calibration/brief';

/** Адрес базы знаний «AI для отдела продаж». */
export const AI_SECTION_PATH = '/ai';

/**
 * Адрес главы «Калибровка»: раздел `/ai`. Старый `/how-we-work/calibration`
 * отвечает постоянным редиректом сюда.
 */
export const AI_CALIBRATION_PATH = `${AI_SECTION_PATH}/calibration`;

/** Маршрут приложения, пересылающий онлайн-бриф нам в Telegram */
export const CALIBRATION_SUBMIT_PATH = '/api/calibration';
