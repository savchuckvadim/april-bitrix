/**
 * Бэк сайта — приложение bot монорепы бэкенда: заявки и брифы в Telegram,
 * картинки и видео страниц. Только сервер: браузер ходит в свои Next-маршруты,
 * адрес бэка наружу не виден.
 */

export const BOT_API_URL_DEFAULT = 'https://api.bot.april-app.ru/';

/** Адрес ручки: база из окружения (BOT_API_URL) или прод-дефолт, плюс путь. */
export const botApiUrl = (path: string): string => {
    const base = process.env.BOT_API_URL || BOT_API_URL_DEFAULT;
    return `${base.endsWith('/') ? base : `${base}/`}${path}`;
};
