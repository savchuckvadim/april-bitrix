import React from 'react';

/**
 * Печать предложения.
 *
 * Сайт по умолчанию тёмный (класс air-dark на <html>), а печатать нужно на
 * белой бумаге. Если просто побелить фон, как делает общий PrintStyles,
 * светлый текст станет невидимым — лист выйдет пустым. Поэтому на время
 * печати принудительно переводим страницу в светлую палитру: перекрываем
 * токены темы и задаём цвета явно.
 *
 * Когда бэк начнёт собирать PDF сам (react-pdf, по образцу
 * konstructor/offer-pdf), эти стили останутся как запасной путь
 * «распечатать из браузера».
 */
const PRINT_CSS = `
@media print {
    /* Светлая палитра поверх тёмной темы. */
    :root,
    html.air-dark,
    html.default-dark {
        --background: #ffffff;
        --foreground: #111111;
        --card: #ffffff;
        --card-foreground: #111111;
        --muted: #f4f4f5;
        --muted-foreground: #52525b;
        --border: #d4d4d8;
    }

    html,
    body {
        background: #ffffff !important;
        color: #111111 !important;
    }

    /* Хром сайта и элементы управления на бумаге не нужны. */
    header,
    footer,
    button,
    .no-print {
        display: none !important;
    }

    main {
        padding: 0 !important;
    }

    /* Карточки: рамка вместо заливки, чтобы не тратить тонер. */
    [data-slot='card'] {
        background: #ffffff !important;
        color: #111111 !important;
        border-color: #d4d4d8 !important;
        box-shadow: none !important;
        break-inside: avoid;
    }

    section,
    article {
        break-inside: avoid;
    }
}

@page {
    margin: 14mm;
}
`;

export const RenewalPrintStyles: React.FC = () => {
    return <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />;
};
