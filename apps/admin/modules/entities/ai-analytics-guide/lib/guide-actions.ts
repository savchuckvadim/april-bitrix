/**
 * Формы «Запуск» путеводителя: какие поля у каждого действия, как из
 * значений формы собрать запрос. Чистые функции — без API и React;
 * сами вызовы делает `AiAnalyticsGuideHelper.runAction`.
 *
 * Коды действий — зеркало `AiGuideActionCode` бэка
 * (`libs/sales-ai-analytics/src/admin/guide/ai-guide.types.ts`).
 */

export const GUIDE_ACTION_CODES = [
    'backfill',
    'recompute',
    'etl-status',
    'forecast-backtest',
    'stage-history-probe',
    'reanalyze',
    'reanalyze-status',
    'cost',
    'feedback',
    'golden-set',
    'golden-set-run',
    'retention',
    'cache-reset',
    'install-smart',
    'push',
] as const;
export type GuideActionCode = (typeof GUIDE_ACTION_CODES)[number];

export const isGuideActionCode = (value: string | null | undefined): value is GuideActionCode =>
    !!value && (GUIDE_ACTION_CODES as readonly string[]).includes(value);

export type GuideFieldKind =
    | 'text'
    | 'month'
    | 'date'
    | 'number'
    | 'select'
    | 'checkbox'
    | 'csv';

export interface GuideActionField {
    name: string;
    label: string;
    kind: GuideFieldKind;
    required?: boolean;
    placeholder?: string;
    hint?: string;
    options?: readonly { value: string; label: string }[];
    defaultValue?: string | boolean;
}

export interface GuideActionSpec {
    title: string;
    /** Что произойдёт при нажатии (коротко, рядом с кнопкой). */
    description: string;
    method: 'GET' | 'POST';
    /** Ручка другого приложения: из админки готовится только тело. */
    external?: boolean;
    fields: readonly GuideActionField[];
}

export type GuideFormValues = Record<string, string | boolean>;

/** Текущий месяц YYYY-MM по локальному времени. */
export const currentMonthKey = (now: Date = new Date()): string =>
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const RHYTHM_OPTIONS = [
    { value: 'nightly', label: 'nightly — день' },
    { value: 'weekly', label: 'weekly — неделя' },
    { value: 'monthly', label: 'monthly — закрытый месяц' },
    { value: 'backfill', label: 'backfill — догон истории' },
] as const;

const CACHE_SCOPE_OPTIONS = [
    'all',
    'pulse',
    'agenda',
    'settings',
    'overview',
    'attention',
    'kpi-month',
    'plans',
].map(value => ({ value, label: value }));

const PUSH_KIND_OPTIONS = [
    { value: 'digest_all', label: 'digest_all — сводный дайджест' },
    { value: 'digest', label: 'digest — утренний разбор менеджерам' },
    { value: 'agenda', label: 'agenda — повестка понедельника' },
] as const;

const REQUESTER_FIELD: GuideActionField = {
    name: 'requesterUserId',
    label: 'requesterUserId (bitrix-id руководителя cup | op)',
    kind: 'text',
    required: true,
    placeholder: '447',
};

export const GUIDE_ACTIONS: Record<GuideActionCode, GuideActionSpec> = {
    backfill: {
        title: 'Догнать историю (backfill)',
        description:
            'По джобе на каждый месяц диапазона; уже посчитанное пропускается, шире 24 месяцев — отказ.',
        method: 'POST',
        fields: [
            { name: 'from', label: 'from (YYYY-MM)', kind: 'month', required: true, placeholder: '2024-11' },
            { name: 'to', label: 'to (YYYY-MM)', kind: 'month', required: true, placeholder: '2026-09' },
            { name: 'steps', label: 'steps (через запятую)', kind: 'csv', hint: 'Пусто — все шаги ритма backfill.' },
        ],
    },
    recompute: {
        title: 'Пересчитать период (recompute)',
        description: 'Одна джоба с forceRefresh: период переписывается, старые версии — superseded.',
        method: 'POST',
        fields: [
            { name: 'rhythm', label: 'rhythm', kind: 'select', required: true, options: RHYTHM_OPTIONS, defaultValue: 'monthly' },
            { name: 'monthKey', label: 'monthKey (YYYY-MM)', kind: 'month', required: true, placeholder: '2026-09' },
            { name: 'day', label: 'day (YYYY-MM-DD, для nightly)', kind: 'date' },
            { name: 'weekKey', label: 'weekKey (YYYY-Www, для weekly)', kind: 'text', placeholder: '2026-W35' },
            {
                name: 'steps',
                label: 'steps (через запятую)',
                kind: 'csv',
                defaultValue: 'calls,stage-history,forecast-log-replay,forecast-backtest',
                hint: 'Пусто — все шаги ритма.',
            },
        ],
    },
    'etl-status': {
        title: 'Состояние конвейера (etl-status)',
        description: 'Журналы ночных прогонов за окно дней.',
        method: 'GET',
        fields: [{ name: 'days', label: 'days (1–90)', kind: 'number', defaultValue: '7' }],
    },
    'forecast-backtest': {
        title: 'Точность прогноза (forecast-backtest)',
        description: 'Статус гейта, теневые и восстановленные месяцы, покрытие, отношение ошибок.',
        method: 'GET',
        fields: [{ name: 'months', label: 'months', kind: 'number', defaultValue: '6' }],
    },
    'stage-history-probe': {
        title: 'Проба истории стадий (stage-history/probe)',
        description: 'Доступен ли crm.stagehistory.list и хватает ли глубины истории.',
        method: 'GET',
        fields: [{ name: 'months', label: 'months', kind: 'number', defaultValue: '12' }],
    },
    reanalyze: {
        title: 'Переразбор истории (reanalyze)',
        description:
            'Ставит джобу переразбора; с dryRun — только кандидаты и оценка стоимости.',
        method: 'POST',
        fields: [
            { name: 'from', label: 'from (YYYY-MM-DD)', kind: 'date', required: true },
            { name: 'to', label: 'to (YYYY-MM-DD)', kind: 'date', required: true },
            { name: 'userIds', label: 'userIds (bitrix-id через запятую)', kind: 'csv', hint: 'Пусто — пилот allowedUserIds портала.' },
            { name: 'quota', label: 'quota (1–2000)', kind: 'number', placeholder: '300' },
            { name: 'dryRun', label: 'dryRun — без вызовов модели', kind: 'checkbox', defaultValue: true },
            { name: 'timeZone', label: 'timeZone (IANA)', kind: 'text', placeholder: 'Europe/Moscow' },
        ],
    },
    'reanalyze-status': {
        title: 'Статус переразбора (reanalyze-status)',
        description: 'Запись прогона по периоду и отчёты согласия версий.',
        method: 'GET',
        fields: [
            { name: 'from', label: 'from (YYYY-MM-DD)', kind: 'date', required: true },
            { name: 'to', label: 'to (YYYY-MM-DD)', kind: 'date', required: true },
        ],
    },
    cost: {
        title: 'Расход модели за месяц (cost)',
        description: 'Токены и стоимость по типам записей.',
        method: 'GET',
        fields: [{ name: 'month', label: 'month (YYYY-MM)', kind: 'month', required: true }],
    },
    feedback: {
        title: 'Сводка обратной связи (feedback)',
        description: 'Реакции витрины, факты доставки, метки руководителя за период.',
        method: 'GET',
        fields: [
            { name: 'from', label: 'from (YYYY-MM-DD)', kind: 'date', required: true },
            { name: 'to', label: 'to (YYYY-MM-DD)', kind: 'date', required: true },
        ],
    },
    'golden-set': {
        title: 'Состав золотого набора (golden-set)',
        description: 'Отчёты согласия оценщика по версиям промпта.',
        method: 'GET',
        fields: [],
    },
    'golden-set-run': {
        title: 'Запустить test-retest (golden-set/run)',
        description: 'Джоба повторного прогона; один запуск на домен в сутки.',
        method: 'POST',
        fields: [{ name: 'quota', label: 'quota (10–1000)', kind: 'number', placeholder: '300' }],
    },
    retention: {
        title: 'План ретенции (retention/run)',
        description: 'Что подлежит удалению по срокам хранения; физического удаления пока нет.',
        method: 'POST',
        fields: [{ name: 'dryRun', label: 'dryRun — только посчитать', kind: 'checkbox', defaultValue: true }],
    },
    'cache-reset': {
        title: 'Сбросить кэш витрины (kpi-report-sales)',
        description: 'Удаляет ключи кэша AI-аналитики по домену.',
        method: 'POST',
        external: true,
        fields: [
            REQUESTER_FIELD,
            { name: 'scope', label: 'scope', kind: 'select', options: CACHE_SCOPE_OPTIONS, defaultValue: 'all' },
        ],
    },
    'install-smart': {
        title: 'Долить смарт «AI-анализ звонков» (event-sales)',
        description: 'Создаёт смарт и доливает отсутствующие поля и значения перечислений.',
        method: 'POST',
        external: true,
        fields: [],
    },
    push: {
        title: 'Ручная рассылка (kpi-report-sales)',
        description: 'Тот же код, что у крона; recipients — кому отправить вместо адресатов настроек.',
        method: 'POST',
        external: true,
        fields: [
            REQUESTER_FIELD,
            { name: 'kind', label: 'kind', kind: 'select', options: PUSH_KIND_OPTIONS, defaultValue: 'digest_all' },
            { name: 'date', label: 'date (YYYY-MM-DD, по умолчанию сегодня)', kind: 'date' },
            { name: 'recipients', label: 'recipients (bitrix-id через запятую)', kind: 'csv', hint: 'Свой id — письмо придёт вам, отметки доставки не пишутся.' },
        ],
    },
};

/** Начальные значения формы: дефолты полей, у cost — текущий месяц. */
export const defaultActionValues = (
    action: GuideActionCode,
    now: Date = new Date(),
): GuideFormValues => {
    const values: GuideFormValues = {};
    for (const field of GUIDE_ACTIONS[action].fields) {
        if (field.defaultValue !== undefined) values[field.name] = field.defaultValue;
        else values[field.name] = field.kind === 'checkbox' ? false : '';
    }
    if (action === 'cost') values.month = currentMonthKey(now);
    return values;
};

const text = (values: GuideFormValues, name: string): string => {
    const value = values[name];
    return typeof value === 'string' ? value.trim() : '';
};

const flag = (values: GuideFormValues, name: string): boolean =>
    values[name] === true;

/** CSV строк: пустые элементы отбрасываются. */
export const parseCsvStrings = (raw: string): string[] =>
    raw
        .split(/[,\s]+/)
        .map(item => item.trim())
        .filter(Boolean);

/** CSV положительных целых; null — есть мусор. */
export const parseCsvNumbers = (raw: string): number[] | null => {
    const items = parseCsvStrings(raw).map(item => Number(item));
    return items.every(item => Number.isInteger(item) && item > 0) ? items : null;
};

/** Необязательное целое: '' → undefined, мусор → null. */
export const parseOptionalInt = (raw: string): number | undefined | null => {
    if (raw === '') return undefined;
    const value = Number(raw);
    return Number.isInteger(value) ? value : null;
};

export type GuideActionPayload =
    | { kind: 'admin'; action: GuideActionCode; data: Record<string, unknown> }
    | { kind: 'external'; action: GuideActionCode; body: Record<string, unknown> };

/**
 * Запрос из значений формы либо текст ошибки (русский, до запроса).
 * Для admin — `data` уходит телом или query (решает helper по действию);
 * для внешних — готовое тело для Swagger.
 */
export const buildActionPayload = (
    action: GuideActionCode,
    domain: string,
    values: GuideFormValues,
): GuideActionPayload | string => {
    const spec = GUIDE_ACTIONS[action];
    for (const field of spec.fields) {
        if (field.required && field.kind !== 'checkbox' && text(values, field.name) === '') {
            return `Заполните поле «${field.label}»`;
        }
    }
    const data: Record<string, unknown> = { domain };
    for (const field of spec.fields) {
        const name = field.name;
        if (field.kind === 'checkbox') {
            data[name] = flag(values, name);
            continue;
        }
        const raw = text(values, name);
        if (raw === '') continue;
        if (field.kind === 'number') {
            const parsed = parseOptionalInt(raw);
            if (parsed === null) return `«${field.label}»: ожидается целое число, получено «${raw}»`;
            data[name] = parsed;
            continue;
        }
        if (field.kind === 'csv') {
            const numeric = name === 'userIds' || name === 'recipients';
            if (numeric) {
                const ids = parseCsvNumbers(raw);
                if (!ids) return `«${field.label}»: ожидаются bitrix-id через запятую, получено «${raw}»`;
                data[name] = ids;
            } else {
                data[name] = parseCsvStrings(raw);
            }
            continue;
        }
        data[name] = raw;
    }
    return spec.external
        ? { kind: 'external', action, body: data }
        : { kind: 'admin', action, data };
};
