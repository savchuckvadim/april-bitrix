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
 * подписи null-полей (λ_pipe = null — «истории стадий нет», а не ноль),
 * порядок строк, опции селекта менеджеров и выбор менеджера по умолчанию.
 */

/** Источник цели месяца (target.source). */
export const AI_DAILY_PLAN_TARGET_SOURCE: Record<
    AiDailyPlanTargetSource,
    string
> = {
    plan: 'план руководителя или личная цель',
    levelTarget: 'цель уровня',
    median: 'медиана полосы стажа',
};

/** Оговорки к цели (target.warnings). */
export const AI_DAILY_PLAN_TARGET_WARNING: Record<
    AiDailyPlanTargetWarning,
    string
> = {
    'target-empty': 'Цель не задана ни одной ступенью каскада',
    wish: 'Цель ниже медианы факта полосы — «план = пожелание»',
    'unreachable-by-volume': 'Цель выше потолка полосы × рабочие дни',
};

/** Штатная деградация (reason): почему план построен по объёму. */
export const AI_DAILY_PLAN_REASON: Record<
    NonNullable<AiDailyPlanReason>,
    string
> = {
    'portal-model-missing':
        'Модели портала нет: нормы не показываем, план построен по объёму',
    'forecast-missing': 'Прогноза за этот день нет: план построен по объёму',
    'manager-month-missing': 'Месяца менеджера нет: план построен по объёму',
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
        'cap-exceeded': 'требуемый темп выше потолка дня',
        'no-days-left': 'рабочих дней не осталось',
        'edge-theta-zero': 'разворот упёрся в θ = 0',
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

/** Обозначение шага расчёта (explanation.steps[].code) в формулах бэка. */
export const AI_DAILY_PLAN_STEP_SYMBOL: Record<AiDailyPlanStepCode, string> = {
    target: 'G',
    done_sales: 'Y₀',
    pipeline_expected: 'λ_pipe',
    required_volume: 'N_req',
    unwind: 'разворот',
    ceiling: 'потолок',
};

/** λ_pipe без истории стадий: цель на пайплайн не уменьшается. */
export const AI_DAILY_PLAN_NO_STAGE_HISTORY = 'истории стадий нет';
/** N_req не считали (план по объёму), а причина не названа. */
export const AI_DAILY_PLAN_BY_VOLUME = 'план построен по объёму';
/** Потолок дневного темпа не оценён (cap = null). */
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

/** λ_pipe: null — истории стадий нет, это НЕ ноль. */
export const formatAiPipelineExpected = (value: number | null): string =>
    value === null ? AI_DAILY_PLAN_NO_STAGE_HISTORY : formatAiPlanNumber(value);

/** N_req: null — обратную задачу не решали, показываем причину из reason. */
export const formatAiRequiredVolume = (
    value: number | null,
    reason: AiDailyPlanReason,
): string => {
    if (value !== null) return formatAiCount(value);
    return reason ? AI_DAILY_PLAN_REASON[reason] : AI_DAILY_PLAN_BY_VOLUME;
};

/** Потолок дневного темпа полосы стажа; null — не оценён. */
export const formatAiPlanCap = (cap: number | null): string =>
    cap === null ? AI_DAILY_PLAN_CAP_UNKNOWN : formatAiCount(cap);

/** До цели: G − Y₀ − λ_pipe (без истории стадий пайплайн не вычитаем), не ниже 0. */
export const aiSalesLeft = (
    plan: Pick<AiDailyPlan, 'target' | 'doneSales' | 'pipelineExpected'>,
): number =>
    Math.max(
        0,
        plan.target.sales - plan.doneSales - (plan.pipelineExpected ?? 0),
    );

/** Строки плана по приоритету утечки (1 — первая); исходный массив не трогаем. */
export const sortAiDailyPlanItems = (
    items: readonly AiDailyPlanItem[],
): AiDailyPlanItem[] => [...items].sort((a, b) => a.priority - b.priority);

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
