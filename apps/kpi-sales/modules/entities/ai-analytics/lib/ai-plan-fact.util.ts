import type { Tone } from '@workspace/april-ui';
import type {
    AiPlanFact,
    AiPlanFactIndicator,
    AiPlanFactRow,
    AiPlanFactRowStatus,
} from '../model';

/*
 * Сверка «план — факт» месяца: подписи показателей и статусов, формат
 * темпа и «в день надо», ключ месяца из даты фильтра. Коды причин на
 * экран не выводим.
 */

/**
 * Показатель строки: подпись и единица. Звонки — из CRM (все звонки
 * менеджера), а не разобранные AI: подпись это различает.
 */
export const AI_PLAN_FACT_INDICATOR: Record<
    AiPlanFactIndicator,
    { label: string; unit: string }
> = {
    sales: { label: 'Продажи', unit: 'шт.' },
    calls: { label: 'Звонки (CRM)', unit: 'шт.' },
    presentations: { label: 'Презентации', unit: 'шт.' },
};

/**
 * Подпись показателя с единицей одним текстом: «Продажи, шт.» — так она
 * копируется и читается скринридером без склейки «Продажишт.».
 */
export const aiPlanFactIndicatorLabel = (
    indicator: AiPlanFactIndicator,
): string => {
    const { label, unit } = AI_PLAN_FACT_INDICATOR[indicator];
    return unit ? `${label}, ${unit}` : label;
};

/** У строки есть цель: план задан и больше нуля (plan-missing / target-empty — нет). */
export const aiPlanFactRowHasPlan = (
    row: Pick<AiPlanFactRow, 'plan'>,
): boolean => row.plan !== null && row.plan > 0;

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

/** no-plan при заданной цели: не хватает факта или рабочих дней, а не плана. */
export const AI_PLAN_FACT_NOT_COUNTED_STATUS: { label: string; tone: Tone } = {
    label: 'не посчитано',
    tone: 'muted',
};

/**
 * Бэйдж статуса строки. Бэк ставит no-plan и когда цели нет, и когда нет
 * факта: при заданной цели честнее «не посчитано», чем «плана нет».
 */
export const aiPlanFactRowStatusView = (
    row: Pick<AiPlanFactRow, 'plan' | 'status'>,
): { label: string; tone: Tone } =>
    row.status === 'no-plan' && aiPlanFactRowHasPlan(row)
        ? AI_PLAN_FACT_NOT_COUNTED_STATUS
        : AI_PLAN_FACT_STATUS[row.status];

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

/** Незнакомая причина — нейтрально, без кода. */
export const AI_PLAN_FACT_REASON_OTHER =
    'причина не описана — уточните у разработчика';

export const aiPlanFactReasonLabel = (code: string): string =>
    AI_PLAN_FACT_REASON_LABELS[code] ?? AI_PLAN_FACT_REASON_OTHER;

/** Число показателя; null — прочерк. */
export const formatAiPlanFactValue = (value: number | null): string =>
    value === null ? '—' : String(Math.round(value * 10) / 10).replace('.', ',');

/** Темп «120 % графика»: факт к тому, что нужно было сделать к сегодня; null — прочерк. */
export const formatAiPlanFactPace = (pace: number | null): string =>
    pace === null ? '—' : `${Math.round(pace * 100)} % графика`;

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
