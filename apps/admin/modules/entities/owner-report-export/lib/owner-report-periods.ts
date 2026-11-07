/** Месяц для выбора: ключ периода ГГГГ-ММ и подпись «Октябрь 2026». */
export interface OwnerReportMonthOption {
    value: string;
    label: string;
}

const MONTHS = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
] as const;

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * Закрытые месяцы, новые первыми: текущий месяц не закрыт и в список не
 * попадает (бэк такой период всё равно отклонит).
 */
export function closedMonthOptions(
    now: Date,
    count: number,
): OwnerReportMonthOption[] {
    const options: OwnerReportMonthOption[] = [];
    let year = now.getFullYear();
    let month = now.getMonth(); // 0-based: это уже прошлый месяц по номеру
    for (let index = 0; index < count; index += 1) {
        if (month === 0) {
            month = 12;
            year -= 1;
        }
        options.push({
            value: `${year}-${pad(month)}`,
            label: `${MONTHS[month - 1]} ${year}`,
        });
        month -= 1;
    }
    return options;
}

/** Размер файла словами: «86 КБ», «1,2 МБ». */
export function fileSizeText(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`;
}
