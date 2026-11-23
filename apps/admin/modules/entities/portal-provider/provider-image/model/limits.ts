const MB = 1024 * 1024;

/** Предел веса файла: совпадает с проверкой бэка. */
export const PROVIDER_IMAGE_MAX_BYTES = 2 * MB;

/** Допустимые типы файла: PNG и JPG. */
export const PROVIDER_IMAGE_MIME_TYPES: readonly string[] = ['image/png', 'image/jpeg'];

/** Значение `accept` для выбора файла: диалог показывает только подходящие форматы. */
export const PROVIDER_IMAGE_ACCEPT = PROVIDER_IMAGE_MIME_TYPES.join(',');

/** Расширения для файлов, у которых браузер не определил MIME-тип. */
export const PROVIDER_IMAGE_EXTENSION_TYPES: Readonly<Record<string, string>> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
};

/** Загрузка 2 МБ по медленной связи дольше обычного таймаута запросов админки (30 с). */
export const PROVIDER_IMAGE_UPLOAD_TIMEOUT_MS = 2 * 60_000;
