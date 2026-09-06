/**
 * ЕДИНСТВЕННОЕ место с контактами-плейсхолдерами калибровки.
 *
 * Владелец заменяет значения здесь — они подставляются и в текст страницы
 * `/how-we-work/calibration`, и в печатный бриф
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

/** Адрес печатной версии брифа */
export const CALIBRATION_BRIEF_PATH = '/how-we-work/calibration/brief';

/** Адрес страницы калибровки */
export const CALIBRATION_PATH = '/how-we-work/calibration';
