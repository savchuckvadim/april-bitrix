import type { MicroSelectOption } from '@workspace/april-ui/fields';
import { LAUNCH_TEXT } from '../consts/ai-analytics-launch.const';
import { recentClosedMonths } from './launch-period';

/** Значение выбора «вся история» (месяцы — ключи 'YYYY-MM'). */
export const REANALYSIS_ALL = 'all';

/** Сколько закрытых месяцев предлагать отдельно. */
export const REANALYSIS_SCOPE_MONTHS = 6;

const MONTHS_GENITIVE = [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
] as const;

/** «октябрь 2026» по ключу 'YYYY-MM'. */
export function monthLabel(monthKey: string): string {
    const month = Number(monthKey.slice(5, 7));
    return `${MONTHS_GENITIVE[month - 1] ?? monthKey} ${monthKey.slice(0, 4)}`;
}

/** Выбор периода переразбора: вся история или один закрытый месяц. */
export function reanalysisScopeOptions(now: Date): MicroSelectOption[] {
    return [
        { value: REANALYSIS_ALL, label: LAUNCH_TEXT.reanalysisAll },
        ...recentClosedMonths(now, REANALYSIS_SCOPE_MONTHS).map(month => ({
            value: month,
            label: LAUNCH_TEXT.reanalysisMonth(monthLabel(month)),
        })),
    ];
}
