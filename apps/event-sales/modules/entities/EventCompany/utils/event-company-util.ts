export type CompanyColorType = 'red' | 'green' | 'yellow';

/**
 * Шкала прогноза: три ступени от худшей к лучшей.
 *
 * Порядок здесь — сам смысл шкалы, поэтому массив, а не карта. Цвет ступени
 * прописан явно токеном темы: `red/yellow/green` — коды портального поля, и
 * выводить из них палитру строкой значило бы завязать вёрстку на данные
 * портала.
 */
export const PROSPECT_SCALE: ReadonlyArray<{
    code: CompanyColorType;
    name: string;
    /** CSS-цвет ступени: токен темы через var(--…), не hex. */
    cssColor: string;
}> = [
    { code: 'red', name: 'Красный', cssColor: 'var(--destructive)' },
    { code: 'yellow', name: 'Жёлтый', cssColor: 'var(--warning)' },
    { code: 'green', name: 'Зелёный', cssColor: 'var(--success)' },
];
