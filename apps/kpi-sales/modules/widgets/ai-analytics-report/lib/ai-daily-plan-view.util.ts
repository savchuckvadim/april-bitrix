import {
    aiPlanShare,
    type AiDailyPlan,
    type AiDailyPlanItem,
    type AiDailyPlanItemCallType,
} from '@/modules/entities/ai-analytics';
import {
    AI_DAILY_PLAN_REASON,
    aiSalesLeft,
    aiSalesToClose,
} from './ai-daily-plan.util';
import {
    AI_DAILY_PLAN_ACTIVITY,
    AI_DAILY_PLAN_FUNNEL_ORDER,
    AI_DAILY_PLAN_SALE_ACC_FORMS,
    AI_DAILY_PLAN_SALE_FORMS,
    AI_DAILY_PLAN_UNKNOWN_FORMS,
    type AiDailyPlanActivity,
} from './ai-daily-plan-activity.data';
import {
    formatAiDailyCount,
    formatAiDailyCountWith,
    formatAiDailyForecast,
    joinAiList,
} from './ai-daily-plan-format.util';
import {
    buildAiDailyPlanForecast,
    type AiDailyPlanForecastView,
} from './ai-daily-plan-forecast.util';

/*
 * Модель отображения «Плана дня»: одно из трёх состояний, заголовок
 * простыми словами, строки в порядке воронки и прогноз месяца
 * руководителю. Без цели план — это «закрыто 2 из 0» и «144 / 144»,
 * поэтому такой план честно показывается как «цели нет» с фактом месяца.
 * Счёт словами — ai-daily-plan-format.util, прогноз — ai-daily-plan-forecast.util.
 */

/** no-target — цели нет; reached — остаток закрыт (или его закроют сделки в работе); active — план на сегодня. */
export type AiDailyPlanViewState = 'no-target' | 'reached' | 'active';

export interface AiDailyPlanRowView {
    callType: AiDailyPlanItemCallType;
    /** Активность — вход ребра воронки: Звонки, Презентации, КП, Счета. */
    label: string;
    hint: string;
    /** «Нужно сегодня»: «<1» для 0 < x < 1, иначе округление. */
    today: string;
    /** Сделано за месяц. */
    monthDone: string;
    /** План месяца; null — цели нет, «сделано + остаток» ничего не значит. */
    monthPlan: string | null;
    /** Доля выполнения месяца для полосы; null — плана нет. */
    monthShare: number | null;
    /** Главная утечка воронки (priority = 1) — начинать с неё. */
    topLeak: boolean;
}

export interface AiDailyPlanView {
    state: AiDailyPlanViewState;
    headline: string;
    /** «За месяц: 2 сделки, 144 звонка и 3 КП.» */
    monthFacts: string;
    /** «Сделки в работе ещё принесут ≈2 продажи…»; null — истории стадий нет. */
    pipelineFact: string | null;
    rows: AiDailyPlanRowView[];
    /** Прогноз месяца; null — блока руководителя нет (менеджер) или прогноз не оценён. */
    forecast: AiDailyPlanForecastView | null;
    /** «Прогноз не оценён — …» вместо чисел; null — числа есть или блока нет. */
    forecastNote: string | null;
    /** Почему план посчитан упрощённо (plan.reason); null — по полным данным. */
    reasonText: string | null;
}

/** Цель есть: ступень каскада её дала и она больше нуля. */
export const aiDailyPlanHasGoal = (
    plan: Pick<AiDailyPlan, 'target'>,
): boolean =>
    !plan.target.warnings.includes('target-empty') && plan.target.sales > 0;

export const aiDailyPlanState = (plan: AiDailyPlan): AiDailyPlanViewState => {
    if (!aiDailyPlanHasGoal(plan)) return 'no-target';
    return aiSalesLeft(plan) > 0 ? 'active' : 'reached';
};

/**
 * «Узкое место» — строка с первой по утечке позицией, если бэк прислал саму
 * утечку (leak — положительное число). leak = null (план по объёму: priority
 * лишь порядок строк), нулевая утечка и старые ответы без поля — «узкого
 * места» нет, иначе выдумка.
 * Одна строка — выбирать не из чего.
 */
export const aiDailyPlanTopLeak = (
    item: Pick<AiDailyPlanItem, 'leak' | 'priority'>,
    rowsCount: number,
): boolean =>
    typeof item.leak === 'number' &&
    item.leak > 0 &&
    item.priority === 1 &&
    rowsCount > 1;

const funnelIndex = (callType: string): number => {
    const index = (AI_DAILY_PLAN_FUNNEL_ORDER as readonly string[]).indexOf(
        callType,
    );
    return index === -1 ? AI_DAILY_PLAN_FUNNEL_ORDER.length : index;
};

const ACTIVITY_BY_CODE: Partial<Record<string, AiDailyPlanActivity>> =
    AI_DAILY_PLAN_ACTIVITY;

/** Активность строки; незнакомый код ребра (бэк добавил шаг) — по title строки. */
export const aiDailyPlanActivity = (
    item: Pick<AiDailyPlanItem, 'callType' | 'title'>,
): AiDailyPlanActivity =>
    ACTIVITY_BY_CODE[item.callType] ?? {
        label: item.title,
        hint: item.title,
        forms: AI_DAILY_PLAN_UNKNOWN_FORMS,
    };

/** Строки в порядке воронки (бэк сортирует по утечке); исходный массив не трогаем. */
export const sortAiDailyPlanFunnel = (
    items: readonly AiDailyPlanItem[],
): AiDailyPlanItem[] =>
    [...items].sort(
        (a, b) => funnelIndex(a.callType) - funnelIndex(b.callType),
    );

/**
 * Строки плана в порядке воронки. hasGoal — есть план месяца; «узкое
 * место» — только по присланной утечке (aiDailyPlanTopLeak).
 */
export const buildAiDailyPlanRows = (
    items: readonly AiDailyPlanItem[],
    hasGoal: boolean,
): AiDailyPlanRowView[] =>
    sortAiDailyPlanFunnel(items).map(item => {
        const activity = aiDailyPlanActivity(item);
        return {
            callType: item.callType,
            label: activity.label,
            hint: activity.hint,
            today: formatAiDailyCount(item.requiredToday),
            monthDone: formatAiDailyCount(item.monthDone),
            monthPlan: hasGoal ? formatAiDailyCount(item.monthPlan) : null,
            monthShare: hasGoal
                ? aiPlanShare(item.monthDone, item.monthPlan)
                : null,
            topLeak: aiDailyPlanTopLeak(item, items.length),
        };
    });

/** «12 звонков, 3 презентации и <1 КП» — только то, что нужно сегодня (> 0). */
export const aiDailyPlanTodayList = (
    items: readonly AiDailyPlanItem[],
): string =>
    joinAiList(
        sortAiDailyPlanFunnel(items)
            .filter(item => item.requiredToday > 0)
            .map(item =>
                formatAiDailyCountWith(
                    item.requiredToday,
                    aiDailyPlanActivity(item).forms,
                ),
            ),
    );

/** Факт месяца: «За месяц: 2 сделки, 144 звонка и 3 КП.» */
export const aiDailyPlanMonthFacts = (
    plan: Pick<AiDailyPlan, 'doneSales' | 'items'>,
): string => {
    const parts = [
        formatAiDailyCountWith(plan.doneSales, AI_DAILY_PLAN_SALE_FORMS),
        ...sortAiDailyPlanFunnel(plan.items).map(item =>
            formatAiDailyCountWith(
                item.monthDone,
                aiDailyPlanActivity(item).forms,
            ),
        ),
    ];
    return `За месяц: ${joinAiList(parts)}.`;
};

/** λ_pipe простыми словами; null — истории стадий нет, ноль не выдумываем. */
export const aiDailyPlanPipelineFact = (
    pipelineExpected: number | null,
): string | null =>
    pipelineExpected === null
        ? null
        : `Сделки в работе ещё принесут ${formatAiDailyForecast(pipelineExpected)} до конца месяца.`;

const reachedHeadline = (plan: AiDailyPlan): string => {
    const toClose = aiSalesToClose(plan);
    if (toClose === 0) {
        const done = formatAiDailyCountWith(
            plan.doneSales,
            AI_DAILY_PLAN_SALE_FORMS,
        );
        return `Цель месяца выполнена: ${done} при цели ${formatAiDailyCount(plan.target.sales)}.`;
    }
    const left = formatAiDailyCountWith(toClose, AI_DAILY_PLAN_SALE_ACC_FORMS);
    return `Осталось закрыть ${left} — это ожидаем от сделок в работе. Держите обычный темп.`;
};

const activeHeadline = (plan: AiDailyPlan, today: string): string => {
    const left = formatAiDailyCountWith(
        aiSalesToClose(plan),
        AI_DAILY_PLAN_SALE_FORMS,
    );
    if (plan.daysLeft <= 0) {
        return `До цели ${left}, а рабочих дней в месяце не осталось.`;
    }
    return today
        ? `До цели ${left}: сегодня нужно ${today}.`
        : `До цели ${left}: на сегодня активности в плане нет.`;
};

/** Заголовок карточки простыми словами — вместо строки с формулами. */
export const aiDailyPlanHeadline = (
    plan: AiDailyPlan,
    state: AiDailyPlanViewState = aiDailyPlanState(plan),
): string => {
    if (state === 'no-target') {
        return 'Цель на месяц не задана — план дня не считается.';
    }
    const today = aiDailyPlanTodayList(plan.items);
    if (state === 'active') return activeHeadline(plan, today);
    const base = reachedHeadline(plan);
    return today ? `${base} Сегодня по плану: ${today}.` : base;
};

export const buildAiDailyPlanView = (plan: AiDailyPlan): AiDailyPlanView => {
    const state = aiDailyPlanState(plan);
    const { forecast, note } = buildAiDailyPlanForecast(plan);
    return {
        state,
        headline: aiDailyPlanHeadline(plan, state),
        monthFacts: aiDailyPlanMonthFacts(plan),
        pipelineFact: aiDailyPlanPipelineFact(plan.pipelineExpected),
        rows: buildAiDailyPlanRows(plan.items, state !== 'no-target'),
        forecast,
        forecastNote: note,
        reasonText: plan.reason ? AI_DAILY_PLAN_REASON[plan.reason] : null,
    };
};
