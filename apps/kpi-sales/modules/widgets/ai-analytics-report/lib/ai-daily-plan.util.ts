import type { MicroSelectOption } from '@workspace/april-ui';
import {
    formatAiCount,
    type AiDailyPlan,
    type AiDailyPlanBetaSource,
    type AiDailyPlanBindingConstraint,
    type AiDailyPlanItem,
    type AiDailyPlanItemCallType,
    type AiDailyPlanReason,
    type AiDailyPlanStepCode,
    type AiDailyPlanTargetSource,
    type AiDailyPlanTargetWarning,
    type AiDailyPlanUnreachable,
} from '@/modules/entities/ai-analytics';

/*
 * Чистая логика карточки «План дня»: подписи кодов DTO по-русски, честные
 * подписи null-полей (ожидание от сделок в работе = null — «истории стадий
 * нет», а не ноль), остаток до цели, опции селекта менеджеров и выбор
 * менеджера по умолчанию. Модель отображения (состояние, заголовок,
 * строки) — ai-daily-plan-view.util. Обозначения формул на экран не выводим.
 */

/** Источник цели месяца (target.source). */
export const AI_DAILY_PLAN_TARGET_SOURCE: Record<
    AiDailyPlanTargetSource,
    string
> = {
    plan: 'план руководителя или личная цель',
    levelTarget: 'цель уровня',
    median: 'обычный результат коллег того же стажа',
};

/** Оговорки к цели (target.warnings). */
export const AI_DAILY_PLAN_TARGET_WARNING: Record<
    AiDailyPlanTargetWarning,
    string
> = {
    'target-empty': 'Цель на месяц не задана',
    wish: 'Цель ниже обычного результата коллег того же стажа — это скорее пожелание',
    'unreachable-by-volume':
        'Цель выше того, что реально сделать за месяц даже при обычном максимуме звонков',
};

/** Штатная деградация (reason): почему план посчитан упрощённо, по объёму. */
export const AI_DAILY_PLAN_REASON: Record<
    NonNullable<AiDailyPlanReason>,
    string
> = {
    'portal-model-missing':
        'Модель портала ещё не построена — план посчитан упрощённо, по объёму активности',
    'forecast-missing':
        'Прогноза на этот день нет — план посчитан упрощённо, по объёму активности',
    'manager-month-missing':
        'Данных менеджера за месяц нет — план посчитан упрощённо, по объёму активности',
};

/** Режим связи «качество → исход» (ropOnly.betaSource). */
export const AI_DAILY_PLAN_BETA_SOURCE: Record<AiDailyPlanBetaSource, string> =
    {
        none: 'связи нет — качество на строки плана не влияет',
        hypothesis: 'гипотеза портала — только калькулятор «что если»',
        data: 'оценка по данным',
    };

/** Почему цель недостижима (ropOnly.unreachable). */
export const AI_DAILY_PLAN_UNREACHABLE: Record<AiDailyPlanUnreachable, string> =
    {
        'cap-exceeded': 'требуемый темп выше обычного максимума по порталу',
        'no-days-left': 'рабочих дней не осталось',
        'edge-theta-zero':
            'на одном из шагов воронки нет ни одного перехода — объём не посчитать',
    };

/** Рёбра воронки: коды строк плана и связующего ограничения. */
export const AI_DAILY_PLAN_EDGE: Record<
    AiDailyPlanItemCallType | AiDailyPlanBindingConstraint,
    string
> = {
    call_to_presentation: 'звонок → презентация',
    presentation_to_offer: 'презентация → предложение',
    offer_to_invoice: 'предложение → счёт',
    invoice_to_sale: 'счёт → продажа',
};

/** Подпись шага расчёта (explanation.steps[].code) — словами, без обозначений формул. */
export const AI_DAILY_PLAN_STEP_LABEL: Record<AiDailyPlanStepCode, string> = {
    target: 'Цель',
    done_sales: 'Закрыто',
    pipeline_expected: 'Принесут сделки в работе',
    required_volume: 'Нужно активности',
    unwind: 'По воронке',
    ceiling: 'Лимит дня',
};

/** Ожидание от сделок в работе без истории стадий: цель на них не уменьшается. */
export const AI_DAILY_PLAN_NO_STAGE_HISTORY = 'не знаем — истории стадий нет';
/** Обычный максимум звонков не оценён (cap = null). */
export const AI_DAILY_PLAN_CAP_UNKNOWN = 'не оценён';

const PLAN_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** День плана в формате бэка YYYY-MM-DD и существующая дата. */
export const isAiPlanDate = (value: string): boolean =>
    PLAN_DATE.test(value) && !Number.isNaN(Date.parse(value));

/** YYYY-MM-DD → «22.09.2026»; иное — как есть. */
export const formatAiPlanDate = (value: string): string => {
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}.${month}.${year}` : value;
};

/** Дробное число плана: 4.5 → «4,5», 10 → «10». */
export const formatAiPlanNumber = (value: number): string =>
    value.toLocaleString('ru-RU', { maximumFractionDigits: 1 });

/** Ожидание от сделок в работе: null — истории стадий нет, это НЕ ноль. */
export const formatAiPipelineExpected = (value: number | null): string =>
    value === null ? AI_DAILY_PLAN_NO_STAGE_HISTORY : formatAiPlanNumber(value);

/** Обычный максимум звонков в день по порталу (так звонят самые активные); null — не оценён. */
export const formatAiPlanCap = (cap: number | null): string =>
    cap === null ? AI_DAILY_PLAN_CAP_UNKNOWN : formatAiCount(cap);

/** До цели: цель − закрыто − ожидание от сделок в работе (без истории стадий его не вычитаем), не ниже 0. */
export const aiSalesLeft = (
    plan: Pick<AiDailyPlan, 'target' | 'doneSales' | 'pipelineExpected'>,
): number =>
    Math.max(
        0,
        plan.target.sales - plan.doneSales - (plan.pipelineExpected ?? 0),
    );

/** Осталось закрыть: цель − закрыто целыми сделками (дробная цель — вверх), не ниже 0. */
export const aiSalesToClose = (
    plan: Pick<AiDailyPlan, 'target' | 'doneSales'>,
): number => Math.max(0, Math.ceil(plan.target.sales - plan.doneSales));

/**
 * Обычный максимум звонков руководителю: бэк копирует cap ЗВОНКОВ во все строки,
 * поэтому показываем одно число — со строки звонков (иначе с первой).
 */
export const aiDailyPlanCallCap = (
    items: readonly AiDailyPlanItem[],
): number | null =>
    (items.find(item => item.callType === 'call_to_presentation') ?? items[0])
        ?.cap ?? null;

/** Подпись ребра-ограничения: название строки плана, иначе код ребра по-русски. */
export const aiBindingConstraintLabel = (
    code: AiDailyPlanBindingConstraint,
    items: readonly AiDailyPlanItem[],
): string =>
    items.find(item => item.callType === code)?.title ??
    AI_DAILY_PLAN_EDGE[code];

/** Опции селекта менеджеров периметра: без дублей, по имени. */
export const buildAiPlanManagerOptions = (
    managerIds: readonly string[],
    name: (managerId: string) => string,
): MicroSelectOption[] =>
    [...new Set(managerIds)]
        .map(value => ({ value, label: name(value) }))
        .sort((a, b) => a.label.localeCompare(b.label, 'ru'));

/** Первый из предпочтительных id, что есть в опциях; иначе первая опция; нет опций — null. */
export const pickAiPlanManager = (
    options: readonly MicroSelectOption[],
    preferred: readonly (string | null | undefined)[],
): string | null => {
    for (const managerId of preferred) {
        if (managerId && options.some(option => option.value === managerId)) {
            return managerId;
        }
    }
    return options[0]?.value ?? null;
};
