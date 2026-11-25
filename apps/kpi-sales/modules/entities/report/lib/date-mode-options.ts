import { EReportDateMode } from '../model/types/report/report-type';

/** Режимы периода в порядке показа в панели фильтра. */
export const DATE_MODE_OPTIONS: ReadonlyArray<{
    mode: EReportDateMode;
    label: string;
}> = [
    { mode: EReportDateMode.RANGE, label: 'Диапазон' },
    { mode: EReportDateMode.TODAY, label: 'Сегодня' },
    { mode: EReportDateMode.WEEK, label: 'Неделя' },
    { mode: EReportDateMode.MONTH, label: 'Месяц' },
];

/** Значение радио-группы режимов → режим периода (чужие значения отбрасываются). */
export const parseDateMode = (value: string): EReportDateMode | null =>
    DATE_MODE_OPTIONS.find(option => option.mode === value)?.mode ?? null;
