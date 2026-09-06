import React from 'react';

/**
 * Стили печати брифа.
 *
 * Чёрное на белом и жёсткие рамки таблиц — намеренно вне системы токенов:
 * на бумаге нет тем, а тонкие оттенки `--muted` печатаются как «ничего».
 * Прецедент в монорепе — `apps/bitrix/app/(site)/legal/components/
 * LegalPrintStyles.tsx`.
 *
 * Ширина листа A4 меньше брейкпоинта `md`, поэтому в печати принудительно
 * показываем табличное представление и прячем мобильные карточки.
 */
const PRINT_CSS = `
@media print {
    nav,
    button,
    .no-print {
        display: none !important;
    }

    html,
    body {
        background: #fff !important;
        color: #000 !important;
    }

    .brief-document {
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    .brief-document *,
    .brief-document h1,
    .brief-document h2,
    .brief-document h3,
    .brief-document p,
    .brief-document li,
    .brief-document th,
    .brief-document td {
        color: #000 !important;
        background: transparent !important;
    }

    .brief-document h1,
    .brief-document h2,
    .brief-document h3 {
        break-after: avoid;
        page-break-after: avoid;
    }

    .brief-section {
        break-inside: avoid;
        page-break-inside: avoid;
    }

    .brief-section--page-break {
        break-before: page;
        page-break-before: always;
    }

    .calibration-table__cards {
        display: none !important;
    }

    .calibration-table__grid {
        display: block !important;
        border: 0 !important;
    }

    .brief-document table {
        width: 100% !important;
        border-collapse: collapse !important;
    }

    .brief-document th,
    .brief-document td {
        border: 1px solid #666 !important;
        padding: 4pt 6pt !important;
        vertical-align: top !important;
    }
}

@page {
    margin: 15mm;
}
`;

export const BriefPrintStyles: React.FC = () => (
    <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
);
