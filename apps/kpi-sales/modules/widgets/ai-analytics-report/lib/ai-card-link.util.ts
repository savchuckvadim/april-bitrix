/*
 * Ссылка на карточку разбора звонка в Битрикс24. Сервер отдаёт полный
 * адрес либо null (разбор ещё не создан); в ответах, сохранённых до
 * появления ссылок, поля нет совсем. Ссылкой считаем только адрес
 * страницы — всё остальное показываем обычным текстом.
 */

const WEB_ADDRESS = /^https?:\/\//i;

/** Адрес карточки разбора; null — ссылки нет (пусто, не строка, не адрес страницы). */
export const aiCardLink = (link: unknown): string | null => {
    if (typeof link !== 'string') return null;
    const address = link.trim();
    return WEB_ADDRESS.test(address) ? address : null;
};
