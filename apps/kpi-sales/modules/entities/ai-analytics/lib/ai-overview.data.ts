import type { Tone } from '@workspace/april-ui';
import type {
    AiAttentionSignal,
    AiBucket,
    AiByTypeLayout,
    AiByTypeLongRowKind,
    AiFunnelShape,
    AiManagerLevel,
    AiManagerLevelSource,
    AiManagerSinceSource,
} from '../model';

/** Сигнал карточки «Внимание» / строки таблицы: подпись, тон, что значит, что сделать. */
export interface AiSignalView {
    label: string;
    tone: Tone;
    /** Что значит сигнал — первая строка подсказки. */
    hint: string;
    /** Что руководителю сделать с сигналом. */
    action: string;
}

/** Пояснение «Нет данных»: что такое разбор и почему звонок в него не попал. */
export const AI_SIGNAL_NO_DATA_EXPLANATION =
    'Разбор — это звонок, который AI прослушал и оценил. Звонки не попадают в разбор, если сотрудник не в пилоте, звонок короче порога или не привязан к сделке.';

export const AI_SIGNAL: Record<AiAttentionSignal, AiSignalView> = {
    risk: {
        label: 'Риск',
        tone: 'destructive',
        hint: 'За период были звонки с риск-флагами (обещание, конфликт, комплаенс, негатив клиента).',
        action: 'Прослушайте риск-звонки и обсудите с менеджером',
    },
    no_data: {
        label: 'Нет данных',
        tone: 'muted',
        hint: `Звонки в телефонии есть, а разобранных сравнимых меньше 8 — оценок нет. ${AI_SIGNAL_NO_DATA_EXPLANATION}`,
        action: 'Проверьте, почему звонки менеджера не попадают в разбор — пункт «звонки вне разбора» в блоке «Готовность витрины»',
    },
    discipline: {
        label: 'Дисциплина',
        tone: 'warning',
        hint: 'Сделано меньше половины плана CRM при плане от 10.',
        action: 'Напомните менеджеру фиксировать звонки и презентации в CRM',
    },
    next_step_drop: {
        label: 'Реже шаг с датой',
        tone: 'warning',
        hint: 'Доля звонков с назначенным шагом и датой упала между двумя окнами периода.',
        action: 'Разберите с менеджером, почему договорённости о следующем шаге стали реже',
    },
    plan_gap: {
        label: 'Разрыв плана',
        tone: 'info',
        hint: 'План руководителя расходится с нормой уровня.',
        action: 'Сверьте план руководителя с нормой уровня и при необходимости скорректируйте',
    },
    goodhart: {
        label: 'Рост без результата',
        tone: 'warning',
        hint: 'За несколько месяцев показатель, на который давят, рос, а его противовес падал: числа делают, а результата нет.',
        action: 'Проверьте, не растёт ли активность в ущерб результату',
    },
    trend_shift: {
        label: 'Сдвиг вниз',
        tone: 'warning',
        hint: 'Показатель сместился вниз и держится несколько недель.',
        action: 'Посмотрите тренд в досье и обсудите с менеджером',
    },
    trend_drift: {
        label: 'Дрейф вниз',
        tone: 'info',
        hint: 'Показатель несколько недель подряд плавно снижается.',
        action: 'Посмотрите тренд в досье и обсудите с менеджером',
    },
};

/** Подписи опор карточки «Внимание» (basis.code); неизвестный код — «показатель» (ai-attention.util). */
export const AI_BASIS_LABELS: Record<string, string> = {
    risk_calls: 'Риск-звонков',
    analyzed_calls: 'Разобрано звонков',
    calls_total: 'Звонков в телефонии',
    call_plan: 'План звонков CRM',
    call_done: 'Звонков сделано',
    call_plan_done_share: 'Доля плана звонков',
    presentation_plan: 'План презентаций CRM',
    presentation_done: 'Презентаций сделано',
    presentation_plan_done_share: 'Доля плана презентаций',
    next_step_date_rate: 'Шаг с датой',
    next_step_date_rate_prev: 'Шаг с датой (пред. окно)',
    plan_head: 'План руководителя',
    level_norm: 'Норма уровня',
    goodhart_pressure_change: 'Рост метрики давления',
    goodhart_counter_change: 'Изменение противовеса',
    trend_shift_magnitude: 'Величина сдвига',
    trend_drift_magnitude: 'Величина дрейфа',
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

/**
 * Источник уровня: назначен РОПом; по стажу из дат Bitrix (ночной паспорт
 * по полосам tenure_gates: < 6 мес. — джун, 6–18 — мидл, 18+ — сеньор);
 * по умолчанию, когда дат нет.
 */
export const AI_LEVEL_SOURCE: Record<AiManagerLevelSource, string> = {
    manual: 'назначен руководителем',
    passport: 'по стажу из Bitrix',
    default: 'по умолчанию: до 6 мес. — джун, иначе мидл',
};

/** Откуда дата стажа (sinceSource строки): подпись в скобках после стажа. */
export const AI_SINCE_SOURCE_LABELS: Record<AiManagerSinceSource, string> = {
    manual: 'задан вручную',
    employment: 'по дате приёма',
    register: 'по регистрации в Bitrix',
    proxy: 'по первому событию',
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
    kpi: { label: 'Показатель CRM', tone: 'secondary' },
    objection: { label: 'Возражение', tone: 'warning' },
};

/** Категории возражений справочника агента; незнакомая — «Другое». */
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

/** Подпись незнакомой категории возражения — без сырого кода. */
export const AI_OBJECTION_CATEGORY_OTHER = 'Другое';

/** Подпись категории возражения; незнакомая — «Другое». */
export const aiObjectionCategoryLabel = (category: string): string =>
    AI_OBJECTION_CATEGORY_LABELS[category] ?? AI_OBJECTION_CATEGORY_OTHER;

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
