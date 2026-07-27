/**
 * Данные/форматтеры фичи планов (данные отдельно от UI — правило репо).
 */
import type { LiquidProgressTone } from '@workspace/april-ui';
import type { PlanPeriodType, PlanUnit } from '../model';

/**
 * blockId блока «Планы» (ReportBlockWrapper): его тумблер показать/скрыть —
 * единственная настройка планов у рядового; той же видимостью гейтятся
 * план-аннотации таблиц и планы в Excel.
 */
export const PLANS_BLOCK_ID = 'plans';

/** Подписи период-типов задания плана. */
export const PLAN_PERIOD_LABELS: Record<PlanPeriodType, string> = {
    month: 'на месяц',
    quarter: 'на квартал',
    year: 'на год',
};

/** Формат значения по единице показателя. */
export const formatPlanValue = (
    value: number | null,
    unit: PlanUnit,
): string => {
    if (value === null) return '—';
    const rounded = Math.round(value);
    if (unit === 'money') return `${rounded.toLocaleString('ru-RU')} ₽`;
    if (unit === 'minutes') return `${rounded.toLocaleString('ru-RU')} мин`;
    return rounded.toLocaleString('ru-RU');
};

/** Достижение в процентах (доля 0.84 → «84%»). */
export const formatPlanPercent = (percent: number | null): string =>
    percent === null ? '—' : `${Math.round(percent * 100)}%`;

/**
 * Тон прогресса: выполнен/опережает ожидание — success; отстаёт от
 * ожидаемого темпа умеренно — warning; сильное отставание — destructive.
 */
export const planTone = (
    percent: number | null,
    expected: number,
): LiquidProgressTone => {
    if (percent === null) return 'warning';
    if (percent >= 1 || percent >= expected) return 'success';
    return percent >= expected * 0.7 ? 'warning' : 'destructive';
};
