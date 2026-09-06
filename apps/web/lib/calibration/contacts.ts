/**
 * ЕДИНСТВЕННОЕ место с контактами-плейсхолдерами.
 *
 * Владелец заменяет значения здесь — они подставляются и в текст страницы
 * `/calibration`, и в бриф `/calibration/brief`. Файл брифа для скачивания
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
