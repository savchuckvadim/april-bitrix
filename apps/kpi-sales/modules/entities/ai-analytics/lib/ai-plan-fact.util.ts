import type { Tone } from '@workspace/april-ui';
import type {
    AiPlanFact,
    AiPlanFactIndicator,
    AiPlanFactRow,
    AiPlanFactRowStatus,
} from '../model';

/*
 * Реконсиляция «план — факт» месяца (Фаза 3, П2): подписи показателей и
 * статусов, формат темпа и «в день надо», ключ месяца из даты фильтра.
 */

/** Показатель строки: подпись и единица. */
export const AI_PLAN_FACT_INDICATOR: Record<
    AiPlanFactIndicator,
    { label: string; unit: string }
> = {
    sales: { label: 'Продажи', unit: 'шт.' },
    calls: { label: 'Звонки', unit: 'шт.' },
    presentations: { label: 'Презентации', unit: 'шт.' },
};

/** Статус строки: подпись и тон. */
export const AI_PLAN_FACT_STATUS: Record<
    AiPlanFactRowStatus,
    { label: string; tone: Tone }
> = {
    'on-track': { label: 'в графике', tone: 'success' },
    behind: { label: 'отстаёт', tone: 'warning' },
    ahead: { label: 'опережает', tone: 'info' },
    'no-plan': { label: 'плана нет', tone: 'muted' },
};

/** Причины строки и ручки (коды бэка) по-русски. */
export const AI_PLAN_FACT_REASON_LABELS: Record<string, string> = {
    'plan-missing': 'цели на месяц у менеджера нет',
    'target-empty': 'цель по показателю не задана',
    'fact-missing': 'факт месяца ещё не посчитан',
    'no-workdays': 'рабочих дней в месяце ещё не было',
    'no-days-left': 'рабочих дней в месяце не осталось',
    'daily-plan-disabled': 'план дня выключен на портале',
    'plan-snapshot-missing': 'снимка целей руководителя за месяц нет',
    'manager-month-missing': 'месяцы менеджеров ещё не рассчитаны',
};

export const aiPlanFactReasonLabel = (code: string): string =>
    AI_PLAN_FACT_REASON_LABELS[code] ?? code;

/** Число показателя; null — прочерк. */
export const formatAiPlanFactValue = (value: number | null): string =>
    value === null ? '—' : String(Math.round(value * 10) / 10).replace('.', ',');

/** Темп «×1,2» относительно графика; null — прочерк. */
export const formatAiPlanFactPace = (pace: number | null): string =>
    pace === null ? '—' : `×${pace.toFixed(2).replace('.', ',')}`;

/** Разрыв к плану со знаком; null — прочерк. */
export const formatAiPlanFactGap = (gap: number | null): string => {
    if (gap === null) return '—';
    const sign = gap > 0 ? '+' : gap < 0 ? '−' : '';
    return `${sign}${formatAiPlanFactValue(Math.abs(gap))}`;
};

/** «В день надо»: целое вверх; null — прочерк (плана нет или план дня выключен). */
export const formatAiPlanFactPerDay = (perDay: number | null): string =>
    perDay === null ? '—' : String(Math.ceil(perDay));

/** Ключ месяца YYYY-MM из даты YYYY-MM-DD (конец периода фильтра). */
export const aiPlanFactMonthKey = (date: string | null | undefined): string | null =>
    date && /^\d{4}-\d{2}/.test(date) ? date.slice(0, 7) : null;

/** Строки менеджера в порядке показателей справочника. */
export const sortAiPlanFactRows = (rows: readonly AiPlanFactRow[]): AiPlanFactRow[] => {
    const order = Object.keys(AI_PLAN_FACT_INDICATOR);
    return [...rows].sort(
        (a, b) => order.indexOf(a.indicator) - order.indexOf(b.indicator),
    );
};

/** Подпись периода: «сентябрь 2026 · 14 из 22 рабочих дней». */
export const formatAiPlanFactPeriod = (planFact: AiPlanFact): string => {
    const year = Number(planFact.period.monthKey.slice(0, 4));
    const month = Number(planFact.period.monthKey.slice(5, 7));
    const title = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
        'ru-RU',
        { month: 'long', year: 'numeric', timeZone: 'UTC' },
    );
    const days = `${planFact.period.workdaysElapsed} из ${planFact.period.workdaysInMonth} рабочих дней`;
    return `${title} · ${planFact.period.closed ? 'месяц закрыт' : days}`;
};
