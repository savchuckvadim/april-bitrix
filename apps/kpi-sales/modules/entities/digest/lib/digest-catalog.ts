/**
 * Справочники дневного дайджеста — данные отдельно от UI: метрики,
 * подписи групп/действий, стеки почасовых графиков. Имена типов и действий
 * с портала (catalog ответа) имеют приоритет над фолбэками отсюда.
 */
import type { DigestTypeGroup } from '../model';

export type DigestMetricCode =
    | 'plannedAtStart'
    | 'worked'
    | 'done'
    | 'notHeld'
    | 'postponed'
    | 'expired'
    | 'planned'
    | 'plannedBeyond'
    | 'documents'
    | 'sales'
    | 'refusals'
    | 'resultRate'
    | 'planCompletion'
    | 'callsCount'
    | 'airtimeMinutes';

export type DigestMetricKind = 'count' | 'percent' | 'minutes';

export interface DigestMetricDef {
    code: DigestMetricCode;
    label: string;
    /** Короткая подпись колонки таблицы. */
    short: string;
    hint: string;
    kind: DigestMetricKind;
    /** Минимальная база для участия в рейтинге (доли). */
    ratingMinBase?: number;
}

export const DIGEST_METRICS: readonly DigestMetricDef[] = [
    {
        code: 'plannedAtStart',
        label: 'Запланировано на начало дня',
        short: 'План дня',
        hint: 'План и переносы с дедлайном в этот день, созданные до его начала.',
        kind: 'count',
    },
    {
        code: 'worked',
        label: 'Отработано',
        short: 'Отработано',
        hint: 'Результативно + не состоялось + перенесено + просрочено.',
        kind: 'count',
    },
    {
        code: 'done',
        label: 'Результативно',
        short: 'Результ.',
        hint: 'События с действием «Состоялся».',
        kind: 'count',
    },
    {
        code: 'notHeld',
        label: 'Не состоялось',
        short: 'Не сост.',
        hint: 'События с действием «Не состоялся» (нерезультативные).',
        kind: 'count',
    },
    {
        code: 'postponed',
        label: 'Перенесено',
        short: 'Перенос',
        hint: 'Переносы: событие запланировано заново на другую дату.',
        kind: 'count',
    },
    {
        code: 'expired',
        label: 'Просрочено',
        short: 'Проср.',
        hint: 'События с действием «Просрочен».',
        kind: 'count',
    },
    {
        code: 'planned',
        label: 'Новых планов',
        short: 'Планы',
        hint: 'Новые планы, созданные в этот день.',
        kind: 'count',
    },
    {
        code: 'plannedBeyond',
        label: 'Запланировано на будущее',
        short: 'На будущее',
        hint: 'Планы и переносы этого дня с дедлайном позже конца дня.',
        kind: 'count',
    },
    {
        code: 'documents',
        label: 'Документы',
        short: 'Док.',
        hint: 'Отправленные КП, счета, договоры.',
        kind: 'count',
    },
    {
        code: 'sales',
        label: 'Продажи',
        short: 'Продажи',
        hint: 'Записи «Продажа» за день.',
        kind: 'count',
    },
    {
        code: 'refusals',
        label: 'Отказы',
        short: 'Отказы',
        hint: 'Записи «Отказ» за день.',
        kind: 'count',
    },
    {
        code: 'resultRate',
        label: 'Результативность',
        short: 'Результ. %',
        hint: 'Результативно / отработано. В рейтинге — при ≥ 3 отработанных.',
        kind: 'percent',
        ratingMinBase: 3,
    },
    {
        code: 'planCompletion',
        label: 'Выполнение плана дня',
        short: 'План %',
        hint: 'Отработано / запланировано на начало дня.',
        kind: 'percent',
        ratingMinBase: 1,
    },
    {
        code: 'callsCount',
        label: 'Звонки факт',
        short: 'Звонки',
        hint: 'Наборов номера по телефонии (длительность > 0).',
        kind: 'count',
    },
    {
        code: 'airtimeMinutes',
        label: 'Эфир',
        short: 'Эфир, мин',
        hint: 'Суммарная длительность звонков по телефонии.',
        kind: 'minutes',
    },
];

export const DIGEST_METRIC_BY_CODE: Record<DigestMetricCode, DigestMetricDef> =
    Object.fromEntries(DIGEST_METRICS.map(metric => [metric.code, metric])) as Record<
        DigestMetricCode,
        DigestMetricDef
    >;

/** Колонки таблицы по сотрудникам (порядок показа). */
export const DIGEST_TABLE_METRICS: readonly DigestMetricCode[] = [
    'plannedAtStart',
    'done',
    'notHeld',
    'postponed',
    'expired',
    'plannedBeyond',
    'documents',
    'sales',
    'refusals',
    'resultRate',
    'callsCount',
    'airtimeMinutes',
];

/** Ключевые метрики доски рейтингов. */
export const DIGEST_RATING_METRICS: readonly DigestMetricCode[] = [
    'done',
    'resultRate',
    'sales',
    'plannedBeyond',
    'callsCount',
    'airtimeMinutes',
];

/** Метрики карточки сравнения «сотрудник — Ø отдел — Ø все». */
export const DIGEST_COMPARE_METRICS: readonly DigestMetricCode[] = [
    'plannedAtStart',
    'done',
    'notHeld',
    'postponed',
    'plannedBeyond',
    'sales',
    'resultRate',
    'callsCount',
    'airtimeMinutes',
];

/** Коды типов, которые считаются звонком (зеркало реестра бэка). */
export const DIGEST_CALL_TYPE_CODES: readonly string[] = [
    'xo',
    'call',
    'call_in_progress',
    'call_in_money',
    'come_call',
    'site',
];

export const DIGEST_TYPE_GROUP_LABELS: Record<DigestTypeGroup, string> = {
    call: 'Звонки',
    presentation: 'Презентации',
    meeting: 'Встречи',
    document: 'Документы',
    outcome: 'Итоги',
    other: 'Прочее',
};

/** Фолбэк-подписи действий (приоритет — имена item'ов портала). */
export const DIGEST_ACTION_LABELS: Record<string, string> = {
    plan: 'Запланирован',
    pound: 'Перенос',
    done: 'Состоялся',
    act_noresult_fail: 'Не состоялся',
    expired: 'Просрочен',
    act_send: 'Отправлен',
};

/** Стек почасового графика событий дня. */
export type DigestStackKey =
    | 'done'
    | 'notHeld'
    | 'postponed'
    | 'expired'
    | 'planned'
    | 'documents'
    | 'sales'
    | 'refusals';

export interface DigestStackDef {
    key: DigestStackKey;
    label: string;
    /** CSS-токен цвета (april-tokens.css), резолвится для canvas. */
    token: string;
}

export const DIGEST_EVENT_STACKS: readonly DigestStackDef[] = [
    { key: 'done', label: 'Результативно', token: '--digest-done' },
    { key: 'notHeld', label: 'Не состоялось', token: '--digest-not-held' },
    { key: 'postponed', label: 'Перенесено', token: '--digest-postponed' },
    { key: 'expired', label: 'Просрочено', token: '--digest-expired' },
    { key: 'planned', label: 'Новый план', token: '--digest-planned' },
    { key: 'documents', label: 'Документы', token: '--digest-documents' },
    { key: 'sales', label: 'Продажи', token: '--digest-sales' },
    { key: 'refusals', label: 'Отказы', token: '--digest-refusals' },
];

export const DIGEST_PLANNED_STACK: DigestStackDef = {
    key: 'planned',
    label: 'Запланировано на час',
    token: '--digest-planned-at-start',
};

export const DIGEST_CALLS_TOKENS = {
    calls: '--digest-calls',
    airtime: '--digest-airtime',
} as const;
