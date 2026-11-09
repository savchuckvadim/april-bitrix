/**
 * Сайт bitrix (bitrix.april-app.ru): страницы для клиентов — КП на год,
 * продающий раздел, картинки и видео по адресам /media/…. Не адрес бэкенда.
 * При разработке переопределяется NEXT_PUBLIC_BITRIX_APP_URL.
 */
export const BITRIX_SITE_URL = (
    process.env.NEXT_PUBLIC_BITRIX_APP_URL || 'https://bitrix.april-app.ru'
).replace(/\/$/, '');
