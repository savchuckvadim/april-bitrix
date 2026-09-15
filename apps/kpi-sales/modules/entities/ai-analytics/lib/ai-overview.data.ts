import type { Tone } from '@workspace/april-ui';
import type {
    AiAttentionSignal,
    AiBucket,
    AiByTypeLayout,
    AiByTypeLongRowKind,
    AiFunnelShape,
    AiManagerLevel,
    AiManagerLevelSource,
} from '../model';

/** Сигнал карточки «Внимание» / строки таблицы: подпись, тон, пояснение. */
export const AI_SIGNAL: Record<
    AiAttentionSignal,
    { label: string; tone: Tone; hint: string }
> = {
    risk: {
        label: 'Риск',
        tone: 'destructive',
        hint: 'За период были звонки с риск-флагами (обещание, конфликт, комплаенс, негатив клиента).',
    },
    no_data: {
        label: 'Нет данных',
        tone: 'muted',
        hint: 'Звонки в телефонии есть, а разобранных сравнимых меньше 8 — оценок нет.',
    },
    discipline: {
        label: 'Дисциплина',
        tone: 'warning',
        hint: 'Сделано меньше половины плана CRM при плане от 10.',
    },
    next_step_drop: {
        label: 'Шаг с датой ↓',
        tone: 'warning',
        hint: 'Доля звонков с назначенным шагом и датой упала между двумя окнами периода.',
    },
    plan_gap: {
        label: 'Разрыв плана',
        tone: 'info',
        hint: 'План руководителя расходится с нормой уровня (доступно с Фазы 2).',
    },
};

/** Подписи опор карточки «Внимание» (basis.code); неизвестный код — как есть. */
export const AI_BASIS_LABELS: Record<string, string> = {
    risk_calls: 'Риск-звонков',
    analyzed_calls: 'Разобрано звонков',
    calls_total: 'Звонков в телефонии',
    call_plan: 'План звонков CRM',
    call_done: 'Звонков сделано',
    call_plan_done_share: 'Доля плана звонков',
    presentation_plan: 'План презентаций CRM',
    presentation_done: 'Презентаций сделано',
    next_step_date_rate: 'Шаг с датой',
    next_step_date_rate_prev: 'Шаг с датой (пред. окно)',
    plan_head: 'План руководителя',
    level_norm: 'Норма уровня',
};

/** Коды опор, значения которых — доли 0..1 (форматируем в %). */
export const AI_BASIS_RATE_CODES = ['share', 'rate', 'pct'];

/** Уровень менеджера: подпись и тон бэйджа. */
export const AI_LEVEL: Record<AiManagerLevel, { label: string; tone: Tone }> = {
    junior: { label: 'Джун', tone: 'info' },
    middle: { label: 'Мидл', tone: 'primary' },
    senior: { label: 'Сеньор', tone: 'success' },
};

/** Опции селекта уровня в форме уровней. */
export const AI_LEVEL_OPTIONS: { value: AiManagerLevel; label: string }[] = [
    { value: 'junior', label: AI_LEVEL.junior.label },
    { value: 'middle', label: AI_LEVEL.middle.label },
    { value: 'senior', label: AI_LEVEL.senior.label },
];

/** Источник уровня: назначен РОПом или по стажу. */
export const AI_LEVEL_SOURCE: Record<AiManagerLevelSource, string> = {
    manual: 'назначен руководителем',
    default: 'по стажу (до 6 мес. — джун)',
};

/** Форма воронки менеджера. */
export const AI_FUNNEL_SHAPE: Record<AiFunnelShape, string> = {
    presenter: 'Презентатор',
    closer: 'Закрыватель',
    balanced: 'Сбалансирован',
    unknown: 'Мало счетов',
};

/** Строки подсказки бэйджа уровня: источник, стаж, форма воронки. */
export const aiLevelHintLines = (
    source: AiManagerLevelSource,
    tenureMonths: number | null,
    funnelShape?: AiFunnelShape,
): string[] => [
    `Источник: ${AI_LEVEL_SOURCE[source]}.`,
    `Стаж: ${tenureMonths === null ? 'не задан' : `${tenureMonths} мес.`}.`,
    ...(funnelShape ? [`Воронка: ${AI_FUNNEL_SHAPE[funnelShape]}.`] : []),
];

/** Корзины оценок — порядок столбцов таблицы. */
export const AI_BUCKETS: AiBucket[] = ['contact', 'presentation', 'closing'];

export const AI_BUCKET_LABELS: Record<AiBucket, string> = {
    contact: 'Контакт',
    presentation: 'Презентация',
    closing: 'Закрытие',
};

/** Раскладки среза по типу. */
export const AI_LAYOUT_OPTIONS: { value: AiByTypeLayout; label: string }[] = [
    { value: 'wide', label: 'Широкий' },
    { value: 'long', label: 'Длинный' },
];

/** Гард раскладки (значение из переключателя или ui-settings blob). */
export const isAiByTypeLayout = (value: unknown): value is AiByTypeLayout =>
    value === 'wide' || value === 'long';

/** Подпись состояния очереди тяжёлой ручки (AiJobStatus без null) у спиннера. */
export const AI_JOB_STATUS_LABELS: Record<'queued' | 'processing', string> = {
    queued: 'запрос в очереди…',
    processing: 'сервер считает…',
};

/** Вид показателя «длинной» раскладки. */
export const AI_LONG_KIND: Record<
    AiByTypeLongRowKind,
    { label: string; tone: Tone }
> = {
    score: { label: 'Оценка типа', tone: 'primary' },
    section: { label: 'Раздел', tone: 'info' },
    checklist: { label: 'Чек-лист', tone: 'accent' },
    kpi: { label: 'KPI', tone: 'secondary' },
    objection: { label: 'Возражение', tone: 'warning' },
};

/** Категории возражений справочника агента; неизвестная — как есть. */
export const AI_OBJECTION_CATEGORY_LABELS: Record<string, string> = {
    price: 'Цена',
    timing: 'Сроки',
    need: 'Нет потребности',
    trust: 'Доверие',
    competitor: 'Конкурент',
    authority: 'Не ЛПР',
    budget: 'Бюджет',
    think: 'Подумать',
    unknown: 'Без категории',
};

/** Подпись категории возражения; неизвестная — как есть. */
export const aiObjectionCategoryLabel = (category: string): string =>
    AI_OBJECTION_CATEGORY_LABELS[category] ?? category;

/** Чек-листы ячейки типа: подписи по ключу AiCellChecklists. */
export const AI_CHECKLIST_LABELS = {
    nextStepDateRatePct: 'Шаг с датой',
    hvostDonePct: '«Хвост»',
    fiveKDonePct: '«5К»',
    handledRatePct: 'Возражения отработаны',
} as const;

/** Порог оценки 1–10 для тона полосы ключевой цифры. */
export const AI_SCORE_TONE_THRESHOLDS = { success: 7, warning: 5 } as const;

/** Сколько разделов типа показывать в широкой раскладке. */
export const AI_WIDE_SECTIONS_MAX = 4;
