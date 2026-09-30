import type {
    AiDailyPlanTargetWarning,
    AiManagerSinceSource,
    AiPlanFactIndicator,
    AiPlanFactReason,
    AiReadinessBetaSource,
    AiReadinessMode,
} from '@/modules/entities/ai-analytics';
import type { Tone } from '@workspace/april-ui';
import type { AiSettingsTab } from './ai-settings-form.util';
import {
    AI_CHECKLIST_ITEM,
    AI_CHECKLIST_SECTION,
    AI_CHECKLIST_VERDICT,
    type AiChecklistItemCode,
    type AiChecklistSectionKey,
    type AiChecklistVerdict,
} from './ai-setup-checklist.types';
import type { AiTheoryTopic } from './ai-theory-link';

/*
 * Пороги, расписание и тексты чек-листа «Готовность витрины». Числа, которых
 * нет в ответах бэка, — именованные константы со ссылкой на константу бэка.
 */

/**
 * Сравнимых недельных точек ряда до первого сигнала тренда. Бэк:
 * TREND_DEFAULTS.minPoints (libs/sales-ai-analytics/src/model/trend/
 * trend-defaults.ts); после смены версии — max(8, calibration_comparable_weeks = 4).
 */
export const AI_CHECKLIST_TREND_MIN_WEEKS = 8;

/** «Год назад» — снапшот месяца M−12: нужно 13 месяцев истории (бэк: model/trend/same-period.ts). */
export const AI_CHECKLIST_YOY_MONTHS = 13;

/**
 * Окно модели портала — 12 мес.: readiness.historyMonths выше не растёт,
 * поэтому срок «год назад» по нему оценивается только до 12 мес.
 */
export const AI_CHECKLIST_MODEL_WINDOW_MONTHS = 12;

/** Расписание кронов (бэк: AI_ANALYTICS_LOCAL_HOURS, constants/ai-cron.const.ts). */
export const AI_CHECKLIST_SCHEDULE = {
    /**
     * Модель портала: MONTHLY — 3-го числа 04:00; кроме того, шаг модели
     * идёт в ночном догоне истории (BACKFILL_WINDOW), поэтому 3-е число —
     * не единственный срок.
     */
    PORTAL_MODEL: { dayOfMonth: 3, time: '04:00' },
    /** Окно ночного догона истории (бэк: backfill 22:00–06:00). */
    BACKFILL_WINDOW: '22:00–06:00',
    /** Снимок планов руководителя: PLANS — 1-го числа 04:00. */
    PLANS: { dayOfMonth: 1, time: '04:00' },
    /** Ночной пересчёт: NIGHTLY — ежедневно 03:45. */
    NIGHTLY_TIME: '03:45',
} as const;

/**
 * Режимы до шага «Нормы»: праздники и состав бэк проверяет только после
 * калибровки (libs/sales-ai-analytics/src/model/readiness.ts, normsReasons).
 */
export const AI_CHECKLIST_PRE_NORMS_MODES: ReadonlySet<AiReadinessMode> =
    new Set<AiReadinessMode>(['kpi-only', 'calibration']);

/** Сколько имён перечислять в пункте, дальше — «и ещё N». */
export const AI_CHECKLIST_NAMES_MAX = 5;

/** Оговорка плана дня: цель не задана ни одной ступенью каскада. */
export const AI_CHECKLIST_TARGET_EMPTY: AiDailyPlanTargetWarning =
    'target-empty';

/** Причина план-факта: снимка планов руководителя за месяц нет. */
export const AI_CHECKLIST_PLAN_SNAPSHOT_MISSING: AiPlanFactReason =
    'plan-snapshot-missing';

/** Показатель план-факта, по которому ищем план руководителя. */
export const AI_CHECKLIST_SALES_INDICATOR: AiPlanFactIndicator = 'sales';

/** Связь «качество → исход» оценена по данным портала (гейт β пройден). */
export const AI_CHECKLIST_BETA_FROM_DATA: AiReadinessBetaSource = 'data';

/** Дата стажа задана руководителем (иначе — из дат Bitrix). */
export const AI_CHECKLIST_MANUAL_SINCE: AiManagerSinceSource = 'manual';

/** Дата стажа приблизительная: первое событие телефонии или отчётности. */
export const AI_CHECKLIST_PROXY_SINCE: AiManagerSinceSource = 'proxy';

/** Подписи вкладок диалога настроек — для текста «где настроить». */
export const AI_CHECKLIST_TAB_LABELS: Record<AiSettingsTab, string> = {
    levels: 'Уровни',
    targets: 'Цели по уровням',
    absences: 'Отсутствия',
    roster: 'Состав',
    hypothesis: 'Гипотеза качества',
    pool: 'Пул порталов',
};

/** Заголовки разделов. */
export const AI_CHECKLIST_SECTION_TITLES: Record<
    AiChecklistSectionKey,
    string
> = {
    [AI_CHECKLIST_SECTION.DATA]: 'Сначала данные',
    [AI_CHECKLIST_SECTION.CONFIGURE]: 'Настроить',
    [AI_CHECKLIST_SECTION.WAIT]: 'Подождать',
    [AI_CHECKLIST_SECTION.UNKNOWN]: 'Не проверить сейчас',
    [AI_CHECKLIST_SECTION.DONE]: 'Готово',
};

/** Итог: подпись бэйджа и тон карточки. */
export const AI_CHECKLIST_VERDICT_VIEW: Record<
    AiChecklistVerdict,
    { label: string; tone: Tone }
> = {
    [AI_CHECKLIST_VERDICT.DATA]: { label: 'Нужны данные', tone: 'destructive' },
    [AI_CHECKLIST_VERDICT.CONFIGURE]: {
        label: 'Нужно донастроить',
        tone: 'warning',
    },
    [AI_CHECKLIST_VERDICT.WAIT]: { label: 'Осталось подождать', tone: 'info' },
    [AI_CHECKLIST_VERDICT.READY]: { label: 'Всё готово', tone: 'success' },
};

/** Пункт чек-листа → тема сайта теории (ссылка в пункте); нет темы — без ссылки. */
export const AI_CHECKLIST_ITEM_THEORY: Partial<
    Record<AiChecklistItemCode, AiTheoryTopic>
> = {
    [AI_CHECKLIST_ITEM.ACCESS]: 'access',
    [AI_CHECKLIST_ITEM.CALL_COVERAGE]: 'troubleshooting',
    [AI_CHECKLIST_ITEM.PILOT]: 'troubleshooting',
    [AI_CHECKLIST_ITEM.NOT_ANALYZED]: 'troubleshooting',
    [AI_CHECKLIST_ITEM.PIPELINE]: 'troubleshooting',
    [AI_CHECKLIST_ITEM.DATA_QUALITY]: 'troubleshooting',
    [AI_CHECKLIST_ITEM.COMPARABLE]: 'comparable',
    [AI_CHECKLIST_ITEM.TENURE]: 'levels',
    [AI_CHECKLIST_ITEM.ROSTER]: 'levels',
    [AI_CHECKLIST_ITEM.TARGETS]: 'targetsSetup',
    [AI_CHECKLIST_ITEM.HEAD_PLANS]: 'goalCascade',
    [AI_CHECKLIST_ITEM.PUSH]: 'push',
    [AI_CHECKLIST_ITEM.CALENDAR]: 'settingsKeys',
    [AI_CHECKLIST_ITEM.HISTORY]: 'readinessModes',
    [AI_CHECKLIST_ITEM.PRESENTATIONS]: 'readinessModes',
    [AI_CHECKLIST_ITEM.PORTAL_MODEL]: 'gates',
    [AI_CHECKLIST_ITEM.TRENDS]: 'trends',
    [AI_CHECKLIST_ITEM.YOY]: 'yearAgo',
    [AI_CHECKLIST_ITEM.BETA]: 'betaGate',
    [AI_CHECKLIST_ITEM.HYPOTHESIS]: 'qualityLink',
    [AI_CHECKLIST_ITEM.NORMS_PRESENTATIONS]: 'norms',
    [AI_CHECKLIST_ITEM.NORMS_GATES]: 'calibration',
    [AI_CHECKLIST_ITEM.FORECAST_SHADOW]: 'forecastShadow',
    [AI_CHECKLIST_ITEM.FORECAST_ACCURACY]: 'forecastBacktest',
    [AI_CHECKLIST_ITEM.FORECAST_STAGE]: 'forecast',
    [AI_CHECKLIST_ITEM.RECOMMENDATIONS]: 'recommendationsEffect',
    [AI_CHECKLIST_ITEM.RECOMMENDATIONS_STAGE]: 'recommendationsEffect',
};

/** Тема теории для пункта; null — ссылки в пункте нет. */
export const aiChecklistTheoryTopic = (
    code: AiChecklistItemCode,
): AiTheoryTopic | null => AI_CHECKLIST_ITEM_THEORY[code] ?? null;

/** Склонения для «у N менеджеров», «звонки N сотрудников». */
export const AI_MANAGER_GENITIVE = [
    'менеджера',
    'менеджеров',
    'менеджеров',
] as const;
export const AI_EMPLOYEE_GENITIVE = [
    'сотрудника',
    'сотрудников',
    'сотрудников',
] as const;
