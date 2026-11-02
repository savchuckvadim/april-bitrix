/**
 * Палитра и размеры PDF-версии предложения.
 *
 * Лист всегда светлый, поэтому цвета заданы здесь явно, а не взяты из
 * токенов темы сайта: на странице тема тёмная, и её цвета на бумаге
 * дали бы белый текст на белом (та же ловушка, что в RenewalPrintStyles).
 */
export const RENEWAL_PDF_THEME = {
    colors: {
        text: '#111111',
        muted: '#55637C',
        accent: '#3073E6',
        line: '#D7DEEA',
        shade: '#F3F6FB',
        total: '#0F7B4F',
    },
    sizes: {
        xs: 7.5,
        sm: 8.5,
        base: 10,
        lg: 12,
        h2: 13,
        h1: 18,
        total: 20,
    },
    page: {
        paddingTop: 42,
        paddingBottom: 54,
        paddingHorizontal: 44,
        edge: 26,
    },
} as const;
