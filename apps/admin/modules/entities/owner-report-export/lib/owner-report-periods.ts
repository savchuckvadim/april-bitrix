import { AiOwnerReportExportStartDtoKind } from '@workspace/nest-admin-api';

/** Вид периода выгрузки: месяц, квартал, полугодие, год. */
export type OwnerReportExportKind = AiOwnerReportExportStartDtoKind;
export const OWNER_REPORT_EXPORT_KINDS = AiOwnerReportExportStartDtoKind;

export const OWNER_REPORT_EXPORT_KIND_LABELS: Readonly<
    Record<OwnerReportExportKind, string>
> = {
    month: 'Месяц',
    quarter: 'Квартал',
    half_year: 'Полугодие',
    year: 'Год',
};

/** Сколько закрытых периодов предлагать в выборе — по виду. */
export const OWNER_REPORT_EXPORT_PERIOD_COUNT: Readonly<
    Record<OwnerReportExportKind, number>
> = {
    month: 12,
    quarter: 4,
    half_year: 2,
    year: 2,
};

/**
 * Сколько полных месяцев готовых разборов нужно, чтобы вид периода имел
 * смысл: длинный отчёт по неполной истории вводит в заблуждение.
 */
const KIND_MIN_HISTORY_MONTHS: Readonly<Record<OwnerReportExportKind, number>> =
    {
        month: 0,
        quarter: 3,
        half_year: 6,
        year: 12,
    };

/** Период для выбора: ключ (ГГГГ-ММ, ГГГГ-Q1, ГГГГ-H1, ГГГГ) и подпись словами. */
export interface OwnerReportPeriodOption {
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
): OwnerReportPeriodOption[] {
    const options: OwnerReportPeriodOption[] = [];
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

/** Закрытые кварталы, новые первыми: идущий квартал не закрыт. */
function closedQuarterOptions(
    now: Date,
    count: number,
): OwnerReportPeriodOption[] {
    const options: OwnerReportPeriodOption[] = [];
    let year = now.getFullYear();
    let quarter = Math.floor(now.getMonth() / 3); // 0-based: это уже прошлый квартал по номеру
    for (let index = 0; index < count; index += 1) {
        if (quarter === 0) {
            quarter = 4;
            year -= 1;
        }
        options.push({
            value: `${year}-Q${quarter}`,
            label: `${quarter} квартал ${year}`,
        });
        quarter -= 1;
    }
    return options;
}

/** Закрытые полугодия, новые первыми: идущее полугодие не закрыто. */
function closedHalfYearOptions(
    now: Date,
    count: number,
): OwnerReportPeriodOption[] {
    const options: OwnerReportPeriodOption[] = [];
    let year = now.getFullYear();
    let half = now.getMonth() < 6 ? 0 : 1; // 0-based: это уже прошлое полугодие по номеру
    for (let index = 0; index < count; index += 1) {
        if (half === 0) {
            half = 2;
            year -= 1;
        }
        options.push({
            value: `${year}-H${half}`,
            label: `${half} полугодие ${year}`,
        });
        half -= 1;
    }
    return options;
}

/** Закрытые годы, новые первыми: текущий год не закрыт. */
function closedYearOptions(now: Date, count: number): OwnerReportPeriodOption[] {
    return Array.from({ length: count }, (_, index) => {
        const year = now.getFullYear() - 1 - index;
        return { value: String(year), label: `${year} год` };
    });
}

/** Закрытые периоды вида, новые первыми; count по умолчанию — из таблицы вида. */
export function closedPeriodOptions(
    kind: OwnerReportExportKind,
    now: Date,
    count: number = OWNER_REPORT_EXPORT_PERIOD_COUNT[kind],
): OwnerReportPeriodOption[] {
    switch (kind) {
        case OWNER_REPORT_EXPORT_KINDS.quarter:
            return closedQuarterOptions(now, count);
        case OWNER_REPORT_EXPORT_KINDS.half_year:
            return closedHalfYearOptions(now, count);
        case OWNER_REPORT_EXPORT_KINDS.year:
            return closedYearOptions(now, count);
        default:
            return closedMonthOptions(now, count);
    }
}

/**
 * Полных месяцев готовых разборов к началу текущего месяца: analysisSince —
 * первый день с разборами (ГГГГ-ММ-ДД), null — разборов нет. Сравнение по
 * номерам месяцев, без часовых поясов.
 */
export function analysisHistoryMonths(
    analysisSince: string | null | undefined,
    now: Date,
): number {
    if (!analysisSince) return 0;
    const [year, month] = analysisSince.split('-').map(Number);
    if (!year || !month) return 0;
    const months =
        (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
    return Math.max(0, months);
}

/**
 * Какие виды периода предлагать порталу: месяц всегда; квартал — с трёх
 * месяцев истории разборов, полугодие — с шести, год — с двенадцати.
 */
export function availableExportKinds(
    analysisSince: string | null | undefined,
    now: Date,
): OwnerReportExportKind[] {
    const months = analysisHistoryMonths(analysisSince, now);
    return (
        Object.keys(KIND_MIN_HISTORY_MONTHS) as OwnerReportExportKind[]
    ).filter(kind => months >= KIND_MIN_HISTORY_MONTHS[kind]);
}

export const isOwnerReportExportKind = (
    value: string,
): value is OwnerReportExportKind => value in OWNER_REPORT_EXPORT_KINDS;

/** Размер файла словами: «86 КБ», «1,2 МБ». */
export function fileSizeText(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`;
}
